// Keeping the archive in one place makes captions, filters, and the lightbox agree.
const assets = [
  {file:'FB_IMG_1749380355265.jpg',url:'https://drive.google.com/uc?export=view&id=1mdsafM-OXKx8KmagD3m4qDKmEZDYassA',kind:'photograph',caption:'Award ceremony',detail:'Owner-provided photograph · public Drive file'},
  {file:'FB_IMG_1749380486047.jpg',url:'https://drive.google.com/uc?export=view&id=1lHBr7M1vJpGRSu7hpDzJ7INvJQsO2nAy',kind:'photograph',caption:'Holding an award',detail:'Owner-provided photograph · public Drive file'},
  {file:'FB_IMG_1749380787849.jpg',url:'https://drive.google.com/uc?export=view&id=1mvD2IVEDvBkZa7a4vgTDE_SIZiz4c5J_',kind:'photograph',caption:'Away from the board',detail:'Owner-provided photograph · public Drive file'},
  {file:'FB_IMG_1750435821340.jpg',url:'https://drive.google.com/uc?export=view&id=1G1kkfkAO7ONAaoy13pqNEcO5liUnb-5Y',kind:'photograph',caption:'On the road',detail:'Owner-provided photograph · public Drive file'}
];
const grid = document.querySelector('#archive-grid');
const dialog = document.querySelector('#lightbox');
let activeAssets = assets;
let activeIndex = 0;

// Assemble the visual board without a canvas, so it remains available in low-power and no-WebGL environments.
const heroBoard = document.querySelector('#hero-board');
if (heroBoard) {
  for (let rank = 8; rank >= 1; rank--) {
    for (let file = 0; file < 8; file++) {
      const square = document.createElement('span');
      square.className = `square ${(rank + file) % 2 ? 'dark' : ''}`;
      if (file === 0) square.dataset.rank = rank;
      heroBoard.append(square);
    }
  }
}

function renderArchive() {
  // Each card is built from the same record used by the full-screen viewer.
  grid.innerHTML = '';
  assets.forEach((asset, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'archive-card';
    button.dataset.kind = asset.kind;
    button.setAttribute('aria-label', `${asset.caption}. Open image.`);
    const image = document.createElement('img');
    image.src = asset.url;
    image.alt = asset.caption;
    image.loading = 'lazy';
    const caption = document.createElement('span');
    caption.className = 'archive-caption';
    caption.innerHTML = `<b>${asset.kind.toUpperCase()}</b><small>${asset.caption}</small>`;
    button.append(image, caption);
    button.addEventListener('click', () => openLightbox(index));
    grid.append(button);
  });
}

function openLightbox(index) {
  // The native dialog gives the archive a keyboard-friendly focus trap for free.
  activeIndex = index;
  activeAssets = assets;
  updateLightbox();
  dialog.showModal();
}

function updateLightbox() {
  const asset = activeAssets[activeIndex];
  const image = dialog.querySelector('figure img');
  image.src = asset.url;
  image.alt = asset.caption;
  dialog.querySelector('figcaption').textContent = `${asset.caption} · ${asset.detail}`;
  dialog.querySelector('.lightbox-counter').textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${assets.length}`;
}

function stepLightbox(direction) {
  // Wrapping at either end keeps the viewer feeling like a continuous album.
  activeIndex = (activeIndex + direction + assets.length) % assets.length;
  updateLightbox();
}

document.querySelectorAll('.filter-button').forEach(button => {
  // Filtering hides cards rather than rebuilding them, so the current archive stays lightweight.
  button.addEventListener('click', () => {
    document.querySelector('.filter-button.active')?.classList.remove('active');
    button.classList.add('active');
    const filter = button.dataset.filter;
    document.querySelectorAll('.archive-card').forEach(card => {
      card.classList.toggle('hidden', filter !== 'all' && card.dataset.kind !== filter);
    });
  });
});

dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
dialog.querySelector('.lightbox-prev').addEventListener('click', () => stepLightbox(-1));
dialog.querySelector('.lightbox-next').addEventListener('click', () => stepLightbox(1));
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
document.addEventListener('keydown', event => {
  if (!dialog.open) return;
  if (event.key === 'ArrowRight') stepLightbox(1);
  if (event.key === 'ArrowLeft') stepLightbox(-1);
});

const menuButton = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('.mobile-nav');
// On small screens the menu button owns both the visual state and the ARIA state.
menuButton.addEventListener('click', () => {
  const isOpen = mobileNav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  menuButton.textContent = isOpen ? '×' : '☰';
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  mobileNav.classList.remove('open');
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation');
  menuButton.textContent = '☰';
}));

document.querySelectorAll('.image-open').forEach(button => {
  button.addEventListener('click', () => {
    const index = assets.findIndex(asset => asset.file === button.dataset.image);
    if (index >= 0) openLightbox(index);
  });
});

renderArchive();
