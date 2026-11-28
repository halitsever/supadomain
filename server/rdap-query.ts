import logger from "./logger";

import type { RdapDomainResponse } from "./rdap-response.type";

export type RdapData = {
    success: true;
    expirationDate: string | null;
    registrationDate: string | null;
    lastUpdate: string | null;
    lastUpdatedInRdap: string | null;
    nameservers: string[];
};

type RdapQueryResult = RdapData | { success: false; notFound: boolean; message: string };

const executeRdapQuery = async (domain: string): Promise<RdapQueryResult> => {
    try {
        const response = await $fetch<RdapDomainResponse>(`https://rdap.org/domain/${encodeURIComponent(domain)}`, {
            timeout: 15000,
            // rdap.org answers 403 to requests that carry the default Node user agent.
            headers: { "User-Agent": "Supadomain (+https://github.com/halitsever/supadomain)", Accept: "application/rdap+json, application/json" },
        });

        const eventDate = (action: string) => response?.events?.find((event) => event.eventAction === action)?.eventDate || null;

        return {
            success: true,
            expirationDate: eventDate('expiration'),
            registrationDate: eventDate('registration'),
            lastUpdate: eventDate('last changed'),
            lastUpdatedInRdap: eventDate('last update of RDAP database'),
            nameservers: response?.nameservers?.map((ns) => ns.ldhName).filter(Boolean) || [],
        };
    }
    catch (error) {
        const status = (error as { statusCode?: number })?.statusCode;
        // rdap.org answers 404 for unregistered names and for TLDs without an RDAP server.
        if (status === 404) return { success: false, notFound: true, message: 'No RDAP record found' };

        logger.error(`RDAP query for ${domain} failed:`, error);
        return { success: false, notFound: false, message: 'Failed to execute RDAP query' };
    }
};

export default executeRdapQuery;
