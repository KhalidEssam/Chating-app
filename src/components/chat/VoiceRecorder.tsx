import { useEffect, useRef, useState } from "react";
import { IconButton, Typography } from "@mui/material";
import { Mic, Stop, Pause, PlayArrow } from "@mui/icons-material";
import { useSocket } from "@/contexts/socket-context";

export const VoiceRecorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [duration, setDuration] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { currentRoomId, saveVoiceRecord } = useSocket();

  const startInterval = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (isPaused) return;
  
    const id = setInterval(() => {
      setDuration((prev) => prev + 0.1);
    }, 100);
  
    intervalRef.current = id; // ✅ store interval so we can clear it
  };
  
  const stopInterval = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };
  
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const options = { mimeType: "audio/webm" };
      const recorder = new MediaRecorder(stream, options);
  
      // Clear previous chunks
      audioChunksRef.current = [];
  
      recorder.start();
      setMediaRecorder(recorder); // This will trigger the `useEffect` hook with the .onstop logic
      setIsRecording(true);
      setIsPaused(false);
      startInterval(); // your interval to update duration
    } catch (err) {
      console.error("Recording failed:", err);
    }
  };
  

  const stopRecording = () => {
    if (!mediaRecorder) return;

    setIsRecording(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    mediaRecorder.stop(); // this will trigger the `onstop` handler
  };

  useEffect(() => {
    if (!mediaRecorder) return;

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunksRef.current.push(event.data);
      }
    };

    mediaRecorder.onstop = async () => {
      const stream = mediaRecorder.stream;
      stream.getTracks().forEach((t) => t.stop());
      console.log("audioChunksRef.current.length",audioChunksRef.current.length , "currentRoomId", currentRoomId , "duration " ,duration)
      clearInterval(0);
      stopInterval();
      setIsPaused(true);


      

      if (audioChunksRef.current.length && currentRoomId && duration > 0) {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const file = new File([blob], `voice-${Date.now()}.webm`, {
          type: "audio/webm",
        });
        console.log("audioChunksRef.current.length",audioChunksRef.current.length)


        try {
          await saveVoiceRecord(
            file,
            duration,
            blob.type,
            currentRoomId.toString()
          );
        } catch (err) {
          console.error("Failed to save voice message", err);
        }
      }
      setDuration(0);
      audioChunksRef.current = [];
      setMediaRecorder(null);
    };
  }, [mediaRecorder, duration, currentRoomId]);

  const pauseRecording = () => {
    mediaRecorder?.pause();
    setIsPaused(true);
    if (intervalId) {
      clearInterval(intervalId);
    }
  };

  const resumeRecording = () => {
    mediaRecorder?.resume();
    setIsPaused(false);
    const id = setInterval(() => {
      setDuration((prev) => prev + 1);
    }, 1000);
    setIntervalId(id);
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  return (
    <>
      <IconButton
        color="primary"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={!currentRoomId}
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
    </>
  );
};
