export default (_prop, _action, newFeed) => {
  const { channelTitle, channelDescription } = newFeed;

  const feedList = document.getElementById('Feeds list');
  const pTag = document.createElement('p');
  pTag.textContent = `${channelTitle} - ${channelDescription}`;
  feedList.append(pTag);
};
