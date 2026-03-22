import logger from '~~/server/logger'
import { Notifications } from '../../models/notifications'

export async function sendSlackNotification(domainUrl: string, message: string) {
    try {
        const notificationSettings = await Notifications.findOne({ service: 'slack' }).exec()

        if (!notificationSettings?.credentials) return

        const webhookUrl = notificationSettings.credentials as string

        const payload = {
            attachments: [
                {
                    color: '#FFA500',
                    title: `⚠️ ${domainUrl}`,
                    text: message,
                    footer: 'Supadomain',
                    ts: Math.floor(Date.now() / 1000)
                }
            ]
        }

        await $fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
    }
    catch (error) {
        logger.error('Error sending Slack notification: ', error);
        return { success: false, message: 'Failed to send Slack notification' };
    }
}
