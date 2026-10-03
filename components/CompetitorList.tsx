import React from 'react';
import { SerpResultItem } from '../lib/serp';

interface CompetitorListProps {
  competitors: SerpResultItem[];
}

export default function CompetitorList({ competitors }: CompetitorListProps) {
  if (!competitors || competitors.length === 0) {
    return null;
  }

  return (
    <div style={{ marginTop: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', padding: '0 4px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)', letterSpacing: '-0.01em' }}>
          Top 10 Google Competitors
        </h3>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted-text)', background: 'var(--segmented-bg)', padding: '3px 8px', borderRadius: '6px' }}>
          {competitors.length} Ranked Pages
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {competitors.map((item) => (
          <div
            key={item.position + item.link}
            className="card"
            style={{
              padding: '16px 18px',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.02)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '4px' }}>
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
                paddingLeft: '32px',
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
                  paddingLeft: '32px',
                  opacity: 0.9,
                }}
              >
                {item.snippet}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
