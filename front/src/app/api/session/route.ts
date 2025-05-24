import { NextResponse } from 'next/server'
import { BACKEND_URL } from '@/const'

export async function POST() {
  try {
    const response = await fetch(`${BACKEND_URL}/session`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const data = await response.json();
    
    if (!data?.session_id) {
      throw new Error('Could not create session');
    }

    return NextResponse.json({ session_id: data.session_id });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    );
  }
} 