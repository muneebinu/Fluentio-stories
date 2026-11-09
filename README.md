# Fluentio Stories

A German reading and vocabulary workspace for learners from A1 to B2, built with React and Vite.

## Long-form reading library

- The deployment build mirrors up to 150 substantial German-language texts from German Wikisource into the site's own `public/books` directory. The reader loads those local files, so a book marked **Read inside Fluentio** does not wait for a third-party text download.
- The mirror collects complete works from Wikisource categories for novels, novellas, stories, fairy tales, legends, fables and anecdotes. Short entries and fragments under the minimum text length are excluded.
- Each locally hosted work includes a source-page URL and its title/author metadata where available. The UI displays word count and an approximate page count (250 words per reading page), and includes a **Long reads (40+ pages)** filter.
- Suggested A1–A2, B1 and B2 shelves are genre-based reading challenges, not official CEFR classifications. Historical German can be difficult even in fairy tales and fables; use the word lookup while reading.
- A separate live German Wikisource search remains available for additional works that are not in the local mirror. Some entries are fragments or contents pages; Fluentio checks for substantial text before opening them.
- The InfoBooks German PDF collection is linked as an additional discovery source. A free download does not automatically grant Fluentio permission to rehost a PDF; verify each title's rights and licence before copying or redistributing it.

## Reader and vocabulary

- Open full texts inside Fluentio without pasting anything.
- Hover over or click words in a passage to request an English meaning and German dictionary information.
- Translation tries a browser-accessible Google translation endpoint first and MyMemory as a fallback. The Google endpoint is unofficial and may change; MyMemory has provider usage limits.
- German Wiktionary's MediaWiki API supplies dictionary extracts where available.
- Successful lookups are cached locally for faster repeat access.
- Save readings and vocabulary in the current browser, practise words with flashcards, and export vocabulary as CSV.
- Browser speech synthesis reads German words and passages aloud.
- The optional paste/upload workflow remains available for text the learner is permitted to use.
- Grammar library and Chrome/Edge Manifest V3 web-reader extension are also included.

## Content, licensing and attribution

German Wikisource contains public-domain and Creative Commons works. Fluentio retains each text's original source attribution and links back to the individual source page. Check the source page for the specific licence and attribution/share-alike requirements before reuse or redistribution. Copyright status can differ by country.

The InfoBooks page lists free-to-download PDFs, but that does not grant Fluentio a blanket right to republish every title. External publisher materials are linked, not copied into Fluentio Stories.

## Data and technical limitations

- Saved vocabulary and readings are stored in browser `localStorage`; they are not synced between devices.
- Dictionary and translation services are third-party services. Their availability, rate limits, CORS policies and responses can change. Translations are aids, not guaranteed linguistic judgments.
- The local book count depends on the substantial full texts available in the selected Wikisource categories at mirror time.
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

GitHub Pages deployment is configured through GitHub Actions. The deployment workflow runs `scripts/mirror-german-library.mjs` before building.
