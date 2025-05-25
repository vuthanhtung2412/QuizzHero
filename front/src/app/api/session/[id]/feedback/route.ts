import { NextResponse } from 'next/server'
import { BACKEND_URL } from '@/const'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = id;
    const body = await request.json();

    if (!body.transcript) {
      return NextResponse.json(
        { error: 'Transcript is required in the request body' },
        { status: 400 }
      );
    }

    // Call the backend API to get AI feedback
    const backendResponse = await fetch(`${BACKEND_URL}/session/${sessionId}/answer`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_answer: body.transcript }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      return NextResponse.json(
        { error: errorData.detail || 'Failed to get AI feedback' },
        { status: backendResponse.status }
      );
    }

    const data = await backendResponse.json();
    return NextResponse.json({ feedback: data.response });

  } catch (error) {
    console.error('Error getting AI feedback:', error);
    return NextResponse.json(
      { error: 'Failed to process feedback request' },
      { status: 500 }
    );
  }
}
