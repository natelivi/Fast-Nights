# Routine prompt — Fast Nights morning-of reminder

Schedule: `0 14 * * *` (8:00am Mountain while MDT is in effect; see
`docs/reminders.md` on daylight saving). Fires a fresh session each time.
Requires the **Gmail** connector.

Replace `SECOND_RECIPIENT` with the other person's address before use.

---

Send the Fast Nights morning-of reminder. Run this end to end on your own — nobody is watching this session, so never stop to ask a question.

STEP 1 — Read the live schedule.
Call the Artifact tool with action "read" and url "https://claude.ai/code/artifact/0ca6b614-c2be-4aa6-90f5-cc5e373b4b39". The result saves the full page HTML to a local file and names the path. In that file, find the FIRST occurrence of `<script type="application/json" id="data">` and parse the JSON between it and the next `</script>`. A second, similar-looking string appears later inside the page's own JavaScript source — ignore it; only the first is real data.

The JSON looks like:
  {"rev":2,"updated":"2026-08-30T19:04:11.123Z","nights":{"1":{"d":"2026-08-29","t":"19:30"},"5":{"d":"2026-09-19","t":"20:00"}}}
Each key of "nights" is a night number from 1 to 11. "d" is the date as YYYY-MM-DD and "t" is a 24-hour time. Nights with no date are simply absent.

STEP 2 — Get today's date in Mountain Time.
Run `TZ=America/Denver date +%F` in Bash. Do not assume this session's own clock is Mountain Time.

STEP 3 — Decide.
If no night's "d" equals today's Mountain date, do nothing at all. Send no email. End the turn with the single line "No Fast Nights tonight." Never send a "nothing scheduled" email.

If exactly one night matches, go to step 4. If more than one matches (they double-booked a date), cover all of them in one email.

STEP 4 — Send exactly one email via the Gmail connector's send_message tool.

to: ["nate@hnlbuild.com", "SECOND_RECIPIENT"]

Convert "t" to a 12-hour time like 7:30pm (a "t" of "19:30" is 7:30pm; drop ":00" minutes, so "20:00" is 8pm). If "t" is missing, use 7:30pm.

subject: Tonight: Night 04 — Fast & Furious, 7:30pm
  (substitute the real zero-padded night number, title and time)

body (plain text, exactly this shape):

  NIGHT 04 OF 11
  Fast & Furious (2009)
  Tonight at 7:30pm

  DRESS CODE
  Bandeau or off-the-shoulder top, and leggings that show off that ass.

  Menu and the plan stay classified.
  The lineup: https://claude.ai/code/artifact/0ca6b614-c2be-4aa6-90f5-cc5e373b4b39

Also send an htmlBody with the same content: a dark background (#0A0A0C), off-white text (#E8E6E1), the night number small and in grey (#6B6F76), the movie title large and bold, and the DRESS CODE label in red (#E01B24) above the dress code text. Keep it to one simple centered column, no images.

THE ELEVEN NIGHTS — title, year, and dress code, by night number. Use these verbatim; they are the whole point of the email.
  01 · The Fast and the Furious (2001) — Baggy pants and a tight tank top. Letty shades optional.
  02 · 2 Fast 2 Furious (2003) — Miami Beach or Miami nightlife — you choose.
  03 · Tokyo Drift (2006) — Gyaru. Pinterest it.
  04 · Fast & Furious (2009) — Bandeau or off-the-shoulder top, and leggings that show off that ass.
  05 · Fast Five (2011) — Something summery. Bring an appetite.
  06 · Fast & Furious 6 (2013) — Leather jacket. Ready to ride.
  07 · Furious 7 (2015) — The best thing in your closet. Full Abu Dhabi. I'm dressing up too.
  08 · The Fate of the Furious (2017) — All black. Every piece.
  09 · Hobbs & Shaw (2019) — Sexy gym outfit. Baby oil optional.
  10 · F9 (2021) — Backyard cookout. Whatever you'd wear to a barbecue.
  11 · Fast X (2023) — Fast and Furious, but make it pajamas.

STEP 5 — Report.
End the turn with one line: who the email went to and which night it covered. If the artifact read failed or the JSON would not parse, send no email and say exactly what broke.
