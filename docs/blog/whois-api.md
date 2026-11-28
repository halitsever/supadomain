---
title: "A Free WHOIS API Alternative: Query RDAP as JSON"
titleTemplate: false
description: "Use RDAP as a free WHOIS API: one HTTPS request returns JSON with expiry date, status, registrar and nameservers. Examples in curl and Node.js, plus the limits."
headline: "A free WHOIS API: query RDAP and get JSON back"
date: "2026-11-28"
keyword: "whois api"
faq: [{"q": "Is there a free WHOIS API?", "a": "For gTLDs, RDAP is one. Every gTLD registry and registrar must run an RDAP server that answers HTTPS requests with JSON, with no key. Public redirectors such as rdap.org send you to the right server."}, {"q": "Do I need an API key for RDAP?", "a": "No, not for public data. Servers may rate-limit you with HTTP 429, and some answer 403 to clients they do not like, so send a descriptive User-Agent and pause between requests."}, {"q": "Why does my RDAP request return 404?", "a": "The name may not be registered, you may have queried a subdomain, or the TLD has no RDAP server in IANA's bootstrap file, which is the case for many ccTLDs such as .io and .de."}]
---

# A free WHOIS API: query RDAP and get JSON back

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">Most WHOIS APIs are paid services that parse text WHOIS replies into JSON. For gTLD domains you often do not need one: the registries already answer in JSON over RDAP, the protocol that replaced WHOIS, with no key and no sign-up. Here is how to call it, what comes back, and where it falls short.</p>

## Why RDAP works as a WHOIS API

WHOIS on port 43 returns free-form text whose layout differs per registry. RDAP returns JSON in a format fixed by [RFC 9083](https://www.rfc-editor.org/rfc/rfc9083), over plain HTTPS. ICANN's [RDAP page](https://www.icann.org/rdap) says all gTLD registries and registrars must provide RDAP, and that since 28 January 2025 they no longer have to provide WHOIS (.com, .name and .post excepted). ICANN's own [lookup tool](/blog/icann-lookup) is an RDAP client.

Each TLD has its own RDAP server. IANA publishes which one in a bootstrap file, `https://data.iana.org/rdap/dns.json`; on 28 November 2026 it listed 592 entries. You can read that file yourself, or call a redirector such as [rdap.org](https://about.rdap.org/), which answers with an HTTP 302 to the right registry:

```bash
curl -sI https://rdap.org/domain/example.com | grep -i -E '^HTTP|^location'
```

```text
HTTP/2 302
location: https://rdap.verisign.com/com/v1/domain/example.com
```

## A lookup in curl

```bash
curl -sL -H 'Accept: application/rdap+json' https://rdap.org/domain/wikipedia.org \
  | jq '{name: .ldhName, status, events: [.events[] | {(.eventAction): .eventDate}]}'
```

The fields you usually want:

| Field | Where it is |
| --- | --- |
| Expiry date | `events[]` with `eventAction` `expiration` |
| Creation date | `events[]` with `eventAction` `registration` ([domain age](/blog/domain-age)) |
| Status | `status[]`, in RDAP spelling such as `client transfer prohibited` ([status codes](/blog/domain-status-codes)) |
| Registrar | the `entities[]` item whose `roles` include `registrar`, name in its `vcardArray` |
| Nameservers | `nameservers[].ldhName` |
| Contacts | other `entities[]`, usually redacted ([why](/blog/rdap-server-redacted-the-value)) |

## A lookup in Node.js

Node 18 and later have `fetch` built in, so this runs with no dependencies:

```js
const domain = process.argv[2] ?? "example.com";

const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
  headers: {
    Accept: "application/rdap+json",
    "User-Agent": "my-domain-tool/1.0 (+https://example.com/contact)",
  },
});
if (!res.ok) throw new Error(`RDAP lookup for ${domain} failed: HTTP ${res.status}`);

const data = await res.json();
const date = (action) => data.events?.find((e) => e.eventAction === action)?.eventDate ?? null;
const registrar = data.entities?.find((e) => e.roles?.includes("registrar"));

console.log({
  domain: data.ldhName,
  registered: date("registration"),
  expires: date("expiration"),
  status: data.status ?? [],
  registrar: registrar?.vcardArray?.[1]?.find((f) => f[0] === "fn")?.[3] ?? null,
  nameservers: (data.nameservers ?? []).map((n) => n.ldhName.toLowerCase()),
});
```

Saved as `rdap.mjs` and run with Node 22 on 28 November 2026, `node rdap.mjs github.com` printed:

```text
{
  domain: 'GITHUB.COM',
  registered: '2007-10-09T18:20:50Z',
  expires: '2028-10-09T18:20:50Z',
  status: [ 'client delete prohibited', 'client transfer prohibited', 'client update prohibited' ],
  registrar: 'MarkMonitor Inc.',
  nameservers: [ 'dns1.p08.nsone.net', 'dns2.p08.nsone.net', ... ]
}
```

**Set the User-Agent.** In the same test, the request without that header failed: rdap.org answered HTTP 403 to Node's default User-Agent (`node`), and `curl -A node` got the same 403, while a descriptive User-Agent got the normal 302. The Verisign server itself answered the default client. A name and a contact URL in the header is polite anyway, and it keeps you out of filters aimed at anonymous scripts.

rdap.org also sends `Access-Control-Allow-Origin: *`, so the same `fetch` works from a web page, where browsers set their own User-Agent. The [domain expiry checker](/domain-expiry-checker/) on this site skips the redirector and reads IANA's bootstrap file from the browser instead.

## Limits compared with a paid WHOIS API

- **No RDAP for many ccTLDs.** .io, .co, .de, .eu and other country codes are not in the bootstrap file, so you get a 404. Paid APIs often scrape those registries' WHOIS or web pages. See [no registry RDAP server was identified](/blog/no-registry-rdap-server).
- **Not every registry publishes every field.** Some ccTLD servers that do run RDAP leave out the expiration event.
- **Rate limits.** Registries and rdap.org can answer bursts with HTTP 429 or 403. Pause between requests and cache answers; expiry dates change about once a year.
- **Redacted contacts.** RDAP will not tell you who owns a domain when the registrar withholds it. No legitimate API can, apart from the disclosure processes ICANN describes.
- **No history.** RDAP answers with the current record only. Historic WHOIS is a separate, paid kind of product.

## Where Supadomain uses it

[Supadomain](/) calls `https://rdap.org/domain/<name>` from its server when you add a domain or press **Refresh**, and keeps the expiration, registration and last-changed events plus the nameservers (`server/rdap-query.ts`). That request goes out with the HTTP client's default User-Agent, and in a test on 28 November 2026 the same call from Node got the 403 described above, so set a User-Agent in your own code and check the server log if adding a domain fails. The [RDAP vs WHOIS guide](/guide/rdap-vs-whois) compares the two protocols in more depth.

## FAQ

### Is there a free WHOIS API?

For gTLDs, RDAP is one. Every gTLD registry and registrar must run an RDAP server that answers HTTPS requests with JSON, with no key. Public redirectors such as rdap.org send you to the right server.

### Do I need an API key for RDAP?

No, not for public data. Servers may rate-limit you with HTTP 429, and some answer 403 to clients they do not like, so send a descriptive User-Agent and pause between requests.

### Why does my RDAP request return 404?

The name may not be registered, you may have queried a subdomain, or the TLD has no RDAP server in IANA's bootstrap file, which is the case for many ccTLDs such as .io and .de.

## Related posts

- [ICANN Lookup: what the registration data tool shows](/blog/icann-lookup)
- [Domain age: how to check when a domain was registered](/blog/domain-age)
- [How to check a domain expiry date without WHOIS](/blog/check-domain-expiry-date)
- [All posts](/blog/)
