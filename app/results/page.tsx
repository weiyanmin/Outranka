'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ResultView from '../../components/ResultView';
import GoogleIcon from '../../components/GoogleIcon';
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
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
          <GoogleIcon name="bar_chart" size={44} color="var(--accent-color)" />
        </div>
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
          <GoogleIcon name="arrow_back" size={16} color="#ffffff" />
          <span>Start New Audit</span>
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Sticky Navigation Bar */}
      <header className="results-sticky-nav">
        <div className="results-nav-inner">
          <div className="results-nav-left">
            <Link href="/" className="results-nav-brand" title="Outranka - Back to Home">
              <span className="results-nav-logo-mark">
                <GoogleIcon name="auto_awesome" size={17} color="#ffffff" />
              </span>
              <span>Outranka</span>
            </Link>

            <div className="results-nav-divider" />

            <div className="results-nav-context">
              <span className="results-nav-keyword" title={query.keyword}>
                &ldquo;{query.keyword}&rdquo;
              </span>
              <span className="results-nav-location">
                {query.location.toUpperCase()}
              </span>
            </div>
          </div>

          <div className="results-nav-actions">
            <Link href="/" className="results-nav-btn results-nav-btn-secondary" title="Start a new search intent audit">
              <GoogleIcon name="arrow_back" size={15} color="currentColor" />
              <span>New Audit</span>
            </Link>

            <div ref={dropdownRef} className="results-nav-dropdown-wrapper">
              <button
                onClick={() => setIsDownloadOpen((prev) => !prev)}
                className={`results-nav-btn results-nav-btn-primary ${isDownloadOpen ? 'active' : ''}`}
                aria-expanded={isDownloadOpen}
                aria-haspopup="true"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                <span>Download Report</span>
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
                <div className="results-nav-dropdown-menu">
                  <button
                    onClick={handleDownloadMarkdown}
                    className="results-nav-dropdown-item"
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
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
                      <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>Download as Markdown</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted-text)' }}>.md text file</span>
                    </div>
                  </button>

                  <button
                    onClick={handleDownloadPdf}
                    className="results-nav-dropdown-item"
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '26px',
                        height: '26px',
                        borderRadius: '6px',
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
                      <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>Download as PDF</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted-text)' }}>Formatted print & save</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="results-container">
        {/* Audit Meta Header */}
        <div style={{ marginBottom: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
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
                border: '1px solid rgba(40, 167, 156, 0.25)',
              }}
            >
              {query.location.toUpperCase()}
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--muted-text)', marginTop: '4px' }}>
            Audit completed against top 10 competitors ranking in Google
          </p>
        </div>

      {/* Tabbed dashboard (competitors live in their own tab) */}
      <ResultView analysis={analysis} competitors={competitors} />
    </div>
  </>
);
}
