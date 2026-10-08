import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { createServer } from 'vite';

const dist = path.resolve('dist');
const htmlPath = path.join(dist, 'index.html');
const sourcePath = path.resolve('public/site.html');
const [builtHtml, sourceContent, games, certificates, tournaments, archive] = await Promise.all([
  readFile(htmlPath, 'utf8'),
  readFile(sourcePath, 'utf8'),
  readFile(path.resolve('src/games.json'), 'utf8').then(JSON.parse),
  readFile(path.resolve('src/certificates.json'), 'utf8').then(JSON.parse),
  readFile(path.resolve('src/tournaments.json'), 'utf8').then(JSON.parse),
  readFile(path.resolve('src/archive-images.json'), 'utf8').then(JSON.parse),
]);

const escapeHtml = (value = '') => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const gameFallback = `<section class="games-section" id="games" aria-labelledby="games-title"><div class="section-kicker"><span>THE GAME ARCHIVE</span><span class="kicker-line"></span><span>GM + IM OPPONENTS</span></div><div class="games-intro"><div><p class="eyebrow gold-text">SIX RECORDS FROM THE BOARD</p><h2 id="games-title">Measured against<br><em>the best.</em></h2></div><p>Selected tournament games against grandmasters and international masters. Each record links to its source.</p></div><ul class="game-fallback">${games.map(game => `<li><strong>${escapeHtml(game.title)} · ${escapeHtml(game.opponentTitle)} ${escapeHtml(game.opponent)}</strong><span>${escapeHtml(game.event)} · ${escapeHtml(game.year)} · ${escapeHtml(game.format)} · ${escapeHtml(game.result)} (${escapeHtml(game.outcome)} for Vivek)</span><a href="${escapeHtml(game.source)}" target="_blank" rel="noreferrer">${escapeHtml(game.sourceLabel)} ↗</a></li>`).join('')}<li><strong>Gujarat Open 2026 · Round 8</strong><span>Vivek Sharma vs Mukesh Mandloi · 1–0 · 47 moves</span><a href="/games/vivek-sharma-vs-mukesh-mandloi/">Open the complete annotated game replay →</a></li></ul></section>`;
const certificateFallback = `<div class="certificate-fallback" aria-label="Certificate archive">${certificates.map((cert, index) => `<figure><a href="/images/${encodeURIComponent(cert.file)}"><img src="/images/${encodeURIComponent(cert.file)}" alt="${escapeHtml(cert.caption)}" width="${cert.width}" height="${cert.height}" loading="lazy"></a><figcaption>${String(index + 1).padStart(2, '0')} · ${escapeHtml(cert.caption)}</figcaption></figure>`).join('')}</div>`;
const rootMarker = '<div id="root"><!-- prerender inserts crawlable site content here --></div>';
if (!builtHtml.includes(rootMarker)) throw new Error('Could not find the SEO prerender root marker in dist/index.html');
const content = sourceContent.replace('<div id="games-app"></div>', gameFallback).replace('<div id="certificate-app"></div>', certificateFallback);
const rootHtml = builtHtml.replace(rootMarker, `<div id="root">${content}</div>`);
await writeFile(htmlPath, rootHtml);

const vite = await createServer({ configFile: path.resolve('vite.config.js'), server: { middlewareMode: true }, appType: 'custom' });
try {
  const { default: SeoPage, seoRoutes, getPageSeo } = await vite.ssrLoadModule('/src/seo-pages.jsx');
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Person', '@id': 'https://www.viveksharmachess.world/#vivek-sharma',
    name: 'Vivek Sharma', url: 'https://www.viveksharmachess.world/', image: 'https://www.viveksharmachess.world/images/vivek-sharma-chess-player-profile.webp',
    description: 'Indian chess player with FIDE ID 45046328. FIDE lists an Arena International Master title in FIDE Online Arena; no over-the-board title is listed.',
    jobTitle: 'International Chess Player', nationality: { '@type': 'Country', name: 'India' },
    identifier: { '@type': 'PropertyValue', propertyID: 'FIDE ID', value: '45046328' },
    sameAs: ['https://ratings.fide.com/profile/45046328', 'https://chessprime.com/players/player/814778/', 'https://www.snoopchess.com/snoop/otb/45046328', 'https://chessarchive.net/en/player/MLDMBaPEgk/sharma-vivek'],
  };
  const personScript = `<script type="application/ld+json">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`;
  const sitemapRoutes = [...new Set(seoRoutes.map(route => getPageSeo(route).canonical).concat(['https://www.viveksharmachess.world/']))];
  const sitemap = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...sitemapRoutes.map(url => `  <url><loc>${url}</loc></url>`), '</urlset>'].join('\n');
  await writeFile(path.join(dist, 'sitemap.xml'), sitemap);
  for (const route of seoRoutes) {
    const meta = getPageSeo(route);
    const rendered = renderToString(React.createElement(SeoPage, { path: route }));
    const schema = `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'WebPage', name: meta.title, description: meta.description, url: meta.canonical, about: { '@id': 'https://www.viveksharmachess.world/#vivek-sharma' } }).replace(/</g, '\\u003c')}</script>`;
    const routeHtml = rootHtml
      .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(meta.title)}</title>`)
      .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${escapeHtml(meta.description)}">`)
      .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${escapeHtml(meta.canonical)}">`)
      .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${escapeHtml(meta.title)}">`)
      .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${escapeHtml(meta.description)}">`)
      .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${escapeHtml(meta.canonical)}">`)
      .replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${escapeHtml(meta.title)}">`)
      .replace(/<meta name="twitter:description" content="[^"]*">/, `<meta name="twitter:description" content="${escapeHtml(meta.description)}">`)
      .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>/, `${personScript}${schema}`)
      .replace(`<div id="root">${content}</div>`, `<div id="root">${rendered}</div>`);
    const out = path.join(dist, route.replace(/^\/+|\/+$/g, ''), 'index.html');
    await mkdir(path.dirname(out), { recursive: true });
    await writeFile(out, routeHtml);
  }
  console.log(`Prerendered home page and ${seoRoutes.length} React routes, ${tournaments.length} tournaments, ${archive.length} archive images, ${games.length + 1} game records, and ${certificates.length} certificates.`);
} finally {
  await vite.close();
}
