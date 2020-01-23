const makePostParsing = posts => posts.map((post) => {
  const title = post.querySelector('title').textContent;
  const description = post.querySelector('description').textContent;
  const link = post.querySelector('link').textContent;

  return { title, description, link };
});

export default (feedData) => {
  const feed = new DOMParser().parseFromString(feedData, 'text/xml');
  const channelTitle = feed.querySelector('channel title').textContent;
  const channelDescription = feed.querySelector('channel description').textContent;
  const channelPosts = makePostParsing([...feed.getElementsByTagName('item')]);

  return {
    channelTitle,
    channelDescription,
    channelPosts,
  };
};
