import React from 'react';
import { Character } from '@/models/types';
import { TrashIcon, PencilIcon } from '@heroicons/react/24/outline';

interface CharacterListProps {
  characters: Character[];
  onRemove: (index: number) => void;
  onEdit: (index: number, character: Character) => void;
}

export default function CharacterList({ characters, onRemove, onEdit }: CharacterListProps) {
  if (characters.length === 0) {
    return (
      <div className="p-4 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-center">
        <p className="text-zinc-500 dark:text-zinc-400">No characters added yet.</p>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <h2 className="text-xl font-semibold mb-4 tracking-tight text-zinc-800 dark:text-zinc-200">Characters</h2>
      <div className="space-y-2">
        {characters.map((character, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg shadow-sm">
            <div>
              <p className="font-medium text-zinc-800 dark:text-zinc-200">{character.name}</p>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Voice: {character.voice}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => onEdit(index, character)}
                className="text-blue-600 hover:text-blue-700 focus:outline-none transition-colors"
                aria-label="Edit character"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              <button
                onClick={() => onRemove(index)}
                className="text-red-600 hover:text-red-700 focus:outline-none transition-colors"
                aria-label="Remove character"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 