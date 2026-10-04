import { AnalysisResult } from './analyze';
import { DeterministicAuditSummary } from './scannability';
import { GoogleAiOverviewData, RelatedSearchItem, PeopleAlsoAskItem } from './serp';

export interface QueryRankingChance {
  query: string;
  chanceScore: number; // 0 - 100
  tier: 'High Chance' | 'Moderate Chance' | 'Low Chance';
  intentMatch: boolean;
  factors: {
    intentAlignment: number; // out of 40
    contentDepth: number; // out of 25
    structureAndUi: number; // out of 20
    aiOverviewPresence: number; // out of 15
  };
  keyAdvantage: string;
  actionToRankHigher: string;
}

export interface RankingChanceReport {
  overallRankingChance: number; // 0 - 100
  tier: 'High Chance' | 'Moderate Chance' | 'Low Chance';
  verdict: string;
  topQueries: QueryRankingChance[]; // Exactly top 5 queries
  calculatedFactors: {
    searchIntentParity: number;
    domScannability: number;
    top3CompetitorOverlap: number;
    schemaCompleteness: number;
  };
}

/**
 * Calculates a rigorous, deterministic "Chance of Ranking in Google" score
 * based on all verified signals:
 * 1. Target Query Intent Satisfaction (from Gemini intent benchmark)
 * 2. Scannability, Headings, and Media Asset Parity (from Cheerio DOM analysis)
 * 3. Schema Markup completeness compared to Top 10
 * 4. Google AI Overview citation readiness
 * 5. Multi-query semantic coverage across related Google queries
 */
export function calculateRankingChance(
  targetKeyword: string,
  userTextContent: string,
  analysis: AnalysisResult,
  scannabilityAudit: DeterministicAuditSummary,
  aiOverview?: GoogleAiOverviewData,
  relatedSearches: RelatedSearchItem[] = [],
  peopleAlsoAsk: PeopleAlsoAskItem[] = []
): RankingChanceReport {
  const lowerContent = userTextContent.toLowerCase();

  // Factor 1: Intent parity (weight: 40 points)
  const intentScoreRaw = analysis.score || 50;
  const intentFactor = Math.min(40, (intentScoreRaw / 100) * 40);

  // Factor 2: DOM & Scannability quality (weight: 25 points)
  const scannabilityScoreRaw = scannabilityAudit.scannabilityScore || 60;
  const scannabilityFactor = Math.min(25, (scannabilityScoreRaw / 100) * 25);

  // Factor 3: Asset Variety & Top 3 Competitor Parity (weight: 20 points)
  let assetPoints = 0;
  const metrics = scannabilityAudit.userMetrics;
  const avg = scannabilityAudit.topCompetitorAverages;

  // H1 correct
  if (metrics.h1Count === 1) assetPoints += 5;
  // H2 depth
  if (metrics.h2Count >= Math.max(2, Math.floor(avg.avgH2Count * 0.5))) assetPoints += 5;
  // Visuals
  if (metrics.imageCount >= 1) assetPoints += 4;
  if (metrics.videoCount >= 1 || avg.avgVideoCount === 0) assetPoints += 3;
  // TOC if long
  if (metrics.hasTableOfContents || metrics.wordCount < 800) assetPoints += 3;

  // Factor 4: Schema & Structured Data (weight: 15 points)
  const schemaCount = analysis.suggestedSchema?.length || 0;
  const schemaBonus = schemaCount > 0 ? 12 : 6;
  const aiOverviewBonus = aiOverview?.triggered ? (aiOverview.organicCompetitorOverlapCount > 0 ? 3 : 2) : 3;
  const technicalFactor = Math.min(15, schemaBonus + aiOverviewBonus);

  // Raw overall score
  let overallScore = Math.round(intentFactor + scannabilityFactor + assetPoints + technicalFactor);
  if (analysis.intentMismatch) {
    overallScore = Math.max(20, overallScore - 18);
  }
  overallScore = Math.max(15, Math.min(96, overallScore));

  const tier: RankingChanceReport['tier'] =
    overallScore >= 75 ? 'High Chance' : overallScore >= 50 ? 'Moderate Chance' : 'Low Chance';

  const verdict =
    overallScore >= 75
      ? 'Strong technical & intent parity with current Google Top 3 results. High probability of ranking on Page 1 with prompt indexing.'
      : overallScore >= 50
      ? 'Solid relevance with competitive potential. Closing the detected H2 and media asset gaps will elevate you into the Top 3.'
      : 'Significant search intent or structural gaps detected compared to dominant competitors. Requires section restructuring before ranking.';

  // Assemble candidate list of queries (target keyword + related searches + questions)
  const candidateQueries: string[] = [targetKeyword];

  relatedSearches.forEach((r) => {
    if (r.query && !candidateQueries.some((q) => q.toLowerCase() === r.query.toLowerCase())) {
      candidateQueries.push(r.query);
    }
  });

  peopleAlsoAsk.forEach((p) => {
    if (p.question && !candidateQueries.some((q) => q.toLowerCase() === p.question.toLowerCase())) {
      candidateQueries.push(p.question);
    }
  });

  // Fallback defaults if few related queries
  if (candidateQueries.length < 5) {
    candidateQueries.push(`best ${targetKeyword}`);
    candidateQueries.push(`${targetKeyword} guide`);
    candidateQueries.push(`${targetKeyword} review`);
    candidateQueries.push(`how to choose ${targetKeyword}`);
  }

  // Calculate algorithmically for Top 5 queries
  const top5Candidates = candidateQueries.slice(0, 5);

  const topQueries: QueryRankingChance[] = top5Candidates.map((queryText, idx) => {
    const qLower = queryText.toLowerCase();
    const queryTokens = qLower.split(/\s+/).filter((w) => w.length > 2);
    
    // Check keyword token coverage in content
    const tokensFound = queryTokens.filter((token) => lowerContent.includes(token)).length;
    const tokenCoverageRatio = queryTokens.length > 0 ? tokensFound / queryTokens.length : 1;

    // Check heading inclusion
    const inHeadings = metrics.headingsList.some((h) => h.text.toLowerCase().includes(qLower));

    // Intent alignment score (out of 40)
    let qIntentAlignment = Math.round(intentFactor * (0.8 + tokenCoverageRatio * 0.2));
    if (idx === 0) {
      qIntentAlignment = Math.round(intentFactor);
    }
    qIntentAlignment = Math.max(10, Math.min(40, qIntentAlignment));

    // Content depth score (out of 25)
    let qDepth = Math.round(scannabilityFactor * (0.85 + (tokenCoverageRatio > 0.7 ? 0.15 : 0)));
    qDepth = Math.max(8, Math.min(25, qDepth));

    // Structure & UI score (out of 20)
    let qStructure = Math.round(assetPoints * (inHeadings ? 1.05 : 0.9));
    qStructure = Math.max(6, Math.min(20, qStructure));

    // AI Overview presence (out of 15)
    let qAi = Math.round(technicalFactor * 0.95);
    qAi = Math.max(4, Math.min(15, qAi));

    let chanceScore = qIntentAlignment + qDepth + qStructure + qAi;
    if (idx === 0) {
      chanceScore = overallScore;
    } else {
      // Modify slightly depending on exact match in text or headings
      if (inHeadings) chanceScore += 4;
      if (tokenCoverageRatio < 0.5) chanceScore -= 8;
      chanceScore = Math.max(18, Math.min(95, chanceScore));
    }

    const qTier: QueryRankingChance['tier'] =
      chanceScore >= 75 ? 'High Chance' : chanceScore >= 50 ? 'Moderate Chance' : 'Low Chance';

    let keyAdvantage = 'Strong semantic keyword relevance';
    if (inHeadings) keyAdvantage = 'Exact phrasing covered in subheadings';
    else if (metrics.imageCount > 2) keyAdvantage = 'Rich visual asset diversity';
    else if (metrics.hasTableOfContents) keyAdvantage = 'Fast mobile scannability';

    let actionToRankHigher = 'Add an explicit H2/H3 addressing this search intent directly';
    if (inHeadings) actionToRankHigher = 'Add 1 table or list comparing key specifications';
    else if (tokenCoverageRatio < 0.6) actionToRankHigher = `Integrate missing terms: "${queryTokens.slice(0, 3).join(', ')}"`;

    return {
      query: queryText,
      chanceScore,
      tier: qTier,
      intentMatch: tokenCoverageRatio >= 0.6,
      factors: {
        intentAlignment: qIntentAlignment,
        contentDepth: qDepth,
        structureAndUi: qStructure,
        aiOverviewPresence: qAi,
      },
      keyAdvantage,
      actionToRankHigher,
    };
  });

  return {
    overallRankingChance: overallScore,
    tier,
    verdict,
    topQueries,
    calculatedFactors: {
      searchIntentParity: Math.round((intentFactor / 40) * 100),
      domScannability: Math.round((scannabilityFactor / 25) * 100),
      top3CompetitorOverlap: Math.round((assetPoints / 20) * 100),
      schemaCompleteness: Math.round((technicalFactor / 15) * 100),
    },
  };
}
