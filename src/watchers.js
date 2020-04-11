import { watch } from 'melanke-watchjs';

export default (state, t) => {
  const { form } = state;
  const submitBtn = document.getElementById('submitBtn');
  const urlInput = document.getElementById('urlInput');
  const errorDiv = document.getElementById('errorDiv');

  watch(form, 'errors', () => {
    const { errors } = form;

    if (errors.length === 0 || form.urlValue === '') {
      urlInput.classList.remove('is-invalid');
      urlInput.innerHTML = '';
    }
    urlInput.classList.add('is-invalid');
    errorDiv.classList.add('alert', 'alert-light', 'mt-2');
    errorDiv.setAttribute('role', 'alert');
    errorDiv.innerHTML = t(errors);
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
    const { feedList, postList } = state;
    const feedDiv = document.getElementById('feedDiv');
    const postDiv = document.getElementById('postDiv');
    const feeds = document.createElement('ul');
    feeds.classList.add('list-group');
    const postsUl = document.createElement('ul');
    postsUl.classList.add('list-group');

    feedList.forEach(({ id, title, description }) => {
      const feedListId = id;
      const feedEl = document.createElement('li');
      feedEl.classList.add('list-group-item');
      feedEl.innerHTML = `<h4>${title}</h4>
                    <div>${description}</div>`;
      feeds.append(feedEl);

      const filteredPosts = postList.filter((p) => p.id === feedListId);

      filteredPosts.forEach(({ posts }) => {
        posts.forEach((post) => {
          const postEl = document.createElement('li');
          postEl.classList.add('list-group-item');
          postEl.innerHTML = `<a href="${post.link}">${post.title}</a>`;
          postsUl.append(postEl);
        });
      });
    });
    feedDiv.append(feeds);
    postDiv.append(postsUl);
  });
};
