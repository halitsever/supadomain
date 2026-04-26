import checkAuth from "~~/server/auth-check";
import logger from "~~/server/logger";
import { Domain } from "~~/server/models/domain.schema";

export default defineEventHandler(async (event) => {
    checkAuth(event);

    const { period = "30d" } = getQuery(event) as { period?: string };

    try {
        const domains = await Domain.find({}).select("createdAt").lean();

        const now = new Date();
        now.setHours(23, 59, 59, 999);

        let startDate: Date;
        if (period === "7d") startDate = new Date(now.getTime() - 6 * 86400000);
        else if (period === "30d") startDate = new Date(now.getTime() - 29 * 86400000);
        else if (period === "90d") startDate = new Date(now.getTime() - 89 * 86400000);
        else {
            if (domains.length === 0) {
                startDate = new Date(now.getTime() - 29 * 86400000);
            } else {
                const earliest = Math.min(...domains.map(d => new Date((d as any).createdAt ?? now).getTime()));
                startDate = new Date(earliest);
            }
        }

        startDate.setHours(0, 0, 0, 0);
        const totalDays = Math.ceil((now.getTime() - startDate.getTime()) / 86400000);

        const points: { date: string; count: number }[] = [];
        for (let i = 0; i <= totalDays; i++) {
            const dayEnd = new Date(startDate.getTime() + i * 86400000);
            dayEnd.setHours(23, 59, 59, 999);
            const count = domains.filter(d => {
                const created = (d as any).createdAt;
                return created && new Date(created).getTime() <= dayEnd.getTime();
            }).length;
            points.push({ date: dayEnd.toISOString().split("T")[0]!, count });
        }

        return { success: true, points };
    } catch (error) {
        logger.error("Error fetching domain growth:", error);
        return { success: false, points: [] };
    }
});
