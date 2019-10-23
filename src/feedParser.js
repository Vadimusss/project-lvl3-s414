const postParser = posts => posts.map((post) => {
  const postTitle = post.querySelector('title').textContent;
  const postDescription = post.querySelector('description').textContent;
  const postLink = post.querySelector('link').textContent;

  return { postTitle, postDescription, postLink };
});

export default (feedData, feedURL) => {
  const feed = new DOMParser().parseFromString(feedData, 'text/xml');
  const feedTitle = feed.querySelector('channel title').textContent;
  const feedDescription = feed.querySelector('channel description').textContent;
  const feedPosts = postParser([...feed.getElementsByTagName('item')]);

  return {
    feedURL,
    feedTitle,
    feedDescription,
    feedPosts,
  };
};
