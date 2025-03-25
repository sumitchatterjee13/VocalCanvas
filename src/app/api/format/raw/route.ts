import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Character } from '@/models/types';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Get model from environment variable or use default
const FORMATTER_MODEL = process.env.FORMATTER_MODEL || "gpt-4o-mini";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { rawText, characters } = body;

    // Validate input
    if (!rawText || typeof rawText !== 'string' || rawText.trim() === '') {
      return NextResponse.json({ error: 'Valid dialogue text is required' }, { status: 400 });
    }

    if (!characters || !Array.isArray(characters) || characters.length === 0) {
      return NextResponse.json({ error: 'Valid characters are required' }, { status: 400 });
    }

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
          Your task is to take a raw script and format each line with specific voice instructions.
          
          For each dialogue line, analyze any existing parenthetical instructions and context, then format it with detailed voice instructions in this exact format:
          
          CHARACTER NAME: Dialogue text without any instructions or stage directions.
          
          (Voice Affect: [description]; Tone: [description]; Pacing: [description]; Emotion: [description]; Emphasis: [description]; Pronunciation: [description]; Pauses: [description])
          
          IMPORTANT: Always put the voice instruction on a separate line after the dialogue, with a blank line between them.
          
          Make sure to:
          1. Preserve only the actual dialogue text, removing any original parenthetical acting directions from the dialogue line
          2. Convert the original acting directions into comprehensive voice instructions in a separate paragraph
          3. Include appropriate instructions for voice affect, tone, pacing, emotion, word emphasis, pronunciation guides, and pause timing
          4. Match the voice instructions to the character's personality and the context of the dialogue
          5. Keep the character names exactly as provided
          6. Always follow the exact format shown above with clear separation between dialogue and instructions
          
          Example transformation:
          
          Original:
          RAYMOND: Unsolved mysteries. (Pauses) Unsolved mysteries.
          
          Becomes:
          RAYMOND: Unsolved mysteries. Unsolved mysteries.
          
          (Voice Affect: Low, hushed, and suspenseful; convey tension and intrigue. Tone: Deeply serious and mysterious, maintaining an undercurrent of unease. Pacing: Slow, deliberate, pausing slightly after "mysteries" to heighten drama. Emotion: Restrained yet intense. Emphasis: On "Unsolved mysteries". Pronunciation: Slightly elongated vowels. Pauses: Pause after each "Unsolved mysteries")
          
          Character information:
          ${characterInfo}`
        },
        {
          role: "user",
          content: `Here is my script dialogue. Please format it with detailed voice instructions for each line:

          ${rawText}`
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