'use client';

import { useTheme } from '@/contexts/theme-context';
import { ThemeProvider } from './theme-provider';
import { ReactNode } from 'react';

export function ThemeProviderWrapper({ children }: { children: ReactNode }) {
  const { isDarkMode } = useTheme();
  
  return (
    <ThemeProvider themeMode={isDarkMode}>
      {children}
    </ThemeProvider>
  );
}
