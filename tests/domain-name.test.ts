import { test } from "vitest";
import assert from "node:assert/strict";
import { normalizeDomain } from "../shared/utils/domain-name";

test("keeps a plain domain", () => {
  assert.equal(normalizeDomain("example.com"), "example.com");
  assert.equal(normalizeDomain("x.com"), "x.com");
  assert.equal(normalizeDomain("example.co.uk"), "example.co.uk");
});

test("strips scheme, path, port, www and case", () => {
  assert.equal(normalizeDomain("  HTTPS://www.Example.com:8443/pricing?x=1 "), "example.com");
  assert.equal(normalizeDomain("www.example.com"), "example.com");
  assert.equal(normalizeDomain("example.com."), "example.com");
});

test("converts unicode names to punycode", () => {
  assert.equal(normalizeDomain("münchen.de"), "xn--mnchen-3ya.de");
});

test("rejects input that is not a domain", () => {
  for (const bad of ["", "localhost", "example", "192.168.1.1", "exa mple.com", "../../etc", "a..com", "-a.com", { $ne: null }, null, 42]) {
    assert.equal(normalizeDomain(bad), null, String(bad));
  }
});
