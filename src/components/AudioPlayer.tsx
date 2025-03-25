import React, { useEffect, useRef, useState } from 'react';
import { PauseIcon, PlayIcon, StopIcon } from '@heroicons/react/24/solid';

interface AudioPlayerProps {
  src: string;
  onEnded?: () => void;
  isPlaying: boolean;
  onPlayPause: () => void;
  onStop: () => void;
}

export default function AudioPlayer({ src, onEnded, isPlaying, onPlayPause, onStop }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  
  // Initialize audio element on mount or src change
  useEffect(() => {
    const audio = new Audio();
    
    // Clean up any previous audio element
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
    
    // Set up new audio element
    audio.src = src;
    audioRef.current = audio;
    
    function handleCanPlayThrough() {
      setLoaded(true);
    }
    
    function handleTimeUpdate() {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    }
    
    function handleEnded() {
      setProgress(0);
      if (onEnded) {
        onEnded();
      }
    }
    
    // Add event listeners
    audio.addEventListener('canplaythrough', handleCanPlayThrough);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    
    // Load the audio
    audio.load();
    
    // Clean up function
    return () => {
      audio.removeEventListener('canplaythrough', handleCanPlayThrough);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
      audio.src = '';
    };
  }, [src, onEnded]); // Including onEnded in dependency array

  // Handle play/pause state changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    console.log('AudioPlayer isPlaying changed:', isPlaying);
    
    if (isPlaying) {
      // First make sure all other audio elements are paused to prevent
      // multiple audio playback
      const allAudioElements = document.querySelectorAll('audio');
      allAudioElements.forEach(el => {
        if (el !== audio && !el.paused) {
          el.pause();
        }
      });
      
      // Then play this audio
      console.log('Attempting to play audio');
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => console.log('Audio playback started successfully'))
          .catch(error => {
            console.error('Error playing audio:', error);
            // Signal back to parent that playback failed
            onPlayPause();
          });
      }
    } else {
      // Don't reset currentTime when pausing, just pause
      if (!audio.paused) {
        console.log('Pausing audio, currentTime:', audio.currentTime);
        audio.pause();
      }
    }
  }, [isPlaying, onPlayPause]);

  // Store the current time when paused to allow resuming from the same position
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    // Add event listener to store position when paused
    const handlePause = () => {
      console.log('Audio paused at position:', audio.currentTime);
      // We don't need to store the position as the audio element maintains it
    };
    
    audio.addEventListener('pause', handlePause);
    
    return () => {
      audio.removeEventListener('pause', handlePause);
    };
  }, []);

  // Handle stopping audio
  const handleStop = () => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      setProgress(0);
    }
    onStop();
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={onPlayPause}
        disabled={!loaded}
        className="rounded-full bg-blue-600 p-1 text-white hover:bg-blue-700 focus:outline-none disabled:opacity-50"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <PauseIcon className="h-4 w-4" />
        ) : (
          <PlayIcon className="h-4 w-4" />
        )}
      </button>
      
      <button
        onClick={handleStop}
        disabled={!loaded || !isPlaying}
        className="rounded-full bg-red-600 p-1 text-white hover:bg-red-700 focus:outline-none disabled:opacity-50"
        aria-label="Stop"
      >
        <StopIcon className="h-4 w-4" />
      </button>
      
      <div className="flex-1 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-blue-600"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
