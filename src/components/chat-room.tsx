"use client";

import React, { useState, useEffect, useRef } from "react";
import { Box, Paper, TextField, IconButton, Typography } from "@mui/material";
import { Send } from "@mui/icons-material";
import { useSocket } from "@/contexts/socket-context";
import { MessageItem } from "./message";
import {User} from "@/services/api.service"

interface ChatRoomProps {}

export const ChatRoom = ({}: ChatRoomProps) => {
  const [message, setMessage] = useState("");
  const { sendMessage, messages, currentRoomId: currentRoom, joinRoom } = useSocket();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!currentRoom) {
      joinRoom("");
    }
  }, [currentRoom, joinRoom]);

  useEffect(() => {
    console.log("Messages state:", messages);
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
      <Paper
        sx={{
          height: "calc(100vh - 40px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box p={2}>
          <Typography variant="h6" fontWeight="bold">
            {currentRoom ?? "No room selected"}
          </Typography>
          <Typography variant="caption" color="textSecondary">
            Messages count: {messages?.length ?? 0}
          </Typography>
        </Box>
        <Box flex={1} overflow="auto" p={2}>
          {messages?.map((msg, index) => {
              const storedUser = localStorage.getItem('user')
              if (!storedUser) return
            
              const user= JSON.parse(storedUser) as User;
              const isOwn = msg?.sender?.id === user?.id;
              
            console.log('message' ,msg.sender?.id)
            if (!msg ) return null;
            return (
              <Box
                key={msg.id ?? index}
                display="flex"
                alignItems="center"
                gap={1}
                justifyContent={isOwn ? "flex-end" : "flex-start"}
              >
                {!isOwn && (
                  <Typography variant="body2" color="textSecondary" >
                    {msg.sender?.username }
                  </Typography>
                )}
                <MessageItem
                  message={msg}
                  isOwn={isOwn} // <-- Fix here
                />
                {isOwn && (
                  <Typography variant="body2" color="textSecondary">
                    {msg.sender?.username || 'me' }
                  </Typography>
                )}
              </Box>
            );
          })}

          <div ref={messagesEndRef} />
        </Box>
        <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
              <TextField
                fullWidth
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                variant="outlined"
                aria-label="Message input"
              />
              <IconButton
                type="submit"
                color="primary"
                disabled={!message.trim()}
              >
                <Send />
              </IconButton>
            </Box>
          </form>
        </Box>
      </Paper>
    </Box>
  );
};
