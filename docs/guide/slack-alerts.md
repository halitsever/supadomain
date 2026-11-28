---
title: Domain expiration alerts in Slack
description: Set up a domain expiration alert in Slack with Supadomain. Connect an incoming webhook, pick thresholds per domain and see when the expiry notification fires.
---

# Sending domain expiry alerts to a Slack channel

Supadomain sends its domain expiry notifications to one Slack incoming webhook. This guide connects the webhook, shows the message you will get and explains the rule that decides when it is sent.

## Connect a webhook

1. In Slack, create an [incoming webhook](https://api.slack.com/messaging/webhooks) for the channel that should receive alerts. Slack gives you a URL that starts with `https://hooks.slack.com/services/`.
2. In Supadomain, open **Notifications** in the sidebar.
3. Paste the URL into **Incoming webhook URL** and press **Save**. The field accepts only URLs that start with `https://`.
4. Press **Send test**.

The test posts a message for `example.com` with the text "This is a test notification from Supadomain. If you received this, your Slack notifications are set up correctly!". If it shows up in the channel, alerts will too.

There is one webhook for the whole app, so every domain alerts into the same channel. To move alerts to another channel, save a different webhook URL.

If no webhook is saved, or Slack rejects the request, the alert is not recorded as sent. The hourly job tries again on its next run, so an alert that was due goes out once a working webhook is saved. **Send test** reports the same failures, which makes it the quickest way to check a URL.

To stop Slack alerts for the whole app, press **Clear** on the **Notifications** page.

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

The number is the whole days left, rounded down. A domain that crosses the 30 day line has a little under 30 days remaining, so its alert reads `29 days until expiration`. On the last day the text is `Expires today`. Once the date has passed it is `Expired today`, then `N days since expiration`.

## Choose thresholds per domain

Every new domain starts with alerts on and the thresholds 30, 7 and 1 days. To change them:

1. On the **Domains** page, open the menu at the end of the row and choose **Edit**.
2. Use the **Notifications** switch to turn alerts on or off for that domain.
3. Under **Notify me before expiration**, tick or untick 30 days, 7 days and 1 days.
4. Press **Save**.

## When an alert fires

The check runs every hour at minute 0. For each domain it does this:

1. If the last RDAP lookup is more than 24 hours old, it reads the expiry date again. A renewal is picked up here without any action from you.
2. Works out the days left from the stored date.
3. Takes the smallest ticked threshold that the days left are at or below. A date in the past counts as a final stage of its own.
4. Sends an alert if that stage is closer to expiry than the last one it alerted for, then remembers it in `lastNotifiedDays`.

With the default thresholds a domain that is never renewed sends four alerts:

| Alert | Sent when the domain has |
| --- | --- |
| First | 30 days or fewer left |
| Second | 7 days or fewer left |
| Third | 1 day or less left |
| Last | expired |

Untick a threshold to skip that alert. A domain with no thresholds ticked still sends the alert on expiry, as long as its **Notifications** switch is on.

A domain added close to its expiry date skips the stages it has already passed. Add one with 5 days left and the first alert it sends is the 7 day one.

## After a renewal

Renew the domain at its registrar and leave the rest to the app. The next daily lookup stores the new expiry date, clears `lastNotifiedDays` and writes a "new expiry date" line to the activity list. All thresholds apply again from the start.

To see the new date right away, press **Refresh** on the domain's page.

## Which domains never alert

- Domains with **Notifications** switched off.
- Domains with status **Unknown**. Their registry sent no expiry date, so there is nothing to count down to.
- Any domain while the server is stopped. The job runs inside the app process and catches up at the next full hour after a restart.

## Where alerts are logged

Every alert adds an entry to **Recent activity** on the dashboard, which lists the last 10 events across all domains. Alerts for domains that were already past their date are logged as expired.
