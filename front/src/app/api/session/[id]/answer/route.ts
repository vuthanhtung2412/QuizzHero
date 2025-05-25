import { speechToText } from "@/lib/utils"
import { NextResponse } from "next/server"

// https://nextjs.org/docs/app/building-your-application/routing/route-handlers
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = id;
    const body = await request.json();

    if (!body.data || !body.mimeType) {
      return NextResponse.json(
        { error: 'Missing required fields: data and mimeType' },
        { status: 400 }
      );
    }

    // Ensure data is base64
    if (typeof body.data !== 'string') {
      return NextResponse.json(
        { error: 'Data must be base64 encoded string' },
        { status: 400 }
      );
    }

    try {
      // Convert base64 to Uint8Array
      const binaryData = Buffer.from(body.data, 'base64');
      const blob = new Blob([binaryData], { type: body.mimeType });

      // Validate blob
      if (blob.size === 0) {
        throw new Error('Empty audio blob');
      }

      const transcript = await speechToText(blob);
      return NextResponse.json({ transcript });
    } catch (error) {
      console.error('Audio processing error:', error);
      return NextResponse.json(
        {
          detail: {
            status: 'invalid_content',
            message: 'File blob is corrupted or invalid. Please ensure it is playable audio.',
            error: error instanceof Error ? error.message : String(error)
          }
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'Failed to process audio' },
      { status: 500 }
    );
  }
}
