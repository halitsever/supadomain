---
title: "Expired Domain Names: What Happens After Deletion"
titleTemplate: false
description: "The life of an expired domain name: the registrar's grace period, redemption, pending delete, release, drop catching, and what a new owner can do with it."
headline: "The life of an expired domain name, from grace period to drop"
date: "2026-11-28"
keyword: "expired domain names"
faq: [{"q": "When do expired domain names become available?", "a": "For gTLDs such as .com, after the registrar deletes the domain, 30 days of redemption and 5 days of pending delete. The time at the registrar before deletion varies by registrar; for .com it usually falls inside the registry's 45-day auto-renew grace period."}, {"q": "Can I get my expired domain back?", "a": "Yes, until the redemption period ends: renew it at the registrar before deletion, or restore it for a redemption fee during the 30-day redemption period."}]
---

# The life of an expired domain name, from grace period to drop

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">An expired domain name goes through fixed stages before anyone else can register it. For generic TLDs, ICANN policy sets most of them: a period at the registrar, 30 days of redemption, 5 days of pending delete and then release. What happens next is a race.</p>

## Stage 1: expired, still at the registrar

On the expiry date nothing is deleted. The registrar interrupts DNS, so the website and email stop working, and you can still renew. ICANN's [Expired Registration Recovery Policy](https://www.icann.org/resources/pages/errp-2013-02-28-en) lets the registrar delete the domain at any time after expiry, but if it keeps the domain it must stop DNS for at least the last eight days you can renew, and you must be able to renew during that time. The length of this stage is up to the registrar.

Some registrars' agreements also let them sell or auction an expired name during this stage instead of deleting it. Read your registration agreement if that matters to you.

For .com, the registry has already renewed the name automatically on the day after expiry and gives the registrar a 45-day auto-renew grace period to delete it, according to the [.com registry agreement specifications](https://www.icann.org/en/registry-agreements/com/com-registry-agreement-functional-and-performance-specifications-06-01-2010-en). An RDAP lookup in this stage can show the status `auto renew period` and a new expiry date.

## Stage 2: redemption, 30 days

If the registrar deletes the domain, gTLD registries hold it in the Redemption Grace Period for 30 days. DNS stays off and transfers are blocked. Only the previous registrant can restore it, through the registrar that deleted it, for a redemption fee. RDAP shows the status `redemption period`.

## Stage 3: pending delete, 5 days

After redemption the registry marks the name `pending delete` for five days. Nobody can restore, renew or transfer it. ICANN's [renewal and expiration FAQ](https://www.icann.org/resources/pages/domain-name-renewal-expiration-faqs-2018-12-07-en) says the name is then released for registration on a first-come, first-served basis.

## Stage 4: released

At the end of pending delete the registry deletes the name and it can be registered again. Services that specialise in **drop catching** try to register names the moment they are deleted, through their own registrar connections. Popular names are often caught this way, through a backorder placed in advance; when several people ordered the same name, the service may auction it among them. A name nobody wants simply stays available.

## The timeline

| Days after expiry (.com) | Stage | RDAP status |
| --- | --- | --- |
| 0 until the registrar deletes it (the auto-renew grace period is 45 days) | Expired at the registrar | `auto renew period` at the registry |
| +30 after deletion | Redemption Grace Period | `redemption period` |
| +5 | Pending delete | `pending delete` |
| after that | Released | 404, not found |

Country-code TLDs follow their registries' own rules and can be much shorter or longer.

## Why letting a domain drop is risky

Whoever registers the name next controls everything addressed to it:

- **Email.** Messages to your old addresses go to them, including password reset links for accounts you signed up for with that address.
- **Links.** Every link and backlink to the old site now points to their content.
- **Trust.** Customers, search engines and integrations that knew the name still trust it.

If you stop using a domain, keep it renewed until no account, link or customer depends on it, or move those first.

## Watching a domain through the stages

Each stage shows up in the domain's RDAP status, so you can follow it with the [domain expiry checker](/domain-expiry-checker/) or with `curl -sL https://rdap.org/domain/<name> | jq .status`. For your own domains, the better plan is to never reach stage 1. [Supadomain](/) keeps expiry dates from RDAP and alerts a Slack channel before the date; [domain renewal](/blog/domain-renewal) covers the renewal side.

## FAQ

### When do expired domain names become available?

For gTLDs such as .com, after the registrar deletes the domain, 30 days of redemption and 5 days of pending delete. The time at the registrar before deletion varies by registrar; for .com it usually falls inside the registry's 45-day auto-renew grace period.

### Can I get my expired domain back?

Yes, until the redemption period ends: renew it at the registrar before deletion, or restore it for a redemption fee during the 30-day redemption period.

## Related posts

- [Domain renewal: grace period, redemption and auto-renew](/blog/domain-renewal)
- [Transferring an expired domain: what ICANN's rules allow](/blog/transfer-expired-domain)
- [Domain expiry scam emails: check the real date first](/blog/domain-expiry-scam-email)
- [All posts](/blog/)
