---
title: Domain expiration alerts in Slack
description: Set up a domain expiration alert in Slack with Supadomain. Connect an incoming webhook, pick thresholds per domain and see when the expiry notification fires.
---

# Domain expiration alerts in Slack

Supadomain sends its domain expiry notifications to one Slack incoming webhook. This guide connects the webhook, shows the message you will get and explains the rule that decides when it is sent.

## Connect a webhook

1. In Slack, create an [incoming webhook](https://api.slack.com/messaging/webhooks) for the channel that should receive alerts. Slack gives you a URL that starts with `https://hooks.slack.com/services/`.
2. In Supadomain, open **Notifications** in the sidebar.
3. Paste the URL into **Incoming webhook URL** and press **Save**. The field accepts only URLs that start with `https://`.
4. Press **Send test**.

The test posts a message for `example.com` with the text "This is a test notification from Supadomain. If you received this, your Slack notifications are set up correctly!". If it shows up in the channel, alerts will too.

There is one webhook for the whole app, so every domain alerts into the same channel. To move alerts to another channel, save a different webhook URL.

::: warning Connect Slack before a domain gets close
The hourly job records an alert as sent even when no webhook is saved or Slack rejects the request. If that happened, press **Refresh** on the domain's page to arm it again.
:::

## What the message looks like

Each alert is a Slack attachment with an orange bar. The title is a warning sign followed by the domain. The text is the number of days left.

```json
{
  "attachments": [
    {
      "color": "#FFA500",
      "title": "⚠️ example.org",
      "text": "29 days until expiration",
      "footer": "Supadomain",
      "ts": 1799485200
    }
  ]
}
```

The number is the whole days left, rounded down. A domain that crosses the 30 day line has a little under 30 days remaining, so its alert reads `29 days until expiration`. If the stored date is already in the past, the text is `N days since expiration`.

## Choose thresholds per domain

Every new domain starts with alerts on and the thresholds 30, 7 and 1 days. To change them:

1. On the **Domains** page, open the menu at the end of the row and choose **Edit**.
2. Use the **Notifications** switch to turn alerts on or off for that domain.
3. Under **Notify me before expiration**, tick or untick 30 days, 7 days and 1 days.
4. Press **Save**.

## When an alert fires

The check runs every hour at minute 0. For each domain that has a stored expiry date and alerts switched on, it does this:

1. Works out the days left from the stored date.
2. Sorts the domain's thresholds from largest to smallest and takes the first one the days left are at or below.
3. Sends an alert if that threshold is not the one it alerted for last time, then remembers it in `lastNotifiedDays`.

Because step 2 starts from the largest threshold, the match is always the largest threshold you ticked. Each domain therefore sends one alert, when it crosses that threshold:

| Thresholds ticked | Alert is sent when the domain has |
| --- | --- |
| 30, 7, 1 (default) | 30 days or fewer left |
| 7, 1 | 7 days or fewer left |
| 1 | 1 day or less left |
| none | never |

Pick the largest box by how much notice you want. If a single message a month ahead is easy to lose in your channel, untick 30 on the domains that matter and take the alert at 7 days.

## Getting a second alert

Two actions arm a domain again:

- **Refresh** on the domain's page clears `lastNotifiedDays`. If the domain is still inside a threshold, the next hourly run alerts once more.
- **Unticking the threshold that already fired** makes the next largest one the match. Untick 30 after the first alert and the domain alerts again at 7 days.

After a renewal, press **Refresh** as well. The hourly job never asks the registry for a new date, so without a refresh the app keeps counting down to the old one.

## Which domains never alert

- Domains with **Notifications** switched off.
- Domains with status **Unknown**. Their registry sent no expiry date, so there is nothing to count down to.
- Any domain while the server is stopped. The job runs inside the app process and catches up at the next full hour after a restart.

## Where alerts are logged

Every alert adds an entry to **Recent activity** on the dashboard, which lists the last 10 events across all domains. Alerts for domains that were already past their date are logged as expired.
