'use client';

import React from 'react';
import { AnalysisResult } from '../../../lib/analyze';
import { getSchemaOrgUrl } from '../../../lib/schema';
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
          span={12}
          action={<Pill tone="warning">{topics.length} gaps</Pill>}
        >
          <ol
            className="clean-list"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px 28px' }}
          >
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
          span={12}
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
          span={12}
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
          subtitle="Structured data used by top-performing competitors — click any schema to view official schema.org specifications"
          span={12}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            {schema.map((sch, i) => {
              const schemaUrl = getSchemaOrgUrl(sch.type);
              return (
                <div
                  key={i}
                  style={{
                    padding: '16px 18px',
                    background: '#fafafc',
                    border: '1px solid var(--border-color)',
                    borderRadius: '10px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '10px',
                    transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px',
                        marginBottom: '10px',
                      }}
                    >
                      <a
                        href={schemaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ textDecoration: 'none' }}
                        title={`View ${sch.type} specifications on schema.org`}
                      >
                        <Pill tone="accent">
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            {sch.type}
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                              <polyline points="15 3 21 3 21 9"></polyline>
                              <line x1="10" y1="14" x2="21" y2="3"></line>
                            </svg>
                          </span>
                        </Pill>
                      </a>

                      <a
                        href={schemaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.78rem',
                          color: 'var(--accent-color)',
                          fontWeight: 600,
                          textDecoration: 'none',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                        onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                        title={`Open ${schemaUrl} in new tab`}
                      >
                        <span>schema.org</span>
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                      </a>
                    </div>

                    <p style={{ fontSize: '0.88rem', color: 'var(--text-color)', lineHeight: 1.5 }}>
                      {sch.reason}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      <RelatedKeywordsCard relatedSearches={analysis.relatedSearches} peopleAlsoAsk={analysis.peopleAlsoAsk} span={12} />
    </div>
  );
}
