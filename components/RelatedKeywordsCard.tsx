'use client';

import React, { useState } from 'react';
import { RelatedSearchItem, PeopleAlsoAskItem } from '../lib/serp';
import GoogleIcon from './GoogleIcon';
import SectionCard from './report/SectionCard';

interface RelatedKeywordsCardProps {
  relatedSearches?: RelatedSearchItem[];
  peopleAlsoAsk?: PeopleAlsoAskItem[];
  span?: 3 | 4 | 5 | 6 | 7 | 8 | 12;
}

const KEYWORD_LIMIT = 8;
const QUESTION_LIMIT = 4;

export default function RelatedKeywordsCard({ relatedSearches = [], peopleAlsoAsk = [], span = 12 }: RelatedKeywordsCardProps) {
  const [activeTab, setActiveTab] = useState<'keywords' | 'questions'>('keywords');
  const [isExpanded, setIsExpanded] = useState(false);

  const hasKeywords = relatedSearches.length > 0;
  const hasQuestions = peopleAlsoAsk.length > 0;
  if (!hasKeywords && !hasQuestions) return null;

  const currentTab = !hasKeywords ? 'questions' : !hasQuestions ? 'keywords' : activeTab;
  const total = currentTab === 'keywords' ? relatedSearches.length : peopleAlsoAsk.length;
  const limit = currentTab === 'keywords' ? KEYWORD_LIMIT : QUESTION_LIMIT;
  const noun = currentTab === 'keywords' ? 'searches' : 'questions';

  const switchTab = (tab: 'keywords' | 'questions') => {
    setActiveTab(tab);
    setIsExpanded(false);
  };

  const toggle = (
    <div style={{ display: 'flex', background: 'var(--segmented-bg)', borderRadius: 10, padding: 3 }}>
      {([
        ['keywords', `Related searches (${relatedSearches.length})`],
        ['questions', `People also ask (${peopleAlsoAsk.length})`],
      ] as const).map(([id, label]) => (
        <button
          key={id}
          type="button"
          onClick={() => switchTab(id)}
          style={{
            border: 'none',
            background: currentTab === id ? '#ffffff' : 'transparent',
            color: currentTab === id ? 'var(--text-color)' : 'var(--muted-text)',
            fontFamily: 'inherit',
            fontWeight: currentTab === id ? 600 : 500,
            fontSize: '0.8rem',
            padding: '6px 12px',
            borderRadius: 8,
            cursor: 'pointer',
            boxShadow: currentTab === id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s ease',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );

  return (
    <SectionCard
      title="Related Searches & Questions"
      subtitle={
        currentTab === 'keywords'
          ? 'Variations Google suggests next. Work these terms naturally into your draft.'
          : 'Questions searchers ask. Answer them under H2/H3 headings to win featured snippets.'
      }
      span={span}
      action={hasKeywords && hasQuestions ? toggle : undefined}
    >
      {currentTab === 'keywords' && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {(isExpanded ? relatedSearches : relatedSearches.slice(0, KEYWORD_LIMIT)).map((item, idx) => (
            <a
              key={idx}
              href={item.link || `https://www.google.com/search?q=${encodeURIComponent(item.query)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                background: '#fafafc',
                border: '1px solid var(--border-color)',
                color: 'var(--text-color)',
                padding: '8px 14px',
                borderRadius: 9999,
                fontSize: '0.84rem',
                fontWeight: 500,
                textDecoration: 'none',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--accent-color)';
                e.currentTarget.style.background = 'var(--accent-light)';
                e.currentTarget.style.color = 'var(--accent-color)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--border-color)';
                e.currentTarget.style.background = '#fafafc';
                e.currentTarget.style.color = 'var(--text-color)';
              }}
            >
              <GoogleIcon name="search" size={14} color="currentColor" />
              <span>{item.query}</span>
            </a>
          ))}
        </div>
      )}

      {currentTab === 'questions' && (
        <div className="divided" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {(isExpanded ? peopleAlsoAsk : peopleAlsoAsk.slice(0, QUESTION_LIMIT)).map((q, idx) => (
            <div key={idx} style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              <span className="num-badge">Q</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: '0.94rem', lineHeight: 1.4, color: 'var(--text-color)' }}>{q.question}</div>
                {q.snippet && <p style={{ fontSize: '0.85rem', color: 'var(--muted-text)', marginTop: 4, lineHeight: 1.5 }}>{q.snippet}</p>}
                {q.title && q.link && (
                  <a
                    href={q.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: 'inline-block', marginTop: 6, fontSize: '0.78rem', color: 'var(--accent-color)', textDecoration: 'none' }}
                  >
                    Source: {q.title} <GoogleIcon name="arrow_forward" size={13} color="currentColor" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {total > limit && (
        <div style={{ marginTop: '20px' }}>
          <button type="button" className="link-btn" onClick={() => setIsExpanded(!isExpanded)}>
            <span>{isExpanded ? 'Show less' : `Show ${total - limit} more ${noun}`}</span>
            <GoogleIcon name={isExpanded ? 'expand_less' : 'expand_more'} size={16} color="currentColor" />
          </button>
        </div>
      )}
    </SectionCard>
  );
}
