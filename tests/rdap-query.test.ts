import { afterEach, beforeEach, test, vi } from "vitest";
import assert from "node:assert/strict";
import { $fetch as ofetch } from "ofetch";
import executeRdapQuery, { RDAP_USER_AGENT } from "../server/rdap-query";
import { version } from "../package.json";

/** Runs the query through the real ofetch against a stubbed fetch, so status handling matches production. */
function answerWith(response: () => Response) {
  const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) => response());
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

beforeEach(() => vi.stubGlobal("$fetch", ofetch));
afterEach(() => vi.unstubAllGlobals());

test("sends a versioned Supadomain User-Agent and follows redirects", async () => {
  assert.equal(RDAP_USER_AGENT, `Supadomain/${version} (+https://github.com/halitsever/supadomain)`);

  const fetchMock = answerWith(() => Response.json({ events: [{ eventAction: "expiration", eventDate: "2027-08-13T04:00:00Z" }] }));
  const result = await executeRdapQuery("example.com");

  assert.equal(result.success, true);
  assert.equal(result.success && result.expirationDate, "2027-08-13T04:00:00Z");
  const init = fetchMock.mock.calls[0]![1]!;
  assert.equal(new Headers(init.headers).get("user-agent"), RDAP_USER_AGENT);
  assert.equal(init.redirect, "follow");
});

test("a 403 gives a clear refusal message", async () => {
  answerWith(() => new Response("Forbidden", { status: 403 }));
  const result = await executeRdapQuery("example.com");
  assert.deepEqual(result, { success: false, notFound: false, message: "The RDAP server refused the lookup (HTTP 403). Try again later." });
});

test("a 429 says when to retry", async () => {
  answerWith(() => new Response("Too Many Requests", { status: 429, headers: { "Retry-After": "120" } }));
  assert.deepEqual(await executeRdapQuery("example.com"), {
    success: false,
    notFound: false,
    message: "The RDAP server is rate limiting lookups (HTTP 429). Try again in 120 seconds.",
  });

  answerWith(() => new Response("Too Many Requests", { status: 429 }));
  const result = await executeRdapQuery("example.com");
  assert.equal(!result.success && result.message, "The RDAP server is rate limiting lookups (HTTP 429). Try again in a few minutes.");
});

test("a 404 is reported as not found", async () => {
  answerWith(() => new Response("Not Found", { status: 404 }));
  assert.deepEqual(await executeRdapQuery("nope.example"), { success: false, notFound: true, message: "No RDAP record found" });
});
