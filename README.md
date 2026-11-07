# Carlos Vinyl Siding

A responsive, buildless website for Carlos Vinyl Siding, a Portuguese family-owned home improvement company in New Bedford, Massachusetts.

## Pages

- **Home:** company introduction, a featured finished exterior project, service overview, customer review and quote links.
- **Services:** core specialties and related exterior work available from South Coast home improvement contractors.
- **Gallery:** five selected project albums with all 45 locally hosted photos. Each album opens as a browsable viewer with next/previous controls, keyboard navigation, swipe navigation and a thumbnail strip. Album cards use only completed project photos.
- **Contact:** a detailed, three-step quote form for service scope, home details, project timing, budget and contact preferences. Selecting an album photo carries that exact image and its project title into the quote brief.

## Contact request flow

The site is static and does not send customer information to a server. After visitors complete the form, it prepares a text message addressed to the company’s published phone number, **(508) 997-2540**. Visitors review the message and choose Send in their messaging app. A copy-details option and the company’s phone number are provided as alternatives.

## Project photography

The gallery contains locally hosted copies of all photos in five selected project posts, chosen for a useful mix of engagement and complete, clear project photography. No Facebook embeds or links to individual Facebook posts are included. Project IDs, observed engagement and photo counts are recorded in [`docs/project-sources.md`](docs/project-sources.md).

## Files

- `index.html`, `services/`, `gallery/`, and `contact/`
- `styles.css`, `script.js`, and `projects.js`
- Transparent green company logo at `assets/carlos-vinyl-siding-green.png`
- Project photography and thumbnails under `assets/projects/`
- `robots.txt` and `sitemap.xml`

The pages are plain HTML, CSS, and JavaScript. No package manager, build step, package lockfile, or framework is required.
