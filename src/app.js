import _ from 'lodash';
import * as yup from 'yup';
import axios from 'axios';
import i18next from 'i18next';
import rssParser from './parser';
import resources from './locales';
import watch from './watchers';

const isValidUrlState = (state) => {
  const { form, feeds } = state;
  const url = form.urlValue;
  return yup.string().url().validate(url)
    .catch(() => {
      form.errors = 'errors.url';
      form.valid = false;
    })
    .then(() => yup.mixed().notOneOf(feeds).validate(url))
    .catch(() => {
      form.errors = 'errors.duplication';
      form.valid = false;
    })
    .then(() => {
      form.valid = 'true';
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
  const feedToAdd = feeds.find((feed) => feed.url === url);
  const oldPosts = posts.filter(({ id }) => id === feedToAdd.id);

  axios.get(`${corsProxy}/${url}`)
    .then(({ data }) => {
      const { posts: newPosts } = rssParser(data);
      const postsDifference = _.differenceBy(newPosts, oldPosts, 'title');
      const postsToAdd = postsDifference.map((post) => ({ id: feedToAdd.id, ...post }));
      posts.unshift(...postsToAdd);
    })
    .catch(() => {
      form.valid = false;
      form.errors = 'errors.feed';
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
      setTimeout(() => getNewPosts(url, state), 5000);
    })
    .catch(() => {
      form.valid = false;
      form.errors = 'errors.network';
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
          errors: [],
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
