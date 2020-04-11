import _ from 'lodash';
import * as yup from 'yup';
import i18next from 'i18next';
import axios from 'axios';
import resources from './locales';
import rssParser from './parser';
import watch from './watchers';

const isValidUrlState = (state) => {
  const { urlList, form } = state;
  const currentUrl = form.urlValue;
  return yup.string().url().validate(currentUrl)
    .catch(() => {
      form.errors = 'errors.url';
      form.valid = false;
      console.log(form.errors);
    })
    .then(() => yup.mixed().notOneOf(urlList).validate(currentUrl))
    .catch(() => {
      form.errors = 'errors.duplication';
      form.valid = false;
      console.log(form.errors);
    })
    .then(() => {
      form.valid = 'true';
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
  postList.push({ id, posts });
  console.log(postList);
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
      form.errors = 'errors.network';
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

  i18next.init({
    lng: 'en',
    debug: false,
    resources,
  })
    .then((t) => watch(state, t));

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
};
