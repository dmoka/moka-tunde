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

Portraits of the previous owner — replace with Tünde's photos:

- [ ] `assets/images/2022/06/R62_*.jpg` and `assets/images/2022/07/R62_*.jpg`
      — professional portrait series used on home/rólam/kapcsolat
- [ ] `assets/images/2026/03/bt*.jpg`, `IMG_1115*.jpeg`, `e1088008*.jpg`
- [ ] Check every size variant (`-300x200` etc.) of a photo you replace, or
      regenerate variants at the listed dimensions.

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
