'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import InputForm, { FormSubmitData } from '../components/InputForm';
import LoadingSteps from '../components/LoadingSteps';

export default function Home() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [activeKeyword, setActiveKeyword] = useState('');
  const [error, setError] = useState<string | null>(null);

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
      <header className="header">
        <div className="badge-pill">
          <span>●</span> 4-Intent SEO Analyzer
        </div>
        <h1 className="title">Outranka</h1>
        <p className="subtitle">
          Audit your content against Google&apos;s top 10 ranking pages. Uncover search intent gaps and exact missing topics.
        </p>
      </header>

      {isLoading ? (
        <LoadingSteps keyword={activeKeyword} />
      ) : (
        <InputForm onSubmit={handleSubmit} isLoading={isLoading} />
      )}

      {error && !isLoading && (
        <div className="error-banner">
          <span style={{ fontSize: '1.1rem' }}>⚠️</span>
          <div>
            <strong>Error: </strong>
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}
