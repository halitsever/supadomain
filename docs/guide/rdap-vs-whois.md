---
title: RDAP vs WHOIS for domain expiry dates
description: RDAP vs WHOIS explained. What RDAP is, how an RDAP lookup returns a domain's expiry date as JSON, and how Supadomain reads it without a WHOIS fallback.
---

# RDAP or WHOIS: which one to read expiry dates from

Supadomain reads every expiry date over RDAP and never over WHOIS. This page explains the two protocols, shows what an RDAP lookup returns and lists what the app does when a lookup comes back short.

## What RDAP is

RDAP stands for Registration Data Access Protocol. It is the successor to WHOIS, defined by the IETF in RFC 9082 and RFC 9083. It serves the same registration data: who runs the domain's registry record, which nameservers it uses and when it was registered, changed and due to expire.

The difference is the shape of the answer. A WHOIS server returns free text in whatever layout its operator chose. An RDAP server returns JSON over HTTPS with field names fixed by the standard.

## RDAP vs WHOIS

| | WHOIS | RDAP |
| --- | --- | --- |
| Transport | Plain text over TCP port 43 | HTTPS |
| Response | Free text, layout differs per registry | JSON with standard fields |
| Dates | Labels and formats vary | `events` with an `eventAction` and an ISO 8601 `eventDate` |
| Finding the server | Per-TLD knowledge or referrals | A bootstrap registry published by IANA |
| Errors | Text that a program has to guess at | HTTP status codes |

For a tool that needs one field, the expiry date, this matters a great deal. A WHOIS client needs a parser per registry and breaks when a layout changes. An RDAP client reads the same field everywhere.

Generic TLD registries and registrars are required by ICANN to offer RDAP, and ICANN stopped requiring WHOIS from them in January 2025. Country-code TLDs set their own rules, and some do not run an RDAP service.

## What an RDAP lookup returns

Supadomain sends each lookup to `https://rdap.org/domain/<domain>`. rdap.org is a public redirector: it finds the registry's RDAP server in the IANA bootstrap data and redirects the request there.

You can run the same lookup yourself:

```bash
curl -sL https://rdap.org/domain/example.com
```

The reply is a large JSON document. These are the parts Supadomain uses, trimmed and with sample dates:

```json
{
  "ldhName": "EXAMPLE.COM",
  "events": [
    { "eventAction": "registration", "eventDate": "1995-08-14T04:00:00Z" },
    { "eventAction": "expiration", "eventDate": "2027-08-13T04:00:00Z" },
    { "eventAction": "last changed", "eventDate": "2026-08-14T07:01:39Z" },
    { "eventAction": "last update of RDAP database", "eventDate": "2026-11-27T09:00:00Z" }
  ],
  "nameservers": [
    { "ldhName": "A.IANA-SERVERS.NET" },
    { "ldhName": "B.IANA-SERVERS.NET" }
  ]
}
```

## How Supadomain reads the expiry date

From the reply, the app keeps four events and the nameserver names:

| RDAP data | Stored as | Shown in the app as |
| --- | --- | --- |
| `expiration` event | `expireTime` | Expiry date and days left |
| `registration` event | `registrationDate` | Registration date |
| `last changed` event | `lastUpdate` | Last changed |
| `last update of RDAP database` event | `lastUpdatedInRdap` | Last RDAP update |
| `ldhName` of each nameserver | `nameservers` | Nameservers |

The time of the lookup itself is stored as `lastChecked`.

A lookup runs at three moments:

- when you add a domain
- when you press **Refresh** on the domain's page
- during the hourly job, for every domain whose last lookup is more than 24 hours old

So each domain is looked up about once a day, and a renewal shows up without a manual refresh. When a lookup returns a different expiry date, the alert state for that domain is reset.

Requests carry the header `User-Agent: Supadomain/<version> (+https://github.com/halitsever/supadomain)`, with the version from `package.json`. rdap.org answers `403` to clients that send none, and to Node's default `node`. With that header it answers with a redirect to the registry's own RDAP server, which the app follows.

## When RDAP has no answer

There is no fallback to a WHOIS expiry lookup. Two cases follow from that.

**The lookup fails.** If rdap.org answers `404`, the domain is not added and the app says "No RDAP record for example.tld. The domain is not registered, or its TLD has no RDAP server." This is what happens for a TLD whose registry has no RDAP service, for a name that is not registered and for a typo. If the server refuses the request with `403`, the message says so and names the status. If it answers `429` because of too many lookups, the message says when to try again, using the `Retry-After` header when the server sends one. Any other error, such as a timeout, gives "The RDAP lookup failed. Try again in a moment." On a refresh or a daily lookup, a failed request leaves the stored data as it was.

**The reply has no `expiration` event.** Some registries answer over RDAP and leave the expiry date out. The domain is saved without a date, its status is **Unknown** and it gets no alerts.

## Check a TLD before you rely on it

Before you add a domain you depend on, run the lookup by hand and look for the date:

```bash
curl -sL https://rdap.org/domain/example.org \
  | jq -r '.events[] | select(.eventAction == "expiration") | .eventDate'
```

A date means Supadomain can monitor the domain. An error or an empty result means it cannot, and you need one of the other methods in [how to monitor domain expiration](./monitor-domain-expiration).

Each domain's drawer in the app also has a **WHOIS** button. It opens the ICANN lookup page for that name in a new tab, so you can compare what the registry shows with what is stored.
