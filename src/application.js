import '@babel/polyfill';
import _ from 'lodash';
import isURL from 'validator/lib/isURL';
import axios from 'axios';
import WatchJS from 'melanke-watchjs';
import makeRender from './renderers';
import makeFeedParsing from './feedParser';

export default () => {
  // State
  const state = {
    addingFeedProcess: {
      state: 'filling', // sending
      errors: [],
      formFieldState: 'empty', // invalid, valid
    },
    updatetimerId: null,
    feeds: [],
    items: [],
    errors: [],
    isValidURL(URL) {
      return isURL(URL) && this.feeds.every(feed => feed.URL !== URL);
    },
  };

  // Observer
  WatchJS.watch(state.addingFeedProcess, ['state', 'formFieldState'], makeRender.form);
  WatchJS.watch(state, 'errors', makeRender.errorMessage);
  WatchJS.watch(state, 'feeds', makeRender.feedsList);
  WatchJS.watch(state, 'items', makeRender.itemsList);

  const corsProxyURL = 'https://api.codetabs.com/v1/proxy?quest=';

  const updatePosts = async () => {
    const allFeedsItems = await state.feeds.reduce(async (acc, { URL }) => {
      try {
        const currentAcc = await acc;
        const response = await axios.get(`${corsProxyURL}${URL}`);
        const html = new DOMParser().parseFromString(response.data, 'text/xml');
        const { items } = makeFeedParsing(html);
        return currentAcc.concat(items);
      } catch (error) {
        state.errors.push(error.message);
        return acc;
      }
    }, Promise.resolve([]));
    state.items = _.unionBy(state.items, allFeedsItems, 'title');
    clearTimeout(state.updatetimerId);
    state.updatetimerId = setTimeout(updatePosts, 5000);
  };

  // Controller
  const addFeedForm = document.querySelector('.jumbotron form');
  const addFeedField = document.getElementById('RSS feed');

  addFeedField.addEventListener('input', ({ target: { value } }) => {
    state.addingFeedProcess.formFieldState = state.isValidURL(value) ? 'valid' : 'invalid';
  });

  addFeedField.addEventListener('focus', ({ target: { value } }) => {
    state.addingFeedProcess.formFieldState = state.isValidURL(value) ? 'valid' : 'invalid';
  });

  addFeedForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const URL = formData.get('URL');
    try {
      state.addingFeedProcess.state = 'sending';
      const response = await axios.get(`${corsProxyURL}${URL}`);
      const html = new DOMParser().parseFromString(response.data, 'text/xml');
      state.addingFeedProcess.formFieldState = 'empty';
      state.addingFeedProcess.state = 'filling';

      const {
        title,
        description,
        items,
      } = makeFeedParsing(html);

      state.feeds.push({ URL, title, description });
      state.items = _.unionBy(state.items, items, 'title');

      clearTimeout(state.updatetimerId);
      state.updatetimerId = setTimeout(updatePosts, 5000);
    } catch (error) {
      state.errors.push(error.message);
      state.addingFeedProcess.formFieldState = 'invalid';
      state.addingFeedProcess.state = 'filling';
    }
  });
};
