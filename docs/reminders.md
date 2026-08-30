# Getting notified the morning of

Two independent paths. The calendar one works on its own; the email one
needs a Gmail connector attached by hand, once.

## 1. Calendar file (recommended — no moving parts)

`tools/make-ics.mjs` turns the live schedule into a calendar file with two
alarms per night: **8:00am that morning**, when the dress code unlocks, and
**one hour before** showtime.

    # save the page, then build the file
    node tools/make-ics.mjs page.html fast-nights.ics

Ask Claude for the file, or save the artifact's HTML yourself. Import
`fast-nights.ics` into any calendar app; send the same file to the other
person so you both get the alarms.

Times are *floating* — no timezone is attached — so each event lands at the
same wall-clock hour in whichever timezone the importing calendar is set to.

Event UIDs are stable per night and `SEQUENCE` follows the schedule's `rev`,
so re-importing after a date change **updates** the existing events rather
than duplicating them. Regenerate and re-import whenever nights move.

## 2. Morning-of email

A Routine reads the artifact each morning, and if today is one of the eleven
nights, emails the movie, the time, and that night's dress code. Because it
reads the artifact at send time, it stays correct when either person moves a
night — no re-setup.

**Status: created but disabled.** Routine
`trig_01VK81eDJjCEexkfAE9qk5qU`, "Fast Nights — morning-of reminder
(needs Gmail attached)", `0 14 * * *` (8:00am Mountain during MDT).

It is disabled because routines created from a Claude Code session cannot
carry connectors on this account — the sessions it fires get no Gmail tool,
so it would silently send nothing. Verified by firing it once: no message
was sent.

To finish it: open Routines on claude.ai, attach the **Gmail** connector to
that routine, add the second recipient, and re-enable it. If the interface
will not attach a connector to an existing routine, create a new one on the
same schedule and paste `docs/reminder-prompt.md` as the prompt.

### Daylight saving

The cron is `0 14 * * *` — 14:00 UTC, which is 8:00am Mountain **while
MDT is in effect**. When Utah returns to MST in early November it becomes
7:00am. Change the cron to `0 15 * * *` then to hold 8:00am.
