// Universal Design System for StayOps Receptionist Portal
export const theme = {
  // Color Palette
  colors: {
    // Primary Colors
    primary: '#2c2c2e',
    primaryHover: '#b8956a',
    primaryLight: '#f5f2ee',
    
    // Neutral Colors
    background: '#faf8f5',
    backgroundAlt: '#fff',
    border: '#e8e3dc',
    borderLight: '#f0ede8',
    
    // Text Colors
    textPrimary: '#2c2c2e',
    textSecondary: '#8b8680',
    textTertiary: '#c4bbb0',
    textWhite: '#fff',
    
    // Status Colors
    statusAvailable: '#2c2c2e',
    statusConfirmed: '#6b5d4f',
    statusOccupied: '#8b8680',
    statusCheckOut: '#b8956a',
    statusPending: '#d4a574',
    statusCancelled: '#c17767',
    
    // Alert Colors
    error: '#c17767',
    errorBg: '#faf5f2',
    errorBorder: '#e8dcd5',
    success: '#6b8e23',
    warning: '#d4a574',
  },
  
  // Typography
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: {
      xs: '11px',
      sm: '12px',
      base: '13px',
      md: '14px',
      lg: '16px',
      xl: '18px',
      xxl: '20px',
    },
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
    },
    letterSpacing: {
      tight: '-0.3px',
      normal: '0',
      wide: '0.2px',
      wider: '0.5px',
    },
  },
  
  // Spacing
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    xxl: '24px',
    xxxl: '32px',
  },
  
  // Border Radius
  borderRadius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
  },
  
  // Shadows
  shadows: {
    sm: '0 1px 3px rgba(0,0,0,0.08)',
    md: '0 4px 12px rgba(0,0,0,0.08)',
    lg: '0 8px 24px rgba(0,0,0,0.12)',
  },
  
  // Transitions
  transitions: {
    fast: 'all 0.15s ease',
    normal: 'all 0.2s ease',
    slow: 'all 0.3s ease',
  },
  
  // Z-Index
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 9998,
    modal: 9999,
    tooltip: 10000,
  },
};

export default theme;