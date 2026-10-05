# thetransitionzone-landing

Pre-launch landing site for **RallyProof**: pickleball paddle reviews from verified owners. A home page, five guides, a guides index and a 404 page, built with [Hugo](https://gohugo.io/) and served by GitHub Pages at https://rallyproof.app/. The signup forms post to Formspree.

No theme, no Node, no npm. Hugo does the whole build.

## Preview

```sh
hugo server --buildFuture --buildDrafts --port 8000
# open http://localhost:8000
```

In Claude Code, use the `hugo` launch configuration in `.claude/launch.json`, which runs the same command.

## Production build

```sh
hugo --gc --minify --environment production --panicOnWarning
```

The site lands in `public/` (git-ignored). Hugo `0.158.0` or newer is required; `hugo.yaml` pins the minimum.

## Where things live

| Path | What it holds |
|---|---|
| `hugo.yaml` | Site URL, title, output formats (`llms.txt`), sitemap, and `params`: Formspree endpoint, GoatCounter URL, OG image, theme colours, CTA label, launch notice strip (`notice`), 404 copy |
| `content/_index.md` | Home page title, description and OG title |
| `content/guides/_index.md` | Guides index copy and the end-of-guide CTA text |
| `content/guides/<slug>.md` | One guide each |
| `data/*.yaml` | Every list on the home page (see below) |
| `layouts/` | Templates. `_partials/` for shared pieces, `_markup/` for Markdown render hooks |
| `assets/css/main.css` | The one stylesheet. Tokens in section 1, shared components in section 3 |
| `assets/js/site.js` | All behaviour: footer year, Formspree wiring, ripple, join-button loading, floating button, filter chips, durability slider, bag cards, reveal on scroll |
| `assets/sprite.svg` | The one source for the logo mark and icons. Templates render them with `_partials/icon.html` |
| `static/` | Copied as is: icons, OG image, web manifest, `CNAME` |

## Guide front matter

```yaml
---
title: "Pickleball Paddle Thickness: 13 vs 14 vs 16mm"   # <title>, cards, breadcrumbs. Max 48 chars
h1: "Pickleball paddle thickness: 13mm vs 14mm vs 16mm"  # page heading, if it differs from title
description: "..."   # meta description. Max 160 chars
card: "..."          # blurb on the guide cards and in llms.txt
intro: "..."         # the lead paragraph
date: 2026-10-05     # first published
lastmod: 2026-10-05  # the visible "Updated" date and the sitemap lastmod
weight: 2            # order on the cards and in "More guides"
---
```

Change `lastmod` when you change a guide. Link to another guide with `[text]({{< relref "/guides/<slug>" >}})`, so a renamed guide breaks the build instead of the link. Markdown tables get the `.table-wrap` markup from the render hook.

A guide with a future `date` builds locally (the preview runs `--buildFuture`) but stays out of the production site until that date.

## Data files

| File | Feeds |
|---|---|
| `nav.yaml` | Nav links, the nav button target, footer links |
| `paddles.yaml` | Every sample paddle: brand, model, price, lifespan, scores. The other files refer to paddles by id |
| `answer_card.yaml` | The "Find the paddle" card: question, chips, picks, rank lines. The page also emits it as JSON for `site.js` |
| `reviews.yaml` | Example review cards |
| `timeline.yaml` | The durability timeline |
| `bag.yaml` | The "Your Bag" cards |
| `compare.yaml` | The compare table: columns, rows, which way is better |
| `faq.yaml` | The visible FAQ and its FAQPage JSON-LD |

All numbers on the home page are sample data until launch, and the page says so next to each block.

## Deploy

`.github/workflows/pages.yml` builds the site on each push, pull request and manual run. It reads the Hugo version from `hugo.yaml`, runs the production build, and checks `public/` for missing files, template code and broken internal links.

The `deploy` job runs only on a push to `main` when the repository variable `DEPLOY_ENABLED` is `true`. If the variable is not set, the workflow builds and does not publish.

Settings, Pages, Source must be "GitHub Actions". The custom domain is set in Settings, Pages, Custom domain. GitHub ignores `static/CNAME` for Actions deploys, but the build check keeps it.

To roll back, revert the commit and push, or set `DEPLOY_ENABLED` to `false` to stop new deploys.

## Wiring up Formspree

The endpoint is `params.formspree` in `hugo.yaml`. To use a new form, create it at https://formspree.io, paste its URL there, and push. The first submission triggers Formspree's email confirmation. Export submissions as CSV from the Formspree dashboard when you are ready to email people.

## SEO checklist after deploy

1. Add `https://rallyproof.app/` to Google Search Console and Bing Webmaster Tools, then submit `https://rallyproof.app/sitemap.xml`.
2. Request indexing for `/` and `/guides/` in Search Console.
3. Refresh link previews with the Facebook Sharing Debugger and LinkedIn Post Inspector.
