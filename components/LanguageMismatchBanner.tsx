'use client';

import React from 'react';
import { LanguageAuditResult } from '../lib/language';

interface LanguageMismatchBannerProps {
  languageAudit?: LanguageAuditResult;
}

export default function LanguageMismatchBanner({ languageAudit }: LanguageMismatchBannerProps) {
  if (!languageAudit) return null;

  const { userLanguage, favoredSerpLanguage, isMismatch, competitorLanguagesBreakdown, warningMessage, recommendation } =
    languageAudit;

  // Render language mismatch alert or language parity confirmation
  if (isMismatch) {
    return (
      <div
        className="card"
        style={{
          background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
          border: '1.5px solid #f97316',
          borderRadius: 'var(--radius-md)',
          padding: '16px 18px',
          marginBottom: '16px',
          boxShadow: '0 2px 10px rgba(249, 115, 22, 0.1)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.3rem' }}>🌐</span>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#9a3412', margin: 0, letterSpacing: '-0.01em' }}>
              SERP Language Mismatch Detected
            </h3>
          </div>

          <span
            style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              background: '#ea580c',
              color: '#ffffff',
              padding: '2px 8px',
              borderRadius: '9999px',
            }}
          >
            Google Favors {favoredSerpLanguage.name}
          </span>
        </div>

        <p style={{ fontSize: '0.88rem', color: '#7c2d12', lineHeight: 1.45, marginBottom: '10px' }}>
          {warningMessage}
        </p>

        {/* Breakdown bar */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.7)',
            border: '1px solid rgba(249, 115, 22, 0.25)',
            borderRadius: 'var(--radius-sm)',
            padding: '10px 12px',
            marginBottom: '10px',
            fontSize: '0.82rem',
            color: '#7c2d12',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '6px' }}>
            <span>Your Content Language: <strong>{userLanguage.name}</strong> ({userLanguage.code.toUpperCase()})</span>
            <span>Google Favored Language: <strong>{favoredSerpLanguage.name}</strong> ({favoredSerpLanguage.confidence}% of Top 10)</span>
          </div>

          {/* Languages distribution pills */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center', marginTop: '6px' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#9a3412' }}>Top 10 Breakdown:</span>
            {competitorLanguagesBreakdown.map((item) => (
              <span
                key={item.code}
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  background: item.code === favoredSerpLanguage.code ? '#ffedd5' : '#ffffff',
                  border: '1px solid rgba(249, 115, 22, 0.3)',
                  padding: '2px 7px',
                  borderRadius: '6px',
                  color: '#9a3412',
                }}
              >
                {item.language}: {item.percentage}% ({item.count})
              </span>
            ))}
          </div>
        </div>

        <div style={{ fontSize: '0.82rem', color: '#9a3412', lineHeight: 1.4 }}>
          <strong>Actionable Advice:</strong> {recommendation}
        </div>
      </div>
    );
  }

  // Matching Language Pill/Card
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        background: '#f0fdf4',
        border: '1px solid #86efac',
        borderRadius: 'var(--radius-md)',
        marginBottom: '16px',
        flexWrap: 'wrap',
        gap: '8px',
        fontSize: '0.84rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>🌐</span>
        <span style={{ color: '#166534', fontWeight: 600 }}>
          Language Match: Google favors <strong>{favoredSerpLanguage.name}</strong> for this query &amp; location, which matches your content.
        </span>
      </div>

      <span
        style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          background: '#dcfce7',
          color: '#15803d',
          padding: '2px 8px',
          borderRadius: '9999px',
          border: '1px solid #bbf7d0',
        }}
      >
        {favoredSerpLanguage.confidence}% {favoredSerpLanguage.name} in Top 10
      </span>
    </div>
  );
}
