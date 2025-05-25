import { NextResponse } from 'next/server'
import { BACKEND_URL } from '@/const'
import { textToSpeech } from '@/lib/utils'

export async function POST() {
  try {
    // Convert text to audio stream
    // TODO:
    const audioStream = await textToSpeech("Question go here");
    
    // Convert stream to chunks
    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) {
      chunks.push(Buffer.from(chunk));
    }
    
    // Combine chunks into a single buffer
    const audioBuffer = Buffer.concat(chunks);
    
    // Return as streaming response
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Error creating audio:', error);
    return NextResponse.json(
      { error: 'Failed to create audio' },
      { status: 500 }
    );
  }
} 
