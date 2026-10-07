// All owner-supplied images are committed with the site and served from this origin.
const assets = [
  {file:'FB_IMG_1749380787849.jpg',kind:'photograph',caption:'On the motorbike',detail:'Owner-provided photograph'},
  {file:'FB_IMG_1750435821340.jpg',kind:'photograph',caption:'With the Thar',detail:'Owner-provided photograph'},
  {file:'20261007_165057.jpg',kind:'press',caption:'Framed chess press archive',detail:'Owner-provided archive'},
  {file:'FB_IMG_1749380355265.jpg',kind:'photograph',caption:'Award ceremony',detail:'Owner-provided photograph'},
  {file:'Scan_20261007_164728.jpg',kind:'press',caption:'Bihar chess coverage',detail:'Newspaper archive scan'},
  {file:'Scan_20261007_164745.jpg',kind:'press',caption:'Local chess coverage',detail:'Newspaper archive scan'},
  {file:'Scan_20261007_164802.jpg',kind:'press',caption:'Patna event coverage',detail:'Newspaper archive scan'},
  {file:'Scan_20261007_164818.jpg',kind:'press',caption:'Chess event coverage',detail:'Press archive scan'},
  {file:'Scan_20261007_164837.jpg',kind:'certificate',caption:'Chess participation certificate',detail:'Owner-provided certificate scan'},
  {file:'Scan_20261007_164857.jpg',kind:'certificate',caption:'Tournament certificate',detail:'Owner-provided certificate scan'},
  {file:'Scan_20261007_164914.jpg',kind:'certificate',caption:'Tournament certificate',detail:'Owner-provided certificate scan'},
  {file:'Scan_20261007_164932.jpg',kind:'press',caption:'Clipped chess coverage',detail:'Newspaper archive scan'},
  {file:'Scan_20261007_164955.jpg',kind:'certificate',caption:'Gujarat Open 2026 · second place',detail:'Category B · 8.5/10'},
  {file:'Scan_20261007_165014.jpg',kind:'certificate',caption:'Barauni Open certificate',detail:'Owner-provided certificate scan'},
  {file:'Scan_20261007_165031.jpg',kind:'press',caption:'Chess press coverage',detail:'Newspaper archive scan'},
  {file:'Scan_20261007_165108.jpg',kind:'press',caption:'Chess press coverage',detail:'Newspaper archive scan'},
  {file:'Scan_20261007_165127.jpg',kind:'press',caption:'Championship coverage',detail:'Newspaper archive scan'},
  {file:'Scan_20261007_165141.jpg',kind:'press',caption:'Chess press archive',detail:'Newspaper archive scan'},
  {file:'Scan_20261007_165159.jpg',kind:'press',caption:'Chess career feature',detail:'Newspaper archive scan'},
  {file:'Scan_20261007_165219.jpg',kind:'certificate',caption:'Diksha International event',detail:'Owner-provided certificate scan'},
  {file:'Scan_20261007_165242.jpg',kind:'certificate',caption:'Bihar State Junior event',detail:'Owner-provided certificate scan'},
  {file:'Scan_20261007_165328.jpg',kind:'certificate',caption:'National Junior Open',detail:'Owner-provided certificate scan'},
  {file:'Scan_20261007_165401.jpg',kind:'photograph',caption:'Playing at the board',detail:'Owner-provided tournament photograph'},
  {file:'Scan_20261007_165421.jpg',kind:'certificate',caption:'Bihar State event',detail:'Owner-provided certificate scan'},
  {file:'Scan_20261007_165439.jpg',kind:'certificate',caption:'Bihar State event',detail:'Owner-provided certificate scan'},
  {file:'Scan_20261007_165517.jpg',kind:'certificate',caption:'Bihar State Rapid event',detail:'Owner-provided certificate scan'},
  {file:'Scan_20261007_165540.jpg',kind:'certificate',caption:'East Central Railway sports record',detail:'Owner-provided certificate scan'},
  {file:'Scan_20261007_170003.jpg',kind:'certificate',caption:'Bihar State event',detail:'Owner-provided certificate scan'},
  {file:'Scan_20261007_170047.jpg',kind:'press',caption:'Chess press coverage',detail:'Newspaper archive scan'},
  {file:'Scan_20261007_170248.jpg',kind:'press',caption:'Award coverage',detail:'Press photograph and clipping'},
  {file:'Scan_20261007_170316.jpg',kind:'press',caption:'Local chess coverage',detail:'Newspaper archive scan'},
  {file:'Scan_20261007_171003.jpg',kind:'certificate',caption:'Bihar State Senior event',detail:'Owner-provided certificate scan'}
];
const imageUrl = file => `My%20Portfolio%20Image/${encodeURIComponent(file)}`;
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
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  mobileNav.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false');
  menuButton.setAttribute('aria-label', 'Open navigation'); menuButton.textContent = '☰';
}));
document.querySelectorAll('.image-open').forEach(button => button.addEventListener('click', () => {
  const index = assets.findIndex(asset => asset.file === button.dataset.image); if (index >= 0) openLightbox(index);
}));
renderArchive();
