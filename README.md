# Fast Nights

An eleven-night Fast & Furious watch-along schedule for two people, as a
single self-contained HTML page with a shared cloud schedule.

**Live:** https://natelivi.github.io/Fast-Nights/

## What it does

- **Setup** — pick a date and time for each of the eleven movies, all at once
  or a few at a time. Either person can set them from their own phone.
- **Lineup** — a staging-tree view of all eleven nights with a next-up strip.
  Bulbs read amber for scheduled, green and throbbing for tonight, dim for
  nights already watched.
- **Title card** — tap a night for a rev-limiter transition into its card. The
  dress code unlocks the morning of; menu and plan stay redacted.

## How the schedule is shared

The schedule lives in Supabase, in the same project as the closet, in its own
`fast_nights` table. The whole schedule is **one row** — eleven nights is a few
hundred bytes, and one row makes a save atomic, so a request that dies midway
cannot leave half a schedule behind.

The page talks to Supabase's REST API directly, no SDK, the same way Sand and
Saddle does. The publishable key goes on the `apikey` header only; sent as a
Bearer token, Supabase tries to parse it as a JWT and rejects it.

`localStorage` is only a cache, so a cold start paints instantly and a dropped
connection does not blank the page. **The cloud is the source of truth** — a
cache miss costs a fetch, never data.

### Staying in sync

The page re-reads the schedule every 20 seconds while visible, and whenever
the tab regains focus, so one person's save shows up on the other's phone
without a reload.

If someone saves while you have unsaved edits, neither side is silently
dropped: a banner says the schedule changed and offers **Load theirs**.
Saving without taking that offer replaces theirs with yours, which is the
right call for two people who can just talk to each other.

## Setup

**Supabase** — run `supabase/schema.sql` once in the SQL editor. It creates
the table, opens the row-level-security policies, and seeds Night 01.

**Hosting** — GitHub Pages, from `main`, root directory. There is no build
step; `index.html` is the whole app.

## A note on privacy

The page sits at a public URL and the repository is public, so the dress codes
are readable by anyone who has the link or browses the repo. `<meta
name="robots" content="noindex">` keeps it out of search results, but that is
obscurity, not privacy. The RLS policies let anyone with the URL read and
rewrite the schedule too — fine for a movie schedule, but worth knowing.

Making the repository private would take the dress codes out of public view;
GitHub Pages on a private repo needs a paid plan, so the page would need
another host.

## Getting notified the morning of

See `docs/reminders.md`.

## Running it locally

    python3 -m http.server 8000

It talks to the same Supabase table as the deployed page, so local edits are
real edits.
