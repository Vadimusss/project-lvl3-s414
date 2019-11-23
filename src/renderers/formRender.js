export default (_prop, _action, newState) => {
  const addFeedField = document.getElementById('RSS feed');
  const addFeedbutton = document.getElementById('Add feed');

  const dispatcher = {
    valid: () => {
      addFeedField.classList.remove('border-danger');
      addFeedbutton.removeAttribute('disabled');
    },
    invalid: () => {
      addFeedField.classList.add('border-danger');
      addFeedbutton.setAttribute('disabled', true);
    },
    empty: () => {
      addFeedField.value = '';
      addFeedbutton.setAttribute('disabled', true);
    },
  };

  dispatcher[newState]();
};
