'use client';

import React from 'react';
import { RankingChanceReport } from '../lib/rankingChance';
import GoogleIcon from './GoogleIcon';

interface RankingChanceCardProps {
  report?: RankingChanceReport;
}

export default function RankingChanceCard({ report }: RankingChanceCardProps) {
  const [expanded, setExpanded] = React.useState(false);

  if (!report) return null;

  const score = report.overallRankingChance;

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'High Chance':
        return { text: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.25)' };
      case 'Moderate Chance':
        return { text: 'var(--accent-color)', bg: 'rgba(40, 167, 156, 0.1)', border: 'rgba(40, 167, 156, 0.25)' };
      case 'Low Chance':
      default:
        return { text: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.25)' };
    }
  };

  const tierStyle = getTierColor(report.tier);
  const displayedQueries = expanded ? report.topQueries : report.topQueries.slice(0, 3);

  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden', margin: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '14px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GoogleIcon name="track_changes" size={24} color={tierStyle.text} />
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-color)', letterSpacing: '-0.01em', margin: 0 }}>
              Chance of Ranking in Google
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--muted-text)' }}>
              Deterministic algorithmic ranking probability
            </span>
          </div>
        </div>

        <span
          style={{
            fontSize: '0.74rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            background: tierStyle.bg,
            color: tierStyle.text,
            border: `1px solid ${tierStyle.border}`,
            padding: '3px 10px',
            borderRadius: '9999px',
          }}
        >
          {report.tier}
        </span>
      </div>

      {/* Main Score Hero */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          padding: '16px 20px',
          background: 'linear-gradient(135deg, rgba(40, 167, 156, 0.05) 0%, rgba(16, 185, 129, 0.05) 100%)',
          border: '1px solid rgba(40, 167, 156, 0.2)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '18px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ textAlign: 'center', minWidth: '90px' }}>
          <div
            style={{
              fontSize: '2.8rem',
              fontWeight: 800,
              lineHeight: 1,
              letterSpacing: '-0.03em',
              color: tierStyle.text,
            }}
          >
            {score}%
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--muted-text)', fontWeight: 600, textTransform: 'uppercase' }}>
            Overall Chance
          </span>
        </div>

        <div style={{ flex: 1, minWidth: '200px' }}>
          <p style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-color)', lineHeight: 1.45, margin: '0 0 6px 0' }}>
            {report.verdict}
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', fontSize: '0.72rem', color: 'var(--muted-text)' }}>
            <span>Search Intent: <strong style={{ color: 'var(--text-color)' }}>{report.calculatedFactors.searchIntentParity}%</strong></span>
            <span>DOM Structure: <strong style={{ color: 'var(--text-color)' }}>{report.calculatedFactors.domScannability}%</strong></span>
            <span>Asset Parity: <strong style={{ color: 'var(--text-color)' }}>{report.calculatedFactors.top3CompetitorOverlap}%</strong></span>
          </div>
        </div>
      </div>

      {/* Top Queries with Scores */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-color)' }}>
            Top Queries with Ranking Scores:
          </span>
          <span style={{ fontSize: '0.72rem', color: 'var(--muted-text)', background: 'var(--segmented-bg)', padding: '2px 8px', borderRadius: '6px' }}>
            Calculated by Algorithm
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {displayedQueries.map((q, idx) => {
            const qTierStyle = getTierColor(q.tier);

            return (
              <div
                key={idx}
                style={{
                  background: '#fafafc',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '10px 12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: idx === 0 ? 'var(--accent-color)' : 'var(--segmented-bg)',
                        color: idx === 0 ? '#ffffff' : 'var(--text-color)',
                        fontSize: '0.72rem',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      {idx + 1}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-color)' }}>
                      &ldquo;{q.query}&rdquo;
                    </span>
                    {idx === 0 && (
                      <span style={{ fontSize: '0.66rem', fontWeight: 600, background: 'var(--accent-light)', color: 'var(--accent-color)', padding: '1px 6px', borderRadius: '4px' }}>
                        Primary Target
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '0.95rem',
                        fontWeight: 800,
                        color: qTierStyle.text,
                      }}
                    >
                      {q.chanceScore}%
                    </span>
                    <span
                      style={{
                        fontSize: '0.66rem',
                        fontWeight: 700,
                        background: qTierStyle.bg,
                        color: qTierStyle.text,
                        border: `1px solid ${qTierStyle.border}`,
                        padding: '1px 6px',
                        borderRadius: '6px',
                      }}
                    >
                      {q.tier}
                    </span>
                  </div>
                </div>

                {/* Progress Indicator Bar */}
                <div
                  style={{
                    width: '100%',
                    height: '4px',
                    background: '#e2e8f0',
                    borderRadius: '9999px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${q.chanceScore}%`,
                      height: '100%',
                      background: qTierStyle.text,
                      borderRadius: '9999px',
                      transition: 'width 0.4s ease',
                    }}
                  />
                </div>

                {/* Actionable Insights */}
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px', fontSize: '0.74rem', color: 'var(--muted-text)', marginTop: '1px' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <GoogleIcon name="check" size={12} color="#16a34a" />
                    <span>Advantage: <strong style={{ color: 'var(--text-color)', fontWeight: 600 }}>{q.keyAdvantage}</strong></span>
                  </span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <GoogleIcon name="bolt" size={12} color="var(--accent-color)" />
                    <span>To Rank: <strong style={{ color: 'var(--accent-color)', fontWeight: 600 }}>{q.actionToRankHigher}</strong></span>
                  </span>
                </div>
              </div>
            );
          })}

          {report.topQueries.length > 3 && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                width: '100%',
                padding: '7px 12px',
                marginTop: '4px',
                background: 'transparent',
                border: '1px dashed var(--border-color)',
                borderRadius: '8px',
                color: 'var(--accent-color)',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <span>{expanded ? 'Show top 3 queries' : `Show all ${report.topQueries.length} queries`}</span>
              <GoogleIcon name={expanded ? 'expand_less' : 'expand_more'} size={16} color="var(--accent-color)" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
