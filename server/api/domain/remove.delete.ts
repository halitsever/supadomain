import authValidation from "~~/server/auth-check";
import logger from "~~/server/logger";
import { Domain } from "~~/server/models/domain.schema";

export default defineEventHandler(async (event) => {
    authValidation(event);

    const { url } = await readBody(event);
    try {
        const result = await Domain.findOneAndDelete({ url }).exec();
        if (result) {
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