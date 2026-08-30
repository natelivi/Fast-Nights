# Fast Nights

An eleven-night Fast & Furious watch-along schedule, as a single self-contained
HTML page.

## What it does

- **Setup** — pick a date and time for each of the eleven movies. Night 01
  defaults to today at 7:30pm; the rest are yours to fill in, all at once or a
  few at a time.
- **Lineup** — a staging-tree view of all eleven nights. Bulbs read amber for
  scheduled, green and throbbing for tonight, dim for nights already watched.
- **Title card** — tap a night for a rev-limiter transition into its card. The
  dress code unlocks the morning of; menu and plan stay redacted.

## Running it

`index.html` has no build step and no dependencies beyond Google Fonts. Open it
directly, or serve the directory:

    python3 -m http.server 8000

## Saving the schedule

Picks persist through `window.storage`, the Claude Artifacts runtime API. Opened
anywhere that API is absent, the page still works for the session but drops a
note on the lineup saying picks aren't being saved.
