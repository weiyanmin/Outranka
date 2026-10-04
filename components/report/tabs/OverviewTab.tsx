'use client';

import React from 'react';
import { AnalysisResult } from '../../../lib/analyze';
import { OverallPerformanceReport } from '../../../lib/performanceScore';
import GoogleIcon from '../../GoogleIcon';
import RankingChanceCard from '../../RankingChanceCard';
import RingGauge from '../../charts/RingGauge';
import { scoreColor } from '../../charts/colors';
import SectionCard from '../SectionCard';
import StatTile from '../StatTile';
import Pill, { Tone } from '../Pill';

interface OverviewTabProps {
  analysis: AnalysisResult;
  perf: OverallPerformanceReport;
  onNavigate: (tabId: string) => void;
}

function gradeTone(grade: OverallPerformanceReport['grade']): Tone {
  switch (grade) {
    case 'Excellent':
      return 'success';
    case 'Good':
      return 'accent';
    case 'Needs Improvement':
      return 'warning';
    default:
      return 'danger';
  }
}

export default function OverviewTab({ analysis, perf, onNavigate }: OverviewTabProps) {
  const audit = analysis.scannabilityAudit;
  const passCount = audit?.checks.filter((c) => c.status === 'pass').length ?? 0;
  const totalChecks = audit?.checks.length ?? 0;
  const languageMismatch = analysis.languageAudit?.isMismatch;
  const ai = analysis.aiOverview;
  const recs = analysis.topRecommendations || [];

  const pillars = [
    { name: 'Search Intent', f: perf.factors.searchIntent },
    { name: 'UI/UX Scannability', f: perf.factors.scannabilityUx },
    { name: 'Competitive Parity', f: perf.factors.competitiveParity },
    { name: 'Language Match', f: perf.factors.languageAlignment },
  ];

  return (
    <div className="bento">
      {/* Issues first, kept short. Details live in their own tabs. */}
      {analysis.intentMismatch && (
        <div className="callout callout-warning">
          <GoogleIcon name="warning" size={22} color="#b45309" />
          <div className="callout-body">
            <strong>Search intent mismatch.</strong>{' '}
            {analysis.intentMismatchReason || 'Your page format does not match what Google favors for this keyword.'}
          </div>
          <button type="button" className="link-btn" onClick={() => onNavigate('intent')}>
            View details →
          </button>
        </div>
      )}
      {languageMismatch && analysis.languageAudit && (
        <div className="callout callout-warning">
          <GoogleIcon name="language" size={22} color="#b45309" />
          <div className="callout-body">
            <strong>Language mismatch.</strong> Google favors {analysis.languageAudit.favoredSerpLanguage.name} results for this query, but
            your content is in {analysis.languageAudit.userLanguage.name}.
          </div>
          <button type="button" className="link-btn" onClick={() => onNavigate('ai')}>
            View details →
          </button>
        </div>
      )}

      {/* KPI strip */}
      <section className="card bento-card span-12" style={{ padding: '24px 28px' }}>
        <div className="stat-strip">
          <StatTile label="Competitors analyzed" value={analysis.competitorsAnalyzedCount} sub="Top Google results" />
          {audit && (
            <StatTile
              label="UX checks passed"
              value={`${passCount}/${totalChecks}`}
              sub="Scannability audit"
              valueColor={scoreColor(totalChecks ? (passCount / totalChecks) * 100 : 0)}
            />
          )}
          <StatTile label="Missing topics" value={analysis.missingTopics?.length ?? 0} sub="Covered by rivals, not by you" />
          {ai && (
            <StatTile
              label="AI Overview"
              value={ai.triggered ? 'Shown' : 'Not shown'}
              sub={ai.triggered ? `${ai.references.length} sources cited` : 'Organic results only'}
            />
          )}
        </div>
      </section>

      {/* Overall score */}
      <SectionCard
        title="Overall Performance Score"
        subtitle="Weighted across four pillars"
        span={5}
        action={<Pill tone={gradeTone(perf.grade)}>{perf.grade}</Pill>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '22px' }}>
          <RingGauge value={perf.overallScore} size={190} stroke={14} caption="Overall" />
          <p style={{ fontSize: '0.94rem', fontWeight: 600, lineHeight: 1.5, color: 'var(--text-color)', maxWidth: '380px' }}>{perf.summary}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', fontSize: '0.84rem', color: 'var(--muted-text)' }}>
            <span>Target intent</span>
            <strong style={{ color: 'var(--text-color)' }}>{analysis.keywordIntent}</strong>
            <Pill tone="neutral">{analysis.intentCategory}</Pill>
          </div>
        </div>
      </SectionCard>

      {/* Pillars */}
      <SectionCard title="Performance Pillars" subtitle="How each area contributes to your overall score" span={7}>
        <div className="divided" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {pillars.map(({ name, f }, i) => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '18px', paddingTop: i === 0 ? 0 : 18 }}>
              <RingGauge value={f.score} size={64} stroke={7} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.96rem', fontWeight: 600, color: 'var(--text-color)' }}>{name}</div>
                <div style={{ fontSize: '0.84rem', color: 'var(--muted-text)', marginTop: 2, lineHeight: 1.4 }}>{f.label}</div>
              </div>
              <Pill tone="neutral">{f.weight}% weight</Pill>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Ranking chance summary */}
      {analysis.rankingChanceReport && (
        <RankingChanceCard report={analysis.rankingChanceReport} variant="summary" span={recs.length > 0 ? 7 : 12} onNavigate={onNavigate} />
      )}

      {/* Top priorities */}
      {recs.length > 0 && (
        <SectionCard
          title="Top Priorities"
          subtitle="The fastest wins to outrank the current results"
          span={analysis.rankingChanceReport ? 5 : 12}
        >
          <ol className="clean-list">
            {recs.slice(0, 3).map((rec, i) => (
              <li key={i} className="clean-list-item">
                <span className="num-badge">{i + 1}</span>
                <span>{rec}</span>
              </li>
            ))}
          </ol>
          {recs.length > 3 && (
            <div style={{ marginTop: '20px' }}>
              <button type="button" className="link-btn" onClick={() => onNavigate('opportunities')}>
                See all {recs.length} recommendations →
              </button>
            </div>
          )}
        </SectionCard>
      )}
    </div>
  );
}
