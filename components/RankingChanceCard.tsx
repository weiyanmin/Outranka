'use client';

import React from 'react';
import { RankingChanceReport } from '../lib/rankingChance';
import GoogleIcon from './GoogleIcon';
import RingGauge from './charts/RingGauge';
import BarList from './charts/BarList';
import { COLORS } from './charts/colors';
import SectionCard from './report/SectionCard';
import Pill, { Tone } from './report/Pill';

interface RankingChanceCardProps {
  report?: RankingChanceReport;
  /** summary: ring + top 3 queries (Overview). detail: every query with insights. */
  variant?: 'summary' | 'detail';
  span?: 3 | 4 | 5 | 6 | 7 | 8 | 12;
  /** Lets the summary link jump to another tab */
  onNavigate?: (tabId: string) => void;
}

function tierMeta(tier: string): { tone: Tone; color: string } {
  switch (tier) {
    case 'High Chance':
      return { tone: 'success', color: COLORS.success };
    case 'Moderate Chance':
      return { tone: 'accent', color: COLORS.accent };
    default:
      return { tone: 'warning', color: COLORS.warning };
  }
}

export default function RankingChanceCard({ report, variant = 'summary', span = 12, onNavigate }: RankingChanceCardProps) {
  if (!report) return null;

  const overall = tierMeta(report.tier);

  if (variant === 'summary') {
    return (
      <SectionCard
        title="Chance of Ranking in Google"
        subtitle="Algorithmic probability for your target queries"
        span={span}
        action={<Pill tone={overall.tone}>{report.tier}</Pill>}
      >
        <div style={{ display: 'flex', gap: '32px', alignItems: 'center', flexWrap: 'wrap' }}>
          <RingGauge value={report.overallRankingChance} size={150} stroke={12} color={overall.color} caption="Overall" />
          <div style={{ flex: 1, minWidth: '240px' }}>
            <p style={{ fontSize: '0.94rem', fontWeight: 600, lineHeight: 1.5, color: 'var(--text-color)', marginBottom: '20px' }}>
              {report.verdict}
            </p>
            <BarList
              gap={14}
              items={report.topQueries.slice(0, 3).map((q) => ({
                label: `“${q.query}”`,
                value: q.chanceScore,
                color: tierMeta(q.tier).color,
              }))}
            />
          </div>
        </div>
        {onNavigate && report.topQueries.length > 0 && (
          <div style={{ marginTop: '20px' }}>
            <button type="button" className="link-btn" onClick={() => onNavigate('intent')}>
              See all {report.topQueries.length} queries and how to rank higher →
            </button>
          </div>
        )}
      </SectionCard>
    );
  }

  const globalAdvantages = Array.from(
    new Set(report.topQueries.map((q) => q.keyAdvantage).filter(Boolean))
  ) as string[];

  return (
    <SectionCard
      title="Ranking Chances & Relevancy"
      subtitle="What is helping each query and the single best action to rank higher"
      span={span}
    >
      {/* Consolidated Global Strengths Summary Banner */}
      {globalAdvantages.length > 0 && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 16px',
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.22)',
            borderRadius: '10px',
            marginBottom: '14px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#047857', fontWeight: 700, fontSize: '0.84rem' }}>
            <GoogleIcon name="check_circle" size={16} color="#059669" />
            <span>Content Strengths Across Queries:</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {globalAdvantages.map((adv, idx) => (
              <span
                key={idx}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: '#ffffff',
                  border: '1px solid rgba(16, 185, 129, 0.28)',
                  padding: '2px 9px',
                  borderRadius: '9999px',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: '#065f46',
                }}
              >
                {adv}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Clean Query Action Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {report.topQueries.map((q, idx) => {
          const meta = tierMeta(q.tier);
          return (
            <div
              key={idx}
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '14px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
              }}
            >
              {/* Top Row: Rank + Query + Neutral Structural Tag <----> Bold Score + Tier */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flexWrap: 'wrap' }}>
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      fontSize: '0.76rem',
                      fontWeight: 700,
                      background: idx === 0 ? '#334155' : '#f1f5f9',
                      color: idx === 0 ? '#ffffff' : '#475569',
                      border: idx === 0 ? 'none' : '1px solid #e2e8f0',
                      flexShrink: 0,
                    }}
                  >
                    {idx + 1}
                  </span>
                  <span style={{ fontWeight: 700, fontSize: '0.96rem', color: 'var(--text-color)' }}>
                    “{q.query}”
                  </span>
                  {idx === 0 && (
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        background: '#f1f5f9',
                        color: '#475569',
                        border: '1px solid #cbd5e1',
                        padding: '2px 8px',
                        borderRadius: '9999px',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Primary Target
                    </span>
                  )}
                </div>

                {/* Bold Typography Progress Indicator + Color-coded Tier */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                  <span
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      color: meta.color,
                      letterSpacing: '-0.02em',
                      minWidth: '46px',
                      textAlign: 'right',
                    }}
                  >
                    {q.chanceScore}%
                  </span>
                  <Pill tone={meta.tone}>{q.tier}</Pill>
                </div>
              </div>

              {/* Bottom Row: Clear Action (Darkened for high contrast) */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '8px',
                  paddingTop: '10px',
                  borderTop: '1px solid rgba(0, 0, 0, 0.05)',
                  fontSize: '0.86rem',
                }}
              >
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', flexShrink: 0, marginTop: '1px' }}>
                  <GoogleIcon name="bolt" size={15} color="#64748b" />
                  <span style={{ fontWeight: 700, color: 'var(--text-color)', fontSize: '0.82rem', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                    Action:
                  </span>
                </div>
                <span style={{ color: '#334155', fontWeight: 500, lineHeight: 1.45 }}>
                  {q.actionToRankHigher}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
