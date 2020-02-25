import '@babel/polyfill';
import _ from 'lodash';
import isUrl from 'validator/lib/isURL';
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
  };

  // Observer
  WatchJS.watch(state.addingFeedProcess, ['state', 'formFieldState'], makeRender.form);
  WatchJS.watch(state.addingFeedProcess, 'errors', makeRender.errorMessage);
  WatchJS.watch(state, 'feeds', makeRender.feedsList);
  WatchJS.watch(state, 'items', makeRender.itemsList);

  const isValidUrl = url => isUrl(url) && state.feeds.every(feed => feed.url !== url);

  const corsProxyUrl = 'https://api.codetabs.com/v1/proxy?quest=';

  const updatePosts = async () => {
    const allFeedsItems = await state.feeds.reduce(async (acc, { url }) => {
      try {
        const currentAcc = await acc;
        const response = await axios.get(`${corsProxyUrl}${url}`);
        const html = new DOMParser().parseFromString(response.data, 'text/xml');
        const { items } = makeFeedParsing(html);
        return currentAcc.concat(items);
      } catch (error) {
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
    state.addingFeedProcess.formFieldState = isValidUrl(value) ? 'valid' : 'invalid';
  });

  addFeedField.addEventListener('focus', ({ target: { value } }) => {
    state.addingFeedProcess.formFieldState = isValidUrl(value) ? 'valid' : 'invalid';
  });

  addFeedForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const url = formData.get('url');

    try {
      state.addingFeedProcess.state = 'sending';
      const response = await axios.get(`${corsProxyUrl}${url}`);
      state.addingFeedProcess.formFieldState = 'empty';
      state.addingFeedProcess.state = 'filling';

      const {
        title,
        description,
        items,
      } = makeFeedParsing(response.data);

      state.feeds.push({ url, title, description });
      state.items = _.unionBy(state.items, items, 'title');

      clearTimeout(state.updatetimerId);
      state.updatetimerId = setTimeout(updatePosts, 5000);
    } catch (error) {
      state.addingFeedProcess.errors.push(error.message);
      state.addingFeedProcess.formFieldState = 'invalid';
      state.addingFeedProcess.state = 'filling';
    }
  });
};
