import { test } from "vitest";
import assert from "node:assert/strict";
import { alertStage, isAlertDue, expiryLabel, EXPIRED_STAGE } from "../server/utils/alert-stage";

const now = new Date("2026-06-01T00:00:00Z");
const inDays = (days: number) => new Date(now.getTime() + days * 86_400_000);

test("no stage before the first threshold", () => {
  assert.equal(alertStage(inDays(45), [30, 7, 1], now), null);
});

test("stage is the smallest threshold already crossed", () => {
  assert.equal(alertStage(inDays(20), [30, 7, 1], now), 30);
  assert.equal(alertStage(inDays(5), [30, 7, 1], now), 7);
  assert.equal(alertStage(inDays(0.5), [30, 7, 1], now), 1);
});

test("threshold order does not matter", () => {
  assert.equal(alertStage(inDays(5), [1, 30, 7], now), 7);
});

test("past expiry is its own stage, even without thresholds", () => {
  assert.equal(alertStage(inDays(-2), [30, 7, 1], now), EXPIRED_STAGE);
  assert.equal(alertStage(inDays(-2), [], now), EXPIRED_STAGE);
});

test("each stage alerts once and later stages still alert", () => {
  assert.equal(isAlertDue(30, null), true);
  assert.equal(isAlertDue(30, 30), false);
  assert.equal(isAlertDue(7, 30), true);
  assert.equal(isAlertDue(1, 7), true);
  assert.equal(isAlertDue(EXPIRED_STAGE, 1), true);
  assert.equal(isAlertDue(EXPIRED_STAGE, EXPIRED_STAGE), false);
  assert.equal(isAlertDue(null, null), false);
});

test("an earlier stage never alerts again", () => {
  assert.equal(isAlertDue(30, 7), false);
});

test("expiry label reads naturally", () => {
  assert.equal(expiryLabel(inDays(20.4), now), "20 days until expiration");
  assert.equal(expiryLabel(inDays(1.5), now), "1 day until expiration");
  assert.equal(expiryLabel(inDays(0.5), now), "Expires today");
  assert.equal(expiryLabel(inDays(-0.5), now), "Expired today");
  assert.equal(expiryLabel(inDays(-3.2), now), "3 days since expiration");
});
