/**
 * AIXORD Companion - PMERIT Theme Styles
 *
 * Matches pmerit.com dark theme design system
 */

export const colors = {
  // Background colors
  bgPrimary: '#1a1a2e',
  bgSecondary: '#16213e',
  bgTertiary: '#0f3460',
  bgCard: '#1e2746',

  // Text colors
  textPrimary: '#eaeaea',
  textSecondary: '#a0a0a0',
  textMuted: '#6c6c6c',

  // Accent colors
  accent: '#e94560',
  accentHover: '#ff6b6b',
  accentMuted: '#e9456033',

  // Status colors
  success: '#4ade80',
  warning: '#fbbf24',
  error: '#f87171',
  info: '#60a5fa',

  // Gate colors
  gatePassed: '#4ade80',
  gateBlocked: '#f87171',
  gatePending: '#6c6c6c',

  // Phase colors
  phaseBrainstorm: '#a78bfa',
  phasePlan: '#60a5fa',
  phaseExecute: '#4ade80',
  phaseReview: '#fbbf24',

  // Border
  border: '#2a3a5a',
  borderHover: '#3a4a6a',
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
};

export const typography = {
  fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  fontSize: {
    xs: '10px',
    sm: '12px',
    md: '14px',
    lg: '16px',
    xl: '20px',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

export const styles = {
  container: {
    padding: spacing.md,
    backgroundColor: colors.bgPrimary,
    minHeight: '100vh',
    color: colors.textPrimary,
    fontFamily: typography.fontFamily,
  } as React.CSSProperties,

  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.md,
    borderBottom: `1px solid ${colors.border}`,
    marginBottom: spacing.md,
  } as React.CSSProperties,

  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
  } as React.CSSProperties,

  logoText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.accent,
    margin: 0,
  } as React.CSSProperties,

  version: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  } as React.CSSProperties,

  section: {
    backgroundColor: colors.bgCard,
    borderRadius: '8px',
    padding: spacing.md,
    marginBottom: spacing.md,
    border: `1px solid ${colors.border}`,
  } as React.CSSProperties,

  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.semibold,
    color: colors.textSecondary,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginBottom: spacing.sm,
  } as React.CSSProperties,

  button: {
    backgroundColor: colors.accent,
    color: colors.textPrimary,
    border: 'none',
    borderRadius: '6px',
    padding: `${spacing.sm} ${spacing.md}`,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    width: '100%',
  } as React.CSSProperties,

  buttonSecondary: {
    backgroundColor: 'transparent',
    color: colors.textSecondary,
    border: `1px solid ${colors.border}`,
    borderRadius: '6px',
    padding: `${spacing.sm} ${spacing.md}`,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    cursor: 'pointer',
    transition: 'all 0.2s',
  } as React.CSSProperties,

  input: {
    width: '100%',
    backgroundColor: colors.bgSecondary,
    border: `1px solid ${colors.border}`,
    borderRadius: '6px',
    padding: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    outline: 'none',
  } as React.CSSProperties,

  textarea: {
    width: '100%',
    backgroundColor: colors.bgSecondary,
    border: `1px solid ${colors.border}`,
    borderRadius: '6px',
    padding: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    resize: 'vertical' as const,
    minHeight: '80px',
    outline: 'none',
    fontFamily: typography.fontFamily,
  } as React.CSSProperties,

  select: {
    width: '100%',
    backgroundColor: colors.bgSecondary,
    border: `1px solid ${colors.border}`,
    borderRadius: '6px',
    padding: spacing.sm,
    color: colors.textPrimary,
    fontSize: typography.fontSize.sm,
    outline: 'none',
    cursor: 'pointer',
  } as React.CSSProperties,

  gateChip: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: `${spacing.xs} ${spacing.sm}`,
    borderRadius: '4px',
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  } as React.CSSProperties,

  phaseButton: {
    flex: 1,
    padding: spacing.sm,
    border: 'none',
    borderRadius: '6px',
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center' as const,
  } as React.CSSProperties,

  promptCard: {
    backgroundColor: colors.bgSecondary,
    borderRadius: '6px',
    padding: spacing.sm,
    marginBottom: spacing.sm,
    border: `1px solid ${colors.border}`,
    cursor: 'pointer',
    transition: 'border-color 0.2s',
  } as React.CSSProperties,

  promptName: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
  } as React.CSSProperties,

  promptContent: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
  } as React.CSSProperties,
};

export function getPhaseColor(phase: string): string {
  switch (phase) {
    case 'BRAINSTORM':
      return colors.phaseBrainstorm;
    case 'PLAN':
      return colors.phasePlan;
    case 'EXECUTE':
      return colors.phaseExecute;
    case 'REVIEW':
      return colors.phaseReview;
    default:
      return colors.textMuted;
  }
}

export function getGateColor(status: string): string {
  switch (status) {
    case 'passed':
      return colors.gatePassed;
    case 'blocked':
      return colors.gateBlocked;
    default:
      return colors.gatePending;
  }
}
