'use client';

import React, { useEffect, useState } from 'react';

interface LoadingStepsProps {
  keyword: string;
}

const STEPS = [
  { title: 'Fetching Top 10 Google Results', desc: 'Querying SerpAPI for regional rankings and competitor URLs...' },
  { title: 'Crawling Competitor Content & Schema', desc: 'Reading competitor body text, heading tags, and JSON-LD schema...' },
  { title: 'Auditing 4-Intent Relevance', desc: 'Benchmarking Informational, Commercial, Transactional, Navigational parity...' },
  { title: 'Comparing with Top 3 Market Leaders', desc: 'Applying top-3 relevance weighting and detecting topic gaps...' },
  { title: 'Finalizing Scoring & Gap Breakdown', desc: 'Generating priority recommendations and suggested structure...' },
];

export default function LoadingSteps({ keyword }: LoadingStepsProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="card" style={{ marginTop: '24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div className="badge-pill">
          <span>●</span> In Progress
        </div>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-color)' }}>
          Auditing &quot;{keyword}&quot;
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--muted-text)', marginTop: '4px' }}>
          Comparing your content against the live top 10 search landscape
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {STEPS.map((step, idx) => {
          const isDone = idx < currentStep;
          const isCurrent = idx === currentStep;

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '14px',
                padding: '12px 14px',
                background: isCurrent ? 'var(--accent-light)' : '#fafafc',
                border: isCurrent ? '1px solid var(--accent-color)' : '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                transition: 'all 0.3s ease',
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  flexShrink: 0,
                  marginTop: '1px',
                  background: isDone ? 'var(--accent-color)' : isCurrent ? '#ffffff' : '#e2e8f0',
                  color: isDone ? '#ffffff' : isCurrent ? 'var(--accent-color)' : 'var(--muted-text)',
                  border: isCurrent ? '2px solid var(--accent-color)' : 'none',
                }}
              >
                {isDone ? '✓' : idx + 1}
              </div>

              <div>
                <div
                  style={{
                    fontSize: '0.9rem',
                    fontWeight: isCurrent ? 700 : 600,
                    color: isCurrent ? 'var(--accent-color)' : isDone ? 'var(--text-color)' : 'var(--muted-text)',
                  }}
                >
                  {step.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--muted-text)', marginTop: '2px', lineHeight: 1.35 }}>
                  {step.desc}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
