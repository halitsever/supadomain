import checkAuth from "~~/server/auth-check";
import { sendSlackNotification } from "~~/server/utils/notifications/slack";
import logger from "~~/server/logger";

export default defineEventHandler(async (event) => {
    checkAuth(event);

    try {
        const result = await sendSlackNotification('example.com', 'This is a test notification from Supadomain. If you received this, your Slack notifications are set up correctly!');
        if (result === 'not-configured') return { success: false, message: 'Save a webhook URL first' };
        return { success: true, message: 'Test Slack notification sent successfully' };
    }
    catch (error) {
        logger.error('Error sending test Slack notification:', error);
        return { success: false, message: 'Slack did not accept the request. Check the webhook URL.' };
    }
});
