import { readFile, writeFile } from 'node:fs/promises';

const htmlPath = new URL('../dist/index.html', import.meta.url);
const sourcePath = new URL('../public/site.html', import.meta.url);
const [html, sourceContent, games, certificates] = await Promise.all([
  readFile(htmlPath, 'utf8'),
  readFile(sourcePath, 'utf8'),
  readFile(new URL('../src/games.json', import.meta.url), 'utf8').then(JSON.parse),
  readFile(new URL('../src/certificates.json', import.meta.url), 'utf8').then(JSON.parse),
]);

const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const gameFallback = `<section class="games-section" id="games" aria-labelledby="games-title"><div class="section-kicker"><span>THE GAME ARCHIVE</span><span class="kicker-line"></span><span>GM + IM OPPONENTS</span></div><div class="games-intro"><div><p class="eyebrow gold-text">SIX RECORDS FROM THE BOARD</p><h2 id="games-title">Measured against<br><em>the best.</em></h2></div><p>Selected tournament games against grandmasters and international masters. Each record links to its source.</p></div><ul class="game-fallback">${games.map(game => `<li><strong>${escapeHtml(game.title)} · ${escapeHtml(game.opponentTitle)} ${escapeHtml(game.opponent)}</strong><span>${escapeHtml(game.event)} · ${escapeHtml(game.year)} · ${escapeHtml(game.format)} · ${escapeHtml(game.result)} (${escapeHtml(game.outcome)} for Vivek)</span><a href="${escapeHtml(game.source)}" target="_blank" rel="noreferrer">${escapeHtml(game.sourceLabel)} ↗</a></li>`).join('')}<li><strong>Gujarat Open 2026 · Round 8</strong><span>Vivek Sharma vs Mukesh Mandloi · 1–0 · 47 moves</span><a href="/games/vivek-sharma-vs-mukesh-mandloi/">Open the complete annotated game replay →</a></li></ul></section>`;
const certificateFallback = `<div class="certificate-fallback" aria-label="Certificate archive">${certificates.map((cert, index) => `<figure><a href="/images/${encodeURIComponent(cert.file)}"><img src="/images/${encodeURIComponent(cert.file)}" alt="${escapeHtml(cert.caption)}" width="${cert.width}" height="${cert.height}" loading="lazy"></a><figcaption>${String(index + 1).padStart(2, '0')} · ${escapeHtml(cert.caption)}</figcaption></figure>`).join('')}</div>`;
const content = sourceContent
  .replace('<div id="games-app"></div>', gameFallback)
  .replace('<div id="certificate-app"></div>', certificateFallback);

const rootMarker = '<div id="root"><!-- prerender inserts crawlable site content here --></div>';
if (!html.includes(rootMarker)) {
  throw new Error('Could not find the SEO prerender root marker in dist/index.html');
}

await writeFile(htmlPath, html.replace(rootMarker, `<div id="root">${content}</div>`));
console.log(`Inserted crawlable portfolio markup, ${games.length + 1} game records, and ${certificates.length} certificates into dist/index.html`);
