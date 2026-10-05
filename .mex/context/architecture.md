---
name: architecture
description: How the RallyProof landing site is laid out, how data flows into pages, and how it builds and deploys.
edges:
  - target: context/conventions.md
    condition: when writing templates, content, data or CSS
last_updated: 2026-10-05
---

# Architecture

**What it is.** A pre-launch landing site for RallyProof: home page, guides index, five guides, 404. Static HTML from Hugo, served by GitHub Pages at https://rallyproof.app/ (`static/CNAME`).

**Layout.**

```
hugo.yaml            config + params (site values)
content/             _index.md (home), guides/_index.md, guides/<slug>.md
data/                lists and sample data for the home page
layouts/             baseof, home, 404, guides/{list,single}, home.llms.txt, robots.txt, _partials/, _markup/
assets/              css/main.css, js/site.js, sprite.svg (Hugo Pipes: minify + fingerprint)
static/              icons, og-default.*, manifest.webmanifest, CNAME
```

**Data flow.**

- Home: `home.html` renders sections from `data/*.yaml`. `paddles.yaml` is the single source for paddle facts; `answer_card`, `bag`, `compare` and `timeline` refer to paddles by id. The answer-card data is also emitted as JSON (`#ac-data`) and `site.js` reads it to re-rank rows.
- FAQ: `data/faq.yaml` feeds the visible FAQ and the FAQPage JSON-LD in `head.html`.
- Guides: Markdown in `content/guides/`. Cards, "More guides", `llms.txt` and the sitemap all range over the section's `.Pages` (weight order).
- SEO: `head.html` builds meta, OG, Twitter and JSON-LD (`jsonify | safeJS`) per page kind. Sitemap is Hugo's built-in one (lastmod from front matter). `robots.txt` and `llms.txt` are templates.
- Icons: `assets/sprite.svg` is fingerprinted and referenced by `<use href>` from `_partials/icon.html`. The "RP" in the mark is outlined paths, so it does not depend on a font.

**Build.** `hugo --gc --minify --environment production --panicOnWarning` writes `public/`. Preview: `hugo server --buildFuture --buildDrafts --port 8000` (`.claude/launch.json`, config `hugo`). Hugo >= 0.158.0 (`module.hugoVersion.min`).

**Deploy.** GitHub Actions builds with Hugo and publishes `public/` to GitHub Pages (Pages source: GitHub Actions). Forms post to Formspree; analytics is GoatCounter.
