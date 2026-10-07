# Vivek Sharma — chess portfolio

This is a dependency-free static portfolio. The page and all 34 owner-provided images live in this repository; image URLs are relative to the site, so visitors receive them from the same public host as the portfolio. Open `index.html` directly or serve this folder with any static web server.

## Files

- `index.html` — page structure, metadata and structured data
- `styles.css` — responsive styling and CSS perspective chessboard
- `script.js` — image archive, filters, lightbox, keyboard controls and mobile menu
- `My Portfolio Image/` — all 34 published JPEG assets
- `ASSET-INVENTORY.md` — image inventory and source notes

There is no npm install or build step. Google Fonts are loaded from Google Fonts; local system font fallbacks remain available if that service is unreachable.

## Content and data notes

Ratings and identity are sourced from FIDE's player profile and checked on 7 October 2026. Tournament score and rating change are from FIDE's report; finishing place and event field size are from the tournament's Chess-Results table. References are in the inventory.

The Google Drive folder contains shortcuts whose source files are no longer available there. The complete originals supplied for the portfolio are committed in `My Portfolio Image/` and served by the website itself. This avoids third-party Drive permissions and deleted-shortcut errors. The image archive contains all 34 files, with photograph, certificate and press filters and a full-size viewer.

The round-8 game has a verified external replay link; the portfolio links to that replay rather than embedding a separate chessboard player. Captions for scans stay broad where small print is unclear. Gujarat 2026 results and the second-place prize are cross-checked against tournament sources.

The opening chessboard uses CSS perspective and HTML squares, keeping it lightweight and available without WebGL. Reduced-motion settings are respected, and the key portfolio information remains ordinary HTML.
