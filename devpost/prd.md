---
doc: prd
status: approved
---

# Outranka — Product Requirements

A web app where an SEO specialist enters a keyword and a content draft or URL, and sees how well that content satisfies search intent compared with the current top 10 Google results. Intended for SEO specialists, digital marketers and agencies.
Source: `scope.md > The Unique Kernel`, `scope.md > Who It's For`.

## The Core Journey
1. The user opens the web app and sees a single input page.
2. They type a keyword, choose a location from the dropdown (Global or any country), and provide **either** a URL **or** pasted content (not both).
3. They press the analyze button.
4. A loading screen shows each step as it happens, e.g. "Fetching the top 10 results", "Analyzing the keyword intent", "Comparing your content with competitors".
5. The result screen appears with the percentage score at the top, then recommendations, strengths and gaps, suggested topics, suggested content structure, schema suggestions, and the top 10 competitor pages at the bottom.
6. The user can download the analysis.
Source: `scope.md > The Core Loop`.

## Screens and Layout
- **Input screen:** keyword field, location dropdown (Global + all countries), and a choice of one input: a text area for pasted content or a field for a URL.
- **Loading screen:** step-by-step progress with a detail text per step.
- **Result screen:** one scrolling page, top to bottom as listed in Features and Behavior.
Source: `scope.md > What "Working" Looks Like`.

## Look and Feel
Clean and modern. Maximum three colors. Sans-serif font. No gradients. The loading screen should look polished. No references given.

## Features and Behavior

### Input
- Keyword text field.
- Location dropdown: Global and all countries. It sets where the searcher is, so the same keyword can show different top 10 results (e.g. "best dirty coffee in Phuket" for the US vs. Thailand).
- Only one content input is accepted per run: a URL or pasted content.

### Results and Score
- Top 10 Google results fetched for the keyword and location.
- The keyword intent is analyzed (e.g. "best dirty coffee in Phuket" wants a list of places with details and the vibe).
- The score compares the user's content against the competitors. An AI judges it on content quality, content structure, and other factors (to be defined in the spec), including how well the content answers the query. The top 3 pages count for more than positions 4-10 because they are likely the most relevant.
- First-hand quality data (original information) in the user's content adds weight to the score.
- One percentage score is shown at the top of the result screen.

### Result Screen Contents (in order)
1. Percentage score (top).
2. Top recommendations and improvements.
3. What your content does well and what it lacks.
4. Intent mismatch warning when the user's page type differs from what the top results are (e.g. a product page where all top results are blog pages).
5. Recommended topics to add.
6. Suggested content structure.
7. Suggested schema, based on the schema types used by the top pages.
8. The top 10 competitor pages for review (bottom).
9. Download analysis.

- As an SEO specialist, I want a single score and the topics I'm missing so that I know what to add to rank.
  - [ ] The percentage appears at the top of the result screen.
  - [ ] The missing topics are listed and relate to the keyword intent.
  - [ ] A page-type mismatch shows a visible warning.
  - [ ] The top 10 pages are listed at the bottom with enough detail to review.
  - [ ] Download produces a file of the analysis.

## States and Boundaries
- **First use** — empty input page, nothing saved.
- **Loading** — step-by-step text while the analysis runs.
- **URL can't be opened** — message: "your url is not crawlable."
- **Other errors** (empty or very short input, no results, a failure mid-analysis) — graceful error messages; exact wording to be decided in the spec/build.
- **Persistence** — nothing is saved between visits; results can only be downloaded.

## Product Decisions
- The project is named Outranka — learner's choice.
- The score is the user's content against the competitors, based on content quality, content structure and more — learner's definition.
- One input only, URL or content, not both — the learner's choice.
- Location dropdown lists Global and all countries — Google shows different results by location.
- Top 3 results weigh more — they are most likely the most relevant content.
- Schema is a suggestion, not a comparison with the user's page — learner's change.
- Intent mismatch warning included — learner's idea.
- Suggested content structure moved from Later into the first version at the learner's request.
- Clean, modern, three colors max, sans-serif, no gradients.
- Saving analyses removed by the learner to keep the proof of concept small.

## What We're Building
Everything above: the input page, the loading screen, the AI-based score, the result screen sections and the download.

## Deferred From the POC
- **Saving analyses** — needs storing and showing results between visits; removed by the learner to keep the PoC small.
- **Difficulty score**, **keyword clusters**, **"unique things in the #1 page"** — from `scope.md > Later`.

## Possible Later Enhancements
Difficulty score to compete with the top results. Keyword clusters. Notes on what is unique about the #1 page.

## Non-Goals
- Accounts or login — not needed to prove the idea.
- Comparing the user's schema with competitors — schema is a suggestion only.

## Open Questions
- How is the page type of pasted content determined for the intent mismatch warning (there is no page to inspect)? Decide in `4-spec`.
- Exact scoring formula: the learner said it is based on content quality, content structure "and more". The full list of factors and the weights for top 3 and first-hand data are decided in `4-spec`.
- Wording for non-URL error messages. Can be settled during the build.
