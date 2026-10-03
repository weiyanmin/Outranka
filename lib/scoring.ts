export const SCORING_RULES_DESCRIPTION = `
SCORING METHODOLOGY AND WEIGHTS:
1. Target Query Relevance & Intent Satisfaction (Weight: 50%):
   - Does the user's content directly and thoroughly answer what searchers want for this query?
   - Compare heavily against the TOP 3 ranking pages, as they are the primary benchmark of what Google ranks highest.
   - If the keyword intent is informational, list-based, commercial, or transactional, does the user match that intent?
2. Content Structure & Formatting (Weight: 25%):
   - Clear visual and logical hierarchy, descriptive subheadings (H2, H3), bullet points, and organized sections.
3. Content Readability & Page Experience (Weight: 15%):
   - How the content reads: easy to scan, clear headings, natural flow, free of unnecessary fluff.
4. First-hand Quality Data & Original Experience (Weight: 10% bonus):
   - Presence of original information that competitor pages lack: e.g. personal visits, concrete prices, tasting notes, specific local tips, direct recommendations, or proprietary observations.

TOP-3 WEIGHTING RULE:
Give double consideration to what the top 3 ranking competitor pages include versus positions 4-10. If the top 3 consistently cover a specific angle (e.g. price breakdown, parking, exact location vibe) and the user's draft omits it, penalize the score accordingly.
`;
