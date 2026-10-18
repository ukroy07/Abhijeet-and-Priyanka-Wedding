# Abhijeet ♥ Priyanka — wedding invitation

Live at **https://ukroy07.github.io/Abhijeet-and-Priyanka-Wedding/** (GitHub Pages, served from `main`).

A static site: `index.html` is the invitation, `guest-links.html` makes a personal link for every guest.
Everything guests read (events, venues, families, contact numbers, story, music) lives in `assets/js/config.js`.

## Sending personal links
1. Open https://ukroy07.github.io/Abhijeet-and-Priyanka-Wedding/guest-links.html
2. Paste guests one per line — `Sharma Ji & Family, 98765 43210` (the number is optional) — and press **Add to list**.
3. Tap **WhatsApp** on each row. The guest's name appears on the envelope when they open their link
   (`…/?to=Sharma+Ji+%26+Family`). The list and "sent" marks are kept only in that browser.

## Editing
Change `assets/js/config.js` (or any file), commit and push to `main`; GitHub Pages republishes in about a minute.
Optional extras in `config.js`: event `time`, an RSVP WhatsApp number (`rsvp.whatsapp`) or your own song (`music.src`).
