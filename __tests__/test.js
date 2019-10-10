import '@babel/polyfill';
import Nightmare from 'nightmare';

let nightmare = null;
beforeEach(() => {
  nightmare = new Nightmare({ show: false });
});

test('feed are added', async () => {
  jest.setTimeout(20000);

  const childrenLlength = await nightmare
    .goto('http://acoustic-cry.surge.sh')
    .evaluate(() => console.log(document))
    .type('#RSS\\ feed', 'www.nasa.gov/rss/dyn/onthestation_rss.rss')
    .evaluate(() => console.log('2'))
    .click('#Add\\ feed')
    .evaluate(() => console.log(document))
    .wait(2000)
    .evaluate(() => console.log('4'))
    .end()
    .evaluate(() => {
      console.log(document.querySelector('#Feeds\\ list').children.length);
      return document.querySelector('#Feeds\\ list').children.length;
    });

  console.log(childrenLlength);
  expect(childrenLlength).toBe(2);
});

test('posts are added', () => {
  jest.setTimeout(20000);

  return nightmare
    .goto('http://acoustic-cry.surge.sh')
    .type('#RSS\\ feed', 'www.nasa.gov/rss/dyn/onthestation_rss.rss')
    .click('#Add\\ feed')
    .wait(2000)
    .evaluate(() => document.querySelector('#Posts\\ list').children.length)
    .end()
    .then((childrenLlength) => {
      expect(childrenLlength).toBeGreaterThan(1);
    });
});

test('description are added', () => {
  jest.setTimeout(20000);

  return nightmare
    .goto('http://acoustic-cry.surge.sh')
    .type('#RSS\\ feed', 'www.nasa.gov/rss/dyn/onthestation_rss.rss')
    .click('#Add\\ feed')
    .wait(2000)
    .evaluate(() => document.querySelector('.btn-outline-info').textContent)
    .end()
    .then((descriptionButtonText) => {
      expect(descriptionButtonText).toBe('Description');
    });
});

test('invalid address alert', () => {
  jest.setTimeout(20000);

  return nightmare
    .goto('http://acoustic-cry.surge.sh')
    .type('#RSS\\ feed', 'aaa.bbb')
    .click('#Add\\ feed')
    .wait('.alert')
    .evaluate(() => document.querySelector('.alert').textContent)
    .end()
    .then((errorText) => {
      expect(errorText).toBe('Не верный адрес!');
    });
});

test('not RSS alert', () => {
  jest.setTimeout(20000);

  return nightmare
    .goto('http://acoustic-cry.surge.sh')
    .type('#RSS\\ feed', 'yandex.ru')
    .click('#Add\\ feed')
    .wait('.alert')
    .evaluate(() => document.querySelector('.alert').textContent)
    .end()
    .then((errorText) => {
      expect(errorText).toBe('Не найден RSS канал, проверьте адрес!');
    });
});
