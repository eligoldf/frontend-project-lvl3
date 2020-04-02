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
    const feedList = [state.feedList];
    const feeds = document.createElement('ul');
    feeds.classlist.add('list-group');

    feedList.forEach(({ title, description }) => {
      feeds.classlist.add('list-group');
      const feedEl = document.createElement('li');
      feedEl.classList.add('list-group-item');
      const feedTitle = document.createElement('h4');
      feedTitle.textContent = title;
      const feedDescription = document.createElement('div');
      feedDescription.textContent = description;
      feedEl.append(feedTitle, feedDescription);
      feeds.append(feedEl);
    });
    feedDiv.appendChild(feeds);
  });

  watch(state, 'postList', () => {
    const postList = [state.postList];
    const posts = document.createElement('ul');
    posts.classlist.add('list-group');

    postList.forEach((post) => {
      const postEl = document.createElement('li');
      postEl.classlist.add('list-group-item');
      postEl.innerHTML = `<a href${posts.link}>${post.title}</a>`;
    });
    postDiv.appendChild(posts);
  });
};
