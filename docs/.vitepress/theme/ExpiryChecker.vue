<script setup lang="ts">
import { ref } from 'vue'
import { withBase } from 'vitepress'

const BOOTSTRAP = 'https://data.iana.org/rdap/dns.json'

type Result = {
  name: string
  server: string
  url: string
  expires: Date | null
  registered: Date | null
  changed: Date | null
  registrar: string | null
  status: string[]
  nameservers: string[]
}

const input = ref('')
const busy = ref(false)
const error = ref('')
const result = ref<Result | null>(null)

let bootstrap: Map<string, string> | null = null

/** Strips scheme, path, port and a leading www, and turns IDNs into punycode. */
function normalize(raw: string): string | null {
  let s = raw.trim().toLowerCase()
  s = s.replace(/^[a-z][a-z0-9+.-]*:\/\//, '').split(/[/?#]/)[0].replace(/:\d+$/, '').replace(/\.$/, '')
  if (s.startsWith('www.')) s = s.slice(4)
  try {
    s = new URL(`http://${s}`).hostname
  } catch {
    return null
  }
  return /^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(s) ? s : null
}

async function loadBootstrap(): Promise<Map<string, string>> {
  if (bootstrap) return bootstrap
  const res = await fetch(BOOTSTRAP)
  if (!res.ok) throw new Error(`bootstrap ${res.status}`)
  const data = (await res.json()) as { services: [string[], string[]][] }
  const map = new Map<string, string>()
  for (const [tlds, urls] of data.services) {
    const url = urls.find((u) => u.startsWith('https://')) ?? urls[0]
    for (const t of tlds) map.set(t.toLowerCase(), url.endsWith('/') ? url : `${url}/`)
  }
  bootstrap = map
  return map
}

/** RFC 9224: the longest matching label suffix wins. */
function findServer(map: Map<string, string>, name: string): string | null {
  const labels = name.split('.')
  for (let i = 0; i < labels.length; i++) {
    const hit = map.get(labels.slice(i).join('.'))
    if (hit) return hit
  }
  return null
}

function eventDate(events: any[] | undefined, action: string): Date | null {
  const e = events?.find((x) => x.eventAction === action)
  return e?.eventDate ? new Date(e.eventDate) : null
}

function registrarName(entities: any[] | undefined): string | null {
  const reg = entities?.find((e) => e.roles?.includes('registrar'))
  const fn = reg?.vcardArray?.[1]?.find((p: any[]) => p[0] === 'fn')
  return fn?.[3] || null
}

async function check(value?: string) {
  if (value) input.value = value
  error.value = ''
  result.value = null
  const name = normalize(input.value)
  if (!name) {
    error.value = 'Enter a domain name such as example.com.'
    return
  }
  const tld = name.split('.').pop()!
  busy.value = true
  try {
    let map: Map<string, string>
    try {
      map = await loadBootstrap()
    } catch {
      error.value = "Could not load IANA's RDAP bootstrap file. Check your connection and try again."
      return
    }
    const server = findServer(map, name)
    if (!server) {
      error.value = `.${tld} has no RDAP server in IANA's bootstrap file, so this checker cannot look up ${name}. Use the .${tld} registry's WHOIS service or website, or your registrar's dashboard.`
      return
    }
    const url = `${server}domain/${name}`
    let res: Response
    try {
      res = await fetch(url, { headers: { Accept: 'application/rdap+json' } })
    } catch {
      error.value = `The .${tld} registry's RDAP server (${new URL(server).host}) did not answer this browser request. It may block lookups from web pages, limit how often you can query it, or be down. Try again later, or run curl -sL ${url} in a terminal.`
      return
    }
    if (res.status === 404) {
      error.value = `${new URL(server).host} has no registration for ${name}. The name may be unregistered or already deleted. If you entered a subdomain, enter the registered domain instead.`
      return
    }
    if (res.status === 429 || res.status === 403) {
      error.value = `The .${tld} registry is limiting lookups right now (HTTP ${res.status}). Wait a minute and try again.`
      return
    }
    if (!res.ok) {
      error.value = `The .${tld} registry's RDAP server answered HTTP ${res.status}. Try again later.`
      return
    }
    const data = await res.json()
    result.value = {
      name: (data.ldhName || name).toLowerCase(),
      server: new URL(server).host,
      url,
      expires: eventDate(data.events, 'expiration'),
      registered: eventDate(data.events, 'registration'),
      changed: eventDate(data.events, 'last changed'),
      registrar: registrarName(data.entities),
      status: data.status ?? [],
      nameservers: (data.nameservers ?? []).map((n: any) => String(n.ldhName).toLowerCase()),
    }
  } catch {
    error.value = 'The registry sent an answer this checker could not read. Try again later.'
  } finally {
    busy.value = false
  }
}

const fmt = new Intl.DateTimeFormat('en-GB', { dateStyle: 'medium', timeZone: 'UTC' })
const show = (d: Date | null) => (d ? fmt.format(d) : 'not published')

function daysLeft(d: Date): number {
  return Math.floor((d.getTime() - Date.now()) / 86_400_000)
}

function tone(d: Date | null): string {
  if (!d) return 'unknown'
  const n = daysLeft(d)
  return n < 0 ? 'expired' : n <= 30 ? 'soon' : 'ok'
}

const LIFECYCLE = ['auto renew period', 'redemption period', 'pending delete', 'pending restore', 'pending renew']
</script>

<template>
  <div class="xc">
    <form class="xc-form" @submit.prevent="check()">
      <label for="xc-domain" class="xc-label">Domain name</label>
      <div class="xc-row">
        <input
          id="xc-domain"
          v-model="input"
          class="xc-input"
          type="text"
          inputmode="url"
          autocomplete="off"
          autocapitalize="off"
          spellcheck="false"
          placeholder="example.com"
        />
        <button class="xc-btn" type="submit" :disabled="busy">{{ busy ? 'Checking…' : 'Check expiry' }}</button>
      </div>
      <p class="xc-try">
        Try
        <button type="button" class="xc-link" :disabled="busy" @click="check('example.com')">example.com</button>,
        <button type="button" class="xc-link" :disabled="busy" @click="check('wikipedia.org')">wikipedia.org</button> or
        <button type="button" class="xc-link" :disabled="busy" @click="check('php.net')">php.net</button>
      </p>
    </form>

    <div class="xc-out" aria-live="polite">
      <p v-if="error" class="xc-error" role="alert">{{ error }}</p>

      <div v-if="result" class="xc-card" :data-tone="tone(result.expires)">
        <div class="xc-head">
          <span class="xc-name">{{ result.name }}</span>
          <span v-if="result.expires" class="xc-days">
            <template v-if="daysLeft(result.expires) >= 0">{{ daysLeft(result.expires) }} days left</template>
            <template v-else>expired {{ -daysLeft(result.expires) }} days ago</template>
          </span>
          <span v-else class="xc-days">no expiry date</span>
        </div>
        <dl class="xc-grid">
          <div><dt>Expires</dt><dd>{{ show(result.expires) }}</dd></div>
          <div><dt>Registered</dt><dd>{{ show(result.registered) }}</dd></div>
          <div><dt>Last changed</dt><dd>{{ show(result.changed) }}</dd></div>
          <div><dt>Registrar</dt><dd>{{ result.registrar ?? 'not published' }}</dd></div>
          <div class="xc-wide">
            <dt>Status</dt>
            <dd>
              <span v-for="s in result.status" :key="s" class="xc-chip" :class="{ 'xc-chip-warn': LIFECYCLE.includes(s) }">{{ s }}</span>
              <span v-if="!result.status.length">none listed</span>
            </dd>
          </div>
          <div class="xc-wide"><dt>Nameservers</dt><dd>{{ result.nameservers.join(', ') || 'none listed' }}</dd></div>
        </dl>
        <p v-if="!result.expires" class="xc-note">
          This registry answered but does not publish an expiry date over RDAP. Ask your registrar for the date.
        </p>
        <p v-if="result.status.some((s) => LIFECYCLE.includes(s))" class="xc-note">
          A highlighted status means the domain is in its renewal or deletion cycle. See
          <a :href="withBase('/blog/what-happens-to-expired-domains')">what happens to expired domains</a>.
        </p>
        <p class="xc-src">
          Answered by {{ result.server }} ·
          <a :href="result.url" target="_blank" rel="noopener">raw RDAP JSON</a>
        </p>
        <p class="xc-cta">
          Want a Slack alert before it expires?
          <a :href="withBase('/guide/getting-started')">Self-host Supadomain</a> and add {{ result.name }}.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.xc {
  margin: 24px 0 8px;
  padding: 20px;
  border: 1px solid var(--sd-line);
  border-radius: var(--sd-radius);
  background: var(--sd-sidebar);
}
.xc-label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--sd-mute);
  margin-bottom: 6px;
}
.xc-row {
  display: flex;
  gap: 8px;
}
.xc-input {
  flex: 1;
  min-width: 0;
  height: 44px;
  padding: 0 14px;
  border: 1px solid var(--sd-line);
  border-radius: calc(var(--sd-radius) - 2px);
  background: #fff;
  font: inherit;
  font-size: 16px;
  color: var(--sd-ink);
}
.xc-input:focus {
  border-color: var(--sd-blue);
  outline: none;
  box-shadow: 0 0 0 3px rgb(20 71 230 / 0.15);
}
.xc-btn {
  height: 44px;
  padding: 0 18px;
  border-radius: calc(var(--sd-radius) - 2px);
  background: var(--sd-blue);
  color: #fff;
  font-weight: 600;
  white-space: nowrap;
}
.xc-btn:hover:not(:disabled) {
  background: var(--sd-blue-deep);
}
.xc-btn:disabled,
.xc-link:disabled {
  opacity: 0.6;
  cursor: progress;
}
.xc-try {
  margin: 10px 0 0 !important;
  font-size: 14px;
  color: var(--sd-mute);
}
.xc-link {
  color: var(--sd-blue);
  font-weight: 500;
  text-decoration: underline;
  text-decoration-color: rgb(20 71 230 / 0.35);
}
.xc-out:empty {
  display: none;
}
.xc-error {
  margin: 16px 0 0 !important;
  padding: 12px 14px;
  border-radius: calc(var(--sd-radius) - 2px);
  border: 1px solid oklch(0.769 0.185 78.17 / 0.45);
  background: oklch(0.769 0.185 78.17 / 0.1);
  overflow-wrap: anywhere;
}
.xc-card {
  margin-top: 16px;
  padding: 16px;
  border: 1px solid var(--sd-line);
  border-left: 4px solid var(--sd-blue);
  border-radius: calc(var(--sd-radius) - 2px);
  background: #fff;
}
.xc-card[data-tone='soon'] {
  border-left-color: oklch(0.769 0.185 78.17);
}
.xc-card[data-tone='expired'] {
  border-left-color: oklch(0.577 0.245 27.325);
}
.xc-card[data-tone='unknown'] {
  border-left-color: var(--sd-mute);
}
.xc-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 4px 16px;
}
.xc-name {
  font-size: 18px;
  font-weight: 650;
  overflow-wrap: anywhere;
}
.xc-days {
  font-family: var(--vp-font-family-mono);
  font-weight: 500;
}
.xc-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px 20px;
  margin: 14px 0 0;
}
.xc-grid dt {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--sd-mute);
}
.xc-grid dd {
  margin: 2px 0 0;
  overflow-wrap: anywhere;
}
.xc-wide {
  grid-column: 1 / -1;
}
.xc-chip {
  display: inline-block;
  margin: 2px 6px 2px 0;
  padding: 1px 8px;
  border: 1px solid var(--sd-line);
  border-radius: 999px;
  font-size: 13px;
}
.xc-chip-warn {
  border-color: oklch(0.769 0.185 78.17 / 0.6);
  background: oklch(0.769 0.185 78.17 / 0.12);
}
.xc-note,
.xc-src,
.xc-cta {
  margin: 12px 0 0 !important;
  font-size: 14px;
}
.xc-src {
  color: var(--sd-mute);
}
@media (max-width: 480px) {
  .xc {
    padding: 14px;
  }
  .xc-row {
    flex-direction: column;
  }
  .xc-input {
    flex: none;
  }
}
</style>
