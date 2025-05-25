import { NextResponse } from 'next/server'
import { BACKEND_URL } from '@/const'
import { textToSpeech } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    // Parse the JSON body to get the audio transcript
    const body = await request.json();
    const { transcript } = body;

    if (!transcript) {
      return NextResponse.json(
        { error: 'Transcript is required in the request body' },
        { status: 400 }
      );
    }

    // Convert text to audio stream using the provided transcript
    const audioStream = await textToSpeech(transcript);

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
