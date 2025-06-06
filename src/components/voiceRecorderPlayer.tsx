import React, { useState, useRef, useEffect } from 'react';
import { FaPlay, FaPause, FaMicrophone } from 'react-icons/fa';

interface VoiceRecorderPlayerProps {
  audioUrl: string;
  initduration: number; // in seconds
  timestamp?: Date;
  waveformColor?: string;
  backgroundColor?: string;
  playheadColor?: string;
}

const VoiceRecorderPlayer: React.FC<VoiceRecorderPlayerProps> = ({
  audioUrl,
  initduration,
  timestamp,
  waveformColor = '#25D366',
  backgroundColor = '#e5e5ea',
  playheadColor = '#34B7F1',
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressInterval = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Clean up on unmount
    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    } else {
      audioRef.current.play();
      startProgressTimer();
    }

    setIsPlaying(!isPlaying);
  };

  const startProgressTimer = () => {
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }

    progressInterval.current = setInterval(() => {
      if (audioRef.current) {
        const currentTime = audioRef.current.currentTime;
        const duration: number = audioRef.current.duration || 10;
        setProgress((currentTime / duration) * 100);
        
        if (currentTime >= duration) {
          setIsPlaying(false);
          setProgress(0);
          if (progressInterval.current) {
            clearInterval(progressInterval.current);
          }
        }
      }
    }, 100);
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(initduration);
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
    setProgress(0);
    if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="voice-recorder-player" style={{
      display: 'flex',
      alignItems: 'center',
      backgroundColor: backgroundColor,
      borderRadius: '18px',
      padding: '8px 12px',
      maxWidth: '300px',
      width: 'fit-content',
    }}>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleAudioEnd}
      />

      {/* Play/Pause button */}
      <button
        onClick={togglePlay}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {isPlaying ? (
          <FaPause size={16} color={waveformColor} />
        ) : (
          <FaPlay size={16} color={waveformColor} />
        )}
      </button>

      {/* Microphone icon */}
      <div style={{ margin: '0 8px' }}>
        <FaMicrophone size={14} color={waveformColor} />
      </div>

      {/* Progress bar */}
      <div style={{
        flexGrow: 1,
        height: '4px',
        backgroundColor: '#ccc',
        borderRadius: '2px',
        margin: '0 8px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: `${progress}%`,
            backgroundColor: waveformColor,
            borderRadius: '2px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: `${progress}%`,
            height: '100%',
            width: '2px',
            backgroundColor: playheadColor,
          }}
        />
      </div>

      {/* Duration */}
      <span style={{
        fontSize: '12px',
        color: '#666',
        minWidth: '40px',
        textAlign: 'right',
      }}>
        {formatTime(isPlaying ? (audioRef.current?.currentTime || 0) : duration)}
      </span>

      {/* Timestamp (optional) */}
      {timestamp && (
        <span style={{
          fontSize: '11px',
          color: '#999',
          marginLeft: '8px',
          whiteSpace: 'nowrap',
        }}>
          {timestamp.toString()}
        </span>
      )}
    </div>
  );
};

export default VoiceRecorderPlayer;