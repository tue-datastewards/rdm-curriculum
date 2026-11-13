# Attribution

## Design system

This site uses the **“This is RDM” brand kit**, version 1.0.0, maintained by the
Data Stewards Team, Library and Information Services, Eindhoven University of
Technology.

- Source: brand kit repository, tag `v1.0.0` (commit `f6c074b`)
- Derived from: *Introduction to Research Data Management*, 2nd edition, 2026
  - DOI: <https://doi.org/10.5281/zenodo.15736840>
- Licence: CC BY-NC-SA 4.0 (see [`LICENSES.md`](LICENSES.md))

### What was copied

- `tokens/tokens.css` → `src/styles/rdm-tokens.css` (unmodified)
- `assets/logos/tue-logo-wordmark-purple.svg`
- `assets/logos/tue-logo-wordmark-white.svg`
- `assets/logos/tue-logo-stacked-purple.svg` (also used as `favicon.svg`)
- `assets/qr/qr-rdm-black.svg` → `qr-rdm.svg`
- `assets/icons/icons.svg` → a filtered sprite containing 10 symbols
- `assets/icons/icon-wallpaper-tile.svg` → `wallpaper-dark.svg`

### Modification

The wallpaper tile was recoloured for use on the purple hero: its fill was
changed from `#6E4061` (pattern on light) to `#4A133C` (pattern on brand). No
other brand asset was modified.

The icon sprite was reduced to the symbols the site actually uses; the symbol
paths are unchanged.

## Course content

Course and module intended learning outcomes, instructional design content and
the original instructional design templates in `word/` come from the TU/e
Research Data Management curriculum team. They remain TU/e material and are not
licensed for external reuse by this repository.

## Typeface

Avenir Next is a commercial typeface by Adrian Frutiger and Akira Kobayashi,
published by Linotype/Monotype. It is not included. The site uses the kit's
fallback stack.

## QR code

The booklet QR code points to <https://edu.nl/jyu76>, the extended digital
version of the RDM booklet. Check that the destination is still current before
printing the page.
