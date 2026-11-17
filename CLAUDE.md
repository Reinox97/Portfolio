# Portfolio — notes for Claude Code

Ifeoluwa Olatunde's portfolio. Static HTML/CSS/JS, no build step, no framework. Deployed on Vercel: every push to `main` goes to production (portfolio-reinox.vercel.app). `vercel.json` turns on clean URLs, so links are written as `/about`, `/case-studies/compliance`, etc.

## Run it

```
npx serve .
```
(`serve` resolves `/about` to `about.html`, like Vercel.) Open http://localhost:3000.

## Files

- `index.html` — home page. Has its own inline CSS and JS: the name loader, pinned hero → "At a glance" screen, scroll snapping/gearing, the case list with the docked "Selected case studies" heading, and the pinned How I work / Experience / footer panels on large screens.
- `about.html`, `case-studies.html`, `case-studies/settlement-control-room.html`, `case-studies/compliance.html` — inner pages. They share `assets/site.css` and `assets/site.js`.
- `assets/pt.js` — page transitions (the page closes on a hairline, the next opens from it). Loaded in `<head>` on every page.
- `assets/menu.css`, `assets/menu.js` — mobile menu (below 760px). Built from the header's own links.
- `assets/links.js` — email, LinkedIn and CV links for every page. Empty value = buttons show "Coming soon".
- The header and footer markup is repeated in each HTML file. Change all five when editing them.

## Design rules

- Fonts: Plus Jakarta Sans (display), DM Sans (text).
- Colours are CSS variables at the top of `index.html` and `assets/site.css` (white background, ink #16181C, olive accent #8BAA3C / #5E7A1E, hairline rules #DEDDD8).
- Motion only runs when `html` has the `anim` class (set in `<head>` unless the visitor prefers reduced motion). Everything must still be fully visible without it.
- Reveals: put `data-r` on a block; children use `.r-up`, `.rule`, `.split` (word-by-word), `.wipe` (image wipe), with `--d` for delay.
- The loader plays on every load/reload of the home page, and is skipped only when arriving from another page of the site.
- Check both desktop (1440×900) and phone (390×844) before pushing.

## Open items

- Real email, CV link and LinkedIn URL go in `assets/links.js`.
- Case studies 03–07 have no pages yet; they link to the contact section as "Request a walkthrough".
- Copy to confirm: Settlement/Compliance timelines (Figma frames disagree), Parthian revenue (₦1B vs $1B), Settlement impact figures (55% / 90% read like they belong to another project), Format 3 description.

## Source designs

Figma file `2D5VPGcZs0D0bNeYjoRLpp` (Ife's Portfolio), section "IO Portfolio — from Claude Design": Home, About, Case Studies, and the two case study frames.
