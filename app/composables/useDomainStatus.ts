export type DomainStatus = "healthy" | "warning" | "critical" | "expired" | "unknown";

export function getDomainStatus(expireTime: string | null): DomainStatus {
  if (!expireTime) return "unknown";
  const days = (new Date(expireTime).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (days < 0) return "expired";
  if (days <= 7) return "critical";
  if (days <= 30) return "warning";
  return "healthy";
}

export function getDaysLeft(expireTime: string | null): number | null {
  if (!expireTime) return null;
  return Math.floor((new Date(expireTime).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

export const statusConfig = {
  healthy: {
    dotClass: "bg-success",
    textClass: "text-success",
    pillClass: "bg-success/10 text-success border-success/25",
    label: "Healthy",
  },
  warning: {
    dotClass: "bg-warning",
    textClass: "text-warning",
    pillClass: "bg-warning/10 text-warning border-warning/25",
    label: "Warning",
  },
  critical: {
    dotClass: "bg-critical",
    textClass: "text-critical",
    pillClass: "bg-critical/10 text-critical border-critical/25",
    label: "Critical",
  },
  expired: {
    dotClass: "bg-destructive",
    textClass: "text-destructive",
    pillClass: "bg-destructive/10 text-destructive border-destructive/25",
    label: "Expired",
  },
  unknown: {
    dotClass: "bg-muted-foreground",
    textClass: "text-muted-foreground",
    pillClass: "bg-muted text-muted-foreground border-border",
    label: "Unknown",
  },
} as const;
