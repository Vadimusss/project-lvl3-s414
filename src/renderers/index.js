import formRender from './formRender';
import feedsListRender from './feedsListRender';
import itemsRender from './itemsRender';
import errorMessageRender from './errorRender';

const makeRender = {
  form: formRender,
  feedsList: feedsListRender,
  itemsList: itemsRender,
  errorMessage: errorMessageRender,
};

export default makeRender;
