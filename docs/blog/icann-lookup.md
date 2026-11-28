---
title: "ICANN Lookup: What the Registration Data Tool Shows"
titleTemplate: false
description: "ICANN Lookup is ICANN's RDAP client for domain data: what its results show, where each field comes from, why contacts are hidden, and the same query in curl."
headline: "ICANN Lookup: what ICANN's registration data tool shows and where it gets it"
date: "2026-11-28"
keyword: "icann lookup"
faq: [{"q": "What is ICANN Lookup?", "a": "It is ICANN's free registration data lookup tool at lookup.icann.org. It sends an RDAP query to the registry and registrar for a domain, IP network or ASN and shows the answer in a readable form."}, {"q": "Is ICANN Lookup the same as a WHOIS lookup?", "a": "It replaced ICANN's old WHOIS service. It queries RDAP first and only falls back to the registry's WHOIS server, after a captcha, when the RDAP service for that domain is unavailable."}, {"q": "Why does ICANN Lookup not show the owner of a domain?", "a": "Applicable law and ICANN policy let registrars withhold personal contact data. The result then shows a redacted label. People with a legitimate interest can ask for nonpublic gTLD data through ICANN's Registration Data Request Service."}]
---

# ICANN Lookup: what ICANN's registration data tool shows and where it gets it

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">ICANN Lookup, the registration data lookup tool at lookup.icann.org, is the official place to look up who registered a domain, when it expires and which registrar holds it. It does not keep a database of its own: it asks the registry and the registrar over RDAP and shows what they answer.</p>

## What the tool is

ICANN's [lookup FAQ](https://lookup.icann.org/en/faq) describes it as a free public service and a JavaScript client for the Registration Data Access Protocol (RDAP). You enter a domain name, an IP network or an autonomous system number; the tool queries the authoritative RDAP servers in real time and formats the JSON they return. ICANN's terms of use add that it does not generate, collect or store the data for RDAP lookups.

The old `whois.icann.org` service is gone and redirects to this tool. That matches the wider change: ICANN's [RDAP page](https://www.icann.org/rdap) says all gTLD registries and registrars must run RDAP, and that since 28 January 2025 they are no longer required to run WHOIS, except for .com, .name and .post.

## The fields and who supplies them

The FAQ has a table of every result label and its source. In short:

| Section | Fields | Comes from |
| --- | --- | --- |
| Domain information | name, registry domain ID, domain status, nameservers | registry |
| Dates | created, expires, updated | registry or registrar |
| Contacts | registrant, admin, tech, billing | registrar |
| Registrar | name, abuse email and phone | registrar; the IANA ID from the registry |
| DNSSEC | delegation signed, DS and key data | registry |
| Authoritative servers | the RDAP URLs that answered | both |

The raw RDAP response sits at the bottom of the results page, collapsed. The status codes are the registry's EPP statuses; [domain status codes](/blog/domain-status-codes) explains each one.

## Why the owner is usually hidden

Most results show "redacted" instead of a name, email or phone for the registrant. ICANN's FAQ says that, because of applicable law and ICANN policies, not all registration data has to be returned, and some of it is visible only to people who have shown a legitimate purpose. The redacted label tells you the data may exist but is not shown to you. [The RDAP server redacted the value](/blog/rdap-server-redacted-the-value) covers how RFC 9537 marks those fields.

For nonpublic gTLD data, ICANN points to its Registration Data Request Service (RDRS), meant for law enforcement, intellectual property, consumer protection and security work. A request goes to the registrar, which decides whether to disclose.

## When the tool falls back to WHOIS

If a domain's RDAP service is unavailable, the tool asks you to solve a captcha and then offers a WHOIS failover lookup against the gTLD registry's WHOIS server. It does not offer WHOIS for IP addresses or ASNs, or when RDAP works. For ccTLDs that have no RDAP server at all, such as .io or .de, there is often nothing for the tool to query; the country registry's own lookup page is the place to go ([no registry RDAP server was identified](/blog/no-registry-rdap-server)).

## The same query without the web form

Because the tool is an RDAP client, you can run the lookup it runs:

```bash
curl -sL https://rdap.org/domain/example.com \
  | jq '{status, events: [.events[] | {(.eventAction): .eventDate}], nameservers: [.nameservers[].ldhName]}'
```

On 28 November 2026 the .com registry (Verisign) answered for example.com with:

```json
{
  "status": ["client delete prohibited", "client transfer prohibited", "client update prohibited"],
  "events": [
    { "registration": "1995-08-14T04:00:00Z" },
    { "expiration": "2027-08-13T04:00:00Z" },
    { "last changed": "2026-08-14T08:01:43Z" },
    { "last update of RDAP database": "2026-11-28T06:05:21Z" }
  ],
  "nameservers": ["ELLIOTT.NS.CLOUDFLARE.COM", "HERA.NS.CLOUDFLARE.COM"]
}
```

That is the registry half of what ICANN Lookup shows. For most .com names the registrar runs a second RDAP server with the contact fields, and the registry's answer links to it with `"rel": "related"`: github.com's points to `rdap.markmonitor.com`. example.com is reserved by IANA and has no such link. The [domain expiry checker](/domain-expiry-checker/) on this site runs the same kind of query in your browser and adds days left; [a free WHOIS API](/blog/whois-api) shows how to call RDAP from code.

## What people use it for

- Checking a domain's expiry date or [age](/blog/domain-age) before a purchase or a renewal.
- Finding the registrar and its abuse contact to report phishing or spam.
- Checking an email that claims your domain is about to lapse. [Domain expiry scam emails](/blog/domain-expiry-scam-email) shows what to compare.
- Seeing whether a name is locked against transfer before you move it ([EPP code](/blog/epp-code)).

## For your own domains

A lookup answers once. [Supadomain](/), the self-hosted monitor this site documents, saves the expiry date from RDAP when you add a domain or press **Refresh**, and checks it against your alert thresholds every hour; the [monitoring guide](/guide/monitor-domain-expiration) explains the setup.

## FAQ

### What is ICANN Lookup?

It is ICANN's free registration data lookup tool at lookup.icann.org. It sends an RDAP query to the registry and registrar for a domain, IP network or ASN and shows the answer in a readable form.

### Is ICANN Lookup the same as a WHOIS lookup?

It replaced ICANN's old WHOIS service. It queries RDAP first and only falls back to the registry's WHOIS server, after a captcha, when the RDAP service for that domain is unavailable.

### Why does ICANN Lookup not show the owner of a domain?

Applicable law and ICANN policy let registrars withhold personal contact data. The result then shows a redacted label. People with a legitimate interest can ask for nonpublic gTLD data through ICANN's Registration Data Request Service.

## Related posts

- [Domain status codes: clientTransferProhibited and the rest](/blog/domain-status-codes)
- [A free WHOIS API: query RDAP as JSON](/blog/whois-api)
- ["The RDAP server redacted the value": what it means](/blog/rdap-server-redacted-the-value)
- [All posts](/blog/)
