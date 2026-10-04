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
    <div className="home-container">
      <div className="home-topbar">
        <nav className="home-primary-nav" aria-label="Main navigation">
          <a className="home-nav-link home-nav-link-active" href="#new-audit" aria-current="page">
            <GoogleIcon name="manage_search" size={17} color="currentColor" />
            <span>New audit</span>
          </a>
          {hasLatestReport && (
            <Link className="home-nav-link" href="/results">
              <GoogleIcon name="description" size={17} color="currentColor" />
              <span>Latest results</span>
            </Link>
          )}
        </nav>
        <AccountControl />
      </div>
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
  );
}
