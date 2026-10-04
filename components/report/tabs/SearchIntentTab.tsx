'use client';

import React from 'react';
import { AnalysisResult } from '../../../lib/analyze';
import GoogleIcon from '../../GoogleIcon';
import RankingChanceCard from '../../RankingChanceCard';
import StackedBar from '../../charts/StackedBar';
import { COLORS } from '../../charts/colors';
import SectionCard from '../SectionCard';
import Pill from '../Pill';

const INTENT_COLORS: Record<string, string> = {
  Commercial: COLORS.accent,
  Informational: COLORS.info,
  Transactional: '#ea580c',
  Navigational: '#64748b',
};

export default function SearchIntentTab({ analysis }: { analysis: AnalysisResult }) {
  const intentCounts = analysis.competitorIntents.reduce<Record<string, number>>((acc, ci) => {
    acc[ci.intentCategory] = (acc[ci.intentCategory] || 0) + 1;
    return acc;
  }, {});
  const segments = Object.entries(intentCounts)
    .map(([label, value]) => ({ label, value, color: INTENT_COLORS[label] || COLORS.neutral }))
    .sort((a, b) => b.value - a.value);
  const dominant = segments[0];

  const blockStyle: React.CSSProperties = {
    background: '#fafafc',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--radius-md)',
    padding: '16px 18px',
  };
  const blockLabel: React.CSSProperties = {
    fontSize: '0.72rem',
    fontWeight: 700,
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    color: 'var(--muted-text)',
  };

  return (
    <div className="bento">
      <SectionCard
        title="Search Intent"
        subtitle="What searchers want vs. the page type you wrote"
        span={12}
        action={<Pill tone="accent">{analysis.intentCategory}</Pill>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <p style={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1.5, color: 'var(--text-color)' }}>{analysis.keywordIntent}</p>

          {/* Standout Comparison Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
            {/* Your page */}
            <div
              style={{
                background: analysis.intentMismatch ? '#fffdf7' : '#ffffff',
                border: analysis.intentMismatch
                  ? '1.5px solid rgba(245, 158, 11, 0.4)'
                  : '1.5px solid var(--border-color)',
                borderRadius: '14px',
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: analysis.intentMismatch ? '#b45309' : 'var(--muted-text)',
                    }}
                  >
                    Your Page
                  </span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: analysis.intentMismatch ? '#fef3c7' : 'var(--segmented-bg)',
                      color: analysis.intentMismatch ? '#92400e' : 'var(--muted-text)',
                    }}
                  >
                    {analysis.intentMismatch ? 'Current Draft' : 'Your Draft'}
                  </span>
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-color)', lineHeight: 1.4 }}>
                  {analysis.userPageType}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '14px',
                  paddingTop: '10px',
                  borderTop: '1px solid rgba(0,0,0,0.05)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: analysis.intentMismatch ? '#b45309' : '#047857',
                }}
              >
                <GoogleIcon name={analysis.intentMismatch ? 'warning' : 'check_circle'} size={14} color={analysis.intentMismatch ? '#b45309' : '#047857'} />
                <span>{analysis.intentMismatch ? 'Format mismatch detected' : 'Format aligns with SERP'}</span>
              </div>
            </div>

            {/* Google prefers */}
            <div
              style={{
                background: 'rgba(40, 167, 156, 0.04)',
                border: '1.5px solid rgba(40, 167, 156, 0.45)',
                borderRadius: '14px',
                padding: '18px 20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: '0 2px 8px rgba(40, 167, 156, 0.08)',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: 'var(--accent-color)',
                    }}
                  >
                    Google Prefers
                  </span>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      background: 'var(--accent-light)',
                      color: 'var(--accent-color)',
                    }}
                  >
                    Top 10 Benchmark
                  </span>
                </div>
                <div style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-color)', lineHeight: 1.4 }}>
                  {analysis.topPagesType}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  marginTop: '14px',
                  paddingTop: '10px',
                  borderTop: '1px solid rgba(40, 167, 156, 0.15)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--accent-color)',
                }}
              >
                <GoogleIcon name="fact_check" size={14} color="var(--accent-color)" />
                <span>Highest Ranking Format</span>
              </div>
            </div>
          </div>

          {/* Diagnosis Box */}
          {analysis.intentMismatch ? (
            <div
              style={{
                display: 'flex',
                gap: '14px',
                alignItems: 'flex-start',
                padding: '16px 18px',
                background: '#fffbf0',
                border: '1px solid rgba(245, 158, 11, 0.35)',
                borderRadius: '12px',
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#fef3c7',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: '1px',
                }}
              >
                <GoogleIcon name="warning" size={18} color="#b45309" />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#92400e' }}>Format Mismatch Diagnosis</div>
                <p style={{ fontSize: '0.86rem', lineHeight: 1.55, color: 'var(--text-color)', marginTop: '4px' }}>
                  {analysis.intentMismatchReason || 'Your page format does not match what Google favors for this keyword.'}
                </p>
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                padding: '14px 18px',
                background: 'rgba(16, 185, 129, 0.05)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                borderRadius: '12px',
              }}
            >
              <GoogleIcon name="check_circle" size={20} color={COLORS.success} />
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-color)' }}>
                Your page format matches what Google is currently ranking in top positions.
              </span>
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard
        title="What the Top Results Target"
        subtitle="Intent behind the pages currently ranking"
        span={12}
      >
        {segments.length > 0 ? (
          <>
            <StackedBar segments={segments} totalLabel="pages" />
            {dominant && (
              <p style={{ fontSize: '0.86rem', color: 'var(--muted-text)', lineHeight: 1.5, marginTop: '20px' }}>
                Most ranking pages are <strong style={{ color: 'var(--text-color)' }}>{dominant.label}</strong> ({dominant.value} of{' '}
                {analysis.competitorIntents.length}).
              </p>
            )}
          </>
        ) : (
          <p style={{ fontSize: '0.88rem', color: 'var(--muted-text)' }}>No competitor intent data available.</p>
        )}
      </SectionCard>

      {analysis.rankingChanceReport && <RankingChanceCard report={analysis.rankingChanceReport} variant="detail" span={12} />}
    </div>
  );
}
