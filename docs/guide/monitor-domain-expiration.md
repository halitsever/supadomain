---
title: How to monitor domain expiration
description: How to monitor domain expiration, from registrar reminders and manual RDAP checks to a self-hosted domain monitoring tool that alerts your team in Slack.
---

# Monitor domain expiration with RDAP lookups and Slack alerts

A domain is a lease with an end date. When the date passes, the website and the email behind the name stop working, and once the grace periods run out someone else can register it. Monitoring domain expiration means making sure a person hears about that date while there is still time to renew.

There are four common ways to do it. They differ in who gets the reminder and how much you have to remember yourself.

## 1. Rely on the registrar

Registrars email the account holder before a domain expires, and most offer auto-renew. This costs nothing and you should leave it on.

It fails in quiet ways. The reminder goes to one mailbox, often the person who registered the name years ago. Auto-renew depends on a payment card that can expire before the domain does. If your domains are spread across several registrars, there is no single place to look.

## 2. Check the date by hand

You can check a domain's expiration date yourself with one RDAP request. This command prints the expiry date the registry holds:

```bash
curl -sL https://rdap.org/domain/example.com \
  | jq -r '.events[] | select(.eventAction == "expiration") | .eventDate'
```

It is the same lookup Supadomain makes. A manual check is fine for one domain you are curious about. As a routine it depends on someone remembering to run it.

## 3. Put it in a calendar

A calendar entry a month before each expiry date is a real improvement, because a shared calendar reaches more than one person. The weakness is upkeep. Each renewal moves the date, each new domain needs an entry, and nothing tells you when the calendar and the registry disagree.

## 4. Run a domain monitor

A domain monitoring tool keeps the list for you, reads the dates from the registry and sends the reminder to a place your team already watches. Hosted services do this for a subscription. Supadomain does it on your own server, with the list stored in your own MongoDB.

The trade is simple. A hosted service is someone else's job to keep running. A self-hosted monitor is yours, and in return the list of what you own never leaves your infrastructure.

## Monitoring with Supadomain

### Set it up

1. [Install Supadomain](./getting-started) and sign in.
2. Add each domain on the **Domains** page. The app reads its expiry date over RDAP as you add it.
3. [Connect a Slack webhook](./slack-alerts) under **Notifications** and send a test.
4. Decide how much notice you want per domain. The default alert comes when a domain has 30 days or fewer left.

### Read the dashboard

The dashboard counts your domains by status and lists the five that expire soonest.

| Status | Days left |
| --- | --- |
| Healthy | More than 30 |
| Warning | 30 or fewer |
| Critical | 7 or fewer |
| Expired | The date has passed |
| Unknown | The registry sent no expiry date |

An **Unknown** domain needs another method from this page, because Supadomain has no date to watch for it.

### Act on an alert

When the Slack message arrives, renew the domain at its registrar. Supadomain reads the expiry date of every domain again once a day, so the new date appears by itself and the alerts start over for the next cycle. To see it right away, open the domain and press **Refresh** on its page.

## A short checklist

- Keep auto-renew on at the registrar, with a payment method that outlives the domain.
- Send registrar email to a shared mailbox.
- Keep every domain in one list, whatever registrar holds it.
- Route the alert to a channel several people read.
- After a renewal, check that the list shows the new date.

For the protocol behind the lookups, read [RDAP vs WHOIS](./rdap-vs-whois).
