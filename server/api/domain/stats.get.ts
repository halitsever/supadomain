import checkAuth from "~~/server/auth-check";
import logger from "~~/server/logger";
import { Domain } from "~~/server/models/domain.schema";
import { Activity } from "~~/server/models/activity.schema";

export default defineEventHandler(async (event) => {
    checkAuth(event);
    try {
        const [domains, recentActivity] = await Promise.all([
            Domain.find({}).exec(),
            Activity.find({}).sort({ createdAt: -1 }).limit(10).exec(),
        ]);

        const now = Date.now();
        let total = domains.length;
        let expired = 0, critical = 0, warning = 0, healthy = 0, unknown = 0;

        for (const d of domains) {
            if (!d.expireTime) { unknown++; continue; }
            const days = (new Date(d.expireTime as Date).getTime() - now) / (1000 * 60 * 60 * 24);
            if (days < 0) expired++;
            else if (days <= 7) critical++;
            else if (days <= 30) warning++;
            else healthy++;
        }

        const soonest = domains
            .filter(d => d.expireTime)
            .sort((a, b) => new Date(a.expireTime as Date).getTime() - new Date(b.expireTime as Date).getTime())
            .slice(0, 5)
            .map(d => ({ url: d.url, expireTime: d.expireTime }));

        const activity = recentActivity.map(a => ({
            domainUrl: a.domainUrl,
            kind: a.kind,
            message: a.message,
            createdAt: a.createdAt,
        }));

        return { success: true, stats: { total, expired, critical, warning, healthy, unknown }, soonest, activity };
    } catch (error) {
        logger.error("Error fetching domain stats:", error);
        return { success: false };
    }
});
