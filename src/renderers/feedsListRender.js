export default (_prop, _action, newFeed) => {
  const { title, description } = newFeed;
  const feedList = document.getElementById('feedsList');
  const pTag = document.createElement('p');
  pTag.textContent = `${title} - ${description}`;
  feedList.append(pTag);
};
