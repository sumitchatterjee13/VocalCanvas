import React, { useState } from 'react';
import { Character, ScriptLine, VOICE_DESCRIPTIONS } from '@/models/types';
import { PlayIcon, PauseIcon, TrashIcon, PencilIcon, ArrowsUpDownIcon, ArrowPathIcon, ArrowDownTrayIcon } from '@heroicons/react/24/solid';
import { DndContext, DragEndEvent, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AudioPlayer from './AudioPlayer';
import { createAudioUrl, downloadSingleAudioFile, stringToUrlSafeId } from '@/utils/audioPlayer';

interface ScriptDisplayProps {
  script: ScriptLine[];
  characters: Character[];
  onRemoveLine: (index: number) => void;
  onPlayLine: (index: number) => void;
  onEditLine: (index: number, updatedLine: ScriptLine) => void;
  onReorderLines: (startIndex: number, endIndex: number) => void;
  playingIndex: number | null;
  audioCache: Map<string, string>;
  onRegenerateLine: (index: number) => Promise<void>;
  onExportLine: (index: number) => Promise<void>;
}

interface SortableLineProps {
  line: ScriptLine;
  index: number;
  characters: Character[];
  playingIndex: number | null;
  editingIndex: number | null;
  onRemoveLine: (index: number) => void;
  onPlayLine: (index: number) => void;
  onStopLine: () => void;
  onEditStart: (index: number) => void;
  getCharacterVoice: (name: string) => string;
  editingText: string;
  editingCharacter: string;
  editingInstructions: string;
  setEditingText: (text: string) => void;
  setEditingCharacter: (character: string) => void;
  setEditingInstructions: (instructions: string) => void;
  handleSaveEdit: (index: number) => void;
  handleCancelEdit: () => void;
  audioUrl: string | null;
  onRegenerateLine: (index: number) => Promise<void>;
  onExportLine: (index: number) => Promise<void>;
}

// Sortable Line Component
function SortableLine({
  line,
  index,
  characters,
  playingIndex,
  editingIndex,
  onRemoveLine,
  onPlayLine,
  onStopLine,
  onEditStart,
  getCharacterVoice,
  editingText,
  editingCharacter,
  editingInstructions,
  setEditingText,
  setEditingCharacter,
  setEditingInstructions,
  handleSaveEdit,
  handleCancelEdit,
  audioUrl,
  onRegenerateLine,
  onExportLine
}: SortableLineProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({
    id: index.toString()
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0
  };
  
  // Get voice description for a character
  const getVoiceDescription = (characterName: string): string => {
    const character = characters.find(c => c.name === characterName);
    if (!character) return '';
    
    const voiceInfo = VOICE_DESCRIPTIONS.find(v => v.id === character.voice);
    return voiceInfo ? voiceInfo.description : '';
  };
  
  const isPlaying = playingIndex === index;
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 border-b border-zinc-200 dark:border-zinc-700 ${isPlaying ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
    >
      {editingIndex === index ? (
        // Edit mode
        <div>
          <div className="mb-4">
            <label htmlFor={`character-${index}`} className="block text-sm font-medium mb-1 text-zinc-800 dark:text-zinc-200">
              Character
            </label>
            <select
              id={`character-${index}`}
              value={editingCharacter}
              onChange={(e) => setEditingCharacter(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              required
            >
              <option value="">Select a character</option>
              {characters.map((char) => (
                <option key={char.name} value={char.name}>
                  {char.name} - {VOICE_DESCRIPTIONS.find(v => v.id === char.voice)?.id}
                </option>
              ))}
            </select>
            {editingCharacter && (
              <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                <span className="font-medium">Voice:</span> {getVoiceDescription(editingCharacter)}
              </div>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor={`text-${index}`} className="block text-sm font-medium mb-1 text-zinc-800 dark:text-zinc-200">
              Dialogue Text
            </label>
            <textarea
              id={`text-${index}`}
              value={editingText}
              onChange={(e) => setEditingText(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              rows={3}
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor={`instructions-${index}`} className="block text-sm font-medium mb-1 text-zinc-800 dark:text-zinc-200">
              Voice Instructions (optional)
            </label>
            <textarea
              id={`instructions-${index}`}
              value={editingInstructions}
              onChange={(e) => setEditingInstructions(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={handleCancelEdit}
              className="px-3 py-1.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-md hover:bg-zinc-300 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleSaveEdit(index)}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        // View mode
        <div>
          <div className="flex items-center mb-2">
            <div {...attributes} {...listeners} className="mr-2 cursor-grab">
              <ArrowsUpDownIcon className="h-5 w-5 text-zinc-400" />
            </div>
            <div className="font-semibold text-zinc-800 dark:text-zinc-200 flex items-center space-x-1">
              <span>{line.characterName}</span>
              <span className="text-xs bg-zinc-200 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400 px-2 py-0.5 rounded-full">
                {getCharacterVoice(line.characterName)}
              </span>
            </div>
          </div>
          
          <p className="mb-3 text-zinc-900 dark:text-zinc-100">{line.text}</p>
          
          {line.instructions && (
            <div className="mb-4 text-sm italic text-zinc-600 dark:text-zinc-400">
              <p className="mb-1 font-semibold">Instructions:</p>
              <p>{line.instructions}</p>
            </div>
          )}
          
          {/* Audio Player */}
          {audioUrl && (
            <div className="mb-4">
              <AudioPlayer
                src={audioUrl}
                isPlaying={isPlaying}
                onPlayPause={() => onPlayLine(index)}
                onStop={onStopLine}
                onEnded={() => {
                  // When audio ends naturally, we should update the UI
                  if (onStopLine) {
                    onStopLine();
                  }
                }}
              />
            </div>
          )}
          
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => onRegenerateLine(index)}
              className="p-1.5 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-500 transition-colors"
              title="Regenerate audio"
            >
              <ArrowPathIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onExportLine(index)}
              className="p-1.5 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              title="Export audio"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => onEditStart(index)}
              className="p-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              title="Edit line"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            {!isPlaying && (
              <button
                onClick={() => onPlayLine(index)}
                className="p-1.5 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
                title="Play audio"
              >
                <PlayIcon className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => onRemoveLine(index)}
              className="p-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
              title="Remove line"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ScriptDisplay({
  script,
  characters,
  onRemoveLine,
  onPlayLine,
  onEditLine,
  onReorderLines,
  playingIndex,
  audioCache,
  onRegenerateLine,
  onExportLine
}: ScriptDisplayProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState<string>('');
  const [editingCharacter, setEditingCharacter] = useState<string>('');
  const [editingInstructions, setEditingInstructions] = useState<string>('');

  // Set up DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = Number(active.id);
      const newIndex = Number(over.id);
      onReorderLines(oldIndex, newIndex);
    }
  };

  // Get voice for a character
  const getCharacterVoice = (name: string): string => {
    const character = characters.find(c => c.name === name);
    return character ? character.voice : 'Unknown';
  };

  // Start editing a line
  const handleEditStart = (index: number) => {
    const line = script[index];
    setEditingIndex(index);
    setEditingText(line.text);
    setEditingCharacter(line.characterName);
    setEditingInstructions(line.instructions || '');
  };

  // Save edited line
  const handleSaveEdit = (index: number) => {
    if (editingCharacter && editingText) {
      onEditLine(index, {
        characterName: editingCharacter,
        text: editingText,
        instructions: editingInstructions.trim() || undefined
      });
      setEditingIndex(null);
    }
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingIndex(null);
  };

  // Handle stop playing line
  const handleStopLine = () => {
    if (playingIndex !== null) {
      // Call onPlayLine with null to stop playing
      const stopFn = () => onPlayLine(-1); // This will be handled in the parent to stop playback
      stopFn();
    }
  };

  // Get audio URL for a line
  const getAudioUrl = (index: number): string | null => {
    if (index < 0 || index >= script.length) return null;
    
    const line = script[index];
    const cacheKey = `${line.characterName}_${line.text}_${line.instructions || ''}`;
    return audioCache.get(cacheKey) || null;
  };

  const handlePlayPause = (index: number) => {
    if (playingIndex === index) {
      // If this line is currently playing, stop it
      onPlayLine(-1);
    } else {
      // Otherwise, play this line
      onPlayLine(index);
    }
  };

  if (script.length === 0) {
    return (
      <div className="bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg p-5 text-center">
        <p className="text-zinc-500 dark:text-zinc-400">No script lines added yet.</p>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className="bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg overflow-hidden">
        <SortableContext items={script.map((_, i) => i.toString())} strategy={verticalListSortingStrategy}>
          <div className="divide-y divide-zinc-200 dark:divide-zinc-700">
            {script.map((line, index) => (
              <SortableLine
                key={index}
                line={line}
                index={index}
                characters={characters}
                playingIndex={playingIndex}
                editingIndex={editingIndex}
                onRemoveLine={onRemoveLine}
                onPlayLine={handlePlayPause}
                onStopLine={handleStopLine}
                onEditStart={handleEditStart}
                getCharacterVoice={getCharacterVoice}
                editingText={editingText}
                editingCharacter={editingCharacter}
                editingInstructions={editingInstructions}
                setEditingText={setEditingText}
                setEditingCharacter={setEditingCharacter}
                setEditingInstructions={setEditingInstructions}
                handleSaveEdit={handleSaveEdit}
                handleCancelEdit={handleCancelEdit}
                audioUrl={getAudioUrl(index)}
                onRegenerateLine={onRegenerateLine}
                onExportLine={onExportLine}
              />
            ))}
          </div>
        </SortableContext>
      </div>
    </DndContext>
  );
} 