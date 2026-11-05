# Carlos Vinyl Siding

A responsive, buildless website for Carlos Vinyl Siding, a Portuguese family-owned home improvement company in New Bedford, Massachusetts.

## Pages

- Home: company introduction, featured Facebook project, service overview, review, and quote calls to action.
- Services: core specialties and related exterior work requests.
- Gallery: five recent public Facebook project posts with links that attach a selected project to the quote form.
- Contact: detailed quote request form for contact details, property, service selection, schedule, budget, project notes, and an optional gallery reference.

## Contact request flow

The site is static and does not send customer information to a server. After visitors complete the form, the site prepares a text message addressed to the company’s published phone number, **(508) 997-2540**. Visitors review the message and choose Send in their messaging app. A copy-details option and the company’s phone number are provided as alternatives.

## Files

- `index.html` and the `services/`, `gallery/`, and `contact/` page directories
- `styles.css` and `script.js`
- `assets/carlos-vinyl-siding.png` and `assets/favicon.svg`

The pages are plain HTML, CSS, and JavaScript. No package manager, build step, package lockfile, or framework is required. Facebook controls the availability and appearance of the embedded project posts; each post also has a direct Facebook link.
