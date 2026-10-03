import { GoogleGenAI } from '@google/genai';
import { PageContent } from './readPage';
import { SerpResultItem } from './serp';
import { SCORING_RULES_DESCRIPTION } from './scoring';

export interface AnalysisResult {
  score: number;
  keywordIntent: string;
  userPageType: string;
  topPagesType: string;
  intentMismatch: boolean;
  intentMismatchReason?: string;
  factorScores: {
    queryRelevance: number;
    structure: number;
    readability: number;
    firstHandDataBonus: number;
  };
  strengths: string[];
  missingTopics: string[];
  topRecommendations: string[];
  suggestedStructure: {
    heading: string;
    description: string;
  }[];
  suggestedSchema: {
    type: string;
    reason: string;
  }[];
  competitorsAnalyzedCount: number;
}

export async function analyzeContentWithGemini(
  keyword: string,
  location: string,
  userContent: string,
  competitorPages: { serp: SerpResultItem; content: PageContent }[]
): Promise<AnalysisResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing. Please configure it in your .env.local file.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const competitorSummaries = competitorPages.map((c) => ({
    rank: c.serp.position,
    title: c.serp.title,
    url: c.serp.link,
    headings: c.content.headings,
    schemaTypes: c.content.schemaTypes,
    textSample: c.content.textExcerpt ? c.content.textExcerpt.slice(0, 1000) : c.serp.snippet,
  }));

  const prompt = `
You are an expert SEO auditor comparing a creator's content draft against the current top 10 Google search results.

Target Search Keyword: "${keyword}"
Searcher Location: "${location}"

USER CONTENT DRAFT:
"""
${userContent.slice(0, 10000)}
"""

COMPETITOR TOP 10 SEARCH RESULTS AND PAGE DATA:
${JSON.stringify(competitorSummaries, null, 2)}

${SCORING_RULES_DESCRIPTION}

Analyze the user content draft against these competitors. Return a strictly valid JSON object matching this structure:
{
  "score": number (integer between 0 and 100 representing overall search intent satisfaction percentage),
  "keywordIntent": string (description of the searcher's core intent for this query),
  "userPageType": string (inferred page type of the user content, e.g. "Blog Post / Guide", "Product Page", "Review", "Service Page"),
  "topPagesType": string (dominant page type found in the top Google results),
  "intentMismatch": boolean (true if user's page type clashes with what Google ranks, e.g. trying to rank a Product page when Google only ranks Blog/Roundup posts),
  "intentMismatchReason": string (clear warning explanation if intentMismatch is true, otherwise empty string),
  "factorScores": {
    "queryRelevance": number (0-100),
    "structure": number (0-100),
    "readability": number (0-100),
    "firstHandDataBonus": number (0-100)
  },
  "strengths": string[] (list of 2-4 areas where the user content is already strong),
  "missingTopics": string[] (EXACTLY 3 specific, actionable topics or subtopics that top ranking competitors cover but the user lacks),
  "topRecommendations": string[] (3-5 priority improvements to outrank competitors),
  "suggestedStructure": [
    { "heading": "Heading Title", "description": "What to cover under this section to satisfy user query" }
  ],
  "suggestedSchema": [
    { "type": "SchemaType (e.g. Article, FAQPage, LocalBusiness, ItemList)", "reason": "Why this schema is recommended based on top competitors" }
  ]
}

Only output valid JSON. Do not wrap in markdown code blocks.
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '';
    const cleanedText = responseText.trim().replace(/^```json/, '').replace(/```$/, '').trim();
    const parsed = JSON.parse(cleanedText);

    return {
      score: Math.min(100, Math.max(0, Math.round(Number(parsed.score) || 0))),
      keywordIntent: parsed.keywordIntent || 'Not determined',
      userPageType: parsed.userPageType || 'General Article',
      topPagesType: parsed.topPagesType || 'Blog Post / Guide',
      intentMismatch: Boolean(parsed.intentMismatch),
      intentMismatchReason: parsed.intentMismatchReason || '',
      factorScores: {
        queryRelevance: Math.round(Number(parsed.factorScores?.queryRelevance) || 0),
        structure: Math.round(Number(parsed.factorScores?.structure) || 0),
        readability: Math.round(Number(parsed.factorScores?.readability) || 0),
        firstHandDataBonus: Math.round(Number(parsed.factorScores?.firstHandDataBonus) || 0),
      },
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      missingTopics: Array.isArray(parsed.missingTopics) ? parsed.missingTopics : [],
      topRecommendations: Array.isArray(parsed.topRecommendations) ? parsed.topRecommendations : [],
      suggestedStructure: Array.isArray(parsed.suggestedStructure) ? parsed.suggestedStructure : [],
      suggestedSchema: Array.isArray(parsed.suggestedSchema) ? parsed.suggestedSchema : [],
      competitorsAnalyzedCount: competitorPages.length,
    };
  } catch (err: any) {
    throw new Error(`AI Content Analysis failed: ${err.message}`);
  }
}
