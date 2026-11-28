import { Cron } from 'croner';
import { sendSlackNotification } from '../utils/notifications/slack';
import { Domain } from '../models/domain.schema';
import { logActivity } from '../utils/activity';
import { alertStage, isAlertDue, expiryLabel, DEFAULT_NOTIFY_DAYS, EXPIRED_STAGE } from '../utils/alert-stage';
import { applyRdapData } from '../utils/domain-refresh';
import executeRdapQuery from '../rdap-query';
import logger from '../logger';

const RECHECK_AFTER_MS = 24 * 60 * 60 * 1000;
const RDAP_PAUSE_MS = 1000;

type DomainDocument = InstanceType<typeof Domain>;

/** Picks up renewals by reading RDAP again once the stored data is a day old. */
async function recheckIfStale(domain: DomainDocument) {
    const lastChecked = domain.lastChecked?.getTime() ?? 0;
    if (Date.now() - lastChecked < RECHECK_AFTER_MS) return;

    const rdapQuery = await executeRdapQuery(domain.url);
    // rdap.org rate-limits bursts, so lookups are spaced out.
    await new Promise((resolve) => setTimeout(resolve, RDAP_PAUSE_MS));
    if (!rdapQuery.success) return;

    const expiryChanged = applyRdapData(domain, rdapQuery);
    await domain.save();

    if (expiryChanged && domain.expireTime) {
        await logActivity(domain.url, 'refresh', `${domain.url} has a new expiry date: ${domain.expireTime.toISOString().slice(0, 10)}`);
    }
}

async function alertIfDue(domain: DomainDocument) {
    if (!domain.expireTime || !domain.notifications) return;

    const stage = alertStage(domain.expireTime, domain.notifyDaysBefore ?? DEFAULT_NOTIFY_DAYS);
    if (!isAlertDue(stage, domain.lastNotifiedDays)) return;

    const label = expiryLabel(domain.expireTime);
    // Without a webhook the stage stays open, so the alert goes out once one is saved.
    if (await sendSlackNotification(domain.url, label) !== 'sent') return;

    const kind = stage === EXPIRED_STAGE ? 'expired' : 'alert';
    await logActivity(domain.url, kind, `${domain.url}: ${label.toLowerCase()}, alert sent via Slack`);

    domain.lastNotifiedDays = stage;
    await domain.save();
}

export async function runHourlyCheck() {
    const domains = await Domain.find({});

    for (const domain of domains) {
        try {
            await recheckIfStale(domain);
            await alertIfDue(domain);
        } catch (error) {
            logger.error(`Hourly check failed for ${domain.url}:`, error);
        }
    }
}

export default defineNitroPlugin(() => {
    new Cron('0 * * * *', { protect: true, catch: (error) => logger.error('Hourly check failed:', error) }, runHourlyCheck);
});
