---
name: conventions
description: How templates, content, data and CSS are written for the RallyProof landing site. Load before changing layouts/, content/, data/ or assets/css/main.css.
edges:
  - target: context/architecture.md
    condition: when a change depends on the build, data flow or deploy
last_updated: 2026-10-05
---

# Conventions

## Hugo system

Hugo 0.158+, no theme, underscore layout (`_partials/`, `_markup/`). No `_default/`, `partials/` or `shortcodes/` folders.

**Templates.** `baseof.html` (head, nav, launch notice, main, footer, floating button, analytics; the 404 kind gets none of the chrome), `home.html`, `404.html`, `guides/list.html`, `guides/single.html`, `home.llms.txt` (the `llms` output format), `robots.txt`.

**Partials.** Every partial takes a `dict` and documents its params in a header comment. Need a variation? Add a param. Delete partials nothing calls.

| Partial | Params | Used by |
|---|---|---|
| `head.html` | `page` | baseof. Title, description fallback chain, canonical, OG, Twitter, icons, Pipes CSS/JS with integrity, JSON-LD |
| `nav.html` | none | baseof |
| `notice.html` | `text`, `link_text`, `link_href` (all from `params.notice`) | baseof, right after the nav. Empty `text` renders nothing |
| `footer.html` | none | baseof |
| `analytics.html` | none | baseof (GoatCounter from `params.goatcounter`) |
| `logo.html` | `mark` (rp-mark / rp-mark-dk) | nav, footer |
| `icon.html` | `name`, `size` (optional) | everything that shows an icon or the logo mark |
| `signup-form.html` | `id`, `suffix`, `heading`, `level` (2/3), `text` | home (hero and final CTA) |
| `guide-card.html` | `page` | home, guides list |
| `guide-cta.html` | `text` | guides list, guide single |
| `crumbs.html` | `page` | guides list, guide single |
| `sample-note.html` | `text`, `class` (sample-note default / ac-note) | home (answer card, reviews, timeline, bag + compare). Text is the `note` key in each data file |

**Render hooks.** `render-link.html` (external host: `target="_blank" rel="noopener noreferrer"`), `render-table.html` (wraps tables in `.table-wrap`). Hooks end with `{{- /**/ -}}`: no trailing newline.

**Content.** YAML front matter only. Guides: `title` (max 48 chars), `h1`, `description` (max 160), `card`, `intro`, `date`, `lastmod` (drives "Updated" and the sitemap), `weight` (order). Links between guides use `relref`. A future `date` hides a guide in production on purpose.

**Data.** Every hand-typed list lives in `data/`: `nav`, `paddles` (single source for sample paddle facts; others refer by id), `answer_card`, `reviews`, `timeline`, `bag`, `compare`, `faq`. The FAQ section and the FAQPage JSON-LD read the same `faq.yaml`. The answer card is emitted as `<script type="application/json" id="ac-data">` for `site.js`. Never type a list into a template.

**Copy.** Page copy is Mark's voice: no em dashes, no invented numbers. Sample numbers carry a visible "sample data" note.

**Site values** live in `hugo.yaml` `params`. No hard-coded site URL, Formspree ID or analytics URL in templates.

**Verify.** `hugo --gc --minify --environment production --panicOnWarning` builds clean; one h1 per page, no skipped heading levels; title <= 60 chars and description <= 160 on every page.

## CSS system

One file, `assets/css/main.css`, loaded through Hugo Pipes. Numbered, banner-commented sections; add rules to the right section.

- **Tokens (section 1).** Colours (`--slate`, `--teal*`, `--sun`, `--paper`, `--warm`, `--mute`, `--line*`), on-dark alphas (`--on-dark-*`, `--dark-*`), shadows (`--shadow-*`), radii (`--r-*`), type (`--font`, `--display`, `--mono`), motion (`--spring*`, `--emph`, `--t-*`). No raw hex, shadow or radius in components.
- **Shared components (section 3).** `.morph`, `.btn-sun`, `.card`, `.panel` / `.panel--float`, `.dark-card`, `.badge` / `.badge--pill`, `.avatar` / `.avatar--lg`, `.kicker` / `.kicker--tight`, `.section-head` / `.section-head--flush`, `.accent`. Extend with a modifier or custom property; do not copy rules.
- **Markup contract.** Templates reproduce the class names, ids and aria attributes the CSS and `site.js` depend on. Rename a class in both places or not at all.
- **No inline styles.** Add a class. One light theme today; check contrast (4.5:1 for small text) on paper, warm and slate grounds.
