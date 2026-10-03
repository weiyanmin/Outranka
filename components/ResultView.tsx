import React from 'react';
import { AnalysisResult } from '../lib/analyze';

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
    <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
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

      {/* 3. Top 3 Missing Topics Card */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
          <span style={{ color: 'var(--accent-color)', fontSize: '1.1rem' }}>✦</span>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)', letterSpacing: '-0.01em' }}>
            Top 3 Topics You Are Missing
          </h3>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--muted-text)', marginBottom: '16px' }}>
          Key angles and subtopics covered by top-ranking competitors that your content lacks:
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
    </div>
  );
}
