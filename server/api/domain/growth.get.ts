import checkAuth from "~~/server/auth-check";
import logger from "~~/server/logger";
import { Domain } from "~~/server/models/domain.schema";

const DAY_MS = 86400000;
const PERIOD_DAYS: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90 };

export default defineEventHandler(async (event) => {
    checkAuth(event);

    const period = String(getQuery(event).period ?? "30d").toLowerCase();

    try {
        const domains = await Domain.find({}).select("createdAt").lean();
        const created = domains
            .map((d) => (d.createdAt ? new Date(d.createdAt).getTime() : NaN))
            .filter((time) => !Number.isNaN(time));

        // Days are counted in UTC so the labels match the timestamps on every server.
        const today = Math.floor(Date.now() / DAY_MS);
        const firstDay = PERIOD_DAYS[period]
            ? today - PERIOD_DAYS[period] + 1
            : Math.min(today - 29, ...created.map((time) => Math.floor(time / DAY_MS)));

        const points: { date: string; count: number }[] = [];
        for (let day = firstDay; day <= today; day++) {
            const dayEnd = (day + 1) * DAY_MS;
            points.push({
                date: new Date(day * DAY_MS).toISOString().slice(0, 10),
                count: created.filter((time) => time < dayEnd).length,
            });
        }

        return { success: true, points };
    } catch (error) {
        logger.error("Error fetching domain growth:", error);
        return { success: false, points: [] };
    }
});
