'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import InputForm, { FormSubmitData } from '../components/InputForm';
import LoadingSteps from '../components/LoadingSteps';
import GoogleIcon from '../components/GoogleIcon';
import BrandMark from '../components/BrandMark';
import AccountControl from '../components/auth/AccountControl';
import type { AnalysisProgressStep } from '../lib/analysisProgress';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeKeyword, setActiveKeyword] = useState('');
  const [progressStep, setProgressStep] = useState<AnalysisProgressStep>('source');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: FormSubmitData) => {
    setIsLoading(true);
    setActiveKeyword(data.keyword);
    setProgressStep('source');
    setError(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.body) throw new Error('Could not read analysis progress. Please try again.');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let result: any = null;

      const handleEvent = (line: string) => {
        if (!line.trim()) return;
        const event = JSON.parse(line);
        if (event.type === 'progress' && typeof event.step === 'string') {
          setProgressStep(event.step as AnalysisProgressStep);
        } else if (event.type === 'result') {
          result = event.payload;
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        buffer += decoder.decode(value, { stream: !done });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';
        lines.forEach(handleEvent);
        if (done) break;
      }
      if (buffer.trim()) handleEvent(buffer);

      if (!result?.success) {
        throw new Error(result?.error || 'Failed to fetch search results.');
      }

      // Store in sessionStorage for /results route
      sessionStorage.setItem('outranka_analysis', JSON.stringify(result.analysis));
      sessionStorage.setItem('outranka_competitors', JSON.stringify(result.competitors));
      if (result.auditId) sessionStorage.setItem('outranka_audit_id', result.auditId);
      else sessionStorage.removeItem('outranka_audit_id');
      if (result.persistenceWarning) {
        sessionStorage.setItem('outranka_audit_save_warning', result.persistenceWarning);
      } else {
        sessionStorage.removeItem('outranka_audit_save_warning');
      }
      sessionStorage.setItem(
        'outranka_query',
        JSON.stringify({
          keyword: data.keyword,
          location: data.location,
          inputType: data.inputType,
          sourceUrl: data.inputType === 'url' ? data.url : undefined,
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
            <Link href="/audits" className="results-nav-btn results-nav-btn-secondary" title="Browse past audits">
              <GoogleIcon name="description" size={16} color="currentColor" />
              <span>Past Audits</span>
            </Link>
            <a href="#new-audit" className="results-nav-btn results-nav-btn-primary home-start-audit">
              <GoogleIcon name="fact_check" size={16} color="currentColor" />
              <span>Start Audit</span>
            </a>
          </div>
        </div>
      </header>

      <div className="home-container">
        <header className="header">
          <div className="badge-pill">
            <GoogleIcon name="fact_check" size={13} color="currentColor" /> 4-Intent SEO Analyzer
          </div>
          <h1 className="title home-wordmark"><BrandMark size={46} /> <span>Outranka</span></h1>
          <p className="subtitle">
            Audit your content against Google&apos;s top 10 ranking pages. Uncover search intent gaps and exact missing topics.
          </p>
        </header>

        {isLoading ? (
          <div id="new-audit"><LoadingSteps keyword={activeKeyword} currentStep={progressStep} /></div>
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
