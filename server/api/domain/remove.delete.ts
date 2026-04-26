import checkAuth from "~~/server/auth-check";
import logger from "~~/server/logger";
import { Domain } from "~~/server/models/domain.schema";
import { logActivity } from "~~/server/utils/activity";

export default defineEventHandler(async (event) => {
    checkAuth(event);

    const { url } = await readBody(event);
    try {
        const result = await Domain.findOneAndDelete({ url }).exec();
        if (result) {
            await logActivity(url, 'removed', `${url} removed from portfolio`);
            return { success: true, message: 'Domain removed successfully' };
        } else {
            return { success: false, message: 'Domain not found' };
        }
    }
    catch (error) {
        logger.error('Error removing domain:', error);
        return { success: false, message: 'Failed to remove domain' };
    }
});