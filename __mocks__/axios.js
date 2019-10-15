import fs from 'fs';

const returnMockObject = path => new Promise((resolve, reject) => {
  fs.readFile(path, 'utf8', (err, data) => {
    if (err) {
      reject(err);
    }
    resolve({ data });
  });
});

const axios = {
  get(URL) {
    const urlWithoutCorsProxy = URL.slice(40);
    switch (urlWithoutCorsProxy) {
      case 'validrss.ru':
        return returnMockObject('./__tests__/__fixtures__/testRSSfile.rss');
      case 'aaa.bbb':
        return Promise.reject(new Error('Request failed with status code 400'));
      case 'notrss.ru':
        return returnMockObject('./__tests__/__fixtures__/testHTMLPage.html');
      default: {
        return Promise.reject(new Error('Unknown error'));
      }
    }
  },
};

export default axios;
