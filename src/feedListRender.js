export default (a, b, newValue) => {
  const { feedTitle, feedDescription, feedPosts } = newValue[newValue.length - 1];

  const feedList = document.getElementById('Feeds list');
  const pTag = document.createElement('p');

  pTag.textContent = `${feedTitle} - ${feedDescription}`;
  feedList.appendChild(pTag);

  const postsList = document.getElementById('Posts list');

  feedPosts.forEach((post) => {
    const postTitle = post.querySelector('title').textContent;
    const postLink = post.querySelector('link').textContent;

    const aTag = document.createElement('a');
    const brTag = document.createElement('br');

    aTag.href = postLink;
    aTag.textContent = postTitle;
    postsList.appendChild(aTag);
    postsList.appendChild(brTag);
  });
};
