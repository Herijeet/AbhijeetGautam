#!/usr/bin/env node
/*
  Builds the one-page résumé PDF from resume/resume.html.

    node resume/build-resume.js --out Abhijeet_Gautam_Resume.pdf
        public copy, no phone number (the file the website links to)

    node resume/build-resume.js --out ~/private/Abhijeet_Gautam_Software_Engineer.pdf --phone "+91 ..."
        recruiter copy with phone; keep it OUT of this repo, which is published by GitHub Pages

  Needs Playwright with Chromium (`npm i -g playwright && npx playwright install chromium`).
  Fails if the page overflows A4 or a bullet runs past two lines.
*/
'use strict';
const path = require('path');
const { chromium } = require('playwright');

function arg(name) {
  const i = process.argv.indexOf('--' + name);
  return i > -1 ? process.argv[i + 1] : undefined;
}

(async () => {
  const out = arg('out');
  const phone = arg('phone');
  if (!out) { console.error('usage: build-resume.js --out <file.pdf> [--phone "<number>"]'); process.exit(2); }

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + path.join(__dirname, 'resume.html'));
  await page.emulateMedia({ media: 'print' });

  await page.evaluate((phone) => {
    const slot = document.getElementById('phone');
    if (phone) slot.textContent = phone;
    else { slot.remove(); document.getElementById('phone-sep').remove(); }
  }, phone || '');

  // A4 minus the @page margins (8mm top/bottom, 12mm left/right) at 96 px/in.
  const mm = 96 / 25.4;
  await page.setViewportSize({ width: Math.round((210 - 24) * mm), height: 1200 });
  const report = await page.evaluate((maxH) => {
    const lines = [...document.querySelectorAll('li')].map((li) => {
      const lh = parseFloat(getComputedStyle(li).lineHeight);
      return { text: li.textContent.slice(0, 60), lines: Math.round(li.getBoundingClientRect().height / lh) };
    });
    return { height: document.body.scrollHeight, maxH, lines };
  }, (297 - 16) * mm);

  const long = report.lines.filter((l) => l.lines > 2);
  console.log(`content height ${Math.round(report.height)} px of ${Math.round(report.maxH)} px available`);
  long.forEach((l) => console.log(`  ${l.lines} lines: ${l.text}…`));

  await page.pdf({ path: out, preferCSSPageSize: true, printBackground: false, tagged: true, outline: false });
  await browser.close();

  if (report.height > report.maxH) { console.error('FAIL: content overflows one page'); process.exit(1); }
  if (long.length) { console.error('FAIL: bullets longer than two lines'); process.exit(1); }
  console.log('wrote ' + out + (phone ? ' (with phone)' : ' (no phone)'));
})();
