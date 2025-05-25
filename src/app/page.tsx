'use client';

import { ChatRoom } from '@/components/chat-room';
import { ChatSidebar } from '@/components/chat-sidebar';

export default function Home() {
  return (
    <main className="flex min-h-screen bg-gray-50">
      <ChatSidebar />
      <ChatRoom />
    </main>
  );
}
