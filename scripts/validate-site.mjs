import { readFile, access, stat } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const html = await readFile(resolve(dist, 'index.html'), 'utf8');

const required = ['styles.css', 'site.js', 'assets/hero-mehfil.webp', 'assets/vertical-garden.webp', 'assets/lotus-medallion.webp', 'assets/mughal-frieze.webp', 'assets/mughal-branch-rail.webp', 'assets/parchment-texture.webp', 'assets/peacock-left.webp', 'assets/peacock-right.webp', 'assets/sitar-mark.webp', 'assets/sitar-mark.png'];
for (const relative of required) {
  const file = resolve(dist, relative);
  await access(file);
  if ((await stat(file)).size === 0) throw new Error(relative + ' is empty');
}

const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]));
for (const match of html.matchAll(/href="#([^"]+)"/g)) {
  if (!ids.has(match[1])) throw new Error('Missing anchor target #' + match[1]);
}

for (const token of ['<main', '<nav', '<h1', 'prefers-reduced-motion', 'aria-expanded', 'contact-form', 'Essentials of Sitar', 'kiransohailazeemi1994@gmail.com', 'PECHS Block 6', 'PKR 8,000', 'Merukhand']) {
  const source = token === 'prefers-reduced-motion' ? await readFile(resolve(dist, 'styles.css'), 'utf8') : html;
  if (!source.includes(token)) throw new Error('Required site feature is missing: ' + token);
}

if (/<svg\b/i.test(html)) throw new Error('Inline SVG artwork is not allowed in this design');
if (html.includes('mughal-ornament')) throw new Error('Obsolete full peacock ornament is still referenced');
console.log('Validated static site, anchors, assets, interactions and reduced-motion support.');
