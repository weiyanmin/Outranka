'use client';

import React from 'react';
import { AnalysisResult } from '../../../lib/analyze';
import { SerpResultItem } from '../../../lib/serp';
import CompetitorList from '../../CompetitorList';
import SectionCard from '../SectionCard';

interface CompetitorsTabProps {
  analysis: AnalysisResult;
  competitors: SerpResultItem[];
}

export default function CompetitorsTab({ analysis, competitors }: CompetitorsTabProps) {
  if (competitors.length === 0) {
    return (
      <div className="bento">
        <SectionCard title="Competitors" subtitle="No competitor data was returned for this audit." span={12}>
          <p style={{ fontSize: '0.88rem', color: 'var(--muted-text)' }}>Try running the audit again to refresh this data.</p>
        </SectionCard>
      </div>
    );
  }

  return (
    <div className="bento">
      <CompetitorList
        competitors={competitors}
        competitorIntents={analysis.competitorIntents}
        aiOverview={analysis.aiOverview}
        span={12}
      />
    </div>
  );
}
