# Fluentio Stories

A German reading and vocabulary workspace for learners from A1 to B2, built with React and Vite.

## Features currently implemented

- Browse and filter a directory of external German-reading publishers by CEFR level.
- Open a distraction-free reading workspace.
- Paste German text or import a plain-text `.txt` file.
- Tap words in a passage to request translation and dictionary information.
- Dictionary lookup integrations:
  - Wiktapi for structured Wiktionary-derived entries, definitions and available inflected forms.
  - German Language API for CEFR vocabulary, part of speech, gender and example sentences.
  - MyMemory as a translation fallback.
  - German Wiktionary MediaWiki API as a dictionary-extract fallback.
- Save reading texts and vocabulary locally in the browser.
- Review saved vocabulary with flashcards and interval-based review scheduling.
- Export saved words as CSV.
- German word and full-passage read-aloud using the browser's speech synthesis engine.\n- Adjustable reading font size.\n- A Chrome/Edge Manifest V3 web-reader extension for selected words and phrases on other webpages, with its own local vocabulary and CSV export.
- Browse a grammar library using the German Language API.
- No account or registration required.

## Browser extension\n\nThe `browser-extension/` folder contains a Chrome/Edge Manifest V3 extension. It looks up only text selected by the learner on a webpage; it does not bulk-copy publisher pages. See [browser-extension/README.md](browser-extension/README.md) for local installation.\n\n## Local-first data

Saved readings and vocabulary are stored in the current browser using `localStorage`. It is not synced between devices and can be lost if browser site data is cleared. CSV export is provided for backups. This version has no user accounts or cloud database.

## API services and limits

- Wiktapi: https://wiktapi.dev/ — public structured Wiktionary-derived API. Data coverage varies by word.
- German Language API: https://rep12.com/docs/ — published demo key is limited to 1,000 requests/day and 10 requests/second. A production key or stable hosted arrangement may be needed for public launch.
- MyMemory: https://mymemory.translated.net/ — external translation service with its own availability and usage policies.
- German Wiktionary: https://de.wiktionary.org/ — fallback dictionary source.

All API calls are made from the visitor's browser in this static build. If a provider changes CORS settings, rate limits, API availability, or terms, the related feature may temporarily stop working. Do not treat third-party dictionary data as infallible.

## Content and copyright

The source directory links to original publishers. Fluentio Stories does not scrape or republish their stories. Free-to-read does not automatically mean free to republish. Use the reader with your own text, public-domain material, or text whose licence permits this use. Otherwise, read the material on the publisher's own website.

## Current limitations / next engineering steps

- Vocabulary and review data are local to one browser; cross-device sync requires a backend and user accounts.
- Review scheduling is a lightweight interval system, not a validated SM-2 implementation.
- German inflection and lemma detection depend on the dictionary provider's returned entry; not every inflected form will resolve.
- Arbitrary websites cannot reliably be imported into the reader because of browser CORS, publisher restrictions and copyright. A browser extension or permitted source integrations would be needed.
- Audio playback uses voices installed in the visitor's browser/device; voice quality and availability vary.
- A stable production deployment should use a backend proxy/cache for API calls, observability, rate limiting and provider credentials where needed.

## Development

```bash
npm install
npm run dev
npm run build
```

GitHub Pages deployment is configured as a manual workflow and remains intentionally separate from development.
