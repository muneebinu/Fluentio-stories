# Fluentio Stories

Fluentio Stories is a German reading workspace with a curated directory of real, free graded-story collections and a separate shelf of complete public-domain literature.

## Graded story collections

The homepage links directly to publisher-hosted full-text collections:

| Level | Collection | Stories |
|---|---|---:|
| A1 | Lenguia | 68 |
| A1 | Morgenlese | 55 |
| A2 | Lenguia | 101 |
| A2 | Morgenlese | 52 |
| B1 | Lenguia | 100 |
| B1 | Morgenlese | 54 |

Counts are the publishers' displayed collection counts, not Fluentio-authored stories. The publishers host the graded stories and their translations/quizzes. Fluentio links to those full collections rather than copying third-party copyrighted material without permission.

## Complete public-domain literature

The classic shelf includes full texts from German Wikisource and Project Gutenberg:
- Theodor Storm: *Immensee*, *Pole Poppenspäler*, *Der Schimmelreiter*
- Franz Kafka: *Die Verwandlung*
- Johann Wolfgang von Goethe: *Die Leiden des jungen Werthers*
- Theodor Fontane: *Effi Briest*
- Johanna Spyri: *Heidis Lehr- und Wanderjahre*
- Thomas Mann: *Buddenbrooks: Verfall einer Familie*

Project Gutenberg's public-domain statement is territorial: users outside the United States should check the copyright law where they are located. The app does not claim these classics are CEFR-graded.

## Reader tools

- Click a German word to request an English meaning and dictionary information.
- Save vocabulary locally, practise with flashcards, and export vocabulary as CSV.
- Save reading texts in the current browser.
- Browser speech synthesis can read German words and passages aloud.
- Paste or upload a text you have permission to use.
- Project Gutenberg plain-text editions are loaded into the in-app reader when the publisher permits the browser request; if that request is blocked, the source edition link remains available.

## Limitations

- Publisher-hosted graded stories open on their original sites because their text is not licensed for Fluentio to republish.
- Vocabulary and saved readings use browser local storage and do not sync across devices.
- Translation and dictionary data come from third-party services; availability and accuracy can vary.
- No user accounts or cloud sync.

## Development

```bash
npm install
npm run dev
npm run build
```

GitHub Pages deployment is configured through GitHub Actions.
