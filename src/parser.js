export default (data) => {
  const domparser = new DOMParser();
  const doc = domparser.parseFromString(data, 'text/xml');

  const posts = [...doc.querySelectorAll('item')]
    .map((post) => ({
      title: post.querySelector('title').textContent,
      link: post.querySelector('link').textContent,
    }));

  const title = doc.querySelector('title').textContent;
  const description = doc.querySelector('description').textContent;

  return { title, description, posts };
};
