import '@babel/polyfill';
import isURL from 'validator/lib/isURL';
import axios from 'axios';
import WatchJS from 'melanke-watchjs';
import feedListRender from './feedListRender';
import addFeedFieldRender from './addFeedFieldRender';
import displayError from './displayError';

export default () => {
  // State
  const state = {
    addFeedFieldValid: null,
    feedsList: [],
    urlIsValid(URL) {
      this.addFeedFieldValid = isURL(URL) && this.feedsList.every(feed => feed.feedURL !== URL);
    },
    addFeed(URL) {
      const corsProxyURL = 'https://api.codetabs.com/v1/proxy?quest=';

      return axios.get(`${corsProxyURL}${URL}`)
        .then((response) => {
          const feed = new DOMParser().parseFromString(response.data, 'text/xml');
          const feedURL = URL;
          const feedTitle = feed.querySelector('channel title').textContent;
          const feedDescription = feed.querySelector('channel description').textContent;
          const feedPosts = [...feed.getElementsByTagName('item')];

          this.feedsList = this.feedsList.concat({
            feedURL,
            feedTitle,
            feedDescription,
            feedPosts,
          });
        })
        .catch((error) => {
          console.log(error);
          displayError(error);
        });
    },
  };

  // Observer
  WatchJS.watch(state, 'addFeedFieldValid', addFeedFieldRender);
  WatchJS.watch(state, 'feedsList', feedListRender);

  // Controller
  const addFeedField = document.getElementById('RSS feed');
  const addFeedButton = document.getElementById('Add feed');

  addFeedField.addEventListener('input', (e) => {
    state.urlIsValid(e.target.value);
  });

  addFeedField.addEventListener('focus', (e) => {
    state.urlIsValid(e.target.value);
  });

  addFeedButton.addEventListener('click', (e) => {
    e.preventDefault();

    if (state.addFeedFieldValid) {
      state.addFeed(addFeedField.value);
      addFeedField.value = '';
    } else {
      state.addFeedFieldValid = false;
    }
  });
};
