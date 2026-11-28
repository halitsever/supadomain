const LABEL = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
const TLD = /^([a-z]{2,63}|xn--[a-z0-9-]{1,59})$/;

/** Reduces input like "https://www.Example.com/path" to "example.com". Returns null when it is not a domain name. */
export function normalizeDomain(input: unknown): string | null {
  if (typeof input !== "string") return null;

  const withoutScheme = input.trim().replace(/^[a-z][a-z0-9+.-]*:\/\//i, "");
  if (!withoutScheme || /\s/.test(withoutScheme)) return null;

  let host: string;
  try {
    // URL parsing drops the path and port, and converts unicode names to punycode.
    host = new URL(`http://${withoutScheme}`).hostname;
  } catch {
    return null;
  }

  host = host.replace(/\.$/, "");
  if (host.split(".").length > 2) host = host.replace(/^www\./, "");

  const labels = host.split(".");
  if (host.length > 253 || labels.length < 2) return null;
  if (!labels.every((label) => LABEL.test(label))) return null;
  if (!TLD.test(labels[labels.length - 1]!)) return null;

  return host;
}
