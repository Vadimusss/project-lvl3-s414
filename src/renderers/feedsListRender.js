export default (_prop, _action, newFeed) => {
  const { feedTitle, feedDescription } = newFeed[newFeed.length - 1];

  const feedList = document.getElementById('Feeds list');
  const pTag = document.createElement('p');
  pTag.textContent = `${feedTitle} - ${feedDescription}`;
  feedList.append(pTag);
};
