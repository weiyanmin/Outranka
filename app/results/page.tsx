'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ResultView from '../../components/ResultView';
import CompetitorList from '../../components/CompetitorList';
import { AnalysisResult } from '../../lib/analyze';
import { SerpResultItem } from '../../lib/serp';
import { downloadAnalysisMarkdown, downloadAnalysisPdf } from '../../lib/downloadReport';

export default function ResultsPage() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [competitors, setCompetitors] = useState<SerpResultItem[]>([]);
  const [query, setQuery] = useState<{ keyword: string; location: string; inputType: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDownloadOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsDownloadOpen(false);
      }
    }

    if (isDownloadOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDownloadOpen]);

  const handleDownloadMarkdown = () => {
    if (!analysis || !query) return;
    setIsDownloadOpen(false);
    downloadAnalysisMarkdown(query, analysis, competitors);
  };

  const handleDownloadPdf = () => {
    if (!analysis || !query) return;
    setIsDownloadOpen(false);
    downloadAnalysisPdf(query, analysis, competitors);
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
    <div className="results-container">
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
            padding: '7px 14px',
            background: 'var(--card-bg)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-md)',
            transition: 'all 0.15s ease',
          }}
        >
          ← New Audit
        </Link>

        {/* Download Report Dropdown */}
        <div ref={dropdownRef} style={{ position: 'relative', display: 'inline-block' }}>
          <button
            onClick={() => setIsDownloadOpen((prev) => !prev)}
            aria-expanded={isDownloadOpen}
            aria-haspopup="true"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: isDownloadOpen ? 'var(--accent-light)' : '#ffffff',
              color: 'var(--accent-color)',
              border: '1px solid var(--accent-color)',
              borderRadius: 'var(--radius-md)',
              padding: '7px 16px',
              fontSize: '0.88rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              boxShadow: isDownloadOpen ? '0 0 0 3px rgba(40, 167, 156, 0.15)' : 'none',
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>Download report</span>
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{
                transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: isDownloadOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isDownloadOpen && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                right: 0,
                background: '#ffffff',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.04)',
                padding: '6px',
                minWidth: '220px',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                animation: 'fadeInMenu 0.15s ease-out',
              }}
            >
              <button
                onClick={handleDownloadMarkdown}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '9px 12px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-color)',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  textAlign: 'left',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'background 0.12s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-color)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px',
                    borderRadius: '5px',
                    background: 'var(--accent-light)',
                    color: 'var(--accent-color)',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  MD
                </span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 600 }}>Download as Markdown</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted-text)' }}>.md text file</span>
                </div>
              </button>

              <button
                onClick={handleDownloadPdf}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  width: '100%',
                  padding: '9px 12px',
                  border: 'none',
                  background: 'transparent',
                  color: 'var(--text-color)',
                  fontSize: '0.85rem',
                  fontWeight: 500,
                  textAlign: 'left',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  transition: 'background 0.12s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-color)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '24px',
                    height: '24px',
                    borderRadius: '5px',
                    background: '#fee2e2',
                    color: '#dc2626',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  PDF
                </span>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: 600 }}>Download as PDF</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted-text)' }}>Formatted print & save</span>
                </div>
              </button>
            </div>
          )}
        </div>
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
