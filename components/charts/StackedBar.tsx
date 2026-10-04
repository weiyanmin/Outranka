import React from 'react';

export interface StackedSegment {
  label: string;
  value: number;
  color: string;
}

interface StackedBarProps {
  segments: StackedSegment[];
  /** Label for the unit in the legend, e.g. "of 10" */
  totalLabel?: string;
}

/** One segmented bar with a legend underneath. */
export default function StackedBar({ segments, totalLabel }: StackedBarProps) {
  const active = segments.filter((s) => s.value > 0);
  const total = active.reduce((sum, s) => sum + s.value, 0) || 1;

  return (
    <div>
      <div style={{ display: 'flex', height: 14, borderRadius: 9999, overflow: 'hidden', gap: 2 }}>
        {active.map((s, i) => (
          <div
            key={i}
            title={`${s.label}: ${s.value}`}
            style={{ width: `${(s.value / total) * 100}%`, background: s.color, transition: 'width 0.5s ease' }}
          />
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '18px' }}>
        {active.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', fontSize: '0.88rem', color: 'var(--text-color)' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
              {s.label}
            </span>
            <span style={{ fontSize: '0.86rem', color: 'var(--muted-text)' }}>
              <strong style={{ color: 'var(--text-color)' }}>{s.value}</strong>
              {totalLabel ? ` ${totalLabel}` : ''} · {Math.round((s.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
