# Safari Explorers International — proposal build

A complete, production-quality static website built for the founders to review.

**This is a proposal build. It is not the live site and it does not pretend to be.**
Every page carries a dismissible ribbon saying so, and all forms run in demo mode
and submit nothing anywhere.

---

## What this is

| | |
|---|---|
| **Stack** | Plain HTML, CSS and vanilla JavaScript. No framework, no build step, no npm. |
| **Pages** | 13 pages plus a 404 |
| **Hosting** | GitHub Pages, served from a subdirectory |
| **Forms** | Demo mode. Netlify-ready with a one-line change. |
| **Total weight** | ~3 MB including all imagery |

It deploys to GitHub Pages with zero configuration and cannot fail on a Node
version mismatch. It can be migrated to Astro later if the founders want a CMS.

---

## Running it locally

There is no build step. Open `index.html` in a browser, or serve the folder
with anything:

```bash
python -m http.server 8000
```

---

## The two constants you will actually want to edit

Both are at the top of `assets/js/site.js`.

### 1. Availability

```js
const PLACES = { total: 8, remaining: 4 };
```

Edit this one value and the number updates everywhere on the site: the homepage,
the dates page, and the dot indicator.

> **Before publishing, `remaining` must be set to the true number of unbooked
> places.** It is currently `4` because the brief specified that figure for the
> demonstration. No bookings exist. Publishing a scarcity figure that is not
> real is dishonest, contradicts the brand's own voice, and is actionable under
> consumer law in Australia and Singapore, two of the three launch markets.
> Set it to `8` on day one and decrease it as places genuinely sell.

The cap of `total: 8` is a real operational limit and is safe to state.

### 2. Demo mode

```js
const DEMO_MODE = true;
```

- `true` — forms validate in the browser, show a loading state and redirect to
  `thank-you/`. Nothing is submitted or stored. The thank-you page says so.
- `false` — forms post natively.

---

## Moving the forms to Netlify

Every form already carries the real Netlify attributes:

```html
<form name="application" method="POST" data-netlify="true" netlify-honeypot="bot-field">
```

plus a hidden `form-name` input and a honeypot field. To go live on Netlify:

1. Set `DEMO_MODE = false` in `assets/js/site.js`.
2. Deploy the folder to Netlify.
3. Submissions appear in the Netlify dashboard under **Forms**.

No other change is required. The four forms are `application`, `parent-pack`,
`founder-call` and `school-enquiry`.

GitHub Pages has no form backend, which is why demo mode exists.

---

## Structure

```
index.html                    Homepage
expedition/                   Eight-day itinerary, day in the life, passport, curriculum, kit
field-guide/                  Six species, why Dinokeng, three pressures
safety/                       Duty of care in full
dates-and-cost/               Dates, pricing, inclusions, booking terms, guarantee
for-parents/                  The parent's page, including real total cost by market
for-schools/                  Group booking and curriculum mapping
getting-there/                Flights, unaccompanied minors, entry requirements
faq/                          25 questions with FAQPage structured data
apply/                        Three-step application form
thank-you/                    Post-submission confirmation
privacy/  terms/              Legal drafts
404.html
assets/css/site.css           All styling
assets/js/site.js             All behaviour
assets/img/                   WebP with JPEG fallback, via <picture>
```

### A note on the duplicated header and footer

There is no templating, so the header and footer are duplicated in every page and
are byte-identical. Each is wrapped in
`<!-- SHARED HEADER — keep identical across all pages -->` markers so a
find-and-replace across all files works cleanly. **If you edit one, edit all of
them.**

### A note on `404.html`

Every other page uses relative paths. `404.html` is the one exception and uses
root-absolute paths including the repository name, because GitHub Pages serves it
for missing URLs at any depth, where relative paths would resolve against the
wrong directory. **If the repository is renamed, the paths inside `404.html` must
be updated.**

---

## Accessibility and performance notes

- Palette contrast was measured, not assumed. `--brass` (#C08A3E) on the light
  `--bone` background is only **2.6:1 and fails WCAG AA**, so brass is used for
  text on dark sections only. Light sections use `--brass-lo` (4.8:1). Keep that
  rule if you add sections.
- Every image has descriptive alt text. Decorative images have empty alt.
- Skip-to-content link, visible keyboard focus, semantic landmarks, and a
  focus-trapped mobile menu.
- `prefers-reduced-motion` is fully respected: scroll reveals are disabled and
  all content shows immediately.
- Source PNGs were 7 MB each. They ship as WebP with a JPEG fallback instead.
  The PNG masters are not in this repository.

---

## Outstanding decisions — the founders' checklist

Everything below is marked in the HTML with a `CLIENT TO ...` comment.

### Blocking. Do not publish without these.

| # | Item | Where |
|---|---|---|
| 1 | **Set `PLACES.remaining` to the true number.** Currently a demonstration figure. | `assets/js/site.js` |
| 2 | **Confirm final pricing.** US$3,950 founding / US$4,450 standard are market-benchmarked recommendations, not margin calculations. | `dates-and-cost/` |
| 3 | **Have privacy policy and terms reviewed by a qualified solicitor.** Both are structural drafts. The limitation of liability clause is deliberately left blank. | `privacy/`, `terms/` |
| 4 | **Verify South African entry requirements for minors** with the Department of Home Affairs and an immigration advisor. Do not publish specifics from any other source. | `getting-there/` |
| 5 | **Supply registered company name and registration number.** | homepage, `privacy/`, `terms/` |
| 6 | **Supply insurer name, policy numbers and cover limits.** | homepage, `safety/` |
| 7 | **Confirm the minimum numbers guarantee is commercially acceptable** at four explorers. It is the strongest objection-killer on the site and only works if it is real. | `dates-and-cost/` |

### Credibility. Worth doing before launch.

| # | Item | Where |
|---|---|---|
| 8 | **Apply for SATSA membership.** The single most valuable trust credential a South African operator can hold, and the direct equivalent of ABTA for a UK competitor. The trust block for it is built and commented out. Uncomment only once membership is confirmed. | `index.html` |
| 9 | Obtain **written permission** from Mongena and the Kevin Richardson Wildlife Sanctuary before displaying either logo or trade mark. Text lockups only until then. | `index.html` |
| 10 | Supply **team photographs** (portrait, 4:5, min 800px). Monogram placeholders are in place. | `index.html` |
| 11 | Confirm **curriculum-alignment claims** with the IB, the Duke of Edinburgh's International Award and the relevant exam boards. The page says "maps to", never "accredited". Do not use awarding-body logos without licence. | `for-schools/` |
| 12 | Name the **Safety Officer and chaperone**, with qualifications. | `for-parents/` |

### Content and operations

| # | Item | Where |
|---|---|---|
| 13 | Confirm **actual daily timings** for the day-in-the-life table. Currently a realistic working draft. | `expedition/` |
| 14 | Confirm the **daily update time, channel and sender**. | `safety/`, `for-parents/` |
| 15 | Confirm the **device and phone policy** and the lodge's real connectivity. | `for-parents/` |
| 16 | Verify **flight and insurance figures** in the total-cost table against live quotes, and add a "prices checked on [date]" line. Stale indicative figures are worse than none. | `for-parents/` |
| 17 | Verify **airline routes and unaccompanied-minor policies** with each carrier. These change by season. | `getting-there/` |
| 18 | Confirm **cancellation brackets** against the lodge and reserve contracts. | `dates-and-cost/`, `terms/` |
| 19 | Confirm whether the **accompanying teacher place is free or reduced**. | `for-schools/` |
| 20 | Supply the **one-page school brief PDF**. The button routes to the enquiry form until it exists. | `for-schools/` |
| 21 | Re-check **IUCN Red List statuses** and re-check annually. | `field-guide/` |
| 22 | Supply **WhatsApp number** and a **scheduling link** for founder calls. | site footer |
| 23 | List every **sub-processor** by name for the privacy policy. Mandatory under POPIA and GDPR. | `privacy/` |
| 24 | Confirm **safeguarding record retention period** with a solicitor. Records concerning minors often carry much longer statutory retention. | `privacy/` |
| 25 | Refresh **indicative currency conversions** at launch, dated, or remove them. | `dates-and-cost/` |

### Imagery

All current photography is AI-generated atmospheric imagery containing no
identifiable people, by design. See `assets/img/README.md`.

**Replace with real photography from the December 2026 cohort as soon as it
exists and written consent is held. Never present generated imagery as
documentation of a real expedition.**

### Testimonials

The testimonial carousel is **built and commented out** on the homepage. It must
only be populated with real quotes for which written consent is held. No
placeholder or invented quote should ever go in it. Until then, the signed
founders' statement stands in its place deliberately.

---

## Analytics

None in this build. A commented Plausible snippet sits in the `<head>` of every
page with a note. If analytics are added, update the privacy policy first.
