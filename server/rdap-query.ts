import logger from "./logger";

const executeRdapQuery = async (domain: string) => {
    try {
        const response = await $fetch(`https://rdap.org/domain/${domain}`);

        /**
         * Extract relevant data from the RDAP response. 
         */
        const rdapData = {
            success: true,
            expirationDate: response?.events?.find((event: any) => event.eventAction === 'expiration')?.eventDate || null,
            registrationDate: response?.events?.find((event: any) => event.eventAction === 'registration')?.eventDate || null,
            lastUpdate: response?.events?.find((event: any) => event.eventAction === 'last changed')?.eventDate || null,
            lastUpdatedInRdap: response?.events?.find((event: any) => event.eventAction === 'last update of RDAP database')?.eventDate || null,
            nameservers: response?.nameservers?.map((ns: any) => ns.ldhName) || [],
        }

        return rdapData;
    }
    catch (error) {
        logger.error('Error executing RDAP query:', error);
        return { success: false, message: 'Failed to execute RDAP query' };
    }

};

export default executeRdapQuery;