import '@babel/polyfill';
import isURL from 'validator/lib/isURL';
import axios from 'axios';
import WatchJS from 'melanke-watchjs';
import makeRender from './renderers';
import parsingFeedData from './feedParser';

export default () => {
  // State
  const state = {
    fetchingState: 'waiting',
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
    const response = await axios.get(URL);
    const { title, description, posts } = parsingFeedData(response.data);
    return {
      URL,
      title,
      description,
      posts,
    };
  };

  const updatePosts = async () => {
    if (state.state === 'fetching') {
      clearTimeout(state.updatetimerId);
      state.updatetimerId = setTimeout(updatePosts, 5000);
      return;
    }
    state.getFeedsURLs().forEach(async (URL) => {
      try {
        state.fetchingState = 'fetching';
        const { posts } = await getFeed(URL);
        const newPosts = state.filterOutNewPosts(posts);
        if (newPosts.length === 0) {
          return;
        }
        posts.forEach(post => state.posts.push(post));
      } catch (error) {
        state.updatingErrors.push(error.message);
      } finally {
        state.fetchingState = 'waiting';
      }
    });
    clearTimeout(state.updatetimerId);
    state.updatetimerId = setTimeout(updatePosts, 5000);
  };

  const addNewFeed = async (feedURL) => {
    if (state.state === 'fetching') {
      setTimeout(addNewFeed, 500, feedURL);
      return;
    }
    state.fetchingState = 'fetching';
    const feed = await getFeed(feedURL);
    const {
      URL,
      title,
      description,
      posts,
    } = feed;
    state.feeds.push({ URL, title, description });
    posts.forEach(post => state.posts.push(post));

    clearTimeout(state.updatetimerId);
    state.updatetimerId = setTimeout(updatePosts, 5000);
  };

  const addFeedForm = document.querySelector('.jumbotron form');
  const addFeedField = document.getElementById('RSS feed');

  addFeedField.addEventListener('input', ({ target: { value } }) => {
    state.formState = state.isValidURL(value) ? 'valid' : 'invalid';
  });

  addFeedField.addEventListener('focus', ({ target: { value } }) => {
    state.formState = state.isValidURL(value) ? 'valid' : 'invalid';
  });

  addFeedForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      state.formState = 'blocked';
      await addNewFeed(`${corsProxyURL}${formData.get('URL')}`);
      state.formState = 'empty';
    } catch (error) {
      state.errors.push(error.message);
      state.formState = 'valid';
    } finally {
      state.fetchingState = 'waiting';
    }
  });
};
