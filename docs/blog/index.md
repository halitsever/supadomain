---
title: "Domain Expiry and RDAP Guides | Supadomain Blog"
titleTemplate: false
description: "Guides on domain expiry: renewal grace periods, transfers after expiry, RDAP errors and redaction, Slack webhooks and how to check an expiry date yourself."
---

# Supadomain blog

<p class="lead">Practical notes on keeping domains alive: how renewal and deletion work under ICANN policy, how to read RDAP answers, and how to get expiry alerts into Slack. Every claim links to the policy, the standard or the code it comes from.</p>

## [How to get a Slack webhook URL](/blog/slack-webhook-url)

Create a Slack incoming webhook, find the webhook URL, test it with curl and read Slack's error codes. Then paste it into Supadomain or Alertmanager.

## [Domain renewal: grace period, redemption and auto-renew](/blog/domain-renewal)

How domain renewal works for .com and other gTLDs under ICANN rules: reminder emails, auto-renew, the grace period after expiry, redemption fees and deletion.

## [Can you transfer a domain after it expires?](/blog/transfer-expired-domain)

Yes, in most cases. What ICANN's Transfer Policy says about expired domains, the 60-day locks, redemption, auth codes and the year a transfer adds.

## ["The RDAP server redacted the value": what it means](/blog/rdap-server-redacted-the-value)

Why RDAP lookups hide registrant names, emails and phone numbers, how RFC 9537 marks redacted fields, and which data stays visible, including expiry dates.

## [Domain expiry scam emails: check the real date first](/blog/domain-expiry-scam-email)

Got an urgent email saying your services may be interrupted due to domain expiry? How these scams work and how to check the real expiry date over RDAP.

## ["No registry RDAP server was identified": what it means](/blog/no-registry-rdap-server)

Why RDAP lookups fail for .io, .co, .de, .eu and 170 other ccTLDs, how the IANA bootstrap file works, and what to use for those domains instead.

## [How to check a domain expiry date without WHOIS](/blog/check-domain-expiry-date)

Check when a domain expires with an RDAP lookup: one curl command, a jq filter for the expiration event, days left in the shell, and the TLDs that hide it.

## [Expired domain names: what happens after deletion](/blog/what-happens-to-expired-domains)

The life of an expired domain name: the registrar's grace period, redemption, pending delete, release, drop catching, and what a new owner can do with it.
