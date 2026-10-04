'use client';

import React from 'react';
import { LanguageAuditResult } from '../lib/language';
import GoogleIcon from './GoogleIcon';
import StackedBar from './charts/StackedBar';
import { COLORS } from './charts/colors';
import SectionCard from './report/SectionCard';
import Pill from './report/Pill';

interface LanguageMismatchBannerProps {
  languageAudit?: LanguageAuditResult;
  span?: 3 | 4 | 5 | 6 | 7 | 8 | 12;
}

const OTHER_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#64748b', '#6366f1'];

const labelStyle: React.CSSProperties = {
  fontSize: '0.72rem',
  fontWeight: 700,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: 'var(--muted-text)',
};

export default function LanguageMismatchBanner({ languageAudit, span = 12 }: LanguageMismatchBannerProps) {
  if (!languageAudit) return null;

  const { userLanguage, favoredSerpLanguage, isMismatch, competitorLanguagesBreakdown, warningMessage, recommendation } = languageAudit;

  let otherIndex = 0;
  const segments = competitorLanguagesBreakdown.map((item) => ({
    label: item.language,
    value: item.count,
    color: item.code === favoredSerpLanguage.code ? COLORS.accent : OTHER_COLORS[otherIndex++ % OTHER_COLORS.length],
  }));

  return (
    <SectionCard
      title="Language Alignment"
      subtitle="The language of your content vs. the pages Google ranks"
      span={span}
      action={<Pill tone={isMismatch ? 'warning' : 'success'}>{isMismatch ? 'Mismatch' : 'Match'}</Pill>}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <div style={labelStyle}>Your content</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: 'var(--text-color)', marginTop: 6 }}>{userLanguage.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted-text)' }}>{userLanguage.code.toUpperCase()}</div>
          </div>
          <div>
            <div style={labelStyle}>Google favors</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 700, color: isMismatch ? '#b45309' : 'var(--accent-color)', marginTop: 6 }}>
              {favoredSerpLanguage.name}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--muted-text)' }}>{favoredSerpLanguage.confidence}% of top 10</div>
          </div>
        </div>

        {segments.length > 0 && (
          <div>
            <div style={{ ...labelStyle, marginBottom: 14 }}>Top 10 language breakdown</div>
            <StackedBar segments={segments} totalLabel="pages" />
          </div>
        )}

        {isMismatch ? (
          <div className="divided" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {warningMessage && (
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <GoogleIcon name="warning" size={20} color="#b45309" style={{ marginTop: 1 }} />
                <p style={{ fontSize: '0.88rem', lineHeight: 1.5, color: 'var(--text-color)' }}>{warningMessage}</p>
              </div>
            )}
            {recommendation && (
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <GoogleIcon name="bolt" size={20} color="var(--accent-color)" style={{ marginTop: 1 }} />
                <p style={{ fontSize: '0.88rem', lineHeight: 1.5, color: 'var(--text-color)' }}>
                  <strong>What to do: </strong>
                  {recommendation}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <GoogleIcon name="check_circle" size={20} color={COLORS.success} />
            <span style={{ fontSize: '0.9rem', color: 'var(--text-color)' }}>
              Google favors {favoredSerpLanguage.name} for this query and location, which matches your content.
            </span>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
