# Getting notified the morning of

Two independent paths. The calendar one works on its own; the email one needs
a Gmail connector attached by hand, once.

## 1. Calendar file (recommended — no moving parts)

`tools/make-ics.mjs` turns the shared schedule into a calendar file with two
alarms per night: **8:00am that morning**, when the dress code unlocks, and
**one hour before** showtime.

    node tools/make-ics.mjs                     # live, from Supabase
    node tools/make-ics.mjs fast-nights.ics     # same, named output
    node tools/make-ics.mjs schedule.json out.ics

Import the file into any calendar app, and send the same file to the other
person so you both get the alarms.

Times are *floating* — no timezone is attached — so each event lands at the
same wall-clock hour in whichever timezone the importing calendar is set to.

Event UIDs are stable per night and `SEQUENCE` follows the schedule's save
timestamp, so re-importing after a date change **updates** the existing events
rather than duplicating them. Regenerate and re-import whenever nights move.

## 2. Morning-of email

A Routine reads the schedule each morning, and if today is one of the eleven
nights, emails the movie, the time, and that night's dress code to both
people. Because it reads the live table at send time, it stays correct when
either person moves a night — no re-setup.

**Status: created but disabled.** Routine `trig_01VK81eDJjCEexkfAE9qk5qU`,
"Fast Nights — morning-of reminder (attach Gmail to enable)",
`0 14 * * *` (8:00am Mountain during MDT). It emails nate@hnlbuild.com and
Hunterelivingston@gmail.com.

It is disabled because routines created from a Claude Code session cannot
carry connectors on this account — the sessions it fires get no Gmail tool,
so it would silently send nothing. Verified by firing it once: no message
was sent.

To finish it: open Routines on claude.ai, attach the **Gmail** connector to
that routine and re-enable it. Both recipients are already in the prompt.
If the interface will not attach a connector to an existing routine, create
a new one on the same schedule and paste `docs/reminder-prompt.md` as the
prompt.

**Its stored prompt is out of date.** The routine still carries the version
that had the eleven dress codes written into it, from before they moved into
the database. That copy will drift from whatever is on the keeper screen. The
session that moved them could not reach the routine tooling to update it, so
when you enable the routine, replace its prompt with the current
`docs/reminder-prompt.md`, which reads the dress codes from the row instead of
carrying its own.

### Daylight saving

The cron is `0 14 * * *` — 14:00 UTC, which is 8:00am Mountain **while
MDT is in effect**. When Utah returns to MST in early November it becomes
7:00am. Change the cron to `0 15 * * *` then to hold 8:00am.
