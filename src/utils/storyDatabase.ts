import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Character, ScriptLine, StoryScript } from '@/models/types';

interface StoryDB extends DBSchema {
  stories: {
    key: string;
    value: StoryScript;
    indexes: { 'by-title': string };
  };
}

// Database version
const DB_VERSION = 1;
const DB_NAME = 'story-app-db';

// Initialize the database
async function initDB(): Promise<IDBPDatabase<StoryDB>> {
  return openDB<StoryDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Create a store of objects
      const storyStore = db.createObjectStore('stories', {
        // The 'id' property of the story will be the key
        keyPath: 'id',
      });
      // Create an index on the title property
      storyStore.createIndex('by-title', 'title');
    },
  });
}

// Create a deep clone of an object to ensure all nested arrays are cloned properly
function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Save a story to the database
export async function saveStory(story: StoryScript): Promise<string> {
  const db = await initDB();
  
  // Make a deep clone to ensure all nested arrays are properly saved
  const storyToSave = deepClone(story);
  
  // Generate an ID if one doesn't exist
  if (!storyToSave.id) {
    storyToSave.id = Date.now().toString();
  }
  
  // Add a timestamp for last modified
  storyToSave.lastModified = new Date().toISOString();
  
  try {
    await db.put('stories', storyToSave);
    return storyToSave.id;
  } catch (error) {
    console.error('Error saving story to database:', error);
    throw error;
  }
}

// Load a story from the database
export async function loadStory(id: string): Promise<StoryScript | undefined> {
  try {
    const db = await initDB();
    const story = await db.get('stories', id);
    
    // Return a deep clone to ensure data integrity
    return story ? deepClone(story) : undefined;
  } catch (error) {
    console.error('Error loading story from database:', error);
    throw error;
  }
}

// Get all stories from the database
export async function getAllStories(): Promise<StoryScript[]> {
  try {
    const db = await initDB();
    const stories = await db.getAll('stories');
    
    // Return deep clones to ensure data integrity
    return stories.map(story => deepClone(story));
  } catch (error) {
    console.error('Error getting all stories from database:', error);
    throw error;
  }
}

// Delete a story from the database
export async function deleteStory(id: string): Promise<void> {
  try {
    const db = await initDB();
    await db.delete('stories', id);
  } catch (error) {
    console.error('Error deleting story from database:', error);
    throw error;
  }
}

// Create a blank new story
export function createNewStory(): StoryScript {
  return {
    id: '',
    title: 'Untitled Story',
    characters: [],
    script: [],
    lastModified: new Date().toISOString(),
  };
} 