# Belicza Tünde Ingatlan

Static website for beliczatundeingatlan.hu — a real-estate agent's site,
originally built with WordPress/Elementor, now maintained as a plain static site.

## Quick start

```sh
npm run dev     # serves the site at http://localhost:8900
npm run check   # verifies every local link/asset reference resolves
```

No build step. What's in the repo is what gets served.

## Structure

```
/                      one folder per page, each with an index.html
  index.html           home page
  szolgaltatasok/      services
  rolam/               about
  referenciak/         references
  kapcsolat/           contact
  blog/                blog index (posts live under /2023/...)
  ...                  legal pages (impresszum, suti-kezeles, etc.)
assets/
  images/              photos & uploaded media (year/month folders)
  fonts/               Google Fonts CSS (roboto.css, ...) + font files
  vendor/              WordPress/Elementor CSS+JS — generated code, treat as read-only
scripts/
  check-links.mjs      reference integrity checker (npm run check)
```

## Editing rules

- **Content/text changes**: edit the page's `index.html` directly.
- **Images**: add under `assets/images/`, reference with root-absolute paths
  (`/assets/images/...`).
- **`assets/vendor/` is generated Elementor output** — don't hand-edit it.
  Page-specific styles live in `assets/images/elementor/css/post-*.css`
  (Elementor kept them under uploads; left as-is to preserve rendering).
- Always run `npm run check` after moving or renaming anything.

## Deploy

Hosted on Vercel (project `moka-tunde`). Deploy with `vercel deploy --prod`.
`vercel.json` keeps `cleanUrls` off and trailing slashes on — the HTML relies
on directory-style URLs.

## Provenance

Mirrored from the live WordPress site on 2026-07-08, then restructured
(flat page tree, organized assets, root-absolute references, dead WP head
links removed). All 21 pages were screenshot-diffed against the original
mirror to confirm zero visual change. Content and images belong to the site
owner — do not publish without permission.
