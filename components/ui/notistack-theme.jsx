"use client";

import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';

// Customize to match your shadcn/ui theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#3b82f6', // Blue color similar to shadcn/ui
    },
    error: {
      main: '#ef4444', // Red for error
    },
    success: {
      main: '#22c55e', // Green for success
    },
    warning: {
      main: '#f59e0b', // Amber for warning
    },
    info: {
      main: '#3b82f6', // Blue for info
    },
  },
  components: {
    MuiSnackbarContent: {
      styleOverrides: {
        root: {
          borderRadius: '6px',
          fontSize: '14px',
        },
      },
    },
  },
});

export function NotistackProvider({ children }) {
  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        autoHideDuration={3000}
        dense
        preventDuplicate
        classes={{
          variantSuccess: 'bg-green-500',
          variantError: 'bg-red-500',
          variantWarning: 'bg-yellow-500',
          variantInfo: 'bg-blue-500',
        }}
      >
        {children}
      </SnackbarProvider>
    </ThemeProvider>
  );
}