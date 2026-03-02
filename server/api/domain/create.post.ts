import logger from "~~/server/logger";
import { Domain } from "~~/server/models/domain.schema";
import executeRdapQuery from "~~/server/rdap-query";

export default defineEventHandler(async (event) => {
    const { url } = await readBody(event);
    try {
        const rdapQuery = await executeRdapQuery(url);

        if (!rdapQuery.success) return { success: false, message: "Failed to retrieve RDAP data" };

        const domain = new Domain({
            url,
            lastChecked: new Date(),
            expireTime: rdapQuery.expirationDate ? new Date(rdapQuery.expirationDate) : null,
            registrationDate: rdapQuery.registrationDate ? new Date(rdapQuery.registrationDate) : null,
            lastUpdate: rdapQuery.lastUpdate ? new Date(rdapQuery.lastUpdate) : null,
            lastUpdatedInRdap: rdapQuery.lastUpdatedInRdap ? new Date(rdapQuery.lastUpdatedInRdap) : null,
            nameservers: rdapQuery.nameservers || [],
            notifications: true,
        });
        await domain.save();
        return { success: true, message: "Domain added successfully" };
    } catch (error) {
        logger.error("Error adding domain:", error);
        return { success: false, message: "Failed to add domain" };
    }
});
