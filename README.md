# thetransitionzone-landing

Static placeholder landing page for **TheTransitionZone** — community-driven pickleball paddle reviews.

Single static HTML page hosted on GitHub Pages. Captures interest emails via Formspree.

## Files

- `index.html` — the page
- `style.css` — styles (dark mode by default, light mode via `prefers-color-scheme`)

## Wiring up Formspree

1. Sign up at https://formspree.io and create a new form.
2. Copy the form endpoint (looks like `https://formspree.io/f/xyzabc123`).
3. In `index.html`, replace `REPLACE_WITH_FORMSPREE_ENDPOINT` with that URL.
4. Optional: update the `_next` hidden input to point at a real thank-you URL.
5. Commit and push. The first submission triggers Formspree's email confirmation.

Export submissions as CSV from the Formspree dashboard when you're ready to email people.

## Publishing on GitHub Pages

After pushing to GitHub:

1. Repo Settings → Pages
2. Source: **Deploy from a branch**
3. Branch: `main`, folder: `/ (root)`
4. Save. Site publishes at `https://theflyingcoders.github.io/thetransitionzone-landing/` within a minute.

## Local preview

Any static server works:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```
