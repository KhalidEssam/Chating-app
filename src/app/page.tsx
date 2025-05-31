'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChatRoom } from '@/components/chat-room';
import { ChatSidebar } from '@/components/chat-sidebar';
import { ChatToolbar } from '@/components/chat-toolbar';
import { useSocket } from '@/contexts/socket-context';
import { apiService } from '@/services/api.service';

export default function Home() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { isIdentified, error, initialized } = useSocket();

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      if (!token?.trim()) {
        router.push('/login');
        return;
      }

      try {
        await apiService.getUsers();
        setLoading(false);
      } catch (err) {
        console.error('Token validation failed:', err);
        localStorage.removeItem('token');
        router.push('/login');
      }
    };

    if (token !== null) {
      checkAuth();
    }
  }, [token, router]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <main className="flex min-h-screen flex-col">
  <ChatToolbar />
  <div style={{ display: 'flex', flex: 1, marginTop: '100px' }}>
    <ChatSidebar />
    <ChatRoom />
  </div>
</main>

  );
}
