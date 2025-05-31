import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppThemeProvider, ThemeContextType } from '@/contexts/theme-context';
import { SocketProvider } from '@/contexts/socket-context';
import { ThemeProvider } from '@/components/theme-provider';
import { ThemeProviderWrapper } from '@/components/theme-provider-wrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Chat App',
  description: 'A real-time chat application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className + ' overflow-hidden'}>
        <AppThemeProvider>
          <ThemeProviderWrapper>
            <SocketProvider>
              {children}
            </SocketProvider>
          </ThemeProviderWrapper>
        </AppThemeProvider>

      </body>
    </html>
  );
}
