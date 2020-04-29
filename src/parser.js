export default (data) => {
  const domParser = new DOMParser();
  const doc = domParser.parseFromString(data, 'text/xml');

  const items = doc.querySelectorAll('item');
  const posts = [...items].map((item) => {
    const link = item.querySelector('link').textContent;
    const title = item.querySelector('title').textContent;
    return { link, title };
  });

  const title = doc.querySelector('title').textContent;
  const description = doc.querySelector('description').textContent;

  const feedData = { title, description, posts };

  return feedData;
};
