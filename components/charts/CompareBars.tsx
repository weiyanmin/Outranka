import React from 'react';
import { COLORS } from './colors';

export interface CompareRow {
  label: string;
  you: number;
  benchmark: number;
}

interface CompareBarsProps {
  rows: CompareRow[];
  youLabel?: string;
  benchmarkLabel?: string;
}

function fmt(n: number) {
  return Number.isInteger(n) ? n.toLocaleString() : n.toFixed(1);
}

/** "You vs benchmark" paired bars, each row scaled to its own max. */
export default function CompareBars({ rows, youLabel = 'You', benchmarkLabel = 'Top 10 avg' }: CompareBarsProps) {
  return (
    <div>
      <div style={{ display: 'flex', gap: '18px', marginBottom: '18px', fontSize: '0.78rem', color: 'var(--muted-text)', fontWeight: 600 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: COLORS.accent }} />
          {youLabel}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: COLORS.neutral }} />
          {benchmarkLabel}
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {rows.map((row, i) => {
          const max = Math.max(row.you, row.benchmark, 1);
          const bar = (value: number, color: string) => (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ flex: 1, height: 8, background: COLORS.track, borderRadius: 9999, overflow: 'hidden' }}>
                <div style={{ width: `${(value / max) * 100}%`, height: '100%', background: color, borderRadius: 9999, transition: 'width 0.5s ease' }} />
              </div>
              <span style={{ width: 52, textAlign: 'right', fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-color)' }}>{fmt(value)}</span>
            </div>
          );
          return (
            <div key={i}>
              <div style={{ fontSize: '0.86rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '8px' }}>{row.label}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {bar(row.you, COLORS.accent)}
                {bar(row.benchmark, COLORS.neutral)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
