import checkAuth from "~~/server/auth-check";
import logger from "~~/server/logger";
import { Domain } from "~~/server/models/domain.schema";
import executeRdapQuery from "~~/server/rdap-query";
import { logActivity } from "~~/server/utils/activity";
import { applyRdapData } from "~~/server/utils/domain-refresh";

export default defineEventHandler(async (event) => {
  checkAuth(event);

  const { url } = (await readBody(event)) ?? {};

  if (!url || typeof url !== "string") return { success: false, message: "Domain URL is required" };

  try {
    const domain = await Domain.findOne({ url });
    if (!domain) return { success: false, message: "Domain not found" };

    const rdapQuery = await executeRdapQuery(url);
    if (!rdapQuery.success) {
      const message = rdapQuery.notFound ? `No RDAP record for ${url}` : rdapQuery.message;
      return { success: false, message };
    }

    applyRdapData(domain, rdapQuery);
    await domain.save();
    await logActivity(url, "refresh", `${url} refreshed from RDAP`);

    return { success: true, message: "Domain refreshed successfully" };
  } catch (error) {
    logger.error("Error refreshing domain:", error);
    return { success: false, message: "Failed to refresh domain" };
  }
});
