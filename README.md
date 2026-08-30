# Fast Nights

An eleven-night Fast & Furious watch-along schedule, as a single self-contained
HTML page. Published as a Claude Artifact:

    https://claude.ai/code/artifact/0ca6b614-c2be-4aa6-90f5-cc5e373b4b39

## What it does

- **Setup** — pick a date and time for each of the eleven movies, all at once or
  a few at a time. Night 01 is seeded as already watched.
- **Lineup** — a staging-tree view of all eleven nights, with a next-up strip
  across the top. Bulbs read amber for scheduled, green and throbbing for
  tonight, dim for nights already watched.
- **Title card** — tap a night for a rev-limiter transition into its card. The
  dress code unlocks the morning of; menu and plan stay redacted.

## How the schedule is shared

The schedule is not in browser storage — it is *in the page*, as a JSON block:

    <script type="application/json" id="data">{"rev":1,...}</script>

Saving calls `artifact.publish()` with a complete rebuilt copy of this document
carrying a new `#data` block, so the schedule becomes the page itself. Every
open view reloads to it. Whoever opens the artifact link sees the same dates,
and either person can set them.

The page rebuilds itself by reading the text of its own `<style id="css">` and
`<script id="app">` elements and re-emitting them around fresh data — never by
serializing the live DOM, which would capture viewer state and injected runtime
scripts. That round trip is lossless and stable across generations.

Writing requires edit access to the artifact. A read-only viewer can change the
inputs but `publish` rejects with `not_writer`; the page catches that and says
the view is read-only rather than failing silently.

## Working state vs. saved state

The lineup and title cards render the *working* schedule, so picks stay visible
before they are saved. The strip's chip carries the distinction — `Saved`
against `Unsaved` — and a banner appears while changes are unpublished.

## Running it locally

`index.html` has no build step and no dependencies beyond Google Fonts. Open it
directly, or serve the directory:

    python3 -m http.server 8000

Outside the Artifacts runtime `claude.use()` is absent, so the page renders and
navigates normally but cannot save; the save button says so.
