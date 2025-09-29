// theme.js - StayOps Comprehensive Theme Configuration
import { createTheme } from '@mui/material/styles';

// Color Palette inspired by modern hotel industry and IFS design principles
const colors = {
  // Primary Colors - Professional hotel industry blues
  primary: {
    50: '#e8f4fd',
    100: '#d1e9fb',
    200: '#a3d3f7',
    300: '#74bdf3',
    400: '#46a7ef',
    500: '#1976d2', // Main primary
    600: '#1565c0',
    700: '#0d47a1',
    800: '#0a3d91',
    900: '#053581',
  },
  
  // Secondary Colors - Warm hospitality gold/amber
  secondary: {
    50: '#fff8e1',
    100: '#ffecb3',
    200: '#ffe082',
    300: '#ffd54f',
    400: '#ffca28',
    500: '#ff9800', // Main secondary
    600: '#fb8c00',
    700: '#f57c00',
    800: '#ef6c00',
    900: '#e65100',
  },
  
  // Status Colors
  success: {
    50: '#e8f5e8',
    100: '#c8e6c9',
    200: '#a5d6a7',
    300: '#81c784',
    400: '#66bb6a',
    500: '#4caf50', // Available rooms, successful operations
    600: '#43a047',
    700: '#388e3c',
    800: '#2e7d32',
    900: '#1b5e20',
  },
  
  warning: {
    50: '#fff3e0',
    100: '#ffe0b2',
    200: '#ffcc80',
    300: '#ffb74d',
    400: '#ffa726',
    500: '#ff9800', // Maintenance needed, pending requests
    600: '#fb8c00',
    700: '#f57c00',
    800: '#ef6c00',
    900: '#e65100',
  },
  
  error: {
    50: '#ffebee',
    100: '#ffcdd2',
    200: '#ef9a9a',
    300: '#e57373',
    400: '#ef5350',
    500: '#f44336', // Overdue, errors, critical issues
    600: '#e53935',
    700: '#d32f2f',
    800: '#c62828',
    900: '#b71c1c',
  },
  
  info: {
    50: '#e1f5fe',
    100: '#b3e5fc',
    200: '#81d4fa',
    300: '#4fc3f7',
    400: '#29b6f6',
    500: '#03a9f4', // Information, notifications
    600: '#039be5',
    700: '#0288d1',
    800: '#0277bd',
    900: '#01579b',
  },
  
  // Neutral Colors
  grey: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#eeeeee',
    300: '#e0e0e0',
    400: '#bdbdbd',
    500: '#9e9e9e',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  
  // Background Colors
  background: {
    default: '#fafafa',
    paper: '#ffffff',
    sidebar: '#1e293b',
    headerBar: '#ffffff',
    cardHover: '#f8fafc',
  },
  
  // Text Colors
  text: {
    primary: '#1a202c',
    secondary: '#4a5568',
    disabled: '#a0aec0',
    light: '#ffffff',
  },
  
  // Hotel Specific Colors
  hotel: {
    occupied: '#ef4444',      // Red for occupied rooms
    available: '#10b981',     // Green for available rooms
    maintenance: '#f59e0b',   // Amber for maintenance
    cleaning: '#6366f1',      // Indigo for cleaning
    reserved: '#8b5cf6',      // Purple for reserved
    checkout: '#ec4899',      // Pink for checkout pending
    vip: '#f59e0b',          // Gold for VIP guests
  }
};

// Typography Configuration
const typography = {
  fontFamily: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
  
  h1: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },
  h3: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: '1.125rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h6: {
    fontSize: '1rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  subtitle1: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  body1: {
    fontSize: '1rem',
    fontWeight: 400,
    lineHeight: 1.6,
  },
  body2: {
    fontSize: '0.875rem',
    fontWeight: 400,
    lineHeight: 1.6,
  },
  caption: {
    fontSize: '0.75rem',
    fontWeight: 400,
    lineHeight: 1.5,
    letterSpacing: '0.03em',
  },
  overline: {
    fontSize: '0.75rem',
    fontWeight: 600,
    lineHeight: 1.5,
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
};

// Shadows Configuration
const shadows = [
  'none',
  '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
  '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
  '0px 4px 6px rgba(0, 0, 0, 0.1), 0px 2px 4px rgba(0, 0, 0, 0.06)',
  '0px 10px 15px rgba(0, 0, 0, 0.1), 0px 4px 6px rgba(0, 0, 0, 0.05)',
  '0px 20px 25px rgba(0, 0, 0, 0.1), 0px 10px 10px rgba(0, 0, 0, 0.04)',
  '0px 25px 50px rgba(0, 0, 0, 0.25)',
  // ... continue with remaining shadows
  ...Array(18).fill('0px 25px 50px rgba(0, 0, 0, 0.25)'),
];

// Create the main theme
const stayOpsTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: colors.primary[500],
      light: colors.primary[300],
      dark: colors.primary[700],
      contrastText: '#ffffff',
    },
    secondary: {
      main: colors.secondary[500],
      light: colors.secondary[300],
      dark: colors.secondary[700],
      contrastText: '#ffffff',
    },
    error: {
      main: colors.error[500],
      light: colors.error[300],
      dark: colors.error[700],
    },
    warning: {
      main: colors.warning[500],
      light: colors.warning[300],
      dark: colors.warning[700],
    },
    info: {
      main: colors.info[500],
      light: colors.info[300],
      dark: colors.info[700],
    },
    success: {
      main: colors.success[500],
      light: colors.success[300],
      dark: colors.success[700],
    },
    grey: colors.grey,
    background: {
      default: colors.background.default,
      paper: colors.background.paper,
    },
    text: {
      primary: colors.text.primary,
      secondary: colors.text.secondary,
      disabled: colors.text.disabled,
    },
    // Custom hotel colors
    hotel: colors.hotel,
  },
  
  typography,
  shadows,
  
  shape: {
    borderRadius: 8,
  },
  
  spacing: 8,
  
  components: {
    // App Bar customization
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: colors.background.headerBar,
          color: colors.text.primary,
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
          borderBottom: `1px solid ${colors.grey[200]}`,
        },
      },
    },
    
    // Drawer customization
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: colors.background.sidebar,
          color: colors.text.light,
          borderRight: 'none',
        },
      },
    },
    
    // Card customization
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
          borderRadius: 12,
          '&:hover': {
            backgroundColor: colors.background.cardHover,
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
            transform: 'translateY(-2px)',
            transition: 'all 0.2s ease-in-out',
          },
        },
      },
    },
    
    // Button customization
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.875rem',
          padding: '8px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
          },
        },
        contained: {
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    
    // Chip customization for room status
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500,
          fontSize: '0.75rem',
        },
      },
    },
    
    // Table customization
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: colors.grey[50],
          '& .MuiTableCell-head': {
            fontWeight: 600,
            color: colors.text.primary,
            borderBottom: `2px solid ${colors.grey[200]}`,
          },
        },
      },
    },
    
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: colors.background.cardHover,
          },
        },
      },
    },
    
    // Paper customization
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    
    // Text Field customization
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
  },
});

// Custom theme variants for different user roles
export const createRoleBasedTheme = (role) => {
  const baseTheme = stayOpsTheme;
  
  switch (role) {
    case 'receptionist':
      return createTheme({
        ...baseTheme,
        palette: {
          ...baseTheme.palette,
          primary: {
            main: colors.primary[600],
            light: colors.primary[400],
            dark: colors.primary[800],
          },
        },
      });
      
    case 'manager':
      return createTheme({
        ...baseTheme,
        palette: {
          ...baseTheme.palette,
          primary: {
            main: colors.secondary[600],
            light: colors.secondary[400],
            dark: colors.secondary[800],
          },
        },
      });
      
    case 'finance':
      return createTheme({
        ...baseTheme,
        palette: {
          ...baseTheme.palette,
          primary: {
            main: colors.success[600],
            light: colors.success[400],
            dark: colors.success[800],
          },
        },
      });
      
    case 'staff':
      return createTheme({
        ...baseTheme,
        palette: {
          ...baseTheme.palette,
          primary: {
            main: colors.info[600],
            light: colors.info[400],
            dark: colors.info[800],
          },
        },
      });
      
    default:
      return baseTheme;
  }
};

// Utility functions for theme colors
export const getStatusColor = (status) => {
  const statusColors = {
    available: colors.hotel.available,
    occupied: colors.hotel.occupied,
    maintenance: colors.hotel.maintenance,
    cleaning: colors.hotel.cleaning,
    reserved: colors.hotel.reserved,
    checkout: colors.hotel.checkout,
    vip: colors.hotel.vip,
  };
  return statusColors[status] || colors.grey[500];
};

// Export the theme and colors
export { stayOpsTheme as default, colors };

// Usage example:
// import stayOpsTheme, { createRoleBasedTheme, getStatusColor } from './theme';
// const receptionistTheme = createRoleBasedTheme('receptionist');