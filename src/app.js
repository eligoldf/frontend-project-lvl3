import _ from 'lodash';
import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next';
import rssParser from './parser';
import resources from './locales';
import watch from './watchers';

const validateUrl = (url, urlList) => yup.string()
  .url()
  .notOneOf(urlList)
  .validate(url);

const isValidUrlState = (state) => {
  const { form } = state;
  const currentUrl = form.urlValue;
  const urlList = state.feeds.map(({ url }) => url);

  return validateUrl(currentUrl, urlList)
    .then(() => {
      form.valid = true;
      form.errors = '';
    })
    .catch(({ type }) => {
      form.errors = type;
      form.valid = false;
      form.processState = 'processed';
    });
};

const createFeed = (url, data, state) => {
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
      const { posts: newPosts } = rssParser(data);
      const postsDifference = _.differenceBy(newPosts, oldPosts, 'title');
      const postsToUpdate = postsDifference.map((post) => ({ id: feedToUpdate.id, ...post }));
      posts.unshift(...postsToUpdate);
      form.processState = 'processed';
      form.errors = '';
    })
    .catch(() => {
      form.valid = false;
      form.errors = 'feed';
      form.processState = 'processed';
    })
    .then(() => setTimeout(() => getNewPosts(url, state), 5000));
};

const getFeed = (url, state) => {
  const { form } = state;
  axios.get(`${corsProxy}/${url}`)
    .then(({ data }) => {
      const feedData = rssParser(data);
      createFeed(url, feedData, state);
      form.processState = 'processed';
      form.valid = true;
      form.errors = '';
      setTimeout(() => getNewPosts(url, state), 5000);
    })
    .catch(() => {
      form.valid = false;
      form.errors = 'network';
      form.processState = 'processed';
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
        isValidUrlState(state);
      });

      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const url = state.form.urlValue;
        state.form.processState = 'processing';
        state.form.valid = true;
        getFeed(url, state);
      });
      watch(state);
    });
};
