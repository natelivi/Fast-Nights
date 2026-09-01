#!/usr/bin/env node
// Build fast-nights.ics from the shared schedule.
//
//   node tools/make-ics.mjs [out.ics]              # live, from Supabase
//   node tools/make-ics.mjs schedule.json [out.ics]  # from a saved copy
//
// A JSON file, if given, is the same shape the page stores:
//   {"nights":{"4":{"d":"2026-09-19","t":"20:00"}}}
//
// Each scheduled night becomes one event with two alarms: 8:00am that
// morning, when the dress code unlocks, and one hour before showtime.
// UIDs are stable per night and SEQUENCE tracks the schedule's rev, so
// re-importing updates the existing events instead of duplicating them.

import { readFileSync, writeFileSync } from 'node:fs';

const LINEUP_URL   = 'https://natelivi.github.io/Fast-Nights/';
const SUPABASE_URL = 'https://dvfhhjxncmzffefrzfif.supabase.co';
const SUPABASE_KEY = 'sb_publishable_xTd4KAx6RSdQUjxBzDXIwg_y72lKpzh';

const MOVIES = [
  [1, 2001, 'The Fast and the Furious'], [2, 2003, '2 Fast 2 Furious'],
  [3, 2006, 'Tokyo Drift'],              [4, 2009, 'Fast & Furious'],
  [5, 2011, 'Fast Five'],                [6, 2013, 'Fast & Furious 6'],
  [7, 2015, 'Furious 7'],                [8, 2017, 'The Fate of the Furious'],
  [9, 2019, 'Hobbs & Shaw'],             [10, 2021, 'F9'],
  [11, 2023, 'Fast X'],
];

// A first argument ending in .json is a saved schedule; otherwise everything
// is an output path and the schedule comes from the cloud.
const argv = process.argv.slice(2);
const src = argv[0] && argv[0].endsWith('.json') ? argv.shift() : null;
const dest = argv[0] || 'fast-nights.ics';

async function fetchSchedule() {
  const r = await fetch(
    `${SUPABASE_URL}/rest/v1/fast_nights?id=eq.main&select=data,updated`,
    { headers: { apikey: SUPABASE_KEY } },
  );
  if (!r.ok) throw new Error(`Supabase answered ${r.status}`);
  const rows = await r.json();
  if (!rows.length) throw new Error('No schedule row yet — save one from the page first.');
  return rows[0].data || {};
}

let data;
if (src) {
  data = JSON.parse(readFileSync(src, 'utf8'));
} else {
  try {
    data = await fetchSchedule();
  } catch (err) {
    console.error(`Could not read the schedule: ${err.message}`);
    process.exit(1);
  }
}

const nights = data.nights || {};
// SEQUENCE must rise whenever an event changes for a re-import to update
// rather than duplicate. The save timestamp does that, in minutes so it
// stays inside the 32-bit range calendars expect.
const seq = Math.floor((data.updated || Date.now()) / 60000);
const pad = (n) => String(n).padStart(2, '0');
const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

// Fold to 75 octets per RFC 5545, continuation lines starting with a space.
function fold(line) {
  const b = Buffer.from(line, 'utf8');
  if (b.length <= 75) return line;
  const out = [];
  let i = 0, limit = 75;
  while (i < b.length) {
    let take = Math.min(limit, b.length - i);
    // never split a multi-byte character
    while (take > 0 && i + take < b.length && (b[i + take] & 0xc0) === 0x80) take--;
    out.push(b.subarray(i, i + take).toString('utf8'));
    i += take;
    limit = 74;
  }
  return out.join('\r\n ');
}

const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

// Alarm at 8:00am local on the day of, expressed as an offset before start.
function morningOf(t) {
  const [h, m] = (t || '19:30').split(':').map(Number);
  const mins = Math.max(15, h * 60 + m - 8 * 60);
  return `-PT${Math.floor(mins / 60)}H${mins % 60}M`;
}

const L = [
  'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Fast Nights//Fast Nights//EN',
  'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Fast Nights',
];

let count = 0;
for (const [n, yr, title] of MOVIES) {
  const e = nights[n] || nights[String(n)];
  if (!e || !e.d) continue;
  count++;
  const t = e.t || '19:30';
  // Floating local time: no Z, no TZID, so it lands at the same wall-clock
  // hour in whatever timezone each person's calendar is set to.
  const start = e.d.replace(/-/g, '') + 'T' + t.replace(':', '') + '00';
  L.push(
    'BEGIN:VEVENT',
    `UID:fast-nights-${pad(n)}@fast-nights`,
    `DTSTAMP:${stamp}`,
    `SEQUENCE:${seq}`,
    `DTSTART:${start}`,
    'DURATION:PT2H30M',
    `SUMMARY:${esc(`Fast Nights ${pad(n)} — ${title}`)}`,
    `DESCRIPTION:${esc(`Night ${pad(n)} of 11 · ${title} (${yr})\n\nThe dress code unlocks this morning. Open the lineup:\n${LINEUP_URL}\n\nMenu and the plan stay classified.`)}`,
    `URL:${LINEUP_URL}`,
    'BEGIN:VALARM', 'ACTION:DISPLAY',
    `TRIGGER:${morningOf(t)}`,
    `DESCRIPTION:${esc(`Tonight: ${title}. The dress code is live.`)}`,
    'END:VALARM',
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'TRIGGER:-PT1H',
    `DESCRIPTION:${esc(`One hour out: ${title}`)}`,
    'END:VALARM',
    'END:VEVENT',
  );
}
L.push('END:VCALENDAR');

if (!count) { console.error('No nights have dates yet — nothing to put in a calendar.'); process.exit(1); }
writeFileSync(dest, L.map(fold).join('\r\n') + '\r\n');
console.log(`${dest}: ${count} night${count === 1 ? '' : 's'}, sequence ${seq}`);
