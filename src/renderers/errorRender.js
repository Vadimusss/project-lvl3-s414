const errors = {
  'Cannot read property \'textContent\' of null': 'Не найден RSS канал, проверьте адрес!',
  'Request failed with status code 400': 'Не верный адрес!',
  'Network Error': 'Ошибка сети!',
  'Unknown error': 'Неизвестная ошибка!',
};

export default (_prop, _action, allErrors) => {
  const errorDiv = document.createElement('div');
  errorDiv.classList.add('alert', 'alert-danger');
  errorDiv.setAttribute('role', 'alert');
  errorDiv.textContent = errors[allErrors[0]];

  const addFeedForm = document.querySelector('.jumbotron');
  const container = addFeedForm.parentNode;
  container.insertBefore(errorDiv, addFeedForm);

  setTimeout(() => container.removeChild(errorDiv), 3000);
};
