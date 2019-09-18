const errors = {
  Error: 'Не верный адрес!',
  TypeError: 'Не найден RSS канал, проверьте адрес!',
};

export default (error) => {
  const errorDiv = document.createElement('div');
  errorDiv.classList.add('alert', 'alert-danger');
  errorDiv.setAttribute('role', 'alert');
  errorDiv.textContent = errors[error.name];

  const addFeedForm = document.querySelector('.jumbotron');
  const container = addFeedForm.parentNode;
  container.insertBefore(errorDiv, addFeedForm);

  setTimeout(() => container.removeChild(errorDiv), 3000);
};
