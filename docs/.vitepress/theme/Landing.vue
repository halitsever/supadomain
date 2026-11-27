<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { withBase } from 'vitepress'

type Status = 'healthy' | 'warning' | 'critical' | 'expired' | 'unknown'

interface Row {
  url: string
  /** Days from the ledger's first day to expiry. Null when RDAP gave no expiration event. */
  expiresIn: number | null
  notifications: boolean
  notifyDaysBefore: number[]
}

const DAY = 86_400_000
/** A fixed first day keeps the server render and the browser in agreement. */
const START = Date.UTC(2027, 0, 4, 9, 0)
const LAST_DAY = 45
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

const rows: Row[] = [
  { url: 'example.net', expiresIn: 12.4, notifications: true, notifyDaysBefore: [7, 1] },
  { url: 'example.org', expiresIn: 34.5, notifications: true, notifyDaysBefore: [30, 7, 1] },
  { url: 'my-shop.example', expiresIn: 48.3, notifications: false, notifyDaysBefore: [30, 7, 1] },
  { url: 'example.com', expiresIn: 212.6, notifications: true, notifyDaysBefore: [30, 7, 1] },
  { url: 'legacy.example', expiresIn: null, notifications: true, notifyDaysBefore: [30, 7, 1] },
]

const labels: Record<Status, string> = {
  healthy: 'Healthy',
  warning: 'Warning',
  critical: 'Critical',
  expired: 'Expired',
  unknown: 'Unknown',
}

const day = ref(0)
const playing = ref(false)
let timer: ReturnType<typeof setInterval> | undefined

function fmtDate(ms: number) {
  const d = new Date(ms)
  return `${String(d.getUTCDate()).padStart(2, '0')} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`
}

/** Same bands as app/composables/useDomainStatus.ts. */
function statusOf(diffDays: number | null): Status {
  if (diffDays === null) return 'unknown'
  if (diffDays < 0) return 'expired'
  if (diffDays <= 7) return 'critical'
  if (diffDays <= 30) return 'warning'
  return 'healthy'
}

/** Log scale, so the last 30 days get most of the track. */
function scale(days: number) {
  return (Math.log(1 + Math.max(0, Math.min(days, 365))) / Math.log(366)) * 100
}

const today = computed(() => fmtDate(START + day.value * DAY))

const ledger = computed(() =>
  rows.map((row) => {
    const diff = row.expiresIn === null ? null : row.expiresIn - day.value
    const left = diff === null ? null : Math.floor(diff)
    const status = statusOf(diff)
    return {
      ...row,
      status,
      label: labels[status],
      expires: row.expiresIn === null ? 'N/A' : fmtDate(START + row.expiresIn * DAY),
      left: left === null ? 'N/A' : left < 0 ? `${Math.abs(left)}d ago` : `${left}d left`,
      width: diff === null ? 0 : scale(diff),
      notches: row.notifications && diff !== null ? row.notifyDaysBefore.map((t) => ({ t, at: scale(t), fires: t === Math.max(...row.notifyDaysBefore) })) : [],
    }
  }),
)

/** Replays the hourly check in server/plugins/cron.ts once per ledger day. */
const alerts = computed(() => {
  const out: { url: string; text: string; when: string; key: string; day: number }[] = []
  for (const row of rows) {
    if (row.expiresIn === null || !row.notifications) continue
    let lastNotifiedDays: number | null = null
    for (let d = 0; d <= day.value; d++) {
      const diffDays = row.expiresIn - d
      const thresholds = row.notifyDaysBefore.slice().sort((a, b) => b - a)
      const triggered = thresholds.find((t) => diffDays <= t)
      if (triggered !== undefined && lastNotifiedDays !== triggered) {
        const daysLeft = Math.floor(diffDays)
        out.push({
          url: row.url,
          text: daysLeft < 0 ? `${Math.abs(daysLeft)} days since expiration` : `${daysLeft} days until expiration`,
          when: fmtDate(START + d * DAY),
          key: `${row.url}-${d}`,
          day: d,
        })
        lastNotifiedDays = triggered
      }
    }
  }
  return out.sort((a, b) => a.day - b.day)
})

function stop() {
  playing.value = false
  if (timer) clearInterval(timer)
  timer = undefined
}

function play(until = LAST_DAY) {
  stop()
  if (day.value >= until) day.value = 0
  playing.value = true
  timer = setInterval(() => {
    if (day.value >= until) return stop()
    day.value++
  }, 320)
}

function toggle() {
  playing.value ? stop() : play()
}

function reset() {
  stop()
  day.value = 0
}

onMounted(() => {
  // One short run on load, far enough for the first two alerts to land.
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) setTimeout(() => play(8), 900)
})
onBeforeUnmount(stop)

const cronCode = `const diffMs = new Date(domain.expireTime as Date).getTime() - now.getTime();
const diffDays = diffMs / (1000 * 60 * 60 * 24);

const thresholds = (domain.notifyDaysBefore ?? [30, 7, 1]).slice().sort((a, b) => b - a);
const triggeredThreshold = thresholds.find(t => diffDays <= t);

if (triggeredThreshold !== undefined && domain.lastNotifiedDays !== triggeredThreshold) {
    const daysLeft = Math.floor(diffDays);
    const label = daysLeft < 0
        ? \`\${Math.abs(daysLeft)} days since expiration\`
        : \`\${daysLeft} days until expiration\`;

    await sendSlackNotification(domain.url, label);`

const installCode = `git clone https://github.com/halitsever/supadomain.git
cd supadomain
npm install
cp .env.example .env

npm run build
node .output/server/index.mjs`

const envCode = `MONGODB_URI="mongodb://localhost:27017/supadomain"
NUXT_SESSION_PASSWORD="a-long-random-secret-min-32-chars"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="your-secure-password"`

const fields = [
  ['expiration', 'expireTime'],
  ['registration', 'registrationDate'],
  ['last changed', 'lastUpdate'],
  ['last update of RDAP database', 'lastUpdatedInRdap'],
]

const bands: { status: Status; rule: string }[] = [
  { status: 'healthy', rule: 'More than 30 days left' },
  { status: 'warning', rule: '30 days or fewer' },
  { status: 'critical', rule: '7 days or fewer' },
  { status: 'expired', rule: 'The date has passed' },
  { status: 'unknown', rule: 'No expiry date stored' },
]
</script>

<template>
  <div class="sd">
    <header class="sd-hero">
      <svg class="sd-dial" viewBox="0 0 600 600" aria-hidden="true">
        <g v-for="i in 60" :key="i" :transform="`rotate(${i * 6} 300 300)`">
          <rect :x="i % 5 === 0 ? 296.5 : 298.5" y="6" :width="i % 5 === 0 ? 7 : 3" :height="i % 5 === 0 ? 34 : 16" rx="1.5" />
        </g>
      </svg>
      <div class="sd-wrap sd-hero-inner">
        <h1>Self-hosted domain expiration monitoring</h1>
        <p class="sd-lede">
          Supadomain keeps a ledger of your domains and the day each one runs out. It reads every expiry date over RDAP
          and checks the ledger once an hour. When a domain crosses its alert threshold, your Slack channel gets a
          message. It is open source and runs on your own server with your own MongoDB.
        </p>
        <div class="sd-cta">
          <a class="sd-btn sd-btn-solid" :href="withBase('/guide/getting-started')">Install Supadomain</a>
          <a class="sd-btn sd-btn-line" href="https://github.com/halitsever/supadomain">
            <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2.1c-3.2.7-3.88-1.37-3.88-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.47.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.58.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.7 5.4-5.27 5.68.42.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z"
              />
            </svg>
            View the source
          </a>
        </div>
      </div>
    </header>

    <section class="sd-wrap sd-demo" aria-labelledby="ledger-title">
      <div class="sd-ledger">
        <div class="sd-ledger-head">
          <div class="sd-today">
            <span id="ledger-title" class="sd-today-label">Ledger for</span>
            <output class="sd-today-date" for="sd-day">{{ today }}</output>
          </div>
          <div class="sd-scrub">
            <label for="sd-day">Move the date forward</label>
            <input id="sd-day" v-model.number="day" type="range" min="0" :max="LAST_DAY" step="1" @input="stop" />
            <span class="sd-scrub-val">+{{ day }}d</span>
          </div>
          <div class="sd-controls">
            <button type="button" class="sd-icon-btn" @click="toggle">
              <svg v-if="!playing" viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M7 4.5v15l12-7.5z" /></svg>
              <svg v-else viewBox="0 0 24 24" width="14" height="14" aria-hidden="true"><path fill="currentColor" d="M6 5h4v14H6zM14 5h4v14h-4z" /></svg>
              {{ playing ? 'Pause' : 'Play' }}
            </button>
            <button type="button" class="sd-icon-btn" :disabled="day === 0" @click="reset">Reset</button>
          </div>
        </div>

        <div class="sd-axis" aria-hidden="true">
          <span class="sd-axis-label">days left</span>
          <div class="sd-axis-track">
            <span v-for="t in [1, 7, 30, 90, 365]" :key="t" :style="{ left: scale(t) + '%' }">{{ t }}</span>
          </div>
        </div>

        <ul class="sd-rows">
          <li v-for="row in ledger" :key="row.url" class="sd-row" :data-status="row.status">
            <div class="sd-domain">
              <span class="sd-dot" />
              <span class="sd-url">{{ row.url }}</span>
            </div>
            <span class="sd-expires">{{ row.expires }}</span>
            <span class="sd-pill">{{ row.label }}</span>
            <div class="sd-track" :class="{ 'sd-track-none': row.expiresIn === null }">
              <span class="sd-zone sd-zone-critical" :style="{ width: scale(7) + '%' }" />
              <span class="sd-zone sd-zone-warning" :style="{ left: scale(7) + '%', width: scale(30) - scale(7) + '%' }" />
              <span class="sd-bar" :style="{ width: row.width + '%' }" />
              <span v-for="n in row.notches" :key="n.t" class="sd-notch" :class="{ 'sd-notch-minor': !n.fires }" :style="{ left: n.at + '%' }" />
              <span v-if="row.expiresIn === null" class="sd-track-note">no expiration event in the RDAP reply</span>
            </div>
            <span class="sd-left">{{ row.left }}</span>
            <span class="sd-notify">{{ row.notifications ? 'notify days: ' + row.notifyDaysBefore.join(', ') : 'notifications disabled' }}</span>
          </li>
        </ul>

        <p class="sd-legend">
          <span class="sd-notch sd-notch-key" /> The dark notch is the threshold that sends the alert. Lighter notches are the
          other thresholds set on that domain.
        </p>
      </div>

      <aside class="sd-slack" aria-label="Slack alerts sent so far">
        <div class="sd-slack-head">
          <span class="sd-hash">#</span>
          <span class="sd-channel">domain-alerts</span>
          <span class="sd-count">{{ alerts.length }} {{ alerts.length === 1 ? 'alert' : 'alerts' }}</span>
        </div>
        <div class="sd-slack-body" aria-live="polite">
          <p v-if="alerts.length === 0" class="sd-slack-empty">
            No alert yet. Move the date forward until a bar reaches a notch.
          </p>
          <div v-for="a in alerts" :key="a.key" class="sd-msg">
            <span class="sd-avatar" aria-hidden="true">
              <svg viewBox="0 0 24 24" width="16" height="16"><path fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2M6 17l3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06M12 6l3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8" /></svg>
            </span>
            <div class="sd-msg-main">
              <div class="sd-msg-meta"><strong>incoming-webhook</strong><span class="sd-app">APP</span><span>{{ a.when }}</span></div>
              <div class="sd-attach">
                <div class="sd-attach-title">
                  <svg viewBox="0 0 24 24" width="15" height="15" aria-label="Warning"><path fill="#f5a300" d="M12 2.6 1.3 21.2h21.4z" /><path fill="#1d1c1d" d="M11 9.5h2v6h-2zM11 17h2v2h-2z" /></svg>
                  {{ a.url }}
                </div>
                <div class="sd-attach-text">{{ a.text }}</div>
                <div class="sd-attach-foot">Supadomain</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <p class="sd-caption">
        Illustration with made-up domains. The check is the one in
        <a href="https://github.com/halitsever/supadomain/blob/main/server/plugins/cron.ts">server/plugins/cron.ts</a>, run
        once per ledger day here and once an hour in the app. The message text and the orange bar are what
        <a href="https://github.com/halitsever/supadomain/blob/main/server/utils/notifications/slack.ts">slack.ts</a> sends.
        Each domain alerts once, at its largest threshold.
        <a :href="withBase('/guide/slack-alerts#when-an-alert-fires')">How alerts fire</a>.
      </p>
    </section>

    <section class="sd-wrap sd-section">
      <h2>From a registry date to a Slack message</h2>
      <p class="sd-intro">
        Four things happen between adding a domain and hearing about it. Nothing here leaves your server except the RDAP
        lookup and the Slack webhook call.
      </p>

      <ol class="sd-steps">
        <li>
          <span class="sd-when">When you add a domain</span>
          <div>
            <h3>One RDAP lookup</h3>
            <p>
              The server requests <code>https://rdap.org/domain/example.org</code>. rdap.org redirects to the RDAP server of
              the domain's registry, which answers in JSON. If the lookup fails, the domain is not added. There is no WHOIS
              fallback.
            </p>
          </div>
        </li>
        <li>
          <span class="sd-when">Stored in MongoDB</span>
          <div>
            <h3>Four dates and the nameservers</h3>
            <p>Supadomain keeps these RDAP events, plus each nameserver's <code>ldhName</code>.</p>
            <table class="sd-map">
              <thead>
                <tr><th>RDAP eventAction</th><th>Stored field</th></tr>
              </thead>
              <tbody>
                <tr v-for="f in fields" :key="f[0]"><td>{{ f[0] }}</td><td>{{ f[1] }}</td></tr>
              </tbody>
            </table>
          </div>
        </li>
        <li>
          <span class="sd-when">Every hour, at minute 0</span>
          <div>
            <h3>The stored date meets the thresholds</h3>
            <p>
              The hourly job reads from the database only. It does not call RDAP again, so press Refresh on a domain after
              you renew it. This is the check, from <code>server/plugins/cron.ts</code>:
            </p>
            <pre class="sd-code"><code>{{ cronCode }}</code></pre>
          </div>
        </li>
        <li>
          <span class="sd-when">At the threshold</span>
          <div>
            <h3>One message to your webhook</h3>
            <p>
              Slack receives the domain name and a line such as <code>29 days until expiration</code>. The dashboard's
              activity list records that the alert went out.
              <a :href="withBase('/guide/slack-alerts')">Set up Slack alerts</a>.
            </p>
          </div>
        </li>
      </ol>
    </section>

    <section class="sd-wrap sd-section">
      <h2>How the dashboard reads a date</h2>
      <p class="sd-intro">
        Every domain gets one of five statuses. The limits are fixed in the app and match the colours in the ledger above.
      </p>
      <ul class="sd-bands">
        <li v-for="b in bands" :key="b.status" :data-status="b.status">
          <span class="sd-pill">{{ labels[b.status] }}</span>
          <span>{{ b.rule }}</span>
        </li>
      </ul>
      <figure class="sd-shot">
        <img :src="withBase('/dashboard.png')" width="2396" height="1584" loading="lazy" alt="Supadomain dashboard with status counts, the domains expiring soonest and recent activity" />
        <figcaption>The dashboard, as shown in the repository's README.</figcaption>
      </figure>
    </section>

    <section class="sd-wrap sd-section sd-install">
      <div>
        <h2>Run it on your own server</h2>
        <p class="sd-intro">
          You need Node.js 18 or later and a MongoDB instance. The first start against an empty database creates the admin
          account from <code>ADMIN_EMAIL</code> and <code>ADMIN_PASSWORD</code>. Leave the password out and a random one is
          printed to the server log.
        </p>
        <p class="sd-links">
          <a :href="withBase('/guide/getting-started')">Getting started</a>
          <a :href="withBase('/guide/configuration')">Configuration reference</a>
        </p>
      </div>
      <div class="sd-terms">
        <div class="sd-term">
          <div class="sd-term-name">shell</div>
          <pre><code>{{ installCode }}</code></pre>
        </div>
        <div class="sd-term">
          <div class="sd-term-name">.env</div>
          <pre><code>{{ envCode }}</code></pre>
        </div>
      </div>
    </section>

    <section class="sd-wrap sd-section">
      <h2>What it leaves out</h2>
      <p class="sd-intro">
        Supadomain is small on purpose. Knowing its limits up front saves you from finding them on the day a domain lapses.
      </p>
      <dl class="sd-limits">
        <div>
          <dt>No WHOIS fallback</dt>
          <dd>
            A domain whose registry has no RDAP service cannot be added.
            <a :href="withBase('/guide/rdap-vs-whois')">RDAP vs WHOIS</a> explains why and how to test a domain first.
          </dd>
        </div>
        <div>
          <dt>No automatic re-lookup</dt>
          <dd>The stored expiry date changes only when you press Refresh on the domain's page. Do that after each renewal.</dd>
        </div>
        <div>
          <dt>Slack only</dt>
          <dd>Alerts go to one Slack incoming webhook. There is no email or SMS channel.</dd>
        </div>
        <div>
          <dt>One admin account</dt>
          <dd>The app seeds a single login from your environment. It has no sign-up page and no user management.</dd>
        </div>
      </dl>
      <p class="sd-more">
        New to this? Read <a :href="withBase('/guide/monitor-domain-expiration')">how to monitor domain expiration</a> for
        the manual options and where a self-hosted monitor fits.
      </p>
    </section>
  </div>
</template>

<style scoped>
.sd {
  --blue-deep: #0b3fd8;
  --blue: #1447e6;
  --ink: oklch(0.141 0.005 285.823);
  --mute: oklch(0.552 0.016 285.938);
  --line: oklch(0.92 0.004 286.32);
  --wash: oklch(0.967 0.001 286.375);
  --success: oklch(0.527 0.153 147.07);
  --warning: oklch(0.769 0.185 78.17);
  --warning-ink: oklch(0.56 0.14 70);
  --critical: oklch(0.627 0.196 43.44);
  --expired: oklch(0.577 0.245 27.325);
  --r: 0.65rem;
  --r-xl: calc(0.65rem + 4px);
  --mono: 'IBM Plex Mono', ui-monospace, 'SF Mono', Menlo, monospace;
  color: var(--ink);
  font-variant-numeric: tabular-nums;
  overflow-x: clip;
}

.sd-wrap {
  max-width: 1152px;
  margin: 0 auto;
  padding: 0 24px;
}

.sd a {
  color: var(--blue);
  text-decoration: underline;
  text-decoration-color: color-mix(in oklab, var(--blue) 35%, transparent);
  text-underline-offset: 3px;
}
.sd a:hover {
  text-decoration-color: currentColor;
}
.sd :focus-visible {
  outline: 2px solid var(--blue);
  outline-offset: 2px;
  border-radius: 4px;
}

.sd code {
  font-family: var(--mono);
  font-size: 0.875em;
}
.sd p code,
.sd dd code {
  background: var(--wash);
  border: 1px solid var(--line);
  border-radius: 5px;
  padding: 1px 5px;
  overflow-wrap: anywhere;
}

/* Hero: the flat blue field of the social card. */
.sd-hero {
  position: relative;
  background: var(--blue-deep);
  color: #fff;
  padding: 72px 0 196px;
  overflow: hidden;
}
.sd-dial {
  position: absolute;
  right: -150px;
  top: -70px;
  width: 620px;
  height: 620px;
  fill: #fff;
  opacity: 0.13;
}
.sd-hero-inner {
  position: relative;
}
.sd-hero h1 {
  font-size: clamp(2.3rem, 5.6vw, 4.1rem);
  line-height: 1.04;
  letter-spacing: -0.022em;
  font-weight: 700;
  max-width: 13.5em;
  text-wrap: balance;
}
.sd-lede {
  margin-top: 24px;
  max-width: 39em;
  font-size: clamp(1.05rem, 1.5vw, 1.2rem);
  line-height: 1.6;
  color: rgb(255 255 255 / 0.86);
}
.sd-cta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 32px;
}
.sd .sd-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 44px;
  padding: 0 18px;
  border-radius: var(--r);
  font-weight: 600;
  font-size: 15px;
  text-decoration: none;
  transition: background-color 0.15s, border-color 0.15s;
}
.sd .sd-btn-solid {
  background: #fff;
  color: var(--blue-deep);
}
.sd .sd-btn-solid:hover {
  background: oklch(0.95 0.03 262);
}
.sd .sd-btn-line {
  color: #fff;
  border: 1px solid rgb(255 255 255 / 0.4);
}
.sd .sd-btn-line:hover {
  border-color: #fff;
}
.sd-hero :focus-visible {
  outline-color: #fff;
}

/* The ledger sits across the edge of the blue field. */
.sd-demo {
  position: relative;
  margin-top: -140px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 328px;
  gap: 16px;
  align-items: start;
}
.sd-ledger,
.sd-slack {
  background: #fff;
  border: 1px solid var(--line);
  border-radius: var(--r-xl);
  box-shadow: 0 1px 0 rgb(17 17 26 / 0.04), 0 24px 48px -28px rgb(11 30 110 / 0.45);
  min-width: 0;
}

.sd-ledger-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 14px 24px;
  padding: 16px 18px;
  border-bottom: 1px solid var(--line);
}
.sd-today {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.sd-today-label {
  font-size: 12.5px;
  color: var(--mute);
}
.sd-today-date {
  font-family: var(--mono);
  font-weight: 500;
  font-size: 22px;
  letter-spacing: -0.02em;
  line-height: 1.2;
}
.sd-scrub {
  flex: 1 1 240px;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 4px 12px;
  align-items: center;
}
.sd-scrub label {
  grid-column: 1 / -1;
  font-size: 12.5px;
  color: var(--mute);
}
.sd-scrub input {
  width: 100%;
  height: 24px;
  accent-color: var(--blue);
  cursor: pointer;
}
.sd-scrub-val {
  font-family: var(--mono);
  font-size: 13px;
  min-width: 4ch;
  text-align: right;
}
.sd-controls {
  display: flex;
  gap: 6px;
}
.sd-icon-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 12px;
  border-radius: calc(var(--r) - 2px);
  background: var(--wash);
  font-size: 13px;
  font-weight: 500;
  transition: background-color 0.15s;
}
.sd-icon-btn:hover:not(:disabled) {
  background: var(--line);
}
.sd-icon-btn:disabled {
  opacity: 0.45;
  cursor: default;
}

/* Rows share one grid so the bars line up under the axis. */
.sd-axis,
.sd-row {
  display: grid;
  grid-template-columns: minmax(132px, 1.1fr) 104px 76px minmax(120px, 2fr) 68px;
  column-gap: 14px;
  align-items: center;
  padding: 0 18px;
}
.sd-axis {
  padding-top: 10px;
  padding-bottom: 6px;
  font-family: var(--mono);
  font-size: 11px;
  color: var(--mute);
}
.sd-axis-label {
  grid-column: 3;
  text-align: right;
  white-space: nowrap;
}
.sd-axis-track {
  grid-column: 4;
  position: relative;
  height: 14px;
}
.sd-axis-track span {
  position: absolute;
  transform: translateX(-50%);
}
.sd-axis-track span:last-child {
  transform: translateX(-100%);
}

.sd-rows {
  list-style: none;
}
.sd-row {
  padding-top: 13px;
  padding-bottom: 13px;
  border-top: 1px solid var(--line);
  row-gap: 2px;
}
.sd-row[data-status='healthy'] { --c: var(--success); --ct: var(--success); }
.sd-row[data-status='warning'] { --c: var(--warning); --ct: var(--warning-ink); }
.sd-row[data-status='critical'] { --c: var(--critical); --ct: var(--critical); }
.sd-row[data-status='expired'] { --c: var(--expired); --ct: var(--expired); }
.sd-row[data-status='unknown'] { --c: var(--mute); --ct: var(--mute); }

.sd-domain {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}
.sd-dot {
  flex: none;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--c);
  transition: background-color 0.3s;
}
.sd-url {
  font-family: var(--mono);
  font-weight: 500;
  font-size: 13.5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sd-expires {
  font-family: var(--mono);
  font-size: 12.5px;
  color: var(--mute);
  white-space: nowrap;
}
.sd-pill {
  justify-self: start;
  font-size: 11.5px;
  font-weight: 500;
  line-height: 1.5;
  padding: 1px 8px;
  border-radius: 999px;
  border: 1px solid color-mix(in oklab, var(--c) 28%, transparent);
  background: color-mix(in oklab, var(--c) 10%, transparent);
  color: var(--ct);
  transition: color 0.3s, background-color 0.3s, border-color 0.3s;
}
.sd-track {
  position: relative;
  height: 10px;
  border-radius: 999px;
  background: var(--wash);
}
.sd-zone {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
}
.sd-zone-critical {
  background: color-mix(in oklab, var(--critical) 13%, transparent);
  border-radius: 999px 0 0 999px;
}
.sd-zone-warning {
  background: color-mix(in oklab, var(--warning) 16%, transparent);
}
.sd-bar {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  min-width: 10px;
  border-radius: 999px;
  background: var(--c);
  transition: width 0.3s ease-out, background-color 0.3s;
}
.sd-row[data-status='expired'] .sd-bar {
  min-width: 0;
}
.sd-notch {
  position: absolute;
  top: -4px;
  bottom: -4px;
  width: 2px;
  margin-left: -1px;
  border-radius: 1px;
  background: var(--ink);
}
.sd-notch-minor {
  top: -2px;
  bottom: -2px;
  background: color-mix(in oklab, var(--ink) 38%, #fff);
}
.sd-track-none {
  background: none;
  height: auto;
}
.sd-track-none .sd-zone,
.sd-track-none .sd-bar {
  display: none;
}
.sd-track-note {
  font-size: 12px;
  color: var(--mute);
}
.sd-left {
  text-align: right;
  font-size: 13px;
  font-weight: 600;
  color: var(--ct);
  white-space: nowrap;
  transition: color 0.3s;
}
.sd-notify {
  grid-column: 4 / -1;
  font-family: var(--mono);
  font-size: 11px;
  color: var(--mute);
}
.sd-row[data-status='unknown'] .sd-notify {
  display: none;
}
.sd-legend {
  padding: 12px 18px 14px;
  border-top: 1px solid var(--line);
  font-size: 12.5px;
  color: var(--mute);
}
.sd-notch-key {
  position: static;
  display: inline-block;
  vertical-align: -3px;
  height: 15px;
  margin: 0 8px 0 0;
}

.sd-slack {
  display: flex;
  flex-direction: column;
  align-self: stretch;
  overflow: hidden;
}
.sd-slack-head {
  display: flex;
  align-items: baseline;
  gap: 4px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--line);
  font-weight: 700;
  font-size: 15px;
}
.sd-hash {
  color: var(--mute);
  font-weight: 500;
}
.sd-count {
  margin-left: auto;
  font-weight: 400;
  font-size: 12.5px;
  color: var(--mute);
}
.sd-slack-body {
  flex: 1;
  padding: 8px 0;
  min-height: 150px;
}
.sd-slack-empty {
  padding: 14px 16px;
  font-size: 13.5px;
  line-height: 1.55;
  color: var(--mute);
}
.sd-msg {
  display: flex;
  gap: 10px;
  padding: 8px 16px;
}
.sd-avatar {
  flex: none;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 7px;
  background: var(--wash);
  color: var(--mute);
}
.sd-msg-main {
  min-width: 0;
  flex: 1;
}
.sd-msg-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--mute);
}
.sd-msg-meta strong {
  font-size: 14px;
  color: #1d1c1d;
}
.sd-app {
  font-size: 10px;
  font-weight: 600;
  padding: 0 4px;
  border-radius: 3px;
  background: var(--wash);
  border: 1px solid var(--line);
}
.sd-attach {
  margin-top: 4px;
  padding-left: 11px;
  border-left: 4px solid #ffa500;
  border-radius: 2px;
  font-size: 14px;
  line-height: 1.45;
  color: #1d1c1d;
}
.sd-attach-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  overflow-wrap: anywhere;
}
.sd-attach-title svg {
  flex: none;
}
.sd-attach-foot {
  font-size: 12px;
  color: var(--mute);
}
.sd-msg {
  animation: sd-msg-in 0.35s ease-out both;
}
@keyframes sd-msg-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
}

.sd-caption {
  grid-column: 1 / -1;
  max-width: 76ch;
  font-size: 13.5px;
  line-height: 1.6;
  color: var(--mute);
}

.sd-section {
  padding-top: 104px;
}
.sd-section:last-child {
  padding-bottom: 104px;
}
.sd h2 {
  font-size: clamp(1.7rem, 3.2vw, 2.4rem);
  line-height: 1.12;
  letter-spacing: -0.02em;
  font-weight: 700;
  max-width: 20em;
  text-wrap: balance;
}
.sd-intro {
  margin-top: 14px;
  max-width: 64ch;
  font-size: 17px;
  line-height: 1.65;
  color: oklch(0.37 0.013 285.8);
}
.sd h3 {
  font-size: 18px;
  font-weight: 650;
  letter-spacing: -0.01em;
}

.sd-steps {
  list-style: none;
  margin-top: 40px;
  border-top: 1px solid var(--line);
}
.sd-steps > li {
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  gap: 8px 32px;
  padding: 26px 0;
  border-bottom: 1px solid var(--line);
}
.sd-when {
  font-family: var(--mono);
  font-size: 13px;
  line-height: 27px;
  color: var(--blue);
}
.sd-steps p {
  margin-top: 8px;
  max-width: 66ch;
  line-height: 1.65;
  color: oklch(0.37 0.013 285.8);
}
.sd-map {
  margin-top: 14px;
  border-collapse: collapse;
  font-family: var(--mono);
  font-size: 13px;
  width: 100%;
  max-width: 520px;
}
.sd-map th {
  font-family: var(--vp-font-family-base);
  font-weight: 500;
  font-size: 12.5px;
  color: var(--mute);
  text-align: left;
  padding: 0 16px 6px 0;
}
.sd-map td {
  padding: 7px 16px 7px 0;
  border-top: 1px solid var(--line);
}
.sd-map td:last-child {
  color: var(--blue);
}
.sd-code,
.sd-term pre {
  overflow-x: auto;
  font-family: var(--mono);
  font-size: 12.5px;
  line-height: 1.7;
}
.sd-code {
  margin-top: 16px;
  padding: 16px 18px;
  background: var(--wash);
  border: 1px solid var(--line);
  border-radius: var(--r);
}
.sd-code code,
.sd-term code {
  font-size: inherit;
}

.sd-bands {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 10px 28px;
  margin-top: 26px;
  font-size: 14.5px;
}
.sd-bands li {
  display: flex;
  align-items: center;
  gap: 8px;
}
.sd-bands [data-status='healthy'] { --c: var(--success); --ct: var(--success); }
.sd-bands [data-status='warning'] { --c: var(--warning); --ct: var(--warning-ink); }
.sd-bands [data-status='critical'] { --c: var(--critical); --ct: var(--critical); }
.sd-bands [data-status='expired'] { --c: var(--expired); --ct: var(--expired); }
.sd-bands [data-status='unknown'] { --c: var(--mute); --ct: var(--mute); }
.sd-shot {
  margin-top: 32px;
}
.sd-shot img {
  display: block;
  width: 100%;
  height: auto;
  border: 1px solid var(--line);
  border-radius: var(--r-xl);
  box-shadow: 0 1px 0 rgb(17 17 26 / 0.04), 0 30px 60px -40px rgb(11 30 110 / 0.35);
}
.sd-shot figcaption {
  margin-top: 12px;
  font-size: 13.5px;
  color: var(--mute);
}

.sd-install {
  display: grid;
  grid-template-columns: minmax(0, 5fr) minmax(0, 6fr);
  gap: 40px 56px;
  align-items: start;
}
.sd-links {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  margin-top: 22px;
  font-weight: 600;
}
.sd-terms {
  display: grid;
  gap: 14px;
  min-width: 0;
}
.sd-term {
  border-radius: var(--r-xl);
  background: var(--ink);
  color: oklch(0.92 0.004 286.32);
  overflow: hidden;
}
.sd-term-name {
  padding: 9px 18px;
  border-bottom: 1px solid rgb(255 255 255 / 0.1);
  font-family: var(--mono);
  font-size: 12px;
  color: oklch(0.705 0.015 286.067);
}
.sd-term pre {
  margin: 0;
  padding: 14px 18px 16px;
}
.sd-term code {
  display: block;
  padding: 0;
}

.sd-limits {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 56px;
  margin-top: 32px;
  border-top: 1px solid var(--line);
}
.sd-limits > div {
  padding: 22px 0;
  border-bottom: 1px solid var(--line);
}
.sd-limits dt {
  font-weight: 650;
  font-size: 17px;
}
.sd-limits dd {
  margin: 6px 0 0;
  line-height: 1.65;
  color: oklch(0.37 0.013 285.8);
}
.sd-more {
  margin-top: 28px;
  font-size: 16px;
  line-height: 1.65;
}

@media (max-width: 1040px) {
  .sd-demo {
    grid-template-columns: minmax(0, 1fr);
  }
  .sd-slack-body {
    min-height: 0;
  }
}

@media (max-width: 760px) {
  .sd-wrap {
    padding: 0 16px;
  }
  .sd-hero {
    padding: 48px 0 172px;
  }
  .sd-dial {
    width: 420px;
    height: 420px;
    right: -210px;
    top: -120px;
  }
  .sd-section {
    padding-top: 72px;
  }
  .sd-section:last-child {
    padding-bottom: 72px;
  }
  .sd-axis {
    display: none;
  }
  .sd-ledger-head,
  .sd-legend {
    padding-left: 14px;
    padding-right: 14px;
  }
  .sd-row {
    grid-template-columns: minmax(0, 1fr) auto;
    padding: 12px 14px;
    row-gap: 7px;
  }
  .sd-domain { grid-area: 1 / 1; }
  .sd-pill { grid-area: 1 / 2; justify-self: end; }
  .sd-expires { grid-area: 2 / 1; }
  .sd-left { grid-area: 2 / 2; }
  .sd-track { grid-area: 3 / 1 / 4 / 3; margin: 4px 0; }
  .sd-notify { grid-area: 4 / 1 / 5 / 3; }
  .sd-steps > li {
    grid-template-columns: minmax(0, 1fr);
  }
  .sd-install,
  .sd-limits {
    grid-template-columns: minmax(0, 1fr);
  }
}

@media (prefers-reduced-motion: reduce) {
  .sd * {
    animation: none !important;
    transition: none !important;
  }
}
</style>
