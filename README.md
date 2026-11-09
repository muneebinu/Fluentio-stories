# Fluentio Stories

A German reading and vocabulary workspace for learners from A1 to B2, built with React and Vite.

## Reading library

- Eight original German short stories are included directly in the app, with A1, A2, B1 and B2 levels.
- A live catalogue connects to German Wikisource. Browse fairy tales, short stories, legends, novellas, novels and anecdotes, search titles, and load available transcriptions into the Fluentio reader.
- The German Wikisource portal reports more than 58,000 works. The catalogue is not CEFR-graded, and transcription availability and quality vary by work.
- External German-learning publishers remain available in a separate source directory.

## Reader and vocabulary

- Open built-in stories and Wikisource texts without pasting anything.
- Hover over or click words to request an English meaning and German dictionary information.
- Translation tries a browser-accessible Google translation endpoint first and MyMemory as a fallback. The Google endpoint is unofficial and may change; MyMemory has provider usage limits.
- German Wiktionary's MediaWiki API supplies dictionary extracts where available.
- Successful lookups are cached locally for faster repeat access.
- Save readings and vocabulary in the current browser, practise words with flashcards, and export vocabulary as CSV.
- Browser speech synthesis reads German words and passages aloud.
- The optional paste/upload workflow remains available for text the learner is permitted to use.
- Grammar library and Chrome/Edge Manifest V3 web-reader extension are also included.

## Content, licensing and attribution

The eight starter stories are original texts written for Fluentio Stories.

The larger reading catalogue is retrieved from German Wikisource. Wikisource includes public-domain and Creative Commons works. Every opened catalogue text links back to its original Wikisource page. Check the individual work's licence and follow its attribution and share-alike requirements before reuse or redistribution. Availability and copyright status can differ by country.

External publisher materials are linked, not copied into Fluentio Stories.

## Data and technical limitations

- Saved vocabulary and readings are stored in browser `localStorage`; they are not synced between devices.
- Dictionary and translation services are third-party services. Their availability, rate limits, CORS policies and responses can change. Translations are aids, not guaranteed linguistic judgments.
- Not every Wikisource entry has a clean, complete transcription.
- The app has no backend, user accounts, shared vocabulary sync, or server-side translation cache.
- The flashcard scheduler is a lightweight interval system, not a validated SM-2 implementation.

## Browser extension

The `browser-extension/` folder contains a Chrome/Edge Manifest V3 extension. It looks up only text selected by the learner on a webpage; it does not bulk-copy publisher pages. See [browser-extension/README.md](browser-extension/README.md) for local installation.

## Development

```bash
npm install
npm run dev
npm run build
```

GitHub Pages deployment is configured through GitHub Actions.
