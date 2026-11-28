---
title: Configuration reference
description: Every Supadomain setting in one place. Environment variables, per-domain alert thresholds, the Slack webhook, fixed limits and the data stored in MongoDB.
---

# Every Supadomain setting in one place

Supadomain has three layers of settings. Environment variables are read when the server starts. The Slack webhook and the per-domain options are set in the app and stored in MongoDB. A few limits are fixed in the code and listed here so you know what to expect.

## Environment variables

Set these in `.env` at the project root, or in the environment of the process.

| Variable | Required | Default | Purpose |
| --- | --- | --- | --- |
| `MONGODB_URI` | Yes | none | MongoDB connection string, for example `mongodb://localhost:27017/supadomain`. |
| `NUXT_SESSION_PASSWORD` | Yes | none | Seals the session cookie. At least 32 characters. |
| `ADMIN_EMAIL` | No | `admin@supadomain.com` | Email of the admin account created on first start. |
| `ADMIN_PASSWORD` | No | random | Password of that account. If unset, a random one is printed to the server log once. |

`ADMIN_EMAIL` and `ADMIN_PASSWORD` are read only while the database has no user. After the first start they have no effect.

Changing `NUXT_SESSION_PASSWORD` invalidates existing sessions, so you will have to sign in again.

## Slack webhook

| Setting | Where | Notes |
| --- | --- | --- |
| Incoming webhook URL | **Notifications** page | One URL for the whole app. Must start with `https://`. |

The URL is stored in MongoDB as plain text and shown again on the Notifications page to the signed-in admin. Treat database backups accordingly. Setup steps are in the [Slack alerts guide](./slack-alerts).

## Per-domain settings

Open a domain's row menu on the **Domains** page and choose **Edit**.

| Setting | Values | Default |
| --- | --- | --- |
| Notifications | On or off | On |
| Notify me before expiration | Any of 30, 7 and 1 days | 30, 7 and 1 |

One alert is sent per domain, when it crosses the largest threshold that is ticked. [When an alert fires](./slack-alerts#when-an-alert-fires) has the full rule.

## Fixed behaviour

These values live in the code and have no setting.

| What | Value |
| --- | --- |
| Expiry check schedule | Every hour at minute 0 (`0 * * * *`) |
| RDAP endpoint | `https://rdap.org/domain/<domain>` |
| When RDAP is queried | On add and on **Refresh** |
| Warning status | 30 days or fewer left |
| Critical status | 7 days or fewer left |
| Expired status | The stored date has passed |
| Unknown status | No expiry date stored |
| Domains per page in the table | 10 |
| Dashboard activity list | Last 10 events |
| Dashboard "Expiring soonest" | 5 domains |

## Login rate limit

Requests to the login endpoint are rate limited per IP address:

| What | Value |
| --- | --- |
| Allowed attempts | 12 within 108 seconds |
| Ban after exceeding it | 3600 seconds |
| Log folder | `logs/` |

The limiter takes the client address from the last `X-Forwarded-For` entry and trusts one proxy hop. Run the app behind exactly one reverse proxy for the limit to apply per visitor.

## What is stored in MongoDB

Four kinds of documents make up the whole state of the app.

| Model | Holds |
| --- | --- |
| Domain | One document per monitored domain |
| Activity | Events: added, removed, refresh, alert, expired |
| Notifications | The Slack webhook URL |
| User | The admin's email and a bcrypt hash of the password |

A domain document has these fields:

| Field | Type | Meaning |
| --- | --- | --- |
| `url` | String, unique | The domain name |
| `expireTime` | Date | Expiry date from RDAP |
| `registrationDate` | Date | Registration date from RDAP |
| `lastUpdate` | Date | The registry's "last changed" date |
| `lastUpdatedInRdap` | Date | When the registry's RDAP database was last updated |
| `lastChecked` | Date | When Supadomain last ran a lookup for this domain |
| `nameservers` | Array of strings | Nameserver names from RDAP |
| `notifications` | Boolean | Whether alerts are on. Default `true`. |
| `notifyDaysBefore` | Array of numbers | Alert thresholds in days. Default `[30, 7, 1]`. |
| `lastNotifiedDays` | Number or null | The threshold of the last alert sent. Cleared by a refresh. |

Backing up the MongoDB database backs up everything Supadomain knows. There are no other data files apart from the rate limiter's logs.

## Ports and processes

The production build is a single Node process started with `node .output/server/index.mjs`. It listens on port 3000 unless `PORT` is set. The hourly check runs inside this process, so keep it running under a process manager or a container that restarts it.
