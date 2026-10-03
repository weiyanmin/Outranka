import React from 'react';
import { AnalysisResult } from '../lib/analyze';

interface ResultViewProps {
  analysis: AnalysisResult;
}

export default function ResultView({ analysis }: ResultViewProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#16a34a'; // green
    if (score >= 50) return '#2563eb'; // blue
    return '#dc2626'; // red
  };

  return (
    <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* 1. Percentage Score Banner */}
      <div
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '28px',
          textAlign: 'center',
        }}
      >
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--muted-text)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Search Intent Satisfaction Score
        </span>
        <div style={{ fontSize: '3.5rem', fontWeight: 800, color: getScoreColor(analysis.score), margin: '8px 0' }}>
          {analysis.score}%
        </div>
        <p style={{ fontSize: '1.05rem', color: 'var(--text-color)', fontWeight: 500 }}>
          {analysis.score >= 80
            ? 'Excellent coverage — strong competitor parity.'
            : analysis.score >= 50
            ? `Satisfies ${analysis.score}% of the target intent. Key opportunities detected.`
            : 'Low intent satisfaction. Significant content gaps compared to top ranking results.'}
        </p>
        <p style={{ fontSize: '0.85rem', color: 'var(--muted-text)', marginTop: '6px' }}>
          Target Intent: <em>{analysis.keywordIntent}</em>
        </p>

        {/* Factors Breakdown */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '12px',
            marginTop: '20px',
            paddingTop: '20px',
            borderTop: '1px solid var(--border-color)',
          }}
        >
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted-text)' }}>Query Relevance (50%)</span>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)' }}>
              {analysis.factorScores.queryRelevance}%
            </p>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted-text)' }}>Structure (25%)</span>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)' }}>
              {analysis.factorScores.structure}%
            </p>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted-text)' }}>Readability (15%)</span>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)' }}>
              {analysis.factorScores.readability}%
            </p>
          </div>
          <div>
            <span style={{ fontSize: '0.8rem', color: 'var(--muted-text)' }}>First-hand Data (10%)</span>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)' }}>
              {analysis.factorScores.firstHandDataBonus}%
            </p>
          </div>
        </div>
      </div>

      {/* 2. Intent Mismatch Warning */}
      {analysis.intentMismatch && (
        <div
          style={{
            background: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '8px',
            padding: '18px 22px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
            <span style={{ fontSize: '1rem', fontWeight: 700, color: '#b45309' }}>⚠️ Search Intent Mismatch Warning</span>
          </div>
          <p style={{ fontSize: '0.95rem', color: '#92400e', marginBottom: '8px' }}>
            {analysis.intentMismatchReason || 'Your page format does not match what Google prefers for this query.'}
          </p>
          <div style={{ fontSize: '0.85rem', color: '#78350f', display: 'flex', gap: '16px' }}>
            <span>Your format: <strong>{analysis.userPageType}</strong></span>
            <span>Google top results format: <strong>{analysis.topPagesType}</strong></span>
          </div>
        </div>
      )}

      {/* 3. Top Missing Topics */}
      <div
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '8px',
          padding: '24px',
        }}
      >
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-color)', marginBottom: '4px' }}>
          Top 3 Topics You Are Missing
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--muted-text)', marginBottom: '16px' }}>
          Specific subtopics the top-performing competitors cover that are absent or thin in your content:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {analysis.missingTopics.map((topic, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                padding: '12px',
                background: '#f8fafc',
                border: '1px solid var(--border-color)',
                borderRadius: '6px',
              }}
            >
              <span
                style={{
                  background: 'var(--accent-color)',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {i + 1}
              </span>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-color)', fontWeight: 500, lineHeight: 1.4 }}>
                {topic}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
