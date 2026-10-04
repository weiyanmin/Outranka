'use client';

import React from 'react';
import { AnalysisResult } from '../../../lib/analyze';
import { getSchemaOrgUrl } from '../../../lib/schema';
import GoogleIcon from '../../GoogleIcon';
import RelatedKeywordsCard from '../../RelatedKeywordsCard';
import SectionCard from '../SectionCard';
import Pill from '../Pill';

function parseTopic(topic: string): { title: string; detail: string } {
  // Check if contains colon
  if (topic.includes(':')) {
    const [head, ...rest] = topic.split(':');
    return { title: head.trim(), detail: rest.join(':').trim() };
  }
  // Check if contains em-dash or en-dash
  if (topic.includes('—') || topic.includes(' - ')) {
    const delimiter = topic.includes('—') ? '—' : ' - ';
    const [head, ...rest] = topic.split(delimiter);
    return { title: head.trim(), detail: rest.join(delimiter).trim() };
  }
  // Check if contains parentheses e.g. "Topic title (e.g. details)"
  const parenMatch = topic.match(/^([^(]+?)\s*\((.+)\)$/);
  if (parenMatch) {
    return { title: parenMatch[1].trim(), detail: parenMatch[2].trim() };
  }
  // Check if contains transitions like "beyond", "distinguishing", "detailing", "including"
  const transitionMatch = topic.match(/^(.+?)\s+(beyond|distinguishing|detailing|including|such as)\s+(.+)$/i);
  if (transitionMatch) {
    return {
      title: transitionMatch[1].trim(),
      detail: `${transitionMatch[2].charAt(0).toUpperCase() + transitionMatch[2].slice(1)} ${transitionMatch[3].trim()}`,
    };
  }
  // Fallback: take first 5 words as title
  const words = topic.split(' ');
  if (words.length > 5) {
    return {
      title: words.slice(0, 5).join(' '),
      detail: words.slice(5).join(' '),
    };
  }
  return { title: topic, detail: '' };
}

function renderRecommendationText(text: string): React.ReactNode {
  // Regex to match leading actionable phrase before transition prepositions: from, including, showing, addressing, such as, by, for
  const match = text.match(/^(.+?)\s+(from|including|showing|addressing|such as|for|by)\s+(.*)$/i);

  let lead = '';
  let connector = '';
  let rest = text;

  if (match) {
    lead = match[1];
    connector = ' ' + match[2] + ' ';
    rest = match[3];
  } else {
    const words = text.split(' ');
    if (words.length > 4) {
      lead = words.slice(0, 4).join(' ');
      rest = ' ' + words.slice(4).join(' ');
    } else {
      lead = text;
      rest = '';
    }
  }

  // Core actionable keywords to bold in rest
  const keyTerms = [
    'Paid Ads (PPC)',
    'Paid Ads',
    'PPC',
    'Social Media Marketing',
    'Analytics reporting',
    'FAQ section',
    'pricing models',
    'client onboarding',
    'measurable revenue impact',
    'KPIs',
    'case study breakdowns',
    'case studies',
    'case study',
    'digital marketing agency',
    'freelance SEO specialist',
    'Table of Contents',
    'H2/H3',
    'Schema markup',
    'Search Intent',
    'retainer vs. project',
    'team structure',
  ];

  const escapedTerms = keyTerms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const termRegex = new RegExp(`(${escapedTerms.join('|')})`, 'gi');
  const parts = rest.split(termRegex);

  return (
    <span>
      <strong style={{ color: 'var(--text-color)', fontWeight: 700 }}>{lead}</strong>
      {connector}
      {parts.map((part, idx) => {
        const isTerm = keyTerms.some((t) => t.toLowerCase() === part.toLowerCase());
        if (isTerm) {
          return (
            <strong key={idx} style={{ color: 'var(--text-color)', fontWeight: 700 }}>
              {part}
            </strong>
          );
        }
        return <span key={idx}>{part}</span>;
      })}
    </span>
  );
}

function getSchemaTitle(type: string, reason: string): string {
  const lower = type.toLowerCase();
  if (lower.includes('organization')) return 'Corporate & Brand Identity';
  if (lower.includes('professionalservice') || lower.includes('service')) return 'Agency Services & Local Scope';
  if (lower.includes('faq')) return 'Rich Snippet FAQ Accordions';
  if (lower.includes('article') || lower.includes('blog')) return 'Editorial Authority & Publishing';
  if (lower.includes('product')) return 'Product & Offer Specifications';
  if (lower.includes('localbusiness')) return 'Local Business & Map Presence';
  if (lower.includes('breadcrumb')) return 'Navigation Hierarchy & Breadcrumbs';
  return `${type} Structured Data`;
}

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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topics.map((t, i) => {
              const { title, detail } = parseTopic(t);
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    padding: '14px 18px',
                    background: '#fafafc',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'rgba(245, 158, 11, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    <GoogleIcon name="warning" size={19} color="#b45309" />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-color)', lineHeight: 1.4 }}>
                      {title}
                    </div>
                    {detail && (
                      <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5, marginTop: '4px' }}>
                        {detail}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {recs.length > 0 && (
        <SectionCard
          title="Priority Recommendations"
          subtitle="Do these first to outrank the current results"
          span={12}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recs.map((r, i) => {
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '14px',
                    padding: '14px 18px',
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '10px',
                      background: 'var(--accent-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    <GoogleIcon name="lightbulb" size={19} color="var(--accent-color)" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0, fontSize: '0.9rem', color: '#334155', lineHeight: 1.5 }}>
                    {renderRecommendationText(r)}
                  </div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {structure.length > 0 && (
        <SectionCard
          title="Suggested Content Structure"
          subtitle="Recommended H2 / H3 outline aligned with what Google is ranking"
          span={12}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {structure.map((s, i) => {
              const level = (s.level || (i % 3 === 2 ? 'H3' : 'H2')).toUpperCase();
              const isH2 = level === 'H2';
              return (
                <div
                  key={i}
                  style={{
                    marginLeft: isH2 ? 0 : 28,
                    paddingLeft: isH2 ? 0 : 18,
                    borderLeft: isH2 ? 'none' : '2px solid rgba(40, 167, 156, 0.4)',
                    paddingTop: '2px',
                    paddingBottom: '2px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <Pill tone={isH2 ? 'accent' : 'info'}>{level}</Pill>
                    <span style={{ fontSize: isH2 ? '0.98rem' : '0.92rem', fontWeight: 700, color: 'var(--text-color)' }}>
                      {s.heading}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.86rem', color: '#475569', lineHeight: 1.5, marginTop: 5 }}>
                    {s.description}
                  </p>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {schema.map((sch, i) => {
              const schemaUrl = getSchemaOrgUrl(sch.type);
              const title = getSchemaTitle(sch.type, sch.reason);
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '16px',
                    padding: '16px 20px',
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
                  }}
                >
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: 'var(--accent-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: '2px',
                    }}
                  >
                    <GoogleIcon name="code" size={19} color="var(--accent-color)" />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <a
                        href={schemaUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: 'inline-flex',
                          textDecoration: 'none',
                          transition: 'opacity 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.82')}
                        onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                        title={`View ${sch.type} specifications on schema.org`}
                      >
                        <Pill tone="accent">
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            {sch.type}
                            <GoogleIcon name="open_in_new" size={10} color="currentColor" />
                          </span>
                        </Pill>
                      </a>
                      <span style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--text-color)' }}>
                        {title}
                      </span>
                    </div>

                    <p style={{ fontSize: '0.88rem', color: '#334155', lineHeight: 1.5, margin: 0 }}>
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
