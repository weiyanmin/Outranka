import React from 'react';
import { COLORS, scoreColor } from './colors';

export interface BarListItem {
  label: string;
  value: number;
  max?: number; // defaults to 100
  color?: string;
  /** Right-aligned text; defaults to "{value}%" */
  valueLabel?: string;
  /** Small muted line under the bar */
  hint?: string;
}

interface BarListProps {
  items: BarListItem[];
  barHeight?: number;
  gap?: number;
}

/** Labeled horizontal bars. Label + value on top, slim bar beneath. */
export default function BarList({ items, barHeight = 8, gap = 16 }: BarListProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap }}>
      {items.map((item, i) => {
        const max = item.max ?? 100;
        const pct = Math.max(0, Math.min(100, (item.value / (max || 1)) * 100));
        const color = item.color || scoreColor(pct);
        return (
          <div key={i}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-color)', lineHeight: 1.3 }}>{item.label}</span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color, flexShrink: 0 }}>
                {item.valueLabel ?? `${Math.round(item.value)}%`}
              </span>
            </div>
            <div style={{ height: barHeight, background: COLORS.track, borderRadius: 9999, overflow: 'hidden' }}>
              <div
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  background: color,
                  borderRadius: 9999,
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
            {item.hint && (
              <div style={{ fontSize: '0.76rem', color: 'var(--muted-text)', marginTop: '5px', lineHeight: 1.35 }}>{item.hint}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
