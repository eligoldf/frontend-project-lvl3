import _ from 'lodash';
import * as yup from 'yup';
import axios from 'axios';
import rssParser from './parser';
import watch from './watchers';

const validateUrl = (currentUrl, urlList) => {
  const errors = [];

  return yup.string().url().validate(currentUrl)
    .catch(() => {
      errors.push('This URL is not Valid');
    })
    .then(() => yup.mixed().notOneOf(urlList).validate(currentUrl))
    .catch(() => {
      errors.push('This Url is already in the list');
    })
    // .then(() => errors);
    .then(() => new Promise((resolve) => { resolve(errors); }));
};

const isValidUrlState = (state) => {
  const { form, urlsList } = state;
  const currentUrl = form.urlValue;
  validateUrl(currentUrl, urlsList)
    .then((errors) => {
      form.errors = errors;
      form.valid = _.isEqual(errors, []);
    });
};

const getFeed = (currentUrl, state) => {
  const corsProxy = 'https://cors-anywhere.herokuapp.com/';

  const {
    feedList, postList, form, urlList,
  } = state;

  axios.get(`${corsProxy}/${currentUrl}`)
    .then(({ data }) => {
      const { title, description, posts } = rssParser(data);
      urlList.push(currentUrl);
      feedList.push(title, description);
      postList.push(posts);
      form.valid = true;
      form.processState = 'processed';
    })
    .catch((error) => {
      form.processState = 'processed';
      form.errors.push(error);
    });
};

export default () => {
  const state = {
    form: {
      processState: 'filling',
      valid: false,
      urlValue: '',
      errors: [],
    },
    urlList: [],
    feedList: [],
    postList: [],
  };

  const form = document.getElementById('form');
  const urlInput = document.getElementById('urlInput');

  urlInput.addEventListener('input', (e) => {
    state.form.urlValue = e.target.value;
    isValidUrlState(state);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const currentUrl = state.form.urlValue;
    state.form.processState = 'processing';
    state.form.valid = true;
    getFeed(currentUrl, state);
  });

  watch(state);
};
