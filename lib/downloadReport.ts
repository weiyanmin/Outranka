import { AnalysisResult } from './analyze';
import { SerpResultItem } from './serp';
import { getSchemaOrgUrl } from './schema';
import { findSiteRankings } from './rankingMatch';

export interface ReportQuery {
  keyword: string;
  location: string;
  inputType: string;
  sourceUrl?: string;
}

export function buildAnalysisMarkdown(
  query: ReportQuery,
  analysis: AnalysisResult,
  competitors: SerpResultItem[],
) {
  const overall = analysis.overallPerformance;
  const ranking = analysis.rankingChanceReport;
  const scannability = analysis.scannabilityAudit;
  const language = analysis.languageAudit;
  const siteRankings = query.inputType === 'url' && query.sourceUrl
    ? findSiteRankings(query.sourceUrl, competitors)
    : null;

  return [
    '# Outranka SEO Analysis Report',
    '',
    `**Target keyword:** ${query.keyword}  `,
    `**Search region:** ${query.location}  `,
    `**Search intent:** ${analysis.intentCategory}  `,
    `**Target query intent:** ${analysis.keywordIntent}  `,
    ...(query.inputType === 'url' && query.sourceUrl ? [
      `**Submitted page:** ${query.sourceUrl}  `,
      `**Exact-page status:** ${siteRankings?.exactPosition !== null
        ? `Ranking #${siteRankings?.exactPosition}`
        : 'Not detected in the top 10 results'}`,
      `**Other pages from this domain in top 10:** ${siteRankings?.otherPages.length || 0}`,
      ...(siteRankings?.otherPages.map((page) => `- #${page.position} [${page.title || page.link}](${page.link})`) || []),
    ] : []),
    `**Overall performance:** ${overall ? `${overall.overallScore}% (${overall.grade})` : `${analysis.score}%`}`,
    ...(overall ? [
      '',
      overall.summary,
      '',
      '| Performance pillar | Score | Assessment |',
      '| --- | ---: | --- |',
      `| Search intent | ${overall.factors.searchIntent.score}% | ${overall.factors.searchIntent.label} |`,
      `| Content quality & scannability | ${overall.factors.scannabilityUx.score}% | ${overall.factors.scannabilityUx.label} |`,
      `| Competitive parity | ${overall.factors.competitiveParity.score}% | ${overall.factors.competitiveParity.label} |`,
      `| SERP language match | ${overall.factors.languageAlignment.score}% | ${overall.factors.languageAlignment.label} |`,
    ] : []),
    ...(ranking ? [
      '',
      '## Ranking opportunity',
      '',
      `**Chance of ranking:** ${ranking.overallRankingChance}% (${ranking.tier})`,
      '',
      ranking.verdict,
      '',
      ...ranking.topQueries.map((item, index) => `${index + 1}. **${item.query}** — ${item.chanceScore}% (${item.tier})\n   - Advantage: ${item.keyAdvantage}\n   - Next step: ${item.actionToRankHigher}`),
    ] : []),
    ...(analysis.intentMismatch ? [
      '',
      '## Search intent mismatch',
      '',
      analysis.intentMismatchReason,
      `- Your page type: ${analysis.userPageType}`,
      `- Google favors: ${analysis.topPagesType}`,
    ] : []),
    ...(language ? [
      '',
      '## SERP language alignment',
      '',
      `- Your content: ${language.userLanguage.name} (${language.userLanguage.code.toUpperCase()})`,
      `- Favored SERP language: ${language.favoredSerpLanguage.name} (${language.favoredSerpLanguage.confidence}% of top results)`,
      `- Status: ${language.isMismatch ? `Mismatch — ${language.mismatchSeverity}` : 'Aligned'}`,
      ...(language.warningMessage ? [`- Recommendation: ${language.recommendation}`] : []),
    ] : []),
    '',
    '## Topics to cover',
    '',
    ...analysis.missingTopics.map((topic, index) => `${index + 1}. ${topic}`),
    '',
    '## Priority recommendations',
    '',
    ...analysis.topRecommendations.map((recommendation) => `- ${recommendation}`),
    '',
    '## Suggested content structure',
    '',
    ...analysis.suggestedStructure.flatMap((section) => [
      `### ${section.level || 'H2'} — ${section.heading}`,
      '',
      section.description,
      '',
    ]),
    '## Recommended schema types',
    '',
    ...analysis.suggestedSchema.map((schema) => `- **${schema.type}** ([Schema.org](${getSchemaOrgUrl(schema.type)})): ${schema.reason}`),
    '',
    '## What your content does well',
    '',
    ...analysis.strengths.map((strength) => `- ${strength}`),
    ...(analysis.eeatAudit ? [
      '',
      '## E-E-A-T signals review',
      '',
      'This heuristic reviews observable clues in the submitted text. It is not Google’s ranking algorithm and does not verify authors, sources, factual accuracy, or site reputation.',
      '',
      ...analysis.eeatAudit.dimensions.flatMap((dimension) => [
        `### ${dimension.label} (${dimension.detected}/${dimension.total} signals detected)`,
        ...dimension.signals.map((signal) => `- [${signal.detected ? 'x' : ' '}] ${signal.label}`),
        '',
      ]),
    ] : []),
    ...(scannability ? [
      '',
      '## Content quality and scannability audit',
      '',
      '| Measure | Your draft | Top-result average |',
      '| --- | ---: | ---: |',
      `| H1 headings | ${scannability.userMetrics.h1Count} | — |`,
      `| H2 sections | ${scannability.userMetrics.h2Count} | ${scannability.topCompetitorAverages.avgH2Count} |`,
      `| H3 sections | ${scannability.userMetrics.h3Count} | ${scannability.topCompetitorAverages.avgH3Count} |`,
      `| Images | ${scannability.userMetrics.imageCount} | ${scannability.topCompetitorAverages.avgImageCount} |`,
      `| Videos | ${scannability.userMetrics.videoCount} | ${scannability.topCompetitorAverages.avgVideoCount} |`,
      `| Word count | ${scannability.userMetrics.wordCount} | ${scannability.topCompetitorAverages.avgWordCount} |`,
      `| Table of contents | ${scannability.userMetrics.hasTableOfContents ? 'Present' : 'Not detected'} | ${scannability.topCompetitorAverages.tocAdoptionRate}% adoption |`,
      '',
      ...scannability.checks.map((check) => `- **${check.status.toUpperCase()} — ${check.label}:** ${check.userValue} (benchmark: ${check.competitorBenchmark}). ${check.guidance}`),
    ] : []),
    ...(analysis.aiOverview ? [
      '',
      '## Google AI Overview',
      '',
      `**Status:** ${analysis.aiOverview.triggered ? 'Triggered' : 'Not triggered'}`,
      ...(analysis.aiOverview.snippet ? ['', analysis.aiOverview.snippet] : []),
      ...(analysis.aiOverview.references.length ? [
        '',
        '### Cited sources',
        '',
        ...analysis.aiOverview.references.map((reference, index) => `${index + 1}. [${reference.title || reference.domain || reference.source}](${reference.link})${reference.matchesCompetitorRank ? ` — organic result #${reference.matchesCompetitorRank}` : ''}`),
      ] : []),
    ] : []),
    ...(analysis.relatedSearches?.length ? ['', '## Related searches', '', ...analysis.relatedSearches.map((item) => `- ${item.query}`)] : []),
    ...(analysis.peopleAlsoAsk?.length ? [
      '',
      '## People also ask',
      '',
      ...analysis.peopleAlsoAsk.flatMap((item) => [
        `### ${item.question}`,
        '',
        item.snippet || '',
        ...(item.link ? ['', `Source: ${item.link}`] : []),
        '',
      ]),
    ] : []),
    '',
    '## Google organic competitors',
    '',
    ...competitors.flatMap((competitor) => {
      const intent = analysis.competitorIntents?.find((item) => item.rank === competitor.position || item.url === competitor.link);
      const metrics = competitor.metrics;
      return [
        `### ${competitor.position}. ${competitor.title}`,
        '',
        `- URL: ${competitor.link}`,
        `- Intent: ${intent?.intentCategory || 'General'}`,
        `- Schema types: ${competitor.schemaTypes?.length ? competitor.schemaTypes.join(', ') : 'None detected'}`,
        ...(metrics ? [
          `- Page structure: ${metrics.h1Count} H1, ${metrics.h2Count} H2, ${metrics.imageCount} images, ${metrics.videoCount} videos, ${metrics.wordCount} words`,
          `- Table of contents: ${metrics.hasTableOfContents ? 'Yes' : 'No'}`,
        ] : []),
        '',
        `> ${competitor.snippet || 'No search snippet available.'}`,
        '',
      ];
    }),
    '---',
    '',
    '*Generated by Outranka — AI Search Intent & Competitor Content Auditor.*',
  ].join('\n');
}

function getReportFilename(keyword: string, extension: 'md' | 'pdf') {
  const safeKeyword = keyword
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'audit';
  return `outranka-report-${safeKeyword}.${extension}`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function downloadAnalysisMarkdown(query: ReportQuery, analysis: AnalysisResult, competitors: SerpResultItem[]) {
  const markdown = buildAnalysisMarkdown(query, analysis, competitors);
  downloadBlob(new Blob([markdown], { type: 'text/markdown;charset=utf-8' }), getReportFilename(query.keyword, 'md'));
}

export async function downloadAnalysisPdf(query: ReportQuery, analysis: AnalysisResult, competitors: SerpResultItem[]) {
  const response = await fetch('/api/report/pdf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      markdown: buildAnalysisMarkdown(query, analysis, competitors),
      filename: getReportFilename(query.keyword, 'pdf'),
    }),
  });

  if (!response.ok) {
    const result = await response.json().catch(() => null);
    throw new Error(result?.error || 'The PDF report could not be generated.');
  }

  downloadBlob(await response.blob(), getReportFilename(query.keyword, 'pdf'));
}
