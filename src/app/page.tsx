// 'use client';

// import { useEffect } from 'react';
// import { ChatRoom } from '@/components/chat-room';
// import { ChatSidebar } from '@/components/chat-sidebar';
// import { UserIdentification } from '@/components/user-identification';
// import { useSocket } from '@/contexts/socket-context';
// import { ChatToolbar } from '@/components/chat-toolbar';
// import { apiService } from '@/services/api.service';
// import { Socket } from 'socket.io-client';
// import { Message } from '@/services/api.service';

// interface SocketContextType {
//   socketRef: React.RefObject<Socket | null>;
//   isIdentified: boolean;
//   messages: Message[];
//   currentRoom: string | null;
//   user: {
//     id: string;
//     name: string;
//     phoneNumber: string;
//   };
//   sendMessage: (content: string) => void;
//   joinRoom: (roomId: string) => void;
//   leaveRoom: () => void;
//   error: string | null;
// }

// export default function Home() {
//   const token = localStorage.getItem('token');
//   const { isIdentified, error, initialized } = useSocket();

//   // Check token on mount
//   useEffect(() => {
//     const checkAuth = async () => {
//       if (!token && !window.location.href.includes('/login')) {
//         window.location.href = '/login';
//         return;
//       }

//       try {
//         await apiService.getUsers();
//       } catch (err) {
//         console.error('Token validation failed:', err);
//         localStorage.removeItem('token');
//         window.location.href = '/login';
//       }
//     };

//     checkAuth();
//   }, [token]);

//   // Force re-render when isIdentified changes
//   useEffect(() => {
//     console.log('isIdentified changed:', isIdentified);
//   }, [isIdentified]);

//   // Show loading state while initializing
//   if (!initialized) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
//       </div>
//     );
//   }

//   if (!isIdentified) {
//     return <UserIdentification />;
//   }

//   return (
//     <main className="flex min-h-screen bg-gray-50 dark:bg-gray-700 ">
//       <ChatToolbar />
//       <ChatSidebar />
//       <ChatRoom />
//     </main>
//   );
// }


'use client';

import { useEffect, useState } from 'react';
import { ChatRoom } from '@/components/chat-room';
import { ChatSidebar } from '@/components/chat-sidebar';
import { UserIdentification } from '@/components/user-identification';
import { useSocket } from '@/contexts/socket-context';
import { ChatToolbar } from '@/components/chat-toolbar';
import { apiService } from '@/services/api.service';

export default function Home() {
  const [token, setToken] = useState<string | null>(null);
  const { isIdentified, error, initialized } = useSocket();

  // Load token once on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
  }, []);

  // Validate token after it's set
  useEffect(() => {
    const checkAuth = async () => {
      if (!token && !window.location.href.includes('/login')) {
        window.location.href = '/login';
        return;
      }

      try {
        await apiService.getUsers(); // Auth test
      } catch (err) {
        console.error('Token validation failed:', err);
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    };

    if (token !== null) {
      checkAuth();
    }
  }, [token]);

  // Wait for both socket init and token readiness
  // if (!initialized || token === null) {
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
  //     </div>
  //   );
  // }

  // Render identification if not yet identified
  // if (!isIdentified) {
  //   return <UserIdentification />;
  // }

  // Main UI when fully authenticated and identified
  return (
    <main className="flex min-h-screen bg-gray-50 dark:bg-gray-700">
      <ChatToolbar />
      <ChatSidebar />
      <ChatRoom />
    </main>
  );
}

