import React, { useState, useEffect } from 'react';
import { Character, Voice, VOICE_DESCRIPTIONS } from '@/models/types';

interface CharacterFormProps {
  onAddCharacter: (character: Character) => void;
  onUpdateCharacter?: (index: number, character: Character) => void;
  editingCharacter?: Character | null;
  editingIndex?: number | null;
}

// Sort voices alphabetically
const SORTED_VOICES = [...VOICE_DESCRIPTIONS].sort((a, b) => 
  a.id.localeCompare(b.id)
);

export default function CharacterForm({ 
  onAddCharacter, 
  onUpdateCharacter, 
  editingCharacter, 
  editingIndex 
}: CharacterFormProps) {
  const [name, setName] = useState('');
  const [voice, setVoice] = useState<Voice>('alloy');
  const [showTooltip, setShowTooltip] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  // Update form when editing a character
  useEffect(() => {
    if (editingCharacter) {
      setName(editingCharacter.name);
      setVoice(editingCharacter.voice);
      setIsEditing(true);
    } else {
      setName('');
      setVoice('alloy');
      setIsEditing(false);
    }
  }, [editingCharacter]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      if (isEditing && onUpdateCharacter && editingIndex !== undefined && editingIndex !== null) {
        onUpdateCharacter(editingIndex, { name, voice });
      } else {
        onAddCharacter({ name, voice });
      }
      setName('');
      setVoice('alloy');
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setName('');
    setVoice('alloy');
    setIsEditing(false);
  };

  return (
    <div className="mb-6 p-4 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4 tracking-tight text-zinc-800 dark:text-zinc-200">
        {isEditing ? 'Edit Character' : 'Add Story Character'}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="characterName" className="block text-sm font-medium mb-1 text-zinc-800 dark:text-zinc-200">
            Character Name
          </label>
          <input
            type="text"
            id="characterName"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            placeholder="Enter character name"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="voice" className="block text-sm font-medium mb-1 text-zinc-800 dark:text-zinc-200">
            Voice
          </label>
          <div className="relative">
            <select
              id="voice"
              value={voice}
              onChange={(e) => setVoice(e.target.value as Voice)}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              onFocus={() => setShowTooltip(null)}
            >
              {SORTED_VOICES.map((voiceInfo) => (
                <option 
                  key={voiceInfo.id} 
                  value={voiceInfo.id}
                  onMouseEnter={() => setShowTooltip(voiceInfo.id)}
                  onMouseLeave={() => setShowTooltip(null)}
                >
                  {voiceInfo.id.charAt(0).toUpperCase() + voiceInfo.id.slice(1)}
                </option>
              ))}
            </select>
            {showTooltip && (
              <div className="absolute left-0 -bottom-12 w-full bg-zinc-800 text-white p-2 rounded-md text-sm z-10">
                {VOICE_DESCRIPTIONS.find(v => v.id === showTooltip)?.description}
              </div>
            )}
          </div>
          <div className="mt-2 text-xs text-zinc-600 dark:text-zinc-400">
            <span className="font-medium">Current selection:</span> {VOICE_DESCRIPTIONS.find(v => v.id === voice)?.description}
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            type="submit"
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            {isEditing ? 'Update Character' : 'Add Character'}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-zinc-300 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 py-2 px-4 rounded-md hover:bg-zinc-400 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-500 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
} 