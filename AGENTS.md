# Agent guide — moka-tunde

Static site, no build step, no framework. Serve the repo root and it works.

## Commands

- `npm run dev` — local server on :8900
- `npm run check` — link/asset integrity check. Run after ANY file move,
  rename, or reference edit. Must print "all local references OK".

## Ground rules

1. **Never change how pages look** unless explicitly asked. This site's value
   is its exact design.
2. **`assets/vendor/` is read-only** — minified WordPress/Elementor output.
   If styling must change, override it in a new stylesheet linked after the
   vendor ones, don't edit vendor files.
3. Elementor's per-page CSS lives at `assets/images/elementor/css/post-*.css`
   (historic WordPress location, kept to avoid mass rewrites). The mapping
   is: post-40=home, post-43=szolgaltatasok, post-45=referenciak,
   post-47=rolam, post-49=kapcsolat.
4. All asset references are root-absolute (`/assets/...`). Page-to-page links
   are directory-style with trailing slashes (`/rolam/`). Keep both
   conventions.
5. Each page is a self-contained `index.html` — header/footer markup is
   duplicated on every page (no templating). A change to nav/footer must be
   applied to all 21 pages; script it, then run `npm run check`.
6. The contact form (kapcsolat) posts to WordPress admin-ajax, which doesn't
   exist here — it is display-only. If a working form is needed, wire it to a
   form service and say so in the commit.

## Verification

For visual changes, screenshot the affected page before/after at 1440px
(Playwright, fullPage) and pixel-diff. Zero unintended diff is the bar.
