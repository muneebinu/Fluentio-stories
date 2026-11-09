# Fluentio Stories

A German reading and vocabulary workspace for learners from A1 to B2, built with React and Vite.

## Long-form reading library

- The deployment build mirrors selected German plain-text editions from Project Gutenberg and German Wikisource into the site's own `public/books` directory. The app reads those local files, so a book marked **Read inside Fluentio** does not depend on a live third-party file download.
- The mirror script uses Project Gutenberg's documented robot-harvest route, with a two-second request delay, and selects older German-language works. Each mirrored text is retained with its source header and licence notice; the in-app reader shows the text cleanly and links to the original ebook landing page.
- The curated beginner shelf includes:
  - A1: *Märchen und Erzählungen für Anfänger, Erster Teil* (Gutenberg #35794), a historic learner reader of about 163 printed pages.
  - A2: *Märchen und Erzählungen für Anfänger, Zweiter Teil* (Gutenberg #45189), the 202-page continuation reader.
  - B1 reading challenges: *Der Schimmelreiter*, *Die Verwandlung*, *Immensee* and *In der Strafkolonie*.
  - B2: *Der Prozess*.
- The deployment script also selects up to 150 substantial Wikisource works across novels, novellas, stories, fairy tales, legends and crime fiction. The actual hosted count is written to `public/books/index.json` and shown in the UI; it is not a hard-coded promise.
- The library includes a **Long reads (40+ pages)** filter based on an approximate 250 words per reading page. This is an estimate, not a publisher page count.
- A separate searchable German Wikisource catalogue is available for additional works. Some entries are fragments or contents pages; Fluentio rejects entries without substantial readable text.
- The B1/B2 labels on classic literature are practical reading estimates, not official publisher CEFR classifications. Original literature is not automatically beginner-friendly.
- The InfoBooks German PDF collection is linked as a discovery source. A free download does not automatically grant Fluentio permission to rehost that PDF; check each title's rights and licence before copying or redistributing it.

## Reader and vocabulary

- Open locally hosted full texts inside Fluentio without pasting anything.
- Hover over or click words in a passage to request an English meaning and German dictionary information.
- Translation tries a browser-accessible Google translation endpoint first and MyMemory as a fallback. The Google endpoint is unofficial and may change; MyMemory has provider usage limits.
- German Wiktionary's MediaWiki API supplies dictionary extracts where available.
- Successful lookups are cached locally for faster repeat access.
- Save readings and vocabulary in the current browser, practise words with flashcards, and export vocabulary as CSV.
- Browser speech synthesis reads German words and passages aloud.
- The optional paste/upload workflow remains available for text the learner is permitted to use.
- Grammar library and Chrome/Edge Manifest V3 web-reader extension are also included.

## Content, licensing and attribution

The two Guerber learner readers are historical works published in the 1890s. Project Gutenberg lists them as public domain in the United States. Project Gutenberg explicitly notes that its copyright determinations are US-based; users outside the US should check local law. The other selected classics are original German works by authors who died before 1955; individual ebook notices and local law still need to be checked.

Project Gutenberg asks automated clients to use its robot-harvest route and its recommended delay. The build script follows that route for the selected learner readers, and mirrors Wikisource texts with source-page attribution. Each title links to its original edition. Some translations can have separate copyright; check each work before reuse or redistribution.

External publisher materials are linked, not copied into Fluentio Stories.

## Data and technical limitations

- Saved vocabulary and readings are stored in browser `localStorage`; they are not synced between devices.
- Dictionary and translation services are third-party services. Their availability, rate limits, CORS policies and responses can change. Translations are aids, not guaranteed linguistic judgments.
- The locally hosted book count depends on the books available through the source catalogue and the deployment mirror step.
- Not every Wikisource entry has a complete transcription; Fluentio rejects short entries, but the source may still fail or be incomplete.
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
