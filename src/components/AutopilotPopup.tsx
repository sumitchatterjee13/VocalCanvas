import React, { useState } from 'react';
import { Character, ScriptLine } from '@/models/types';
import { parseScript, validateScriptCharacters } from '@/utils/scriptParser';

interface AutopilotPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateScript: (scriptLines: ScriptLine[]) => void;
  characters: Character[];
}

export default function AutopilotPopup({ isOpen, onClose, onGenerateScript, characters }: AutopilotPopupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [rawScript, setRawScript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [missingCharacters, setMissingCharacters] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!rawScript.trim()) {
      setError("Please enter a script");
      return;
    }

    setIsLoading(true);

    try {
      // Call the API to generate the script
      const response = await fetch('/api/script', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script: rawScript,
          characters,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate script');
      }

      const data = await response.json();
      const generatedScript = data.generatedScript;
      
      // Parse the generated script into ScriptLine objects
      const scriptLines = parseScript(generatedScript);
      
      // Validate that all characters in the script exist in our available characters
      const characterNames = characters.map(c => c.name);
      const validation = validateScriptCharacters(scriptLines, characterNames);
      
      if (!validation.isValid) {
        setMissingCharacters(validation.missingCharacters);
        setError(`Some characters in the script don't have assigned voices: ${validation.missingCharacters.join(', ')}`);
        return;
      }
      
      // Send the parsed script lines to the parent component
      onGenerateScript(scriptLines);
      onClose();
      
    } catch (error) {
      console.error('Error generating script:', error);
      setError('Failed to generate script. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200">
            Story Autopilot
          </h3>
          <button 
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
          <p className="mb-4 text-zinc-700 dark:text-zinc-300">
            Enter your script below and our AI will format it for the story app. Available characters: {characters.map(c => c.name).join(', ')}
          </p>

          {error && (
            <div className="mb-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded-md">
              {error}
              {missingCharacters.length > 0 && (
                <div className="mt-2">
                  <p className="font-semibold">Please add these characters first:</p>
                  <ul className="list-disc list-inside">
                    {missingCharacters.map(char => (
                      <li key={char}>{char}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="script" className="block text-sm font-medium mb-1 text-zinc-800 dark:text-zinc-200">
                Script Content
              </label>
              <textarea
                id="script"
                value={rawScript}
                onChange={(e) => setRawScript(e.target.value)}
                className="w-full px-3 py-2 bg-white dark:bg-zinc-700 border border-zinc-300 dark:border-zinc-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                rows={15}
                placeholder="Enter your script here... e.g.

RAYMOND: Unsolved mysteries. (Pauses) Unsolved mysteries.

(Voice Affect: Low, hushed, and suspenseful; convey tension and intrigue...)"
                required
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={onClose}
                className="mr-3 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 py-2 px-4 rounded-md hover:bg-zinc-300 dark:hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Generating...' : 'Generate Script'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 