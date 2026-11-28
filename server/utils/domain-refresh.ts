import type { Domain } from "../models/domain.schema";
import type { RdapData } from "../rdap-query";

type DomainDocument = InstanceType<typeof Domain>;

const toDate = (value: string | null) => {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
};

/** Copies RDAP data onto the document. Returns true when the expiry date changed. */
export function applyRdapData(domain: DomainDocument, rdap: RdapData): boolean {
  const expireTime = toDate(rdap.expirationDate);
  const expiryChanged = expireTime?.getTime() !== domain.expireTime?.getTime();

  domain.lastChecked = new Date();
  domain.expireTime = expireTime;
  domain.registrationDate = toDate(rdap.registrationDate);
  domain.lastUpdate = toDate(rdap.lastUpdate);
  domain.lastUpdatedInRdap = toDate(rdap.lastUpdatedInRdap);
  domain.nameservers = rdap.nameservers;

  // A new expiry date means a renewal, so every threshold applies again.
  if (expiryChanged) domain.lastNotifiedDays = null;

  return expiryChanged;
}
