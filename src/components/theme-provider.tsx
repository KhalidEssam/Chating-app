'use client';

import React from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useTheme } from '@/contexts/theme-context'; // your dark mode context

export function ThemeProvider({ children, themeMode }: { children: React.ReactNode; themeMode: boolean }) {
  const { isDarkMode } = useTheme();

  const theme = React.useMemo(() => {
    return createTheme({
      palette: {
        mode: themeMode ? 'dark' : 'light',
        primary: { main: '#1976d2' },
        secondary: { main: '#dc004e' },
      },
      typography: {
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
      },
    });
  }, [isDarkMode]);

  return (
    <MuiThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
