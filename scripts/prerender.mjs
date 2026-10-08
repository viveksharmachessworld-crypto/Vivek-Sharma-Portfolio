import { readFile, writeFile } from 'node:fs/promises';

const htmlPath = new URL('../dist/index.html', import.meta.url);
const sourcePath = new URL('../public/site.html', import.meta.url);
const [html, content] = await Promise.all([
  readFile(htmlPath, 'utf8'),
  readFile(sourcePath, 'utf8'),
]);

const rootMarker = '<div id="root"><!-- prerender inserts crawlable site content here --></div>';
if (!html.includes(rootMarker)) {
  throw new Error('Could not find the SEO prerender root marker in dist/index.html');
}

await writeFile(htmlPath, html.replace(rootMarker, `<div id="root">${content}</div>`));
console.log('Inserted crawlable portfolio markup into dist/index.html');
