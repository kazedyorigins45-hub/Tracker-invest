import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: 'tracker-invest',
    timestamp: new Date().toISOString(),
  });
}
