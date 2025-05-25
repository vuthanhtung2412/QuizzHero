import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: sessionId } = await params

    // Validate session ID
    if (!sessionId || isNaN(Number(sessionId))) {
      return NextResponse.json(
        { error: 'Invalid session ID' },
        { status: 400 }
      )
    }

    // Call the Python backend
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000'
    const response = await fetch(`${backendUrl}/session/${sessionId}/question/followup`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }))
      return NextResponse.json(
        { error: errorData.detail || 'Failed to get follow-up question' },
        { status: response.status }
      )
    }

    const { question, total, current } = await response.json()
    return NextResponse.json({
      question,
      total,
      current
    })

  } catch (error) {
    console.error('Error getting follow-up question:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
