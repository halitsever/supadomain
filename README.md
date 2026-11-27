<p align="center">
<img src="./assets/Supadomain Logo.png" height="80" width="80" alt="Supadomain logo"/>
</br>
<img src="https://halitsever-api.vercel.app/api/repo-title?title=Supadomain">

<p align="center">
Self-hosted domain monitoring tool and domain expiration checker built with Nuxt, Vue and MongoDB.<br>
Add a domain and Supadomain reads its expiration date over RDAP, compares it with your alert thresholds every hour and sends a Slack alert before it expires.<br>
Docs and guides: <a href="https://projects.halit.org/supadomain/">projects.halit.org/supadomain</a><br>
<br/>
<img src="https://img.shields.io/github/sponsors/halitsever" alt="GitHub sponsors"/>
<img src="https://img.shields.io/github/license/halitsever/supadomain" alt="License: MIT"/>
</p>
</p>

<p align="center">
<img src="https://halitsever-api.vercel.app/api/details"/>
</p>

<p align="center">

<img src="./assets/screenshot.png" alt="Supadomain Screenshot" />

</p>

### Domain expiry monitor features

- Track domain expiry dates via RDAP queries
- Hourly check of every monitored domain against its alert thresholds
- Slack webhook notifications (configurable days before expiry: 30, 7, 1)
- Activity log per domain
- Self-hosted: your data stays in your own MongoDB

<p align="center">
<img src="https://halitsever-api.vercel.app/api/installation"/>
</p>

**Prerequisites:** Node.js 18+ and a MongoDB instance.

```bash
git clone https://github.com/halitsever/supadomain.git
cd supadomain
npm install
cp .env.example .env
```

Fill in `.env`:

```env
MONGODB_URI="mongodb://localhost:27017/supadomain"
NUXT_SESSION_PASSWORD="a-long-random-secret-min-32-chars"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="your-secure-password"
```

> If `ADMIN_EMAIL` / `ADMIN_PASSWORD` are not set, a random password is printed to the console on first boot.

```bash
# Development
npm run dev

# Production
npm run build
node .output/server/index.mjs
```

### Slack expiry alerts

1. Create an [Incoming Webhook](https://api.slack.com/messaging/webhooks) in your Slack workspace.
2. Go to **Settings → Notifications** in the app and paste the webhook URL.
3. Per-domain thresholds (default: 30, 7, 1 days before expiry) can be customized per domain.

### How RDAP lookups work here

RDAP (Registration Data Access Protocol) is the successor to WHOIS. It returns the same kind of registration data, including the expiry date, as structured JSON. Supadomain sends each lookup to `https://rdap.org/domain/<domain>`, a public service that redirects the request to the RDAP server of the domain's registry. From the reply it keeps the `expiration`, `registration` and `last changed` events and the list of nameservers.

A lookup runs when you add a domain and when you press **Refresh** on its page. The hourly job does not query RDAP again: it compares the stored expiry date with the domain's alert thresholds. After you renew a domain, press **Refresh** so Supadomain picks up the new date. A refresh also resets the alert state, so the thresholds apply again from the start.

There is no fallback to a WHOIS expiry lookup. If rdap.org cannot answer for a domain, the domain is not added. If the registry's reply has no `expiration` event, the domain is saved without an expiry date and gets no alerts.

<p align="center">
<a href="https://github.com/halitsever/supadomain/issues">
<img src="https://halitsever-api.vercel.app/api/issue"/>
</a>
</p>

<p align="center">
Found a bug or have an idea? Open an <a href="https://github.com/halitsever/supadomain/issues">issue</a>.<br/>
Read the <a href=".github/CONTRIBUTING.md">contributing guide</a> before sending a pull request.
</p>

<p align="center">
<img src="https://halitsever-api.vercel.app/api/sponsor"/>
</p>

<p align="center">
<img src="https://halitsever-api.vercel.app/api/license"/>
</p>

<p align="center">
Released under the <a href="LICENSE">MIT License</a>.
</p>
