'use client';

import React from 'react';
import { AnalysisResult } from '../../../lib/analyze';
import AiOverviewCard from '../../AiOverviewCard';
import LanguageMismatchBanner from '../../LanguageMismatchBanner';
import SectionCard from '../SectionCard';

export default function AiLanguageTab({ analysis }: { analysis: AnalysisResult }) {
  const hasAi = !!analysis.aiOverview;
  const hasLanguage = !!analysis.languageAudit;

  if (!hasAi && !hasLanguage) {
    return (
      <div className="bento">
        <SectionCard title="AI Overview & Language" subtitle="No AI Overview or language data was returned for this audit." span={12}>
          <p style={{ fontSize: '0.88rem', color: 'var(--muted-text)' }}>Try running the audit again to refresh this data.</p>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="bento">
      <AiOverviewCard aiOverview={analysis.aiOverview} span={12} />
      <LanguageMismatchBanner languageAudit={analysis.languageAudit} span={12} />
    </div>
  );
}
