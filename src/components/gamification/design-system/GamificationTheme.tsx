/**
 * @copyright EdPsych Connect Limited 2025
 * @license Proprietary - All Rights Reserved
 * 
 * CONFIDENTIAL: This software contains proprietary algorithms and trade secrets.
 * Unauthorized copying, modification, distribution, or use is strictly prohibited.
 */


/**
 * Gamification Design System
 *
 * Migrated from edpsych-connect-school-new2 with enterprise-grade improvements.
 * Provides design tokens, color palettes, typography, shadows, spacing, and animations
 * for consistent, accessible, and engaging gamification UI.
 */

export const GAMIFICATION_COLORS = {
  primary: {
    lightest: '#E0F7FF',
    light: '#79DEFF',
    base: '#00B4FF',
    dark: '#0076D6',
    darkest: '#004080',
  },
  secondary: {
    lightest: '#FFF2D9',
    light: '#FFD27F',
    base: '#FFB627',
    dark: '#E08E00',
    darkest: '#8F5B00',
  },
  success: {
    lightest: '#E3FFF2',
    light: '#85FFD2',
    base: '#00D68F',
    dark: '#00A36B',
    darkest: '#006647',
  },
  achievement: {
    lightest: '#FFF9E6',
    light: '#FFEB99',
    base: '#FFD700',
    dark: '#E6C000',
    darkest: '#997E00',
  },
  challenge: {
    lightest: '#FFE6E6',
    light: '#FF9999',
    base: '#FF3333',
    dark: '#CC0000',
    darkest: '#800000',
  },
  streak: {
    lightest: '#F5E6FF',
    light: '#D699FF',
    base: '#9933FF',
    dark: '#7700CC',
    darkest: '#4D0080',
  },
  leaderboard: {
    lightest: '#E6F0FF',
    light: '#99C2FF',
    base: '#3377FF',
    dark: '#0044CC',
    darkest: '#002A80',
  },
  neutrals: {
    white: '#FFFFFF',
    lightest: '#F5F8FA',
    light: '#E1E8ED',
    medium: '#AAB8C2',
    dark: '#657786',
    darkest: '#14171A',
    black: '#000000',
  },
};

export const BORDER_RADIUS = {
  small: '0.25rem',
  medium: '0.5rem',
  large: '1rem',
  xl: '1.5rem',
  pill: '9999px',
};

export const ANIMATION = {
  duration: {
    fast: '150ms',
    medium: '300ms',
    slow: '500ms',
  },
  easing: {
    bounce: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    smooth: 'cubic-bezier(0.645, 0.045, 0.355, 1.000)',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },
};

export const SHADOWS = {
  small: '0 2px 4px rgba(0, 0, 0, 0.1)',
  medium: '0 4px 8px rgba(0, 0, 0, 0.12)',
  large: '0 8px 16px rgba(0, 0, 0, 0.14)',
  xl: '0 12px 24px rgba(0, 0, 0, 0.16)',
  inner: 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
  focus: '0 0 0 3px rgba(0, 180, 255, 0.5)',
  success: '0 0 0 3px rgba(0, 214, 143, 0.5)',
  error: '0 0 0 3px rgba(255, 51, 51, 0.5)',
};

export const TYPOGRAPHY = {
  fontFamily: {
    primary: "'Montserrat', sans-serif",
    secondary: "'Poppins', sans-serif",
    accent: "'Fredoka One', cursive",
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    md: '1rem',
    lg: '1.25rem',
    xl: '1.5rem',
    '2xl': '2rem',
    '3xl': '2.5rem',
    '4xl': '3rem',
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    loose: 1.8,
  },
};

export const SPACING = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  '2xl': '3rem',
  '3xl': '4rem',
  '4xl': '6rem',
};

export const Z_INDEX = {
  base: 0,
  above: 10,
  modal: 20,
  toast: 30,
  tooltip: 40,
  confetti: 50,
};

export const BREAKPOINTS = {
  xs: '20rem',
  sm: '36rem',
  md: '48rem',
  lg: '62rem',
  xl: '75rem',
  '2xl': '87.5rem',
};

export const DIFFICULTY_STYLES = {
  easy: {
    primaryColor: GAMIFICATION_COLORS.primary.base,
    secondaryColor: GAMIFICATION_COLORS.success.base,
    background: `linear-gradient(135deg, ${GAMIFICATION_COLORS.primary.lightest}, ${GAMIFICATION_COLORS.success.lightest})`,
    shadow: `0 4px 12px rgba(0, 214, 143, 0.3)`,
    icon: 'star-outline',
  },
  medium: {
    primaryColor: GAMIFICATION_COLORS.secondary.base,
    secondaryColor: GAMIFICATION_COLORS.primary.base,
    background: `linear-gradient(135deg, ${GAMIFICATION_COLORS.secondary.lightest}, ${GAMIFICATION_COLORS.primary.lightest})`,
    shadow: `0 4px 12px rgba(255, 182, 39, 0.3)`,
    icon: 'star-half',
  },
  hard: {
    primaryColor: GAMIFICATION_COLORS.challenge.base,
    secondaryColor: GAMIFICATION_COLORS.streak.base,
    background: `linear-gradient(135deg, ${GAMIFICATION_COLORS.challenge.lightest}, ${GAMIFICATION_COLORS.streak.lightest})`,
    shadow: `0 4px 12px rgba(255, 51, 51, 0.3)`,
    icon: 'star',
  },
  expert: {
    primaryColor: GAMIFICATION_COLORS.streak.dark,
    secondaryColor: GAMIFICATION_COLORS.achievement.base,
    background: `linear-gradient(135deg, ${GAMIFICATION_COLORS.streak.lightest}, ${GAMIFICATION_COLORS.achievement.lightest})`,
    shadow: `0 4px 12px rgba(153, 51, 255, 0.3)`,
    icon: 'stars',
  },
};

export const ACHIEVEMENT_TIER_STYLES = {
  bronze: {
    color: '#CD7F32',
    background: `linear-gradient(135deg, #FFC38B, #CD7F32)`,
    shadow: '0 4px 12px rgba(205, 127, 50, 0.4)',
    glow: '0 0 15px rgba(205, 127, 50, 0.6)',
  },
  silver: {
    color: '#C0C0C0',
    background: `linear-gradient(135deg, #E8E8E8, #A9A9A9)`,
    shadow: '0 4px 12px rgba(169, 169, 169, 0.4)',
    glow: '0 0 15px rgba(169, 169, 169, 0.6)',
  },
  gold: {
    color: '#FFD700',
    background: `linear-gradient(135deg, #FFEF99, #FFD700)`,
    shadow: '0 4px 12px rgba(255, 215, 0, 0.4)',
    glow: '0 0 15px rgba(255, 215, 0, 0.6)',
  },
  platinum: {
    color: '#E5E4E2',
    background: `linear-gradient(135deg, #F5F5F5, #9CB0C9)`,
    shadow: '0 4px 12px rgba(156, 176, 201, 0.4)',
    glow: '0 0 15px rgba(156, 176, 201, 0.6)',
  },
  diamond: {
    color: '#B9F2FF',
    background: `linear-gradient(135deg, #E0FFFF, #B9F2FF)`,
    shadow: '0 4px 12px rgba(185, 242, 255, 0.4)',
    glow: '0 0 15px rgba(185, 242, 255, 0.6)',
    animation: 'rainbow-border 3s linear infinite',
  },
};

export const KEYFRAMES = {
  fadeIn: `
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
  `,
  scaleIn: `
    @keyframes scaleIn {
      from { transform: scale(0.95); opacity: 0; }
      to { transform: scale(1); opacity: 1; }
    }
  `,
  bounce: `
    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
  `,
  pulse: `
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.05); }
      100% { transform: scale(1); }
    }
  `,
  shimmer: `
    @keyframes shimmer {
      0% { background-position: -100% 0; }
      100% { background-position: 100% 0; }
    }
  `,
  confetti: `
    @keyframes confetti {
      0% { transform: translateY(0) rotate(0); opacity: 1; }
      100% { transform: translateY(100vh) rotate(360deg); opacity: 0; }
    }
  `,
  rainbowBorder: `
    @keyframes rainbow-border {
      0% { border-color: #ff0000; }
      14% { border-color: #ff7f00; }
      28% { border-color: #ffff00; }
      42% { border-color: #00ff00; }
      57% { border-color: #0000ff; }
      71% { border-color: #4b0082; }
      85% { border-color: #9400d3; }
      100% { border-color: #ff0000; }
    }
  `,
};

export const GamificationTheme = {
  colors: GAMIFICATION_COLORS,
  borderRadius: BORDER_RADIUS,
  animation: ANIMATION,
  shadows: SHADOWS,
  typography: TYPOGRAPHY,
  spacing: SPACING,
  zIndex: Z_INDEX,
  breakpoints: BREAKPOINTS,
  difficultyStyles: DIFFICULTY_STYLES,
  achievementTierStyles: ACHIEVEMENT_TIER_STYLES,
  keyframes: KEYFRAMES,
};

export default GamificationTheme;