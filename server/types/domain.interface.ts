export interface Domain {
    id: string;
    url: string;
    lastChecked: string | null;
    expireTime: string | null;
    notifications: boolean;
    lastUpdated: string | null;
    lastRegistered: string | null;
    lastChanged: string | null;
    lastUpdatedInRdap: string | null;
    nameservers?: string[];
}