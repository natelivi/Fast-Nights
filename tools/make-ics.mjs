#!/usr/bin/env node
// Build fast-nights.ics from the schedule stored in the Fast Nights page.
//
//   node tools/make-ics.mjs <page.html|schedule.json> [out.ics]
//
// Input is either a saved copy of the artifact's HTML (the file an
// `Artifact` read writes out) or a bare JSON schedule of the same shape:
//   {"rev":2,"nights":{"4":{"d":"2026-09-19","t":"20:00"}}}
//
// Each scheduled night becomes one event with two alarms: 8:00am that
// morning, when the dress code unlocks, and one hour before showtime.
// UIDs are stable per night and SEQUENCE tracks the schedule's rev, so
// re-importing updates the existing events instead of duplicating them.

import { readFileSync, writeFileSync } from 'node:fs';

const LINEUP_URL = 'https://claude.ai/code/artifact/0ca6b614-c2be-4aa6-90f5-cc5e373b4b39';

const MOVIES = [
  [1, 2001, 'The Fast and the Furious'], [2, 2003, '2 Fast 2 Furious'],
  [3, 2006, 'Tokyo Drift'],              [4, 2009, 'Fast & Furious'],
  [5, 2011, 'Fast Five'],                [6, 2013, 'Fast & Furious 6'],
  [7, 2015, 'Furious 7'],                [8, 2017, 'The Fate of the Furious'],
  [9, 2019, 'Hobbs & Shaw'],             [10, 2021, 'F9'],
  [11, 2023, 'Fast X'],
];

const [, , src, dest = 'fast-nights.ics'] = process.argv;
if (!src) {
  console.error('usage: node tools/make-ics.mjs <page.html|schedule.json> [out.ics]');
  process.exit(2);
}

const raw = readFileSync(src, 'utf8');
let data;
if (src.endsWith('.json')) {
  data = JSON.parse(raw);
} else {
  // The page's own JavaScript contains a lookalike of this tag; the real
  // data block is the first one in the document.
  const m = raw.match(/<script type="application\/json" id="data">([\s\S]*?)<\/script>/);
  if (!m) { console.error('No schedule block found in ' + src); process.exit(1); }
  data = JSON.parse(m[1]);
}

const nights = data.nights || {};
const seq = data.rev || 1;
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
