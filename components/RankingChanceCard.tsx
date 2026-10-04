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

  return (
    <SectionCard
      title="Ranking Chances & Relevancy"
      subtitle="What is helping each query and the single best action to rank higher"
      span={span}
    >
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
              {/* Top Row: Rank + Query + Pill <----> Mini Progress Bar + Score + Tier */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                  <span
                    className="num-badge"
                    style={idx === 0 ? { background: 'var(--accent-color)', color: '#fff' } : undefined}
                  >
                    {idx + 1}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: '0.94rem', color: 'var(--text-color)' }}>
                    “{q.query}”
                  </span>
                  {idx === 0 && <Pill tone="accent">Primary target</Pill>}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
                  <div style={{ width: '70px', height: '6px', background: COLORS.track, borderRadius: 9999, overflow: 'hidden' }}>
                    <div style={{ width: `${q.chanceScore}%`, height: '100%', background: meta.color, borderRadius: 9999 }} />
                  </div>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: meta.color, minWidth: '38px', textAlign: 'right' }}>
                    {q.chanceScore}%
                  </span>
                  <Pill tone={meta.tone}>{q.tier}</Pill>
                </div>
              </div>

              {/* Bottom Row: Clear Action & Supporting Strength */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '12px',
                  flexWrap: 'wrap',
                  paddingTop: '8px',
                  borderTop: '1px solid rgba(0, 0, 0, 0.04)',
                  fontSize: '0.84rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: '240px', flex: 1 }}>
                  <GoogleIcon name="bolt" size={15} color="var(--accent-color)" />
                  <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>Action:</span>
                  <span style={{ color: 'var(--muted-text)', lineHeight: 1.4 }}>{q.actionToRankHigher}</span>
                </div>

                {q.keyAdvantage && (
                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '2px 8px',
                      background: 'rgba(16, 185, 129, 0.08)',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      borderRadius: '6px',
                      color: '#047857',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      flexShrink: 0,
                    }}
                  >
                    <GoogleIcon name="check_circle" size={13} color="#047857" />
                    <span>{q.keyAdvantage}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
