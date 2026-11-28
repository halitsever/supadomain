---
title: "How to Get a Slack Webhook URL (Incoming Webhooks)"
titleTemplate: false
description: "Create a Slack incoming webhook, find the webhook URL, test it with curl and read Slack's error codes. Then paste it into Supadomain or Alertmanager."
headline: "How to get a Slack webhook URL"
date: "2026-11-28"
keyword: "slack webhook url"
faq: [{"q": "Where do I find my Slack webhook URL?", "a": "In your Slack app's settings at api.slack.com/apps, under Incoming Webhooks, in the list called Webhook URLs for Your Workspace."}, {"q": "Can one Slack webhook post to several channels?", "a": "No. Each incoming webhook URL is tied to one channel. Add another webhook for each extra channel."}, {"q": "Is a Slack webhook URL secret?", "a": "Yes. Anyone who has it can post into the channel. Slack looks for leaked webhook URLs and revokes them."}]
---

# How to get a Slack webhook URL

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">A Slack webhook URL is an address that posts a message into one channel when you send it JSON. You get it by creating a Slack app, turning on Incoming Webhooks and picking a channel. The whole thing takes a few minutes and needs no code.</p>

## Create the webhook

These steps follow Slack's guide to [sending messages with incoming webhooks](https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks/).

1. Open [api.slack.com/apps](https://api.slack.com/apps) and click **Create New App**. Choose to pick features yourself, give the app a name and choose the workspace. An existing app works too.
2. In the app settings, open **Incoming Webhooks** and switch **Activate Incoming Webhooks** on.
3. Click **Add New Webhook to Workspace**.
4. Pick the channel the app should post to and click **Authorize**. For a private channel you have to be a member of it first.

The new address appears under **Webhook URLs for Your Workspace**. It looks like this:

```text
https://hooks.slack.com/services/<workspace ID>/<webhook ID>/<secret>
```

The workspace ID starts with `T`, the webhook ID with `B`, and the last part is a random secret.

GovSlack workspaces use the `slack-gov.com` domain instead of `slack.com`.

## Test it with curl

Put the URL in a shell variable so it stays out of your history, then send a JSON body with a `text` field:

```bash
read -rs SLACK_WEBHOOK_URL    # paste the URL, then press Enter
curl -X POST \
  -H 'Content-type: application/json' \
  --data '{"text": "Hello, world."}' \
  "$SLACK_WEBHOOK_URL"
```

A working webhook answers HTTP 200 with the plain text `ok`, and the message shows up in the channel. Run this test before you paste the URL anywhere else. If the curl call works, any problem later is in the tool sending the message, not in Slack.

## Error responses

When something is wrong, Slack answers with a 4xx status and an error name in the body. The ones you are most likely to meet:

| Error | What it means |
| --- | --- |
| `invalid_payload` | The body is not valid JSON or the text is not escaped. Fix the request before retrying. |
| `no_text` | The payload has no `text` field. |
| `no_service` | The webhook was disabled, removed or never existed. Create a new one. |
| `no_active_hooks` | The webhook is disabled. |
| `channel_not_found` | The channel no longer exists. |
| `channel_is_archived` | The channel is archived and takes no new messages. |
| `action_prohibited` | A workspace admin blocked this way of posting. Retrying will not help. |
| `too_many_attachments` | The message has more than 100 attachments. |

## What a webhook cannot do

- **Post to more than one channel.** Each URL belongs to one channel. For a second channel, add a second webhook.
- **Change the name or icon per message.** Channel, user name and icon come from the app's settings and cannot be overridden in the payload.
- **Delete or edit what it posted.** For that you need the Web API's `chat.postMessage` with a bot token.

## Keep the URL secret

Anyone with the URL can post into your channel. Slack's docs call it a secret, ask you not to share it online or commit it to a public repository, and say Slack actively looks for leaked webhook URLs and revokes them. If one leaks, add a new webhook and replace the old URL everywhere it was saved.

## Use it in Supadomain

[Supadomain](/) sends its domain expiry alerts to one incoming webhook:

1. Open **Notifications** in the sidebar.
2. Paste the URL into **Incoming webhook URL** and press **Save**.
3. Press **Send test** and check the channel.

Look at the channel, not only at the app's success message. In the current code, `server/utils/notifications/slack.ts` catches a failed request and only writes it to the server log, so the test reports success even when Slack rejected the call. That is one more reason to run the curl test first. Each alert is a Slack attachment with the domain as the title and the days left as the text; the [Slack alerts guide](/guide/slack-alerts) shows the exact JSON and when an alert fires.

## Use it in Prometheus Alertmanager

Alertmanager's Slack receiver takes the same URL in `api_url` under `slack_configs`, as in the [Alertmanager configuration docs](https://prometheus.io/docs/alerting/latest/configuration/#slack_config). The [grafana-docker-compose](https://projects.halit.org/grafana-docker-compose/) stack sends its alerts this way.

## FAQ

### Where do I find my Slack webhook URL?

In your Slack app's settings at api.slack.com/apps, under Incoming Webhooks, in the list called Webhook URLs for Your Workspace.

### Can one Slack webhook post to several channels?

No. Each incoming webhook URL is tied to one channel. Add another webhook for each extra channel.

### Is a Slack webhook URL secret?

Yes. Anyone who has it can post into the channel. Slack looks for leaked webhook URLs and revokes them.

## Related posts

- [Domain renewal: grace period, redemption and auto-renew](/blog/domain-renewal)
- [Domain expiry scam emails: check the real date first](/blog/domain-expiry-scam-email)
- [How to check a domain expiry date without WHOIS](/blog/check-domain-expiry-date)
- [All posts](/blog/)
