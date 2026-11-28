---
title: "How to Check Domain Age With an RDAP Lookup"
titleTemplate: false
description: "Domain age is the time since a domain was registered. Read the registration date from RDAP with one command, and learn why transfers keep it but drops reset it."
headline: "Domain age: how to check when a domain was registered"
date: "2026-11-28"
keyword: "domain age"
faq: [{"q": "How do I check the age of a domain?", "a": "Look up the domain over RDAP and read the event with eventAction registration. curl -sL https://rdap.org/domain/example.com piped to jq shows it, and an in-browser RDAP checker shows it as Registered."}, {"q": "Does transferring a domain reset its age?", "a": "No. A transfer to another registrar keeps the registration date and adds a separate transfer event. The date only starts over when the name is deleted and someone registers it again."}, {"q": "Why does a domain age checker show a different date?", "a": "Some tools show the date of a registrar's own record, a cached WHOIS copy or the first time they saw a site. The registry's RDAP registration event is the date the current registration started."}]
---

# Domain age: how to check when a domain was registered

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">Domain age is the time since the current registration of a domain name started. The registry publishes that start date over RDAP as a <code>registration</code> event, so you can read it yourself in a second instead of trusting a third-party age checker.</p>

## The quick way

Type the domain into the [domain expiry checker](/domain-expiry-checker/). It queries the registry's RDAP server from your browser and lists the **Registered** date next to the expiry date, registrar and status codes.

## With curl and jq

```bash
curl -sL https://rdap.org/domain/example.com \
  | jq -r '.events[] | select(.eventAction == "registration") | .eventDate'
```

On 28 November 2026 this printed `1995-08-14T04:00:00Z`. [rdap.org](https://about.rdap.org/) finds the registry's RDAP server in IANA's bootstrap file and redirects there, which is why `-L` is needed.

To turn it into years:

```bash
reg=$(curl -sL https://rdap.org/domain/example.com \
  | jq -r '.events[] | select(.eventAction == "registration") | .eventDate')
echo "$(( ($(date +%s) - $(date -d "$reg" +%s)) / 31557600 )) years"
```

That uses GNU `date` (Linux). On macOS, install `coreutils` and call `gdate`. 31,557,600 is the number of seconds in an average year of 365.25 days.

Here is what the registries returned for a few well-known names on the same day:

| Domain | Registration event | Other events |
| --- | --- | --- |
| example.com | 1995-08-14 | expiration, last changed |
| google.com | 1997-09-15 | expiration, last changed |
| wikipedia.org | 2001-01-13 | transfer (2012-03-09), expiration, last changed |
| github.com | 2007-10-09 | expiration, last changed |

## What resets a domain's age, and what does not

The registration event belongs to the registry's record of the name. [RFC 9083](https://www.rfc-editor.org/rfc/rfc9083), which defines RDAP's JSON, lists `registration`, `expiration`, `transfer` and `last changed` as separate event actions, and registries use them that way:

- **Renewals** move the `expiration` date. The registration date stays.
- **Transfers to another registrar** add a `transfer` event and keep the registration date. wikipedia.org above shows both.
- **Changes of nameservers or contacts** update `last changed`.
- **Deletion and re-registration** start a new record. When a name expires, goes through redemption and is deleted, the next person to register it gets a fresh registration date. [What happens to expired domains](/blog/what-happens-to-expired-domains) walks through that cycle.

So a domain that looks ten years old in an archive of its website can show a registration date from last year: it was dropped and caught by someone new.

## Why age checkers disagree

Online "domain age checkers" do not all read the same thing. Some query RDAP or WHOIS, some show when their own crawler first saw the site, some keep cached data. When two tools disagree, the registry's RDAP answer is the authority for the current registration. A few things can still make it look odd:

- **ccTLDs without RDAP.** .io, .co, .de and many other country codes are missing from IANA's bootstrap file, so rdap.org answers 404. See [no registry RDAP server was identified](/blog/no-registry-rdap-server) for what to use instead.
- **Registries that leave the event out.** Not every RDAP server publishes every event. If there is no `registration` event, ask the registrar or the registry's own lookup page.
- **Time zones.** RDAP dates are ISO 8601 in UTC, so a registration late in the evening in the Americas can show the next day.

## Domain age and contact privacy

The registration date is not personal data and stays visible when the registrant's name and email are redacted. [The RDAP server redacted the value](/blog/rdap-server-redacted-the-value) explains which fields registries hide and why. That makes the date one of the few things you can always check before buying a used domain, answering an email about one, or assessing whether a site that claims to be decades old really is.

## Keeping the date on file

[Supadomain](/), the self-hosted monitor this site documents, saves the `registration`, `expiration` and `last changed` events, plus the nameservers, when you add a domain or press **Refresh** (`server/rdap-query.ts`). It uses the expiry date for its hourly alert check; the registration date is kept with the domain's record in MongoDB. The [RDAP vs WHOIS guide](/guide/rdap-vs-whois) shows a full RDAP answer with every field.

## FAQ

### How do I check the age of a domain?

Look up the domain over RDAP and read the event with eventAction registration. curl -sL https://rdap.org/domain/example.com piped to jq shows it, and an in-browser RDAP checker shows it as Registered.

### Does transferring a domain reset its age?

No. A transfer to another registrar keeps the registration date and adds a separate transfer event. The date only starts over when the name is deleted and someone registers it again.

### Why does a domain age checker show a different date?

Some tools show the date of a registrar's own record, a cached WHOIS copy or the first time they saw a site. The registry's RDAP registration event is the date the current registration started.

## Related posts

- [ICANN Lookup: what the registration data tool shows](/blog/icann-lookup)
- [A free WHOIS API: query RDAP as JSON](/blog/whois-api)
- [Find a domain's expiry date with one RDAP command](/blog/check-domain-expiry-date)
- [All posts](/blog/)
