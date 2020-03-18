import i18next from 'i18next';
import resources from '../locales';

(async () => {
  await i18next.init({
    lng: 'ru',

    resources,
  });
})();

export default (_prop, _action, newError) => {
  const errorDiv = document.createElement('div');
  errorDiv.classList.add('alert', 'alert-danger');
  errorDiv.setAttribute('role', 'alert');
  errorDiv.textContent = i18next.t(`errors.${newError}`);

  const addFeedForm = document.querySelector('.jumbotron');
  const container = addFeedForm.parentNode;
  container.insertBefore(errorDiv, addFeedForm);

  setTimeout(() => container.removeChild(errorDiv), 3000);
};
