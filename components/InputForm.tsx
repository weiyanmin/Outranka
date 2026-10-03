'use client';

import React, { useState } from 'react';
import { COUNTRIES } from '../lib/countries';

export interface FormSubmitData {
  keyword: string;
  location: string;
  inputType: 'text' | 'url';
  content?: string;
  url?: string;
}

interface InputFormProps {
  onSubmit: (data: FormSubmitData) => void;
  isLoading?: boolean;
}

export default function InputForm({ onSubmit, isLoading }: InputFormProps) {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('global');
  const [inputType, setInputType] = useState<'text' | 'url'>('text');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedKeyword = keyword.trim();
    if (!trimmedKeyword) {
      setError('Please enter a target keyword to rank for.');
      return;
    }

    if (inputType === 'text') {
      const trimmedContent = content.trim();
      if (!trimmedContent) {
        setError('Please paste your draft content to analyze.');
        return;
      }
      onSubmit({
        keyword: trimmedKeyword,
        location,
        inputType: 'text',
        content: trimmedContent,
      });
    } else {
      const trimmedUrl = url.trim();
      if (!trimmedUrl) {
        setError('Please enter a target URL to analyze.');
        return;
      }
      try {
        new URL(trimmedUrl);
      } catch {
        setError('Please enter a valid URL (including https://).');
        return;
      }
      onSubmit({
        keyword: trimmedKeyword,
        location,
        inputType: 'url',
        url: trimmedUrl,
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <div className="form-group">
        <label htmlFor="keyword" className="form-label">
          <span>Target Keyword</span>
          <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--muted-text)' }}>Required</span>
        </label>
        <input
          id="keyword"
          type="text"
          className="form-input"
          placeholder="e.g. best dirty coffee in Phuket"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          disabled={isLoading}
          autoComplete="off"
        />
        <p className="form-help">The primary search term you want your content to rank for.</p>
      </div>

      <div className="form-group">
        <label htmlFor="location" className="form-label">
          <span>Search Region</span>
        </label>
        <select
          id="location"
          className="form-select"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          disabled={isLoading}
        >
          {COUNTRIES.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
        <p className="form-help">Google search results vary by location. Select your target market.</p>
      </div>

      <div className="form-group">
        <label className="form-label">
          <span>Your Content Source</span>
        </label>
        
        {/* iOS Segmented Control */}
        <div className="segmented-control" role="tablist">
          <button
            type="button"
            className={"segment-btn " + (inputType === 'text' ? 'active' : '')}
            onClick={() => setInputType('text')}
            disabled={isLoading}
            role="tab"
            aria-selected={inputType === 'text'}
          >
            Paste Draft
          </button>
          <button
            type="button"
            className={"segment-btn " + (inputType === 'url' ? 'active' : '')}
            onClick={() => setInputType('url')}
            disabled={isLoading}
            role="tab"
            aria-selected={inputType === 'url'}
          >
            Web Page URL
          </button>
        </div>

        {inputType === 'text' ? (
          <div>
            <textarea
              className="form-textarea"
              rows={7}
              placeholder="Paste your blog post, article, or draft content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isLoading}
            />
          </div>
        ) : (
          <div>
            <input
              type="url"
              className="form-input"
              placeholder="https://example.com/best-dirty-coffee-phuket"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              autoComplete="off"
            />
          </div>
        )}
      </div>

      {error && (
        <div className="error-banner">
          <span style={{ fontSize: '1rem' }}>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      <button type="submit" className="submit-button" disabled={isLoading}>
        {isLoading ? (
          <>
            <svg style={{ animation: 'spin 1s linear infinite', width: '18px', height: '18px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
              <path d="M12 2a10 10 0 0 1 10 10" />
            </svg>
            Analyzing Competitors...
          </>
        ) : (
          <>
            Analyze Against Top 10 Results
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </>
        )}
      </button>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </form>
  );
}
