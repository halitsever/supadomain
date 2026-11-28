---
title: "\"No Registry RDAP Server Was Identified\": Fix"
titleTemplate: false
description: "Why RDAP lookups fail for .io, .co, .de, .eu and 170 other ccTLDs, how the IANA bootstrap file works, and what to use for those domains instead."
headline: "\"No registry RDAP server was identified\": what it means"
date: "2026-11-28"
keyword: "no registry rdap server was identified for this domain."
faq: [{"q": "Why does RDAP not work for .io domains?", "a": "The .io registry has no RDAP server listed in IANA's bootstrap file, so RDAP clients cannot find one. Use the registry's WHOIS service or website instead."}, {"q": "Does every TLD support RDAP?", "a": "No. In November 2026, 1,203 of 1,435 TLDs had an RDAP server in IANA's bootstrap file. Most of the missing ones are country codes."}]
---

# "No registry RDAP server was identified": what it means

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">An RDAP client finds the right server for a domain in a list that IANA publishes. When the domain's top-level domain is not in that list, the client has nowhere to send the query, and you get a message like "no registry RDAP server was identified for this domain". The domain is fine; its registry just does not publish RDAP.</p>

## How an RDAP client picks a server

[RFC 9224](https://www.rfc-editor.org/rfc/rfc9224.html) defines the bootstrap process. IANA publishes a JSON file, [dns.json](https://data.iana.org/rdap/dns.json), that maps TLDs to the base URL of their RDAP service:

```json
{
  "services": [
    [["com", "net"], ["https://rdap.verisign.com/com/v1/"]],
    [["org"], ["https://rdap.publicinterestregistry.org/rdap/"]]
  ]
}
```

The client matches the domain's labels against the list, longest match first, then appends `domain/<name>` to the base URL. If nothing matches, there is no server to ask. The exact error text depends on the tool; rdap.org, for example, answers with HTTP 404 and `"No RDAP service is available for this resource"`.

## Which TLDs are missing

We compared IANA's bootstrap file (published 20 November 2026) with its list of all top-level domains (version 2026112700):

| | Count |
| --- | --- |
| TLDs in the root zone | 1,435 |
| TLDs with an RDAP server in the bootstrap file | 1,203 |
| TLDs without one | 232 |
| Country-code TLDs without one | 174 of 248 |

Almost every generic TLD is covered, because ICANN requires RDAP from gTLD registries. The gaps are country codes, which set their own rules, and a few special TLDs such as .edu and .mil. Among the well-known ones, these had no entry: **.io, .co, .me, .us, .de, .eu, .it, .es, .ch, .se, .be, .at, .dk, .jp, .cn, .ru, .tr, .mx, .nz and .za**.

The list changes as registries add RDAP, so check the current file for your TLD:

```bash
curl -s https://data.iana.org/rdap/dns.json \
  | jq --arg t io '.services[] | select(.[0] | index($t)) | .[1]'
```

No output means no RDAP server is registered.

## Other causes of a similar error

- **You looked up a subdomain.** `www.example.com` or `shop.example.co.uk` are not registrations. Look up `example.com` or `example.co.uk`.
- **A typo in the TLD.** A TLD that does not exist has no entry either.
- **An old cached copy of the file.** Clients that cache the bootstrap file can miss a TLD that was added since. IANA's copy is served with a one-day cache lifetime.

## What to use instead

For a TLD without RDAP, ask the registry directly:

- Its **WHOIS** service on port 43 (`whois example.io` on most systems). The answer is free text, and the layout differs per registry.
- Its **website**, which often has a lookup form. IANA's [root zone database](https://www.iana.org/domains/root/db) lists every TLD's registry and its WHOIS server, and `https://rdap.iana.org/domain/io` returns that TLD's registry links as RDAP.
- Your **registrar's dashboard**, if the domain is yours.

## What Supadomain does

[Supadomain](/) reads expiry dates only over RDAP, through `https://rdap.org/domain/<name>`, with no WHOIS fallback. When rdap.org cannot answer, `server/rdap-query.ts` returns a failure and adding the domain stops with "Failed to retrieve RDAP data, maybe the domain is already expired or does not exist?". So a .io or .de domain cannot be added at all. The [RDAP vs WHOIS guide](/guide/rdap-vs-whois) explains the choice.

The [domain expiry checker](/domain-expiry-checker/) on this site uses the bootstrap file directly and says so when a TLD has no RDAP server, instead of failing silently.

## FAQ

### Why does RDAP not work for .io domains?

The .io registry has no RDAP server listed in IANA's bootstrap file, so RDAP clients cannot find one. Use the registry's WHOIS service or website instead.

### Does every TLD support RDAP?

No. In November 2026, 1,203 of 1,435 TLDs had an RDAP server in IANA's bootstrap file. Most of the missing ones are country codes.

## Related posts

- [Domain renewal: grace period, redemption and auto-renew](/blog/domain-renewal)
- [Why an RDAP lookup says the value was redacted, and what stays visible](/blog/rdap-server-redacted-the-value)
- [Find a domain's expiry date with one RDAP command](/blog/check-domain-expiry-date)
- [All posts](/blog/)
