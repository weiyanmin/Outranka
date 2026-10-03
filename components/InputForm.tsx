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
    <form onSubmit={handleSubmit} className="form-container">
      <div className="form-group">
        <label htmlFor="keyword" className="form-label">
          Target Keyword
        </label>
        <input
          id="keyword"
          type="text"
          className="form-input"
          placeholder="e.g. best dirty coffee in Phuket"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          disabled={isLoading}
        />
        <p className="form-help">The search query your content aims to rank for on Google.</p>
      </div>

      <div className="form-group">
        <label htmlFor="location" className="form-label">
          Searcher Location
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
        <p className="form-help">Google rankings vary by country. Choose your audience's region.</p>
      </div>

      <div className="form-group">
        <label className="form-label">Content Source (Choose One)</label>
        <div className="toggle-group">
          <button
            type="button"
            className={"toggle-button " + (inputType === 'text' ? 'active' : '')}
            onClick={() => setInputType('text')}
            disabled={isLoading}
          >
            Paste Draft Content
          </button>
          <button
            type="button"
            className={"toggle-button " + (inputType === 'url' ? 'active' : '')}
            onClick={() => setInputType('url')}
            disabled={isLoading}
          >
            Target Web Page URL
          </button>
        </div>

        {inputType === 'text' ? (
          <div className="input-subgroup">
            <textarea
              className="form-textarea"
              rows={8}
              placeholder="Paste your blog post, article, or draft content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              disabled={isLoading}
            />
          </div>
        ) : (
          <div className="input-subgroup">
            <input
              type="url"
              className="form-input"
              placeholder="https://example.com/best-dirty-coffee-phuket"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
            />
          </div>
        )}
      </div>

      {error && <div className="error-banner">{error}</div>}

      <button type="submit" className="submit-button" disabled={isLoading}>
        {isLoading ? 'Analyzing...' : 'Analyze Against Top 10 Results'}
      </button>
    </form>
  );
}
