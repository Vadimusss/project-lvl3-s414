import '@babel/polyfill';
import isURL from 'validator/lib/isURL';
import axios from 'axios';
import WatchJS from 'melanke-watchjs';
import makeRender from './renderers';
import makeFeedParser from './feedParser';

export default () => {
  const corsProxyURL = 'https://api.codetabs.com/v1/proxy?quest=';
  // State
  const state = {
    fetchingState: null,
    formState: 'empty',
    timerId: null,
    feeds: [],
    posts: [],
    errors: [],
    isValidURL(URL) {
      return isURL(URL) && this.feeds.every(feed => feed.feedURL !== URL);
    },
    filterOutNewPosts(addedPosts) {
      return addedPosts.filter(addedPost => this.posts
        .every(displayedPost => displayedPost.title !== addedPost.title));
    },
    getFeedsURLs() {
      return this.feeds.map(({ URL }) => URL);
    },
    async addNewFeed(addingFeedURL) {
      if (this.state === 'fetching') {
        setTimeout(() => this.addNewFeed(), 1000, addingFeedURL);
      }
      const feed = await this.getFeedData(addingFeedURL);
      if (!feed) {
        return;
      }
      const {
        URL,
        title,
        description,
        posts,
      } = feed;
      this.feeds = [...this.feeds, { URL, title, description }];
      this.posts = [...this.posts, ...posts];
    },
    async updatePosts() {
      if (this.state === 'fetching') {
        return;
      }
      this.getFeedsURLs().forEach(async (URL) => {
        const { posts } = await this.getFeedData(URL);
        const newPosts = this.filterOutNewPosts(posts);
        if (newPosts.length === 0) {
          return;
        }
        this.posts = [...this.posts, ...newPosts];
      });
    },
    async getFeedData(URL) {
      this.fetchingState = 'fetching';
      try {
        const response = await axios.get(`${corsProxyURL}${URL}`);
        const { title, description, posts } = makeFeedParser(response.data);
        return {
          URL,
          title,
          description,
          posts,
        };
      } catch (error) {
        this.errors = [error.message, ...this.errors];
        return false;
      } finally {
        clearTimeout(this.timerId);
        this.timerId = setTimeout(() => this.updatePosts(), 5000);
        this.fetchingState = 'updating';
      }
    },
  };

  // Observer
  WatchJS.watch(state, 'formState', makeRender.form);
  WatchJS.watch(state, 'feeds', makeRender.feedsList);
  WatchJS.watch(state, 'posts', makeRender.postsList);
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
    const formData = new FormData(e.target);
    state.addNewFeed(formData.get('URL'));
    state.formState = 'empty';
  });
};
