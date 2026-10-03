'use client';

import React, { useState } from 'react';
import InputForm, { FormSubmitData } from '../components/InputForm';

export default function Home() {
  const [submittedData, setSubmittedData] = useState<FormSubmitData | null>(null);

  const handleSubmit = (data: FormSubmitData) => {
    setSubmittedData(data);
  };

  return (
    <div>
      <header className="header">
        <h1 className="title">Outranka</h1>
        <p className="subtitle">
          Compare your content against Google&apos;s top 10 results to identify intent gaps and missing topics.
        </p>
      </header>

      <InputForm onSubmit={handleSubmit} />

      {submittedData && (
        <div style={{ marginTop: '24px', padding: '16px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
          <p style={{ fontWeight: 600, color: '#0f172a' }}>Form validated successfully:</p>
          <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '4px' }}>
            Keyword: <strong>{submittedData.keyword}</strong> | Location: <strong>{submittedData.location}</strong> | Type: <strong>{submittedData.inputType}</strong>
          </p>
        </div>
      )}
    </div>
  );
}
