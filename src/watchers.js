import { watch } from 'melanke-watchjs';

export default (state) => {
  const { feed, form } = state;
  const submitButton = document.getElementById('submitBtn');
  const urlInput = document.getElementById('input');
  const jumbotron = document.getElementsByClassName('.jjumbotron');

  watch(form, 'processState', () => {
    const { processState } = state.form;
    switch (processState) {
      case 'filling':
        submitButton.disabled = false;
        break;
      case 'processing':
        submitButton.disabled = true;
        break;
      case 'processed':
        urlInput.value = '';
        submitButton.disabled = true;
        break;
      default:
        throw new Error(`Unknown state process ${processState}`);
    }
  });

  watch(form, 'valid', () => {
    submitButton.disabled = !state.form.valid;
  });


  watch(state.form, 'errors', () => {
    const errEl = form.nextElementSibling;
    const errMsg = Object.values(form.errors).flat();

    if (errEl) {
      urlInput.classList.remove('is-ivalid');
      errEl.remove();
    }

    const feedbackMsg = document.createElement('div');
    feedbackMsg.classList.add('invalid-feedback');
    feedbackMsg.innerHTML = errMsg;
    urlInput.classList.add('is-invalid');
    urlInput.after(feedbackMsg);
  });

  watch(form, 'urlValue', () => {
    urlInput.value = form.urlInput;
  });

  watch(feed.data, 'items', () => {
    const { names, items } = feed.data;
    names.forEach((channel) => {
      const feedEl = document.getElementById('channel.id');
      if (feedEl) {
        feedEl.remove();
      }

      const feedChannel = document.createElement('div');
      feedChannel.id = channel.id;
      const title = document.createElement('h2');
      title.innerHTML = channel.title;
      feedChannel.appendChild('title');

      const description = document.createElement('p');
      description.innerHTML = channel.description;
      feedChannel.appendChild('description');

      const news = document.createElement('ul');
      const [rssFeed] = items.filter((item) => item.id === channel.id);
      rssFeed.links.forEach((item) => {
        const listItem = document.createElement('li');
        news.appendChild(listItem);
        const url = document.createElement('a');
        news.appendChild(listItem);
        url.innerHTML = item.title;
        url.href = item.link;
        listItem.appendChild(url);
      });
      feedChannel.appendChild(news);
      jumbotron.after(feedChannel);
    });
  });
};
