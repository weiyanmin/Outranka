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

  const factors = [
    { label: 'Search intent parity', value: report.calculatedFactors.searchIntentParity },
    { label: 'DOM scannability', value: report.calculatedFactors.domScannability },
    { label: 'Top 3 competitor overlap', value: report.calculatedFactors.top3CompetitorOverlap },
    { label: 'Schema completeness', value: report.calculatedFactors.schemaCompleteness },
  ];

  return (
    <SectionCard
      title="Ranking Chance by Query"
      subtitle="What is helping each query and the single best action to rank higher"
      span={span}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '24px',
          paddingBottom: '28px',
          marginBottom: '28px',
          borderBottom: '1px solid var(--border-color)',
        }}
      >
        {factors.map((f) => (
          <BarList key={f.label} items={[f]} />
        ))}
      </div>

      <div className="divided" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {report.topQueries.map((q, idx) => {
          const meta = tierMeta(q.tier);
          return (
            <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: idx === 0 ? 0 : 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <span className="num-badge" style={idx === 0 ? { background: 'var(--accent-color)', color: '#fff' } : undefined}>
                    {idx + 1}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-color)' }}>“{q.query}”</span>
                  {idx === 0 && <Pill tone="accent">Primary target</Pill>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Pill tone={meta.tone}>{q.tier}</Pill>
                  <span style={{ fontSize: '1.15rem', fontWeight: 800, color: meta.color }}>{q.chanceScore}%</span>
                </div>
              </div>

              <div style={{ height: 8, background: COLORS.track, borderRadius: 9999, overflow: 'hidden' }}>
                <div style={{ width: `${q.chanceScore}%`, height: '100%', background: meta.color, borderRadius: 9999 }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px 28px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <GoogleIcon name="check_circle" size={18} color={COLORS.success} style={{ marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted-text)' }}>
                      Working for you
                    </div>
                    <div style={{ fontSize: '0.88rem', lineHeight: 1.45, color: 'var(--text-color)', marginTop: 2 }}>{q.keyAdvantage}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                  <GoogleIcon name="bolt" size={18} color="var(--accent-color)" style={{ marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--muted-text)' }}>
                      To rank higher
                    </div>
                    <div style={{ fontSize: '0.88rem', lineHeight: 1.45, color: 'var(--text-color)', marginTop: 2 }}>{q.actionToRankHigher}</div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
