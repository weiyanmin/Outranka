'use client';

import React from 'react';
import { SerpResultItem, GoogleAiOverviewData } from '../lib/serp';
import { CompetitorIntentInfo } from '../lib/analyze';
import { SearchIntentCategory } from '../lib/scoring';
import GoogleIcon from './GoogleIcon';
import SectionCard from './report/SectionCard';
import Pill, { Tone } from './report/Pill';
import { getSchemaOrgUrl } from '../lib/schema';

interface CompetitorListProps {
  competitors: SerpResultItem[];
  competitorIntents?: CompetitorIntentInfo[];
  aiOverview?: GoogleAiOverviewData;
  span?: 3 | 4 | 5 | 6 | 7 | 8 | 12;
}

const INTENT_TONE: Record<SearchIntentCategory, Tone> = {
  Commercial: 'accent',
  Informational: 'info',
  Transactional: 'warning',
  Navigational: 'neutral',
};

export default function CompetitorList({ competitors, competitorIntents, aiOverview, span = 12 }: CompetitorListProps) {
  if (!competitors || competitors.length === 0) return null;

  const getIntent = (position: number, url: string): SearchIntentCategory | null => {
    const match = competitorIntents?.find((ci) => ci.rank === position || ci.url === url);
    return match ? match.intentCategory : null;
  };

  const isCitedByAi = (item: SerpResultItem) =>
    !!aiOverview?.triggered &&
    aiOverview.references.some(
      (ref) =>
        ref.matchesCompetitorRank === item.position ||
        ref.link === item.link ||
        (item.link && ref.domain && item.link.includes(ref.domain))
    );

  return (
    <SectionCard
      title={`Top ${competitors.length} Competitors`}
      subtitle="The pages Google currently ranks for your keyword"
      span={span}
    >
      <div className="divided" style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
        {competitors.map((item, idx) => {
          const intent = getIntent(item.position, item.link);
          const m = item.metrics;
          const stats = m
            ? [
                `${m.h2Count} H2`,
                `${m.imageCount} ${m.imageCount === 1 ? 'image' : 'images'}`,
                `${m.videoCount} ${m.videoCount === 1 ? 'video' : 'videos'}`,
                m.hasTableOfContents ? 'Table of contents' : 'No table of contents',
              ]
            : [];

          return (
            <div
              key={item.position + item.link}
              style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', paddingTop: idx === 0 ? 0 : 22 }}
            >
              <span
                className="num-badge"
                style={item.position <= 3 ? { background: 'var(--accent-color)', color: '#fff' } : { background: 'var(--segmented-bg)', color: 'var(--text-color)' }}
              >
                {item.position}
              </span>

              <div style={{ flex: 1, minWidth: 0 }}>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontWeight: 600, fontSize: '0.98rem', lineHeight: 1.4, color: 'var(--text-color)', textDecoration: 'none' }}
                  onMouseOver={(e) => (e.currentTarget.style.color = 'var(--accent-color)')}
                  onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-color)')}
                >
                  {item.title}
                </a>
                <div
                  style={{ fontSize: '0.78rem', color: 'var(--muted-text)', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {item.link}
                </div>

                {item.snippet && (
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-color)', opacity: 0.85, lineHeight: 1.5, marginTop: 8 }}>{item.snippet}</p>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: 12 }}>
                  {intent && <Pill tone={INTENT_TONE[intent]}>{intent}</Pill>}
                  {isCitedByAi(item) && <Pill tone="accent">Cited in AI Overview</Pill>}
                  {item.language && <Pill tone="neutral">{item.language.name}</Pill>}
                  {item.schemaTypes?.map((st) => (
                    <a
                      key={st}
                      href={getSchemaOrgUrl(st)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ textDecoration: 'none' }}
                      title={`View ${st} on schema.org`}
                    >
                      <Pill tone="neutral">
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          {st}
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                          </svg>
                        </span>
                      </Pill>
                    </a>
                  ))}
                </div>

                {stats.length > 0 && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 12, fontSize: '0.8rem', color: 'var(--muted-text)' }}>
                    <GoogleIcon name="bar_chart" size={14} color="currentColor" />
                    {stats.map((s, i) => (
                      <React.Fragment key={s}>
                        {i > 0 && <span>·</span>}
                        <span>{s}</span>
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
}
