export type Voice = 'alloy' | 'ash' | 'ballad' | 'coral' | 'echo' | 'fable' | 'nova' | 'onyx' | 'sage' | 'shimmer' | 'verse';

export interface VoiceInfo {
  id: Voice;
  description: string;
}

export const VOICE_DESCRIPTIONS: VoiceInfo[] = [
  { id: 'alloy', description: 'Female heavy voice suitable for age 30-50' },
  { id: 'ash', description: 'Male heavy voice suitable for age 40-60' },
  { id: 'ballad', description: 'Male heavy voice suitable for age 20-45, good for narration' },
  { id: 'coral', description: 'Female voice suitable for age 20-40, good for narration' },
  { id: 'echo', description: 'Male heavy voice suitable for age 20-45, good for narration' },
  { id: 'fable', description: 'Male voice suitable for age 20-45' },
  { id: 'nova', description: 'Female voice suitable for age 20-40' },
  { id: 'onyx', description: 'Male heavy voice suitable for age 20-45' },
  { id: 'sage', description: 'Female light voice suitable for age 20-40' },
  { id: 'shimmer', description: 'Female voice suitable for age 30-50' },
  { id: 'verse', description: 'Male voice suitable for age 20-45' }
];

export interface Character {
  name: string;
  voice: Voice;
}

export interface ScriptLine {
  characterName: string;
  text: string;
  instructions?: string;
}

export interface StoryScript {
  id: string;
  title: string;
  characters: Character[];
  script: ScriptLine[];
  lastModified: string;
}

export interface AudioGenerationRequest {
  text: string;
  voice: Voice;
  instructions?: string;
}

export interface AudioResponse {
  audioUrl: string;
} 