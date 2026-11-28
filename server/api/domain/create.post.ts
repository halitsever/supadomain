import checkAuth from "~~/server/auth-check";
import logger from "~~/server/logger";
import { Domain } from "~~/server/models/domain.schema";
import executeRdapQuery from "~~/server/rdap-query";
import { logActivity } from "~~/server/utils/activity";
import { applyRdapData } from "~~/server/utils/domain-refresh";

export default defineEventHandler(async (event) => {
  checkAuth(event);

  const body = await readBody(event);
  const url = normalizeDomain(body?.url);
  if (!url) return { success: false, message: "Enter a valid domain name, for example example.com" };

  try {
    if (await Domain.exists({ url })) return { success: false, message: `${url} is already tracked` };

    const rdapQuery = await executeRdapQuery(url);

    if (!rdapQuery.success) {
      const message = rdapQuery.notFound ? `No RDAP record for ${url}. The domain is not registered, or its TLD has no RDAP server.` : rdapQuery.message;
      return { success: false, message };
    }

    const domain = new Domain({ url, notifications: true });
    applyRdapData(domain, rdapQuery);
    await domain.save();
    await logActivity(url, "added", `${url} added to portfolio`);
    return { success: true, message: "Domain added successfully", url };
  } catch (error) {
    if ((error as { code?: number })?.code === 11000) return { success: false, message: `${url} is already tracked` };
    logger.error("Error adding domain:", error);
    return { success: false, message: "Failed to add domain" };
  }
});
