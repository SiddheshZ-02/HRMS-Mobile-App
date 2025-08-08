/**
 * Modern Actify HR App Color Scheme
 * Based on Actify brand colors with enhanced accessibility and visual appeal
 */

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

// Actify Brand Colors
const actifyPrimary = '#0a7ea4'; // Primary blue from logo
const actifySecondary = '#1e40af'; // Deep blue
const actifyAccent = '#3b82f6'; // Bright blue
const actifySuccess = '#10b981'; // Green
const actifyWarning = '#f59e0b'; // Amber
const actifyError = '#ef4444'; // Red

// Neutral Colors
const neutral50 = '#f8fafc';
const neutral100 = '#f1f5f9';
const neutral200 = '#e2e8f0';
const neutral300 = '#cbd5e1';
const neutral400 = '#94a3b8';
const neutral500 = '#64748b';
const neutral600 = '#475569';
const neutral700 = '#334155';
const neutral800 = '#1e293b';
const neutral900 = '#0f172a';

export const Colors = {
  light: {
    text: neutral900,
    background: neutral50,
    tint: actifyPrimary,
    icon: neutral600,
    tabIconDefault: neutral500,
    tabIconSelected: actifyPrimary,
    
    // Brand Colors
    primary: actifyPrimary,
    secondary: actifySecondary,
    accent: actifyAccent,
    success: actifySuccess,
    warning: actifyWarning,
    error: actifyError,
    
    // Surface Colors
    surface: '#ffffff',
    surfaceVariant: "#e2e8f0",
    surfaceElevated: '#ffffff',
    
    // Text Colors
    textPrimary: neutral900,
    textSecondary: neutral600,
    textTertiary: neutral500,
    textInverse: '#ffffff',
    
    // Border Colors
    border: neutral200,
    borderStrong: neutral300,
    
    // Status Colors
    statusSuccess: actifySuccess,
    statusWarning: actifyWarning,
    statusError: actifyError,
    statusInfo: actifyAccent,
    
    // Gradient Colors
    gradientStart: actifyPrimary,
    gradientEnd: actifySecondary,
    
    // Card Colors
    cardBackground: '#ffffff',
    cardBorder: neutral200,
    cardShadow: 'rgba(0, 0, 0, 0.05)',
    
    // Interactive Colors
    buttonPrimary: actifyPrimary,
    buttonSecondary: neutral100,
    buttonText: '#ffffff',
    buttonTextSecondary: neutral700,
    
    // Data Visualization Colors
    chartPrimary: actifyPrimary,
    chartSecondary: actifySecondary,
    chartAccent: actifyAccent,
    chartSuccess: actifySuccess,
    chartWarning: actifyWarning,
    chartError: actifyError,
  },
  dark: {
    text: neutral100,
    background: neutral900,
    tint: actifyAccent,
    icon: neutral400,
    tabIconDefault: neutral500,
    tabIconSelected: actifyAccent,
    
    // Brand Colors
    primary: actifyAccent,
    secondary: actifySecondary,
    accent: actifyPrimary,
    success: actifySuccess,
    warning: actifyWarning,
    error: actifyError,
    
    // Surface Colors
    surface: neutral800,
    surfaceVariant: neutral700,
    surfaceElevated: neutral800,
    
    // Text Colors
    textPrimary: neutral100,
    textSecondary: neutral400,
    textTertiary: neutral500,
    textInverse: neutral900,
    
    // Border Colors
    border: neutral700,
    borderStrong: neutral600,
    
    // Status Colors
    statusSuccess: actifySuccess,
    statusWarning: actifyWarning,
    statusError: actifyError,
    statusInfo: actifyAccent,
    
    // Gradient Colors
    gradientStart: actifyAccent,
    gradientEnd: actifySecondary,
    
    // Card Colors
    cardBackground: neutral800,
    cardBorder: neutral700,
    cardShadow: 'rgba(0, 0, 0, 0.3)',
    
    // Interactive Colors
    buttonPrimary: actifyAccent,
    buttonSecondary: neutral700,
    buttonText: '#ffffff',
    buttonTextSecondary: neutral300,
    
    // Data Visualization Colors
    chartPrimary: actifyAccent,
    chartSecondary: actifySecondary,
    chartAccent: actifyPrimary,
    chartSuccess: actifySuccess,
    chartWarning: actifyWarning,
    chartError: actifyError,
  },
};

// Export individual color constants for easy access
export const BrandColors = {
  primary: actifyPrimary,
  secondary: actifySecondary,
  accent: actifyAccent,
  success: actifySuccess,
  warning: actifyWarning,
  error: actifyError,
};

export const NeutralColors = {
  50: neutral50,
  100: neutral100,
  200: neutral200,
  300: neutral300,
  400: neutral400,
  500: neutral500,
  600: neutral600,
  700: neutral700,
  800: neutral800,
  900: neutral900,
};