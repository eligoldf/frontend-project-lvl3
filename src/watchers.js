import { watch } from 'melanke-watchjs';
import i18next from 'i18next';

export default (state) => {
  const { form } = state;
  const submitBtn = document.getElementById('submitBtn');
  const urlInput = document.getElementById('urlInput');

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

  watch(form, 'urlValue', () => {
    urlInput.value = form.urlValue;
  });

  watch(form, 'errors', () => {
    const { errors } = form;
    const errorDiv = document.getElementById('errorDiv');

    if (errorDiv) {
      urlInput.classList.remove('is-invalid');
      errorDiv.textContent = '';
    }

    if (errors.length === 0 || urlInput.value === '') return;

    errorDiv.innerHTML = errors.map((error) => i18next.t(`errors.${error}`)).join('');
    urlInput.classList.add('is-invalid');
  });


  watch(state, 'posts', () => {
    const { feeds, posts } = state;
    const feedContainer = document.querySelector('[data-container="feeds"]');
    const postsContainer = document.querySelector('[data-container="posts"]');
    feedContainer.innerHTML = '';
    postsContainer.innerHTML = '';

    feeds.forEach((feed) => {
      const feedBlock = document.createElement('div');
      feedContainer.appendChild(feedBlock);
      const feedTitle = document.createElement('h5');
      feedTitle.innerHTML = feed.title;
      const feedDescription = document.createElement('p');
      feedDescription.innerHTML = feed.description;
      feedBlock.append(feedTitle, feedDescription);

      const postsUl = document.createElement('ul');
      postsUl.classList.add('list-unstyled');
      postsContainer.appendChild(postsUl);

      const postsByFeedId = posts.filter((post) => post.id === feed.id);

      postsByFeedId.forEach((post) => {
        const postsLi = document.createElement('li');
        postsLi.classList.add('mt-2');
        postsUl.appendChild(postsLi);
        const postsLink = document.createElement('a');
        postsLink.innerHTML = post.title;
        postsLink.href = post.link;
        postsLi.appendChild(postsLink);
      });
    });
  });
};
