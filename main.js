const grid = document.getElementById('blogGrid');
const viewer = document.getElementById('viewer');

// Load blog list
fetch('./blog/blog-list.json', { cache: "no-store" })
  .then(res => res.json())
  .then(files => {
    files.forEach(file => createCard(file));
  })
  .catch(err => console.error("Error loading blog list:", err));

function createCard(file) {
  const card = document.createElement('div');
  card.className = 'card';

  const title = file.title.replace('.md', '');
  card.textContent = title;

  card.addEventListener('click', () => loadBlog(file.file));

  grid.appendChild(card);
}

function loadBlog(filename) {
  fetch(`./blog/${filename}`, { cache: "no-store" })
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