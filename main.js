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

function convertObsidianLinks(markdown) {
  return markdown.replace(
    /\[\[([^\]|#]+)?(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/g,
    (match, file, heading, alias) => {

      const displayText = alias || heading || file;
      const fileName = file ? file.trim() + '.md' : '';
      const anchor = heading
        ? heading.trim().toLowerCase().replace(/\s+/g, '-')
        : '';

      return `<a href="#" 
                class="obsidian-link" 
                data-file="${fileName}" 
                data-anchor="${anchor}">
                ${displayText}
              </a>`;
    }
  );
}

function attachObsidianLinkHandler() {
  const links = viewer.querySelectorAll('.obsidian-link');

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();

      const file = link.dataset.file;
      const anchor = link.dataset.anchor;

      loadBlog(file, anchor, true);
    });
  });
}

function loadBlog(filename, anchor = null, updateURL = true) {

  const postName = filename.replace(/\.md$/, '');

  if (updateURL) {
    let newURL = `?post=${postName}`;
    if (anchor) newURL += `#${anchor}`;
    history.pushState({}, '', newURL);
  }

  fetch(`./blog/${filename}`, { cache: "no-store" })
    .then(res => res.text())
    .then(markdown => {

      const processedMarkdown = convertObsidianLinks(markdown);
      const html = marked.parse(processedMarkdown);

      viewer.innerHTML = html;
      viewer.style.display = 'block';

      attachInternalLinkHandler();
      attachObsidianLinkHandler();
      const shareBtn = document.createElement('button');
    shareBtn.textContent = "🔗 Share Article";
    shareBtn.onclick = () => {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied!");
    };

    viewer.prepend(shareBtn);
      if (anchor) {
        setTimeout(() => {
          const target = document.getElementById(anchor);
          if (target) {
            target.scrollIntoView({ behavior: "smooth" });
          }
        }, 100);
      }

      window.scrollTo({
        top: viewer.offsetTop,
        behavior: 'smooth'
      });
    });
    
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

function loadFromURL() {
  const params = new URLSearchParams(window.location.search);
  const post = params.get('post');
  const anchor = window.location.hash.replace('#', '');

  if (post) {
    loadBlog(post + '.md', anchor, false);
  }
}

window.addEventListener('popstate', loadFromURL);
window.addEventListener('DOMContentLoaded', loadFromURL);