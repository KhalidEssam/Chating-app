'use client';

import { useTheme } from '@/contexts/theme-context';
import { ThemeProvider } from './theme-provider';

export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { isDarkMode } = useTheme();
  
  return (
    <ThemeProvider themeMode={isDarkMode}>
      {children}
    </ThemeProvider>
  );
} 