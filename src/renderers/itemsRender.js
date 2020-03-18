import _ from 'lodash';

export default (_prop, _action, newItems, oldItems) => {
  const items = _.differenceBy(newItems, oldItems, 'link');
  const postsList = document.getElementById('postsList');
  const postListTitle = postsList.querySelector('p');

  items.forEach(({ title, description, link }) => {
    const divElement = document.createElement('div');
    divElement.classList.add('mb-2', 'p-1');

    const aTag = document.createElement('a');
    aTag.classList.add('m-2');
    aTag.href = link;
    aTag.textContent = title;

    const bottonTag = document.createElement('botton');
    bottonTag.setAttribute('type', 'botton');
    bottonTag.setAttribute('data-toggle', 'modal');
    bottonTag.setAttribute('data-target', '#feedDescriptionModal');
    bottonTag.classList.add('btn', 'btn-outline-info', 'btn-sm');
    bottonTag.textContent = 'Description';
    bottonTag.addEventListener('click', () => {
      const feedDescriptionModal = document.querySelector('#feedDescriptionModal .modal-body');
      feedDescriptionModal.textContent = description;
    });

    divElement.append(aTag);
    divElement.append(bottonTag);
    postListTitle.after(divElement);
  });
};
