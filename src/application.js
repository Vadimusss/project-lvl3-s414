import '@babel/polyfill';
import isURL from 'validator/lib/isURL';
import axios from 'axios';
import WatchJS from 'melanke-watchjs';
import StateMachine from 'javascript-state-machine';
import makeRender from './renderers';
import makeFeedParser from './feedParser';

const getRssData = async (corsProxyURL, URL) => {
  const response = await axios.get(`${corsProxyURL}${URL}`);
  return makeFeedParser(response.data, URL);
};

export default (corsProxyURL) => {
  // State
  const state = {
    timerId: null,
    feedsList: [],
    newPosts: [],
    displayedPosts: [],
    appFsm: new StateMachine({
      init: 'waiting',
      transitions: [
        { name: 'startFetching', from: 'waiting', to: 'fetching' },
        { name: 'endFetching', from: 'fetching', to: 'waiting' },
      ],
      methods: {
        onStartFetching(_lifecycle, URLs) {
          clearTimeout(state.timerId);
          state.updateFeedsData(URLs);
        },
        onEndFetching() {
          state.timerId = setTimeout(() => {
            state.appFsm.startFetching(state.getAddedFeedsURLs());
          }, 5000);
        },
        onInvalidTransition() {
          makeRender.errorMessage(new Error('The query is executed'));
        },
      },
    }),
    feedFieldFsm: new StateMachine({
      init: 'empty',
      transitions: [
        {
          name: 'focus',
          from: ['empty', 'valid', 'invalid'],
          to: e => (state.isValidURL(e.target.value) ? 'valid' : 'invalid'),
        },
        {
          name: 'input',
          from: ['empty', 'valid', 'invalid'],
          to: e => (state.isValidURL(e.target.value) ? 'valid' : 'invalid'),
        },
        {
          name: 'submit',
          from: 'valid',
          to: 'empty',
        },
      ],
      methods: {
        onInvalid() {
          makeRender.addFeedField('incorrect');
        },
        onValid() {
          makeRender.addFeedField('correct');
        },
        onSubmit(_lifecycle, URL) {
          makeRender.addFeedField('clear');
          state.appFsm.startFetching([URL]);
        },
        onInvalidTransition() {
          makeRender.errorMessage(new Error('Error filling out the form'));
        },
      },
    }),
    getAddedFeedsURLs() {
      return this.feedsList.map(({ feedURL }) => feedURL);
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
    updateFeedsData(URLs) {
      Promise.all(URLs.map(URL => getRssData(corsProxyURL, URL)
        .then((response) => {
          const { feedURL, feedTitle, feedDescription } = response;
          const { feedPosts } = response;

          this.addFeed({ feedURL, feedTitle, feedDescription });
          this.addPosts(feedPosts);
        })))
        .catch((error) => {
          makeRender.errorMessage(error);
        })
        .finally(() => this.appFsm.endFetching());
    },
  };

  // Observer
  WatchJS.watch(state, 'feedsList', makeRender.feedsList);
  WatchJS.watch(state, 'newPosts', makeRender.postsList);

  // Controller
  const addFeedForm = document.querySelector('.jumbotron form');
  const addFeedField = document.getElementById('RSS feed');

  addFeedField.addEventListener('input', (e) => {
    state.feedFieldFsm.input(e);
  });

  addFeedField.addEventListener('focus', (e) => {
    state.feedFieldFsm.focus(e);
  });

  addFeedForm.addEventListener('submit', (e) => {
    e.preventDefault();
    state.feedFieldFsm.submit(addFeedField.value);
  });
};
