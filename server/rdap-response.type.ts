export interface RdapLink {
    value?: string;
    rel?: string;
    href: string;
    type?: string;
}

export interface RdapPublicId {
    type: string;
    identifier: string;
}

export interface RdapVCardEntry {
    0: string;
    1: Record<string, string>;
    2: string;
    3: string;
}

export interface RdapEntity {
    objectClassName: string;
    handle?: string;
    roles: string[];
    links?: RdapLink[];
    publicIds?: RdapPublicId[];
    vcardArray?: ["vcard", RdapVCardEntry[]];
    entities?: RdapEntity[];
}

export interface RdapEvent {
    eventAction: string;
    eventDate: string;
}

export interface RdapSecureDNS {
    delegationSigned: boolean;
}

export interface RdapNameserver {
    objectClassName: string;
    ldhName: string;
}

export interface RdapNotice {
    title: string;
    description: string[];
    links?: RdapLink[];
}

export interface RdapDomainResponse {
    objectClassName: string;
    handle: string;
    ldhName: string;
    links: RdapLink[];
    status: string[];
    entities: RdapEntity[];
    events: RdapEvent[];
    secureDNS: RdapSecureDNS;
    nameservers: RdapNameserver[];
    rdapConformance: string[];
    notices: RdapNotice[];
}