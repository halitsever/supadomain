---
title: "Can You Transfer a Domain After It Expires?"
titleTemplate: false
description: "Yes, in most cases. What ICANN's Transfer Policy says about expired domains, the 60-day locks, redemption, auth codes and the year a transfer adds."
headline: "Transferring an expired domain: what ICANN's rules allow"
date: "2026-11-28"
keyword: "can i transfer a domain that expired 3 days ago"
faq: [{"q": "Can I transfer a domain that is in redemption?", "a": "Not directly. The registry blocks transfers during the Redemption Grace Period, so the current registrar has to restore the domain first, usually for a redemption fee."}, {"q": "Does transferring an expired domain add a year?", "a": "A completed transfer adds one year. If the registry had already auto-renewed the name, as .com does, the losing registrar is credited for that renewal, so the result is usually one added year."}]
---

# Transferring an expired domain: what ICANN's rules allow

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">Usually yes. For .com, .net, .org and other generic TLDs, ICANN's rules say a registrar cannot refuse a transfer just because the domain has expired. The catch is timing: once the registrar deletes the domain, it has to be restored before it can move.</p>

## What the policy says

ICANN's [transfer FAQ for domain name holders](https://www.icann.org/resources/pages/name-holder-faqs-2017-10-10-en) puts it plainly: you have the right to transfer an expired domain, and registrars cannot deny a transfer because of expiration or non-renewal, unless you have not paid for a previous registration period. The underlying [Transfer Policy](https://www.icann.org/resources/pages/transfer-policy-2016-06-01-en) lists "no payment for previous registration period" as a reason to deny once a domain is past its expiry date, and forbids denying a transfer over a pending or future period. The renewal you skipped does not count against you.

These are gTLD rules. Country-code domains such as .uk or .de follow their own registries' policies.

## Expired a few days ago

A domain that expired three days ago is almost always still at its registrar, in the period where you can renew it. You have two options:

1. **Renew at the current registrar.** This is the fastest way to get DNS back.
2. **Transfer it.** The gaining registrar charges for the transfer, and a completed transfer adds one year to the registration.

If the registry runs an auto-renew grace period, as .com does with 45 days, a transfer inside that window does not stack two years. ICANN's [2002 registrar advisory](https://www.icann.org/announcements/advisory-06jun02.htm) explains that the losing registrar is credited for the registry's auto-renewal and the transfer adds its own year, so the result is usually one added year. Whether the losing registrar refunds you anything is up to it.

## When a transfer can still be refused

A registrar **may** deny a transfer for:

- evidence of fraud, or a reasonable dispute over who asked for the transfer
- unpaid fees for a previous period, including credit card chargebacks
- a written objection from the domain holder
- the domain being locked (status `client transfer prohibited`)
- the first 60 days after registration, or 60 days after a previous transfer

It **must** deny a transfer during a UDRP, URS or TDRP proceeding, under a court order, or within 60 days after a change of registrant, unless you opted out of that lock when the registrar offered it.

ICANN's Transfer Policy Review working group has recommended cutting the 60-day windows to 30 days and dropping the change-of-registrant lock. As of November 2026, ICANN's published Transfer Policy page still describes the 60-day windows, so ask your registrar which rules it applies today.

## Deleted domains: restore first

If the registrar has already deleted the domain, it sits in the 30-day Redemption Grace Period, and the registry blocks transfers. ICANN's FAQ says the name must be restored by your current registrar before it can be transferred, usually with a redemption fee. After redemption and the 5-day pending delete period, the name is released and the old owner has no special claim to it.

## Check the status before you start

The domain's status codes tell you where it stands. Look them up over RDAP with the [domain expiry checker](/domain-expiry-checker/) or with `curl`:

```bash
curl -sL https://rdap.org/domain/example.com | jq '.status'
```

| RDAP status | Meaning for a transfer |
| --- | --- |
| `client transfer prohibited` | Locked at the registrar. Unlock it in your account first. |
| `auto renew period` | Inside the registry's auto-renew grace period. A transfer works. |
| `redemption period` | Deleted. Restore at the current registrar first. |
| `pending delete` | Too late to restore or transfer. |

Every other code, from `server hold` to `pending transfer`, is in [domain status codes](/blog/domain-status-codes).

## The transfer steps

1. Unlock the domain in the current registrar's dashboard.
2. Get the auth code (AuthInfo). If the registrar has no self-service tool, it must give you the code within five calendar days of your request. [EPP code](/blog/epp-code) covers where to find it and how to keep it safe.
3. Start the transfer at the new registrar with the code and pay for the added year.
4. Approve the transfer if the registrar sends a confirmation email.

When the transfer is done, look up the expiry date again to confirm the extra year, and press **Refresh** on the domain in [Supadomain](/) if you monitor it there, so it counts down to the new date.

## FAQ

### Can I transfer a domain that is in redemption?

Not directly. The registry blocks transfers during the Redemption Grace Period, so the current registrar has to restore the domain first, usually for a redemption fee.

### Does transferring an expired domain add a year?

A completed transfer adds one year. If the registry had already auto-renewed the name, as .com does, the losing registrar is credited for that renewal, so the result is usually one added year.

## Related posts

- [Domain renewal: grace period, redemption and auto-renew](/blog/domain-renewal)
- [Find a domain's expiry date with one RDAP command](/blog/check-domain-expiry-date)
- [The life of an expired domain name, from grace period to drop](/blog/what-happens-to-expired-domains)
- [All posts](/blog/)
