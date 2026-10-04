'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import ResultView from '../../components/ResultView';
import GoogleIcon from '../../components/GoogleIcon';
import BrandMark from '../../components/BrandMark';
import AccountControl from '../../components/auth/AccountControl';
import { AnalysisResult } from '../../lib/analyze';
import { SerpResultItem } from '../../lib/serp';
import { downloadAnalysisMarkdown, downloadAnalysisPdf } from '../../lib/downloadReport';
import { findSiteRankings } from '../../lib/rankingMatch';

export default function ResultsPage() {
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [competitors, setCompetitors] = useState<SerpResultItem[]>([]);
  const [query, setQuery] = useState<{
    keyword: string;
    location: string;
    inputType: string;
    sourceUrl?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [isPdfGenerating, setIsPdfGenerating] = useState(false);
  const [pdfDownloadError, setPdfDownloadError] = useState('');
  const [persistenceWarning, setPersistenceWarning] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const storedAnalysis = sessionStorage.getItem('outranka_analysis');
      const storedCompetitors = sessionStorage.getItem('outranka_competitors');
      const storedQuery = sessionStorage.getItem('outranka_query');
      const storedSaveWarning = sessionStorage.getItem('outranka_audit_save_warning');

      if (storedAnalysis) {
        setAnalysis(JSON.parse(storedAnalysis));
      }
      if (storedCompetitors) {
        setCompetitors(JSON.parse(storedCompetitors));
      }
      if (storedQuery) {
        setQuery(JSON.parse(storedQuery));
      }
      if (storedSaveWarning) setPersistenceWarning(storedSaveWarning);
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

  const handleDownloadPdf = async () => {
    if (!analysis || !query || isPdfGenerating) return;
    setIsDownloadOpen(false);
    setPdfDownloadError('');
    setIsPdfGenerating(true);
    try {
      await downloadAnalysisPdf(query, analysis, competitors);
    } catch (error) {
      console.error('Failed to generate the PDF report.', error);
      setPdfDownloadError('Could not generate the PDF. Please try again.');
    } finally {
      setIsPdfGenerating(false);
    }
  };

  let sourcePageUrl = '';
  if (query?.sourceUrl) {
    try {
      const parsedUrl = new URL(query.sourceUrl);
      if (parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:') {
        sourcePageUrl = parsedUrl.href;
      }
    } catch {
      // Ignore malformed URLs from stale or manually edited session data.
    }
  }
  const isUrlAudit = query?.inputType === 'url' && Boolean(sourcePageUrl);
  const siteRankings = isUrlAudit && sourcePageUrl
    ? findSiteRankings(sourcePageUrl, competitors)
    : null;
  const hasDomainRanking = Boolean(
    siteRankings && (siteRankings.exactPosition !== null || siteRankings.otherPages.length > 0)
  );

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
          <GoogleIcon name="fact_check" size={16} color="#ffffff" />
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
              <BrandMark size={30} className="results-nav-logo-mark" />
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
            <AccountControl />
            <Link href="/audits" className="results-nav-btn results-nav-btn-secondary" title="Browse past audits">
              <GoogleIcon name="description" size={15} color="currentColor" />
              <span>Past Audits</span>
            </Link>
            <Link href="/" className="results-nav-btn results-nav-btn-secondary" title="Start a new search intent audit">
              <GoogleIcon name="fact_check" size={15} color="currentColor" />
              <span>New Audit</span>
            </Link>

            <div ref={dropdownRef} className="results-nav-dropdown-wrapper">
              <button
                onClick={() => setIsDownloadOpen((prev) => !prev)}
                className={`results-nav-btn results-nav-btn-primary ${isDownloadOpen ? 'active' : ''}`}
                disabled={isPdfGenerating}
                aria-expanded={isDownloadOpen}
                aria-haspopup="true"
                aria-busy={isPdfGenerating}
              >
                <GoogleIcon name={isPdfGenerating ? 'progress_activity' : 'download'} size={15} color="currentColor" className={isPdfGenerating ? 'icon-spin' : ''} />
                <span>{isPdfGenerating ? 'Preparing PDF…' : 'Download Report'}</span>
                <GoogleIcon
                  name="expand_more"
                  size={13}
                  color="currentColor"
                  style={{
                    transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                    transform: isDownloadOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
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
                      <GoogleIcon name="description" size={15} color="currentColor" />
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
                      <GoogleIcon name="picture_as_pdf" size={15} color="currentColor" />
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-color)' }}>Download as PDF</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--muted-text)' }}>Downloads automatically</span>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="results-container">
        {persistenceWarning && <p className="audit-persist-warning" role="status">{persistenceWarning}</p>}
        {pdfDownloadError && <p className="audit-persist-warning" role="alert">{pdfDownloadError}</p>}
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
          {sourcePageUrl && (
            <a
              className="results-source-url"
              href={sourcePageUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={sourcePageUrl}
              aria-label={`Open audited source page: ${sourcePageUrl}`}
            >
              <GoogleIcon name="language" size={14} color="currentColor" />
              <span>{sourcePageUrl}</span>
              <GoogleIcon name="open_in_new" size={12} color="currentColor" />
            </a>
          )}
          {isUrlAudit && (
            <p
              role="status"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                width: 'fit-content',
                margin: '10px 0 0',
                padding: '7px 11px',
                borderRadius: '9px',
                background: hasDomainRanking ? 'var(--accent-light)' : 'var(--segmented-bg)',
                color: hasDomainRanking ? 'var(--accent-strong)' : 'var(--muted-text)',
                fontSize: '0.82rem',
                fontWeight: 600,
              }}
            >
              <GoogleIcon name={hasDomainRanking ? 'check_circle' : 'fact_check'} size={15} color="currentColor" />
              <span>
                {siteRankings?.exactPosition !== null
                  ? `Your exact page ranks #${siteRankings.exactPosition} in the top 10.`
                  : siteRankings?.otherPages.length
                    ? `Your exact URL was not found, but ${siteRankings.otherPages.length} other page${siteRankings.otherPages.length === 1 ? '' : 's'} from this domain rank in the top 10.`
                    : 'No page from this domain was detected in this audit’s top 10 organic results.'}
                {siteRankings?.otherPages.map((page) => (
                  <span key={`${page.position}-${page.link}`} style={{ display: 'block', marginTop: '5px', fontWeight: 500 }}>
                    #{page.position} · <a href={page.link} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>{page.title || page.link}</a>
                  </span>
                ))}
              </span>
            </p>
          )}
        </div>

      {/* Tabbed dashboard (competitors live in their own tab) */}
      <ResultView analysis={analysis} competitors={competitors} />
    </div>
  </>
);
}
