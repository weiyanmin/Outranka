'use client';

import React, { useState } from 'react';
import { COUNTRIES } from '../lib/countries';
import GoogleIcon from './GoogleIcon';

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

export function validateUrlInput(rawVal: string): { isValid: boolean; warning: string | null; formattedUrl?: string } {
  const trimmed = rawVal.trim();
  if (!trimmed) {
    return { isValid: false, warning: 'Please enter a target URL to analyze.' };
  }

  // Detect email address pattern (e.g. weiyanmin@gmail.com)
  if (trimmed.includes('@') && !trimmed.includes('://')) {
    return {
      isValid: false,
      warning: 'Only URLs are allowed. Please do not enter an email address (e.g. https://example.com/article).'
    };
  }

  // Spaces are not allowed in URLs
  if (/\s/.test(trimmed)) {
    return {
      isValid: false,
      warning: 'Only URLs are allowed. Web page URLs cannot contain spaces.'
    };
  }

  let candidate = trimmed;
  // If user entered ftp://, mailto:, etc.
  if (/^[a-zA-Z0-9_-]+:/.test(candidate) && !candidate.startsWith('http://') && !candidate.startsWith('https://')) {
    return {
      isValid: false,
      warning: 'Only web URLs (http:// or https://) are allowed.'
    };
  }

  if (!candidate.startsWith('http://') && !candidate.startsWith('https://')) {
    // If it looks like a domain name with a dot (e.g. example.com or news.domain.co/post)
    if (/^[a-zA-Z0-9-]+\.[a-zA-Z0-9]/.test(candidate)) {
      candidate = 'https://' + candidate;
    } else {
      return {
        isValid: false,
        warning: 'Only URLs are allowed (e.g. https://example.com/article).'
      };
    }
  }

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return {
        isValid: false,
        warning: 'Only web URLs (http:// or https://) are allowed.'
      };
    }
    if (!parsed.hostname || !parsed.hostname.includes('.') || parsed.hostname.endsWith('.')) {
      return {
        isValid: false,
        warning: 'Only URLs are allowed (e.g. https://example.com/article).'
      };
    }
    return { isValid: true, warning: null, formattedUrl: candidate };
  } catch {
    return {
      isValid: false,
      warning: 'Only URLs are allowed (e.g. https://example.com/article).'
    };
  }
}

export default function InputForm({ onSubmit, isLoading }: InputFormProps) {
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('global');
  const [inputType, setInputType] = useState<'text' | 'url'>('text');
  const [content, setContent] = useState('');
  const [url, setUrl] = useState('');
  const [urlWarning, setUrlWarning] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleUrlChange = (value: string) => {
    setUrl(value);
    const trimmed = value.trim();
    if (!trimmed) {
      setUrlWarning(null);
      return;
    }
    // Instant feedback if user is typing an email address or whitespace
    if (trimmed.includes('@')) {
      setUrlWarning('Only URLs are allowed. Please do not enter an email address (e.g. https://example.com/article).');
    } else if (/\s/.test(trimmed)) {
      setUrlWarning('Only URLs are allowed. Web page URLs cannot contain spaces.');
    } else {
      // If there was a previous warning, check if it is now valid so we clear it
      const check = validateUrlInput(trimmed);
      if (check.isValid) {
        setUrlWarning(null);
      }
    }
  };

  const handleUrlBlur = () => {
    const trimmed = url.trim();
    if (!trimmed) {
      setUrlWarning(null);
      return;
    }
    const check = validateUrlInput(trimmed);
    if (!check.isValid) {
      setUrlWarning(check.warning);
    } else {
      setUrlWarning(null);
    }
  };

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
        setUrlWarning('Please enter a target URL to analyze.');
        setError('Please enter a target URL to analyze.');
        return;
      }
      const check = validateUrlInput(trimmedUrl);
      if (!check.isValid) {
        setUrlWarning(check.warning);
        setError(check.warning);
        return;
      }
      setUrlWarning(null);
      onSubmit({
        keyword: trimmedKeyword,
        location,
        inputType: 'url',
        url: check.formattedUrl || trimmedUrl,
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
            onClick={() => { setInputType('text'); setError(null); }}
            disabled={isLoading}
            role="tab"
            aria-selected={inputType === 'text'}
          >
            Paste Draft
          </button>
          <button
            type="button"
            className={"segment-btn " + (inputType === 'url' ? 'active' : '')}
            onClick={() => { setInputType('url'); setError(null); }}
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
              type="text"
              className={`form-input ${urlWarning ? 'input-error' : ''}`}
              placeholder="https://example.com/best-dirty-coffee-phuket"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              onBlur={handleUrlBlur}
              disabled={isLoading}
              autoComplete="off"
            />
            {urlWarning ? (
              <div className="inline-field-warning">
                <GoogleIcon name="warning" size={15} color="var(--error-text)" />
                <span>{urlWarning}</span>
              </div>
            ) : (
              <p className="form-help">Enter the full web address of the published page (e.g. https://example.com/blog-post).</p>
            )}
          </div>
        )}
      </div>

      {error && (
        <div className="error-banner">
          <GoogleIcon name="warning" size={18} color="var(--error-text)" />
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
