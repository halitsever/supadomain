import { version } from "../package.json";
import logger from "./logger";

import type { RdapDomainResponse } from "./rdap-response.type";

/** rdap.org answers 403 to Node's default `node` User-Agent and to requests without one. */
export const RDAP_USER_AGENT = `Supadomain/${version} (+https://github.com/halitsever/supadomain)`;

export type RdapData = {
  success: true;
  expirationDate: string | null;
  registrationDate: string | null;
  lastUpdate: string | null;
  lastUpdatedInRdap: string | null;
  nameservers: string[];
};

type RdapFailure = { success: false; notFound: boolean; message: string };

type RdapQueryResult = RdapData | RdapFailure;

type FetchFailure = { statusCode?: number; response?: { headers?: Headers } };

/** Retry-After is either a number of seconds or an HTTP date. */
function retryAfterSeconds(header: string | null | undefined, now = Date.now()): number | null {
  if (!header) return null;
  if (/^\d+$/.test(header.trim())) return Number(header.trim());
  const date = Date.parse(header);
  return Number.isNaN(date) ? null : Math.max(0, Math.ceil((date - now) / 1000));
}

function failureFor(error: FetchFailure): RdapFailure {
  switch (error?.statusCode) {
    // rdap.org answers 404 for unregistered names and for TLDs without an RDAP server.
    case 404:
      return { success: false, notFound: true, message: "No RDAP record found" };
    case 403:
      return { success: false, notFound: false, message: "The RDAP server refused the lookup (HTTP 403). Try again later." };
    case 429: {
      const seconds = retryAfterSeconds(error.response?.headers?.get("retry-after"));
      const wait = seconds === null ? "in a few minutes" : `in ${seconds} second${seconds === 1 ? "" : "s"}`;
      return { success: false, notFound: false, message: `The RDAP server is rate limiting lookups (HTTP 429). Try again ${wait}.` };
    }
    default:
      return { success: false, notFound: false, message: "The RDAP lookup failed. Try again in a moment." };
  }
}

const executeRdapQuery = async (domain: string): Promise<RdapQueryResult> => {
  try {
    // rdap.org answers with a 302 to the registry's own RDAP server.
    const response = await $fetch<RdapDomainResponse>(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
      timeout: 15000,
      redirect: "follow",
      headers: { "User-Agent": RDAP_USER_AGENT, Accept: "application/rdap+json, application/json" },
    });

    const eventDate = (action: string) => response?.events?.find((event) => event.eventAction === action)?.eventDate || null;

    return {
      success: true,
      expirationDate: eventDate("expiration"),
      registrationDate: eventDate("registration"),
      lastUpdate: eventDate("last changed"),
      lastUpdatedInRdap: eventDate("last update of RDAP database"),
      nameservers: response?.nameservers?.map((ns) => ns.ldhName).filter(Boolean) || [],
    };
  } catch (error) {
    const failure = failureFor(error as FetchFailure);
    if (!failure.notFound) logger.error(`RDAP query for ${domain} failed: ${failure.message}`, error);
    return failure;
  }
};

export default executeRdapQuery;
