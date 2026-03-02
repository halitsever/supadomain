import logger from "~~/server/logger";
import type { Domain as DomainType } from "../../types/domain.interface"
import { Domain } from "~~/server/models/domain.schema";
export default defineEventHandler(async (event) => {
    try {
        const domains = await Domain.find().sort({ id: -1 }).exec();
        return domains.map((item) => ({
            id: item._id.toString(),
            url: item.url ?? "",
            lastChecked: item.lastChecked ?? null,
            expireTime: item.expireTime ?? null,
            notifications: item.notifications ?? false,
        })) as DomainType[];
    }
    catch (error) {
        logger.error('Error fetching domains:', error);
        return { success: false, message: 'Failed to fetch domains' };
    }
});