# Branding checklist — what Tünde must supply

The site is fully functional with placeholders. Replace these to launch.

## 1. Identity (5 min — config-driven)

Edit `brand.config.json`, then run `node scripts/apply-brand.mjs`:

- [ ] `siteName` — public brand name (now: "Tünde Ingatlan")
- [ ] `ownerName` — her name as it appears in texts (now: "Moka Tünde")
- [ ] `domain` — final domain (now: example.com)
- [ ] `email` / `phone` — real contact data
- [ ] `facebook` / `instagram` — profile URLs
- [ ] `listingsUrl` — the INGATLANOK button target (now: "#")
- [ ] `legal.*` — company name, address, registration + tax numbers
      (these fill the impresszum automatically)

## 2. Photos (drop-in file replacement, keep filenames + dimensions)

Portraits: DONE — all previous-owner photos (R62 portrait series, bt*,
IMG_1115*) were replaced with crops of `moka-tunde-profile.jpg` (2026-07-09).
Interior photos (R62_5900, R62_6587-2, e1088008*, unsplash images) were kept.
If higher-quality/varied portraits arrive later, replace the same filenames
at the same dimensions.

Generated placeholders to replace with real graphics:

- [ ] Logos: `assets/images/2022/06/logo-telibe*` (dark),
      `cropped-logo-feher*` (white), `logovirag*` + `cropped-logovirag*`
      (brand mark + favicons)
- [ ] Instagram tiles: `assets/images/2022/07/insta-feed-*.png`
- [ ] Listing cards: `assets/images/2025/06/*-768x768.png`,
      `assets/images/2026/03/listing-sablon-768x768.png`

## 3. Content

- [ ] Rólam bio text (home + /rolam/) — currently the old bio with the name swapped
- [ ] Testimonials — replace "Minta Ügyfél" placeholders with real, permissioned quotes
- [ ] Blog — the 4 posts + 2 news pages are sample content; replace or delete
- [ ] Legal pages — placeholder values are marked `[ÍGY]`; have a lawyer review
      the GDPR boilerplate before launch

## 4. Launch

- [ ] Remove the `noindex, nofollow` robots meta from all pages
      (`grep -rl 'noindex' --include='*.html' .`)
- [ ] Add real analytics if wanted (old GA + FB pixel were removed)
- [ ] Wire the kapcsolat form to a form service (it's display-only now)
- [ ] `npm run check` must pass; deploy with `vercel deploy --prod`
