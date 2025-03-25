import React, { useState } from 'react';
import { Character, ScriptLine, VOICE_DESCRIPTIONS } from '@/models/types';

interface ScriptEditorProps {
  characters: Character[];
  onAddLine: (line: ScriptLine) => void;
}

export default function ScriptEditor({ characters, onAddLine }: ScriptEditorProps) {
  const [characterName, setCharacterName] = useState('');
  const [text, setText] = useState('');
  const [instructions, setInstructions] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (characterName && text) {
      onAddLine({
        characterName,
        text,
        instructions: instructions.trim() || undefined,
      });
      setText('');
      setInstructions('');
    }
  };

  // Get voice description for a character
  const getVoiceDescription = (name: string): string => {
    const character = characters.find(c => c.name === name);
    if (!character) return '';
    
    const voiceInfo = VOICE_DESCRIPTIONS.find(v => v.id === character.voice);
    return voiceInfo ? voiceInfo.description : '';
  };

  // Sort characters alphabetically
  const sortedCharacters = [...characters].sort((a, b) => 
    a.name.localeCompare(b.name)
  );

  return (
    <div className="mb-6 p-4 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold mb-4 tracking-tight text-zinc-800 dark:text-zinc-200">Add Dialogue</h2>
      {characters.length === 0 ? (
        <p className="text-amber-500">Please add characters first.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="character" className="block text-sm font-medium mb-1 text-zinc-800 dark:text-zinc-200">
              Character
            </label>
            <select
              id="character"
              value={characterName}
              onChange={(e) => setCharacterName(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              required
            >
              <option value="">Select a character</option>
              {sortedCharacters.map((character) => (
                <option key={character.name} value={character.name}>
                  {character.name} - {character.voice}
                </option>
              ))}
            </select>
            {characterName && (
              <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                <span className="font-medium">Voice:</span> {getVoiceDescription(characterName)}
              </div>
            )}
          </div>
          <div className="mb-4">
            <label htmlFor="dialogueText" className="block text-sm font-medium mb-1 text-zinc-800 dark:text-zinc-200">
              Dialogue Text
            </label>
            <textarea
              id="dialogueText"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              rows={3}
              placeholder="Enter dialogue text"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="instructions" className="block text-sm font-medium mb-1 text-zinc-800 dark:text-zinc-200">
              Voice Instructions (optional)
            </label>
            <textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              rows={3}
              placeholder="Enter voice instructions (e.g., 'Speak in a cheerful tone')"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
            disabled={characters.length === 0}
          >
            Add Line
          </button>
        </form>
      )}
    </div>
  );
} 