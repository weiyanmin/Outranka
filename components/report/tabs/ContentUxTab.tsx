'use client';

import React from 'react';
import { AnalysisResult } from '../../../lib/analyze';
import GoogleIcon from '../../GoogleIcon';
import RingGauge from '../../charts/RingGauge';
import CompareTable from '../../charts/CompareTable';
import { COLORS } from '../../charts/colors';
import SectionCard from '../SectionCard';
import Pill from '../Pill';

type Check = NonNullable<AnalysisResult['scannabilityAudit']>['checks'][number];

const groupLabel: React.CSSProperties = {
  fontSize: '0.74rem',
  fontWeight: 700,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
  color: 'var(--muted-text)',
  marginBottom: '14px',
};

function formatBenchmark(text: string): string {
  return text
    .replace(/% of Competitors Use TOC/i, '% Use TOC')
    .replace(/ in Top 10$/i, '')
    .trim();
}

function ScannabilityCheckCard({ chk }: { chk: Check }) {
  const isAlert = chk.status === 'alert';
  const isWarning = chk.status === 'warning';

  const iconName = isAlert ? 'error' : isWarning ? 'warning' : 'check_circle';

  return (
    <div className={`scannability-check-card scannability-check-card--${chk.status}`}>
      <div className="scannability-check-main">
        <span className="scannability-check-icon">
          <GoogleIcon name={iconName} size={20} color="currentColor" />
        </span>
        <div className="scannability-check-copy">
          <strong>{chk.label}</strong>
          <p>{chk.guidance || 'Matches top ranking competitor scannability standards.'}</p>
        </div>
      </div>

      <div className="scannability-check-comparison" aria-label="Draft compared with top 10 benchmark">
        <div className="scannability-check-metric scannability-check-metric--draft">
          <span>Your draft</span>
          <strong>{chk.userValue}</strong>
        </div>
        <span className="scannability-check-divider" aria-hidden="true" />
        <div className="scannability-check-metric">
          <span>Top 10 benchmark</span>
          <strong>{formatBenchmark(chk.competitorBenchmark)}</strong>
        </div>
      </div>
    </div>
  );
}

export default function ContentUxTab({ analysis }: { analysis: AnalysisResult }) {
  const audit = analysis.scannabilityAudit;
  const alerts = audit?.checks.filter((c) => c.status === 'alert') || [];
  const warnings = audit?.checks.filter((c) => c.status === 'warning') || [];
  const passes = audit?.checks.filter((c) => c.status === 'pass') || [];
  const issuesCount = alerts.length + warnings.length;

  // Show issues by default when available, allowing user to toggle to 'all' or 'passing'
  const [filter, setFilter] = React.useState<'all' | 'issues' | 'passing'>(
    issuesCount > 0 ? 'issues' : 'all'
  );
  const strengths = analysis.strengths || [];

  if (!audit) {
    return (
      <div className="bento">
        <SectionCard title="Content & UX" subtitle="Scannability data is not available for this audit." span={12}>
          <p style={{ fontSize: '0.88rem', color: 'var(--muted-text)' }}>Run a new audit with your content to see the structural comparison.</p>
        </SectionCard>
      </div>
    );
  }

  const u = audit.userMetrics;
  const a = audit.topCompetitorAverages;

  const statusRows = [
    { label: 'Passing', count: passes.length, color: COLORS.success },
    { label: 'Could improve', count: warnings.length, color: COLORS.warning },
    { label: 'Needs attention', count: alerts.length, color: COLORS.danger },
  ];

  const facts = [
    {
      label: 'Table of contents',
      you: u.hasTableOfContents ? 'Yes' : 'No',
      note: `${a.tocAdoptionRate}% of top results have one`,
    },
    {
      label: 'Data tables',
      you: u.tableCount > 0 ? `Yes (${u.tableCount})` : 'No',
      note: `${a.tableAdoptionRate}% of top results use tables`,
    },
    { label: 'Estimated reading time', you: `${u.estimatedReadingTimeMin} min`, note: `${u.wordCount.toLocaleString()} words` },
  ];

  const showNeedsAttention = (filter === 'all' || filter === 'issues') && alerts.length > 0;
  const showCouldImprove = (filter === 'all' || filter === 'issues') && warnings.length > 0;
  const showPassing = (filter === 'all' || filter === 'passing') && passes.length > 0;

  return (
    <div className="bento">
      <SectionCard title="Content Quality Score" subtitle="Structure of your draft vs. top results" span={12}>
        <div className="scannability-score-layout">
          <RingGauge value={audit.scannabilityScore} size={170} stroke={13} caption="Score" />
          <div className="scannability-score-status">
            {statusRows.map((r) => (
              <div key={r.label} className="scannability-score-row">
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: 'var(--text-color)' }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: r.color }} />
                  {r.label}
                </span>
                <strong style={{ color: 'var(--text-color)' }}>{r.count}</strong>
              </div>
            ))}
          </div>
        </div>
      </SectionCard>

      {analysis.eeatAudit && (
        <SectionCard
          title="E-E-A-T Signals Review"
          subtitle={`${analysis.eeatAudit.detectedSignals} of ${analysis.eeatAudit.totalSignals} observable signals found in the submitted text`}
          span={12}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            {analysis.eeatAudit.dimensions.map((dimension) => (
              <section key={dimension.key} style={{ padding: '16px', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--segmented-bg)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <h4 style={{ margin: 0, color: 'var(--text-color)', fontSize: '0.96rem' }}>{dimension.label}</h4>
                  <span style={{ color: 'var(--muted-text)', fontSize: '0.82rem', fontWeight: 700 }}>{dimension.detected}/{dimension.total}</span>
                </div>
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '10px' }}>
                  {dimension.signals.map((signal) => (
                    <li key={signal.label} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: 'var(--muted-text)', fontSize: '0.82rem', lineHeight: 1.45 }}>
                      <GoogleIcon name={signal.detected ? 'check_circle' : 'help'} size={16} color={signal.detected ? COLORS.success : 'var(--muted-text)'} style={{ flex: '0 0 auto', marginTop: 1 }} />
                      <span>{signal.label}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
          <p style={{ margin: '16px 0 0', color: 'var(--muted-text)', fontSize: '0.78rem', lineHeight: 1.5 }}>
            {analysis.eeatAudit.scopeNotice}
          </p>
        </SectionCard>
      )}

      <SectionCard title="You vs. Top 10 Average" subtitle="Compare your page with the average across the ranking results" span={12}>
        <CompareTable
          rows={[
            { label: 'H2 headings', you: u.h2Count, benchmark: a.avgH2Count },
            { label: 'H3 headings', you: u.h3Count, benchmark: a.avgH3Count },
            { label: 'Images', you: u.imageCount, benchmark: a.avgImageCount },
            { label: 'Videos', you: u.videoCount, benchmark: a.avgVideoCount },
            { label: 'Word count', you: u.wordCount, benchmark: a.avgWordCount },
          ]}
        />
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '20px',
            marginTop: '28px',
            paddingTop: '24px',
            borderTop: '1px solid var(--border-color)',
          }}
        >
          {facts.map((f) => (
            <div key={f.label}>
              <div style={{ fontSize: '0.74rem', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--muted-text)' }}>
                {f.label}
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-color)', margin: '4px 0 2px' }}>{f.you}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--muted-text)' }}>{f.note}</div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Scannability Checks"
        subtitle="Automated structure checks against the top 10 competitors"
        span={12}
        action={
          <div
            style={{
              display: 'inline-flex',
              padding: '3px',
              background: 'var(--segmented-bg)',
              borderRadius: '8px',
              gap: '2px',
              border: '1px solid var(--border-color)',
            }}
          >
            {[
              { id: 'all', label: `All (${audit.checks.length})` },
              { id: 'issues', label: `Issues (${issuesCount})` },
              { id: 'passing', label: `Passing (${passes.length})` },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setFilter(t.id as any)}
                style={{
                  border: 'none',
                  background: filter === t.id ? '#ffffff' : 'transparent',
                  color: filter === t.id ? 'var(--text-color)' : '#4b5563',
                  fontSize: '0.78rem',
                  fontWeight: filter === t.id ? 700 : 600,
                  padding: '5px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  boxShadow: filter === t.id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                  transition: 'all 0.15s ease',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {showNeedsAttention && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted-text)' }}>
                  Needs attention
                </span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, background: '#fee2e2', color: COLORS.danger, padding: '1px 8px', borderRadius: '10px' }}>
                  {alerts.length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {alerts.map((c) => (
                  <ScannabilityCheckCard key={c.id} chk={c} />
                ))}
              </div>
            </div>
          )}

          {showCouldImprove && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted-text)' }}>
                  Could be improved
                </span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, background: '#fef3c7', color: '#b45309', padding: '1px 8px', borderRadius: '10px' }}>
                  {warnings.length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {warnings.map((c) => (
                  <ScannabilityCheckCard key={c.id} chk={c} />
                ))}
              </div>
            </div>
          )}

          {showPassing && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <span style={{ fontSize: '0.74rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--muted-text)' }}>
                  Passing checks
                </span>
                <span style={{ fontSize: '0.72rem', fontWeight: 700, background: '#d1fae5', color: '#047857', padding: '1px 8px', borderRadius: '10px' }}>
                  {passes.length}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {passes.map((c) => (
                  <ScannabilityCheckCard key={c.id} chk={c} />
                ))}
              </div>
            </div>
          )}

          {/* Empty state for issues filter */}
          {filter === 'issues' && issuesCount === 0 && (
            <div
              style={{
                textAlign: 'center',
                padding: '36px 20px',
                background: 'var(--segmented-bg)',
                borderRadius: '12px',
                border: '1px dashed var(--border-color)',
              }}
            >
              <GoogleIcon name="check_circle" size={32} color={COLORS.success} />
              <div style={{ fontSize: '0.96rem', fontWeight: 600, color: 'var(--text-color)', marginTop: '8px' }}>
                No Scannability Issues Found
              </div>
              <p style={{ fontSize: '0.84rem', color: 'var(--muted-text)', marginTop: '4px' }}>
                All 6 automated checks match or exceed top competitor benchmarks.
              </p>
            </div>
          )}
        </div>
      </SectionCard>

      {strengths.length > 0 && (
        <SectionCard title="What Your Content Does Well" subtitle="Keep these, they are already working" span={12}>
          <ul
            className="clean-list"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px 32px' }}
          >
            {strengths.map((s, i) => (
              <li key={i} className="clean-list-item">
                <GoogleIcon name="check_circle" size={20} color={COLORS.success} style={{ marginTop: 2 }} />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </SectionCard>
      )}
    </div>
  );
}
