import _ from 'lodash';
import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next';
import parseRss from './parser';
import resources from './locales';
import watch from './watchers';

const validateUrl = (url, urlList) => yup.string()
  .url()
  .required()
  .notOneOf(urlList)
  .validateSync(url);

const updateValidationState = (state) => {
  const { form } = state;
  const currentUrl = form.urlValue;
  const urlList = state.feeds.map(({ url }) => url);

  try {
    validateUrl(currentUrl, urlList);
    form.valid = true;
    form.errors = [];
  } catch (e) {
    const error = e.type;
    form.errors = [error];
    form.valid = false;
  }
};

const addRssFeed = (url, data, state) => {
  const { title, description, posts } = data;
  const id = _.uniqueId();
  const newFeed = {
    id, title, description, url,
  };
  const newPosts = posts.map((post) => ({ id, ...post }));
  state.feeds.push(newFeed);
  state.posts.push(...newPosts);
};

const corsProxy = 'https://cors-anywhere.herokuapp.com';

const getNewPosts = (url, state) => {
  const { form, feeds, posts } = state;
  const feedToUpdate = feeds.find((feed) => feed.url === url);
  const oldPosts = posts.filter(({ id }) => id === feedToUpdate.id);

  axios.get(`${corsProxy}/${url}`)
    .then(({ data }) => {
      const { posts: newPosts } = parseRss(data);
      const postsDifference = _.differenceBy(newPosts, oldPosts, 'title');
      const postsToUpdate = postsDifference.map((post) => ({ id: feedToUpdate.id, ...post }));
      posts.unshift(...postsToUpdate);
      form.processState = 'processed';
    })
    .catch(() => {
      form.valid = false;
      form.errors = ['feed'];
      form.processState = 'processing';
    })
    .finally(() => setTimeout(() => getNewPosts(url, state), 5000));
};

const getFeed = (url, state) => {
  const { form } = state;
  axios.get(`${corsProxy}/${url}`)
    .then(({ data }) => {
      const feedData = parseRss(data);
      addRssFeed(url, feedData, state);
      form.processState = 'processed';
      form.valid = true;
      getNewPosts(url, state);
    })
    .catch(() => {
      form.valid = false;
      form.errors = ['network'];
      form.processState = 'processing';
    });
};

export default () => {
  i18next.init({
    lng: 'en',
    debug: false,
    resources,
  })
    .then(() => {
      const state = {
        form: {
          processState: 'filling',
          valid: false,
          urlValue: '',
          errors: '',
        },
        feeds: [],
        posts: [],
      };

      const form = document.getElementById('form');
      const urlInput = document.getElementById('urlInput');

      urlInput.addEventListener('input', (e) => {
        state.form.urlValue = e.target.value;
        updateValidationState(state);
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const url = formData.get('url');
        state.form.valid = true;
        getFeed(url, state);
      });

      watch(state);
    });
};
