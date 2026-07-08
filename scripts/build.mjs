// Syncs partials/header.html and partials/footer.html into every page.
// Edit a partial, run `node scripts/build.mjs`, and all 21 pages get the
// change. The script also marks the active nav item per page.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';

const header = readFileSync('partials/header.html', 'utf8');
const footer = readFileSync('partials/footer.html', 'utf8');

const pages = [];
(function walk(d) {
  for (const e of readdirSync(d)) {
    if (['.git', 'node_modules', 'assets', 'scripts', 'partials'].includes(e)) continue;
    const p = join(d, e);
    statSync(p).isDirectory() ? walk(p) : (e === 'index.html' && pages.push(p));
  }
})('.');

const activate = (html, pageUrl) => {
  // main nav <li> whose link matches this page gets the active classes
  const liRe = new RegExp(
    `<li class="(menu-item[^"]*)"([^>]*)>\\s*<a href="${pageUrl.replace(/[/\\]/g, m => '\\' + m)}" class="elementor-item"`, 'g');
  return html.replace(liRe, (m, cls, rest) =>
    `<li class="${cls} current-menu-item current_page_item"${rest}><a href="${pageUrl}" aria-current="page" class="elementor-item elementor-item-active"`);
};

let n = 0;
for (const p of pages) {
  const url = '/' + relative('.', dirname(p)).split(sep).join('/').replace(/^\.$/, '') ;
  const pageUrl = url === '/.' || url === '/' ? '/' : url + '/';
  let h = activate(header, pageUrl);
  if (pageUrl === '/') h = h.replace('<img width="1567"', '<img fetchpriority="high" width="1567"');
  const s = readFileSync(p, 'utf8');
  let ns = s.replace(/<header data-elementor-type="header"[\s\S]*?<\/header>/, () => h);
  ns = ns.replace(/<footer data-elementor-type="footer"[\s\S]*?<\/footer>/, () => activate(footer, pageUrl));
  if (ns !== s) { writeFileSync(p, ns); n++; }
}
console.log(`synced partials into ${n}/${pages.length} pages`);
