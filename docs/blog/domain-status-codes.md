---
title: "Domain Status Codes: clientTransferProhibited and More"
titleTemplate: false
description: "What clientTransferProhibited, serverHold, redemptionPeriod and other domain status codes mean, who sets them, how RDAP shows them and when to act."
headline: "Domain status codes: clientTransferProhibited and the rest, explained"
date: "2026-11-28"
keyword: "domain status clienttransferprohibited"
faq: [{"q": "What does domain status clientTransferProhibited mean?", "a": "Your registrar has told the registry to refuse transfers of the domain to another registrar. It is a normal lock against hijacking. Remove it in your registrar account when you want to transfer."}, {"q": "Is clientTransferProhibited bad?", "a": "No. ICANN recommends asking your registrar for clientTransferProhibited, clientDeleteProhibited and clientUpdateProhibited as protection against unauthorized changes."}, {"q": "What is the difference between client and server status codes?", "a": "Client codes are set by the registrar and you can usually change them in your account. Server codes are set by the registry, often for disputes or a registry lock service, and only the registry can lift them."}]
---

# Domain status codes: clientTransferProhibited and the rest, explained

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">Every domain carries at least one status code. Most are locks your registrar set on purpose, a few are stages of renewal or deletion, and a handful mean something is wrong. This post lists them with ICANN's own explanations and shows how they look in an RDAP lookup.</p>

## Where the codes come from

Registries and registrars talk to each other over EPP, the Extensible Provisioning Protocol. EPP defines the domain statuses ([RFC 5731](https://www.rfc-editor.org/rfc/rfc5731)), and the registry grace period extension adds the renewal and deletion ones ([RFC 3915](https://www.rfc-editor.org/rfc/rfc3915)). ICANN's page [EPP Status Codes: What Do They Mean, and Why Should I Know?](https://www.icann.org/resources/pages/epp-status-codes-2014-06-16-en) explains each one for domain holders.

RDAP shows the same statuses in a different spelling. [RFC 8056](https://www.rfc-editor.org/rfc/rfc8056) maps them: `clientTransferProhibited` in EPP and WHOIS becomes `client transfer prohibited` in RDAP, `ok` becomes `active`, and so on. Look up any domain to see its list:

```bash
curl -sL https://rdap.org/domain/google.com | jq -r '.status[]'
```

On 28 November 2026 that printed:

```text
client delete prohibited
client transfer prohibited
client update prohibited
server delete prohibited
server transfer prohibited
server update prohibited
```

The [domain expiry checker](/domain-expiry-checker/) shows the same list as chips and highlights the renewal and deletion stages.

## Client codes: set by your registrar

| EPP code | RDAP | What it means |
| --- | --- | --- |
| clientTransferProhibited | client transfer prohibited | The registry refuses transfers to another registrar. |
| clientDeleteProhibited | client delete prohibited | The registry refuses to delete the domain. |
| clientUpdateProhibited | client update prohibited | The registry refuses changes, such as new nameservers or contacts. |
| clientRenewProhibited | client renew prohibited | The registry refuses renewals. Uncommon; ICANN lists disputes and pending deletion as typical causes. |
| clientHold | client hold | The domain is taken out of DNS and does not resolve. ICANN names disputes, non-payment and pending deletion. |

The first three are the usual "domain lock". ICANN's advice is to ask for them: they help prevent unauthorized transfers, deletions and updates. Seeing `client transfer prohibited` on your own domain is a good sign, not an error.

ICANN's [Transfer Policy](https://www.icann.org/resources/pages/transfer-policy-2016-06-01-en) limits how registrars use the transfer lock. A registrar may set it at registration or at your request, if its registration agreement says so, and must remove it within five calendar days of your request when it gives you no tool to do it yourself. It cannot refuse to remove it only because you are in a payment dispute with it.

## Server codes: set by the registry

| EPP code | RDAP | What it means |
| --- | --- | --- |
| serverTransferProhibited | server transfer prohibited | The registry blocks transfers. |
| serverDeleteProhibited | server delete prohibited | The registry blocks deletion. |
| serverUpdateProhibited | server update prohibited | The registry blocks changes. |
| serverRenewProhibited | server renew prohibited | The registry blocks renewal. |
| serverHold | server hold | The registry keeps the domain out of DNS. |

ICANN calls these uncommon and ties them to legal disputes, a redemption period, or your own request through a **registry lock** service that some registries sell through registrars. A registry lock is stronger than a registrar lock because lifting it goes through the registry, which takes longer. That is why large sites such as google.com show both sets.

If a server code appears on a domain you did not ask to lock, contact your registrar and ask why.

## Renewal and deletion stages

| EPP code | RDAP | What it means |
| --- | --- | --- |
| ok | active | No pending operations or prohibitions. |
| addPeriod | add period | The first days after registration. Informative. |
| renewPeriod | renew period | The days after an explicit renewal. Informative. |
| autoRenewPeriod | auto renew period | The registry renewed the name itself at expiry, and the registrar can still delete it for a credit. |
| transferPeriod | transfer period | The days after a transfer to a new registrar. Informative. |
| redemptionPeriod | redemption period | The registrar asked for deletion. ICANN says the domain stays here for 30 days and can be restored for a fee. |
| pendingRestore | pending restore | A restore was requested; the registrar has to send documentation to the registry. |
| pendingDelete | pending delete | After redemption: the domain is purged after a few days and released. |
| inactive | inactive | No nameservers are set, so it does not resolve. |
| pendingCreate, pendingRenew, pendingTransfer, pendingUpdate | pending create, ... | A request is being processed. If you did not make it, contact your registrar. |

`auto renew period` deserves a warning: a new expiry date can show up there before anyone has paid. [Domain renewal](/blog/domain-renewal) explains this for .com, and [what happens to expired domains](/blog/what-happens-to-expired-domains) follows a name through redemption and pending delete.

## Which codes need action

- **client transfer, delete, update prohibited:** none. Remove the transfer lock only when you move the domain ([EPP code](/blog/epp-code) has the steps).
- **client hold, server hold, inactive:** the domain does not resolve. Check payment, nameservers and email from your registrar.
- **redemption period, pending delete:** renew or restore now, or the name will be released.
- **any pending code you did not request:** contact your registrar at once.

## Watching them from code

[Supadomain](/) stores a domain's expiry date, dates and nameservers from RDAP but not its status list, so status changes do not trigger alerts there; it alerts on days left before expiry. To track statuses too, a cron job with the `curl | jq '.status'` call above and a diff against yesterday's output is enough, and [a free WHOIS API](/blog/whois-api) shows the call in JavaScript.

## FAQ

### What does domain status clientTransferProhibited mean?

Your registrar has told the registry to refuse transfers of the domain to another registrar. It is a normal lock against hijacking. Remove it in your registrar account when you want to transfer.

### Is clientTransferProhibited bad?

No. ICANN recommends asking your registrar for clientTransferProhibited, clientDeleteProhibited and clientUpdateProhibited as protection against unauthorized changes.

### What is the difference between client and server status codes?

Client codes are set by the registrar and you can usually change them in your account. Server codes are set by the registry, often for disputes or a registry lock service, and only the registry can lift them.

## Related posts

- [EPP code: what it is and how to get one](/blog/epp-code)
- [Transferring an expired domain: what ICANN's rules allow](/blog/transfer-expired-domain)
- [ICANN Lookup: what the registration data tool shows](/blog/icann-lookup)
- [All posts](/blog/)
