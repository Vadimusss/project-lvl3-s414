import $ from 'jquery/dist/jquery';
// eslint-disable-next-line no-unused-vars
import modal from 'bootstrap';

export default (a, b, newValue) => {
  const { feedTitle, feedDescription, feedPosts } = newValue[newValue.length - 1];

  const feedList = document.getElementById('Feeds list');
  const pTag = document.createElement('p');
  pTag.textContent = `${feedTitle} - ${feedDescription}`;
  feedList.appendChild(pTag);

  const postsList = document.getElementById('Posts list');

  feedPosts.forEach((post) => {
    const postTitle = post.querySelector('title').textContent;
    const postDescription = post.querySelector('description').textContent;
    const postLink = post.querySelector('link').textContent;

    const divElement = document.createElement('div');
    divElement.classList.add('mb-2', 'p-1');

    const aTag = document.createElement('a');
    aTag.classList.add('m-2');
    aTag.href = postLink;
    aTag.textContent = postTitle;

    const bottonTag = document.createElement('botton');
    bottonTag.setAttribute('type', 'botton', 'float-none');
    bottonTag.classList.add('btn', 'btn-outline-info', 'btn-sm');
    bottonTag.textContent = 'Description';
    bottonTag.addEventListener('click', () => {
      const feedDescriptionModal = document.querySelector('#feedDescriptionModal .modal-body');
      feedDescriptionModal.textContent = postDescription;

      $('#feedDescriptionModal').modal('show');
    });

    divElement.appendChild(aTag);
    divElement.appendChild(bottonTag);
    postsList.appendChild(divElement);
  });
};
