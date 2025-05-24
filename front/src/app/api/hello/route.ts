// app/api/hello.ts
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    return NextResponse.json({
      content: "Hello",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
