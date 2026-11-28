---
title: "Domain Expiry Scam Emails: Check the Real Date"
titleTemplate: false
description: "Got an urgent email saying your services may be interrupted due to domain expiry? How these scams work and how to check the real expiry date over RDAP."
headline: "Domain expiry scam emails: check the real date first"
date: "2026-11-28"
keyword: "urgent services may be interrupted due to domain expiry"
faq: [{"q": "Is an email saying my domain is expiring a scam?", "a": "It can be either. Look up the domain's expiry date and registrar over RDAP yourself. If the date is far away or the sender is not your registrar, it is a scam."}, {"q": "How do I renew my domain safely?", "a": "Log in to your registrar's website directly, not through a link in an email, and renew from your account."}]
---

# Domain expiry scam emails: check the real date first

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">Emails that warn your website and email will stop working unless you renew your domain right now are a common scam. Some are real reminders. The way to tell them apart is to ignore the email's links and look up the domain's real expiry date and registrar yourself.</p>

## How the scam works

[Malwarebytes described a campaign in June 2026](https://www.malwarebytes.com/blog/threat-intel/2026/06/fake-domain-renewal-emails-trick-website-owners-into-paying-scammers) that follows the usual pattern:

- The email says the domain is about to expire and that the website and email may be interrupted.
- The link opens a page that seems to look up your domain and shows a registrar and expiry date. Much of it is made up; in that campaign, the "registry ID" was generated in the browser.
- The page shows a near expiry banner, a discounted price and a countdown timer, and a pop-up if you try to leave.
- "Renew now" renews nothing. It collects your name, address and phone number, then your card details.

Other variants send you to a fake webmail login to steal your email password, as in the ["Domain Renewal Reminder" emails PCRisk documented](https://www.pcrisk.com/removal-guides/35384-domain-renewal-reminder-email-scam), or to an invoice priced several times above a normal renewal, as [Carleton University warned in 2026](https://carleton.ca/cutheme-docs/2026/beware-of-domain-renewal-practices/). The subject lines change from wave to wave; PCRisk also lists ["Your Domain Is Scheduled To Expire"](https://www.pcrisk.com/removal-guides/35074-your-domain-is-scheduled-to-expire-email-scam) and ["Domain Service Deactivation"](https://www.pcrisk.com/removal-guides/35557-domain-service-deactivation-email-scam).

## What a real reminder looks like

For .com, .net, .org and other generic TLDs, your registrar must send renewal reminders under ICANN's [Expired Registration Recovery Policy](https://www.icann.org/resources/pages/errp-2013-02-28-en): one about a month before the expiry date, one about a week before, and one within five days after. A real reminder:

- comes from the registrar you actually use, the one that holds the domain
- matches the real expiry date
- does not need you to pay through a link: you can log in to the registrar's site directly and see the same thing

## Check the real date yourself

The registry's own record is the source of truth, and you can read it in a few seconds without touching the email.

**In the browser:** enter the domain into the [domain expiry checker](/domain-expiry-checker/). It asks the registry's RDAP server directly and shows the expiry date, days left and the registrar.

**In a terminal:**

```bash
curl -sL https://rdap.org/domain/example.com \
  | jq '{expires: (.events[] | select(.eventAction == "expiration") | .eventDate),
         registrar: (.entities[] | select(.roles | index("registrar")) | .vcardArray[1][] | select(.[0] == "fn") | .[3])}'
```

Compare what you get with the email:

| The email says | RDAP shows | What it means |
| --- | --- | --- |
| Expires in 3 days | Expires next year | Scam. |
| A registrar or "domain services" company you do not know | Your registrar | Scam, or at best an unsolicited reseller offer. |
| Expires soon | Expires soon, at your registrar | Probably real. Renew by logging in to your registrar directly, not through the email. |

## Red flags

- Urgency and countdowns.
- A sender address on a free mail service, or a brand that does not match your registrar.
- A login page for your email or hosting reached from a link.
- A price far from your registrar's renewal price.

## If you already clicked

Malwarebytes' advice for that campaign: if you entered card details, call your bank, turn on transaction alerts and watch for small test charges. If you entered a password, change it everywhere you used it. Expect follow-up phishing by phone or email.

## Stop relying on email reminders

Reminder emails are easy to fake and easy to miss. For domains a team depends on, keep the expiry dates somewhere you trust. [Supadomain](/) is a self-hosted monitor that reads the dates over RDAP and posts a Slack alert when a domain crosses a threshold you set. A scam email cannot change what it shows. [How to monitor domain expiration](/guide/monitor-domain-expiration) compares it with the other options.

## FAQ

### Is an email saying my domain is expiring a scam?

It can be either. Look up the domain's expiry date and registrar over RDAP yourself. If the date is far away or the sender is not your registrar, it is a scam.

### How do I renew my domain safely?

Log in to your registrar's website directly, not through a link in an email, and renew from your account.

## Related posts

- [Domain renewal: grace period, redemption and auto-renew](/blog/domain-renewal)
- [Why an RDAP lookup says the value was redacted, and what stays visible](/blog/rdap-server-redacted-the-value)
- [Find a domain's expiry date with one RDAP command](/blog/check-domain-expiry-date)
- [All posts](/blog/)
