import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Character } from '@/models/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Get model from environment variable or use default
const AUTOPILOT_MODEL = process.env.AUTOPILOT_MODEL || "gpt-4o-mini";

interface ScriptGenerationRequest {
  script: string;
  characters: Character[];
}

export async function POST(request: NextRequest) {
  try {
    const body: ScriptGenerationRequest = await request.json();
    
    if (!body.script || !body.characters || !body.characters.length) {
      return NextResponse.json(
        { error: 'Missing required fields: script and characters' },
        { status: 400 }
      );
    }

    // Format character information for the AI
    const characterInfo = body.characters.map(char => 
      `${char.name}: Using voice "${char.voice}"`
    ).join('\n');
    
    // Call OpenAI API with model from environment variable
    const completion = await openai.chat.completions.create({
      model: AUTOPILOT_MODEL,
      messages: [
        {
          role: "system",
          content: `You are an intelligent story script generator for a text-to-speech application. 
          Your task is to convert the user's input script into a properly formatted script with dialogue and voice instructions.
          
          The script format should be as follows:
          
          CHARACTER_NAME: Dialogue text.
          
          (Voice Affect: description; Tone: description; Pacing: description; Emotion: description; Emphasis: description; Pronunciation: description; Pauses: description)
          
          Available characters and their assigned voices:
          ${characterInfo}
          
          Only use characters that have been provided. If there are any stage directions or narrative elements that aren't spoken by a character, format them appropriately as action descriptions in parentheses.`
        },
        {
          role: "user",
          content: body.script
        }
      ],
      temperature: 0.7,
      max_tokens: 16000
    });
    
    return NextResponse.json({ 
      generatedScript: completion.choices[0]?.message?.content || "" 
    });
  } catch (error) {
    console.error('Error processing script generation request:', error);
    return NextResponse.json(
      { error: 'Failed to generate script' },
      { status: 500 }
    );
  }
} 