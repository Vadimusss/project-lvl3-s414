const errors = {
  'Cannot read property \'textContent\' of null': 'Не найден RSS канал, проверьте адрес!',
  'Request failed with status code 400': 'Не верный адрес!',
  'Network Error': 'Ошибка сети!',
};

export default (_prop, _action, newError) => {
  const errorDiv = document.createElement('div');
  errorDiv.classList.add('alert', 'alert-danger');
  errorDiv.setAttribute('role', 'alert');
  errorDiv.textContent = errors[newError];

  const addFeedForm = document.querySelector('.jumbotron');
  const container = addFeedForm.parentNode;
  container.insertBefore(errorDiv, addFeedForm);

  setTimeout(() => container.removeChild(errorDiv), 3000);
};
