"use client";

import { useState, useEffect } from 'react';
import { SnackbarProvider, closeSnackbar } from 'notistack';
import { X } from 'lucide-react';
import SideNav from './_components/SideNav';
import Header from './_components/Header';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Button } from "@/components/ui/button";
import { SessionProvider } from 'next-auth/react';

export default function AdminLayout({ children }) {
  const [mounted, setMounted] = useState(false);
  const [sideNavCollapsed, setSideNavCollapsed] = useState(false);

  // Custom theme for notistack to match shadcn/ui design
  const theme = createTheme({
    palette: {
      primary: { main: '#3b82f6' },
      error: { main: '#ef4444' },
      success: { main: '#22c55e' },
      warning: { main: '#f59e0b' },
      info: { main: '#3b82f6' },
    },
    components: {
      MuiSnackbarContent: {
        styleOverrides: {
          root: {
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
          },
        },
      },
    },
  });

  // Only render layout after initial mount to prevent hydration errors
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  // Custom action for closing snackbars
  const notistackAction = snackbarId => (
    <Button 
      variant="ghost" 
      size="sm" 
      className="h-8 w-8 p-0" 
      onClick={() => closeSnackbar(snackbarId)}
    >
      <X className="h-4 w-4" />
    </Button>
  );

  const handleSideNavToggle = () => {
    setSideNavCollapsed(!sideNavCollapsed);
  };

  return (
    <ThemeProvider theme={theme}>
      <SnackbarProvider 
        maxSnack={3} 
        autoHideDuration={4000}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        action={notistackAction}
        classes={{
          variantSuccess: 'bg-green-500',
          variantError: 'bg-red-500',
          variantWarning: 'bg-yellow-500',
          variantInfo: 'bg-blue-500',
        }}
      >
        <div className="min-h-screen bg-slate-50 flex">
          <SideNav 
            collapsed={sideNavCollapsed}
          />
          <div className="flex-1 flex flex-col min-h-screen">
            <Header 
              onMenuToggle={handleSideNavToggle}
              isCollapsed={sideNavCollapsed}
            />
            <main className="flex-1 transition-all duration-300 p-4 md:p-6">
              {children}
            </main>
          </div>
        </div>
      </SnackbarProvider>
    </ThemeProvider>
  );
}