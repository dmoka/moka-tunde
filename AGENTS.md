# Agent guide — moka-tunde

Static portfolio template, no framework. Serve the repo root and it works.

## Commands

- `npm run dev` — local server on :8900
- `npm run check` — link/asset integrity check. Run after ANY file move,
  rename, or reference edit. Must print "all local references OK".
- `npm run build` — sync `partials/header.html` + `partials/footer.html`
  into all pages (also sets the active nav item per page). Edit nav/footer
  ONLY via the partials, then run this.
- `npm run brand` — apply `brand.config.json` identity values everywhere
  (name, domain, contacts, socials, legal data). `brand.lock.json` tracks
  what's currently applied — never edit the lock by hand.

## Template state

This is a white-label template: the original owner's identity was removed.
Placeholder markers: "Minta Ügyfél" (testimonials), "MINTA KÉP"/"MINTA
HIRDETÉS" (generated images), `[SZÖGLETES]` values (legal pages). All pages
carry `noindex` until launch. See TODO-BRAND.md for the launch checklist.

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
5. Header/footer live in `partials/` and are synced into all pages by
   `npm run build`. Never edit a header/footer block inside a page directly —
   the next build overwrites it. Everything else in each page's `index.html`
   is that page's own content.
6. The contact form (kapcsolat) posts to WordPress admin-ajax, which doesn't
   exist here — it is display-only. If a working form is needed, wire it to a
   form service and say so in the commit.

## Verification

For visual changes, screenshot the affected page before/after at 1440px
(Playwright, fullPage) and pixel-diff. Zero unintended diff is the bar.
