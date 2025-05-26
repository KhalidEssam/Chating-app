import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AppThemeProvider } from '@/contexts/theme-context';
import { SocketProvider } from '@/contexts/socket-context';
import { ThemeProvider } from '@/components/theme-provider';

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
          <ThemeProvider> {/* <-- MUI theme uses context's darkMode */}
            <SocketProvider>
              {children}
            </SocketProvider>
          </ThemeProvider>
        </AppThemeProvider>

      </body>
    </html>
  );
}
