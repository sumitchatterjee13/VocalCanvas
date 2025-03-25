import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Character, ScriptLine } from '@/models/types';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Get model from environment variable or use default
const FORMATTER_MODEL = process.env.FORMATTER_MODEL || "gpt-4o-mini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scriptLines, characters } = body;

    // Validate input
    if (!scriptLines || !Array.isArray(scriptLines) || scriptLines.length === 0) {
      return NextResponse.json({ error: 'Valid script lines are required' }, { status: 400 });
    }

    if (!characters || !Array.isArray(characters) || characters.length === 0) {
      return NextResponse.json({ error: 'Valid characters are required' }, { status: 400 });
    }

    // Construct a plain text version of the script for the AI
    const plainScript = scriptLines.map((line: ScriptLine) => {
      // Use characterName directly from the ScriptLine as per the types
      return `${line.characterName}: ${line.text}`;
    }).join('\n\n');

    // Format character information for the AI
    const characterInfo = characters.map((char: Character) => {
      return `${char.name}: ${char.voice || 'No specific voice'}`;
    }).join('\n');

    // Call OpenAI API with the model from environment variable
    const completion = await openai.chat.completions.create({
      model: FORMATTER_MODEL,
      messages: [
        {
          role: "system",
          content: `You are an expert script formatter that enhances dialogue with detailed voice instructions for voice actors. 
          Your task is to take a script and format each line with specific voice instructions.
          
          For each dialogue line, add detailed voice instructions in the following format:
          
          CHARACTER NAME: [voice affect: calm; tone: sincere; pacing: moderate; emotion: thoughtful; emphasis: "important words"; pronunciation guide: difficult words; pause timing: indicates where pauses should occur] The dialogue text.
          
          Make sure to:
          1. Preserve the original dialogue text exactly as provided
          2. Add detailed voice instructions in brackets before each line
          3. Include appropriate instructions for voice affect, tone, pacing, emotion, word emphasis, pronunciation guides, and pause timing
          4. Match the voice instructions to the character's personality and the context of the dialogue
          5. Keep the character names exactly as provided
          
          Character information:
          ${characterInfo}`
        },
        {
          role: "user",
          content: `Here is my script. Please format it with detailed voice instructions for each line:

          ${plainScript}`
        }
      ],
      temperature: 0.7,
      max_tokens: 16000,
    });

    // Get the AI-generated formatted script
    const formattedScript = completion.choices[0].message.content || '';

    // Return the formatted script
    return NextResponse.json({ formattedScript });

  } catch (error: any) {
    console.error('Error formatting script:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred while formatting the script' },
      { status: 500 }
    );
  }
} 