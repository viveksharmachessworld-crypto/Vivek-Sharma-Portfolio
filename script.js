import assets from './src/archive-images.json';
const imageUrl = file => `/images/${encodeURIComponent(file)}`;
const grid = document.querySelector('#archive-grid');
const dialog = document.querySelector('#lightbox');
let activeIndex = 0;

const heroBoard = document.querySelector('#hero-board');
if (heroBoard) {
  for (let rank = 8; rank >= 1; rank--) for (let file = 0; file < 8; file++) {
    const square = document.createElement('span');
    square.className = `square ${(rank + file) % 2 ? 'dark' : ''}`;
    if (file === 0) square.dataset.rank = rank;
    heroBoard.append(square);
  }
}

function renderArchive() {
  grid.replaceChildren();
  assets.forEach((asset, index) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'archive-card'; button.dataset.kind = asset.kind;
    button.setAttribute('aria-label', `${asset.caption}. Open image.`);
    const image = document.createElement('img');
    image.src = imageUrl(asset.file); image.alt = asset.caption; image.loading = 'lazy';
    image.addEventListener('error', () => button.classList.add('image-unavailable'), {once:true});
    const caption = document.createElement('span'); caption.className = 'archive-caption';
    const type = document.createElement('b'); type.textContent = asset.kind.toUpperCase();
    const title = document.createElement('small'); title.textContent = asset.caption;
    caption.append(type, title); button.append(image, caption);
    button.addEventListener('click', () => openLightbox(index)); grid.append(button);
  });
}
function openLightbox(index) { activeIndex = index; updateLightbox(); dialog.showModal(); }
function updateLightbox() {
  const asset = assets[activeIndex], image = dialog.querySelector('figure img');
  image.src = imageUrl(asset.file); image.alt = asset.caption;
  dialog.querySelector('figcaption').textContent = `${asset.caption} · ${asset.detail}`;
  dialog.querySelector('.lightbox-counter').textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${assets.length}`;
}
function stepLightbox(direction) { activeIndex = (activeIndex + direction + assets.length) % assets.length; updateLightbox(); }

document.querySelectorAll('.filter-button').forEach(button => button.addEventListener('click', () => {
  document.querySelector('.filter-button.active')?.classList.remove('active'); button.classList.add('active');
  const filter = button.dataset.filter;
  document.querySelectorAll('.archive-card').forEach(card => card.classList.toggle('hidden', filter !== 'all' && card.dataset.kind !== filter));
}));
dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
dialog.querySelector('.lightbox-prev').addEventListener('click', () => stepLightbox(-1));
dialog.querySelector('.lightbox-next').addEventListener('click', () => stepLightbox(1));
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
document.addEventListener('keydown', event => { if (dialog.open && event.key === 'ArrowRight') stepLightbox(1); if (dialog.open && event.key === 'ArrowLeft') stepLightbox(-1); });
const menuButton = document.querySelector('.menu-toggle'), mobileNav = document.querySelector('.mobile-nav');
menuButton.addEventListener('click', () => {
  const isOpen = mobileNav.classList.toggle('open'); menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation'); menuButton.textContent = isOpen ? '×' : '☰';
  document.documentElement.classList.toggle('menu-open', isOpen);
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  mobileNav.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation'); menuButton.textContent = '☰';
  document.documentElement.classList.remove('menu-open');
}));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && mobileNav.classList.contains('open')) {
    mobileNav.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation'); menuButton.textContent = '☰';
    document.documentElement.classList.remove('menu-open'); menuButton.focus();
  }
});
document.querySelectorAll('.image-open').forEach(button => button.addEventListener('click', () => {
  const index = assets.findIndex(asset => asset.file === button.dataset.image); if (index >= 0) openLightbox(index);
}));
renderArchive();
