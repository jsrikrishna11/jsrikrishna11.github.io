const grid = document.getElementById('blogGrid');
const viewer = document.getElementById('viewer');

// Load blog list
fetch('./blog/blog-list.json')
  .then(res => res.json())
  .then(files => {
    files.forEach(file => createCard(file));
  })
  .catch(err => console.error("Error loading blog list:", err));

function createCard(filename) {
  const card = document.createElement('div');
  card.className = 'card';

  const title = filename.replace('.md', '');
  card.textContent = title;

  card.addEventListener('click', () => loadBlog(filename));

  grid.appendChild(card);
}

function loadBlog(filename) {
  fetch(`./blog/${filename}`)
    .then(res => res.text())
    .then(markdown => {
      const html = marked.parse(markdown);
      viewer.innerHTML = html;
      viewer.style.display = 'block';

      attachInternalLinkHandler();

      window.scrollTo({
        top: viewer.offsetTop,
        behavior: 'smooth'
      });
    })
    .catch(err => console.error("Error loading blog:", err));
}

function attachInternalLinkHandler() {
  const links = viewer.querySelectorAll('a');

  links.forEach(link => {
    const href = link.getAttribute('href');

    if (href && href.endsWith('.md')) {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        loadBlog(href);
      });
    }
  });
}