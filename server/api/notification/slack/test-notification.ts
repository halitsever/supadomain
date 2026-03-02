import { Notifications } from "../../../models/notifications";
import logger from "~~/server/logger";

export default defineEventHandler(async (event) => {

    try {
        const notificationSettings = await Notifications.findOne({ service: 'slack' }).exec();

        if (!notificationSettings || !notificationSettings.credentials) {
            return { success: false, message: 'Slack webhook URL not configured' };
        }

        const webhookUrl = notificationSettings.credentials as string;


        const payload = {
            text: "This is a test notification from TrackMyDomain. If you received this, your Slack notifications are set up correctly!"
        };

        await $fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        return { success: true, message: 'Test Slack notification sent successfully' };
    }
    catch (error) {
        logger.error('Error sending test Slack notification:', error);
        return { success: false, message: 'Failed to send test Slack notification' };
    }

});