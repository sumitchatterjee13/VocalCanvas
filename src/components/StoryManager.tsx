import React, { useState, useEffect } from 'react';
import { StoryScript } from '@/models/types';
import { getAllStories, deleteStory } from '@/utils/storyDatabase';
import { PlusIcon, TrashIcon, ClockIcon } from '@heroicons/react/24/outline';

interface StoryManagerProps {
  onNewStory: () => void;
  onLoadStory: (story: StoryScript) => void;
  currentStoryId: string | null;
}

export default function StoryManager({ onNewStory, onLoadStory, currentStoryId }: StoryManagerProps) {
  const [stories, setStories] = useState<StoryScript[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [showAllStories, setShowAllStories] = useState(false);

  // Fetch all stories when the component mounts or when it's opened
  useEffect(() => {
    if (isOpen) {
      loadStories();
    }
  }, [isOpen]);

  // Create a deep clone of an object
  const deepClone = <T,>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj));
  };

  // Load all stories from the database
  const loadStories = async () => {
    setIsLoading(true);
    try {
      const allStories = await getAllStories();
      // Stories are already deep cloned in the storyDatabase util
      
      // Sort by last modified date (newest first)
      allStories.sort((a, b) => 
        new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
      );
      
      setStories(allStories);
      console.log('Loaded stories count:', allStories.length);
    } catch (error) {
      console.error('Error loading stories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deleting a story
  const handleDeleteStory = async (id: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent bubbling to parent which would load the story
    
    if (window.confirm('Are you sure you want to delete this story?')) {
      try {
        await deleteStory(id);
        // Refresh the list
        await loadStories();
      } catch (error) {
        console.error('Error deleting story:', error);
      }
    }
  };

  // Format the date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Safely handle loading a story
  const handleLoadStory = (story: StoryScript) => {
    // Create a deep clone of the story before passing it to the parent component
    onLoadStory(deepClone(story));
  };

  // Determine which stories to show
  const displayedStories = showAllStories ? stories : stories.slice(0, 2);
  const hasMoreStories = stories.length > 2;

  if (!isOpen) {
    return (
      <div className="hidden">
        <button
          id="story-manager-toggle"
          onClick={() => setIsOpen(true)}
          className="hidden"
        >
          Toggle Story Manager
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-4 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">
          Saved Stories
        </h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setIsOpen(false)}
            className="px-3 py-1 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 rounded-md hover:bg-zinc-300 dark:hover:bg-zinc-600 focus:outline-none"
          >
            Close
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-4 text-center">
          <p className="text-zinc-500 dark:text-zinc-400">Loading stories...</p>
        </div>
      ) : stories.length === 0 ? (
        <div className="p-4 text-center border border-zinc-300 dark:border-zinc-700 rounded-lg">
          <p className="text-zinc-500 dark:text-zinc-400">No saved stories yet.</p>
        </div>
      ) : (
        <div>
          <div className={`space-y-2 ${showAllStories ? 'max-h-80 overflow-y-auto pr-2' : ''}`}>
            {displayedStories.map((story) => (
              <div
                key={story.id}
                onClick={() => handleLoadStory(story)}
                className={`p-3 border ${
                  currentStoryId === story.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                    : 'bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700'
                } rounded-lg cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-zinc-800 dark:text-zinc-200">{story.title}</h3>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center mt-1">
                      <ClockIcon className="h-3 w-3 mr-1" />
                      {formatDate(story.lastModified)}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      {story.characters.length} characters, {story.script.length} lines
                    </div>
                  </div>
                  <button
                    onClick={(e) => handleDeleteStory(story.id, e)}
                    className="text-red-600 hover:text-red-700 p-1"
                    aria-label={`Delete "${story.title}"`}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {hasMoreStories && (
            <div className="mt-3 text-center">
              <button 
                onClick={() => setShowAllStories(!showAllStories)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {showAllStories ? 'Show Less' : `Show All (${stories.length} stories)`}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 