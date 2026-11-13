# Abhijeet Gautam — portfolio

Live: **https://herijeet.github.io/AbhijeetGautam/**

Static, hand-built site: `index.html`, `styles.css`, `main.js`. No build step and no frameworks. Headings use
the Newsreader font from Google Fonts; body text uses the system font.

Run it locally:

```bash
python3 -m http.server 8000
```

## Page structure

1. Hero with role, summary, email and résumé buttons, followed by a four-number stat strip
2. Featured project: Custom Report Platform (problem, what was built, an inline SVG architecture diagram, result), a scroll-driven 3D laptop, and an interactive report demo with made-up fund data that exports a CSV
3. Selected work
4. Engineering practice
5. About
6. Experience, education and certification
7. Skills
8. Contact

Works at phone width with no horizontal scroll and respects `prefers-reduced-motion`. Checked against
WCAG 2.1 AA with axe-core in light and dark mode.

## Résumé

`resume/resume.html` is the single source for the résumé. `resume/build-resume.js` renders it to a one-page
A4 PDF with Playwright and fails if the page overflows or a bullet runs past two lines.

```bash
# public copy, no phone number: the file the website links to
node resume/build-resume.js --out Abhijeet_Gautam_Resume.pdf

# recruiter copy with phone number: write it OUTSIDE this repo (the repo is published by GitHub Pages)
node resume/build-resume.js --out ~/Documents/Abhijeet_Gautam_Software_Engineer.pdf --phone "+91 ..."
```

The phone number is never stored in this repository.

## Screenshots

`.github/screenshots/`

| Desktop | Phone |
| --- | --- |
| ![Hero](.github/screenshots/desktop-hero.png) | ![Phone hero](.github/screenshots/phone-hero.png) |
| ![3D laptop](.github/screenshots/desktop-laptop-3d.png) | ![Report demo](.github/screenshots/phone-report-builder.png) |
