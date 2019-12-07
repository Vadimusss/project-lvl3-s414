import '@babel/polyfill';
import isURL from 'validator/lib/isURL';
import axios from 'axios';
import WatchJS from 'melanke-watchjs';
import makeRender from './renderers';
import makeFeedParser from './feedParser';

export default () => {
  // State
  const state = {
    fetchingState: null,
    formState: 'empty',
    updatetimerId: null,
    feeds: [],
    posts: [],
    errors: [],
    isValidURL(URL) {
      return isURL(URL) && state.feeds.every(feed => feed.feedURL !== URL);
    },
    filterOutNewPosts(addedPosts) {
      return addedPosts.filter(addedPost => this.posts
        .every(displayedPost => displayedPost.title !== addedPost.title));
    },
    getFeedsURLs() {
      return state.feeds.map(({ URL }) => URL);
    },
  };

  // Observer
  WatchJS.watch(state, 'formState', makeRender.form);
  WatchJS.watch(state, 'feeds', makeRender.feedsList);
  WatchJS.watch(state, 'posts', makeRender.postsList);
  WatchJS.watch(state, 'errors', makeRender.errorMessage);

  // Controller
  const corsProxyURL = 'https://api.codetabs.com/v1/proxy?quest=';

  const getFeed = async (URL) => {
    try {
      const response = await axios.get(URL);
      const { title, description, posts } = makeFeedParser(response.data);
      return {
        URL,
        title,
        description,
        posts,
      };
    } catch (error) {
      state.errors.push(error.message);
      return false;
    }
  };

  const setUpdateTimer = (f) => {
    clearTimeout(state.updatetimerId);
    state.updatetimerId = setTimeout(() => f(), 5000);
  };

  const updatPosts = async () => {
    if (state.state === 'fetching') {
      setUpdateTimer(updatPosts);
    }
    state.getFeedsURLs().forEach(async (URL) => {
      state.fetchingState = 'fetching';
      const { posts } = await getFeed(URL);
      state.fetchingState = 'waiting';
      const newPosts = state.filterOutNewPosts(posts);
      if (newPosts.length === 0) {
        return;
      }
      posts.forEach(post => state.posts.push(post));
    });
    setUpdateTimer(updatPosts);
  };

  const addNewFeed = async (feedURL) => {
    if (state.state === 'fetching') {
      setTimeout(() => state.addNewFeed(), 500, feedURL);
    }
    state.fetchingState = 'fetching';
    const feed = await getFeed(feedURL);
    state.fetchingState = 'waiting';
    if (feed) {
      const {
        URL,
        title,
        description,
        posts,
      } = feed;
      state.feeds.push({ URL, title, description });
      posts.forEach(post => state.posts.push(post));
    }
    setUpdateTimer(updatPosts);
  };

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
    const formData = new FormData(e.target);
    addNewFeed(`${corsProxyURL}${formData.get('URL')}`);
    state.formState = 'empty';
  });
};
