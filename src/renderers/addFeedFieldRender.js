export default (message) => {
  const addFeedField = document.getElementById('RSS feed');

  const dispatcher = {
    correct: () => addFeedField.classList.remove('border-danger'),
    incorrect: () => addFeedField.classList.add('border-danger'),
    clear: () => { addFeedField.value = ''; },
  };

  dispatcher[message]();
};
