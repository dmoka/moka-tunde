# AGENTS.md — development guide

Read this fully before changing anything. It encodes everything a previous
agent learned the hard way.

## What this is

A **static portfolio website template** for a real-estate agent. It began as
a WordPress/Elementor site, was mirrored to static HTML, restructured, and
then white-labeled. There is **no framework, no build pipeline, no server
code** — the repo root is the web root, and every page is a self-contained
`index.html`. Two small Node scripts provide the only automation
(partials sync + rebranding); plain files do everything else.

Design fidelity is the product. The #1 rule: **never change how anything
looks unless explicitly asked.**

## Commands

```sh
npm run dev     # serve locally at http://localhost:8900 (npx serve)
npm run check   # link/asset integrity + SEO freshness — must print "all local references OK" and "seo OK"
npm run build   # sync partials into all pages, then rebuild every page's SEO block + sitemap.xml
npm run brand   # apply brand.config.json identity values across the site
git push origin main    # deploy: a push a main-re automatikusan buildel a Vercelen
```

There is no install step for the site itself; `npx serve` fetches on demand.
Node ≥ 18 required for the scripts.

## Repository map

```
index.html                    home page (also the canonical page example)
szolgaltatasok/ rolam/        one folder per page, each holds one index.html
referenciak/ kapcsolat/
blog/                         blog index; posts live under /blog/<slug>/
impresszum/ suti-kezeles/ …   legal pages (GDPR boilerplate + placeholder data)
partials/
  header.html, footer.html    single source of truth for nav + footer
assets/
  images/                     photos & media, organized year/month (WP legacy)
    elementor/css/post-*.css  ← per-PAGE styles, despite living under images/
  fonts/                      google-fonts CSS (roboto.css …) + font binaries
  vendor/                     WordPress/Elementor CSS+JS — READ-ONLY
scripts/
  build.mjs                   partials → pages sync + active-nav injection
  apply-brand.mjs             brand.config.json → site text replacement
  check-links.mjs             reference integrity checker
brand.config.json             identity values (name, contacts, legal data…)
brand.lock.json               currently-applied values — NEVER edit by hand
TODO-BRAND.md                 launch checklist for the future real brand
vercel.json                   cleanUrls off, trailingSlash on — keep both
```

## The five invariants

1. **`assets/vendor/` is read-only.** It is minified Elementor/WordPress
   output. To change styling, add an override stylesheet loaded *after* the
   vendor ones (see "Styling changes" below) — never edit vendor files.
2. **Header/footer only via `partials/` + `npm run build`.** The build
   overwrites the `<header data-elementor-type="header">…</header>` and
   `<footer …>…</footer>` blocks in every page. Direct edits there are lost
   on the next build. Everything *outside* those two blocks is per-page
   content and safe to edit directly.
3. **Identity only via `brand.config.json` + `npm run brand`.** Don't
   hand-edit the brand name, phone, email, socials, or legal data in pages —
   the script replaces lock-values with config-values and would miss your
   hand-made variants. It handles unicode-escaped (`Tünde`),
   URL-encoded, and UPPERCASE forms automatically.
4. **Path conventions:** asset references are root-absolute
   (`/assets/images/...`); page links are root-absolute directory URLs with
   trailing slash (`/rolam/`). Never introduce relative `../` links.
5. **SEO tags only via the `<!-- seo:start -->…<!-- seo:end -->` block + `npm run build`.**
   `scripts/seo.mjs` regenerates robots, canonical, og:*, article:* and the
   JSON-LD in every page from `<title>` + the description meta, and writes
   `sitemap.xml`. Never add a robots/canonical/og/JSON-LD tag by hand — the
   build deletes it. Site-wide facts and the noindex list: `seo.config.json`.
6. **`npm run check` must be green before any commit.** It catches broken
   refs from moves/renames/typos. It scans href/src and CSS `url()`.

## Common tasks

### Edit text on a page
Open that page's `index.html`, find the text, change it. Watch for
Elementor's split spans: a leading capital may be wrapped separately
(`<span>M</span><span>oka …`), so search for a fragment, not the full
sentence. If the change matters for search, also update `<title>` and the
description meta inside the seo block, then `npm run build` (it regenerates
og:* and JSON-LD from those two).

### Change nav or footer
Edit `partials/header.html` or `partials/footer.html`, run `npm run build`.
The script injects `current-menu-item`/`elementor-item-active` on the li/a
whose href matches each page (main pages only; legal/blog pages have no
active item — that matches the original site). Verify with
`grep -c current-menu-item index.html` → expect 4 (header nav + footer nav).

### Add a new page
1. Copy the closest existing page folder (e.g. `cp -r rolam ujoldal`).
2. Edit content, `<title>` and the description meta in the seo block
   (unique per page, ~150 characters, says what the page is about).
3. Page-specific Elementor styles: the copied page links
   `/assets/images/elementor/css/post-<id>.css`. Reusing the source page's
   CSS is fine; for diverging styles create your own stylesheet instead.
4. Add the page to `partials/header.html`/`footer.html` if it belongs in
   the nav, then `npm run build`.
5. `npm run build` (adds the page to `sitemap.xml`), `npm run check`, visual
   check via `npm run dev`. A page that must stay out of Google goes into
   `noindex` in `seo.config.json`.

### Add a blog post
Copy an existing post folder under `blog/` (structure `/blog/<slug>/index.html`),
edit content, `<title>` and the description meta. In the seo block, **delete the
two `article:published_time` / `article:modified_time` lines** copied from the
old post — `npm run build` then stamps today's date. Add a card for it on
`blog/index.html` (copy an existing card block). `npm run build`, `npm run check`.

### Styling changes
Create `assets/css/custom.css` (first time: also add
`<link rel="stylesheet" href="/assets/css/custom.css">` just before
`</head>` in every page — script it, or add it to the partials if we later
move more of `<head>` into partials). Put overrides there with selectors at
least as specific as Elementor's. Never edit `assets/vendor/` or the
`post-*.css` files.

### Replace images
Drop-in replacement keeping the exact filename is safest. Images are
referenced in `srcset` at multiple sizes (`name-300x200.jpg` etc.) — replace
every size variant of that image, or update all references. Some images are
also CSS `background-image` in `assets/images/elementor/css/post-*.css`
(relative `../../` paths — these are the exception to the root-absolute
rule; leave the style, swap the file). `npm run check` verifies nothing
dangles.

### Rebrand (template → real client)
Edit `brand.config.json`, run `npm run brand`, then work through
`TODO-BRAND.md` (photos, testimonials, legal review, remove noindex, wire
the form, analytics). The lock file updates itself.

## Page inventory

| URL | Purpose | Elementor CSS |
|---|---|---|
| `/` | home | post-40 |
| `/szolgaltatasok/` | services | post-43 |
| `/referenciak/` | references/listings | post-45 |
| `/rolam/` | about | post-47 |
| `/kapcsolat/` | contact | post-49 |
| `/blog/` | blog index | post-620 |
| `/2023/**` | 4 sample blog posts | per-post |
| `/impresszum/`, `/suti-kezeles/`, `/cookie-policy-eu/`, `/jogi-dokumentaciok/`, `/adatkezelesi-*`, `/erintetti-*` | legal/GDPR | per-page |
| `/elementor-849/`, `/mi-tortenik-most-…/`, `/category/uncategorized/` | legacy WP pages, low value — candidates for deletion if links to them are removed | — |

## Known quirks & gotchas

- **Per-page CSS lives under `assets/images/elementor/css/`** — a WordPress
  legacy (Elementor wrote generated CSS into uploads). Ugly but load-bearing;
  moving it means rewriting refs in all pages. Fine to do, but do it
  deliberately and run `npm run check`.
- **The contact form is display-only.** It posts to WordPress admin-ajax
  which doesn't exist. Wiring it to Formspree/Web3Forms/a serverless
  endpoint is a known TODO.
- **Carousels (testimonials, listing cards) animate** — screenshot diffs on
  home/szolgaltatasok will always show small differences from slide
  position. Not a regression.
- **Placeholder markers**: "Minta Ügyfél N" (testimonials), "MINTA KÉP" /
  "MINTA HIRDETÉS" (generated placeholder PNGs), `[SZÖGLETES ÉRTÉKEK]` in
  legal pages. The portraits (R62_*.jpg, bt*.jpg, IMG_1115*) are real photos
  of the previous owner, kept as stand-ins — flagged in TODO-BRAND.md.
- **The site is indexed by Google since 2026-11-25** (Search Console:
  domain property mokatunde.hu). Pages listed under `noindex` in
  `seo.config.json` stay out: legal pages (they still hold `[VÁLLALKOZÁS NEVE]`
  placeholders), legacy WP pages and orphan duplicates. Every other page is in
  `sitemap.xml`. `robots.txt` allows every crawler, AI crawlers included.
- **Dead-but-harmless strings** exist inside Elementor JSON configs
  (`uploadUrl`, `home_url`, ajax nonces). They don't render and don't run;
  ignore them.
- **jQuery + Elementor frontend JS run the page** (menus, carousels,
  lightbox). If you add interactive elements, vanilla JS in your own file is
  fine; jQuery is already loaded if you want it.

## Verification bar

For any visual-surface change:
1. `npm run check` green.
2. A second `npm run build` reports `0/N` synced and `seo: updated 0 files`
   (idempotency check).
3. Screenshot the affected page at 1440px full-page (Playwright) before and
   after; pixel-diff. Only intended regions may differ. For pure content
   edits, an eyeball comparison is acceptable.
4. Audit greps if you touched identity/brand:
   `grep -ri belicza --include='*.html' .` must return nothing.

## History & provenance

Mirrored from the live WordPress site (2026-07-08), restructured (flat page
tree, organized assets, root-absolute refs), then templatized (identity
config-driven, previous owner's data fully removed, placeholders generated).
Full history is in git. The content and photos still derive from the
original owner's site — the template must not be published as-is beyond
dev/preview until TODO-BRAND.md is completed.
