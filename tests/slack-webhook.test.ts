import { test } from "vitest";
import assert from "node:assert/strict";
import { isWebhookUrl } from "../shared/utils/webhook-url";

test("accepts https webhook urls", () => {
  assert.equal(isWebhookUrl("https://hooks.slack.com/services/T0/B0/abc"), true);
});

test("rejects anything else", () => {
  for (const bad of ["", "http://hooks.slack.com/services/x", "file:///etc/passwd", "not a url", "https://", null, { a: 1 }]) {
    assert.equal(isWebhookUrl(bad), false, String(bad));
  }
});
