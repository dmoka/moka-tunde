// Rebuilds the SEO block in every page's <head> and writes sitemap.xml.
//
//   node scripts/seo.mjs          rewrite pages + sitemap.xml (part of `npm run build`)
//   node scripts/seo.mjs --check  exit 1 if any page or the sitemap is out of date
//                                 (part of `npm run check`)
//
// Per page, the script reads <title> and the first <meta name="description">,
// then removes every old SEO tag (robots, description, canonical, og:*,
// article:*, twitter:*, generator, all JSON-LD) and inserts one clean block
// between <!-- seo:start --> and <!-- seo:end --> right after </title>.
// To change a page's search title or description: edit <title> or the
// description meta inside that block, then run `npm run build`.
// Site-wide facts (person, business, noindex pages) live in seo.config.json.
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';
import { execFileSync } from 'node:child_process';

const CHECK = process.argv.includes('--check');
const cfg = JSON.parse(readFileSync('seo.config.json', 'utf8'));
const O = cfg.origin;
const abs = (u) => (/^https?:\/\//.test(u) ? u : O + u);

const pages = [];
(function walk(d) {
  for (const e of readdirSync(d)) {
    if (['.git', 'node_modules', 'assets', 'scripts', 'partials'].includes(e)) continue;
    const p = join(d, e);
    statSync(p).isDirectory() ? walk(p) : e === 'index.html' && pages.push(p);
  }
})('.');

const urlOf = (p) => {
  const d = relative('.', dirname(p)).split(sep).join('/');
  return d === '' ? '/' : `/${d}/`;
};

const decode = (s) =>
  s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n));
const attr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const first = (re, s) => (s.match(re) || [])[1];

const gitAddDate = (p) => {
  try {
    const out = execFileSync('git', ['log', '--diff-filter=A', '--format=%aI', '--', p], { encoding: 'utf8' }).trim();
    return out ? out.split('\n').pop() : null;
  } catch { return null; }
};

const person = {
  '@type': 'Person', '@id': `${O}/#person`, name: cfg.person.name, jobTitle: cfg.person.jobTitle,
  worksFor: { '@type': 'Organization', name: cfg.person.worksFor },
  telephone: cfg.person.telephone, email: cfg.person.email,
  image: abs(cfg.person.image), url: abs(cfg.person.url), sameAs: cfg.person.sameAs,
};
const business = {
  '@type': 'RealEstateAgent', '@id': `${O}/#business`, name: cfg.business.name, url: `${O}/`,
  logo: abs(cfg.business.logo), image: abs(cfg.person.image),
  telephone: cfg.person.telephone, email: cfg.person.email,
  areaServed: cfg.business.areaServed.map((name) => ({ '@type': 'AdministrativeArea', name })),
  founder: { '@id': `${O}/#person` }, sameAs: cfg.person.sameAs,
  hasOfferCatalog: {
    '@type': 'OfferCatalog', name: 'Szolgáltatások',
    itemListElement: cfg.business.services.map((name) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name } })),
  },
};
const website = {
  '@type': 'WebSite', '@id': `${O}/#website`, url: `${O}/`, name: cfg.siteName, inLanguage: 'hu',
  publisher: { '@id': `${O}/#business` },
};

const STRIP = [
  /\s*<!-- seo:start[\s\S]*?<!-- seo:end -->/g,
  /\s*<meta\s+(?:name|property)="(?:robots|description|generator|twitter:[^"]*|og:[^"]*|article:[^"]*|fb:[^"]*)"[^>]*>/g,
  /\s*<link\s+rel="(?:canonical|shortlink)"[^>]*>/g,
  /\s*<!--\s*(?:All in One SEO|\/?\s*AIOSEO|This site is optimized with the Yoast|\/ Yoast SEO)[^>]*-->/g,
];
const LD = /\s*<script type="application\/ld\+json"[^>]*>[\s\S]*?<\/script>/g;

const sitemap = [];
const stale = [];
const today = new Date().toISOString().slice(0, 10);

for (const p of pages.sort()) {
  const url = urlOf(p);
  if (cfg.skip.includes(url)) continue;
  const src = readFileSync(p, 'utf8');
  const hEnd = src.indexOf('</head>');
  let head = src.slice(0, hEnd);
  const body = src.slice(hEnd);

  const title = first(/<title>([\s\S]*?)<\/title>/, head);
  if (!title) { console.error(`no <title>: ${p}`); process.exitCode = 1; continue; }
  const desc = first(/<meta\s+name="description"\s+content="([^"]*)"/, head);
  const ogImage = first(/<meta\s+property="og:image"\s+content="([^"]+)"/, head);
  const isPost = url.startsWith('/blog/') && url !== '/blog/';
  const published = first(/property="article:published_time"\s+content="([^"]+)"/, head)
    || first(/"datePublished":"([^"]+)"/, src) || gitAddDate(p) || `${today}T00:00:00+00:00`;
  const modified = first(/property="article:modified_time"\s+content="([^"]+)"/, head)
    || first(/"dateModified":"([^"]+)"/, src) || published;

  const index = !cfg.noindex.includes(url);
  const canonical = abs(url);
  const name = decode(title).replace(/\s+[-–|]\s+Moka Tünde\s*$/, '').trim();
  const description = desc ? decode(desc) : undefined;
  const image = ogImage ? abs(ogImage) : abs(cfg.person.image);

  let page;
  if (isPost) {
    page = {
      '@type': 'BlogPosting', '@id': `${canonical}#article`, headline: name, description,
      image, datePublished: published, dateModified: modified, inLanguage: 'hu',
      author: { '@id': `${O}/#person` }, publisher: { '@id': `${O}/#business` },
      mainEntityOfPage: canonical, isPartOf: { '@id': `${O}/#website` },
    };
  } else {
    const type = url === '/rolam/' ? 'ProfilePage' : url === '/kapcsolat/' ? 'ContactPage' : 'WebPage';
    page = {
      '@type': type, '@id': `${canonical}#webpage`, url: canonical, name: decode(title), description,
      inLanguage: 'hu', isPartOf: { '@id': `${O}/#website` },
      ...(url === '/' ? { about: { '@id': `${O}/#business` } } : {}),
      ...(type === 'ProfilePage' ? { mainEntity: { '@id': `${O}/#person` } } : {}),
    };
  }
  const crumbs = [{ name: 'Kezdőlap', item: `${O}/` }];
  if (isPost) crumbs.push({ name: 'Blog', item: `${O}/blog/` });
  if (url !== '/') crumbs.push({ name, item: canonical });
  const graph = [website, business, person, page];
  if (crumbs.length > 1) {
    graph.push({
      '@type': 'BreadcrumbList', '@id': `${canonical}#breadcrumb`,
      itemListElement: crumbs.map((c, i) => ({ '@type': 'ListItem', position: i + 1, ...c })),
    });
  }
  const ld = JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })
    .replace(/</g, '\\u003c');

  const tags = [
    '<!-- seo:start — generated by scripts/seo.mjs (npm run build). Edit the title tag or the description meta below, then rebuild. -->',
    desc !== undefined && `<meta name="description" content="${desc}">`,
    `<meta name="robots" content="${index ? 'index, follow, max-image-preview:large' : 'noindex, follow'}">`,
    `<link rel="canonical" href="${canonical}">`,
    '<meta property="og:locale" content="hu_HU">',
    `<meta property="og:site_name" content="${attr(cfg.siteName)}">`,
    `<meta property="og:type" content="${isPost ? 'article' : 'website'}">`,
    `<meta property="og:title" content="${title}">`,
    desc !== undefined && `<meta property="og:description" content="${desc}">`,
    `<meta property="og:url" content="${canonical}">`,
    `<meta property="og:image" content="${attr(image)}">`,
    isPost && `<meta property="article:published_time" content="${published}">`,
    isPost && `<meta property="article:modified_time" content="${modified}">`,
    '<meta name="twitter:card" content="summary_large_image">',
    `<script type="application/ld+json">${ld}</script>`,
    '<!-- seo:end -->',
  ].filter(Boolean).map((t) => `\t${t}`).join('\n');

  for (const re of STRIP) head = head.replace(re, '');
  head = head.replace(LD, '');
  head = head.replace(/(<title>[\s\S]*?<\/title>)/, `$1\n${tags}`);
  const out = head + body.replace(LD, '');

  if (out !== src) {
    stale.push(p);
    if (!CHECK) writeFileSync(p, out);
  }
  if (index) sitemap.push({ loc: canonical, lastmod: isPost ? modified.slice(0, 10) : null });
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemap.map((u) => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}</url>`).join('\n')}
</urlset>
`;
const oldXml = existsSync('sitemap.xml') ? readFileSync('sitemap.xml', 'utf8') : '';
if (xml !== oldXml) {
  stale.push('sitemap.xml');
  if (!CHECK) writeFileSync('sitemap.xml', xml);
}

if (CHECK) {
  if (stale.length) {
    console.error(`SEO out of date (${stale.length}): ${stale.join(', ')}\n→ run \`npm run build\` and commit the result`);
    process.exit(1);
  }
  console.log(`seo OK (${sitemap.length} URLs in sitemap.xml)`);
} else {
  console.log(`seo: updated ${stale.length} files, sitemap.xml has ${sitemap.length} URLs`);
}
