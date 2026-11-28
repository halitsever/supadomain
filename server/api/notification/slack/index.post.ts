import checkAuth from "~~/server/auth-check";
import { Notifications } from "../../../models/notifications";
import logger from "~~/server/logger";

export default defineEventHandler(async (event) => {
    checkAuth(event);

    try {
        const { webhookUrl } = (await readBody(event)) ?? {};

        // An empty value removes the webhook.
        if (!webhookUrl) {
            await Notifications.deleteOne({ service: 'slack' }).exec();
            return { success: true, message: 'Slack webhook removed' };
        }

        if (!isWebhookUrl(webhookUrl)) return { success: false, message: 'Webhook URL must be a valid https:// URL' };

        await Notifications.findOneAndUpdate(
            { service: 'slack' },
            { credentials: webhookUrl.trim() },
            { upsert: true }
        ).exec();

        return { success: true, message: 'Slack notification settings saved successfully' };
    }
    catch (error) {
        logger.error('Error saving Slack notification settings:', error);
        return { success: false, message: 'Failed to save Slack notification settings' };
    }
});
