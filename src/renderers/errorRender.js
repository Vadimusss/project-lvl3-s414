const errors = {
  'Cannot read property \'textContent\' of null': 'Не найден RSS канал, проверьте адрес!',
  'Request failed with status code 400': 'Не верный адрес!',
  'Error filling out the form': 'Не верный адрес!',
  'Network Error': 'Ошибка сети!',
  'The query is executed': 'Приложение занято, повторите попытку!',
};

export default (error) => {
  const errorDiv = document.createElement('div');
  errorDiv.classList.add('alert', 'alert-danger');
  errorDiv.setAttribute('role', 'alert');
  errorDiv.textContent = errors[error.message];

  const addFeedForm = document.querySelector('.jumbotron');
  const container = addFeedForm.parentNode;
  container.insertBefore(errorDiv, addFeedForm);

  setTimeout(() => container.removeChild(errorDiv), 3000);
};
