export default (prop, action, newValue) => {
  const addFeedField = document.getElementById('RSS feed');
  addFeedField.classList.toggle('border-danger', !newValue);
};
