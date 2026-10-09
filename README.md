# Vivek Sharma — chess portfolio

An original chess-themed portfolio built with React, Express and MongoDB. It pairs a CSS-perspective chessboard with scroll-led storytelling, an interactive 3D certificate gallery, a complete image archive, a searchable archive of games against titled players, and optional ambient music generated in the browser. Sound is off until a visitor chooses to enable it. Reduced-motion preferences and mobile layouts are supported.

## Run locally

1. Install Node.js 20 or later.
2. Run `npm install`.
3. Start the React/Vite frontend with `npm run dev`.
4. In a second terminal, start the Express API with `npm run dev:api`.
5. Open the local URL Vite prints.

The frontend works without MongoDB by using the bundled certificate manifest. To use MongoDB locally, set `MONGODB_URI` and optionally `MONGODB_DB` in the environment before starting the API. On request, the API upserts the checked-in certificate and tournament manifests, then returns the MongoDB records; bundled JSON remains the offline fallback.

Create a production bundle with `npm run build`; `npm start` serves that bundle and the Express API. Vercel uses `vercel.json` to publish the Vite bundle and route `/api/*` to the Express function. Set `MONGODB_URI` and optional `MONGODB_DB` in the Vercel project's environment settings to enable MongoDB Atlas. Without a database URI, the portfolio uses the checked-in certificate manifest.

## Project structure

- `src/entry.jsx` — React app, music interaction, animated certificate gallery and interactive game archive
- `src/styles.css` — responsive styling, 3D transforms, motion and reduced-motion rules
- `src/certificates.json` — 18 certificate records used by the archive and MongoDB API
- `src/games.json` — six game records against grandmasters and international masters
- `server.js`, `api/index.js` — Express API and Vercel function entry
- `public/site.html` — portfolio content parsed into React elements
- `public/images/` — 66 optimized WebP assets served from the portfolio domain (65 archive items plus profile portrait)
- `script.js` — archive filters, full-size viewer and mobile navigation
- `src/seo-pages.jsx` — React pages for profile, tournament, game, ratings and image archive routes; prerendered as crawlable HTML during builds
- `scripts/prerender.mjs` — injects page content, games and certificates into the initial HTML for crawlers and no-JS visitors
- `ASSET-INVENTORY.md` — image inventory and source notes

The 66 optimized WebP images are served from the deployed portfolio origin, so visitors do not need access to Google Drive permissions. The archive includes all 35 newly added image conversions. Design references informed interaction principles only; their layouts, assets, branding and code were not reused.

Ratings and identity are sourced from FIDE's player profile. Tournament results are linked to the cited records. Captions stay broad where scan text is unclear.
