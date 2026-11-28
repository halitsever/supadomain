---
title: "Domain Renewal: Grace Period, Redemption, Auto-Renew"
titleTemplate: false
description: "How domain renewal works for .com and other gTLDs under ICANN rules: reminder emails, auto-renew, the grace period after expiry, redemption fees and deletion."
headline: "Domain renewal: grace period, redemption and auto-renew"
date: "2026-11-28"
keyword: "domain renewal"
faq: [{"q": "What happens if I don't renew my domain?", "a": "Your registrar stops DNS for it and may delete it. A deleted gTLD domain spends 30 days in redemption, where you can restore it for a fee, then 5 days in pending delete, and is then released for anyone to register."}, {"q": "Is there a grace period after a domain expires?", "a": "Yes, but its length depends on the registrar. ICANN requires that you can still renew during the period when DNS is interrupted, at least eight days if the registrar keeps the domain that long, and gTLD registries add a 30-day redemption period after deletion."}]
---

# Domain renewal: grace period, redemption and auto-renew

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">A domain is registered for a fixed term, usually between one and ten years, and stays yours only while you keep renewing it. ICANN's policies give generic top-level domains such as .com, .net and .org a common set of rules for what happens around the expiry date. Country-code domains set their own.</p>

## Before the expiry date

Your registrar has to remind you. Under ICANN's [Expired Registration Recovery Policy](https://www.icann.org/resources/pages/errp-2013-02-28-en), it sends at least two notices before the expiry date, one about a month before and one about a week before, plus one more within five days after the date if the domain is still neither renewed nor deleted. The notices go to the registrant's email address, so an old address on the account is the most common reason people miss them.

**Auto-renew** is a registrar setting, not an ICANN rule. When it is on, the registrar charges your stored payment method shortly before the expiry date. It fails quietly when the card has expired, so a card change is a good moment to check your domains.

You can renew early at any time. A renewal extends the current expiry date; it does not restart the term from today.

## After the expiry date

When the date passes without a renewal, the domain does not disappear at once. The [Expired Registration Recovery Policy](https://www.icann.org/resources/pages/errp-2013-02-28-en) sets these rules for the registrar:

- It may delete the registration at any time after expiry, within its registration agreement.
- If it deletes the domain within eight days, it must interrupt DNS resolution from expiry until deletion, where the registry allows it.
- If it keeps the domain longer, DNS must be interrupted for at least the last eight days during which you can still renew.
- During that time you must be able to renew. Once you do, the registrar restores DNS as soon as it reasonably can.
- If it sends your web traffic to a parking page, that page must say the domain has expired and explain how to renew.

How long this window lasts depends on the registrar. Its registration agreement and website list the post-expiry renewal price, which ICANN requires it to publish.

### The registry's auto-renew grace period

Behind the registrar, some registries renew the name themselves. The [.com registry agreement specifications](https://www.icann.org/en/registry-agreements/com/com-registry-agreement-functional-and-performance-specifications-06-01-2010-en) describe it: if a .com name is not renewed by its expiry date, the registry renews it automatically the day after, and the registrar has a 45-day auto-renew grace period to delete it and get the fee back. During that period, an RDAP lookup can already show the next year's expiry date and the status `auto renew period`, even though you have not paid. Do not read a new date as proof that a renewal went through; check with your registrar.

## Redemption: the last chance

If the registrar deletes the domain, gTLD registries (except sponsored ones) hold it in a **Redemption Grace Period** of 30 days. DNS stays off, transfers are blocked and only the original registrant can get it back, through the registrar that deleted it. A restore costs a redemption fee on top of the renewal, often much more than a normal renewal, and the registrar must publish that fee too. ICANN's [renewal and expiration FAQ](https://www.icann.org/resources/pages/domain-name-renewal-expiration-faqs-2018-12-07-en) has the details.

After redemption comes **pending delete**: five days during which nothing can be done. Then the name is released and anyone can register it, first come, first served. [What happens to expired domain names](/blog/what-happens-to-expired-domains) covers that part.

## The timeline for a .com

| Stage | Length | What you can do |
| --- | --- | --- |
| Before expiry | until the expiry date | Renew at the normal price |
| Registrar's post-expiry period | set by the registrar, inside the registry's 45-day auto-renew grace period | Renew, usually at the normal or a late price |
| Redemption Grace Period | 30 days | Restore through the same registrar, with a redemption fee |
| Pending delete | 5 days | Nothing |
| Released | | Anyone can register it |

## Renewal price

The renewal price is set by the registrar and is often higher than the first-year price. Compare renewal prices, not first-year offers, before you move domains around. Moving a domain to a new registrar also renews it: a completed transfer adds one year to the registration under ICANN's [Transfer Policy](https://www.icann.org/resources/pages/transfer-policy-2016-06-01-en). [Transferring a domain after it expires](/blog/transfer-expired-domain) explains when that works.

## A short renewal checklist

1. Keep the registrant email current and make sure reminder emails are not filtered.
2. Turn on auto-renew and keep the payment method valid.
3. Look up the real expiry date from the registry, with the [domain expiry checker](/domain-expiry-checker/) or `curl` as in [how to check a domain expiry date](/blog/check-domain-expiry-date).
4. For domains that matter to a team, add them to a monitor. [Supadomain](/) reads the date over RDAP when a domain is added and sends a Slack alert each time the domain crosses a threshold you tick. It looks the date up again once a day, so a renewal starts the alerts over, as the [Slack alerts guide](/guide/slack-alerts#after-a-renewal) explains.

## FAQ

### What happens if I don't renew my domain?

Your registrar stops DNS for it and may delete it. A deleted gTLD domain spends 30 days in redemption, where you can restore it for a fee, then 5 days in pending delete, and is then released for anyone to register.

### Is there a grace period after a domain expires?

Yes, but its length depends on the registrar. ICANN requires that you can still renew during the period when DNS is interrupted, at least eight days if the registrar keeps the domain that long, and gTLD registries add a 30-day redemption period after deletion.

## Related posts

- [Transferring an expired domain: what ICANN's rules allow](/blog/transfer-expired-domain)
- [Find a domain's expiry date with one RDAP command](/blog/check-domain-expiry-date)
- [The life of an expired domain name, from grace period to drop](/blog/what-happens-to-expired-domains)
- [All posts](/blog/)
