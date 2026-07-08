// Applies brand.config.json values across all pages.
// brand.lock.json records the currently-applied values; the script replaces
// lock-values with config-values in every HTML file, then updates the lock.
// Rebrand = edit brand.config.json, run `node scripts/apply-brand.mjs`.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const config = JSON.parse(readFileSync('brand.config.json', 'utf8'));
const lock = JSON.parse(readFileSync('brand.lock.json', 'utf8'));

// JSON-LD blocks store text with unicode-escaped Hungarian accents
const uesc = s => s.replace(/[-￿]/g, c =>
  '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0'));

const flat = (o, prefix = '') => Object.entries(o).flatMap(([k, v]) =>
  typeof v === 'object' ? flat(v, `${prefix}${k}.`) : [[`${prefix}${k}`, v]]);

const pairs = [];
for (const [key, oldVal] of flat(lock)) {
  const newVal = flat(config).find(([k]) => k === key)?.[1];
  if (newVal === undefined || newVal === oldVal) continue;
  pairs.push([oldVal, newVal]);
  if (uesc(oldVal) !== oldVal) pairs.push([uesc(oldVal), uesc(newVal)]);
  if (encodeURIComponent(oldVal) !== oldVal)
    pairs.push([encodeURIComponent(oldVal), encodeURIComponent(newVal)]);
  pairs.push([oldVal.toUpperCase(), newVal.toUpperCase()]);
}
// longest first so "X Ingatlan" wins over "X"
pairs.sort((a, b) => b[0].length - a[0].length);

const files = [];
(function walk(d) {
  for (const e of readdirSync(d)) {
    if (['.git', 'node_modules', 'assets', 'scripts'].includes(e)) continue;
    const p = join(d, e);
    statSync(p).isDirectory() ? walk(p) : (e.endsWith('.html') && files.push(p));
  }
})('.');

let changed = 0;
for (const f of files) {
  const s = readFileSync(f, 'utf8');
  let ns = s;
  for (const [oldVal, newVal] of pairs) ns = ns.split(oldVal).join(newVal);
  if (ns !== s) { writeFileSync(f, ns); changed++; }
}
writeFileSync('brand.lock.json', JSON.stringify(config, null, 2) + '\n');
console.log(`applied brand to ${changed} files; lock updated`);
