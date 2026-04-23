export type LinkDraft = {
    slug: string;
    destinationUrl: string;
    appLinking: boolean;
    pixelsEnabled: boolean;
    temporaryEnabled: boolean;
    temporaryStart?: string;
    temporaryEnd?: string;
    temporaryUntil: string; // Keep for backwards compatibility if needed
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
    password: string;
    sensitiveContentWarning: boolean;
    cloakingEnabled: boolean;
    advancedNotes: string;
    active: boolean;
    targetingType?: string;
    targeting?: { key: string; value: string }[];
    expirationUrl?: string;
    clicksLimit?: string | number;
    cloakedTitle?: string;
    cloakedMeta?: string;
    customJs?: string;
    cloaking_title?: string;
    cloaking_meta_description?: string;
    cloaking_favicon?: any;
    cloaking_opengraph?: any;
    cloaking_custom_js?: string;
    http_status_code?: number | string;
    splash_page_id?: number | string;
};

export const SEEDED: Record<string, LinkDraft> = {
    test21: {
        slug: "test21",
        destinationUrl: "https://nullphpscript.com/post/66biolink",
        appLinking: false,
        pixelsEnabled: true,
        temporaryEnabled: false,
        temporaryUntil: "",
        utmSource: "instagram",
        utmMedium: "bio",
        utmCampaign: "spring-launch",
        password: "",
        sensitiveContentWarning: false,
        cloakingEnabled: true,
        advancedNotes: "Priority campaign link with high traffic.",
        active: true,
    },
};

export const SEEDED_SLUGS = Object.keys(SEEDED);
