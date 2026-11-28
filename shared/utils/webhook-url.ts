/** The server posts to this URL, so only well-formed https URLs are accepted. */
export function isWebhookUrl(input: unknown): input is string {
  if (typeof input !== "string") return false;
  try {
    const url = new URL(input);
    return url.protocol === "https:" && url.hostname.includes(".");
  } catch {
    return false;
  }
}
