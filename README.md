# Fluentio Stories

A German reading and vocabulary workspace for learners from A1 to B2, built with React and Vite.

## Long-form reading library

- Curated beginner shelf:
  - A1: *Märchen und Erzählungen für Anfänger, Erster Teil* (Gutenberg #35794), a historic learner reader of about 163 printed pages.
  - A2: *Märchen und Erzählungen für Anfänger, Zweiter Teil* (Gutenberg #45189), the 202-page continuation reader.
  - B1 reading challenges: *Der Schimmelreiter*, *Die Verwandlung*, *Immensee* and *In der Strafkolonie*.
  - B2: *Der Prozess*.
- The catalogue also connects to the searchable German Project Gutenberg collection and German Wikisource. Users can search titles/authors, browse by genre, and paginate through full-text entries.
- The catalogue loads one book only when a reader opens it. It does not try to bulk-download thousands of books or mirror another publisher's PDF directory.
- Book cards link to their original editions. The reader checks for a substantial text before opening a Wikisource entry, so short fragments and empty pages are rejected.
- The B1/B2 labels on classic literature are practical reading estimates, not official publisher CEFR classifications. Original literature is not automatically beginner-friendly.
- The InfoBooks German PDF collection is linked as a discovery source. A free download does not automatically grant Fluentio permission to rehost that PDF; check each title's rights and licence before copying or redistributing it.

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

The two Guerber learner readers are historical works published in the 1890s. Project Gutenberg lists them as public domain in the United States. Project Gutenberg explicitly notes that its copyright determinations are US-based; users outside the US should check local law. The other selected classics are original German works by authors who died before 1955; individual ebook notices and local law still need to be checked, especially for translations and later editions.

Fluentio loads texts from their original source at reading time and links back to the source edition. Do not assume that a free PDF on a third-party site can be republished by Fluentio. The InfoBooks page says its titles are shared under different legal bases (public domain, Creative Commons, or rights-holder permission); verify the specific title's licence and scope before rehosting it.

## Data and technical limitations

- Saved vocabulary and readings are stored in browser `localStorage`; they are not synced between devices.
- Dictionary and translation services are third-party services. Their availability, rate limits, CORS policies and responses can change. Translations are aids, not guaranteed linguistic judgments.
- Not every Wikisource entry has a complete transcription; Fluentio rejects short entries, but the source may still fail or be incomplete.
- Project Gutenberg/Gutendex is a community-maintained catalogue with no production uptime guarantee. Text retrieval depends on the source being reachable and permitting browser access.
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
