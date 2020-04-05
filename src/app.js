import _ from 'lodash';
import * as yup from 'yup';
// import i18next from 'i18next';
import axios from 'axios';
// import resources from './locales';
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
      errors.push('This URL is already in the list');
    })
    .then(() => errors);
};

const isValidUrlState = (state) => {
  const { form, urlList } = state;
  const currentUrl = form.urlValue;
  validateUrl(currentUrl, urlList)
    .then((errors) => {
      form.errors = errors;
      form.valid = _.isEqual(errors, []);
    });
};

const updateFeed = (currentUrl, data, state) => {
  const { title, description, posts } = data;
  const {
    feedList, postList, urlList,
  } = state;
  const id = _.uniqueId();
  urlList.push({ id, currentUrl });
  feedList.push({ id, title, description });
  postList.push(...posts);
};

const getFeed = (currentUrl, state) => {
  const corsProxy = 'https://cors-anywhere.herokuapp.com';
  const { form } = state;
  axios.get(`${corsProxy}/${currentUrl}`)
    .then(({ data }) => {
      const feedData = rssParser(data);
      form.processState = 'processed';
      updateFeed(currentUrl, feedData, state);
      form.valid = true;
    })
    .catch(() => {
      form.valid = false;
      form.errors.push('There must be a Network problem');
      form.processState = 'processed';
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
    console.log(currentUrl);
    state.form.processState = 'processing';
    state.form.valid = true;
    getFeed(currentUrl, state);
  });

  watch(state);
};
