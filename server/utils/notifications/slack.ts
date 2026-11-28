import { Notifications } from '../../models/notifications'

/** Posts to the saved webhook. Throws when Slack rejects the request. */
export async function sendSlackNotification(domainUrl: string, message: string): Promise<'sent' | 'not-configured'> {
    const notificationSettings = await Notifications.findOne({ service: 'slack' }).exec()
    const webhookUrl = notificationSettings?.credentials

    if (!webhookUrl) return 'not-configured'

    await $fetch(webhookUrl, {
        method: 'POST',
        timeout: 10000,
        body: {
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
    })

    return 'sent'
}
