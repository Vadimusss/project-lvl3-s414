export default (prop, _action, newState) => {
  const addFeedField = document.getElementById('RSS feed');
  const addFeedbutton = document.getElementById('Add feed');

  const dispatcher = {
    valid: (isValid) => {
      if (isValid) {
        addFeedField.classList.remove('border-danger');
      } else {
        addFeedField.classList.add('border-danger');
      }
    },
    submitEnabled: (isEnabled) => {
      if (isEnabled) {
        addFeedbutton.removeAttribute('disabled');
      } else {
        addFeedbutton.setAttribute('disabled', 'disabled');
      }
    },
    formFieldDisabled: (isDisabled) => {
      if (isDisabled) {
        addFeedField.setAttribute('disabled', 'disabled');
      } else {
        addFeedField.removeAttribute('disabled');
      }
    },
    formFieldText: (text) => {
      addFeedField.value = text;
    },
  };

  dispatcher[prop](newState);
};
