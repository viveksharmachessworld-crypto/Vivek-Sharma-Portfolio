# Vivek Sharma — chess portfolio

This is a dependency-free, static first build of Vivek Sharma's portfolio. Open `index.html` directly or serve this folder with any static web server. The supplied photographs and scans stay in `My Portfolio Image/`; the site uses them in place without editing the originals.

## Files

- `index.html` — page structure, metadata, structured data
- `styles.css` — responsive editorial styling and CSS perspective chessboard
- `script.js` — archive filtering, lightbox, keyboard controls, mobile menu
- `ASSET-INVENTORY.md` — inventory and story mapping for every local image

There is no npm install or build step. Google Fonts are loaded from Google Fonts; the rest of the experience is local. If the font host is unavailable, system serif and sans-serif fallbacks are used.

## Content and data notes

Ratings and identity are sourced from FIDE's player profile and checked on 7 October 2026. Tournament score and rating change are from FIDE's report; finishing place and event field size are from the tournament's Chess-Results table. References are in the inventory.

The project does not yet have a verified PGN for the named round-8 game, confirmed captions for every old certificate/press scan, a confirmed public website domain, or a contact address. It therefore avoids an unverified game replay, exact historical claims from unclear scans, a fabricated canonical URL, and a fabricated contact link. The Gujarat 2026 certificate is shown with the result independently cross-checked against official tournament records.

The opening chessboard uses CSS perspective and HTML squares, keeping it lightweight and available without WebGL. It is an initial progressive visual treatment, not a Three.js scene. Reduced-motion settings are respected, and the key portfolio information remains ordinary HTML.
