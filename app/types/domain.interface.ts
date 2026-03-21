export interface Domain {
    id: string;
    url: string;
    lastChecked: string | null;
    expireTime: string | null;
    notifications: boolean;
    lastUpdated: string | null;
    registrationDate: string | null;
    lastUpdate: string | null;
    lastUpdatedInRdap: string | null;
    nameservers?: string[];
}