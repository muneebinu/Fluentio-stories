# Fluentio Stories

A simple German reading room for learners. The homepage is intentionally focused on A1, A2 and B1 stories plus a small shelf of German classics.

## Reading library

- Three original Fluentio storybooks: **Der kleine Schlüssel** (A1), **Ein Sommer in Lindenfeld** (A2), and **Das Licht im Bahnhof** (B1).
- Each story is divided into chapters and opens directly in the in-app reader.
- Three classic works are listed separately for more advanced readers: **Immensee**, **Die Verwandlung**, and **Der Schimmelreiter**. These are original literary works, not graded A1–B1 material.
- The classics are loaded from German Wikisource when selected. Source transcription quality and availability vary; do not treat every external transcription as verified or simplified.
- CEFR labels on original stories are editorial estimates, not official certification.

## Reader tools

- Click a German word to request an English meaning and dictionary information.
- Save vocabulary locally, practise with flashcards, and export vocabulary as CSV.
- Save reading texts in the current browser.
- Browser speech synthesis can read German words and passages aloud.
- Students can paste or upload a text they are permitted to use.

## Important content note

The three original storybooks are currently short, chapter-based learner stories. They are **not yet 50–120 printed pages**. The classic titles are full literary works where the source transcription is available, but their language is substantially harder than A1–B1. Do not describe them as graded readers.

## Data and technical limitations

- Vocabulary and saved readings use browser local storage and do not sync across devices.
- Translation and dictionary data come from third-party services; availability and accuracy can vary.
- The app has no user accounts or cloud sync.
- The flashcard scheduler is a lightweight interval system.

## Development

```bash
npm install
npm run dev
npm run build
```

GitHub Pages deployment is configured through GitHub Actions.
