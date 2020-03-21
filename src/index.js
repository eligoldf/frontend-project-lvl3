/* eslint-disable no-param-reassign */
import * as yup from 'yup';
import _ from 'lodash';
import axios from 'axios';
import rssParser from './parser';
import watch from './watchers';

const errMsg = {
  url: 'Invalid Url',
  duplication: 'This URL was already added',
  network: 'There is a network problem',
  data: 'There is no data to display',
  notFound: 'URL not found, please try again',
};

const isValid = (url, feedList) => {
  const errors = {};
  const isValidUrl = () => yup.string()
    .url()
    .required()
    .validateSync(url)
    .then((valid) => valid);
  const isDuplicated = () => feedList.filter((feed) => !feed.includes(url));

  isValidUrl(url)
    .then((valid) => {
      if (!valid) {
        errors.url = errMsg.url;
      }
      if (isDuplicated) {
        errors.duplication = errMsg.duplication;
      }
      return errors;
    });
};

const addFeed = (url, feedData, state) => {
  const [addedFeed] = state.feed.routes.filter((feed) => feed.url === url);
  if (addedFeed) {
    const updatedFeed = state.feed.data.items.filter((item) => item.id === addedFeed.id);
    state.feed.data.items = updatedFeed;
    const updatedItems = { id: addedFeed.id, links: feedData.items };
    state.feed.data.items.push(updatedItems);
  } else {
    const id = _.uniqueId();
    const name = { id, title: feedData.title, description: feedData.description };
    const items = { id, url: feedData.items };
    state.feed.routes = [{ url, id }, ...state.feed.routes];
    state.feed.data.names = [name, ...state.feed.data.names];
    state.feed.data.items = [items, state.feed.data.items];
  }
};

const checkValidation = (state) => {
  const { feedList } = state;
  const { urlValue } = state.form;
  return isValid(urlValue, feedList)
    .then((errors) => {
      const { form } = state;
      form.errors = errors;
      form.valid = _.isEqual(errors, {});
    });
};

const corsProxy = 'https://cors-anywhere.herokuapp.com';

const getRssData = (url, state) => {
  const requestedUrl = `${corsProxy}/${url}`;
  const errors = {};

  axios.get(requestedUrl)
    .then((response) => {
      const feedData = rssParser(response.data);
      if (!feedData) {
        errors.data = errMsg.data;
        state.form.processState = 'finished';
        state.form.valid = false;
      } else {
        state.form.processState = 'finished';
        state.form.valid = false;
        addFeed(url, feedData);
        setTimeout(() => getRssData(url), 60000);
      }
    })
    .catch((error) => {
      if (error.request) {
        errors.base = errMsg.base;
      } else if (error.response) {
        errors.notFound = errMsg.notFound;
      }
      console.log(error.request);
    })
    .then(() => {
      state.form.valid = false;
      state.form.processState = 'finished';
      state.feed.errors = errors;
    });
};

export default () => {
  const state = {
    form: {
      processState: 'filling',
      urlValue: '',
      valid: false,
      errors: {},
    },
    feed: {
      routes: [],
      data: {
        names: [],
        items: [],
      },
    },
  };

  watch(state);

  const form = document.getElementById('form');
  const input = document.getElementById('urlInput');

  input.addEventListener('input', (e) => {
    state.form.urlValue = e.target;
    checkValidation(state);
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const url = state.form.urlValue;
    state.processState = 'processing';
    getRssData(url, state);
  });
};
