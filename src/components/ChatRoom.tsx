"use client";
import { Box, Button, Paper,Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { useSocket } from "@/contexts/socket-context";
import { MessageSearch } from "./message-search";
import { ChatHeader } from "./chat/ChatHeader";
import { ChatMessages } from "./chat/ChatMessages";
import { ChatSearchResults } from "./chat/ChatSearchResults";
import { MessageInput } from "./chat/MessageInput";
import { VoiceRecorder } from "./chat/VoiceRecorder";
import { User } from "@/services/api.service";
import { MessageItem } from "./message";

export const ChatRoom = () => {
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedMessageId, setHighlightedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const { sendMessage, messages, currentRoomId, joinRoom } = useSocket();

  const storedUser = typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = storedUser ? (JSON.parse(storedUser) as User) : null;

  const sortedMessages = [...messages].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateA - dateB;
  });
  // At the top of your component

  const scrollToMessage = (id: string) => {
    const el = messageRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedMessageId(id);
      setTimeout(() => setHighlightedMessageId(null), 2000);
    }
  };

  const filteredMessages = searchQuery
    ? sortedMessages.filter((msg) => {
        const content = msg.content?.toLowerCase() || "";
        const username = msg.sender?.username?.toLowerCase() || "";
        const query = searchQuery.toLowerCase();
        return content.includes(query) || username.includes(query);
      })
    : [];
    const [visibleResults, setVisibleResults] = useState(5);

// Reset visible results when search changes
useEffect(() => {
  setVisibleResults(5);
}, [filteredMessages]);

  useEffect(() => {
    if (!currentRoomId) joinRoom("");
  }, [currentRoomId, joinRoom]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message);
      setMessage("");
    }
  };

  return (
    <Box flex={1} pt={5}>
      <Paper sx={{ height: "calc(100vh - 40px)", display: "flex", flexDirection: "column" }}>
      
        
        <ChatHeader roomId={ currentRoomId? currentRoomId?.toString():''} messageCount={messages?.length ?? 0} />
          <MessageSearch onSearch={setSearchQuery} />
          {searchQuery && (
            <Box mb={2}>
            <Typography variant="subtitle2" gutterBottom>
              Search Results:
            </Typography>
            {filteredMessages.slice(0, visibleResults).map((msg) => (
              <Box
                key={msg.id}
                onClick={() => msg.id && scrollToMessage(msg.id)}
                sx={{
                  p: 1,
                  mb: 1,
                  bgcolor: "#f5f5f5",
                  borderRadius: 1,
                  cursor: "pointer",
                  "&:hover": { bgcolor: "#ba6129" },
                }}
              >
                <MessageItem message={msg} isOwn={true} />
              </Box>
            ))}
            {filteredMessages.length > visibleResults && (
              <Button
                variant="text"
                size="small"
                onClick={() => setVisibleResults(prev => prev + 5)}
                sx={{ mt: 1 }}
              >
                Show More ({filteredMessages.length - visibleResults} remaining)
              </Button>
            )}
          </Box>
          )}

        <Box flex={1} overflow="auto" p={2}>

          
          <ChatMessages
            messages={sortedMessages}
            user={user}
            highlightedMessageId={highlightedMessageId}
            messageRefs={messageRefs}
          />
          
          <div ref={messagesEndRef} />
        </Box>
        <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
          <MessageInput message={message} setMessage={setMessage} onSubmit={handleSubmit}>
            <VoiceRecorder />
          </MessageInput>
        </Box>
      </Paper>
    </Box>
  );
};
