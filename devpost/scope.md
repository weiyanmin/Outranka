---
doc: scope
status: approved
---

# Outranka

An SEO tool that scores how well your draft (or URL) satisfies the search intent of a keyword, by comparing it against the current top 10 Google results.

## The Unique Kernel
One percentage score for a keyword and location, e.g. "You satisfy 60% of the intent. Here are the three specific topics you are missing." Intent comes from the keyword itself: "best dirty coffee in Phuket" wants a list of places, so content that does not deliver that scores low. It checks your content against what the top 10 actually cover.

## Who It's For
SEO specialists (the learner is one), digital marketers with SEO duties, and digital marketing agencies who produce content topics for clients. Today they research manually: read each ranking page and judge whether it answers what the searcher wants. Businesses and agencies struggle to find good topics and know what to add.

## The Core Loop
Type a keyword and location, paste a draft or a URL, get the score and the top three missing topics. Revise the draft and check again.

## Inspiration & Identity
Not specified yet.

## Why This Matters to the Learner
"Content is king in modern SEO." Most businesses and agencies struggle to find good content topics and what to add to a piece. The learner will use it as an SEO specialist too, and wants to learn to work better with AI coding agents.

## What "Working" Looks Like
Enter "best dirty coffee in Phuket", paste a draft (or a URL), and see a satisfaction percentage and three missing topics. For a list-intent keyword, a good page has the list of cafes plus details (location, price) and the vibe; the top 10 pages show which of these searchers expect. Alongside it, the schema types the top pages use that yours lacks. The wow moment: a percentage and three concrete gaps appear within seconds.

## The POC Boundary
- Keyword + location input, top 10 results fetched through SerpAPI.
- Intent read from the keyword (what kind of page the searcher wants).
- Input: pasted draft or a target URL.
- AI analysis: an AI reads the top 10 pages and judges how well each answers the user query (a good page is one that answers the query best); your draft is scored against that. The exact formula is for the PRD.
- Top-3 weighting: the top 3 ranking pages are likely the most relevant content, so they count for more than positions 4-10 when judging what a good page covers. The exact weights are for the PRD.
- First-hand data weight: if your content offers more first-hand, quality data than the top-ranking pages (original information, e.g. your own visits, prices, photos, tasting notes), the AI adds weight for that in the score.
- Output: one intent-satisfaction percentage and the top three missing topics, i.e. topics the top-performing pages cover that your page lacks.
- Schema suggestion: the schema types the top pages use, suggested for your page.
- Suggested content structure and an intent mismatch warning (page type vs. what the top results are). Added during the PRD.

## Later
- Difficulty score to compete with the top results.
- Keyword clusters.
- What is unique about the #1 page, and per-page breakdown (page type, titles, descriptions).

## Explicitly Cut
Nothing is cut outright. Schema detection is in the first version at the learner's request, as a secondary output after the score. Everything else beyond it is Later because it would not fit 2-4 hours and is not needed to prove the kernel.
