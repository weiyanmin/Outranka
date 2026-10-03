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
    <div style={{ marginTop: '32px' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '16px' }}>
        Top 10 Google Competitors
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {competitors.map((item) => (
          <div
            key={item.position + item.link}
            style={{
              padding: '16px',
              background: 'var(--card-bg)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  background: 'var(--accent-color)',
                  color: '#ffffff',
                  padding: '2px 8px',
                  borderRadius: '12px',
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
                  color: 'var(--accent-color)',
                  textDecoration: 'none',
                  fontSize: '1rem',
                }}
              >
                {item.title}
              </a>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted-text)', wordBreak: 'break-all', marginBottom: '6px' }}>
              {item.link}
            </p>
            {item.snippet && (
              <p style={{ fontSize: '0.9rem', color: 'var(--text-color)', lineHeight: 1.4 }}>
                {item.snippet}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
