import '@babel/polyfill';
import isURL from 'validator/lib/isURL';
import axios from 'axios';
import WatchJS from 'melanke-watchjs';
import makeRender from './renderers';
import makeFeedParser from './feedParser';

const getRssData = async (corsProxyURL, URL) => {
  const response = await axios.get(`${corsProxyURL}${URL}`);
  return makeFeedParser(response.data, URL);
};

export default () => {
  const corsProxyURL = 'https://api.codetabs.com/v1/proxy?quest=';
  // State
  const state = {
    appState: 'waiting',
    formState: 'empty',
    timerId: null,
    feedsURLs: [],
    feedsList: [],
    newPosts: [],
    displayedPosts: [],
    errors: [],
    appStateManager() {
      switch (this.appState) {
        case 'addingFeed':
          this.updateFeedsData();
          break;
        case 'fetching':
          break;
        case 'updating':
          clearTimeout(state.timerId);
          this.timerId = setTimeout(() => this.updateFeedsData(), 5000);
          break;
        case 'outputingError':
          this.feedsURLs = this.feedsURLs.slice(0, -1);
          this.appState = 'updating';
          break;
        default:
          this.errors = ['Unknown error', ...state.errors];
      }
    },
    isValidURL(URL) {
      return isURL(URL) && this.feedsList.every(feed => feed.feedURL !== URL);
    },
    isNewFeed(newFeed) {
      return this.feedsList.every(displayedFeed => newFeed.feedURL !== displayedFeed.feedURL);
    },
    filterOutNewPosts(posts) {
      return posts.filter(addedPost => this.displayedPosts
        .every(displayedPost => displayedPost.postTitle !== addedPost.postTitle));
    },
    addFeed(addedFeed) {
      if (this.isNewFeed(addedFeed)) {
        this.feedsList = this.feedsList.concat(addedFeed);
      }
    },
    addPosts(addedPosts) {
      if (addedPosts.length === 0) {
        return;
      }
      this.displayedPosts = [...this.newPosts, ...this.displayedPosts];
      this.newPosts = this.filterOutNewPosts(addedPosts);
    },
    async updateFeedsData() {
      this.appState = 'fetching';
      try {
        const allFeedsData = await Promise.all(this.feedsURLs
          .map(URL => getRssData(corsProxyURL, URL)));

        allFeedsData.forEach(({
          feedURL,
          feedTitle,
          feedDescription,
          feedPosts,
        }) => {
          this.addFeed({ feedURL, feedTitle, feedDescription });
          this.addPosts(feedPosts);
          this.appState = 'updating';
        });
      } catch (error) {
        this.errors = [error.message, ...this.errors];
        this.appState = 'outputingError';
      }
    },
  };

  // Observer
  WatchJS.watch(state, 'formState', makeRender.form);
  WatchJS.watch(state, 'appState', state.appStateManager);
  WatchJS.watch(state, 'feedsList', makeRender.feedsList);
  WatchJS.watch(state, 'newPosts', makeRender.postsList);
  WatchJS.watch(state, 'errors', makeRender.errorMessage);

  // Controller
  const addFeedForm = document.querySelector('.jumbotron form');
  const addFeedField = document.getElementById('RSS feed');

  addFeedField.addEventListener('input', ({ target: { value } }) => {
    state.formState = state.isValidURL(value) ? 'valid' : 'invalid';
  });

  addFeedField.addEventListener('focus', ({ target: { value } }) => {
    state.formState = state.isValidURL(value) ? 'valid' : 'invalid';
  });

  addFeedForm.addEventListener('submit', (e) => {
    e.preventDefault();
    state.feedsURLs = [...state.feedsURLs, addFeedField.value];
    state.appState = 'addingFeed';
    state.formState = 'empty';
  });
};
