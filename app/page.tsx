'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import InputForm, { FormSubmitData } from '../components/InputForm';
import LoadingSteps from '../components/LoadingSteps';
import GoogleIcon from '../components/GoogleIcon';
import BrandMark from '../components/BrandMark';
import AccountControl from '../components/auth/AccountControl';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeKeyword, setActiveKeyword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasLatestReport, setHasLatestReport] = useState(false);

  useEffect(() => {
    setHasLatestReport(Boolean(
      sessionStorage.getItem('outranka_analysis') &&
      sessionStorage.getItem('outranka_competitors') &&
      sessionStorage.getItem('outranka_query')
    ));
  }, []);

  const handleSubmit = async (data: FormSubmitData) => {
    setIsLoading(true);
    setActiveKeyword(data.keyword);
    setError(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();
      if (!res.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch search results.');
      }

      // Store in sessionStorage for /results route
      sessionStorage.setItem('outranka_analysis', JSON.stringify(result.analysis));
      sessionStorage.setItem('outranka_competitors', JSON.stringify(result.competitors));
      sessionStorage.setItem(
        'outranka_query',
        JSON.stringify({
          keyword: data.keyword,
          location: data.location,
          inputType: data.inputType,
        })
      );

      // Navigate to dedicated /results page
      router.push('/results');
    } catch (err: any) {
      setError(err.message || 'Something went wrong while fetching results.');
      setIsLoading(false);
    }
  };

  return (
    <>
      <header className="results-sticky-nav home-sticky-nav">
        <div className="results-nav-inner">
          <div className="results-nav-left">
            <Link href="/" className="results-nav-brand" title="Outranka home">
              <BrandMark size={30} className="results-nav-logo-mark" />
              <span>Outranka</span>
            </Link>
            <div className="results-nav-divider" />
            <div className="results-nav-context">
              <span className="results-nav-keyword">New SEO Audit</span>
              <span className="results-nav-location">4-INTENT ANALYZER</span>
            </div>
          </div>

          <div className="results-nav-actions">
            <AccountControl />
            {hasLatestReport && (
              <Link href="/results" className="results-nav-btn results-nav-btn-secondary" title="Open latest audit results">
                <GoogleIcon name="description" size={16} color="currentColor" />
                <span>Latest Results</span>
              </Link>
            )}
            <a href="#new-audit" className="results-nav-btn results-nav-btn-primary home-start-audit">
              <GoogleIcon name="manage_search" size={16} color="currentColor" />
              <span>Start Audit</span>
            </a>
          </div>
        </div>
      </header>

      <div className="home-container">
        <header className="header">
          <div className="badge-pill">
            <GoogleIcon name="track_changes" size={13} color="currentColor" /> 4-Intent SEO Analyzer
          </div>
          <h1 className="title home-wordmark"><BrandMark size={46} /> <span>Outranka</span></h1>
          <p className="subtitle">
            Audit your content against Google&apos;s top 10 ranking pages. Uncover search intent gaps and exact missing topics.
          </p>
        </header>

        {isLoading ? (
          <div id="new-audit"><LoadingSteps keyword={activeKeyword} /></div>
        ) : (
          <div id="new-audit"><InputForm onSubmit={handleSubmit} isLoading={isLoading} /></div>
        )}

        {error && !isLoading && (
          <div className="error-banner">
            <GoogleIcon name="warning" size={18} color="var(--error-text)" />
            <div>
              <strong>Error: </strong>
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
