import { createHash } from 'node:crypto';

export const TRAFFIC_TIMEZONE = 'Asia/Makassar';

interface FingerprintInput {
  ip: string;
  userAgent: string;
  acceptLanguage: string;
  salt?: string;
}

function getDateParts(date: Date, timezone: string) {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === 'year')?.value ?? '0000';
  const month = parts.find((part) => part.type === 'month')?.value ?? '01';
  const day = parts.find((part) => part.type === 'day')?.value ?? '01';

  return { year, month, day };
}

export function getPeriodKeys(date: Date, timezone: string = TRAFFIC_TIMEZONE) {
  const { year, month, day } = getDateParts(date, timezone);

  return {
    dayKey: `${year}-${month}-${day}`,
    monthKey: `${year}-${month}`,
    yearKey: year,
  };
}

export function isBotUserAgent(userAgent: string | null | undefined): boolean {
  if (!userAgent) return false;
  return /(bot|crawler|spider|slurp|crawling|preview|facebookexternalhit|whatsapp|curl|wget|httpclient|python-requests)/i.test(
    userAgent
  );
}

export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    const ip = forwardedFor.split(',')[0]?.trim();
    if (ip) return ip;
  }

  const realIp = headers.get('x-real-ip');
  if (realIp?.trim()) return realIp.trim();

  return '0.0.0.0';
}

export function buildFingerprintHash(input: FingerprintInput): string {
  const salt =
    input.salt ??
    process.env.TRAFFIC_FINGERPRINT_SALT ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    'invoice-generator-traffic-salt';

  const raw = `${input.ip}|${input.userAgent}|${input.acceptLanguage}|${salt}`;
  return createHash('sha256').update(raw).digest('hex');
}
