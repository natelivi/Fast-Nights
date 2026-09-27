# Routine prompt — Fast Nights morning-of reminder

Schedule: `0 14 * * *` (8:00am Mountain while MDT is in effect; see
`docs/reminders.md` on daylight saving). Fires a fresh session each time.
Requires the **Gmail** connector. Recipients are already set to both people.

The dress codes are **not** in this prompt. They live in the database, so
editing one on the keeper screen changes the email too. Nothing here needs
updating when they change.

---

Send the Fast Nights morning-of reminder. Run this end to end on your own — nobody is watching this session, so never stop to ask a question.

STEP 1 — Read the live schedule and dress codes.
Run this in Bash:

  curl -s "https://dvfhhjxncmzffefrzfif.supabase.co/rest/v1/fast_nights?id=eq.main&select=data,updated" -H "apikey: sb_publishable_xTd4KAx6RSdQUjxBzDXIwg_y72lKpzh"

It returns a JSON array holding one row, shaped like:
  [{"data":{"nights":{"1":{"d":"2026-08-29","t":"19:30"},"5":{"d":"2026-09-19","t":"20:00"}},"dress":{"1":"<the dress code for night 1>","5":"<the dress code for night 5>"}},"updated":1788110000000}]

"nights" maps a night number from 1 to 11 to {"d":"YYYY-MM-DD","t":"HH:MM"}. Nights with no date are simply absent.
"dress" maps the same night numbers to that night's dress code.

If the request fails or returns an empty array, send no email and say what happened.

STEP 2 — Get today's date in Mountain Time.
Run `TZ=America/Denver date +%F` in Bash. Do not assume this session's own clock is Mountain Time.

STEP 3 — Decide.
If no night's "d" equals today's Mountain date, do nothing at all. Send no email. End the turn with the single line "No Fast Nights tonight." Never send a "nothing scheduled" email.

If exactly one night matches, go to step 4. If more than one matches (they double-booked a date), cover all of them in one email.

STEP 4 — Send exactly one email via the Gmail connector's send_message tool.

to: ["nate@hnlbuild.com", "Hunterelivingston@gmail.com"]

Use the dress code from "dress" for that night number, exactly as stored — it is the whole point of the email. Never invent one, and never substitute a dress code you remember from an earlier run: if that night has no entry in "dress", write "No dress code set for tonight." in its place and mention it in your final report.

Convert "t" to a 12-hour time like 7:30pm (a "t" of "19:30" is 7:30pm; drop ":00" minutes, so "20:00" is 8pm). If "t" is missing, use 7:30pm.

subject: Tonight: Night 04 — Fast & Furious, 7:30pm
  (substitute the real zero-padded night number, title and time)

body (plain text, exactly this shape):

  NIGHT 04 OF 11
  Fast & Furious (2009)
  Tonight at 7:30pm

  DRESS CODE
  <the dress code for that night, from the database>

  Menu and the plan stay classified.
  The lineup: https://natelivi.github.io/Fast-Nights/

Also send an htmlBody with the same content: a dark background (#0A0A0C), off-white text (#E8E6E1), the night number small and in grey (#6B6F76), the movie title large and bold, and the DRESS CODE label in red (#E01B24) above the dress code text. Keep it to one simple centered column, no images.

TITLES AND YEARS by night number (these are fixed; only the dress codes come from the database):
  01 · The Fast and the Furious (2001)
  02 · 2 Fast 2 Furious (2003)
  03 · Tokyo Drift (2006)
  04 · Fast & Furious (2009)
  05 · Fast Five (2011)
  06 · Fast & Furious 6 (2013)
  07 · Furious 7 (2015)
  08 · The Fate of the Furious (2017)
  09 · Hobbs & Shaw (2019)
  10 · F9 (2021)
  11 · Fast X (2023)

STEP 5 — Report.
End the turn with one line: who the email went to and which night it covered. If the schedule could not be read, send no email and say exactly what broke.
