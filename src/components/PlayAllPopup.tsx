import React, { useEffect, useRef, useState } from 'react';
import { PauseIcon, PlayIcon, StopIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface PlayAllPopupProps {
  isOpen: boolean;
  onClose: () => void;
  currentLineIndex: number | null;
  totalLines: number;
  currentCharacter: string;
  currentText: string;
  isPlaying: boolean;
  onPlayPause: () => void;
  onStop: () => void;
}

export default function PlayAllPopup({
  isOpen,
  onClose,
  currentLineIndex,
  totalLines,
  currentCharacter,
  currentText,
  isPlaying,
  onPlayPause,
  onStop
}: PlayAllPopupProps) {
  const [progress, setProgress] = useState(0);
  const popupRef = useRef<HTMLDivElement>(null);
  
  // Calculate progress as a percentage
  useEffect(() => {
    if (currentLineIndex === null || totalLines === 0) {
      setProgress(0);
    } else {
      setProgress((currentLineIndex / (totalLines - 1)) * 100);
    }
  }, [currentLineIndex, totalLines]);

  // Add debugging logs
  useEffect(() => {
    console.log('PlayAllPopup open status:', isOpen);
    console.log('PlayAllPopup playing status:', isPlaying);
    console.log('PlayAllPopup current line:', currentLineIndex);
  }, [isOpen, isPlaying, currentLineIndex]);

  // Focus trap when opened
  useEffect(() => {
    if (isOpen && popupRef.current) {
      popupRef.current.focus();
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  // Handle close button click
  const handleClose = () => {
    console.log('PlayAllPopup close button clicked');
    onStop();
  };

  // Handle play/pause button click
  const handlePlayPause = () => {
    console.log('PlayAllPopup play/pause button clicked, current state:', isPlaying);
    
    // Add a small delay to ensure state update is processed
    setTimeout(() => {
      console.log('PlayAllPopup calling onPlayPause callback');
      onPlayPause();
    }, 100);
  };
  
  // Add visible debug info in development mode
  const debugInfo = process.env.NODE_ENV === 'development' && (
    <div className="mt-2 p-2 bg-gray-100 dark:bg-zinc-700 rounded text-xs">
      <div>Debug: {isPlaying ? 'Playing' : 'Paused'}</div>
      <div>Current line: {currentLineIndex !== null ? currentLineIndex + 1 : 'none'}</div>
      <div>Total lines: {totalLines}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40" onClick={onStop}></div>
      
      {/* Popup */}
      <div 
        ref={popupRef}
        tabIndex={-1}
        className="fixed bottom-0 w-full sm:relative sm:w-96 bg-white dark:bg-zinc-800 rounded-t-lg sm:rounded-lg shadow-lg z-10 p-5"
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
            Playing All Audio
          </h3>
          <button
            onClick={handleClose}
            className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            aria-label="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="h-2 w-full bg-zinc-200 dark:bg-zinc-700 rounded-full mb-4">
          <div 
            className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        {/* Current line info */}
        <div className="mb-4">
          <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200 mb-1">
            {currentCharacter || 'No character'}
          </div>
          <div className="text-zinc-600 dark:text-zinc-400 text-sm line-clamp-2 mb-1">
            {currentText || 'No text'}
          </div>
          <div className="text-xs text-zinc-500 dark:text-zinc-500">
            Line {currentLineIndex !== null ? currentLineIndex + 1 : 0} of {totalLines}
          </div>
        </div>
        
        {/* Controls */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent event bubbling
              handlePlayPause();
            }}
            className={`rounded-full p-3 text-white focus:outline-none focus:ring-2 ${
              isPlaying 
                ? 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500' 
                : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
            }`}
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? (
              <PauseIcon className="h-6 w-6" />
            ) : (
              <PlayIcon className="h-6 w-6" />
            )}
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation(); // Prevent event bubbling
              onStop();
            }}
            className="rounded-full bg-red-600 p-3 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            aria-label="Stop"
          >
            <StopIcon className="h-6 w-6" />
          </button>
        </div>
        
        {/* Debug info in development mode */}
        {debugInfo}
      </div>
    </div>
  );
} 