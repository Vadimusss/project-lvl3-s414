const makeItemsParsing = items => items.map((item) => {
  const title = item.querySelector('title').textContent;
  const description = item.querySelector('description').textContent;
  const link = item.querySelector('link').textContent;

  return { title, description, link };
});

export default (html) => {
  const title = html.querySelector('channel title').textContent;
  const description = html.querySelector('channel description').textContent;
  const items = makeItemsParsing([...html.getElementsByTagName('item')]);

  return {
    title,
    description,
    items,
  };
};
