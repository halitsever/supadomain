import checkAuth from "~~/server/auth-check";
import { Domain } from "../../models/domain.schema";
import logger from "~~/server/logger";

export default defineEventHandler(async (event) => {
    checkAuth(event);

    try {
        const { url, notifications, notifyDaysBefore } = (await readBody(event)) ?? {};

        if (!url || typeof url !== "string") {
            return { success: false, message: "Domain URL is required" };
        }

        const domain = await Domain.findOne({ url });

        if (!domain) {
            return { success: false, message: "Domain not found" };
        }

        if (typeof notifications === "boolean") domain.notifications = notifications;
        if (Array.isArray(notifyDaysBefore)) {
            const valid = notifyDaysBefore.every((days) => Number.isInteger(days) && days >= 0 && days <= 365);
            if (!valid) return { success: false, message: "Thresholds must be whole days between 0 and 365" };
            domain.notifyDaysBefore = [...new Set<number>(notifyDaysBefore)].sort((a, b) => b - a);
        }

        await domain.save();

        return { success: true };
    }
    catch (error) {
        logger.error("Server error ", error);
        return { success: false, message: "Internal Server Error" };
    }
});
