'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import ThemeToggle from '@/components/ThemeToggle';
import CharacterForm from '@/components/CharacterForm';
import CharacterList from '@/components/CharacterList';
import ScriptEditor from '@/components/ScriptEditor';
import ScriptDisplay from '@/components/ScriptDisplay';
import StoryManager from '@/components/StoryManager';
import AutopilotToggle from '@/components/AutopilotToggle';
import AutopilotPopup from '@/components/AutopilotPopup';
import ScriptFormatterPopup from '@/components/ScriptFormatterPopup';
import PlayAllPopup from '@/components/PlayAllPopup';
import { Character, ScriptLine, StoryScript } from '@/models/types';
import { createAudioUrl, playAudioFromUrl, downloadCombinedAudio, downloadSingleAudioFile, stringToUrlSafeId } from '@/utils/audioPlayer';
import { saveStory, createNewStory, loadStory } from '@/utils/storyDatabase';
import { ArrowDownTrayIcon, DocumentDuplicateIcon, DocumentArrowDownIcon, PlusIcon } from '@heroicons/react/24/solid';

export default function Home() {
  const { theme } = useTheme();
  const [currentStoryId, setCurrentStoryId] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const [characters, setCharacters] = useState<Character[]>([]);
  const [script, setScript] = useState<ScriptLine[]>([]);
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);
  const [audioCache, setAudioCache] = useState<Map<string, string>>(new Map());
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<string>('');
  const [autopilotEnabled, setAutopilotEnabled] = useState<boolean>(false);
  const [showAutopilotPopup, setShowAutopilotPopup] = useState<boolean>(false);
  const [showFormatterPopup, setShowFormatterPopup] = useState<boolean>(false);
  const [editingCharacter, setEditingCharacter] = useState<Character | null>(null);
  const [editingCharacterIndex, setEditingCharacterIndex] = useState<number | null>(null);
  const [audioElements, setAudioElements] = useState<Map<number, HTMLAudioElement>>(new Map());
  const [isGeneratingAll, setIsGeneratingAll] = useState<boolean>(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [showPlayAllPopup, setShowPlayAllPopup] = useState<boolean>(false);
  const [isPlayingAll, setIsPlayingAll] = useState<boolean>(false);
  const [currentPlayingLine, setCurrentPlayingLine] = useState<number | null>(null);

  // Initialize with a new story
  useEffect(() => {
    handleNewStory();
  }, []);

  // Create a deep clone of an object
  const deepClone = <T,>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj));
  };

  // Function to create a new story
  const handleNewStory = () => {
    const newStory = createNewStory();
    setCurrentStoryId(null);
    setTitle(newStory.title);
    setCharacters([]);
    setScript([]);
    setAudioCache(new Map());
  };

  // Function to load a story
  const handleLoadStory = async (story: StoryScript) => {
    try {
      // If we're loading from the StoryManager, we want to ensure we have the latest data
      // So we'll re-fetch the story if it has an ID
      let storyToLoad = story;
      
      if (story.id) {
        const latestStory = await loadStory(story.id);
        if (latestStory) {
          storyToLoad = latestStory;
        }
      }
      
      // Use deep clones to ensure we have proper copies of arrays
      setCurrentStoryId(storyToLoad.id);
      setTitle(storyToLoad.title);
      setCharacters(deepClone(storyToLoad.characters) || []);
      setScript(deepClone(storyToLoad.script) || []);
      setAudioCache(new Map()); // Clear audio cache when loading a new story

      console.log('Loaded story:', storyToLoad);
      console.log('Characters:', storyToLoad.characters.length);
      console.log('Script lines:', storyToLoad.script.length);
    } catch (error) {
      console.error('Error loading story:', error);
      alert('Failed to load story. Please try again.');
    }
  };

  // Function to save the current story
  const handleSaveStory = async () => {
    try {
      setSaveStatus('Saving...');
      
      // Create a fresh object for saving
      const storyToSave: StoryScript = {
        id: currentStoryId || '',
        title,
        characters: deepClone(characters),
        script: deepClone(script),
        lastModified: new Date().toISOString(),
      };
      
      const id = await saveStory(storyToSave);
      setCurrentStoryId(id);
      setSaveStatus('Saved!');
      
      console.log('Saved story:', storyToSave);
      console.log('Characters:', storyToSave.characters.length);
      console.log('Script lines:', storyToSave.script.length);
      
      // Clear the save status after a delay
      setTimeout(() => {
        setSaveStatus('');
      }, 2000);
    } catch (error) {
      console.error('Error saving story:', error);
      setSaveStatus('Error saving!');
    }
  };

  // Function to add a character
  const handleAddCharacter = (character: Character) => {
    setCharacters(prev => [...prev, character]);
  };

  // Function to remove a character
  const handleRemoveCharacter = (index: number) => {
    setCharacters(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  // Function to edit a character
  const handleEditCharacter = (index: number, character: Character) => {
    setEditingCharacter(character);
    setEditingCharacterIndex(index);
  };

  // Function to update a character
  const handleUpdateCharacter = (index: number, updatedCharacter: Character) => {
    setCharacters(prev => {
      const updated = [...prev];
      updated[index] = updatedCharacter;
      return updated;
    });
    setEditingCharacter(null);
    setEditingCharacterIndex(null);
  };

  // Function to add a script line
  const handleAddLine = (line: ScriptLine) => {
    setScript(prev => [...prev, line]);
  };

  // Function to remove a script line
  const handleRemoveLine = (index: number) => {
    setScript(prev => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });
  };

  // Function to edit a script line
  const handleEditLine = (index: number, updatedLine: ScriptLine) => {
    setScript(prev => {
      const updated = [...prev];
      updated[index] = updatedLine;
      return updated;
    });
    
    // Remove cached audio for this line since it has changed
    const oldLine = script[index];
    const cacheKey = `${oldLine.characterName}_${oldLine.text}_${oldLine.instructions || ''}`;
    if (audioCache.has(cacheKey)) {
      setAudioCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(cacheKey);
        return newCache;
      });
    }
  };

  // Function to reorder script lines
  const handleReorderLines = (startIndex: number, endIndex: number) => {
    setScript(prev => {
      const result = [...prev];
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  };

  // Function to stop all audio playback
  const stopAllAudio = () => {
    // Create a new array from the map values to avoid modification during iteration
    Array.from(audioElements.values()).forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    // Clear the map
    setAudioElements(new Map());
    setCurrentAudio(null);
    setPlayingIndex(null);
  };

  // Function to generate and play audio for a script line
  const handlePlayLine = async (index: number) => {
    // If index is -1, it means we just want to stop playback
    if (index === -1) {
      stopAllAudio();
      return;
    }
    
    // Check if we're clicking the same line that's currently playing
    if (playingIndex === index) {
      // Get the current audio element if it exists
      const audioElement = audioElements.get(index);
      
      // If we have an audio element, toggle play/pause instead of restarting
      if (audioElement) {
        if (!audioElement.paused) {
          // If playing, just pause it (don't reset to beginning)
          audioElement.pause();
          setPlayingIndex(null);
        } else {
          // If paused, resume from current position
          setPlayingIndex(index);
          audioElement.play().catch(error => {
            console.error('Error resuming audio:', error);
            setPlayingIndex(null);
          });
        }
        return;
      }
      
      // If we don't have the audio element anymore, stop everything and return
      stopAllAudio();
      return;
    }
    
    // If a different line is already playing, stop it
    if (playingIndex !== null) {
      stopAllAudio();
    }
    
    const line = script[index];
    
    try {
      // Generate a cache key for this line
      const cacheKey = `${line.characterName}_${line.text}_${line.instructions || ''}`;
      
      // Check if we have this audio in cache
      if (audioCache.has(cacheKey)) {
        const cachedUrl = audioCache.get(cacheKey);
        if (cachedUrl) {
          // Set playing index before creating audio to prevent race conditions
          setPlayingIndex(index);
          
          // Create a new audio element for this line
          const audio = new Audio();
          
          // Set up event listeners first before setting source
          audio.addEventListener('ended', () => {
            setPlayingIndex(null);
            setAudioElements(prev => {
              const newMap = new Map(prev);
              newMap.delete(index);
              return newMap;
            });
            setCurrentAudio(null);
          });
          
          audio.addEventListener('error', () => {
            console.error('Error playing audio');
            setPlayingIndex(null);
            setAudioElements(prev => {
              const newMap = new Map(prev);
              newMap.delete(index);
              return newMap;
            });
            setCurrentAudio(null);
          });
          
          // Store the audio element reference
          setAudioElements(prev => {
            const newMap = new Map(prev);
            // Remove any existing audio for this index
            if (prev.has(index)) {
              const oldAudio = prev.get(index);
              if (oldAudio) {
                oldAudio.pause();
                oldAudio.src = '';
              }
            }
            newMap.set(index, audio);
            return newMap;
          });
          
          setCurrentAudio(audio);
          
          // Set source and load after event listeners are set up
          audio.src = cachedUrl;
          
          // Wait for audio to be loaded before playing
          audio.addEventListener('canplaythrough', function onCanPlay() {
            // Play the audio and handle any errors
            audio.play().catch(error => {
              console.error('Error playing audio:', error);
              setPlayingIndex(null);
              setCurrentAudio(null);
            });
            // Remove the event listener to prevent memory leaks
            audio.removeEventListener('canplaythrough', onCanPlay);
          });
          
          audio.load();
          return;
        }
      }
      
      // If we don't have the audio in cache, show alert
      alert('Please generate audio for this line first by clicking the "Generate All" button.');
      
    } catch (error) {
      console.error('Error playing audio:', error);
      alert('Failed to play audio. Please try again.');
      stopAllAudio();
    }
  };

  // Function to generate all audio without playing
  const handleGenerateAllAudio = async () => {
    if (script.length === 0 || isGeneratingAll) return;
    
    setIsGeneratingAll(true);
    
    try {
      // Pre-generate audio for all lines that don't have cached audio
      for (let i = 0; i < script.length; i++) {
        const line = script[i];
        const cacheKey = `${line.characterName}_${line.text}_${line.instructions || ''}`;
        
        // Skip if we already have this audio in cache
        if (audioCache.has(cacheKey)) continue;
        
        // Generate new audio
        const character = characters.find(c => c.name === line.characterName);
        
        if (!character) {
          console.warn(`Character ${line.characterName} not found, skipping line`);
          continue;
        }
        
        const response = await fetch('/api/audio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: line.text,
            voice: character.voice,
            instructions: line.instructions,
          }),
        });
        
        if (!response.ok) {
          console.warn(`Failed to generate audio for line ${i}, skipping`);
          continue;
        }
        
        const audioArrayBuffer = await response.arrayBuffer();
        const audioUrl = createAudioUrl(audioArrayBuffer);
        
        // Add to cache
        setAudioCache(prev => new Map(prev).set(cacheKey, audioUrl));
      }
      
      alert('All audio has been generated successfully.');
    } catch (error) {
      console.error('Error generating audio:', error);
      alert('Failed to generate all audio. Please try again.');
    } finally {
      setIsGeneratingAll(false);
    }
  };

  // Function to play the entire script
  const playEntireScript = async () => {
    console.log('Play entire script called');
    if (script.length === 0) {
      console.log('Script is empty, not playing');
      alert('No script to play. Please add dialogue lines first.');
      return;
    }
    
    // If already playing, just toggle pause/play
    if (showPlayAllPopup) {
      console.log('Play all popup already showing, toggling play/pause');
      togglePlayAll();
      return;
    }
    
    // First check if all audio is generated
    let allGenerated = true;
    let missingLines = [];
    
    console.log('Checking if all audio is generated...');
    for (let i = 0; i < script.length; i++) {
      const line = script[i];
      const cacheKey = `${line.characterName}_${line.text}_${line.instructions || ''}`;
      if (!audioCache.has(cacheKey)) {
        allGenerated = false;
        missingLines.push(i + 1); // Store 1-indexed line number for user-friendly message
        if (missingLines.length > 3) break; // No need to find all missing lines
      }
    }
    
    if (!allGenerated) {
      console.log('Not all audio is generated, showing alert. Missing lines:', missingLines);
      const lineStr = missingLines.length > 3 
        ? `${missingLines.slice(0, 3).join(', ')} and others` 
        : missingLines.join(', ');
      alert(`Please generate audio for all lines first. Missing audio for lines: ${lineStr}`);
      return;
    }
    
    console.log('All audio is generated, proceeding with playback');
    
    // Stop any currently playing audio
    console.log('Stopping any currently playing audio');
    stopAllAudio();
    
    try {
      // Ensure clean state
      console.log('Resetting playback state');
      setCurrentPlayingLine(null);
      setCurrentAudio(null);
      setAudioElements(new Map());
      
      // First set up the UI state
      console.log('Setting up play all state - showing popup');
      setShowPlayAllPopup(true);
      
      // Use a two-phase approach with callbacks to ensure state is updated
      // First phase: show the popup
      console.log('First phase: waiting for popup to be visible');
      setTimeout(() => {
        // Second phase: set playing state and start playback
        console.log('Second phase: setting playing state');
        setIsPlayingAll(true);
        setCurrentPlayingLine(0);
        
        // Final phase: initiate playback
        setTimeout(() => {
          console.log('Final phase: initiating playback, state check:');
          console.log('- isPlayingAll:', isPlayingAll);
          console.log('- showPlayAllPopup:', showPlayAllPopup);
          console.log('- currentPlayingLine:', currentPlayingLine);
          
          if (showPlayAllPopup) {
            // Even if the state hasn't propagated yet, we can force playback
            console.log('Starting playback sequence');
            playNextLine(0);
          } else {
            console.error('Popup disappeared before playback could start');
          }
        }, 300); // Short delay for playing
      }, 200); // Short delay for state update
    } catch (error) {
      console.error('Error playing entire script:', error);
      alert('Failed to play the entire script. Please try again.');
      stopPlayAll();
    }
  };

  // Function to play the next line in the sequence
  const playNextLine = async (lineIndex: number) => {
    console.log('Playing next line:', lineIndex, 'isPlayingAll:', isPlayingAll, 'showPlayAllPopup:', showPlayAllPopup);
    
    // If we're not playing all or popup is closed, stop playing
    if (!isPlayingAll || !showPlayAllPopup) {
      console.log('Not in play all mode, returning');
      return;
    }
    
    // If we've reached the end, stop playing
    if (lineIndex >= script.length) {
      console.log('Reached end of script, stopping');
      stopPlayAll();
      return;
    }
    
    setCurrentPlayingLine(lineIndex);
    
    // Make sure we have valid line data
    if (!script[lineIndex]) {
      console.error('Invalid line index:', lineIndex, 'script length:', script.length);
      stopPlayAll();
      return;
    }
    
    const line = script[lineIndex];
    console.log('Line data:', line.characterName, line.text.substring(0, 30) + '...');
    const cacheKey = `${line.characterName}_${line.text}_${line.instructions || ''}`;
    
    console.log('Checking cache for key:', cacheKey.substring(0, 50) + '...');
    console.log('Cache has key:', audioCache.has(cacheKey));
    
    if (!audioCache.has(cacheKey)) {
      console.warn(`No audio found for line ${lineIndex}, skipping`);
      // Wait a bit before moving to next line
      setTimeout(() => playNextLine(lineIndex + 1), 500);
      return;
    }
    
    const audioUrl = audioCache.get(cacheKey);
    if (!audioUrl) {
      console.warn('Audio URL is empty, skipping');
      // Wait a bit before moving to next line
      setTimeout(() => playNextLine(lineIndex + 1), 500);
      return;
    }
    
    console.log('Audio URL found:', audioUrl.substring(0, 50) + '...');
    
    try {
      // Stop any currently playing audio
      if (currentAudio) {
        console.log('Stopping current audio');
        currentAudio.pause();
        currentAudio.currentTime = 0;
        // Remove any existing event listeners to prevent memory leaks
        currentAudio.onended = null;
        currentAudio.oncanplaythrough = null;
        currentAudio.onerror = null;
      }
      
      console.log('Creating new audio for line:', lineIndex);
      // Create a new audio element for this line
      const audio = new Audio();
      
      // Store the audio element immediately to ensure it persists
      setAudioElements(prev => {
        const newMap = new Map(prev);
        // Clear any previous audio elements to avoid memory leaks
        prev.forEach((_, key) => {
          if (key !== lineIndex) {
            newMap.delete(key);
          }
        });
        newMap.set(lineIndex, audio);
        return newMap;
      });
      
      setCurrentAudio(audio);
      
      // Set event listeners before setting source
      audio.oncanplaythrough = () => {
        console.log('Audio canplaythrough event fired for line:', lineIndex);
        
        // Double check state to make sure we're still in play all mode
        if (isPlayingAll && showPlayAllPopup) {
          console.log('Starting playback for line:', lineIndex);
          
          // Try to play and handle any errors
          try {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
              playPromise
                .then(() => console.log('Playback started successfully'))
                .catch(err => {
                  console.error('Error playing audio:', err);
                  // Try again with user interaction trick
                  document.addEventListener('click', function playOnClick() {
                    audio.play();
                    document.removeEventListener('click', playOnClick);
                  }, { once: true });
                  // Move to next line if there's an error
                  setTimeout(() => playNextLine(lineIndex + 1), 500);
                });
            }
          } catch (e) {
            console.error('Exception playing audio:', e);
            // Move to next line if there's an error
            setTimeout(() => playNextLine(lineIndex + 1), 500);
          }
        } else {
          console.log('No longer in play all mode, not starting playback');
        }
      };
      
      audio.onended = () => {
        console.log('Audio ended for line:', lineIndex);
        // Small delay before playing next line
        setTimeout(() => playNextLine(lineIndex + 1), 500);
      };
      
      audio.onloadeddata = () => {
        console.log('Audio loaded data event for line:', lineIndex);
      };
      
      audio.onerror = (e) => {
        console.error('Error with audio playback for line:', lineIndex, e);
        console.error('Audio error code:', audio.error ? audio.error.code : 'unknown');
        // Move to next line if there's an error
        setTimeout(() => playNextLine(lineIndex + 1), 500);
      };
      
      // Set the source
      console.log('Setting audio source for line:', lineIndex);
      audio.src = audioUrl;
      audio.preload = 'auto';
      
      // Explicitly attempt to start loading
      console.log('Loading audio for line:', lineIndex);
      audio.load();
      
      // Force play after a short delay in case canplaythrough doesn't fire
      setTimeout(() => {
        if (audio.paused && isPlayingAll && showPlayAllPopup) {
          console.log('Force playing audio after timeout for line:', lineIndex);
          try {
            audio.play()
              .then(() => console.log('Forced play successful for line:', lineIndex))
              .catch(err => {
                console.error('Error during forced play for line:', lineIndex, err);
                // Move to next line if there's an error
                setTimeout(() => playNextLine(lineIndex + 1), 300);
              });
          } catch (e) {
            console.error('Exception during forced play:', e);
            setTimeout(() => playNextLine(lineIndex + 1), 300);
          }
        }
      }, 1000); // Shorter timeout - 1 second
      
    } catch (error) {
      console.error('Error setting up audio:', error);
      // Try to continue with next line
      setTimeout(() => playNextLine(lineIndex + 1), 500);
    }
  };

  // Function to stop play all
  const stopPlayAll = () => {
    console.log('Stopping play all');
    setIsPlayingAll(false);
    setCurrentPlayingLine(null);
    
    // Stop any playing audio
    if (currentAudio) {
      console.log('Stopping current audio during stopPlayAll');
      currentAudio.pause();
      currentAudio.currentTime = 0;
      // Remove event listeners
      currentAudio.onended = null;
      currentAudio.oncanplaythrough = null;
      currentAudio.onerror = null;
      setCurrentAudio(null);
    }
    
    // Clear all audio elements
    console.log('Clearing all audio elements');
    Array.from(audioElements.values()).forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
      // Remove event listeners
      audio.onended = null;
      audio.oncanplaythrough = null;
      audio.onerror = null;
    });
    setAudioElements(new Map());
  };

  // Function to toggle pause/play during play all
  const togglePlayAll = () => {
    console.log('Toggle play all called, current state:', isPlayingAll);
    
    if (isPlayingAll) {
      // If playing, pause current audio
      console.log('Currently playing, pausing');
      if (currentAudio) {
        console.log('Pausing current audio');
        currentAudio.pause();
      }
      setIsPlayingAll(false);
    } else {
      // If paused, resume from current line
      console.log('Currently paused, resuming');
      setIsPlayingAll(true);
      
      // Safety check - ensure the popup is visible
      if (!showPlayAllPopup) {
        console.log('Play all popup is not showing, fixing this issue');
        setShowPlayAllPopup(true);
      }
      
      if (currentPlayingLine !== null && currentAudio) {
        console.log('Resuming from current line:', currentPlayingLine);
        
        // Resume current audio if available and it's loaded
        if (currentAudio.readyState >= 2) {
          console.log('Audio is loaded, playing immediately');
          currentAudio.play()
            .then(() => console.log('Resume successful'))
            .catch(err => {
              console.error('Error resuming audio:', err);
              // If error resuming, try playing next line
              console.log('Moving to next line due to error');
              setTimeout(() => playNextLine(currentPlayingLine + 1), 500);
            });
        } else {
          console.log('Audio not loaded yet, setting up listener');
          // If audio isn't loaded yet, set up a canplaythrough listener
          // Remove any existing listeners first to avoid duplicates
          currentAudio.oncanplaythrough = null;
          
          currentAudio.oncanplaythrough = () => {
            console.log('Audio can play through event fired during resume');
            // Only play if we're still in play all mode
            if (isPlayingAll && showPlayAllPopup) {
              console.log('Still in play all mode, starting playback');
              currentAudio.play()
                .then(() => console.log('Delayed resume successful'))
                .catch(err => {
                  console.error('Error playing audio after load:', err);
                  // Move to next line if there's an error
                  console.log('Moving to next line due to error after load');
                  setTimeout(() => playNextLine(currentPlayingLine + 1), 500);
                });
            } else {
              console.log('No longer in play all mode, not resuming');
            }
          };
          
          // Make sure audio is loading
          if (currentAudio.paused) {
            console.log('Audio is paused, loading again');
            currentAudio.load();
          }
        }
      } else {
        // If no current line or audio, start from beginning or current line
        const startLineIndex = currentPlayingLine !== null ? currentPlayingLine : 0;
        console.log('No current audio or line, starting from:', startLineIndex);
        
        // Use setTimeout to allow state updates to propagate
        setTimeout(() => {
          if (isPlayingAll && showPlayAllPopup) {
            console.log('Starting playback from line index:', startLineIndex);
            playNextLine(startLineIndex);
          } else {
            console.log('State changed before timeout, not starting playback');
          }
        }, 100);
      }
    }
  };

  // Function to close the play all popup
  const closePlayAllPopup = () => {
    console.log('Closing play all popup');
    // First stop all playback
    stopPlayAll();
    // Then close the popup
    setShowPlayAllPopup(false);
  };

  // Clean up audio elements when component unmounts
  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  // Function to export audio
  const exportAudio = async () => {
    if (script.length === 0) return;

    const fileName = title ? stringToUrlSafeId(title) : 'story-audio';
    const audioUrls: string[] = [];
    
    // Show loading message
    setIsGenerating(true);
    
    try {
      for (let i = 0; i < script.length; i++) {
        const line = script[i];
        const cacheKey = `${line.characterName}_${line.text}_${line.instructions || ''}`;
        
        // If we have this audio in cache, use it
        if (audioCache.has(cacheKey)) {
          const cachedUrl = audioCache.get(cacheKey);
          if (cachedUrl) {
            audioUrls.push(cachedUrl);
            continue;
          }
        }
        
        // Otherwise, generate new audio
        const character = characters.find(c => c.name === line.characterName);
        
        if (!character) {
          throw new Error(`Character ${line.characterName} not found`);
        }
        
        const response = await fetch('/api/audio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: line.text,
            voice: character.voice,
            instructions: line.instructions,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to generate audio');
        }
        
        const audioArrayBuffer = await response.arrayBuffer();
        const audioUrl = createAudioUrl(audioArrayBuffer);
        
        // Add to cache and urls array
        setAudioCache(prev => new Map(prev).set(cacheKey, audioUrl));
        audioUrls.push(audioUrl);
      }
      
      // Download all audio segments
      downloadCombinedAudio(audioUrls, fileName);
    } catch (error) {
      console.error('Error exporting audio:', error);
      alert('Failed to export audio. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to export as single audio file
  const exportSingleAudio = async () => {
    if (script.length === 0) return;

    const fileName = title ? stringToUrlSafeId(title) : 'story-audio';
    const audioUrls: string[] = [];
    
    // Show loading message
    setIsGenerating(true);
    
    try {
      for (let i = 0; i < script.length; i++) {
        const line = script[i];
        const cacheKey = `${line.characterName}_${line.text}_${line.instructions || ''}`;
        
        // If we have this audio in cache, use it
        if (audioCache.has(cacheKey)) {
          const cachedUrl = audioCache.get(cacheKey);
          if (cachedUrl) {
            audioUrls.push(cachedUrl);
            continue;
          }
        }
        
        // Otherwise, generate new audio
        const character = characters.find(c => c.name === line.characterName);
        
        if (!character) {
          throw new Error(`Character ${line.characterName} not found`);
        }
        
        const response = await fetch('/api/audio', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: line.text,
            voice: character.voice,
            instructions: line.instructions,
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to generate audio');
        }
        
        const audioArrayBuffer = await response.arrayBuffer();
        const audioUrl = createAudioUrl(audioArrayBuffer);
        
        // Add to cache and urls array
        setAudioCache(prev => new Map(prev).set(cacheKey, audioUrl));
        audioUrls.push(audioUrl);
      }
      
      // Download single combined audio file
      await downloadSingleAudioFile(audioUrls, fileName);
    } catch (error) {
      console.error('Error exporting audio:', error);
      alert('Failed to export audio. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Toggle autopilot mode
  const handleToggleAutopilot = (enabled: boolean) => {
    setAutopilotEnabled(enabled);
    if (enabled && characters.length > 0) {
      setShowAutopilotPopup(true);
    } else if (enabled && characters.length === 0) {
      alert('Please add characters first before using autopilot mode');
      setAutopilotEnabled(false);
    }
  };

  // Handle script generation from autopilot
  const handleGenerateScript = (generatedLines: ScriptLine[]) => {
    setScript(generatedLines);
  };

  // Function to regenerate audio for a single line
  const handleRegenerateLine = async (index: number) => {
    const line = script[index];
    setIsGenerating(true);
    
    try {
      // Find the character
      const character = characters.find(c => c.name === line.characterName);
      
      if (!character) {
        throw new Error(`Character ${line.characterName} not found`);
      }
      
      // Remove the old cached audio
      const cacheKey = `${line.characterName}_${line.text}_${line.instructions || ''}`;
      setAudioCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(cacheKey);
        return newCache;
      });
      
      // Generate new audio
      const response = await fetch('/api/audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: line.text,
          voice: character.voice,
          instructions: line.instructions,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }
      
      const audioArrayBuffer = await response.arrayBuffer();
      const audioUrl = createAudioUrl(audioArrayBuffer);
      
      // Add to cache
      setAudioCache(prev => new Map(prev).set(cacheKey, audioUrl));
      
      // Start playing the regenerated audio
      setPlayingIndex(index);
    } catch (error) {
      console.error('Error regenerating audio:', error);
      alert('Failed to regenerate audio. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Function to export audio for a single line
  const handleExportLine = async (index: number) => {
    const line = script[index];
    setIsGenerating(true);
    
    try {
      // Generate a cache key for this line
      const cacheKey = `${line.characterName}_${line.text}_${line.instructions || ''}`;
      
      // Check if we have this audio in cache
      if (audioCache.has(cacheKey)) {
        const cachedUrl = audioCache.get(cacheKey);
        if (cachedUrl) {
          const fileName = `${stringToUrlSafeId(line.characterName)}_${index + 1}`;
          await downloadSingleAudioFile([cachedUrl], fileName);
          return;
        }
      }
      
      // Otherwise, generate new audio
      const character = characters.find(c => c.name === line.characterName);
      
      if (!character) {
        throw new Error(`Character ${line.characterName} not found`);
      }
      
      const response = await fetch('/api/audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: line.text,
          voice: character.voice,
          instructions: line.instructions,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }
      
      const audioArrayBuffer = await response.arrayBuffer();
      const audioUrl = createAudioUrl(audioArrayBuffer);
      
      // Add to cache and export
      setAudioCache(prev => new Map(prev).set(cacheKey, audioUrl));
      const fileName = `${stringToUrlSafeId(line.characterName)}_${index + 1}`;
      await downloadSingleAudioFile([audioUrl], fileName);
    } catch (error) {
      console.error('Error exporting audio:', error);
      alert('Failed to export audio. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle formatted script import
  const handleImportFormattedScript = (formattedLines: ScriptLine[]) => {
    // Replace the current script with the formatted one
    setScript(formattedLines);
    
    // Clear audio cache since instructions might have changed
    setAudioCache(new Map());
  };

  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex flex-col flex-grow bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
        <header className="bg-white dark:bg-zinc-800 border-b border-zinc-300 dark:border-zinc-700 mb-4 shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold tracking-tight text-blue-600 dark:text-blue-400">VocalCanvas</h1>
                <input
                  type="text"
                  placeholder="Enter story title..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="px-3 py-1.5 bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition-colors"
                />
              </div>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleNewStory}
                  className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  New Story
                </button>
                <button 
                  onClick={handleSaveStory}
                  className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
                  Save
                </button>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">{saveStatus}</span>
                <button 
                  onClick={() => setShowFormatterPopup(true)}
                  className="inline-flex items-center px-3 py-1.5 bg-cyan-600 text-white text-sm rounded-md hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                  title="Format script with AI"
                >
                  Autopilot
                </button>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6 grid md:grid-cols-12 gap-6">
          {/* Left panel: Character management */}
          <div className="md:col-span-4">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight text-zinc-800 dark:text-zinc-200">Characters</h2>
            </div>
            <CharacterForm 
              onAddCharacter={handleAddCharacter} 
              onUpdateCharacter={handleUpdateCharacter}
              editingCharacter={editingCharacter}
              editingIndex={editingCharacterIndex}
            />
            <CharacterList 
              characters={characters} 
              onRemove={handleRemoveCharacter} 
              onEdit={handleEditCharacter}
            />
            <button
              onClick={() => document.getElementById('story-manager-toggle')?.click()}
              className="w-full inline-flex items-center justify-center px-4 py-2 mb-4 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Show Saved Stories
            </button>
            <StoryManager 
              currentStoryId={currentStoryId}
              onNewStory={handleNewStory}
              onLoadStory={handleLoadStory}
            />
          </div>
          
          {/* Middle panel: Script editor */}
          <div className="md:col-span-8 space-y-4">
            <ScriptEditor 
              characters={characters} 
              onAddLine={handleAddLine} 
            />
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold tracking-tight text-zinc-800 dark:text-zinc-200">Dialogue Lines</h2>
              <div className="flex space-x-2">
                <button 
                  onClick={handleGenerateAllAudio} 
                  disabled={script.length === 0 || isGeneratingAll}
                  className="inline-flex items-center px-3 py-1.5 bg-amber-600 text-white text-sm rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors disabled:opacity-50"
                >
                  {isGeneratingAll ? "Generating..." : "Generate All"}
                </button>
                <button 
                  onClick={() => {
                    console.log('Play All button clicked');
                    playEntireScript();
                  }} 
                  disabled={script.length === 0 || isGenerating}
                  className="inline-flex items-center px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors disabled:opacity-50"
                >
                  {isGenerating ? "Processing..." : "Play All"}
                </button>
                <button 
                  onClick={exportAudio} 
                  disabled={script.length === 0 || isPlayingAll || isGenerating}
                  className="inline-flex items-center px-3 py-1.5 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
                  title="Export as multiple MP3 files (ZIP)"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                  Export ZIP
                </button>
                <button 
                  onClick={exportSingleAudio} 
                  disabled={script.length === 0 || isPlayingAll || isGenerating}
                  className="inline-flex items-center px-3 py-1.5 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors disabled:opacity-50"
                  title="Export as single WAV file"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                  Export Single
                </button>
                <button
                  onClick={() => setScript([])}
                  disabled={script.length === 0}
                  className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors disabled:opacity-50"
                >
                  Clear All
                </button>
              </div>
            </div>
            
            <ScriptDisplay
              script={script}
              characters={characters}
              playingIndex={playingIndex}
              onPlayLine={handlePlayLine}
              onRemoveLine={handleRemoveLine}
              onEditLine={handleEditLine}
              onReorderLines={handleReorderLines}
              audioCache={audioCache}
              onRegenerateLine={handleRegenerateLine}
              onExportLine={handleExportLine}
            />
          </div>
        </div>
      </div>
      
      {/* Play All Popup */}
      <PlayAllPopup 
        isOpen={showPlayAllPopup}
        onClose={closePlayAllPopup}
        currentLineIndex={currentPlayingLine}
        totalLines={script.length}
        currentCharacter={currentPlayingLine !== null ? script[currentPlayingLine]?.characterName || '' : ''}
        currentText={currentPlayingLine !== null ? script[currentPlayingLine]?.text || '' : ''}
        isPlaying={isPlayingAll}
        onPlayPause={togglePlayAll}
        onStop={closePlayAllPopup}
      />
      
      {/* Autopilot Popup */}
      {showAutopilotPopup && (
        <AutopilotPopup
          isOpen={showAutopilotPopup}
          onClose={() => {
            setShowAutopilotPopup(false);
            setAutopilotEnabled(false);
          }}
          onGenerateScript={handleGenerateScript}
          characters={characters}
        />
      )}
      
      {/* Script Formatter Popup */}
      {showFormatterPopup && (
        <ScriptFormatterPopup
          isOpen={showFormatterPopup}
          onClose={() => setShowFormatterPopup(false)}
          script={script}
          characters={characters}
          onImportFormattedScript={handleImportFormattedScript}
        />
      )}
    </main>
  );
}
