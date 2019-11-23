import formRender from './formRender';
import feedsListRender from './feedsListRender';
import postsListRender from './postsListRender';
import errorMessageRender from './errorRender';

const makeRender = {
  form: formRender,
  feedsList: feedsListRender,
  postsList: postsListRender,
  errorMessage: errorMessageRender,
};

export default makeRender;
