
import { Domain } from '../models/domain.schema'

export default defineNitroPlugin(() => {
    setInterval(async () => {
        const domains = await Domain.find({})
        const now = new Date()

        for (const domain of domains) {
            if (!domain.expireTime) continue;

            const expireDate = new Date(domain.expireTime as Date)
            const diffMs = expireDate.getTime() - now.getTime()
            const diffDays = diffMs / (1000 * 60 * 60 * 24)

            if (domain?.notifications && diffDays <= 1) {
                const label = diffDays < 0
                    ? `${Math.abs(diffDays).toFixed(0)} expired ago`
                    : `${diffDays.toFixed(0)} days until expiration`
                await sendSlackNotification(domain.url, label)

            }


        }
    }, 3600000);
});