import { NextRequest, NextResponse } from 'next/server'
import { BACKEND_URL } from '@/const'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = id;

    const response = await fetch(`${BACKEND_URL}/session/${sessionId}/question`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to get question from backend');
    }

    const { question, total, current } = await response.json();

    return NextResponse.json({ 
      question,
      total,
      current
     });
  } catch (error) {
    console.error('Error getting session question:', error);
    return NextResponse.json(
      {
        error: 'Failed to get session question',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
