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
    formState: {
      valid: true,
      formFieldDisabled: false,
      submitEnabled: false,
      formFieldText: '',
    },
    updatetimerId: null,
    feeds: [],
    posts: [],
    errors: [],
    isValidURL(URL) {
      return isURL(URL) && this.feeds.every(feed => feed.URL !== URL);
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
    const { channelTitle, channelDescription, channelPosts } = parsingFeedData(response.data);
    return {
      channelTitle,
      channelDescription,
      channelPosts,
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
        const { channelPosts } = await getFeed(`${corsProxyURL}${URL}`);
        const newPosts = state.filterOutNewPosts(channelPosts);
        if (newPosts.length === 0) {
          return;
        }
        newPosts.forEach(post => state.posts.push(post));
      } catch (error) {
        state.updatingErrors.push(error.message);
      } finally {
        state.fetchingState = 'waiting';
      }
    });
    clearTimeout(state.updatetimerId);
    state.updatetimerId = setTimeout(updatePosts, 5000);
  };

  const addNewFeed = async (URL) => {
    if (state.state === 'fetching') {
      setTimeout(addNewFeed, 500, URL);
      return;
    }
    state.fetchingState = 'fetching';
    const feed = await getFeed(`${corsProxyURL}${URL}`);
    const {
      channelTitle,
      channelDescription,
      channelPosts,
    } = feed;
    state.feeds.push({ URL, channelTitle, channelDescription });
    channelPosts.forEach(post => state.posts.push(post));

    clearTimeout(state.updatetimerId);
    state.updatetimerId = setTimeout(updatePosts, 5000);
  };

  const addFeedForm = document.querySelector('.jumbotron form');
  const addFeedField = document.getElementById('RSS feed');

  addFeedField.addEventListener('input', ({ target: { value } }) => {
    const isValid = state.isValidURL(value);
    state.formState.valid = isValid;
    state.formState.submitEnabled = isValid;
    state.formState.formFieldText = value;
  });

  addFeedField.addEventListener('focus', ({ target: { value } }) => {
    const isValid = state.isValidURL(value);
    state.formState.valid = isValid;
  });

  addFeedForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    try {
      state.formState.formFieldDisabled = true;
      await addNewFeed(formData.get('URL'));
      state.formState.formFieldText = '';
      state.formState.formFieldDisabled = false;
    } catch (error) {
      state.errors.push(error.message);
      state.formState.formFieldDisabled = false;
    } finally {
      state.fetchingState = 'waiting';
    }
  });
};
