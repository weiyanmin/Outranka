---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. You can open Outranka and fill in the input form**
  Becomes usable: A running Next.js app showing the input page: keyword, location dropdown (Global plus all countries), a URL or pasted-content toggle, and an Analyze button, in the clean three-color style. Pressing Analyze only validates the input for now.
  Why now: Bootstraps the project and gives every later slice somewhere to land; the visual direction is set once here.
  PRD ref: `prd.md > Input`, `prd.md > Look and Feel`, `prd.md > Screens and Layout`
  Spec ref: `spec.md > Input Form`, `spec.md > Stack`, `spec.md > File Structure`, `spec.md > Look and Feel`
  Build: Scaffold Next.js (App Router, TypeScript) per the file structure, add .env.example, build the input form with the country list, the one-input-only toggle, basic validation, and the plain CSS styling.
  Verify (mechanical): npm run build succeeds; start the dev server and confirm the page loads at http://localhost:3000 with no errors; confirm empty keyword or empty content shows a message.
  Learner check: Open the app, try the form, and say whether the look is clean, modern and three colors the way you pictured it.
  Commit: `Add Outranka input form`

- [x] **2. The top 10 Google results appear for your keyword and location**
  Becomes usable: Press Analyze and see the real top 10 results (position, title, link, snippet) from SerpAPI for the keyword and chosen country.
  Why now: SerpAPI and the secret key setup are the first unfamiliar outside dependency; it is the riskiest unknown, so we prove it before building on it.
  PRD ref: `prd.md > Results and Score`
  Spec ref: `spec.md > Search Step (SerpAPI)`, `spec.md > External Services and Dependencies`
  Build: Add the server route and lib/serp.ts, read SERPAPI_API_KEY from .env.local, call SerpAPI, and show the 10 results on the page. Confirm current free-plan limits and the location parameter first.
  Verify (mechanical): With a real key in .env.local, run a search for best dirty coffee in Phuket and confirm 10 results are returned; confirm a missing key shows a plain error.
  Learner check: Enter best dirty coffee in Phuket with Global, then with another country, and see whether the top 10 lists differ.
  Commit: `Fetch top 10 results with SerpAPI`

- [x] **3. You get a score and the missing topics for your content**
  Becomes usable: The kernel: with a keyword and your pasted content or URL, the app reads the competitor pages, asks Gemini, and shows the percentage score with the top missing topics.
  Why now: This is the unique kernel and the other big unknown (the AI judge and page reading), so it comes right after search works.
  PRD ref: `prd.md > Results and Score`, `prd.md > Result Screen Contents (in order)` (items 1 and 5)
  Spec ref: `spec.md > Page Reader`, `spec.md > AI Analysis (Gemini)`, `spec.md > Scoring Rules (used in the AI prompt)`
  Build: Add lib/readPage.ts (download, text, headings, schema), lib/scoring.ts, lib/analyze.ts with the Gemini call returning JSON, and show the score and missing topics. Confirm the current Gemini model name and SDK first.
  Verify (mechanical): Run the full flow for best dirty coffee in Phuket with a short pasted draft and confirm a percentage and topics come back as valid JSON; run with a URL that cannot be opened and confirm the message: your url is not crawlable.
  Learner check: Paste a real draft and check whether the percentage and the missing topics make sense to you as an SEO specialist.
  Commit: `Score content against top 10 with Gemini`

- [x] **4. A step-by-step loading screen shows progress**
  Becomes usable: While analyzing, a polished loading screen shows each step with detail text instead of a frozen page.
  Why now: Slice 3 is slow enough that the loading screen is now clearly needed, and the steps are real to report.
  PRD ref: `prd.md > The Core Journey` (step 4), `prd.md > States and Boundaries`
  Spec ref: `spec.md > Loading Screen`, `spec.md > The Core Journey Through the System`
  Build: Stream step updates from the server route and render the steps list (current highlighted, finished checked) with the detail lines.
  Verify (mechanical): Run a full analysis and confirm each step message appears in order and the result shows after the last step.
  Learner check: Run an analysis and say whether the loading screen feels polished and the step texts make sense.
  Commit: `Add step-by-step loading screen`

- [x] **5. The full result page shows every section**
  Becomes usable: The result page in the PRD order: score, recommendations and improvements, strengths and gaps, intent mismatch warning, recommended topics, suggested structure, suggested schema, and the top 10 competitor list.
  Why now: The data for all sections already comes from the same AI response; this makes it visible once the core path is trusted.
  PRD ref: `prd.md > Result Screen Contents (in order)`
  Spec ref: `spec.md > Result Page`, `spec.md > AI Analysis (Gemini)`
  Build: Extend the prompt and parsing for all sections, render each in order with a visible mismatch warning, and add the competitor list at the bottom.
  Verify (mechanical): Run a full analysis and confirm all nine sections render in order; test a keyword and content type that should trigger the mismatch warning.
  Learner check: Read the whole result page as a client would and tell me what is missing, confusing or wrong.
  Commit: `Render full result page`

- [x] **6. You can download the analysis and errors are graceful**
  Becomes usable: A Download button saves the analysis as a Markdown file, and failures show plain messages with a Try again option.
  Why now: These are the finishing behaviors that make the demo safe and complete.
  PRD ref: `prd.md > Features and Behavior` (download), `prd.md > States and Boundaries`
  Spec ref: `spec.md > Result Page`, `spec.md > Important Failure Modes`
  Build: Generate the Markdown file in the browser from the result data; add error handling for SerpAPI or Gemini failure, malformed AI output (retry once), skipped competitor pages, and no results.
  Verify (mechanical): Download and open the file to confirm contents; simulate a missing key and a bad URL and confirm the messages.
  Learner check: Download the analysis, open it, and try breaking the app with empty or strange input.
  Commit: `Add download and graceful errors`

## Hands-on Checkpoints

- [ ] Early usable behavior explored — after slice 3, when the real score first appears and can shape the remaining slices
- [x] Final kick-the-tires exploration and feedback completed — learner said, “I think all good now”; no revisions requested.

## Final Review

- [x] Final review complete — learner confirmed the app is good to go; no final-review fixes requested.

## Code Tour and App Map

- [x] Learning activity complete — brief evidence-based recap of the URL-to-ranking code path.
- [x] Optional edit and transfer reflection addressed — kept code tour read-only; optional transfer question offered.
- [x] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: Brief source-based recap of `app/page.tsx > handleSubmit`, `lib/rankingMatch.ts > findSiteRankings`, and `app/results/page.tsx > ResultsPage`; the distinction between exact-page and same-host matches was explained. The production build passed, but no live SERP behavior was run during the recap.
Route and stops: Reference route shared: `app/page.tsx > Home > handleSubmit`, `lib/rankingMatch.ts > findSiteRankings`, and `app/results/page.tsx > ResultsPage`.
Edit outcome: No app-code edit; recap-only to preserve the mixed existing worktree.
Reflection: Optional transfer question offered in chat; any personal response belongs only in the ignored profile.
Activity mode: Brief evidence-based recap; no interactive editor walkthrough claimed.

## Revisions

- The planned early usable-behavior checkpoint after slice 3 was not recorded at that point. It remains unchecked rather than being backdated; the final full-app review is separately completed.
