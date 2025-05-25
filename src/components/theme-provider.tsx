'use client';

import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useState, useEffect } from 'react';
import React from 'react';

interface ThemeProviderProps {
  children: React.ReactNode;
}

const createMuiTheme = () => createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
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

export function ThemeProvider({
  children,
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState(createMuiTheme());

  useEffect(() => {
    setTheme(createMuiTheme());
  }, []);

  return (
    <MuiThemeProvider theme={theme} {...props}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
