import { AnalysisResult } from './analyze';
import { DeterministicAuditSummary } from './scannability';
import { LanguageAuditResult } from './language';
import { GoogleAiOverviewData } from './serp';

export interface PerformanceFactor {
  name: string;
  weight: number; // percentage, e.g. 35
  score: number;  // 0 - 100
  label: string;
}

export interface OverallPerformanceReport {
  overallScore: number; // 0 - 100
  grade: 'Excellent' | 'Good' | 'Needs Improvement' | 'Critical Issues';
  summary: string;
  factors: {
    searchIntent: PerformanceFactor;      // 35% weight
    scannabilityUx: PerformanceFactor;    // 25% weight
    competitiveParity: PerformanceFactor; // 25% weight
    languageAlignment: PerformanceFactor; // 15% weight
  };
}

/**
 * Algorithmic calculation of the Overall Performance Score.
 * Aggregates all deterministic & semantic audits into a unified 0-100 metric:
 * 1. Search Intent Satisfaction (35% weight)
 * 2. UI, UX & Scannability DOM Audit (25% weight)
 * 3. Competitive Coverage & SERP Features (25% weight)
 * 4. SERP Language & Regional Alignment (15% weight)
 */
export function calculateOverallPerformance(
  analysis: AnalysisResult,
  scannabilityAudit?: DeterministicAuditSummary,
  languageAudit?: LanguageAuditResult,
  aiOverview?: GoogleAiOverviewData
): OverallPerformanceReport {
  // 1. Search Intent Score (0 - 100)
  let intentScore = analysis.score || 50;
  if (analysis.intentMismatch) {
    intentScore = Math.max(10, intentScore - 15);
  }

  // 2. UI, UX & Scannability Score (0 - 100)
  let scannabilityScore = scannabilityAudit?.scannabilityScore ?? 65;
  if (scannabilityAudit?.checks) {
    const passCount = scannabilityAudit.checks.filter((c) => c.status === 'pass').length;
    const totalChecks = scannabilityAudit.checks.length;
    if (totalChecks > 0) {
      scannabilityScore = Math.round((passCount / totalChecks) * 100);
    }
  }

  // 3. Competitive Coverage & SERP Features (0 - 100)
  // Evaluates schema markup, missing topics penalty, and AI overview citation presence
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

  // 4. Language & Regional Alignment (0 - 100)
  let langScore = 100;
  if (languageAudit?.isMismatch) {
    if (languageAudit.mismatchSeverity === 'high') {
      langScore = 30;
    } else if (languageAudit.mismatchSeverity === 'medium') {
      langScore = 60;
    }
  }

  // Weighted algorithmic formula
  const weightedTotal =
    intentScore * 0.35 +
    scannabilityScore * 0.25 +
    compScore * 0.25 +
    langScore * 0.15;

  const finalScore = Math.max(10, Math.min(100, Math.round(weightedTotal)));

  let grade: OverallPerformanceReport['grade'] = 'Good';
  let summary = '';

  if (finalScore >= 80) {
    grade = 'Excellent';
    summary = 'Exceptional overall optimization across search intent, DOM structure, and competitive SERP signals.';
  } else if (finalScore >= 60) {
    grade = 'Good';
    summary = 'Solid overall foundation with specific structural or topical gaps preventing page 1 dominance.';
  } else if (finalScore >= 40) {
    grade = 'Needs Improvement';
    summary = 'Moderate performance. Multiple key areas require attention, notably intent alignment or scannability.';
  } else {
    grade = 'Critical Issues';
    summary = 'Significant misalignment with top ranking competitors across intent, language, or content structure.';
  }

  return {
    overallScore: finalScore,
    grade,
    summary,
    factors: {
      searchIntent: {
        name: 'Search Intent Match',
        weight: 35,
        score: Math.round(intentScore),
        label: `${analysis.intentCategory} Intent`,
      },
      scannabilityUx: {
        name: 'UI/UX & Scannability',
        weight: 25,
        score: Math.round(scannabilityScore),
        label: `${scannabilityAudit?.userMetrics.h2Count || 0} H2 Sections`,
      },
      competitiveParity: {
        name: 'Competitive Parity',
        weight: 25,
        score: Math.round(compScore),
        label: `${missingCount === 0 ? 'Full Topic Coverage' : `${missingCount} Missing Topics`}`,
      },
      languageAlignment: {
        name: 'SERP Language Match',
        weight: 15,
        score: Math.round(langScore),
        label: languageAudit?.isMismatch
          ? `${languageAudit.userLanguage.name} vs ${languageAudit.favoredSerpLanguage.name}`
          : `${languageAudit?.userLanguage.name || 'Matched'} (100%)`,
      },
    },
  };
}
