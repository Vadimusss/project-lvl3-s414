const makeItemsParsing = items => items.map((item) => {
  const title = item.querySelector('title').textContent;
  const description = item.querySelector('description').textContent;
  const link = item.querySelector('link').textContent;

  return { title, description, link };
});

export default (html) => {
  const document = new DOMParser().parseFromString(html, 'text/xml');
  const title = document.querySelector('channel title').textContent;
  const description = document.querySelector('channel description').textContent;
  const items = makeItemsParsing([...document.getElementsByTagName('item')]);

  return {
    title,
    description,
    items,
  };
};
