import { Cron } from 'croner';
import { sendSlackNotification } from '../utils/notifications/slack';
import { Domain } from '../models/domain.schema';
import { logActivity } from '../utils/activity';

export default defineNitroPlugin(() => {
    // Runs every hour
    new Cron('0 * * * *', async () => {
        const domains = await Domain.find({});
        const now = new Date();

        for (const domain of domains) {
            if (!domain.expireTime || !domain.notifications) continue;

            const diffMs = new Date(domain.expireTime as Date).getTime() - now.getTime();
            const diffDays = diffMs / (1000 * 60 * 60 * 24);

            const thresholds = (domain.notifyDaysBefore ?? [30, 7, 1]).slice().sort((a, b) => b - a);
            const triggeredThreshold = thresholds.find(t => diffDays <= t);

            if (triggeredThreshold !== undefined && domain.lastNotifiedDays !== triggeredThreshold) {
                const daysLeft = Math.floor(diffDays);
                const label = daysLeft < 0
                    ? `${Math.abs(daysLeft)} days since expiration`
                    : `${daysLeft} days until expiration`;

                await sendSlackNotification(domain.url, label);

                const kind = daysLeft < 0 ? 'expired' : 'alert';
                const message = daysLeft < 0
                    ? `${domain.url} expired ${Math.abs(daysLeft)}d ago — alert sent`
                    : `${domain.url} expires in ${daysLeft}d — alert sent via Slack`;

                await logActivity(domain.url, kind, message);

                domain.lastNotifiedDays = triggeredThreshold;
                await domain.save();
            }
        }
    });
});
