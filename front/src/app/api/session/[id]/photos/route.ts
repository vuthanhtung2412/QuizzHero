import { NextRequest, NextResponse } from 'next/server'
import { BACKEND_URL } from '@/const'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sessionId = params.id;

    // Parse the request body
    const body = await request.json();
    const { photos } = body;

    // Validate input
    if (!photos || !Array.isArray(photos)) {
      return NextResponse.json(
        { error: 'Photos array is required' },
        { status: 400 }
      );
    }

    if (photos.length === 0) {
      return NextResponse.json(
        { error: 'At least one photo is required' },
        { status: 400 }
      );
    }

    // Extract base64 data from photos
    // Remove data URL prefix if present (e.g., "data:image/jpeg;base64,")
    const base64_docs = photos.map((photo: { base64Url: string }) => {
      let base64Data = photo.base64Url;

      // Remove data URL prefix if present
      if (base64Data.includes(',')) {
        base64Data = base64Data.split(',')[1];
      }

      return base64Data;
    });

    // Send to Python backend
    const response = await fetch(`${BACKEND_URL}/session/${sessionId}/doc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        base64_docs: base64_docs
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to upload photos to backend');
    }

    const data = await response.json();

    return NextResponse.json({
      success: data.success,
      message: `Successfully uploaded ${photos.length} photo(s) to session ${sessionId}`
    });

  } catch (error) {
    console.error('Error uploading photos:', error);
    return NextResponse.json(
      {
        error: 'Failed to upload photos',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
