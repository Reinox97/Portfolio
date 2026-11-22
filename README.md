# Ifeoluwa Olatunde — Portfolio

Personal portfolio site. Static HTML, CSS and JavaScript, no build step.

| URL | File |
| --- | --- |
| `/` | `index.html` — landing page (name loader, scroll-pinned screens, case studies, experience, contact) |
| `/about` | `about.html` |
| `/case-studies` | `case-studies.html` |
| `/case-studies/settlement-control-room` | `case-studies/settlement-control-room.html` |
| `/case-studies/compliance` | `case-studies/compliance.html` |
| `/contact` | `contact.html` |

Shared files in `assets/`:

- `site.css`, `site.js` — styles and behaviour for the inner pages (the home page keeps its own inline code)
- `pt.js` — page transitions: the page closes on a hairline and the next one opens from it
- `links.js` — your email, LinkedIn and CV links, used by every page. Leave one empty and its buttons show "Coming soon".
- images for the case studies and the portrait

The name loader plays on every load and reload of the home page; arriving from another page of the site skips straight in.

## Run locally

Serve the folder (clean URLs like `/about` need Vercel-style routing):

```
npx serve .
```

then open http://localhost:3000 (`serve` resolves `/about` to `about.html`, like Vercel).

## Deploy

Hosted on Vercel. Every push to `main` deploys to production. `vercel.json` turns on clean URLs.
