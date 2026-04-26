import checkAuth from "~~/server/auth-check";
import logger from "~~/server/logger";
import { Domain } from "~~/server/models/domain.schema";

export default defineEventHandler(async (event) => {
    checkAuth(event);
    const url = getQuery(event).url as string;
    if (!url) return { success: false, message: "URL is required" };

    try {
        const domain = await Domain.findOne({ url }).exec();
        if (!domain) return { success: false, message: "Domain not found" };

        return {
            success: true,
            domain: {
                id: domain._id.toString(),
                url: domain.url,
                lastChecked: domain.lastChecked ?? null,
                expireTime: domain.expireTime ?? null,
                registrationDate: domain.registrationDate ?? null,
                lastUpdate: domain.lastUpdate ?? null,
                lastUpdatedInRdap: domain.lastUpdatedInRdap ?? null,
                notifications: domain.notifications ?? false,
                notifyDaysBefore: domain.notifyDaysBefore ?? [30, 7, 1],
                nameservers: domain.nameservers ?? [],
            },
        };
    } catch (error) {
        logger.error("Error fetching domain detail:", error);
        return { success: false, message: "Failed to fetch domain" };
    }
});
