const makePostParsing = posts => posts.map((post) => {
  const title = post.querySelector('title').textContent;
  const description = post.querySelector('description').textContent;
  const link = post.querySelector('link').textContent;

  return { title, description, link };
});

export default (feedData) => {
  const feed = new DOMParser().parseFromString(feedData, 'text/xml');
  const title = feed.querySelector('channel title').textContent;
  const description = feed.querySelector('channel description').textContent;
  const posts = makePostParsing([...feed.getElementsByTagName('item')]);

  return {
    title,
    description,
    posts,
  };
};
