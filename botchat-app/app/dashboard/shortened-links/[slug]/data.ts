export type LinkDraft = {
    slug: string;
    destinationUrl: string;
    appLinking: boolean;
    pixelsEnabled: boolean;
    temporaryEnabled: boolean;
    temporaryUntil: string;
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
    password: string;
    sensitiveContentWarning: boolean;
    cloakingEnabled: boolean;
    advancedNotes: string;
    active: boolean;
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
