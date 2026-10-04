'use client';

import React, { useState } from 'react';
import { RelatedSearchItem, PeopleAlsoAskItem } from '../lib/serp';

interface RelatedKeywordsCardProps {
  relatedSearches?: RelatedSearchItem[];
  peopleAlsoAsk?: PeopleAlsoAskItem[];
}

export default function RelatedKeywordsCard({
  relatedSearches = [],
  peopleAlsoAsk = [],
}: RelatedKeywordsCardProps) {
  const [activeTab, setActiveTab] = useState<'keywords' | 'questions'>('keywords');
  const [isExpanded, setIsExpanded] = useState(false);

  const hasKeywords = relatedSearches.length > 0;
  const hasQuestions = peopleAlsoAsk.length > 0;

  if (!hasKeywords && !hasQuestions) {
    return null;
  }

  // Choose default tab if one is empty
  const currentTab = !hasKeywords && hasQuestions ? 'questions' : !hasQuestions && hasKeywords ? 'keywords' : activeTab;

  const currentItemsCount = currentTab === 'keywords' ? relatedSearches.length : peopleAlsoAsk.length;
  const displayedKeywords = isExpanded ? relatedSearches : relatedSearches.slice(0, 4);
  const displayedQuestions = isExpanded ? peopleAlsoAsk : peopleAlsoAsk.slice(0, 3);

  return (
    <div className="card">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
          flexWrap: 'wrap',
          gap: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.2rem', color: 'var(--accent-color)' }}>🔍</span>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-color)', letterSpacing: '-0.01em' }}>
            Google Related Searches &amp; Questions
          </h3>
        </div>

        {hasKeywords && hasQuestions && (
          <div
            style={{
              display: 'flex',
              background: 'var(--segmented-bg)',
              borderRadius: '8px',
              padding: '2px',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setActiveTab('keywords');
                setIsExpanded(false);
              }}
              style={{
                border: 'none',
                background: currentTab === 'keywords' ? '#ffffff' : 'transparent',
                color: currentTab === 'keywords' ? 'var(--text-color)' : 'var(--muted-text)',
                fontWeight: currentTab === 'keywords' ? 600 : 500,
                fontSize: '0.78rem',
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: currentTab === 'keywords' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              Related Searches ({relatedSearches.length})
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('questions');
                setIsExpanded(false);
              }}
              style={{
                border: 'none',
                background: currentTab === 'questions' ? '#ffffff' : 'transparent',
                color: currentTab === 'questions' ? 'var(--text-color)' : 'var(--muted-text)',
                fontWeight: currentTab === 'questions' ? 600 : 500,
                fontSize: '0.78rem',
                padding: '4px 10px',
                borderRadius: '6px',
                cursor: 'pointer',
                boxShadow: currentTab === 'questions' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              People Also Ask ({peopleAlsoAsk.length})
            </button>
          </div>
        )}
      </div>

      <p style={{ fontSize: '0.84rem', color: 'var(--muted-text)', lineHeight: 1.45, marginBottom: '14px' }}>
        {currentTab === 'keywords'
          ? 'Related query variations Google suggests users search next. Incorporate these semantic terms naturally into your draft.'
          : 'High-intent questions searchers commonly expand on Google. Answering these directly in your H2/H3 subheadings can help you capture featured snippets.'}
      </p>

      {/* Tab 1: Related Keywords / Searches */}
      {currentTab === 'keywords' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {displayedKeywords.map((item, idx) => (
              <a
                key={idx}
                href={item.link || `https://www.google.com/search?q=${encodeURIComponent(item.query)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#fafafc',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-color)',
                  padding: '7px 12px',
                  borderRadius: '9999px',
                  fontSize: '0.82rem',
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
                <span>🔍</span>
                <span>{item.query}</span>
              </a>
            ))}
          </div>

          {relatedSearches.length > 4 && (
            <div style={{ textAlign: 'center', marginTop: '8px' }}>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'transparent',
                  color: 'var(--accent-color)',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '4px 8px',
                }}
              >
                {isExpanded ? (
                  <>Show Less ▲</>
                ) : (
                  <>See More ({relatedSearches.length - 4} more keywords) ▼</>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: People Also Ask (Questions) */}
      {currentTab === 'questions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {displayedQuestions.map((q, idx) => (
            <div
              key={idx}
              style={{
                background: '#fafafc',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                padding: '10px 12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                <span
                  style={{
                    background: 'var(--accent-light)',
                    color: 'var(--accent-color)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    flexShrink: 0,
                    marginTop: '1px',
                  }}
                >
                  Q
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.86rem', color: 'var(--text-color)', lineHeight: 1.35 }}>
                    {q.question}
                  </div>
                  {q.snippet && (
                    <p style={{ fontSize: '0.78rem', color: 'var(--muted-text)', marginTop: '4px', lineHeight: 1.4 }}>
                      {q.snippet}
                    </p>
                  )}
                  {q.title && q.link && (
                    <div style={{ marginTop: '4px' }}>
                      <a
                        href={q.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          fontSize: '0.72rem',
                          color: 'var(--accent-color)',
                          textDecoration: 'none',
                        }}
                      >
                        Source: {q.title} →
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {peopleAlsoAsk.length > 3 && (
            <div style={{ textAlign: 'center', marginTop: '6px' }}>
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: 'transparent',
                  color: 'var(--accent-color)',
                  border: 'none',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '4px 8px',
                }}
              >
                {isExpanded ? (
                  <>Show Less ▲</>
                ) : (
                  <>See More ({peopleAlsoAsk.length - 3} more questions) ▼</>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
