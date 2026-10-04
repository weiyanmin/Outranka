import React from 'react';
import { AnalysisResult } from '../lib/analyze';
import AiOverviewCard from './AiOverviewCard';

interface ResultViewProps {
  analysis: AnalysisResult;
}

export default function ResultView({ analysis }: ResultViewProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#10b981'; // emerald
    if (score >= 50) return '#28a79c'; // teal accent
    return '#f43f5e'; // rose/coral
  };

  const getIntentBadgeColor = (intent: string) => {
    switch (intent) {
      case 'Commercial':
        return { bg: 'rgba(40, 167, 156, 0.12)', color: '#1a776f', border: 'rgba(40, 167, 156, 0.3)' };
      case 'Informational':
        return { bg: 'rgba(2, 132, 199, 0.1)', color: '#0284c7', border: 'rgba(2, 132, 199, 0.25)' };
      case 'Transactional':
        return { bg: 'rgba(234, 88, 12, 0.1)', color: '#c2410c', border: 'rgba(234, 88, 12, 0.25)' };
      case 'Navigational':
      default:
        return { bg: 'rgba(100, 116, 139, 0.1)', color: '#475569', border: 'rgba(100, 116, 139, 0.2)' };
    }
  };

  const intentStyle = getIntentBadgeColor(analysis.intentCategory);

  return (
    <div className="results-grid">
      {/* Primary Column (Left) */}
      <div className="results-col-primary">
        {/* 1. Primary Score Card */}
        <div className="card" style={{ textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: 'var(--muted-text)',
              }}
            >
              Search Intent Score
            </span>
            <span
              style={{
                fontSize: '0.72rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                background: intentStyle.bg,
                color: intentStyle.color,
                border: `1px solid ${intentStyle.border}`,
                padding: '2px 9px',
                borderRadius: '9999px',
              }}
            >
              {analysis.intentCategory} Intent
            </span>
          </div>

          <div
            style={{
              fontSize: '4.2rem',
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: '-0.04em',
              color: getScoreColor(analysis.score),
              margin: '10px 0 8px 0',
            }}
          >
            {analysis.score}%
          </div>

          <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-color)', maxWidth: '480px', margin: '0 auto' }}>
            {analysis.score >= 80
              ? 'Strong intent parity with the top Google results.'
              : analysis.score >= 50
              ? `Satisfies ${analysis.score}% of target intent. Good foundation with key topic gaps.`
              : 'Significant intent mismatch compared to top ranking competitors.'}
          </p>

          <p style={{ fontSize: '0.82rem', color: 'var(--muted-text)', marginTop: '8px', lineHeight: 1.4 }}>
            Target Intent: <span style={{ color: 'var(--text-color)', fontWeight: 500 }}>{analysis.keywordIntent}</span>
          </p>

          {/* Factors Breakdown Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              marginTop: '24px',
              paddingTop: '20px',
              borderTop: '1px solid var(--border-color)',
            }}
          >
            <div style={{ background: '#fafafc', padding: '12px', borderRadius: '12px', textAlign: 'left' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-text)', display: 'block' }}>
                {analysis.intentCategory} Intent Match (50%)
              </span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-color)' }}>
                {analysis.factorScores.queryRelevance}%
              </span>
            </div>
            <div style={{ background: '#fafafc', padding: '12px', borderRadius: '12px', textAlign: 'left' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-text)', display: 'block' }}>Structure (25%)</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-color)' }}>
                {analysis.factorScores.structure}%
              </span>
            </div>
            <div style={{ background: '#fafafc', padding: '12px', borderRadius: '12px', textAlign: 'left' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-text)', display: 'block' }}>Readability (15%)</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-color)' }}>
                {analysis.factorScores.readability}%
              </span>
            </div>
            <div style={{ background: '#fafafc', padding: '12px', borderRadius: '12px', textAlign: 'left' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-text)', display: 'block' }}>First-hand Data (10%)</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-color)' }}>
                {analysis.factorScores.firstHandDataBonus}%
              </span>
            </div>
          </div>
        </div>

        {/* 2. Intent Mismatch Alert Banner */}
        {analysis.intentMismatch && (
          <div
            style={{
              background: '#fffbf0',
              border: '1px solid rgba(245, 158, 11, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '1.1rem' }}>⚠️</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#92400e' }}>
                Search Intent Mismatch Warning
              </span>
            </div>
            <p style={{ fontSize: '0.88rem', color: '#78350f', lineHeight: 1.45, marginBottom: '10px' }}>
              {analysis.intentMismatchReason || 'Your page format does not match what Google favors for this keyword.'}
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', fontSize: '0.8rem' }}>
              <span style={{ background: '#ffffff', border: '1px solid #fde68a', padding: '4px 10px', borderRadius: '9999px', color: '#92400e' }}>
                Your Content: <strong>{analysis.userPageType}</strong>
              </span>
              <span style={{ background: '#ffffff', border: '1px solid #fde68a', padding: '4px 10px', borderRadius: '9999px', color: '#92400e' }}>
                Google Prefers: <strong>{analysis.topPagesType} ({analysis.intentCategory})</strong>
              </span>
            </div>
          </div>
        )}

        {/* 3. Deterministic UI, UX & Scannability Check */}
        {analysis.scannabilityAudit && (
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: 'var(--accent-color)', fontSize: '1.2rem' }}>⚡</span>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)', letterSpacing: '-0.01em' }}>
                  UI, UX &amp; Scannability Deterministic Check
                </h3>
              </div>
              <span
                style={{
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  background: 'rgba(40, 167, 156, 0.1)',
                  color: 'var(--accent-color)',
                  border: '1px solid rgba(40, 167, 156, 0.25)',
                  padding: '3px 9px',
                  borderRadius: '9999px',
                }}
              >
                Code &amp; DOM Audit
              </span>
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--muted-text)', marginBottom: '16px', lineHeight: 1.45 }}>
              Deterministic measurements of your heading hierarchy, visual media diversity, table of contents, and scanning anchors compared against the top 10 competitors:
            </p>

            {/* Quick Metrics Bar */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              <div style={{ background: '#fafafc', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 12px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--muted-text)', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>H1 / H2</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-color)' }}>
                  {analysis.scannabilityAudit.userMetrics.h1Count} / {analysis.scannabilityAudit.userMetrics.h2Count}
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--muted-text)', display: 'block', marginTop: '2px' }}>
                  Top Avg: {analysis.scannabilityAudit.topCompetitorAverages.avgH2Count} H2
                </span>
              </div>

              <div style={{ background: '#fafafc', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 12px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--muted-text)', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Images</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-color)' }}>
                  {analysis.scannabilityAudit.userMetrics.imageCount}
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--muted-text)', display: 'block', marginTop: '2px' }}>
                  Top Avg: {analysis.scannabilityAudit.topCompetitorAverages.avgImageCount}
                </span>
              </div>

              <div style={{ background: '#fafafc', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 12px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--muted-text)', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Videos</span>
                <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-color)' }}>
                  {analysis.scannabilityAudit.userMetrics.videoCount}
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--muted-text)', display: 'block', marginTop: '2px' }}>
                  Top Avg: {analysis.scannabilityAudit.topCompetitorAverages.avgVideoCount}
                </span>
              </div>

              <div style={{ background: '#fafafc', border: '1px solid var(--border-color)', borderRadius: '10px', padding: '10px 12px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--muted-text)', fontWeight: 600, display: 'block', textTransform: 'uppercase' }}>Table of Contents</span>
                <span
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: analysis.scannabilityAudit.userMetrics.hasTableOfContents ? '#10b981' : '#f59e0b',
                    display: 'block',
                    marginTop: '2px',
                  }}
                >
                  {analysis.scannabilityAudit.userMetrics.hasTableOfContents ? 'Yes' : 'No'}
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--muted-text)', display: 'block', marginTop: '2px' }}>
                  {analysis.scannabilityAudit.topCompetitorAverages.tocAdoptionRate}% adoption
                </span>
              </div>
            </div>

            {/* Deterministic Rules & Check Results */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {analysis.scannabilityAudit.checks.map((chk) => {
                const isPass = chk.status === 'pass';
                const isWarn = chk.status === 'warning';
                const statusColor = isPass ? '#10b981' : isWarn ? '#f59e0b' : '#ef4444';
                const statusBg = isPass ? 'rgba(16, 185, 129, 0.08)' : isWarn ? 'rgba(245, 158, 11, 0.08)' : 'rgba(239, 68, 68, 0.08)';
                const statusBorder = isPass ? 'rgba(16, 185, 129, 0.25)' : isWarn ? 'rgba(245, 158, 11, 0.25)' : 'rgba(239, 68, 68, 0.25)';

                return (
                  <div
                    key={chk.id}
                    style={{
                      padding: '12px 14px',
                      background: statusBg,
                      border: `1px solid ${statusBorder}`,
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-color)' }}>
                        {chk.label}
                      </span>
                      <span
                        style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          color: statusColor,
                          background: '#ffffff',
                          padding: '2px 8px',
                          borderRadius: '9999px',
                          border: `1px solid ${statusBorder}`,
                        }}
                      >
                        {chk.status}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.78rem', color: 'var(--muted-text)', marginTop: '2px' }}>
                      <span>You: <strong style={{ color: 'var(--text-color)' }}>{chk.userValue}</strong></span>
                      <span>Benchmark: <strong style={{ color: 'var(--text-color)' }}>{chk.competitorBenchmark}</strong></span>
                    </div>

                    <p style={{ fontSize: '0.82rem', color: 'var(--text-color)', opacity: 0.9, lineHeight: 1.4, marginTop: '2px' }}>
                      {chk.guidance}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 4. Top 3 Missing Topics Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ color: 'var(--accent-color)', fontSize: '1.1rem' }}>✦</span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)', letterSpacing: '-0.01em' }}>
              Top 3 Topics You Are Missing
            </h3>
          </div>
          <p style={{ fontSize: '0.82rem', color: 'var(--muted-text)', marginBottom: '16px' }}>
            Key subtopics covered by top competitors that your content lacks:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {analysis.missingTopics.map((topic, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '14px',
                  background: '#fafafc',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <span
                  style={{
                    background: 'var(--accent-color)',
                    color: '#ffffff',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    width: '22px',
                    height: '22px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '1px',
                  }}
                >
                  {i + 1}
                </span>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-color)', fontWeight: 500, lineHeight: 1.45 }}>
                  {topic}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Suggested Content Structure */}
        {analysis.suggestedStructure && analysis.suggestedStructure.length > 0 && (
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)', marginBottom: '4px' }}>
              Suggested Content Structure
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--muted-text)', marginBottom: '16px' }}>
              Recommended headings hierarchy aligned with what Google is currently ranking:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {analysis.suggestedStructure.map((s, i) => (
                <div
                  key={i}
                  style={{
                    padding: '12px 14px',
                    background: '#fafafc',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--accent-color)', marginBottom: '3px' }}>
                    {s.heading}
                  </div>
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted-text)', lineHeight: 1.4 }}>
                    {s.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Secondary Column (Right) */}
      <div className="results-col-secondary">
        {/* Google AI Overview & Citations Donut Graph */}
        <AiOverviewCard aiOverview={analysis.aiOverview} />

        {/* 5. Priority Recommendations */}
        {analysis.topRecommendations && analysis.topRecommendations.length > 0 && (
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)', marginBottom: '12px' }}>
              Priority Recommendations to Outrank
            </h3>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {analysis.topRecommendations.map((rec, i) => (
                <li key={i} style={{ fontSize: '0.9rem', color: 'var(--text-color)', lineHeight: 1.45 }}>
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 6. Suggested Schema Markup */}
        {analysis.suggestedSchema && analysis.suggestedSchema.length > 0 && (
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)', marginBottom: '4px' }}>
              Suggested Schema Markup
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--muted-text)', marginBottom: '14px' }}>
              Structured data types detected on top-performing competitor pages:
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {analysis.suggestedSchema.map((sch, i) => (
                <div
                  key={i}
                  style={{
                    background: '#fafafc',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '8px 12px',
                    fontSize: '0.82rem',
                  }}
                >
                  <strong style={{ color: 'var(--text-color)' }}>{sch.type}: </strong>
                  <span style={{ color: 'var(--muted-text)' }}>{sch.reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7. Content Strengths */}
        {analysis.strengths && analysis.strengths.length > 0 && (
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)', marginBottom: '12px' }}>
              What Your Content Does Well
            </h3>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {analysis.strengths.map((str, i) => (
                <li key={i} style={{ fontSize: '0.9rem', color: '#16a34a', lineHeight: 1.45 }}>
                  <span style={{ color: 'var(--text-color)' }}>{str}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
