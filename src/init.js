import '@babel/polyfill';
import isURL from 'validator/lib/isURL';
import axios from 'axios';
import WatchJS from 'melanke-watchjs';
import makeAddFeedFieldRender from './renderers/addFeedFieldRender';
import makeFeedsListRender from './renderers/feedsListRender';
import makePostsListRender from './renderers/postsListRender';
import displayError from './renderers/errorRender';

export default () => {
  // State
  const state = {
    corsProxyURL: 'https://api.codetabs.com/v1/proxy?quest=',
    addFeedFieldValid: null,
    timer: null,
    feedsList: [],
    newPosts: [],
    displayedPosts: [],
    isValidURL(URL) {
      this.addFeedFieldValid = isURL(URL) && this.feedsList.every(feed => feed.feedURL !== URL);
    },
    convertPostsToObjects(posts) {
      return posts.map((post) => {
        const postTitle = post.querySelector('title').textContent;
        const postDescription = post.querySelector('description').textContent;
        const postLink = post.querySelector('link').textContent;

        return { postTitle, postDescription, postLink };
      });
    },
    filterOutNewPosts(posts) {
      return posts.filter(addedPost => this.displayedPosts
        .every(displayedPost => displayedPost.postTitle !== addedPost.postTitle));
    },
    set postsList(addedPosts) {
      if (addedPosts.length === 0) {
        return;
      }

      this.displayedPosts = [...this.newPosts, ...this.displayedPosts];
      this.newPosts = this.filterOutNewPosts(this.convertPostsToObjects(addedPosts));
    },
    addFeed(URL) {
      axios.get(`${state.corsProxyURL}${URL}`)
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
          });

          this.postsList = feedPosts;
          this.updatePostsList();
        })
        .catch((error) => {
          displayError(error);
        });
    },
    updatePostsList() {
      const allFeedsURL = this.feedsList.map(({ feedURL }) => feedURL);

      Promise.all(allFeedsURL.map(URL => axios.get(`${state.corsProxyURL}${URL}`)
        .then((response) => {
          const feed = new DOMParser().parseFromString(response.data, 'text/xml');
          const feedPosts = [...feed.getElementsByTagName('item')];
          this.postsList = feedPosts;
        })))
        .then(() => {
          clearTimeout(this.timer);
          this.timer = setTimeout(() => {
            this.updatePostsList();
          }, 5000);
        })
        .catch((error) => {
          displayError(error);
        });
    },
  };

  // Observer
  WatchJS.watch(state, 'addFeedFieldValid', makeAddFeedFieldRender);
  WatchJS.watch(state, 'feedsList', makeFeedsListRender);
  WatchJS.watch(state, 'newPosts', makePostsListRender);

  // Controller
  const addFeedField = document.getElementById('RSS feed');
  const addFeedButton = document.getElementById('Add feed');

  addFeedField.addEventListener('input', (e) => {
    state.isValidURL(e.target.value);
  });

  addFeedField.addEventListener('focus', (e) => {
    state.isValidURL(e.target.value);
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
