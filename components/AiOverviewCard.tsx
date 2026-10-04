'use client';

import React, { useState } from 'react';
import { GoogleAiOverviewData } from '../lib/serp';
import GoogleIcon from './GoogleIcon';
import SectionCard from './report/SectionCard';
import Pill from './report/Pill';

interface AiOverviewCardProps {
  aiOverview?: GoogleAiOverviewData;
  span?: 3 | 4 | 5 | 6 | 7 | 8 | 12;
}

// Segment colors for the citation donut (first one is the brand teal)
const SLICE_COLORS = ['#28a79c', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#10b981', '#6366f1', '#64748b'];

export default function AiOverviewCard({ aiOverview, span = 12 }: AiOverviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!aiOverview) return null;

  const isTriggered = aiOverview.triggered;
  const references = aiOverview.references || [];
  const topDomains = aiOverview.topDomainsDistribution || [];
  const displayedReferences = isExpanded ? references : references.slice(0, 4);

  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  return (
    <SectionCard
      title="Google AI Overview & Citations"
      subtitle={
        isTriggered
          ? 'Google generated an AI answer for this query. These are the sources it cited.'
          : 'Google did not show an AI Overview for this query in this region.'
      }
      span={span}
      action={<Pill tone={isTriggered ? 'accent' : 'neutral'}>{isTriggered ? 'Triggered' : 'Not triggered'}</Pill>}
    >
      {isTriggered && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {aiOverview.snippet && (
            <div style={{ borderLeft: '3px solid var(--accent-color)', paddingLeft: '16px' }}>
              <div style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--accent-color)', marginBottom: 6 }}>
                AI answer excerpt
              </div>
              <p style={{ fontSize: '0.92rem', lineHeight: 1.55, color: 'var(--text-color)', fontStyle: 'italic' }}>
                &ldquo;{aiOverview.snippet}&rdquo;
              </p>
            </div>
          )}

          {/* Donut + domain share */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '36px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', width: 160, height: 160, flexShrink: 0 }}>
              <svg width="160" height="160" viewBox="0 0 160 160">
                <circle cx="80" cy="80" r={radius} fill="transparent" stroke="#eef0f2" strokeWidth="16" />
                {topDomains.map((d, i) => {
                  const slice = d.percentage / 100;
                  const dash = `${circumference * slice} ${circumference * (1 - slice)}`;
                  const offset = -accumulatedOffset;
                  accumulatedOffset += circumference * slice;
                  return (
                    <circle
                      key={d.domain}
                      cx="80"
                      cy="80"
                      r={radius}
                      fill="transparent"
                      stroke={SLICE_COLORS[i % SLICE_COLORS.length]}
                      strokeWidth="16"
                      strokeDasharray={dash}
                      strokeDashoffset={offset}
                      style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%' }}
                    />
                  );
                })}
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                <span style={{ fontSize: '1.9rem', fontWeight: 800, color: 'var(--text-color)', lineHeight: 1, letterSpacing: '-0.03em' }}>
                  {references.length}
                </span>
                <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--muted-text)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 4 }}>
                  Citations
                </span>
              </div>
            </div>

            <div style={{ flex: 1, minWidth: '220px' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--muted-text)', marginBottom: 14 }}>
                Cited domain share
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {topDomains.slice(0, 5).map((d, i) => (
                  <div key={d.domain} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, fontSize: '0.88rem' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <span style={{ width: 10, height: 10, borderRadius: '50%', background: SLICE_COLORS[i % SLICE_COLORS.length], flexShrink: 0 }} />
                      <span style={{ color: 'var(--text-color)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.domain}</span>
                    </span>
                    <strong style={{ color: 'var(--text-color)' }}>{d.percentage}%</strong>
                  </div>
                ))}
              </div>
              {aiOverview.organicCompetitorOverlapCount > 0 && (
                <div style={{ marginTop: 18 }}>
                  <Pill tone="accent">{aiOverview.organicCompetitorOverlapCount} of top 10 competitors cited</Pill>
                </div>
              )}
            </div>
          </div>

          {/* Cited pages */}
          <div>
            <div style={{ fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--muted-text)', marginBottom: 14 }}>
              Pages cited by Google AI · {references.length}
            </div>
            <div className="divided" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {displayedReferences.map((ref, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <a
                      href={ref.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-color)', textDecoration: 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                      onMouseOver={(e) => (e.currentTarget.style.color = 'var(--accent-color)')}
                      onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-color)')}
                    >
                      {ref.title || ref.domain}
                    </a>
                    <span style={{ fontSize: '0.78rem', color: 'var(--muted-text)' }}>{ref.domain || ref.source}</span>
                  </div>
                  {ref.matchesCompetitorRank ? (
                    <Pill tone="accent">Competitor #{ref.matchesCompetitorRank}</Pill>
                  ) : (
                    <Pill tone="neutral">External</Pill>
                  )}
                </div>
              ))}
            </div>
            {references.length > 4 && (
              <div style={{ marginTop: 18 }}>
                <button type="button" className="link-btn" onClick={() => setIsExpanded(!isExpanded)}>
                  <span>{isExpanded ? 'Show less' : `Show ${references.length - 4} more citations`}</span>
                  <GoogleIcon name={isExpanded ? 'expand_less' : 'expand_more'} size={16} color="currentColor" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </SectionCard>
  );
}
