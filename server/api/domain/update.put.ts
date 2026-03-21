import { Domain } from "../../models/domain.schema";

export default defineEventHandler(async (event) => {
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
});
