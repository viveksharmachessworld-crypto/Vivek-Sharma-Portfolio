// Keeping the archive in one place makes captions, filters, and the lightbox agree.
const assets = [
  {file:'20261007_165057.jpg',kind:'press',caption:'Framed chess press archive',detail:'Owner-provided photograph · framed clippings'},
  {file:'FB_IMG_1749380355265.jpg',kind:'photograph',caption:'Award ceremony',detail:'Owner-provided tournament photograph'},
  {file:'FB_IMG_1749380486047.jpg',kind:'photograph',caption:'Holding an award',detail:'Owner-provided tournament photograph'},
  {file:'FB_IMG_1749380787849.jpg',kind:'photograph',caption:'Away from the board',detail:'Owner-provided personal photograph'},
  {file:'FB_IMG_1750435821340.jpg',kind:'photograph',caption:'On the road',detail:'Owner-provided personal photograph'},
  {file:'Scan_20261007_164728.jpg',kind:'press',caption:'Bihar chess press coverage',detail:'Owner-provided newspaper clipping'},
  {file:'Scan_20261007_164745.jpg',kind:'press',caption:'Chess in the local press',detail:'Owner-provided newspaper clipping'},
  {file:'Scan_20261007_164802.jpg',kind:'press',caption:'Patna chess event coverage',detail:'Owner-provided newspaper clipping'},
  {file:'Scan_20261007_164818.jpg',kind:'press',caption:'Chess event photo archive',detail:'Owner-provided press and event scan'},
  {file:'Scan_20261007_164837.jpg',kind:'certificate',caption:'Chess certificate',detail:'Owner-provided certificate scan'},
  {file:'Scan_20261007_164857.jpg',kind:'certificate',caption:'Tournament certificate',detail:'Owner-provided certificate scan'},
  {file:'Scan_20261007_164914.jpg',kind:'certificate',caption:'Tournament certificate',detail:'Owner-provided certificate scan'},
  {file:'Scan_20261007_164932.jpg',kind:'press',caption:'Chess press clippings',detail:'Owner-provided newspaper archive scan'},
  {file:'Scan_20261007_164955.jpg',kind:'certificate',caption:'Gujarat Open · Category B · 2026',detail:'Certificate records second place and 8.5/10'},
  {file:'Scan_20261007_165014.jpg',kind:'certificate',caption:'Barauni Open Chess Championship',detail:'Owner-provided certificate scan'},
  {file:'Scan_20261007_165031.jpg',kind:'press',caption:'Local chess press clippings',detail:'Owner-provided newspaper archive scan'},
  {file:'Scan_20261007_165108.jpg',kind:'press',caption:'Chess press coverage',detail:'Owner-provided newspaper clipping'},
  {file:'Scan_20261007_165127.jpg',kind:'press',caption:'Bihar chess championship coverage',detail:'Owner-provided newspaper clipping'},
  {file:'Scan_20261007_165141.jpg',kind:'press',caption:'Chess press archive',detail:'Owner-provided newspaper archive scan'},
  {file:'Scan_20261007_165159.jpg',kind:'press',caption:'Chess as a career · press feature',detail:'Owner-provided newspaper clipping'},
  {file:'Scan_20261007_165219.jpg',kind:'certificate',caption:'Diksha International Championship',detail:'Owner-provided certificate scan'},
  {file:'Scan_20261007_165242.jpg',kind:'certificate',caption:'Bihar State Junior Championship',detail:'Owner-provided certificate scan'},
  {file:'Scan_20261007_165328.jpg',kind:'certificate',caption:'National Junior Open',detail:'Owner-provided certificate scan'},
  {file:'Scan_20261007_165401.jpg',kind:'photograph',caption:'At the chessboard',detail:'Owner-provided tournament photograph'},
  {file:'Scan_20261007_165421.jpg',kind:'certificate',caption:'Bihar State Championship',detail:'Owner-provided certificate scan'},
  {file:'Scan_20261007_165439.jpg',kind:'certificate',caption:'Bihar State Championship',detail:'Owner-provided certificate scan'},
  {file:'Scan_20261007_165517.jpg',kind:'certificate',caption:'Bihar State Rapid Chess Championship',detail:'Owner-provided certificate scan'},
  {file:'Scan_20261007_165540.jpg',kind:'certificate',caption:'East Central Railway sports certificate',detail:'Owner-provided certificate scan'},
  {file:'Scan_20261007_170003.jpg',kind:'certificate',caption:'Bihar State Championship',detail:'Owner-provided certificate scan'},
  {file:'Scan_20261007_170047.jpg',kind:'press',caption:'Chess press coverage',detail:'Owner-provided newspaper clipping'},
  {file:'Scan_20261007_170248.jpg',kind:'press',caption:'Chess award ceremony · press coverage',detail:'Owner-provided press photograph and clipping'},
  {file:'Scan_20261007_170316.jpg',kind:'press',caption:'Chess in the local press',detail:'Owner-provided newspaper clipping'},
  {file:'Scan_20261007_171003.jpg',kind:'certificate',caption:'Bihar State Senior Chess Championship',detail:'Owner-provided certificate scan'}
];
const imageRoot = 'My%20Portfolio%20Image/';
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
    image.src = imageRoot + encodeURIComponent(asset.file);
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
  image.src = imageRoot + encodeURIComponent(asset.file);
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
