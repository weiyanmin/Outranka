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
  last_viewed_at: string | null;
  analysis: AnalysisResult;
  competitors: SerpResultItem[];
}

type DateFilter = 'all' | 'today' | '7d' | '30d' | 'month';

function isLastViewedSchemaError(error: unknown) {
  const dbError = error as { code?: string; message?: string };
  return ['42703', '42883', 'PGRST202', 'PGRST204'].includes(dbError?.code || '')
    || /last_viewed_at|mark_audit_viewed/i.test(dbError?.message || '');
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
  const [deleteError, setDeleteError] = useState('');
  const [deletingAuditId, setDeletingAuditId] = useState<string | null>(null);
  const [localLastVisitedAuditId, setLocalLastVisitedAuditId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  useEffect(() => {
    let isMounted = true;

    async function loadAudits() {
      try {
        try {
          setLocalLastVisitedAuditId(localStorage.getItem('outranka_last_visited_audit'));
        } catch {
          // Browser storage may be unavailable; the database marker still works.
        }

        const supabase = createClient();
        const { data, error: queryError } = await supabase
          .from('audits')
          .select('id, created_at, keyword, location, input_type, source_url, last_viewed_at, analysis, competitors')
          .order('created_at', { ascending: false })
          .limit(50);

        if (queryError && isLastViewedSchemaError(queryError)) {
          const fallback = await supabase
            .from('audits')
            .select('id, created_at, keyword, location, input_type, source_url, analysis, competitors')
            .order('created_at', { ascending: false })
            .limit(50);

          if (fallback.error) throw fallback.error;
          if (isMounted) {
            setAudits((fallback.data || []).map((audit) => ({
              ...audit,
              last_viewed_at: null,
            })) as SavedAudit[]);
          }
        } else {
          if (queryError) throw queryError;
          if (isMounted) setAudits((data || []) as SavedAudit[]);
        }
      } catch (loadError) {
        if (isMounted) {
          setError('Could not load your past audits. Confirm that the Supabase audits migration is applied, then refresh.');
          console.warn('Failed to load audit history.', loadError);
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

  const databaseLastVisitedAuditId = audits
    .filter((audit) => audit.last_viewed_at)
    .sort((a, b) => Date.parse(b.last_viewed_at!) - Date.parse(a.last_viewed_at!))[0]?.id;
  const lastVisitedAuditId = localLastVisitedAuditId || databaseLastVisitedAuditId;

  const filteredAudits = audits.filter((audit) => {
    const normalizedSearch = searchTerm.trim().toLowerCase();
    const matchesSearch = !normalizedSearch
      || audit.keyword.toLowerCase().includes(normalizedSearch)
      || (audit.source_url || '').toLowerCase().includes(normalizedSearch);

    const createdAt = new Date(audit.created_at);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const matchesDate = dateFilter === 'all'
      || (dateFilter === 'today' && createdAt >= today)
      || (dateFilter === '7d' && createdAt >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
      || (dateFilter === '30d' && createdAt >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      || (dateFilter === 'month' && createdAt.getFullYear() === today.getFullYear() && createdAt.getMonth() === today.getMonth());

    return matchesSearch && matchesDate;
  });

  const hasActiveFilters = Boolean(searchTerm.trim()) || dateFilter !== 'all';

  const deleteAudit = async (audit: SavedAudit) => {
    if (!window.confirm(`Delete the saved audit for “${audit.keyword}”? Its report and competitor data will be permanently removed from your account.`)) return;

    setDeleteError('');
    setDeletingAuditId(audit.id);
    try {
      const response = await fetch(`/api/audits/${encodeURIComponent(audit.id)}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Could not delete this audit. Please try again.');
      }

      setAudits((currentAudits) => currentAudits.filter((item) => item.id !== audit.id));
      try {
        if (sessionStorage.getItem('outranka_audit_id') === audit.id) {
          sessionStorage.removeItem('outranka_audit_id');
          sessionStorage.removeItem('outranka_analysis');
          sessionStorage.removeItem('outranka_competitors');
          sessionStorage.removeItem('outranka_query');
          sessionStorage.removeItem('outranka_audit_save_warning');
        }
        if (localStorage.getItem('outranka_last_visited_audit') === audit.id) {
          localStorage.removeItem('outranka_last_visited_audit');
          setLocalLastVisitedAuditId(null);
        }
      } catch {
        // The database deletion succeeded; browser storage may be unavailable.
      }
    } catch (deleteFailure) {
      setDeleteError(deleteFailure instanceof Error ? deleteFailure.message : 'Could not delete this audit. Please try again.');
    } finally {
      setDeletingAuditId(null);
    }
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
          {!loading && !error && <span className="audit-history-count">{filteredAudits.length}{hasActiveFilters ? ` of ${audits.length}` : ''} {filteredAudits.length === 1 ? 'audit' : 'audits'}</span>}
        </div>

        {loading && <p className="audit-history-state" role="status">Loading your audits…</p>}
        {error && <p className="audit-history-error" role="alert">{error}</p>}
        {deleteError && <p className="audit-history-error" role="alert">{deleteError}</p>}

        {!loading && !error && audits.length > 0 && (
          <div className="audit-history-filters" aria-label="Filter past audits">
            <label className="audit-history-search">
              <GoogleIcon name="search" size={17} color="var(--muted-text)" />
              <span className="sr-only">Search audits</span>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search keyword or domain"
              />
            </label>
            <label className="audit-history-filter-select">
              <span className="sr-only">Filter by date</span>
              <select value={dateFilter} onChange={(event) => setDateFilter(event.target.value as DateFilter)}>
                <option value="all">Any date</option>
                <option value="today">Today</option>
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="month">This month</option>
              </select>
            </label>
          </div>
        )}

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

        {!loading && !error && audits.length > 0 && filteredAudits.length === 0 && (
          <section className="audit-history-empty audit-history-filter-empty">
            <GoogleIcon name="search" size={34} color="var(--accent-color)" />
            <h2>No matching audits</h2>
            <p>Try a different search or date range.</p>
          </section>
        )}

        {!loading && !error && filteredAudits.length > 0 && (
          <div className="audit-history-list">
            {filteredAudits.map((audit) => (
              <article className="audit-history-item" key={audit.id}>
                <button
                  className="audit-history-item-open"
                  type="button"
                  onClick={() => openAudit(audit)}
                  aria-label={`Open saved audit for ${audit.keyword}, source ${audit.source_url || 'pasted draft'}`}
                >
                  <span className="audit-history-item-icon"><GoogleIcon name="description" size={20} color="var(--accent-strong)" /></span>
                  <span className="audit-history-item-main">
                    <span className="audit-history-title-row">
                      <strong>{audit.keyword}</strong>
                      {audit.id === lastVisitedAuditId && <span className="audit-history-last-visited">Last Visited</span>}
                    </span>
                    <span>{audit.location.toUpperCase()} <span aria-hidden="true">·</span> {audit.competitors.length} competitors</span>
                    <span className="audit-history-source" title={audit.source_url || 'Pasted draft'}>
                      <GoogleIcon name={audit.source_url ? 'language' : 'description'} size={14} color="currentColor" />
                      <span>{formatSourceUrl(audit.source_url)}</span>
                    </span>
                  </span>
                  <time dateTime={audit.created_at}>{new Date(audit.created_at).toLocaleString()}</time>
                  <GoogleIcon name="arrow_forward" size={18} color="currentColor" />
                </button>
                <button
                  className="audit-history-delete"
                  type="button"
                  onClick={() => deleteAudit(audit)}
                  disabled={deletingAuditId !== null}
                  aria-label={`Delete saved audit for ${audit.keyword}`}
                  title="Delete audit"
                >
                  <GoogleIcon name={deletingAuditId === audit.id ? 'progress_activity' : 'delete'} size={18} color="currentColor" className={deletingAuditId === audit.id ? 'icon-spin' : undefined} />
                </button>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
