---
title: "How to Check a Domain Expiry Date Without WHOIS"
titleTemplate: false
description: "Check when a domain expires with an RDAP lookup: one curl command, a jq filter for the expiration event, days left in the shell, and the TLDs that hide it."
headline: "Find a domain's expiry date with one RDAP command"
date: "2026-11-28"
keyword: "check expiry date of domain"
faq: [{"q": "How do I check a domain's expiry date?", "a": "Look it up over RDAP: run curl -sL https://rdap.org/domain/example.com and read the event with eventAction expiration, or use an in-browser RDAP checker."}, {"q": "Why does my domain show no expiry date?", "a": "Its TLD may have no RDAP server, its registry may not publish the date (.nl, .au, .pl and .br did not in our tests), or the name is not registered."}]
---

# Find a domain's expiry date with one RDAP command

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">The registry's RDAP server returns a domain's expiry date as a JSON field, so you can read it with one command and no WHOIS parsing. Here is the command, how to turn it into days left, and the cases where it does not work.</p>

## The quick way

Enter the domain into the [domain expiry checker](/domain-expiry-checker/). It runs the lookup below in your browser and shows the expiry date, days left, registrar and status.

## With curl and jq

```bash
curl -sL https://rdap.org/domain/example.com \
  | jq -r '.events[] | select(.eventAction == "expiration") | .eventDate'
```

On 28 November 2026 this printed:

```text
2027-08-13T04:00:00Z
```

[rdap.org](https://about.rdap.org/) is a public redirector. It looks up the registry's server in IANA's bootstrap file and redirects you there; `-L` tells curl to follow. The date is ISO 8601 in UTC.

The `events` array also holds the registration date (`registration`, the basis of [domain age](/blog/domain-age)), the last change (`last changed`) and the time the registry's data was refreshed (`last update of RDAP database`). The [RDAP vs WHOIS guide](/guide/rdap-vs-whois#what-an-rdap-lookup-returns) shows a full example.

## Days left

With GNU date (Linux):

```bash
exp=$(curl -sL https://rdap.org/domain/example.com \
  | jq -r '.events[] | select(.eventAction == "expiration") | .eventDate')
echo $(( ($(date -d "$exp" +%s) - $(date +%s)) / 86400 )) days left
```

On macOS, install `coreutils` and use `gdate`, or parse the date with `date -j -f`.

## Several domains

Loop over a file with one domain per line. Leave a pause between lookups: rdap.org and some registries answer bursts of queries with HTTP 429 or 403.

```bash
while read -r d; do
  exp=$(curl -sL "https://rdap.org/domain/$d" \
    | jq -r '.events[]? | select(.eventAction == "expiration") | .eventDate')
  echo "$d ${exp:-no expiry date}"
  sleep 2
done < domains.txt
```

## When there is no expiry date

The command prints nothing in three cases:

1. **The TLD has no RDAP server.** .io, .co, .de, .eu and many other country codes are not in IANA's bootstrap file, and rdap.org answers 404. See [no registry RDAP server was identified](/blog/no-registry-rdap-server).
2. **The registry does not publish the date.** In our tests on 28 November 2026, the .nl, .au, .pl and .br registries answered RDAP queries without an `expiration` event. Ask the registrar.
3. **The name is not registered,** or you queried a subdomain. The server answers 404.

## Registry date or registrar date

For thin registries such as .com, the registry holds the dates and the registrar may publish its own copy. MarkMonitor's answer for `github.com`, for example, has both `expiration` and `registrar expiration`. If they differ, the registry's date is the one the registry acts on. Also note that .com's registry renews names automatically on the expiry date and gives the registrar 45 days to delete them, so a date that has just jumped a year may not mean you paid. [Domain renewal](/blog/domain-renewal) explains this.

## Keep checking without doing it by hand

A lookup tells you the date today. To be told before it arrives, [Supadomain](/) stores the date from RDAP when you add a domain and compares it with your alert thresholds every hour, posting to Slack. It does not repeat the lookup by itself: press **Refresh** after each renewal. [Getting started](/guide/getting-started) installs it.

## FAQ

### How do I check a domain's expiry date?

Look it up over RDAP: run curl -sL https://rdap.org/domain/example.com and read the event with eventAction expiration, or use an in-browser RDAP checker.

### Why does my domain show no expiry date?

Its TLD may have no RDAP server, its registry may not publish the date (.nl, .au, .pl and .br did not in our tests), or the name is not registered.

## Related posts

- [Domain renewal: grace period, redemption and auto-renew](/blog/domain-renewal)
- [Why an RDAP lookup says the value was redacted, and what stays visible](/blog/rdap-server-redacted-the-value)
- ["No registry RDAP server was identified": what it means](/blog/no-registry-rdap-server)
- [All posts](/blog/)
