import authValidation from "~~/server/auth-check";
import { Notifications } from "../../../models/notifications";

export default defineEventHandler(async (event) => {
    authValidation(event);

    try {
        const options = await readBody(event);

        if (!options.webhookUrl) return { success: false, message: 'Webhook URL is required' };

        await Notifications.findOneAndUpdate(
            { service: 'slack' },
            { credentials: options.webhookUrl },
            { upsert: true, new: true }
        ).exec();

        return { success: true, message: 'Slack notification settings saved successfully' };
    }
    catch (error) {
        console.error('Error saving Slack notification settings:', error);
        return { success: false, message: 'Failed to save Slack notification settings' };
    }
});

