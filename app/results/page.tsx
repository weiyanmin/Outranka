'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import ResultView from '../../components/ResultView';
import CompetitorList from '../../components/CompetitorList';
import { AnalysisResult } from '../../lib/analyze';
import { SerpResultItem } from '../../lib/serp';
import { downloadAnalysisMarkdown } from '../../lib/downloadReport';

export default function ResultsPage() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [competitors, setCompetitors] = useState<SerpResultItem[]>([]);
  const [query, setQuery] = useState<{ keyword: string; location: string; inputType: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedAnalysis = sessionStorage.getItem('outranka_analysis');
      const storedCompetitors = sessionStorage.getItem('outranka_competitors');
      const storedQuery = sessionStorage.getItem('outranka_query');

      if (storedAnalysis) {
        setAnalysis(JSON.parse(storedAnalysis));
      }
      if (storedCompetitors) {
        setCompetitors(JSON.parse(storedCompetitors));
      }
      if (storedQuery) {
        setQuery(JSON.parse(storedQuery));
      }
    } catch (e) {
      console.error('Failed to load analysis from session storage:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleDownload = () => {
    if (!analysis || !query) return;
    downloadAnalysisMarkdown(query, analysis, competitors);
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0' }}>
        <p style={{ color: 'var(--muted-text)', fontSize: '0.95rem' }}>Loading audit results...</p>
      </div>
    );
  }

  if (!analysis || !query) {
    return (
      <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <span style={{ fontSize: '2.5rem', display: 'block', marginBottom: '12px' }}>📊</span>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-color)', marginBottom: '8px' }}>
          No Active Audit Found
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--muted-text)', maxWidth: '400px', margin: '0 auto 24px auto' }}>
          To view a search intent analysis, enter a target keyword and your content on the home page.
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'var(--accent-color)',
            color: '#ffffff',
            padding: '12px 22px',
            borderRadius: 'var(--radius-md)',
            fontWeight: 600,
            textDecoration: 'none',
            fontSize: '0.95rem',
          }}
        >
          ← Start New Audit
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Top Navigation & Action Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <Link
          href="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: 'var(--muted-text)',
            textDecoration: 'none',
            fontSize: '0.88rem',
            fontWeight: 600,
            padding: '6px 12px',
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-sm)',
          }}
        >
          ← New Audit
        </Link>

        <button
          onClick={handleDownload}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: '#ffffff',
            color: 'var(--accent-color)',
            border: '1px solid var(--accent-color)',
            borderRadius: 'var(--radius-sm)',
            padding: '6px 14px',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
            <polyline points="7 10 12 15 17 10"></polyline>
            <line x1="12" y1="15" x2="12" y2="3"></line>
          </svg>
          Download Report (.md)
        </button>
      </div>

      {/* Audit Meta Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--text-color)', letterSpacing: '-0.02em' }}>
            &quot;{query.keyword}&quot;
          </h1>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              background: 'var(--accent-light)',
              color: 'var(--accent-color)',
              padding: '3px 9px',
              borderRadius: '9999px',
            }}
          >
            {query.location.toUpperCase()}
          </span>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--muted-text)', marginTop: '4px' }}>
          Audit completed against top 10 competitors ranking in Google
        </p>
      </div>

      {/* Main Analysis Display */}
      <ResultView analysis={analysis} />

      {/* Competitors Showcase */}
      {competitors.length > 0 && (
        <CompetitorList
          competitors={competitors}
          competitorIntents={analysis.competitorIntents}
        />
      )}
    </div>
  );
}
