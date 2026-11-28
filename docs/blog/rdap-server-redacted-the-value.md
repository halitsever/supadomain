---
title: "\"The RDAP Server Redacted the Value\": What It Means"
titleTemplate: false
description: "Why RDAP lookups hide registrant names, emails and phone numbers, how RFC 9537 marks redacted fields, and which data stays visible, including expiry dates."
headline: "\"The RDAP server redacted the value\": what it means"
date: "2026-11-28"
keyword: "the rdap server redacted the value"
faq: [{"q": "Is a redacted RDAP field an error?", "a": "No. The server hid the value on purpose, usually personal contact data, and the redacted array in the response says which field and how."}, {"q": "Does RDAP redact the expiry date?", "a": "No. Registration, expiration and last-changed dates, status codes, the registrar and nameservers were public in every response we checked."}]
---

# "The RDAP server redacted the value": what it means

<p class="post-meta">By <a href="https://halit.org">Halit Sever</a> · <time datetime="2026-11-28">28 November 2026</time></p>

<p class="lead">When a lookup tool says the RDAP server redacted a value, the server left that field out or blanked it on purpose. It is not an error and not a sign that the domain is broken. Contact details are redacted for privacy; the domain's dates, status and nameservers stay public.</p>

## Why contact data is redacted

Domain registration data used to be published in full through WHOIS. Privacy law, the EU's GDPR in particular, ended that for personal data. For generic TLDs, ICANN's [Registration Data Policy](https://www.icann.org/en/contracted-parties/consensus-policies/registration-data-policy), in effect since 21 August 2025, sets which data elements are collected, published or redacted. Registrars and registries now leave the registrant's personal details out of public answers, and RDAP, the protocol that replaced WHOIS, has a standard way to say so.

## How RDAP marks a redacted field

[RFC 9537](https://www.rfc-editor.org/rfc/rfc9537.html), published in March 2024, adds a `redacted` array to RDAP responses. Each entry names the field and says how it was hidden. A response that uses it also lists `"redacted"` in its `rdapConformance` array.

There are four methods:

| Method | What the server did |
| --- | --- |
| `removal` | Removed the field entirely. This is the default. |
| `emptyValue` | Kept the field but set it to an empty value, for example an empty name. |
| `partialValue` | Removed part of the value, for example part of an address. |
| `replacementValue` | Swapped the value for another one, such as a contact form link instead of an email address. |

This is part of the real answer MarkMonitor's RDAP server gave for `github.com` on 28 November 2026:

```json
"redacted": [
  { "name": { "type": "Registrant Name" }, "method": "emptyValue",
    "postPath": "$.entities[0].vcardArray[1][?(@[0]=='fn')][3]" },
  { "name": { "type": "Registrant Phone" }, "method": "removal",
    "prePath": "$.entities[0].vcardArray[1][?(@[0]=='tel' && @[1].type=='voice')]" },
  { "name": { "type": "Registrant Email" }, "method": "replacementValue",
    "prePath": "$.entities[0].vcardArray[1][?(@[0]=='email')]",
    "replacementPath": "$.entities[0].vcardArray[1][?(@[0]=='contact-uri')]" }
]
```

The registrant's name is there but empty, the phone number is gone, and the email address was replaced by a `contact-uri` pointing to a web form at the registrar. The paths are JSONPath expressions, so a client can find the field that was touched. Lookup tools that read this array report the field as redacted, in wording like "the RDAP server redacted the value", instead of showing an unexplained blank.

## What stays visible

In the same answer, and in the registry responses we checked while building this site's [expiry checker](/domain-expiry-checker/#which-tlds-work), these were present and not redacted:

- the domain name and its status codes, such as `client transfer prohibited`
- the registrar's name
- the registration, expiration and last-changed dates
- the nameservers

That is why an expiry monitor can work on RDAP alone. [Supadomain](/) reads only the `events` array and the nameservers, never contact data, as the [RDAP vs WHOIS guide](/guide/rdap-vs-whois#how-supadomain-reads-the-expiry-date) shows.

## Seeing which fields were redacted

List the redacted fields of any response with `jq`:

```bash
curl -sL https://rdap.org/domain/wikipedia.org | jq -c '.redacted[]?.name'
```

For `wikipedia.org` the .org registry printed `{"type":"Registry Domain ID"}` on 28 November 2026. rdap.org answers from the registry, and the .com registry holds no contact data at all, so a .com lookup prints nothing. To see contact redactions for a .com, follow the registrar link in the response's `links` array (`rel: related`) and query that URL, as we did for `github.com` above.

## How to reach a domain owner anyway

Use the contact channel the registrar publishes. With `replacementValue` redaction that is often a web form or an anonymized email in the RDAP answer itself, like the `contact-uri` above. For abuse, every registrar lists an abuse contact, which RDAP returns under the registrar entity with the role `abuse`. Requests for the hidden data itself go to the registrar, which decides under the Registration Data Policy and local law. For gTLDs, ICANN's Registration Data Request Service passes such requests on; [ICANN Lookup](/blog/icann-lookup) explains where it fits.

## FAQ

### Is a redacted RDAP field an error?

No. The server hid the value on purpose, usually personal contact data, and the redacted array in the response says which field and how.

### Does RDAP redact the expiry date?

No. Registration, expiration and last-changed dates, status codes, the registrar and nameservers were public in every response we checked.

## Related posts

- [Domain expiry scam emails: check the real date first](/blog/domain-expiry-scam-email)
- ["No registry RDAP server was identified": what it means](/blog/no-registry-rdap-server)
- [How to check a domain expiry date without WHOIS](/blog/check-domain-expiry-date)
- [ICANN Lookup: what the registration data tool shows](/blog/icann-lookup)
- [All posts](/blog/)
