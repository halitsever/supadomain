import checkAuth from "~~/server/auth-check";
import { Notifications } from "../../../models/notifications";
import logger from "~~/server/logger";

export default defineEventHandler(async (event) => {
    checkAuth(event);
    try {
        const settings = await Notifications.findOne({ service: 'slack' }).exec();
        return { success: true, webhookUrl: settings?.credentials ?? null };
    }
    catch (error) {
        logger.error('Error fetching Slack notification settings:', error);
        return { success: false, webhookUrl: null };
    }
});
