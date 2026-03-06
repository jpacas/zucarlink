// src/theme/theme.ts
import { createTheme } from '@mui/material/styles'

const theme = createTheme({
  palette: {
    primary: {
      main: '#E45D45',
      dark: '#D04C36',
    },
    secondary: {
      main: '#2F5D8C',
    },
    text: {
      primary: '#1E1E1E',
      secondary: '#5E6470',
    },
    background: {
      default: '#F7F8FA',
      paper: '#FFFFFF',
    },
    divider: '#E7E9EE',
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Poppins", "Inter", "Helvetica", "Arial", sans-serif',
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.15,
    },
    h2: {
      fontFamily: '"Poppins", "Inter", "Helvetica", "Arial", sans-serif',
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.2,
    },
    h3: {
      fontFamily: '"Poppins", "Inter", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.25,
    },
    h4: {
      fontFamily: '"Poppins", "Inter", "Helvetica", "Arial", sans-serif',
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.3,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 999,
          fontWeight: 600,
        },
        sizeLarge: {
          padding: '12px 28px',
        },
        sizeMedium: {
          padding: '10px 22px',
        },
        containedPrimary: {
          boxShadow: '0 8px 16px rgba(228, 93, 69, 0.24)',
          '&:hover': {
            boxShadow: '0 12px 22px rgba(228, 93, 69, 0.28)',
          },
        },
        outlinedPrimary: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: '1px solid #E7E9EE',
          boxShadow: '0 8px 24px rgba(16, 24, 40, 0.08)',
          backgroundImage: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 16,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: '#FFFFFF',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#D04C36',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#E45D45',
            borderWidth: 2,
          },
        },
        notchedOutline: {
          borderColor: '#E7E9EE',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: '#5E6470',
          '&.Mui-focused': {
            color: '#E45D45',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          color: '#1E1E1E',
          boxShadow: 'none',
          borderBottom: '1px solid #E7E9EE',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 600,
        },
      },
    },
  },
})

export default theme
