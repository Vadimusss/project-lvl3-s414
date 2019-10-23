// eslint-disable-next-line no-unused-vars
import modal from 'bootstrap';

export default (_prop, _action, newPosts) => {
  const postsList = document.getElementById('Posts list');
  const postListTitle = postsList.querySelector('p');

  newPosts.forEach(({ postTitle, postDescription, postLink }) => {
    const divElement = document.createElement('div');
    divElement.classList.add('mb-2', 'p-1');

    const aTag = document.createElement('a');
    aTag.classList.add('m-2');
    aTag.href = postLink;
    aTag.textContent = postTitle;

    const bottonTag = document.createElement('botton');
    bottonTag.setAttribute('type', 'botton');
    bottonTag.setAttribute('data-toggle', 'modal');
    bottonTag.setAttribute('data-target', '#feedDescriptionModal');
    bottonTag.classList.add('btn', 'btn-outline-info', 'btn-sm');
    bottonTag.textContent = 'Description';
    bottonTag.addEventListener('click', () => {
      const feedDescriptionModal = document.querySelector('#feedDescriptionModal .modal-body');
      feedDescriptionModal.textContent = postDescription;
    });

    divElement.append(aTag);
    divElement.append(bottonTag);
    postListTitle.after(divElement);
  });
};
