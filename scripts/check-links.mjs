// Verifies every local href/src/url() reference in HTML+CSS resolves to a file.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';

const files = [];
(function walk(d) {
  for (const e of readdirSync(d)) {
    if (e === '.git' || e === 'node_modules') continue;
    const p = join(d, e);
    statSync(p).isDirectory() ? walk(p) : (/\.(html|css)$/.test(e) && files.push(p));
  }
})('.');

let bad = 0;
for (const f of files) {
  const s = readFileSync(f, 'utf8');
  for (const m of s.matchAll(/(?:href|src)="([^"#?]+)"|url\((['"]?)([^'")?#]+)\2\)/g)) {
    let ref = m[1] || m[3];
    if (!ref || /^(https?:|mailto:|tel:|data:|\/\/|javascript:)/.test(ref)) continue;
    let p = ref.startsWith('/') ? join('.', ref) : join(dirname(f), ref);
    if (p.endsWith('/')) p = join(p, 'index.html');
    if (!existsSync(p) && !existsSync(p + '/index.html')) {
      console.log(`${f}: broken ref -> ${ref}`);
      bad++;
    }
  }
}
console.log(bad ? `${bad} broken references` : 'all local references OK');
process.exit(bad ? 1 : 0);
