import authValidation from "~~/server/auth-check";
import { sendSlackNotification } from "~~/server/utils/notifications/slack";
import logger from "~~/server/logger";

export default defineEventHandler(async (event) => {
    authValidation(event);

    try {
        await sendSlackNotification('example.com', 'This is a test notification from Supadomain. If you received this, your Slack notifications are set up correctly!');
        return { success: true, message: 'Test Slack notification sent successfully' };
    }
    catch (error) {
        logger.error('Error sending test Slack notification:', error);
        return { success: false, message: 'Failed to send test Slack notification' };
    }
});