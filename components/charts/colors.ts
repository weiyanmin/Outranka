/**
 * Shared color helpers for charts. Uses only the existing app palette.
 */
export const COLORS = {
  accent: '#28a79c',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#f43f5e',
  info: '#3b82f6',
  neutral: '#cbd5e1',
  track: '#eef0f2',
};

/** Same thresholds the report has always used for score coloring. */
export function scoreColor(score: number): string {
  if (score >= 80) return COLORS.success;
  if (score >= 50) return COLORS.accent;
  return COLORS.danger;
}
