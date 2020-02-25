export default (prop, _action, newState) => {
  const addFeedField = document.getElementById('RSS feed');
  const addFeedbutton = document.getElementById('Add feed');
  const dispatcher = {
    formFieldState: (state) => {
      switch (state) {
        case 'valid': {
          addFeedField.classList.remove('border-danger');
          addFeedbutton.removeAttribute('disabled');
          break;
        }
        case 'invalid': {
          addFeedField.classList.add('border-danger');
          addFeedbutton.setAttribute('disabled', 'disabled');
          break;
        }
        case 'empty': {
          addFeedField.value = '';
          addFeedbutton.setAttribute('disabled', 'disabled');
          break;
        }
        default: {
          throw new Error(`${state} is unknown validation state!`);
        }
      }
    },
    state: (state) => {
      switch (state) {
        case 'filling': {
          addFeedField.removeAttribute('disabled');
          break;
        }
        case 'sending': {
          addFeedField.setAttribute('disabled', 'disabled');
          addFeedbutton.setAttribute('disabled', 'disabled');
          break;
        }
        default: {
          throw new Error(`${state} is unknown state!`);
        }
      }
    },
  };

  dispatcher[prop](newState);
};
