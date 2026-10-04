import React from 'react';
import { COLORS, scoreColor } from './colors';

interface RingGaugeProps {
  value: number; // 0 - 100
  size?: number;
  stroke?: number;
  color?: string;
  /** Text under the number inside the ring (e.g. "Overall") */
  caption?: string;
  suffix?: string;
}

/** Circular progress ring with the value centered. Pure SVG, no dependencies. */
export default function RingGauge({
  value,
  size = 120,
  stroke = 10,
  color,
  caption,
  suffix = '%',
}: RingGaugeProps) {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const ringColor = color || scoreColor(clamped);
  const numberSize = Math.round(size * 0.27);

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={COLORS.track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference * (clamped / 100)} ${circumference}`}
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          lineHeight: 1,
        }}
      >
        <span style={{ fontSize: numberSize, fontWeight: 800, letterSpacing: '-0.03em', color: ringColor }}>
          {Math.round(clamped)}
          <span style={{ fontSize: Math.round(numberSize * 0.5), fontWeight: 700 }}>{suffix}</span>
        </span>
        {caption && (
          <span
            style={{
              fontSize: Math.max(10, Math.round(size * 0.085)),
              color: 'var(--muted-text)',
              fontWeight: 600,
              marginTop: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
            }}
          >
            {caption}
          </span>
        )}
      </div>
    </div>
  );
}
