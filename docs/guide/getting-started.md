---
title: Install a self-hosted domain expiry checker
description: Install Supadomain, a self-hosted domain expiry checker, on Node.js and MongoDB. Set the environment variables, sign in and add your first domain.
---

# Install a self-hosted domain expiry checker

Supadomain is a Nuxt app that you run yourself. This page takes you from a fresh clone to a first domain on the list. You need two things before you start:

- Node.js 18 or later
- A MongoDB instance that the server can reach

## Clone and install

```bash
git clone https://github.com/halitsever/supadomain.git
cd supadomain
npm install
cp .env.example .env
```

`npm install` also runs `nuxt prepare`, which generates the `.nuxt/` folder.

## Fill in `.env`

```ini
MONGODB_URI="mongodb://localhost:27017/supadomain"
NUXT_SESSION_PASSWORD="a-long-random-secret-min-32-chars"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="your-secure-password"
```

| Variable | What it does |
| --- | --- |
| `MONGODB_URI` | Connection string for your MongoDB database. The value in `.env.example` is a placeholder, so replace it. |
| `NUXT_SESSION_PASSWORD` | Secret that seals the login session cookie. Use at least 32 characters. |
| `ADMIN_EMAIL` | Email of the admin account created on first start. |
| `ADMIN_PASSWORD` | Password of that account. |

One way to make a session secret:

```bash
openssl rand -hex 32
```

The [configuration reference](./configuration) covers the defaults and every other setting.

## The admin account

Supadomain has one login. On start, the server checks whether any user exists. If the database has none, it creates the admin from `ADMIN_EMAIL` and `ADMIN_PASSWORD` and writes a line to the server log.

Two details matter here:

- Without `ADMIN_PASSWORD`, the server generates a random password and prints it in that log line. Copy it then, because it is stored only as a bcrypt hash.
- Without `ADMIN_EMAIL`, the account is `admin@supadomain.com`.

The account is seeded once. Changing these variables later does nothing while a user exists.

## Start the server

For development:

```bash
npm run dev
```

For production, build once and run the output with Node:

```bash
npm run build
node .output/server/index.mjs
```

The server listens on port 3000 unless you set `PORT`. Keep the process running. The hourly expiry check is a job inside the server process, so no check happens while it is stopped.

## Add your first domain

1. Open the app and sign in at `/login` with the admin account.
2. On the **Domains** page, press **Add domain**.
3. Type the registered domain, for example `example.com`, and press **Add**.

Supadomain looks the domain up over RDAP straight away. When the lookup works, the domain appears in the table with its expiry date and a status. If the registry cannot be reached over RDAP, the app shows an error and the domain is not saved. [RDAP vs WHOIS](./rdap-vs-whois) explains which domains that affects.

Each row shows the same things the ledger on the home page does:

| Column | Meaning |
| --- | --- |
| Status | Healthy, Warning (30 days or fewer), Critical (7 days or fewer), Expired or Unknown |
| Expires | The stored expiry date and the days left |
| Notifications | Whether alerts are on for this domain |
| Notify days | The alert thresholds for this domain. New domains get 30, 7 and 1. |

Click a row to open its drawer. **Details** leads to the domain's own page, where **Refresh** runs a new RDAP lookup. Use the row menu's **Edit** to switch alerts off or change the thresholds. **Export** on the Domains page downloads the whole list as a CSV file.

## Next: connect Slack

A domain on the list does nothing loud until Slack is connected. Open **Notifications**, paste an incoming webhook URL and send a test. The [Slack alerts guide](./slack-alerts) walks through it and explains exactly when an alert fires.

## Behind a reverse proxy

Login attempts are rate limited per IP address. The limiter reads the client IP from the last `X-Forwarded-For` entry, which assumes exactly one reverse proxy in front of the app. It writes its logs to a `logs/` folder next to the app.
