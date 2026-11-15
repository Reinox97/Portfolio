# Ifeoluwa Olatunde — Portfolio

Personal portfolio site. Static HTML, CSS and JavaScript, no build step.

| URL | File |
| --- | --- |
| `/` | `index.html` — landing page (name loader, scroll-pinned screens, case studies, experience, contact) |
| `/about` | `about.html` |
| `/case-studies` | `case-studies.html` |
| `/case-studies/settlement-control-room` | `case-studies/settlement-control-room.html` |
| `/case-studies/compliance` | `case-studies/compliance.html` |

Shared files in `assets/`:

- `site.css`, `site.js` — styles and behaviour for the inner pages (the home page keeps its own inline code)
- `pt.js` — page transitions: the page closes on a hairline and the next one opens from it
- `links.js` — your email, LinkedIn and CV links, used by every page. Leave one empty and its buttons show "Coming soon".
- images for the case studies and the portrait

The name loader plays once per visit; coming back to the home page from another page skips straight in.

## Run locally

Serve the folder (clean URLs like `/about` need Vercel-style routing):

```
npx vercel dev
```

or `npx serve .` (it also resolves `/about` to `about.html`).

## Deploy

Hosted on Vercel. Every push to `main` deploys to production. `vercel.json` turns on clean URLs.
