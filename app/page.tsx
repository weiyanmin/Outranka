'use client';

import React, { useState } from 'react';
import InputForm, { FormSubmitData } from '../components/InputForm';
import CompetitorList from '../components/CompetitorList';
import { SerpResultItem } from '../lib/serp';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [competitors, setCompetitors] = useState<SerpResultItem[] | null>(null);

  const handleSubmit = async (data: FormSubmitData) => {
    setIsLoading(true);
    setError(null);
    setCompetitors(null);

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

      setCompetitors(result.competitors);
    } catch (err: any) {
      setError(err.message || 'Something went wrong while fetching results.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <header className="header">
        <h1 className="title">Outranka</h1>
        <p className="subtitle">
          Compare your content against Google&apos;s top 10 results to identify intent gaps and missing topics.
        </p>
      </header>

      <InputForm onSubmit={handleSubmit} isLoading={isLoading} />

      {error && (
        <div className="error-banner" style={{ marginTop: '24px' }}>
          <strong>Error: </strong>{error}
        </div>
      )}

      {competitors && <CompetitorList competitors={competitors} />}
    </div>
  );
}
