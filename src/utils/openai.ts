import OpenAI from 'openai';
import { AudioGenerationRequest } from '../models/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateSpeech(params: AudioGenerationRequest): Promise<ArrayBuffer> {
  try {
    const response = await openai.audio.speech.create({
      model: 'gpt-4o-mini-tts',
      voice: params.voice as any,
      input: params.text,
      instructions: params.instructions || '',
    });
    
    return await response.arrayBuffer();
  } catch (error) {
    console.error('Error generating speech:', error);
    throw error;
  }
} 