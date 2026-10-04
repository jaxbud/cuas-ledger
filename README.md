# CUAS Ledger

Sourced, searchable record of counter-drone (C-UAS) contracts, a deep dive on the last twelve months of awards, government statements and contacts, and the contracting outlook for Unified Mechanics.

Live: https://jaxbud.github.io/cuas-ledger/

## Build

```
python3 scripts/merge.py   # data/curated, statements, contacts, ledger -> data/site.json
node build.js              # -> dist/index.html (single self-contained page)
```

Refresh the federal ledger from USAspending.gov:

```
python3 scripts/harvest_usaspending.py
python3 scripts/filter_usaspending.py
```

Pushing to `main` deploys to GitHub Pages through `.github/workflows/pages.yml`.

## Custom domain

`cuasledger.com` was unregistered on 2026-10-03. After registering it, point DNS at GitHub Pages, set the domain in Settings → Pages, and build with `CUSTOM_DOMAIN=cuasledger.com node build.js`.

## Data rules

Every record carries a source URL. Values are labelled as ceiling, obligated, contract value or estimate and are never summed across types. Confidence labels follow the parent project's scale (PUBLISHED, FIELD, VENDOR, ESTIMATE).
