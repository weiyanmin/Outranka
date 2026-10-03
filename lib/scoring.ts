export type SearchIntentCategory = 'Informational' | 'Commercial' | 'Transactional' | 'Navigational';

export const SCORING_RULES_DESCRIPTION = `
THE 4 CORE TYPES OF SEO SEARCH INTENT:
1. Informational: User wants to learn, discover, or understand a concept (e.g., guides, tutorials, "what is", "how to").
2. Commercial (Commercial Investigation): User is researching and comparing products, cafes, places, or services before committing (e.g., "best of" lists, roundups, reviews, comparisons like "best dirty coffee in Phuket").
3. Transactional: User is ready to buy, book, order, subscribe, or download immediately (e.g., product checkouts, pricing pages, booking portals).
4. Navigational: User is searching for a specific brand, destination, or login portal (e.g., brand homepage, specific portal).

INTENT MATCHING IN SCORING:
- First classify the target query into one of the 4 intent categories: "Informational", "Commercial", "Transactional", or "Navigational".
- Check whether the user's content satisfies the EXPECTED intent type for this query:
  - If the query is Commercial (e.g. "best..."), searchers expect comparison, lists, pricing, vibes, and multiple options. Providing a single transactional product page or a pure generic informational definition fails the intent test.
- Classify each of the top 10 competitor pages into one of the 4 intent categories.

SCORING METHODOLOGY AND WEIGHTS:
1. Target Query Relevance & 4-Intent Satisfaction (Weight: 50%):
   - Does the user's content directly match the query's primary intent type (Informational, Commercial, Transactional, Navigational)?
   - Compare heavily against the TOP 3 ranking pages as the primary benchmark of how Google interprets intent.
2. Content Structure & Formatting (Weight: 25%):
   - Clear visual hierarchy, subheadings (H2, H3), scannable lists, tables/specs if commercial, organized sections.
3. Content Readability & Page Experience (Weight: 15%):
   - Easy to scan, clear headings, natural flow, free of fluff.
4. First-hand Quality Data & Original Experience (Weight: 10% bonus):
   - Original insights (personal visits, concrete prices, tasting notes, specific local tips, direct recommendations) that competitor pages lack.

TOP-3 WEIGHTING RULE:
Give double consideration to what the top 3 ranking competitor pages include versus positions 4-10.
`;
