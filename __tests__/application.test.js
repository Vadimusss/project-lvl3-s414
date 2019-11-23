import fs from 'fs';
import path from 'path';
import { html } from 'js-beautify';
import keycode from 'keycode';

import runApp from '../src/application';

jest.mock('axios');

const htmlOptions = {
  preserve_newlines: true,
  unformatted: [],
};

const fixuturesPath = path.join(__dirname, '__fixtures__');
const getTree = () => html(document.body.innerHTML, htmlOptions);

const pressKey = (key, el = document.body, value = key) => {
  const keyCode = keycode(key);
  const e = new KeyboardEvent('input', { keyCode });
  el.value = value; // eslint-disable-line
  el.setAttribute('value', value);
  el.dispatchEvent(e);
};

beforeEach(() => {
  const initHtml = fs.readFileSync(path.join(fixuturesPath, 'index.html')).toString();
  document.documentElement.innerHTML = initHtml;
  runApp();
});

test('feed are added', async () => {
  jest.setTimeout(20000);

  const rssFeedField = document.querySelector('#RSS\\ feed');
  const addFeedButton = document.querySelector('#Add\\ feed');
  // const addFeedForm = document.querySelector('.jumbotron form');

  rssFeedField.focus();
  pressKey('validrss.ru', rssFeedField);
  await new Promise(r => setTimeout(r, 1000));
  addFeedButton.click();
  await new Promise(r => setTimeout(r, 1000));
  expect(getTree()).toMatchSnapshot();

  rssFeedField.focus();
  pressKey('aaa.bbb', rssFeedField);
  await new Promise(r => setTimeout(r, 1000));
  addFeedButton.click();
  await new Promise(r => setTimeout(r, 1000));
  expect(getTree()).toMatchSnapshot();

  rssFeedField.focus();
  pressKey('notrss.ru', rssFeedField);
  await new Promise(r => setTimeout(r, 1000));
  addFeedButton.click();
  await new Promise(r => setTimeout(r, 1000));
  expect(getTree()).toMatchSnapshot();

  await new Promise(r => setTimeout(r, 3000));
  expect(getTree()).toMatchSnapshot();
});
