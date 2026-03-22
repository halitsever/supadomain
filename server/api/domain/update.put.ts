import checkAuth from "~~/server/auth-check";
import { Domain } from "../../models/domain.schema";
import logger from "~~/server/logger";

export default defineEventHandler(async (event) => {
    checkAuth(event);

    try {
        const { url, notifications } = await readBody(event);

        if (!url) {
            return { success: false, message: "Domain URL is required" };
        }

        const domain = await Domain.findOne({ url });

        if (!domain) {
            return { success: false, message: "Domain not found" };
        }

        if (typeof notifications === "boolean") domain.notifications = notifications;

        await domain.save();

        return { success: true };
    }
    catch (error) {
        logger.error("Server error ", error);
        return { success: false, message: "Internal Server Error" };
    }
});
