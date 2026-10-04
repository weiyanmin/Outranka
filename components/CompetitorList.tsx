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

function formatUrlBreadcrumb(rawUrl: string): string {
  if (!rawUrl) return 'URL unavailable';

  try {
    const parsed = new URL(rawUrl);
    const domain = parsed.hostname.replace(/^www\./i, '');
    const pathSegments = parsed.pathname
      .split('/')
      .filter(Boolean)
      .map((segment) => {
        try {
          return decodeURIComponent(segment).replace(/[-_]+/g, ' ');
        } catch {
          return segment;
        }
      });

    // Keep the breadcrumb scannable while retaining the first and last useful path segments.
    const visiblePath = pathSegments.length > 3
      ? [pathSegments[0], '…', pathSegments[pathSegments.length - 1]]
      : pathSegments;

    return [domain, ...visiblePath].join(' > ');
  } catch {
    return rawUrl.replace(/^https?:\/\//i, '').replace(/\/$/, '');
  }
}

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
          const isEnglishDefault = !item.language ||
            item.language.code.toLowerCase() === 'en' ||
            item.language.name.toLowerCase() === 'english';
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
                  className="competitor-title"
                >
                  {item.title}
                </a>
                <a
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="competitor-url"
                  title={item.link}
                  aria-label={`Open ${item.link}`}
                >
                  {formatUrlBreadcrumb(item.link)}
                </a>

                {item.snippet && (
                  <p style={{ fontSize: '0.86rem', color: 'var(--text-color)', opacity: 0.85, lineHeight: 1.5, marginTop: 8 }}>{item.snippet}</p>
                )}

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: 12 }}>
                  {intent && <Pill tone={INTENT_TONE[intent]}>{intent}</Pill>}
                  {isCitedByAi(item) && <Pill tone="accent">Cited in AI Overview</Pill>}
                  {!isEnglishDefault && item.language && <Pill tone="neutral">{item.language.name}</Pill>}
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
                          <GoogleIcon name="open_in_new" size={10} color="currentColor" />
                        </span>
                      </Pill>
                    </a>
                  ))}
                </div>

                {stats.length > 0 && (
                  <div className="competitor-stats">
                    <GoogleIcon name="toc" size={14} color="currentColor" />
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
