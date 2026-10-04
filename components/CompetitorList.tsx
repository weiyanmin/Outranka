'use client';

import React, { useState } from 'react';
import { SerpResultItem } from '../lib/serp';
import { CompetitorIntentInfo } from '../lib/analyze';
import { SearchIntentCategory } from '../lib/scoring';

interface CompetitorListProps {
  competitors: SerpResultItem[];
  competitorIntents?: CompetitorIntentInfo[];
}

export default function CompetitorList({ competitors, competitorIntents }: CompetitorListProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!competitors || competitors.length === 0) {
    return null;
  }

  const getIntentCategory = (position: number, url: string): SearchIntentCategory | null => {
    if (!competitorIntents) return null;
    const match = competitorIntents.find((ci) => ci.rank === position || ci.url === url);
    return match ? match.intentCategory : null;
  };

  const getIntentBadgeStyle = (intent: SearchIntentCategory) => {
    switch (intent) {
      case 'Commercial':
        return {
          bg: 'rgba(40, 167, 156, 0.12)',
          color: '#1a776f',
          border: 'rgba(40, 167, 156, 0.3)',
        };
      case 'Informational':
        return {
          bg: 'rgba(2, 132, 199, 0.1)',
          color: '#0284c7',
          border: 'rgba(2, 132, 199, 0.25)',
        };
      case 'Transactional':
        return {
          bg: 'rgba(234, 88, 12, 0.1)',
          color: '#c2410c',
          border: 'rgba(234, 88, 12, 0.25)',
        };
      case 'Navigational':
      default:
        return {
          bg: 'rgba(100, 116, 139, 0.1)',
          color: '#475569',
          border: 'rgba(100, 116, 139, 0.2)',
        };
    }
  };

  const displayedCompetitors = isExpanded ? competitors : competitors.slice(0, 3);
  const remainingCount = Math.max(0, competitors.length - 3);

  return (
    <div style={{ marginTop: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', padding: '0 4px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)', letterSpacing: '-0.01em' }}>
          Top {isExpanded ? competitors.length : '3'} Competitors
        </h3>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-text)', background: 'var(--segmented-bg)', padding: '3px 8px', borderRadius: '6px' }}>
          Showing {displayedCompetitors.length} of {competitors.length}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {displayedCompetitors.map((item) => {
          const intent = getIntentCategory(item.position, item.link);
          const badgeStyle = intent ? getIntentBadgeStyle(intent) : null;

          return (
            <div
              key={item.position + item.link}
              className="card"
              style={{
                padding: '16px 18px',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: item.position <= 3 ? 'var(--accent-color)' : 'var(--segmented-bg)',
                    color: item.position <= 3 ? '#ffffff' : 'var(--text-color)',
                    padding: '2px 7px',
                    borderRadius: '6px',
                    flexShrink: 0,
                  }}
                >
                  #{item.position}
                </span>

                {intent && badgeStyle && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      background: badgeStyle.bg,
                      color: badgeStyle.color,
                      border: `1px solid ${badgeStyle.border}`,
                      padding: '2px 7px',
                      borderRadius: '9999px',
                      flexShrink: 0,
                    }}
                  >
                    {intent} Intent
                  </span>
                )}
              </div>

              <div style={{ marginBottom: '4px' }}>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontWeight: 600,
                    color: 'var(--text-color)',
                    textDecoration: 'none',
                    fontSize: '0.95rem',
                    lineHeight: 1.35,
                  }}
                  onMouseOver={(e) => (e.currentTarget.style.color = 'var(--accent-color)')}
                  onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-color)')}
                >
                  {item.title}
                </a>
              </div>
              
              <p
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--muted-text)',
                  wordBreak: 'break-all',
                  marginBottom: '8px',
                }}
              >
                {item.link}
              </p>

              {item.snippet && (
                <p
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-color)',
                    lineHeight: 1.45,
                    opacity: 0.9,
                    marginBottom: '10px',
                  }}
                >
                  {item.snippet}
                </p>
              )}

              {/* Competitor Schema Types */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  flexWrap: 'wrap',
                  paddingTop: '8px',
                  borderTop: '1px solid var(--border-color)',
                  marginTop: '4px',
                }}
              >
                <span
                  style={{
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    color: 'var(--muted-text)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    marginRight: '2px',
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                  </svg>
                  Schema:
                </span>

                {item.schemaTypes && item.schemaTypes.length > 0 ? (
                  item.schemaTypes.map((st, sIdx) => (
                    <span
                      key={sIdx}
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: 600,
                        fontFamily: 'monospace',
                        color: 'var(--accent-color)',
                        background: 'var(--accent-light)',
                        border: '1px solid rgba(40, 167, 156, 0.25)',
                        padding: '2px 7px',
                        borderRadius: '6px',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {st}
                    </span>
                  ))
                ) : (
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontStyle: 'italic',
                      color: 'var(--muted-text)',
                      opacity: 0.8,
                    }}
                  >
                    No structured schema detected
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {competitors.length > 3 && (
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#ffffff',
              color: 'var(--accent-color)',
              border: '1px solid var(--border-color)',
              padding: '10px 20px',
              borderRadius: '9999px',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
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
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
              </>
            ) : (
              <>
                See More ({remainingCount} more competitors)
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
