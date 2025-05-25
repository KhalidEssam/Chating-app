'use client';

import { ChatRoom } from '@/components/chat-room';
import { ChatSidebar } from '@/components/chat-sidebar';
import { UserIdentification } from '@/components/user-identification';
import { useSocket } from '@/contexts/socket-context';
import { useEffect } from 'react';

export default function Home() {
  const { isIdentified } = useSocket();
  
  // Force re-render when isIdentified changes
  useEffect(() => {
    console.log('isIdentified changed:', isIdentified);
  }, [isIdentified]);

  if (!isIdentified) {
    return <UserIdentification />;
  }

  return (
    <main className="flex min-h-screen bg-gray-50">
      <ChatSidebar />
      <ChatRoom />
    </main>
  );
}
