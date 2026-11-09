# Fluentio Stories Web Reader (Chrome / Edge)

This Manifest V3 extension adds click-to-translate support to ordinary webpages. It does not copy whole pages or bypass publisher restrictions: learners select a word or phrase, and the extension sends only that selection to the dictionary services.

## Install locally

1. Open `chrome://extensions` in Chrome or `edge://extensions` in Edge.
2. Turn on **Developer mode**.
3. Choose **Load unpacked**.
4. Select this `browser-extension` folder from the downloaded repository.
5. Open a German webpage, select a word or phrase, and use the Fluentio panel.
6. Open the extension toolbar popup to review or export saved words.

## Permissions

- `storage`: save the learner's own vocabulary locally in the browser.
- Host access to Wiktapi, German Language API and MyMemory: perform dictionary and translation lookups.
- Content script access to HTTP/HTTPS webpages: detect text explicitly selected by the learner and show the lookup panel.

## Data and limits

Saved extension vocabulary remains in Chrome/Edge extension storage on that device. It is separate from the Fluentio Stories website's local vocabulary and is not synced. API providers may rate-limit or change their availability. The German Language API's published demo key is for testing and has a 1,000-request daily limit; arrange a production key before broad public distribution.

The extension is a source-code release for local installation, not a signed Chrome Web Store release.
