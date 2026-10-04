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
        span={6}
        action={<Pill tone="accent">{analysis.intentCategory}</Pill>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <p style={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1.5, color: 'var(--text-color)' }}>{analysis.keywordIntent}</p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '14px' }}>
            <div style={blockStyle}>
              <div style={blockLabel}>Your page</div>
              <div style={{ fontSize: '0.98rem', fontWeight: 600, marginTop: 6, color: 'var(--text-color)' }}>{analysis.userPageType}</div>
            </div>
            <div style={blockStyle}>
              <div style={blockLabel}>Google prefers</div>
              <div style={{ fontSize: '0.98rem', fontWeight: 600, marginTop: 6, color: 'var(--text-color)' }}>{analysis.topPagesType}</div>
            </div>
          </div>

          {analysis.intentMismatch ? (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
              <GoogleIcon name="warning" size={20} color="#b45309" style={{ marginTop: 1 }} />
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#92400e' }}>Format mismatch</div>
                <p style={{ fontSize: '0.88rem', lineHeight: 1.5, color: 'var(--text-color)', marginTop: 2 }}>
                  {analysis.intentMismatchReason || 'Your page format does not match what Google favors for this keyword.'}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <GoogleIcon name="check_circle" size={20} color={COLORS.success} />
              <span style={{ fontSize: '0.9rem', color: 'var(--text-color)' }}>Your page format matches what Google is ranking.</span>
            </div>
          )}
        </div>
      </SectionCard>

      <SectionCard
        title="What the Top Results Target"
        subtitle="Intent behind the pages currently ranking"
        span={6}
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
