'use client';

import React from 'react';
import { AnalysisResult } from '../../../lib/analyze';
import { OverallPerformanceReport } from '../../../lib/performanceScore';
import GoogleIcon from '../../GoogleIcon';
import RankingChanceCard from '../../RankingChanceCard';
import RingGauge from '../../charts/RingGauge';
import BarList from '../../charts/BarList';
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
  const [showBreakdown, setShowBreakdown] = React.useState(false);
  const audit = analysis.scannabilityAudit;
  const passCount = audit?.checks.filter((c) => c.status === 'pass').length ?? 0;
  const totalChecks = audit?.checks.length ?? 0;
  const languageMismatch = analysis.languageAudit?.isMismatch;
  const ai = analysis.aiOverview;
  const recs = analysis.topRecommendations || [];

  const corePillars = [
    { name: 'Search Intent', f: perf.pillars.searchIntent },
    { name: 'Content Quality & First-Hand Data', f: perf.pillars.contentQuality },
    { name: 'UI/UX Scannability', f: perf.pillars.scannabilityUx },
    { name: 'Competitive Parity & Language', f: perf.pillars.competitiveParity },
  ];

  const algorithmicFactors = [
    {
      label: 'Search Intent (Query Relevance)',
      value: analysis.factorScores?.queryRelevance || perf.factors.searchIntent.score,
      hint: 'Target keyword relevance & intent satisfaction',
    },
    {
      label: 'Content Quality (Readability)',
      value: analysis.factorScores?.readability || perf.factors.contentQuality.score,
      hint: 'Scanning ease, flow, and clarity',
    },
    {
      label: 'UI/UX Scannability (Structure)',
      value: analysis.factorScores?.structure || perf.factors.scannabilityUx.score,
      hint: 'Heading hierarchy (H1-H3), images, and visual breaks',
    },
    {
      label: 'First-Hand Data & Experience',
      value: analysis.factorScores?.firstHandDataBonus || 30,
      hint: 'Original insights, testing proof, and firsthand signals',
    },
    {
      label: 'Competitive Parity',
      value: perf.factors.competitiveParity.score,
      hint: 'Subtopic coverage, schema markup, and SERP features',
    },
    {
      label: 'Language Match',
      value: perf.factors.languageAlignment.score,
      hint: 'SERP regional and linguistic alignment',
    },
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
        subtitle="Weighted across the 4 performance pillars"
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

      {/* 4 Performance Pillars */}
      <SectionCard
        title="4 Performance Pillars"
        subtitle="Core algorithmic evaluation of your content against Google top rankings"
        span={7}
      >
        {/* The 4 Core Pillar Rings */}
        <div className="divided" style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {corePillars.map(({ name, f }, i) => (
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

        {/* Collapsed state prompt */}
        {!showBreakdown ? (
          <div
            style={{
              marginTop: '20px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '10px',
            }}
          >
            <span style={{ fontSize: '0.82rem', color: 'var(--muted-text)' }}>
              Detailed breakdown of all 6 ranking factors
            </span>
            <button
              type="button"
              onClick={() => setShowBreakdown(true)}
              className="link-btn"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: 'var(--accent-color)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer',
                background: 'none',
                border: 'none',
                padding: '4px 0',
              }}
            >
              Learn more
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        ) : (
          /* Detailed Algorithmic Breakdown (shown when Learn more is clicked) */
          <div
            id="algorithmic-factors-breakdown"
            style={{ marginTop: '22px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--muted-text)' }}>
                Algorithmic Factors Breakdown
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.72rem', color: 'var(--muted-text)', background: 'var(--segmented-bg)', padding: '2px 8px', borderRadius: '6px' }}>
                  6 Ranking Factors
                </span>
                <button
                  type="button"
                  onClick={() => setShowBreakdown(false)}
                  className="link-btn"
                  style={{ fontSize: '0.78rem', color: 'var(--muted-text)' }}
                >
                  Show less
                </button>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px 28px' }}>
              <BarList items={algorithmicFactors.slice(0, 3)} barHeight={7} gap={14} />
              <BarList items={algorithmicFactors.slice(3, 6)} barHeight={7} gap={14} />
            </div>
          </div>
        )}
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
