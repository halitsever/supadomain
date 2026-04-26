export interface Domain {
    id: string;
    url: string;
    lastChecked: string | null;
    expireTime: string | null;
    notifications: boolean;
    notifyDaysBefore: number[];
    lastUpdated: string | null;
    lastRegistered: string | null;
    lastChanged: string | null;
    lastUpdatedInRdap: string | null;
    nameservers?: string[];
}