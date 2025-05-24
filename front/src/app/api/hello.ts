// app/api/hello.ts
import { NextResponse } from 'next/server';

// GET /api/users
export async function GET(request) {
  try {
    // You can access query parameters like this:
    const { searchParams } = new URL(request.url);

    return NextResponse.json({
      success: true,
      data: response,
      total: users.length
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
