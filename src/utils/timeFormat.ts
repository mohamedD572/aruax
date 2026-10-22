export function getTimeUntilNextProfit(nextProfitTimeStr?: string): {
  formatted: string;
  hours: number;
  minutes: number;
  seconds: number;
  progressPercent: number;
} {
  if (!nextProfitTimeStr) {
    return { formatted: '24h 00m 00s', hours: 24, minutes: 0, seconds: 0, progressPercent: 0 };
  }
  const nextMs = new Date(nextProfitTimeStr).getTime();
  const nowMs = Date.now();
  const diffMs = nextMs - nowMs;

  if (diffMs <= 0) {
    return { formatted: '00h 00m 00s', hours: 0, minutes: 0, seconds: 0, progressPercent: 100 };
  }

  const hours = Math.floor(diffMs / (3600 * 1000));
  const minutes = Math.floor((diffMs % (3600 * 1000)) / (60 * 1000));
  const seconds = Math.floor((diffMs % (60 * 1000)) / 1000);

  const total24hMs = 24 * 60 * 60 * 1000;
  const elapsedMs = total24hMs - Math.min(total24hMs, diffMs);
  const progressPercent = Math.min(100, Math.max(0, (elapsedMs / total24hMs) * 100));

  const pad = (n: number) => n.toString().padStart(2, '0');
  const formatted = `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;

  return { formatted, hours, minutes, seconds, progressPercent };
}
