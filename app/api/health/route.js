import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'mindset-invest',
    timestamp: new Date().toISOString(),
  });
}
