import { NextRequest, NextResponse } from 'next/server';
import { generateSpeech } from '@/utils/openai';
import { AudioGenerationRequest } from '@/models/types';

export async function POST(request: NextRequest) {
  try {
    const body: AudioGenerationRequest = await request.json();
    
    if (!body.text || !body.voice) {
      return NextResponse.json(
        { error: 'Missing required fields: text and voice' },
        { status: 400 }
      );
    }
    
    const audioBuffer = await generateSpeech({
      text: body.text,
      voice: body.voice,
      instructions: body.instructions,
    });
    
    // Convert ArrayBuffer to Buffer for response
    const buffer = Buffer.from(audioBuffer);
    
    // Return audio as binary response
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error processing audio request:', error);
    return NextResponse.json(
      { error: 'Failed to generate audio' },
      { status: 500 }
    );
  }
} 