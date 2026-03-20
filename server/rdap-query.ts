import logger from "./logger";

import type { RdapDomainResponse, RdapEvent, RdapNameserver } from "./rdap-response.type";

type RdapQueryResult =
    | { success: true; expirationDate: string | null; registrationDate: string | null; lastUpdate: string | null; lastUpdatedInRdap: string | null; nameservers: string[] }
    | { success: false; message: string };

const executeRdapQuery = async (domain: string): Promise<RdapQueryResult> => {
    try {
        const response = await $fetch<RdapDomainResponse>(`https://rdap.org/domain/${domain}`);

        /**
         * Extract relevant data from the RDAP response. 
         */
        const rdapData = {
            success: true as const,
            expirationDate: response?.events?.find((event: RdapEvent) => event.eventAction === 'expiration')?.eventDate || null,
            registrationDate: response?.events?.find((event: RdapEvent) => event.eventAction === 'registration')?.eventDate || null,
            lastUpdate: response?.events?.find((event: RdapEvent) => event.eventAction === 'last changed')?.eventDate || null,
            lastUpdatedInRdap: response?.events?.find((event: RdapEvent) => event.eventAction === 'last update of RDAP database')?.eventDate || null,
            nameservers: response?.nameservers?.map((ns: RdapNameserver) => ns.ldhName) || [],
        }

        return rdapData;
    }
    catch (error) {
        logger.error('Error executing RDAP query:', error);
        return { success: false, message: 'Failed to execute RDAP query' };
    }

};

export default executeRdapQuery;