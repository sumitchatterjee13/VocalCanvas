import { useState, useEffect, useRef } from 'react';
import { Character, ScriptLine } from '@/models/types';
import { XMarkIcon, DocumentDuplicateIcon, CheckIcon } from '@heroicons/react/24/outline';

interface ScriptFormatterPopupProps {
  isOpen: boolean;
  onClose: () => void;
  script: ScriptLine[];
  characters: Character[];
  onImportFormattedScript: (formattedLines: ScriptLine[]) => void;
}

export default function ScriptFormatterPopup({
  isOpen,
  onClose,
  script,
  characters,
  onImportFormattedScript
}: ScriptFormatterPopupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formattedScript, setFormattedScript] = useState<string>('');
  const [rawInput, setRawInput] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [showImportOptions, setShowImportOptions] = useState(false);
  const [parsedLines, setParsedLines] = useState<ScriptLine[]>([]);
  
  const formatScript = async () => {
    if (!rawInput.trim()) {
      setError('Please enter some dialogue text to format');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/format/raw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rawText: rawInput,
          characters: characters
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to format script');
      }

      const data = await response.json();
      setFormattedScript(data.formattedScript);
    } catch (error: any) {
      console.error('Error formatting script:', error);
      setError(error.message || 'An error occurred while formatting the script');
    } finally {
      setIsLoading(false);
    }
  };

  const parseFormattedScript = () => {
    try {
      // Parse the formatted text and create script lines
      const lines = formattedScript.split('\n\n').filter(section => section.trim() !== '');
      const formattedLines: ScriptLine[] = [];
      
      let i = 0;
      while (i < lines.length) {
        // The dialogue line is in this format: "CHARACTER: Text"
        const dialogueLine = lines[i];
        const colonIndex = dialogueLine.indexOf(':');
        
        if (colonIndex > 0) {
          const characterName = dialogueLine.substring(0, colonIndex).trim();
          let text = dialogueLine.substring(colonIndex + 1).trim();
          
          // Extract voice instructions if they're embedded in the text
          let instructions = '';
          
          // Check if the next section is separate voice instructions (starting with parenthesis)
          if (i + 1 < lines.length && lines[i + 1].trim().startsWith('(')) {
            instructions = lines[i + 1].trim();
            i += 2; // Skip both the dialogue and instructions
          } else {
            // Check if voice instructions are embedded in the text
            const voiceInstructionStart = text.indexOf('(Voice Affect:');
            if (voiceInstructionStart > -1) {
              // Split the text to separate dialogue from instructions
              instructions = text.substring(voiceInstructionStart).trim();
              text = text.substring(0, voiceInstructionStart).trim();
            }
            i += 1; // Skip just the dialogue
          }
          
          formattedLines.push({
            characterName,
            text,
            instructions
          });
        } else {
          i += 1; // Skip this line if it doesn't follow the format
        }
      }
      
      if (formattedLines.length > 0) {
        return formattedLines;
      } else {
        throw new Error('Failed to parse formatted script. Check the format and try again.');
      }
    } catch (error) {
      console.error('Error parsing formatted script:', error);
      throw error;
    }
  };

  const handleImportClick = () => {
    try {
      const formattedLines = parseFormattedScript();
      setParsedLines(formattedLines);
      
      if (script.length > 0) {
        // If there's existing script, ask what to do
        setShowImportOptions(true);
      } else {
        // If there's no existing script, just import
        onImportFormattedScript(formattedLines);
        onClose();
      }
    } catch (error: any) {
      setError(error.message || 'Failed to import the formatted script');
    }
  };

  const handleImport = (appendMode: boolean) => {
    try {
      if (appendMode) {
        // Append mode: Add new lines to existing script
        onImportFormattedScript([...script, ...parsedLines]);
      } else {
        // Replace mode: Use only new lines
        onImportFormattedScript(parsedLines);
      }
      onClose();
    } catch (error: any) {
      console.error('Error importing formatted script:', error);
      setError(error.message || 'Failed to import the formatted script');
    } finally {
      setShowImportOptions(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(formattedScript);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      setError('Failed to copy to clipboard');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            Autopilot - Script Formatter with Voice Instructions
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-grow overflow-auto">
          <div className="mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Paste Your Dialogue
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Paste your dialogue text below. Format: "CHARACTER: Dialogue text." 
              The AI will enhance it with voice instructions. For very large scripts, consider formatting in smaller chunks.
            </p>
            <div className="relative">
              <textarea
                value={rawInput}
                onChange={(e) => setRawInput(e.target.value)}
                placeholder='Example:
RAYMOND: Unsolved mysteries. (Pauses) Unsolved mysteries.
JOYCE: (Laughing) Raymond just likes the sound of the words and of himself saying them.
RAYMOND: (With playful reproach) Joyce, you wound me!'
                className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-zinc-900 text-gray-900 dark:text-gray-100 min-h-[150px]"
              />
              <div className="mt-2 flex justify-end">
                <button
                  onClick={formatScript}
                  disabled={isLoading || !rawInput.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "Formatting..." : "Format with AI"}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-500 p-4 mb-4 bg-red-50 dark:bg-red-900/20 rounded-md">
              <p>Error: {error}</p>
            </div>
          )}

          {formattedScript && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  Formatted Script with Voice Instructions
                </h3>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-sm rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none transition-colors"
                >
                  {copySuccess ? (
                    <>
                      <CheckIcon className="h-4 w-4 mr-1 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
                      Copy
                    </>
                  )}
                </button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-md border border-gray-200 dark:border-gray-700 overflow-auto max-h-[50vh]">
                <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono">
                  {formattedScript}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none transition-colors"
          >
            Cancel
          </button>
          {formattedScript && (
            <button
              onClick={handleImportClick}
              disabled={isLoading || !formattedScript}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Import Formatted Script
            </button>
          )}
        </div>
      </div>

      {/* Import Options Modal */}
      {showImportOptions && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[60]">
          <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-xl p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Import Options
            </h3>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              You already have {script.length} line{script.length !== 1 ? 's' : ''} in your script. 
              Would you like to append the formatted lines or replace the existing script?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowImportOptions(false)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 focus:outline-none transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleImport(false)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none transition-colors"
              >
                Replace
              </button>
              <button
                onClick={() => handleImport(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none transition-colors"
              >
                Append
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
