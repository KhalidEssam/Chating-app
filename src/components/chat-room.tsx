"use client";

import React, { useState, useEffect, useRef } from "react";
import { Box, Paper, TextField, IconButton, Typography } from "@mui/material";
import { Send, Mic, Stop, PlayArrow, Pause } from "@mui/icons-material";
import { useSocket } from "@/contexts/socket-context";
import { MessageItem } from "./message";
import { MessageSearch } from "./message-search";
import { User } from "@/services/api.service";

interface ChatRoomProps {}

export const ChatRoom = ({}: ChatRoomProps) => {
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [highlightedMessageId, setHighlightedMessageId] = useState<
    string | null
  >(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [duration, setDuration] = useState(0);

  const intervalRef = useRef<NodeJS.Timeout | null>(null); // added

  const {
    sendMessage,
    messages,
    currentRoomId: currentRoom,
    joinRoom,
    saveVoiceRecord,
  } = useSocket();

  const sortedMessages = [...messages].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return dateA - dateB;
  });

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const options = { mimeType: 'audio/webm' };

      const recorder = new MediaRecorder(stream , options);

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((prev) => [...prev, event.data]);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };

      recorder.onstart = () => {
        setDuration(0);
        intervalRef.current = setInterval(() => {
          setDuration((prev) => prev + 0.1);
        }, 100);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setIsPaused(false);
    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.pause();
      setIsPaused(true);
    }
  };

  const resumeRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.resume();
      setIsPaused(false);
    }
  };

  const stopRecording = async () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setIsRecording(false);

      if (audioChunks.length > 0) {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, {
          type: "audio/webm",
        });

        if (currentRoom && duration > 0) {
          const mimeType = audioBlob.type || "audio/webm"; // Fallback to webm
          console.log("audioBlob.type", audioBlob.type)
          try {
            await saveVoiceRecord(audioFile, duration, mimeType, "4a2c5e7f-28a7-4628-b1e7-68dc5d7e2c12");
          } catch (error) {
            console.error("Error saving voice message:", error);
          }
        }
      }

      setAudioChunks([]);
      setDuration(0);
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

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const storedUser =
    typeof window !== "undefined" ? localStorage.getItem("user") : null;
  const user = storedUser ? (JSON.parse(storedUser) as User) : null;

  useEffect(() => {
    if (!currentRoom) {
      joinRoom("");
    }
  }, [currentRoom, joinRoom]);

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

  const scrollToMessage = (id: string) => {
    const el = messageRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedMessageId(id);
      setTimeout(() => setHighlightedMessageId(null), 2000);
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
          <MessageSearch onSearch={setSearchQuery} />

          {searchQuery && (
            <Box mb={2}>
              <Typography variant="subtitle2" gutterBottom>
                Search Results:
              </Typography>
              {filteredMessages.map((msg) => (
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
            </Box>
          )}

          {sortedMessages.map((msg, index) => {
            if (!user) return null;
            const isOwn = msg?.sender?.id === user?.id;

            return (
              <Box
                key={msg.id ?? index}
                ref={(el: HTMLDivElement | null) => {
                  if (msg.id) messageRefs.current[msg.id] = el;
                }}
                display="flex"
                alignItems="center"
                gap={1}
                justifyContent={isOwn ? "flex-end" : "flex-start"}
                sx={{
                  transition: "background-color 0.3s ease",
                  bgcolor:
                    msg.id === highlightedMessageId ? "#fff9c4" : "transparent",
                  borderRadius: 1,
                  py: 0.5,
                  px: 1,
                }}
              >
                {!isOwn &&   (
                  <Typography variant="body2" color="textSecondary">
                    {msg.sender?.username}
                  </Typography>
                ) }
                <MessageItem message={msg} isOwn={isOwn} />
                {isOwn &&
                  <Typography variant="body2" color="textSecondary">
                    {msg.sender?.username || "me"}
                  </Typography>
                  }
                
              </Box>
            );
          })}

          <div ref={messagesEndRef} />
        </Box>

        <Box sx={{ p: 2, borderTop: 1, borderColor: "divider" }}>
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: "flex",
              gap: 1,
              p: 2,
              bgcolor: "background.paper",
            }}
          >
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <IconButton
              type="submit"
              color="primary"
              disabled={!message.trim()}
            >
              <Send />
            </IconButton>
            <IconButton
              color="primary"
              onClick={isRecording ? stopRecording : startRecording}
              disabled={!currentRoom}
            >
              {isRecording ? <Stop /> : <Mic />}
            </IconButton>
            {isRecording && (
              <IconButton
                color="primary"
                onClick={isPaused ? resumeRecording : pauseRecording}
              >
                {isPaused ? <PlayArrow /> : <Pause />}
              </IconButton>
            )}
            {duration > 0 && (
              <Typography variant="caption" color="textSecondary">
                {duration.toFixed(1)}s
              </Typography>
            )}
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};




