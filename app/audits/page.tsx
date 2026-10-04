'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AccountControl from '../../components/auth/AccountControl';
import BrandMark from '../../components/BrandMark';
import GoogleIcon from '../../components/GoogleIcon';
import { createClient } from '../../lib/supabase/client';
import { AnalysisResult } from '../../lib/analyze';
import { SerpResultItem } from '../../lib/serp';

interface SavedAudit {
  id: string;
  created_at: string;
  keyword: string;
  location: string;
  input_type: 'text' | 'url';
  source_url: string | null;
  analysis: AnalysisResult;
  competitors: SerpResultItem[];
}

function formatSourceUrl(sourceUrl: string | null) {
  if (!sourceUrl) return 'Pasted draft';

  try {
    const url = new URL(sourceUrl);
    const domain = url.hostname.replace(/^www\./, '');
    const path = url.pathname.split('/').filter(Boolean).map((segment) => {
      try { return decodeURIComponent(segment); } catch { return segment; }
    });
    const visiblePath = path.length > 3
      ? [path[0], '…', path[path.length - 1]]
      : path;

    return [domain, ...visiblePath].join(' › ');
  } catch {
    return sourceUrl;
  }
}

export default function AuditsPage() {
  const router = useRouter();
  const [audits, setAudits] = useState<SavedAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadAudits() {
      try {
        const supabase = createClient();
        const { data, error: queryError } = await supabase
          .from('audits')
          .select('id, created_at, keyword, location, input_type, source_url, analysis, competitors')
          .order('created_at', { ascending: false })
          .limit(50);

        if (queryError) throw queryError;
        if (isMounted) setAudits((data || []) as SavedAudit[]);
      } catch (loadError) {
        if (isMounted) {
          setError('Could not load your past audits. Confirm that the Supabase audits migration is applied, then refresh.');
          console.error('Failed to load audit history.', loadError);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAudits();
    return () => { isMounted = false; };
  }, []);

  const openAudit = (audit: SavedAudit) => {
    sessionStorage.setItem('outranka_audit_id', audit.id);
    sessionStorage.setItem('outranka_analysis', JSON.stringify(audit.analysis));
    sessionStorage.setItem('outranka_competitors', JSON.stringify(audit.competitors));
    sessionStorage.setItem('outranka_query', JSON.stringify({
      keyword: audit.keyword,
      location: audit.location,
      inputType: audit.input_type,
      sourceUrl: audit.source_url || undefined,
    }));
    sessionStorage.removeItem('outranka_audit_save_warning');
    router.push('/results');
  };

  return (
    <>
      <header className="results-sticky-nav">
        <div className="results-nav-inner">
          <div className="results-nav-left">
            <Link href="/" className="results-nav-brand" title="Outranka home">
              <BrandMark size={30} className="results-nav-logo-mark" />
              <span>Outranka</span>
            </Link>
            <div className="results-nav-divider" />
            <div className="results-nav-context">
              <span className="results-nav-keyword">Past Audits</span>
              <span className="results-nav-location">HISTORY</span>
            </div>
          </div>
          <div className="results-nav-actions">
            <AccountControl />
            <Link href="/" className="results-nav-btn results-nav-btn-primary">
              <GoogleIcon name="fact_check" size={16} color="currentColor" />
              <span>New Audit</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="results-container audit-history-page">
        <div className="audit-history-heading">
          <div>
            <h1>Past Audits</h1>
            <p>Your saved SERP analyses, available across sessions.</p>
          </div>
          {!loading && !error && <span className="audit-history-count">{audits.length} {audits.length === 1 ? 'audit' : 'audits'}</span>}
        </div>

        {loading && <p className="audit-history-state" role="status">Loading your audits…</p>}
        {error && <p className="audit-history-error" role="alert">{error}</p>}

        {!loading && !error && audits.length === 0 && (
          <section className="audit-history-empty">
            <GoogleIcon name="description" size={34} color="var(--accent-color)" />
            <h2>No saved audits yet</h2>
            <p>Completed audits will appear here so you can return to them later.</p>
            <Link href="/" className="results-nav-btn results-nav-btn-primary">
              <GoogleIcon name="fact_check" size={16} color="currentColor" />
              <span>Start an Audit</span>
            </Link>
          </section>
        )}

        {!loading && !error && audits.length > 0 && (
          <div className="audit-history-list">
            {audits.map((audit) => (
              <button
                className="audit-history-item"
                type="button"
                key={audit.id}
                onClick={() => openAudit(audit)}
                aria-label={`Open saved audit for ${audit.keyword}, source ${audit.source_url || 'pasted draft'}`}
              >
                <span className="audit-history-item-icon"><GoogleIcon name="description" size={20} color="var(--accent-strong)" /></span>
                <span className="audit-history-item-main">
                  <strong>{audit.keyword}</strong>
                  <span>{audit.location.toUpperCase()} <span aria-hidden="true">·</span> {audit.competitors.length} competitors</span>
                  <span className="audit-history-source" title={audit.source_url || 'Pasted draft'}>
                    <GoogleIcon name={audit.source_url ? 'language' : 'description'} size={14} color="currentColor" />
                    <span>{formatSourceUrl(audit.source_url)}</span>
                  </span>
                </span>
                <time dateTime={audit.created_at}>{new Date(audit.created_at).toLocaleString()}</time>
                <GoogleIcon name="arrow_forward" size={18} color="currentColor" />
              </button>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
