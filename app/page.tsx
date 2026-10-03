'use client';

import React, { useState } from 'react';
import InputForm, { FormSubmitData } from '../components/InputForm';
import CompetitorList from '../components/CompetitorList';
import ResultView from '../components/ResultView';
import { SerpResultItem } from '../lib/serp';
import { AnalysisResult } from '../lib/analyze';

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [competitors, setCompetitors] = useState<SerpResultItem[] | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);

  const handleSubmit = async (data: FormSubmitData) => {
    setIsLoading(true);
    setError(null);
    setCompetitors(null);
    setAnalysis(null);

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
      setAnalysis(result.analysis);
    } catch (err: any) {
      setError(err.message || 'Something went wrong while fetching results.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <header className="header">
        <div className="badge-pill">
          <span>●</span> 4-Intent SEO Analyzer
        </div>
        <h1 className="title">Outranka</h1>
        <p className="subtitle">
          Audit your content against Google&apos;s top 10 ranking pages. Uncover search intent gaps and exact missing topics.
        </p>
      </header>

      <InputForm onSubmit={handleSubmit} isLoading={isLoading} />

      {error && (
        <div className="error-banner">
          <span style={{ fontSize: '1.1rem' }}>⚠️</span>
          <div>
            <strong>Error: </strong>
            <span>{error}</span>
          </div>
        </div>
      )}

      {analysis && <ResultView analysis={analysis} />}

      {competitors && (
        <CompetitorList
          competitors={competitors}
          competitorIntents={analysis?.competitorIntents}
        />
      )}
    </div>
  );
}
