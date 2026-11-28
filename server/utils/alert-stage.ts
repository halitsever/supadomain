const DAY_MS = 86_400_000;

export const DEFAULT_NOTIFY_DAYS = [30, 7, 1];
export const EXPIRED_STAGE = -1;

/** Smallest threshold the domain has crossed, EXPIRED_STAGE after expiry, null before the first threshold. */
export function alertStage(expireTime: Date, thresholds: number[], now: Date = new Date()): number | null {
  const daysLeft = (expireTime.getTime() - now.getTime()) / DAY_MS;
  if (daysLeft < 0) return EXPIRED_STAGE;

  const crossed = thresholds.filter((threshold) => daysLeft <= threshold);
  return crossed.length ? Math.min(...crossed) : null;
}

/** A stage alerts once, and only when it is closer to expiry than the last one sent. */
export function isAlertDue(stage: number | null, lastNotified: number | null | undefined): stage is number {
  if (stage === null) return false;
  return lastNotified == null || stage < lastNotified;
}

export function expiryLabel(expireTime: Date, now: Date = new Date()): string {
  const days = Math.floor((expireTime.getTime() - now.getTime()) / DAY_MS);
  if (days === 0) return "Expires today";
  if (days === -1) return "Expired today";
  if (days < 0) {
    const since = Math.abs(days) - 1;
    return `${since} day${since === 1 ? "" : "s"} since expiration`;
  }
  return `${days} day${days === 1 ? "" : "s"} until expiration`;
}
