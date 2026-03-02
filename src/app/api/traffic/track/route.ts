import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import {
  buildFingerprintHash,
  getClientIp,
  getPeriodKeys,
  isBotUserAgent,
  TRAFFIC_TIMEZONE,
} from '@/lib/traffic';

export async function POST(request: NextRequest) {
  try {
    const userAgent = request.headers.get('user-agent') ?? '';

    if (isBotUserAgent(userAgent)) {
      return NextResponse.json({ tracked: false, reason: 'bot' });
    }

    let path = '/';
    try {
      const body = await request.json();
      if (body?.path && typeof body.path === 'string') {
        path = body.path.trim() || '/';
      }
    } catch {
      // Ignore invalid body. Tracking still works with default path.
    }

    const acceptLanguage = request.headers.get('accept-language') ?? '';
    const ip = getClientIp(request.headers);
    const fingerprintHash = buildFingerprintHash({
      ip,
      userAgent,
      acceptLanguage,
    });
    const now = new Date();
    const { dayKey, monthKey, yearKey } = getPeriodKeys(now, TRAFFIC_TIMEZONE);

    await db.visitorEvent.create({
      data: {
        fingerprintHash,
        path: path.slice(0, 255),
        dayKey,
        monthKey,
        yearKey,
        createdAt: now,
      },
    });

    return NextResponse.json({ tracked: true });
  } catch (error) {
    console.error('Traffic track error:', error);
    return NextResponse.json(
      { tracked: false, reason: 'server_error' },
      { status: 500 }
    );
  }
}
