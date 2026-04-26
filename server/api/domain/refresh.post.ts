import checkAuth from "~~/server/auth-check";
import logger from "~~/server/logger";
import { Domain } from "~~/server/models/domain.schema";
import executeRdapQuery from "~~/server/rdap-query";
import { logActivity } from "~~/server/utils/activity";

export default defineEventHandler(async (event) => {
    checkAuth(event);

    const { url } = await readBody(event);

    if (!url) return { success: false, message: "Domain URL is required" };

    try {
        const domain = await Domain.findOne({ url });
        if (!domain) return { success: false, message: "Domain not found" };

        const rdapQuery = await executeRdapQuery(url);
        if (!rdapQuery.success) return { success: false, message: "Failed to retrieve RDAP data" };

        domain.lastChecked = new Date();
        domain.expireTime = rdapQuery.expirationDate ? new Date(rdapQuery.expirationDate) : undefined;
        domain.registrationDate = rdapQuery.registrationDate ? new Date(rdapQuery.registrationDate) : undefined;
        domain.lastUpdate = rdapQuery.lastUpdate ? new Date(rdapQuery.lastUpdate) : undefined;
        domain.lastUpdatedInRdap = rdapQuery.lastUpdatedInRdap ? new Date(rdapQuery.lastUpdatedInRdap) : undefined;
        domain.nameservers = rdapQuery.nameservers;
        domain.lastNotifiedDays = null;

        await domain.save();
        await logActivity(url, 'refresh', `${url} refreshed from RDAP`);

        return { success: true, message: "Domain refreshed successfully" };
    } catch (error) {
        logger.error("Error refreshing domain:", error);
        return { success: false, message: "Failed to refresh domain" };
    }
});
