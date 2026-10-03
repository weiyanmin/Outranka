---
doc: spec
status: approved
---

# Outranka — Technical Spec

## How This Works, In Plain Language
Outranka is one web app that runs on your laptop. You open it in the browser, type a keyword, pick a location, and give it either a URL or pasted content. The app then has a small server part (a program that runs on your computer behind the page) that does the work the browser cannot do safely:
1. It asks **SerpAPI** (a service that returns Google results as data) for the top 10 pages for your keyword and location.
2. It downloads each of those 10 pages, pulls out their text and their schema (JSON-LD, the structured data block in a page's code). If you gave a URL, it downloads your page too. If you pasted content, it uses your text.
3. It sends everything to the **Gemini API** (the AI) in one request and asks for a structured answer: the score, the strengths and gaps, recommended topics, suggested structure, a page-type check, and schema suggestions.
4. The page shows the result. You can download it as a file.

Your API keys live in a local file called .env that only the server part can read, so they never show up in the browser or in the public GitHub repo. Nothing is saved between visits. Why this shape: one project, no database, no accounts, two outside services.

## The Core Journey Through the System
PRD ref: prd.md > The Core Journey.
1. **Input page** — you type the keyword, choose Global or a country, and choose URL or pasted content (one only), then press Analyze.
2. **Loading screen** — the browser calls the server part. The server reports each step so the screen can show: Fetching the top 10 results, Reading competitor pages, Analyzing the keyword intent, Comparing your content with competitors.
3. **Server work** — SerpAPI call, page downloads, the Gemini call (see Components).
4. **Result page** — the score at the top, then the sections in the order given in prd.md > Result Screen Contents (in order). The top 10 list is at the bottom, with a Download button.

## Stack
- **Next.js** (App Router, TypeScript) — pages plus server routes in one project. Docs: https://nextjs.org/docs. Chosen on the learner's acceptance of the recommendation; tradeoff: slightly more setup than a plain page, but it is the safe place for keys and for downloading other sites' pages.
- **cheerio** — reads downloaded HTML to extract text, headings, and JSON-LD schema. Docs: https://cheerio.js.org
- **SerpAPI** — top 10 Google results. Docs: https://serpapi.com/search-api
- **Gemini API** (Google AI) via the official JavaScript SDK — the AI judge. Docs: https://ai.google.dev/gemini-api/docs
- Styling: plain CSS (or CSS modules); no component library.
- Unverified, check early in the build: current free-plan limits for SerpAPI and the Gemini API, the current recommended Gemini model name and SDK package, and the exact SerpAPI location parameter.

## Where It Runs and How Someone Tries It
- Runs locally: Node.js 20 or newer. Start with npm install, then npm run dev, then open http://localhost:3000.
- Needs two keys in a .env.local file: SERPAPI_API_KEY and GEMINI_API_KEY. A .env.example with empty values is committed; real keys never are.
- Demo recording: screen-record one full run, for example the keyword best dirty coffee in Phuket with a pasted draft. Submission needs the short demo video and a public GitHub repository. Deployment is optional and is not planned.

## Look and Feel
Carried forward from prd.md > Look and Feel: clean and modern, at most three colors (one neutral background, one text color, one accent), sans-serif font, no gradients, no heavy shadows. Spacious layout with one clear column. The loading screen is polished: a vertical list of steps where the current step is highlighted and finished steps show a check, each with a short detail line. Interface copy is plain and direct. No named references.

## Components

### Input Form
Keyword field, location dropdown (Global plus all countries), a toggle between URL and pasted content showing only one field, and an Analyze button. Basic checks: keyword required, content not empty, URL looks like a URL.
PRD ref: prd.md > Input.

### Loading Screen
Shows the current step and detail text while the analysis runs. Progress comes from the server part, which sends step updates as it works (streaming).
PRD ref: prd.md > The Core Journey (step 4).

### Search Step (SerpAPI)
Calls SerpAPI with the keyword, google engine, 10 results and the chosen country (Global = no country filter). Returns for each result: position, title, link, snippet.
PRD ref: prd.md > Results and Score.

### Page Reader
Downloads each competitor URL (and the learner's URL if given) with a timeout, extracts readable text, headings, and JSON-LD schema types. A page that fails is skipped and noted. If the learner's own URL fails, the app shows: your url is not crawlable.
PRD ref: prd.md > States and Boundaries.

### AI Analysis (Gemini)
One request containing the keyword, location, the learner content, and the competitor summaries (position, title, text excerpt, headings, schema types). It asks for a JSON answer with: intent type, page type of the learner content, per-factor scores, final score, strengths, gaps, recommended topics, suggested structure, schema suggestions, and intent mismatch yes or no with a reason. The prompt includes the scoring rules below.
PRD ref: prd.md > Results and Score, Result Screen Contents (in order).

### Scoring Rules (used in the AI prompt)
Compared with the competitors, top 3 pages weighted more than positions 4-10. Factors, in the order the learner gave: (1) answers the query the user searched, most important; (2) clear structure of the content; (3) page experience, meaning how the content reads: easy to scan, clear headings, easy to follow; (4) bonus for first-hand quality data that the top pages lack. Recommended starting weights, an assumption for the learner to confirm or change: 50 percent answers the query, 25 percent structure, 15 percent readability, 10 percent first-hand data.
PRD ref: prd.md > Results and Score.

### Result Page
Renders the nine sections in the PRD order from the AI JSON plus the SerpAPI list. A page-type mismatch shows a visible warning. The Download button saves the analysis as a Markdown file generated in the browser from the same data.
PRD ref: prd.md > Result Screen Contents (in order).

## Data Model
No database. Data lives only in memory for one run: the form input (browser), the competitor data and AI result (server, then sent to the browser). When the learner leaves or refreshes, it is gone, matching prd.md > States and Boundaries (nothing saved). The only file is the downloaded Markdown analysis.

## File Structure
```
outranka/
├── app/
│   ├── page.tsx              # Input form, loading screen, result page
│   ├── globals.css           # Palette, font, layout
│   └── api/
│       └── analyze/route.ts  # Server route: runs the whole analysis, streams steps
├── lib/
│   ├── serp.ts               # SerpAPI call
│   ├── readPage.ts           # Download page, extract text, headings, schema
│   ├── analyze.ts            # Builds the Gemini request and parses the JSON
│   ├── scoring.ts            # Scoring rules and weights used in the prompt
│   └── countries.ts          # Global plus country list for the dropdown
├── components/               # InputForm, LoadingSteps, ResultView, CompetitorList
├── devpost/                  # Devpost learning workspace
├── .env.example              # Empty key names
├── .gitignore
└── README.md
```

## External Services and Dependencies
- **SerpAPI** — GET https://serpapi.com/search.json with engine=google, q, num=10, a location or country parameter, and api_key. Response organic_results holds position, title, link, snippet. Key needed. Free plan limited (verify). Docs: https://serpapi.com/search-api
- **Gemini API** — generateContent with a JSON response format. Key needed from Google AI Studio. Free tier has rate limits (verify). Docs: https://ai.google.dev/gemini-api/docs
- **Competitor websites** — plain page downloads; some will block or time out.

## Important Failure Modes
- **Learner URL cannot be opened** -> message: your url is not crawlable.
- **Some competitor pages cannot be downloaded** -> they are skipped, and the result notes that fewer than 10 were read. If too few are readable, show an error asking to try again.
- **SerpAPI or Gemini fails, is slow, or the key is missing** -> a plain error message on the loading screen with a Try again button; no partial result is shown as if it were complete.
- **AI returns malformed JSON** -> retry once, then show the error message.
- **Empty or very short input, or no results for the keyword** -> a plain message under the form or on the result screen.

## What Was Simplified and Why
- **No saving** instead of saved analyses — removed by the learner; it would need storage and a way to reopen results.
- **One AI call** instead of separate calls per feature — fewer failure points and less cost; the fuller version splits steps for accuracy.
- **Page experience as readability only** instead of speed and mobile checks — the learner chose how the content reads; technical performance would need another service and cannot be measured for pasted text.
- **Local run plus recording** instead of deployment.

## Decisions and Open Issues
**Learner choices:** recommended stack accepted (Next.js, SerpAPI, Gemini API, local run). Score priority: answers the query first, then structure, then readability-style page experience. Page experience means how the content reads.
**Assumptions to confirm:** the starting weights (50/25/15/10), the competitor page text sent to the AI is an excerpt, and the Markdown download format.
**Learning moment:** the learner was unsure what page experience meant for the score. Clarified by choosing readability over technical speed; check in the build that the result explanation uses readability language.
**Open, resolved in the build:**
- Page type of pasted content: the AI infers it from the text; this is an assumption (prd.md > Open Questions). Verify the warning is sensible for pasted drafts.
- Wording of non-URL error messages (prd.md > Open Questions).
- Free-plan limits and current Gemini model name, to check first in the build.
