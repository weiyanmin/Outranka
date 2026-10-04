import React from 'react';
import { COLORS } from '../charts/colors';

export type Tone = 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const TONES: Record<Tone, { bg: string; fg: string; border: string }> = {
  accent: { bg: 'rgba(40, 167, 156, 0.1)', fg: 'var(--accent-color)', border: 'rgba(40, 167, 156, 0.25)' },
  success: { bg: 'rgba(16, 185, 129, 0.1)', fg: '#0f9d6e', border: 'rgba(16, 185, 129, 0.25)' },
  warning: { bg: 'rgba(245, 158, 11, 0.1)', fg: '#b45309', border: 'rgba(245, 158, 11, 0.3)' },
  danger: { bg: 'rgba(244, 63, 94, 0.08)', fg: '#e11d48', border: 'rgba(244, 63, 94, 0.25)' },
  info: { bg: 'rgba(59, 130, 246, 0.1)', fg: '#2563eb', border: 'rgba(59, 130, 246, 0.25)' },
  neutral: { bg: 'var(--segmented-bg)', fg: 'var(--muted-text)', border: 'transparent' },
};

export function toneColor(tone: Tone): string {
  switch (tone) {
    case 'success':
      return COLORS.success;
    case 'warning':
      return COLORS.warning;
    case 'danger':
      return COLORS.danger;
    case 'info':
      return COLORS.info;
    case 'neutral':
      return COLORS.neutral;
    default:
      return COLORS.accent;
  }
}

/** Small rounded label. */
export default function Pill({ tone = 'neutral', children }: { tone?: Tone; children: React.ReactNode }) {
  const t = TONES[tone];
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        fontSize: '0.72rem',
        fontWeight: 700,
        letterSpacing: '0.03em',
        textTransform: 'uppercase',
        background: t.bg,
        color: t.fg,
        border: `1px solid ${t.border}`,
        padding: '3px 10px',
        borderRadius: 9999,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}
