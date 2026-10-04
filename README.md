# N2 Keigo SRS

Spaced-repetition web app for JLPT N2 keigo (敬語). Static site (no build step), deployed as a Cloudflare Worker with static assets.

- Live: https://n2-keigo.espi-code.workers.dev
- Deploy: `npx wrangler deploy`
- Deck: `keigo-seed.js` (verb-form cards + scenario / error-spotter / pattern-builder questions)
- Validate the deck before deploying: `node tools/validate.js`
- Two item types share one 9-level SRS:
  - **pair** cards (flash -> multiple choice -> typed recall), e.g. 食べる・飲む (尊敬語) -> 召し上がる
  - **quiz** items (always multiple choice, N2 style): who's acting, error spotter, pattern builder
- Practice mode: free 10-question drills by type (does not touch SRS levels, but feeds the Progress screen).
- Progress and weak-spot stats are stored in the browser (`localStorage` key `n2keigo.v1`); export/import in Settings.
- Add cards from Settings -> Add (format shown in the app, parsed by `parse.js`).
