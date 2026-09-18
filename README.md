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
| `cookie-banner.js` | GDPR cookie consent + Google Analytics loader |

## Features

- **Bilingual** — FR / EN toggle with smooth fade transition
- **Dark mode** — system preference + manual override, persisted in `localStorage`
- **Sticky nav** — appears on scroll with backdrop blur, active section tracking
- **Responsive** — mobile-first, tested down to 320px
- **Skills** — dynamic grid with proficiency levels and usage duration
- **Timeline** — git-style branching for multi-role positions
- **Contact form** — AJAX via Formspree, client-side validation
- **GDPR** — cookie consent banner, GA loaded only on acceptance
- **Terminal easter egg** — fake zsh shell (`` ` `` / `$` or the `>_` footer button) with ~15 commands to browse the CV, open socials, switch lang/theme and navigate sections

## Development

No dependencies to install. Open `index.html` directly in a browser or serve locally:

```bash
npx serve .
```

## Deployment

Hosted on GitHub Pages via the `main` branch. Pushing to `main` deploys automatically.
