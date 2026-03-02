import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getPeriodKeys, TRAFFIC_TIMEZONE } from '@/lib/traffic';

export const dynamic = 'force-dynamic';

type CountRow = {
  count: number | bigint | string;
};

function toNumber(value: number | bigint | string | null | undefined): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'bigint') return Number(value);
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

async function countUniqueByPeriod(
  column: 'dayKey' | 'monthKey' | 'yearKey',
  key: string
) {
  let rows: CountRow[] = [];
  if (column === 'dayKey') {
    rows = await db.$queryRaw<CountRow[]>`
      SELECT COUNT(DISTINCT "fingerprintHash") AS count
      FROM "VisitorEvent"
      WHERE "dayKey" = ${key}
    `;
  } else if (column === 'monthKey') {
    rows = await db.$queryRaw<CountRow[]>`
      SELECT COUNT(DISTINCT "fingerprintHash") AS count
      FROM "VisitorEvent"
      WHERE "monthKey" = ${key}
    `;
  } else {
    rows = await db.$queryRaw<CountRow[]>`
      SELECT COUNT(DISTINCT "fingerprintHash") AS count
      FROM "VisitorEvent"
      WHERE "yearKey" = ${key}
    `;
  }

  return toNumber(rows[0]?.count);
}

async function countTotalByPeriod(
  column: 'dayKey' | 'monthKey' | 'yearKey',
  key: string
) {
  if (column === 'dayKey') {
    return db.visitorEvent.count({ where: { dayKey: key } });
  }
  if (column === 'monthKey') {
    return db.visitorEvent.count({ where: { monthKey: key } });
  }
  return db.visitorEvent.count({ where: { yearKey: key } });
}

export async function GET() {
  try {
    const now = new Date();
    const { dayKey, monthKey, yearKey } = getPeriodKeys(now, TRAFFIC_TIMEZONE);

    const [
      dailyUnique,
      dailyTotal,
      monthlyUnique,
      monthlyTotal,
      yearlyUnique,
      yearlyTotal,
    ] = await Promise.all([
      countUniqueByPeriod('dayKey', dayKey),
      countTotalByPeriod('dayKey', dayKey),
      countUniqueByPeriod('monthKey', monthKey),
      countTotalByPeriod('monthKey', monthKey),
      countUniqueByPeriod('yearKey', yearKey),
      countTotalByPeriod('yearKey', yearKey),
    ]);

    return NextResponse.json({
      timezone: TRAFFIC_TIMEZONE,
      updatedAt: now.toISOString(),
      daily: {
        unique: dailyUnique,
        total: dailyTotal,
        periodLabel: dayKey,
      },
      monthly: {
        unique: monthlyUnique,
        total: monthlyTotal,
        periodLabel: monthKey,
      },
      yearly: {
        unique: yearlyUnique,
        total: yearlyTotal,
        periodLabel: yearKey,
      },
    });
  } catch (error) {
    console.error('Traffic summary error:', error);
    return NextResponse.json(
      { message: 'Gagal memuat ringkasan traffic.' },
      { status: 500 }
    );
  }
}
