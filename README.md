# alexiscolin.com

Personal portfolio & resume website — [alexiscolin.com](https://alexiscolin.com)

## Stack

Vanilla HTML / CSS / JavaScript — no framework, no build step.

| File | Role |
|------|------|
| `index.html` | Single-page structure |
| `style.css` | All styles (responsive, dark mode, animations) |
| `scroll.js` | Nav, skills rendering, counters, interactions, keyboard shortcuts, terminal easter egg |
| `i18n.js` | FR / EN translations and language switching |
| `skills-data.js` | Skills catalogue, shared by the site and the CV |
| `cv.html` `cv.css` `cv.js` | Print view of the CV — wording reused from `i18n.js` |
| `cv-refs.enc` | Referees, AES-GCM encrypted — unlocked in `cv.html` with a passphrase |
| `refs-crypto.js` | `cv-refs.enc` format — decrypted by the CV, re-encrypted by the terminal's `refs` command |
| `_headers` | Security + cache HTTP headers served by Cloudflare Pages |
| `scripts/check-headers.py` | Asserts no file matches two `_headers` blocks setting the same header |

## Features

- **Bilingual** — FR / EN toggle with smooth fade transition
- **Dark mode** — system preference + manual override, persisted in `localStorage`
- **Sticky nav** — appears on scroll with backdrop blur, active section tracking
- **Responsive** — mobile-first, tested down to 320px
- **Skills** — dynamic grid with proficiency levels and usage duration
- **Timeline** — git-style branching for multi-role positions
- **Contact form** — AJAX via Formspree, client-side validation
- **Privacy** — no cookies at all; traffic measured with Cloudflare Web Analytics, so no consent banner
- **CV** — one source: `cv.html` reuses the site's own wording and skills, and prints straight to PDF from the browser
- **References** — shipped as AES-GCM ciphertext and decrypted in the page with a passphrase, so a static host never exposes the referees' contact details
- **Terminal easter egg** — fake zsh shell (`` ` `` / `$` or the `>_` footer button) with ~15 commands to browse the CV, open socials, switch lang/theme and navigate sections

## Development

No dependencies to install. Open `index.html` directly in a browser or serve locally:

```bash
npx serve .
```

## Deployment

Hosted on Cloudflare Pages, built from the `main` branch — no build command, output directory `/`. Pushing to `main` deploys automatically; every pull request gets its own preview URL, gated behind a Cloudflare Access policy.

`.github/workflows/lighthouse-live.yml` audits the deployed site after each push to `main`. It waits on the `Cloudflare Pages` check run rather than a `deployment_status` event — Cloudflare does not use the GitHub Deployments API. It asserts the response headers with `curl` before scoring: Lighthouse weights `csp-xss` and `uses-long-cache-ttl` at 0, so category scores cannot police headers on their own.

HTTP response headers (security + cache) live in `_headers`. The `www` → apex redirect and the `alexiscolin.fr` → `.com` redirect are Cloudflare Redirect Rules, not repo files — `_redirects` cannot match a hostname.
