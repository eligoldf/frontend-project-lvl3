export default (data) => {
  const domparser = new DOMParser();
  const doc = domparser.parseFromString(data, 'text/xml');

  const posts = [...doc.querySelectorAll('item')]
    .map((post) => ({
      title: post.querySelector('title').textContent,
      link: post.querySelector('link').textContent,
      // pubDate: post.querySelector('pubDate').textContent,
    }));

  const feedData = {
    title: doc.querySelector('title').textContent,
    description: doc.querySelector('description').textContent,
    posts,
  };

  return feedData;
};
