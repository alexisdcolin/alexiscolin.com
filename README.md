# alexiscolin.com

Personal portfolio & resume website — [alexiscolin.com](https://alexiscolin.com)

## Stack

Vanilla HTML / CSS / JavaScript — no framework, no build step.

| File | Role |
|------|------|
| `index.html` | Single-page structure |
| `style.css` | All styles (responsive, dark mode, animations) |
| `scroll.js` | Nav, skills rendering, timeline, experience tabs, contact form, CV dialog, keyboard shortcuts, terminal easter egg |
| `i18n.js` | FR / EN translations and language switching |
| `skills-data.js` | Skills catalogue, shared by the site and the CV |
| `cv.html` `cv.css` `cv.js` | Print view of the CV — wording reused from `i18n.js` |
| `cv-refs.enc` | Referees, AES-GCM encrypted — unlocked in `cv.html` with a passphrase |
| `refs-crypto.js` | `cv-refs.enc` format — decrypted by the CV, re-encrypted by the terminal's `refs` command |
| `_headers` | Security + cache HTTP headers served by Cloudflare Pages |
| `privacy.html` `404.html` `403.html` | Privacy policy and error pages — French markup, switched to English by an inline script |
| `assets/` | Logo (`favicon.svg`, `favicon.ico`, `icon-180/192/512.png`), `site.webmanifest`, self-hosted fonts, skill logos, photos |
| `scripts/check-headers.py` | Asserts no file matches two `_headers` blocks setting the same header |
| `.github/workflows/` | `ci.yml`: html-validate, lychee, the `_headers` check and Lighthouse on pull requests; `lighthouse-live.yml`: see Deployment |

## Features

- **Bilingual** — FR / EN toggle with smooth fade transition
- **Dark mode** — system preference + manual override, persisted in `localStorage`
- **Fonts** — Space Mono for headings, labels and figures, Space Grotesk for body copy, both self-hosted
- **Logo** — a dot-matrix A, inline in the header: the unlit dots are the page's background dots, the lit ones darken towards the apex and light up row by row on hover. `favicon.svg` is its 3×3 version, with a dark-mode palette
- **Hero** — name, title and city on three lines sized on their column, the pitch under it with a marker drawn on its key words, and the data stack as a timeline beside it
- **Navigation** — always-visible top bar whose pill slides to the active section; a bottom tab bar on phones
- **Responsive** — mobile-first, tested down to 320px
- **Skills** — category tiles rendered from `skills-data.js`, with proficiency meters and usage duration; clicking a skill highlights the roles that used it. Soft skills sit in their own tile, each backed by the experience that shows it
- **Experience** — a timeline of work and studies drawn up to today, then one position at a time in tabs, the consulting assignments grouped under their firm; clicking a skill opens the first position that used it
- **Contact form** — AJAX via Formspree, client-side validation that screen readers announce too
- **Privacy** — no cookies at all; traffic measured with Cloudflare Web Analytics, so no consent banner. `localStorage` only keeps the language, the theme and, once the terminal is opened, its last session
- **CV** — one source: `cv.html` reuses the site's own wording and skills, and prints straight to PDF from the browser. The CV buttons open it in a dialog over the blurred page — `cv.html` in a frame, driven by the buttons beside it through `postMessage`, which also works from a `file://` copy — so `_headers` lets the site frame itself (`frame-ancestors 'self'`, `X-Frame-Options: SAMEORIGIN`) and nobody else; `/cv` still works on its own
- **References** — shipped as AES-GCM ciphertext and decrypted in the page with a passphrase (a field of the CV dialog, or a prompt on `/cv`), so a static host never exposes the referees' contact details
- **Terminal easter egg** — fake zsh shell (`` ` `` / `$` or the `>_` footer button) with 18 commands to browse the CV, open socials, switch lang/theme, navigate sections and ping the Cloudflare edge; `refs` lets the owner edit the encrypted referees. Outside it, `t` toggles the theme, `l` the language, and `1`–`5` jump to the sections numbered 01–05

## Development

No dependencies to install. Open `index.html` directly in a browser or serve the folder — a plain static server has no clean URLs, so on `localhost` and `file://` `i18n.js` points the CV and privacy links at the `.html` files. The references need a server: `fetch()` refuses `file://`.

```bash
python3 -m http.server 4173
```

CSS and JS are cached for a week and busted with `?v=N`: bump it on every change, in every page that loads the file — `style.css` in the four site pages, `i18n.js` and `skills-data.js` in `index.html` and `cv.html`, `refs-crypto.js` in `cv.html` and in `scroll.js`, which loads it for the terminal, `scroll.js` in `index.html`, `cv.css` and `cv.js` in `cv.html`. Images and fonts are cached as immutable: a changed one gets a new name, hence `icon-180/192/512.png`. The printed CV must fit on two A4 pages, references included.

## Deployment

Hosted on Cloudflare Pages, built from the `main` branch — no build command, output directory `/`. Pushing to `main` deploys automatically; every pull request gets its own preview URL, gated behind a Cloudflare Access policy.

`.github/workflows/lighthouse-live.yml` audits the deployed site after each push to `main`. It waits on the `Cloudflare Pages` check run rather than a `deployment_status` event — Cloudflare does not use the GitHub Deployments API. It asserts the response headers with `curl` before scoring: Lighthouse weights `csp-xss` and `uses-long-cache-ttl` at 0, so category scores cannot police headers on their own.

HTTP response headers (security + cache) live in `_headers`. The `www` → apex redirect and the `alexiscolin.fr` → `.com` redirect are Cloudflare Redirect Rules, not repo files — `_redirects` cannot match a hostname.
