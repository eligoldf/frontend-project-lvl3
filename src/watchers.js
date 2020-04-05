import { watch } from 'melanke-watchjs';

export default (state) => {
  const { form } = state;
  const submitBtn = document.getElementById('submitBtn');
  const urlInput = document.getElementById('urlInput');
  const errorDiv = document.getElementById('errorDiv');
  const feedDiv = document.getElementById('feedDiv');
  const postDiv = document.getElementById('postDiv');

  watch(form, 'errors', () => {
    const errors = [...form.errors];

    if (errors.length === 0 || form.urlValue === '') {
      return;
    }

    errors.forEach((error) => {
      errorDiv.classList.add('alert', 'alert-light', 'mt-2');
      errorDiv.setAttribute('role', 'alert');
      errorDiv.innerHTML = error;
      urlInput.classList.add('is-invalid');
    });
  });

  watch(form, 'processState', () => {
    const { processState } = form;
    switch (processState) {
      case 'filling':
        submitBtn.disabled = false;
        break;
      case 'processing':
        submitBtn.disabled = true;
        break;
      case 'processed':
        submitBtn.disabled = true;
        urlInput.value = '';
        break;
      default:
        throw new Error(`Unknown state: ${processState}`);
    }
  });

  watch(form, 'valid', () => {
    submitBtn.disabled = !form.valid;
  });

  watch(form, 'field', () => {
    urlInput.value = form.urlValue;
  });

  watch(state, 'feedList', () => {
    const { feedList } = state;
    const feeds = document.createElement('ul');
    feeds.classList.add('list-group');

    feedList.forEach((feed) => {
      const { title, description } = feed;
      const feedEl = document.createElement('li');
      feedEl.classList.add('list-group-item');
      const feedTitle = document.createElement('h4');
      feedTitle.textContent = title;
      const feedDescription = document.createElement('div');
      feedDescription.textContent = description;
      feedEl.append(feedTitle, feedDescription);
      feeds.append(feedEl);
    });
    feedDiv.append(feeds);
  });

  watch(state, 'postList', () => {
    const { postList } = state;
    console.log(postList);
    // const { id } = posts;
    const postsUl = document.createElement('ul');
    postsUl.classList.add('list-group');

    postList.forEach(({ link, title }) => {
      const postEl = document.createElement('li');
      postEl.classList.add('list-group-item');
      postEl.innerHTML = `<a href${link}>${title}</a>`;
      postsUl.append(postEl);
    });
    postDiv.append(postsUl);
  });
};