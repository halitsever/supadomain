---
title: "Domain Expiry Checker: Free RDAP Lookup | Supadomain"
titleTemplate: false
description: "Check when a domain expires, right in your browser. This free domain expiry checker asks the registry over RDAP and shows days left, registrar and status."
aside: false
faq:
  - q: "Is this domain expiry checker free?"
    a: "Yes. It runs in your browser and asks the registry's public RDAP server directly. There is no sign-up and no limit set by this site, though some registries limit how often one address can query them."
  - q: "Does the checker store the domains I look up?"
    a: "No. The page has no server of its own. Your browser fetches IANA's bootstrap file and then the registry's RDAP answer, and nothing is sent to Supadomain."
  - q: "Why can't it check .io, .co or .de domains?"
    a: "Those registries have no RDAP server in IANA's bootstrap file, so there is nothing to ask over RDAP. Use the registry's WHOIS service or website instead."
  - q: "Why does my .nl or .au domain show no expiry date?"
    a: "Some registries answer RDAP queries but leave the expiration event out. In our tests .nl, .au, .pl and .br did. Your registrar can tell you the date."
  - q: "Is the expiry date exact?"
    a: "It is the date the registry holds, in UTC. For .com the registry renews names automatically on the expiry date, so a date that just moved a year ahead does not prove you paid. Check with your registrar."
---

# Domain expiry checker

Find out when a domain expires. Enter a domain and this page asks the registry that runs its top-level domain, over RDAP, for the expiry date, the days left, the registrar and the domain's status codes. It works for .com, .net, .org and most other generic TLDs, and for the country codes listed [below](#which-tlds-work).

<ExpiryChecker />

## How the checker works

Everything happens in your browser:

1. It downloads IANA's [RDAP bootstrap file](https://data.iana.org/rdap/dns.json), which maps every TLD that has RDAP to its registry's server, as defined in [RFC 9224](https://www.rfc-editor.org/rfc/rfc9224.html).
2. It sends `GET <server>/domain/<name>` to that registry, for example `https://rdap.verisign.com/com/v1/domain/example.com`.
3. It reads the `expiration`, `registration` and `last changed` events, the registrar entity, the status list and the nameservers from the JSON answer.

There is no server of ours in between, and nothing about your lookup is stored. The answer comes straight from the registry, which is the source of truth for the date. To run the same query in a terminal, see [how to check a domain expiry date without WHOIS](/blog/check-domain-expiry-date).

## Which TLDs work

A browser can only read a registry's answer if the registry sends the CORS header `Access-Control-Allow-Origin`. We tested registries one by one on 28 November 2026:

| Result | TLDs tested |
| --- | --- |
| Expiry date shown | .com, .net, .org, .info, .xyz, .dev, .app, .page, .ai, .ca, .fr, .in, .cc, .co.uk, .online, .shop, .cloud, .tech, .site, .store, .top, .blog, .pro, .mobi, .asia, .live, .agency, .studio, .link, .click, .space, .website, .fun |
| Answers, but no expiry date published | .nl, .au, .pl, .br |
| Works, but the registry limits lookups after a few quick queries | .biz, .tv, .club, .one, .design |
| No RDAP server in IANA's bootstrap file | .io, .co, .me, .us, .de, .eu, .it, .es, .ch, .se, .be, .at, .dk, .jp, .cn, .ru, .tr, .mx, .nz, .za |

Other TLDs that IANA lists are tried the same way. When one fails, the checker says why instead of showing a blank result:

- **No RDAP server:** the TLD is not in the bootstrap file. In November 2026 that was 232 of 1,435 TLDs, 174 of them country codes. [No registry RDAP server was identified](/blog/no-registry-rdap-server) lists them and the alternatives.
- **The registry did not answer the browser:** it blocks requests from web pages, rate-limits you or is down. The message includes the `curl` command to run instead.
- **No registration found:** the name is not registered, was deleted, or is a subdomain such as `www.example.com`.

## Reading the result

- **Days left** counts whole days from now to the expiry time, in UTC. The edge of the result turns amber at 30 days or fewer and red once the date has passed.
- **Status** lists the registry's status codes. `client transfer prohibited` is a normal registrar lock. `auto renew period`, `redemption period` and `pending delete` are highlighted because they mean the domain is in its renewal or deletion cycle; [domain renewal](/blog/domain-renewal) explains each stage.
- **Registrar** is the company the registry has on record. If an email about your domain's expiry names someone else, read [domain expiry scam emails](/blog/domain-expiry-scam-email).
- Contact details are not shown. Registries and registrars redact them; [the RDAP server redacted the value](/blog/rdap-server-redacted-the-value) explains how.

## Check once, or get told before it expires

A lookup tells you the date today. To get a warning before the date, run a monitor. [Supadomain](/) is a free, open source domain expiry monitor you host yourself (Nuxt and MongoDB). It reads each domain's date over RDAP when you add it and once a day after that, compares the stored dates with your thresholds (30, 7 and 1 days by default) every hour, and posts a Slack alert each time a domain crosses one of them. The [Slack alerts guide](/guide/slack-alerts) shows exactly when it fires, and [getting started](/guide/getting-started) installs it.

## FAQ

### Is this domain expiry checker free?

Yes. It runs in your browser and asks the registry's public RDAP server directly. There is no sign-up and no limit set by this site, though some registries limit how often one address can query them.

### Does the checker store the domains I look up?

No. The page has no server of its own. Your browser fetches IANA's bootstrap file and then the registry's RDAP answer, and nothing is sent to Supadomain.

### Why can't it check .io, .co or .de domains?

Those registries have no RDAP server in IANA's bootstrap file, so there is nothing to ask over RDAP. Use the registry's WHOIS service or website instead.

### Why does my .nl or .au domain show no expiry date?

Some registries answer RDAP queries but leave the expiration event out. In our tests .nl, .au, .pl and .br did. Your registrar can tell you the date.

### Is the expiry date exact?

It is the date the registry holds, in UTC. For .com the registry renews names automatically on the expiry date, so a date that just moved a year ahead does not prove you paid. Check with your registrar.
