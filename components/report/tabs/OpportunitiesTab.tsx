'use client';

import React from 'react';
import { AnalysisResult } from '../../../lib/analyze';
import RelatedKeywordsCard from '../../RelatedKeywordsCard';
import SectionCard from '../SectionCard';
import Pill from '../Pill';

export default function OpportunitiesTab({ analysis }: { analysis: AnalysisResult }) {
  const topics = analysis.missingTopics || [];
  const recs = analysis.topRecommendations || [];
  const structure = analysis.suggestedStructure || [];
  const schema = analysis.suggestedSchema || [];

  return (
    <div className="bento">
      {topics.length > 0 && (
        <SectionCard
          title="Topics You Are Missing"
          subtitle="Subtopics top competitors cover that your content lacks"
          span={recs.length > 0 ? 7 : 12}
          action={<Pill tone="warning">{topics.length} gaps</Pill>}
        >
          <ol className="clean-list">
            {topics.map((t, i) => (
              <li key={i} className="clean-list-item" style={{ fontWeight: 500 }}>
                <span className="num-badge">{i + 1}</span>
                <span>{t}</span>
              </li>
            ))}
          </ol>
        </SectionCard>
      )}

      {recs.length > 0 && (
        <SectionCard
          title="Priority Recommendations"
          subtitle="Do these first to outrank the current results"
          span={topics.length > 0 ? 5 : 12}
        >
          <ol className="clean-list">
            {recs.map((r, i) => (
              <li key={i} className="clean-list-item">
                <span className="num-badge" style={{ background: 'var(--accent-color)', color: '#fff' }}>
                  {i + 1}
                </span>
                <span>{r}</span>
              </li>
            ))}
          </ol>
        </SectionCard>
      )}

      {structure.length > 0 && (
        <SectionCard
          title="Suggested Content Structure"
          subtitle="Recommended H2 / H3 outline aligned with what Google is ranking"
          span={schema.length > 0 ? 7 : 12}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {structure.map((s, i) => {
              const level = (s.level || (i % 3 === 2 ? 'H3' : 'H2')).toUpperCase();
              const isH2 = level === 'H2';
              return (
                <div
                  key={i}
                  style={{
                    marginLeft: isH2 ? 0 : 28,
                    paddingLeft: isH2 ? 0 : 18,
                    borderLeft: isH2 ? 'none' : '2px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <Pill tone={isH2 ? 'accent' : 'info'}>{level}</Pill>
                    <span style={{ fontSize: isH2 ? '0.98rem' : '0.92rem', fontWeight: isH2 ? 700 : 600, color: 'var(--text-color)' }}>
                      {s.heading}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.86rem', color: 'var(--muted-text)', lineHeight: 1.5, marginTop: 6 }}>{s.description}</p>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {schema.length > 0 && (
        <SectionCard
          title="Suggested Schema Markup"
          subtitle="Structured data used by top-performing competitors"
          span={structure.length > 0 ? 5 : 12}
        >
          <div className="divided" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {schema.map((sch, i) => (
              <div key={i}>
                <Pill tone="accent">{sch.type}</Pill>
                <p style={{ fontSize: '0.88rem', color: 'var(--text-color)', lineHeight: 1.5, marginTop: 8 }}>{sch.reason}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      <RelatedKeywordsCard relatedSearches={analysis.relatedSearches} peopleAlsoAsk={analysis.peopleAlsoAsk} span={12} />
    </div>
  );
}
