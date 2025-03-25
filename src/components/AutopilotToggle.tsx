import React from 'react';
import { SparklesIcon } from '@heroicons/react/24/solid';

interface AutopilotToggleProps {
  enabled: boolean;
  disabled?: boolean;
  onChange: (enabled: boolean) => void;
}

export default function AutopilotToggle({ enabled, disabled = false, onChange }: AutopilotToggleProps) {
  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={() => onChange(!enabled)}
        disabled={disabled}
        className={`
          relative inline-flex h-9 w-20 shrink-0 cursor-pointer rounded-full border-2 border-transparent 
          transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 
          focus:ring-offset-2 ${enabled ? 'bg-blue-600' : 'bg-zinc-200 dark:bg-zinc-700'}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        aria-pressed={enabled}
        aria-label="Toggle autopilot mode"
      >
        <span className="sr-only">Use autopilot</span>
        <span
          aria-hidden="true"
          className={`
            pointer-events-none inline-block h-8 w-8 transform rounded-full 
            bg-white shadow-lg ring-0 transition duration-200 ease-in-out 
            flex items-center justify-center
            ${enabled ? 'translate-x-10' : 'translate-x-0'}
          `}
        >
          <SparklesIcon className={`h-4 w-4 ${enabled ? 'text-blue-600' : 'text-zinc-400'}`} />
        </span>
      </button>
      <span className="ml-3 text-sm font-medium text-zinc-800 dark:text-zinc-200">
        Autopilot
      </span>
    </div>
  );
} 