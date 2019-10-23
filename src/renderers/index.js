import addFeedFieldRender from './addFeedFieldRender';
import feedsListRender from './feedsListRender';
import postsListRender from './postsListRender';
import errorMessageRender from './errorRender';

const makeRender = {
  addFeedField: addFeedFieldRender,
  feedsList: feedsListRender,
  postsList: postsListRender,
  errorMessage: errorMessageRender,
};

export default makeRender;
