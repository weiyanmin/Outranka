'use client';

import React from 'react';
import { AnalysisResult } from '../../../lib/analyze';
import GoogleIcon from '../../GoogleIcon';
import RingGauge from '../../charts/RingGauge';
import CompareBars from '../../charts/CompareBars';
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

function IssueRow({ chk }: { chk: Check }) {
  const isAlert = chk.status === 'alert';
  const color = isAlert ? COLORS.danger : COLORS.warning;
  return (
    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
      <GoogleIcon name={isAlert ? 'error' : 'warning'} size={20} color={color} style={{ marginTop: 1 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', alignItems: 'baseline' }}>
          <span style={{ fontSize: '0.94rem', fontWeight: 600, color: 'var(--text-color)' }}>{chk.label}</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--muted-text)' }}>
            You <strong style={{ color: 'var(--text-color)' }}>{chk.userValue}</strong> · Benchmark{' '}
            <strong style={{ color: 'var(--text-color)' }}>{chk.competitorBenchmark}</strong>
          </span>
        </div>
        <p style={{ fontSize: '0.86rem', lineHeight: 1.5, color: 'var(--muted-text)', marginTop: 4 }}>{chk.guidance}</p>
      </div>
    </div>
  );
}

export default function ContentUxTab({ analysis }: { analysis: AnalysisResult }) {
  const audit = analysis.scannabilityAudit;
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
  const alerts = audit.checks.filter((c) => c.status === 'alert');
  const warnings = audit.checks.filter((c) => c.status === 'warning');
  const passes = audit.checks.filter((c) => c.status === 'pass');

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

  return (
    <div className="bento">
      <SectionCard title="Scannability Score" subtitle="Structure of your draft vs. top results" span={4}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '28px' }}>
          <RingGauge value={audit.scannabilityScore} size={170} stroke={13} caption="Score" />
          <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {statusRows.map((r) => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.88rem' }}>
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

      <SectionCard title="You vs. Top 10 Average" subtitle="Headings, media and depth compared to what ranks" span={8}>
        <CompareBars
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
        action={<Pill tone="accent">{audit.checks.length} checks</Pill>}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {alerts.length > 0 && (
            <div>
              <div style={groupLabel}>Needs attention · {alerts.length}</div>
              <div className="divided" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {alerts.map((c) => (
                  <IssueRow key={c.id} chk={c} />
                ))}
              </div>
            </div>
          )}

          {warnings.length > 0 && (
            <div>
              <div style={groupLabel}>Could be improved · {warnings.length}</div>
              <div className="divided" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {warnings.map((c) => (
                  <IssueRow key={c.id} chk={c} />
                ))}
              </div>
            </div>
          )}

          {passes.length > 0 && (
            <div>
              <div style={groupLabel}>Passing · {passes.length}</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px 28px' }}>
                {passes.map((c) => (
                  <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem', color: 'var(--text-color)' }}>
                    <GoogleIcon name="check_circle" size={18} color={COLORS.success} />
                    <span style={{ flex: 1 }}>{c.label}</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--muted-text)' }}>{c.userValue}</span>
                  </div>
                ))}
              </div>
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
