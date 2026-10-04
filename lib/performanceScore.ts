import { AnalysisResult } from './analyze';
import { DeterministicAuditSummary } from './scannability';
import { LanguageAuditResult } from './language';
import { GoogleAiOverviewData } from './serp';

export interface PerformanceFactor {
  name: string;
  weight: number; // percentage
  score: number;  // 0 - 100
  label: string;
}

export interface OverallPerformanceReport {
  overallScore: number; // 0 - 100
  grade: 'Excellent' | 'Good' | 'Needs Improvement' | 'Critical Issues';
  summary: string;
  // 4 Core Performance Pillars
  pillars: {
    searchIntent: PerformanceFactor;      // 30% weight
    contentQuality: PerformanceFactor;    // 25% weight (includes First-Hand Data)
    scannabilityUx: PerformanceFactor;    // 25% weight
    competitiveParity: PerformanceFactor; // 20% weight (includes Language Match)
  };
  // Detailed algorithmic breakdown factors
  factors: {
    searchIntent: PerformanceFactor;
    contentQuality: PerformanceFactor;
    scannabilityUx: PerformanceFactor;
    competitiveParity: PerformanceFactor;
    languageAlignment: PerformanceFactor;
    firstHandData: PerformanceFactor;
  };
}

/**
 * Algorithmic calculation of the Overall Performance Score across the 4 Performance Pillars:
 * 1. Search Intent (30% weight) - Query relevance & 4-intent satisfaction
 * 2. Content Quality (25% weight) - Content readability & first-hand data/experience
 * 3. UI/UX Scannability (25% weight) - Structure, formatting & DOM assets (H2, images, TOC)
 * 4. Competitive Parity (20% weight) - Competitor topic coverage, schema, AI presence & language match
 */
export function calculateOverallPerformance(
  analysis: AnalysisResult,
  scannabilityAudit?: DeterministicAuditSummary,
  languageAudit?: LanguageAuditResult,
  aiOverview?: GoogleAiOverviewData
): OverallPerformanceReport {
  // 1. Search Intent Pillar
  let intentMatchScore = analysis.score || 50;
  if (analysis.intentMismatch) {
    intentMatchScore = Math.max(10, intentMatchScore - 15);
  }
  const queryRelevanceScore = analysis.factorScores?.queryRelevance || intentMatchScore;
  const searchIntentPillarScore = Math.max(10, Math.min(100, Math.round(queryRelevanceScore * 0.5 + intentMatchScore * 0.5)));

  // 2. Content Quality & First-Hand Data Pillar
  const readabilityScore = analysis.factorScores?.readability || 65;
  const firstHandDataScore = analysis.factorScores?.firstHandDataBonus || 30;
  const contentQualityPillarScore = Math.max(10, Math.min(100, Math.round(readabilityScore * 0.6 + firstHandDataScore * 0.4)));

  // 3. UI/UX Scannability Pillar
  let domScannabilityScore = scannabilityAudit?.scannabilityScore ?? 65;
  if (scannabilityAudit?.checks) {
    const passCount = scannabilityAudit.checks.filter((c) => c.status === 'pass').length;
    const totalChecks = scannabilityAudit.checks.length;
    if (totalChecks > 0) {
      domScannabilityScore = Math.round((passCount / totalChecks) * 100);
    }
  }
  const structureScore = analysis.factorScores?.structure || domScannabilityScore;
  const scannabilityPillarScore = Math.max(10, Math.min(100, Math.round(domScannabilityScore * 0.6 + structureScore * 0.4)));

  // 4. Competitive Parity & Language Match Pillar
  let compScore = 70;
  const missingCount = analysis.missingTopics?.length || 0;
  compScore -= Math.min(30, missingCount * 8);

  const schemaCount = analysis.suggestedSchema?.length || 0;
  if (schemaCount > 0) compScore += 15;

  if (aiOverview?.triggered) {
    if (aiOverview.organicCompetitorOverlapCount > 0) compScore += 15;
    else compScore += 5;
  } else {
    compScore += 10;
  }
  compScore = Math.max(10, Math.min(100, compScore));

  let langScore = 100;
  if (languageAudit?.isMismatch) {
    if (languageAudit.mismatchSeverity === 'high') {
      langScore = 30;
    } else if (languageAudit.mismatchSeverity === 'medium') {
      langScore = 60;
    }
  }
  const competitiveParityPillarScore = Math.max(10, Math.min(100, Math.round(compScore * 0.7 + langScore * 0.3)));

  // Weighted algorithmic formula for Overall Performance Score
  const weightedTotal =
    searchIntentPillarScore * 0.30 +
    contentQualityPillarScore * 0.25 +
    scannabilityPillarScore * 0.25 +
    competitiveParityPillarScore * 0.20;

  const finalScore = Math.max(10, Math.min(100, Math.round(weightedTotal)));

  let grade: OverallPerformanceReport['grade'] = 'Good';
  let summary = '';

  if (finalScore >= 80) {
    grade = 'Excellent';
    summary = 'Exceptional overall optimization across search intent, content quality, scannability, and competitive signals.';
  } else if (finalScore >= 60) {
    grade = 'Good';
    summary = 'Solid overall foundation with specific structural, topical, or intent gaps preventing page 1 dominance.';
  } else if (finalScore >= 40) {
    grade = 'Needs Improvement';
    summary = 'Moderate performance. Multiple key areas require attention, notably intent alignment, content depth, or scannability.';
  } else {
    grade = 'Critical Issues';
    summary = 'Significant misalignment with top ranking competitors across intent, language, content quality, or structure.';
  }

  return {
    overallScore: finalScore,
    grade,
    summary,
    pillars: {
      searchIntent: {
        name: 'Search Intent',
        weight: 30,
        score: searchIntentPillarScore,
        label: `${analysis.intentCategory} Intent · ${queryRelevanceScore}% Relevance`,
      },
      contentQuality: {
        name: 'Content Quality & First-Hand Data',
        weight: 25,
        score: contentQualityPillarScore,
        label: `${readabilityScore}% Readability · ${firstHandDataScore}% Original Insights`,
      },
      scannabilityUx: {
        name: 'UI/UX Scannability',
        weight: 25,
        score: scannabilityPillarScore,
        label: `${scannabilityAudit?.userMetrics.h2Count || 0} H2 Sections · ${domScannabilityScore}% DOM Health`,
      },
      competitiveParity: {
        name: 'Competitive Parity & Language',
        weight: 20,
        score: competitiveParityPillarScore,
        label: `${missingCount === 0 ? 'Full Topic Coverage' : `${missingCount} Missing Topics`} · ${langScore}% Language Match`,
      },
    },
    factors: {
      searchIntent: {
        name: 'Search Intent Match',
        weight: 30,
        score: searchIntentPillarScore,
        label: `${analysis.intentCategory} Intent`,
      },
      contentQuality: {
        name: 'Content Quality & Readability',
        weight: 15,
        score: readabilityScore,
        label: 'Flow & Scannability',
      },
      scannabilityUx: {
        name: 'UI/UX Scannability & Structure',
        weight: 25,
        score: scannabilityPillarScore,
        label: `${scannabilityAudit?.userMetrics.h2Count || 0} H2 Sections`,
      },
      competitiveParity: {
        name: 'Competitive Parity & Coverage',
        weight: 20,
        score: compScore,
        label: `${missingCount === 0 ? 'Full Topic Coverage' : `${missingCount} Missing Topics`}`,
      },
      languageAlignment: {
        name: 'SERP Language Match',
        weight: 10,
        score: langScore,
        label: languageAudit?.isMismatch
          ? `${languageAudit.userLanguage.name} vs ${languageAudit.favoredSerpLanguage.name}`
          : `${languageAudit?.userLanguage.name || 'Matched'} (100%)`,
      },
      firstHandData: {
        name: 'First-Hand Data & Experience',
        weight: 10,
        score: firstHandDataScore,
        label: 'Original Insights & Proof',
      },
    },
  };
}
