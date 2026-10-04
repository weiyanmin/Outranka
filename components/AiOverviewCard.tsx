'use client';

import React, { useState } from 'react';
import { GoogleAiOverviewData } from '../lib/serp';
import GoogleIcon from './GoogleIcon';

interface AiOverviewCardProps {
  aiOverview?: GoogleAiOverviewData;
}

export default function AiOverviewCard({ aiOverview }: AiOverviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!aiOverview) return null;

  const isTriggered = aiOverview.triggered;
  const references = aiOverview.references || [];
  const topDomains = aiOverview.topDomainsDistribution || [];
  const displayedReferences = isExpanded ? references : references.slice(0, 3);

  // Color palette for SVG donut chart segments
  const sliceColors = [
    '#28a79c', // Teal (Brand)
    '#3b82f6', // Blue
    '#8b5cf6', // Purple
    '#f59e0b', // Amber
    '#ec4899', // Pink
    '#10b981', // Emerald
    '#6366f1', // Indigo
    '#64748b', // Slate
  ];

  // SVG Donut calculation
  // Radius = 60, Center = 80, 80, Circumference = 2 * PI * 60 ≈ 377
  const radius = 55;
  const circumference = 2 * Math.PI * radius;
  let accumulatedOffset = 0;

  return (
    <div className="card" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '10px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GoogleIcon name="auto_awesome" size={20} color="var(--accent-color)" />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)', letterSpacing: '-0.01em' }}>
            Google AI Overview &amp; Citations
          </h3>
        </div>

        <span
          style={{
            fontSize: '0.74rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            background: isTriggered ? 'rgba(40, 167, 156, 0.12)' : 'rgba(100, 116, 139, 0.1)',
            color: isTriggered ? 'var(--accent-color)' : 'var(--muted-text)',
            border: `1px solid ${isTriggered ? 'rgba(40, 167, 156, 0.3)' : 'var(--border-color)'}`,
            padding: '3px 10px',
            borderRadius: '9999px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: isTriggered ? 'var(--accent-color)' : 'var(--muted-text)',
            }}
          />
          {isTriggered ? 'AI Mode Triggered' : 'AI Overview Not Triggered'}
        </span>
      </div>

      <p style={{ fontSize: '0.84rem', color: 'var(--muted-text)', lineHeight: 1.45, marginBottom: '16px' }}>
        {isTriggered
          ? 'Google generated an AI Overview answer for this search query. Below are the exact web sources cited and their share of visibility.'
          : 'Google did not display an AI Overview for this keyword query in this search region (traditional organic results only).'}
      </p>

      {isTriggered && (
        <>
          {/* AI Overview Snippet if available */}
          {aiOverview.snippet && (
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(40, 167, 156, 0.04) 0%, rgba(59, 130, 246, 0.04) 100%)',
                border: '1px solid rgba(40, 167, 156, 0.2)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                marginBottom: '16px',
                fontSize: '0.86rem',
                color: 'var(--text-color)',
                lineHeight: 1.45,
              }}
            >
              <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-color)', marginBottom: '4px' }}>
                AI Overview Answer Excerpt
              </div>
              <p style={{ fontStyle: 'italic', margin: 0, opacity: 0.9 }}>
                &ldquo;{aiOverview.snippet}&rdquo;
              </p>
            </div>
          )}

          {/* Visualization: Pie/Donut Chart & Distribution */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-around',
              gap: '20px',
              flexWrap: 'wrap',
              padding: '16px',
              background: '#fafafc',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '16px',
            }}
          >
            {/* SVG Donut Chart */}
            <div style={{ position: 'relative', width: '150px', height: '150px', flexShrink: 0 }}>
              <svg width="150" height="150" viewBox="0 0 160 160">
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke="#e2e8f0"
                  strokeWidth="18"
                />
                {topDomains.map((domainItem, i) => {
                  const slicePercentage = domainItem.percentage / 100;
                  const strokeDasharray = `${circumference * slicePercentage} ${circumference * (1 - slicePercentage)}`;
                  const strokeDashoffset = -accumulatedOffset;
                  accumulatedOffset += circumference * slicePercentage;
                  const color = sliceColors[i % sliceColors.length];

                  return (
                    <circle
                      key={domainItem.domain}
                      cx="80"
                      cy="80"
                      r={radius}
                      fill="transparent"
                      stroke={color}
                      strokeWidth="18"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      style={{
                        transform: 'rotate(-90deg)',
                        transformOrigin: '50% 50%',
                        transition: 'stroke-dasharray 0.3s ease',
                      }}
                    />
                  );
                })}
              </svg>

              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  pointerEvents: 'none',
                }}
              >
                <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-color)', lineHeight: 1 }}>
                  {references.length}
                </span>
                <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--muted-text)', textTransform: 'uppercase' }}>
                  Citations
                </span>
              </div>
            </div>

            {/* Legend / Breakdown */}
            <div style={{ flex: 1, minWidth: '190px' }}>
              <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--muted-text)', marginBottom: '8px' }}>
                Cited Domain Share
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {topDomains.slice(0, 5).map((d, i) => {
                  const color = sliceColors[i % sliceColors.length];
                  return (
                    <div
                      key={d.domain}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: '0.8rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden' }}>
                        <span
                          style={{
                            width: '10px',
                            height: '10px',
                            borderRadius: '3px',
                            background: color,
                            flexShrink: 0,
                          }}
                        />
                        <span
                          style={{
                            fontWeight: 500,
                            color: 'var(--text-color)',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '130px',
                          }}
                        >
                          {d.domain}
                        </span>
                      </div>
                      <span style={{ fontWeight: 700, color: 'var(--text-color)' }}>
                        {d.percentage}%
                      </span>
                    </div>
                  );
                })}
              </div>

              {aiOverview.organicCompetitorOverlapCount > 0 && (
                <div
                  style={{
                    marginTop: '10px',
                    padding: '6px 8px',
                    background: 'rgba(40, 167, 156, 0.1)',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    color: 'var(--accent-color)',
                    fontWeight: 600,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <GoogleIcon name="check_circle" size={13} color="var(--accent-color)" />
                  <span>{aiOverview.organicCompetitorOverlapCount} of Top 10 competitors are cited</span>
                </div>
              )}
            </div>
          </div>

          {/* Cited Pages List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2px' }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-color)' }}>
                Pages Cited by Google AI:
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--muted-text)', background: 'var(--segmented-bg)', padding: '2px 7px', borderRadius: '6px' }}>
                Showing {displayedReferences.length} of {references.length}
              </span>
            </div>

            {displayedReferences.map((ref, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  background: '#ffffff',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-sm)',
                  gap: '8px',
                }}
              >
                <div style={{ overflow: 'hidden', flex: 1 }}>
                  <a
                    href={ref.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      fontSize: '0.84rem',
                      fontWeight: 600,
                      color: 'var(--text-color)',
                      textDecoration: 'none',
                      display: 'block',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.color = 'var(--accent-color)')}
                    onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-color)')}
                  >
                    {ref.title || ref.domain}
                  </a>
                  <span style={{ fontSize: '0.72rem', color: 'var(--muted-text)', display: 'block' }}>
                    {ref.domain || ref.source}
                  </span>
                </div>

                {ref.matchesCompetitorRank ? (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      background: 'var(--accent-color)',
                      color: '#ffffff',
                      padding: '2px 7px',
                      borderRadius: '6px',
                      flexShrink: 0,
                    }}
                  >
                    Competitor #{ref.matchesCompetitorRank}
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      color: 'var(--muted-text)',
                      background: 'var(--segmented-bg)',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      flexShrink: 0,
                    }}
                  >
                    External Citation
                  </span>
                )}
              </div>
            ))}

            {references.length > 3 && (
              <div style={{ textAlign: 'center', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#ffffff',
                    color: 'var(--accent-color)',
                    border: '1px solid var(--border-color)',
                    padding: '6px 14px',
                    borderRadius: '9999px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-color)';
                    e.currentTarget.style.background = 'var(--accent-light)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.background = '#ffffff';
                  }}
                >
                  {isExpanded ? (
                    <>
                      Show Less
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="18 15 12 9 6 15"></polyline>
                      </svg>
                    </>
                  ) : (
                    <>
                      See More ({references.length - 3} more citations)
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
