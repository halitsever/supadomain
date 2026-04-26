export interface Domain {
    id: string;
    url: string;
    lastChecked: string | null;
    expireTime: string | null;
    notifications: boolean;
    notifyDaysBefore: number[];
    lastUpdated: string | null;
    registrationDate: string | null;
    lastUpdate: string | null;
    lastUpdatedInRdap: string | null;
    nameservers?: string[];
}