export const APPEARANCE_STORAGE_KEY = "botchat.appearance";

export type AppearanceSettings = {
    primary: string;
    secondary: string;
    tertiary: string;
    gradient: boolean;
    gradientDirection: "horizontal" | "vertical" | "radial";
    buttonStyle: "solid" | "gradient";
    buttonPrimary: string;
    buttonSecondary: string;
    buttonText: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: number;
    chartColor: string;
    chartMatchTheme: boolean;
    panelBgType: "solid" | "gradient";
    borderRadius: number;
    shadow: number;
    glass: boolean;
    glassOpacity: number;
    darkMode: boolean;
};

/* ------------------------------------------------------------------ */
/*  DEFAULT THEME — vivid pink / plum, dark mode, glass nav            */
/*  Matches the botChat screenshot (pink pill logo, gradient CTA)      */
/* ------------------------------------------------------------------ */
export const DEFAULT_APPEARANCE: AppearanceSettings = {
    primary: "#EC1560",
    secondary: "#7C1D6F",
    tertiary: "#FF6FA3",
    gradient: true,
    gradientDirection: "horizontal",
    buttonStyle: "gradient",
    buttonPrimary: "#EC1560",
    buttonSecondary: "#7C1D6F",
    buttonText: "#FFFFFF",
    fontFamily: "Plus Jakarta Sans, Inter, sans-serif",
    fontSize: 15,
    fontWeight: 500,
    chartColor: "#EC1560",
    chartMatchTheme: true,
    panelBgType: "solid",
    borderRadius: 14,
    shadow: 0.08,
    glass: true,
    glassOpacity: 0.9,
    darkMode: true,
};

/* ------------------------------------------------------------------ */
/*  PRESET THEMES — trendy, professional color + font combinations     */
/*  Drop any of these into applyAppearanceVariables() to preview,      */
/*  or expose them as a theme picker (e.g. THEME_PRESETS.oceanBlue).   */
/* ------------------------------------------------------------------ */
export const THEME_PRESETS: Record<string, AppearanceSettings> = {
    // 1. Signature pink (default)
    pinkSignature: { ...DEFAULT_APPEARANCE },

    // 2. Cool, "enterprise SaaS" blue — Linear / Vercel-adjacent
    oceanBlue: {
        ...DEFAULT_APPEARANCE,
        primary: "#2563EB",
        secondary: "#1E1B4B",
        tertiary: "#60A5FA",
        buttonPrimary: "#2563EB",
        buttonSecondary: "#1E1B4B",
        fontFamily: "Inter, sans-serif",
        chartColor: "#2563EB",
    },

    // 3. Fresh, fintech-style emerald
    emeraldFintech: {
        ...DEFAULT_APPEARANCE,
        primary: "#10B981",
        secondary: "#064E3B",
        tertiary: "#6EE7B7",
        buttonPrimary: "#10B981",
        buttonSecondary: "#064E3B",
        fontFamily: "Manrope, Inter, sans-serif",
        chartColor: "#10B981",
    },

    // 4. Warm, energetic sunset (great for consumer/creative apps)
    sunsetEnergy: {
        ...DEFAULT_APPEARANCE,
        primary: "#F97316",
        secondary: "#7C2D12",
        tertiary: "#FBBF24",
        buttonPrimary: "#F97316",
        buttonSecondary: "#DB2777",
        fontFamily: "Sora, Inter, sans-serif",
        chartColor: "#F97316",
    },

    // 5. Premium, "AI product" royal purple
    royalPurple: {
        ...DEFAULT_APPEARANCE,
        primary: "#8B5CF6",
        secondary: "#312E81",
        tertiary: "#C4B5FD",
        buttonPrimary: "#8B5CF6",
        buttonSecondary: "#312E81",
        fontFamily: "Space Grotesk, Inter, sans-serif",
        chartColor: "#8B5CF6",
    },

    // 6. Minimal, professional light theme (great for docs/dashboards)
    blackProfessional: {
        ...DEFAULT_APPEARANCE,
        primary: "#0F172A",
        secondary: "#334155",
        tertiary: "#38BDF8",
        buttonStyle: "solid",
        buttonPrimary: "#0F172A",
        buttonSecondary: "#334155",
        buttonText: "#FFFFFF",
        fontFamily: "Inter, sans-serif",
        chartColor: "#38BDF8",
        darkMode: false,
        glass: false,
    },

    // 7. High-contrast, punchy crimson (bold marketing sites)
    crimsonBold: {
        ...DEFAULT_APPEARANCE,
        primary: "#DC2626",
        secondary: "#1C1917",
        tertiary: "#F87171",
        buttonPrimary: "#DC2626",
        buttonSecondary: "#1C1917",
        fontFamily: "Sora, Inter, sans-serif",
        chartColor: "#DC2626",
    },

    // 8. Neon Pulse — pink + electric blue + white glow, night-mode creator theme
    neonPulse: {
        ...DEFAULT_APPEARANCE,
        primary: "#FF2E9F",     // neon pink
        secondary: "#00C2FF",   // electric blue
        tertiary: "#FFFFFF",    // white glow accent
        gradient: true,
        gradientDirection: "horizontal",
        buttonStyle: "gradient",
        buttonPrimary: "#FF2E9F",
        buttonSecondary: "#00C2FF",
        buttonText: "#FFFFFF",
        fontFamily: "Space Grotesk, Inter, sans-serif",
        fontSize: 15,
        fontWeight: 600,
        chartColor: "#FF2E9F",
        chartMatchTheme: true,
        borderRadius: 16,
        shadow: 0.12,
        glass: true,
        glassOpacity: 0.85,
        darkMode: true,
    },

    // 9. Instagram Gradient — purple → pink → orange, the iconic IG DM glow
    instaGradient: {
        ...DEFAULT_APPEARANCE,
        primary: "#DD2A7B",     // IG pink
        secondary: "#8134AF",   // IG purple
        tertiary: "#FEDA77",    // IG yellow-orange
        gradient: true,
        gradientDirection: "radial",
        buttonStyle: "gradient",
        buttonPrimary: "#DD2A7B",
        buttonSecondary: "#F58529", // IG orange
        buttonText: "#FFFFFF",
        fontFamily: "Plus Jakarta Sans, Inter, sans-serif",
        fontSize: 15,
        fontWeight: 600,
        chartColor: "#DD2A7B",
        chartMatchTheme: true,
        borderRadius: 18,
        shadow: 0.14,
        glass: true,
        glassOpacity: 0.85,
        darkMode: true,
    },

    // 10. Messenger Blue — electric blue gradient, familiar FB DM feel
    messengerBlue: {
        ...DEFAULT_APPEARANCE,
        primary: "#006AFF",     // Messenger blue
        secondary: "#0084FF",
        tertiary: "#00C6FF",
        gradient: true,
        gradientDirection: "horizontal",
        buttonStyle: "gradient",
        buttonPrimary: "#006AFF",
        buttonSecondary: "#00C6FF",
        buttonText: "#FFFFFF",
        fontFamily: "Inter, sans-serif",
        fontSize: 15,
        fontWeight: 500,
        chartColor: "#006AFF",
        chartMatchTheme: true,
        borderRadius: 20,
        shadow: 0.10,
        glass: true,
        glassOpacity: 0.9,
        darkMode: true,
    },

    // 11. Snap Yellow — bright, punchy, high-energy Gen Z chat vibe
    snapYellow: {
        ...DEFAULT_APPEARANCE,
        primary: "#FFFC00",     // Snapchat yellow
        secondary: "#1A1A1A",
        tertiary: "#FF5F1F",
        gradient: false,
        buttonStyle: "solid",
        buttonPrimary: "#FFFC00",
        buttonSecondary: "#1A1A1A",
        buttonText: "#111827",
        fontFamily: "Space Grotesk, Inter, sans-serif",
        fontSize: 15,
        fontWeight: 700,
        chartColor: "#FFFC00",
        chartMatchTheme: true,
        borderRadius: 16,
        shadow: 0.08,
        glass: false,
        glassOpacity: 0.9,
        darkMode: true,
    },

    // 12. WhatsApp Green — clean, trusted, minty fresh
    chatGreen: {
        ...DEFAULT_APPEARANCE,
        primary: "#25D366",     // WhatsApp green
        secondary: "#075E54",
        tertiary: "#34D399",
        gradient: true,
        gradientDirection: "horizontal",
        buttonStyle: "gradient",
        buttonPrimary: "#25D366",
        buttonSecondary: "#128C7E",
        buttonText: "#FFFFFF",
        fontFamily: "Manrope, Inter, sans-serif",
        fontSize: 15,
        fontWeight: 500,
        chartColor: "#25D366",
        chartMatchTheme: true,
        borderRadius: 16,
        shadow: 0.08,
        glass: true,
        glassOpacity: 0.9,
        darkMode: true,
    },

    // 13. Twitch Purple — vibrant streamer-chat purple, playful and bright
    twitchPurple: {
        ...DEFAULT_APPEARANCE,
        primary: "#9146FF",     // Twitch purple
        secondary: "#772CE8",
        tertiary: "#BF94FF",
        gradient: true,
        gradientDirection: "horizontal",
        buttonStyle: "gradient",
        buttonPrimary: "#9146FF",
        buttonSecondary: "#772CE8",
        buttonText: "#FFFFFF",
        fontFamily: "Space Grotesk, Inter, sans-serif",
        fontSize: 15,
        fontWeight: 600,
        chartColor: "#9146FF",
        chartMatchTheme: true,
        borderRadius: 16,
        shadow: 0.10,
        glass: true,
        glassOpacity: 0.88,
        darkMode: true,
    },

    // 14. Discord Blurple — modern community-chat blue-violet
    discordBlurple: {
        ...DEFAULT_APPEARANCE,
        primary: "#5865F2",     // Discord blurple
        secondary: "#2C2F33",
        tertiary: "#EB459E",    // Discord fuchsia accent
        gradient: true,
        gradientDirection: "horizontal",
        buttonStyle: "gradient",
        buttonPrimary: "#5865F2",
        buttonSecondary: "#EB459E",
        buttonText: "#FFFFFF",
        fontFamily: "Inter, sans-serif",
        fontSize: 15,
        fontWeight: 500,
        chartColor: "#5865F2",
        chartMatchTheme: true,
        borderRadius: 16,
        shadow: 0.10,
        glass: true,
        glassOpacity: 0.9,
        darkMode: true,
    },
};

/**
 * UI metadata for the creator-preset picker card grid
 * (matches the "Reels Pop / Nordic Minimal / Midnight Studio" style cards).
 * Pair each entry's `key` with THEME_PRESETS[key] to apply it.
 *
 * Ordered with the brightest / most "social DM app" presets first —
 * Instagram is the strongest default if you only want to surface one.
 */
export const THEME_PRESET_CARDS = [
    {
        key: "instaGradient",
        name: "Insta Gradient",
        description: "Purple, pink & orange DM glow",
        swatches: ["#8134AF", "#DD2A7B", "#FEDA77"],
        font: "PLUS JAKARTA SANS",
        mode: "dark" as const,
    },
    {
        key: "neonPulse",
        name: "Neon Pulse",
        description: "Electric pink & blue nightlife glow",
        swatches: ["#FF2E9F", "#00C2FF", "#FFFFFF"],
        font: "SPACE GROTESK",
        mode: "dark" as const,
    },
    {
        key: "messengerBlue",
        name: "Messenger Blue",
        description: "Electric blue, familiar chat feel",
        swatches: ["#006AFF", "#0084FF", "#00C6FF"],
        font: "INTER",
        mode: "dark" as const,
    },
    {
        key: "snapYellow",
        name: "Snap Yellow",
        description: "Bold, high-energy Gen Z chat",
        swatches: ["#FFFC00", "#1A1A1A", "#FF5F1F"],
        font: "SPACE GROTESK",
        mode: "dark" as const,
    },
    {
        key: "chatGreen",
        name: "Chat Green",
        description: "Clean, trusted messaging mint",
        swatches: ["#25D366", "#075E54", "#34D399"],
        font: "MANROPE",
        mode: "dark" as const,
    },
    {
        key: "twitchPurple",
        name: "Twitch Purple",
        description: "Vibrant streamer-chat purple",
        swatches: ["#9146FF", "#772CE8", "#BF94FF"],
        font: "SPACE GROTESK",
        mode: "dark" as const,
    },
    {
        key: "discordBlurple",
        name: "Discord Blurple",
        description: "Modern community chat blue-violet",
        swatches: ["#5865F2", "#2C2F33", "#EB459E"],
        font: "INTER",
        mode: "dark" as const,
    },
];

/* ------------------------------------------------------------------ */
/*  Recommended <head> font imports (add whichever presets you use)    */
/*  <link rel="preconnect" href="https://fonts.googleapis.com">        */
/*  <link href="https://fonts.googleapis.com/css2?                     */
/*    family=Plus+Jakarta+Sans:wght@400;500;600;700;800&               */
/*    family=Inter:wght@400;500;600;700&                                */
/*    family=Manrope:wght@400;500;600;700&                              */
/*    family=Sora:wght@400;500;600;700&                                 */
/*    family=Space+Grotesk:wght@400;500;600;700&display=swap"           */
/*    rel="stylesheet">                                                 */
/* ------------------------------------------------------------------ */

function hexToRgb(hex: string): [number, number, number] {
    if (!hex || typeof hex !== 'string') return [236, 21, 96]; // fallback matches brand pink
    const clean = hex.replace("#", "").trim();
    const full = clean.length === 3
        ? clean.split("").map((c) => c + c).join("")
        : clean;

    const value = Number.parseInt(full, 16);
    if (Number.isNaN(value)) return [236, 21, 96];

    return [
        (value >> 16) & 255,
        (value >> 8) & 255,
        value & 255,
    ];
}

function rgba(hex: string, alpha: number): string {
    const [r, g, b] = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function srgbToLinear(channel: number): number {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function getContrastTextColor(hex: string): string {
    const [r, g, b] = hexToRgb(hex);
    const luminance =
        (0.2126 * srgbToLinear(r)) +
        (0.7152 * srgbToLinear(g)) +
        (0.0722 * srgbToLinear(b));

    return luminance < 0.5 ? "#FFFFFF" : "#111827";
}

function getGradientContrastTextColor(startHex: string, endHex: string): string {
    const [r1, g1, b1] = hexToRgb(startHex);
    const [r2, g2, b2] = hexToRgb(endHex);
    const avgHex = `#${Math.round((r1 + r2) / 2).toString(16).padStart(2, "0")}${Math.round((g1 + g2) / 2).toString(16).padStart(2, "0")}${Math.round((b1 + b2) / 2).toString(16).padStart(2, "0")}`;
    return getContrastTextColor(avgHex);
}

function createThreeColorGradient(settings: AppearanceSettings): string {
    const { primary, secondary, tertiary, gradientDirection } = settings;

    if (gradientDirection === "vertical") {
        return `linear-gradient(180deg, ${primary}, ${secondary}, ${tertiary})`;
    }

    if (gradientDirection === "radial") {
        return `radial-gradient(circle, ${primary}, ${secondary}, ${tertiary})`;
    }

    return `linear-gradient(90deg, ${primary}, ${secondary}, ${tertiary})`;
}

export function applyAppearanceVariables(settings: AppearanceSettings): void {
    if (typeof document === "undefined") return;

    const root = document.documentElement;
    const brandGradient = `linear-gradient(135deg, ${settings.primary} 0%, ${settings.secondary} 100%)`;
    const buttonGradient = brandGradient;
    const onPrimary = getContrastTextColor(settings.primary);
    const onSecondary = getContrastTextColor(settings.secondary);
    const onAccent = getContrastTextColor(settings.tertiary);
    const onButton = getGradientContrastTextColor(settings.primary, settings.secondary);

    root.style.setProperty("--brand-pink", settings.primary);
    root.style.setProperty("--brand-purple", settings.secondary);
    // Keep brand-pink tokens in sync with the user-chosen primary/secondary
    // so all globals.css consumers (links, scrollbar, glows) reflect the theme.
    root.style.setProperty("--brand-pink-light", settings.secondary);
    const [_r, _g, _b] = hexToRgb(settings.primary);
    root.style.setProperty("--brand-pink-dark", `rgb(${Math.max(0, _r - 30)},${Math.max(0, _g - 30)},${Math.max(0, _b - 30)})`);
    root.style.setProperty("--accent", settings.tertiary);
    root.style.setProperty("--on-primary", onPrimary);
    root.style.setProperty("--on-secondary", onSecondary);
    root.style.setProperty("--on-accent", onAccent);
    root.style.setProperty("--primary", settings.primary);
    root.style.setProperty("--ring", settings.primary);

    root.style.setProperty("--brand-gradient", buttonGradient);
    root.style.setProperty("--brand-gradient-alt", `linear-gradient(135deg, ${settings.primary} 0%, ${settings.secondary} 60%, ${settings.tertiary} 100%)`);
    root.style.setProperty("--brand-gradient-soft", `linear-gradient(135deg, ${rgba(settings.primary, 0.14)} 0%, ${rgba(settings.secondary, 0.14)} 100%)`);
    root.style.setProperty("--app-surface-bg", settings.darkMode ? "#0b1020" : "#f8fafc");
    root.style.setProperty("--app-button-bg", buttonGradient);
    root.style.setProperty("--app-button-text", onButton);
    root.style.setProperty("--app-font-family", settings.fontFamily);
    root.style.setProperty("--app-font-size", `${settings.fontSize}px`);
    root.style.setProperty("--app-font-weight", `${settings.fontWeight}`);

    root.style.setProperty("--nav-hover-bg", rgba(settings.primary, settings.darkMode ? 0.16 : 0.08));
    root.style.setProperty("--nav-active-bg", rgba(settings.primary, settings.darkMode ? 0.26 : 0.14));
    root.style.setProperty("--nav-active-color", settings.primary);
    root.style.setProperty("--nav-active-border", settings.primary);
    root.style.setProperty("--input-focus-ring", rgba(settings.primary, 0.25));
    root.style.setProperty("--input-focus-border", settings.primary);
    root.style.setProperty("--shadow-pink", `0 8px 30px ${rgba(settings.primary, 0.35)}`);
    root.style.setProperty("--glow-pink", `0 0 40px ${rgba(settings.primary, 0.28)}`);
    root.style.setProperty("--glow-pink-sm", `0 0 18px ${rgba(settings.primary, 0.32)}`);

    // Glow / shadow variables that feed --shadow-hover
    root.style.setProperty("--glow-blue", `0 0 40px ${rgba(settings.primary, 0.28)}`);
    root.style.setProperty("--glow-sky", `0 0 40px ${rgba(settings.secondary, 0.22)}`);
    root.style.setProperty("--glow-blue-sm", `0 0 18px ${rgba(settings.primary, 0.32)}`);
    root.style.setProperty("--shadow-hover", `0 16px 48px rgba(0,0,0,${settings.darkMode ? 0.55 : 0.18}), 0 0 28px ${rgba(settings.primary, 0.22)}`);
    root.style.setProperty("--shadow-blue", `0 8px 30px ${rgba(settings.primary, 0.38)}`);

    // Body background orb tints
    root.style.setProperty("--body-orb-primary", rgba(settings.primary, settings.darkMode ? 0.12 : 0.08));
    root.style.setProperty("--body-orb-accent", rgba(settings.secondary, settings.darkMode ? 0.08 : 0.05));

    // Message bubbles
    root.style.setProperty("--msg-in-bg", rgba(settings.primary, settings.darkMode ? 0.09 : 0.06));
    root.style.setProperty("--msg-in-border", rgba(settings.primary, settings.darkMode ? 0.18 : 0.12));
    root.style.setProperty("--msg-out-bg", `linear-gradient(135deg, ${settings.primary}, ${settings.secondary})`);



    root.style.setProperty("--chart-1", settings.chartMatchTheme ? settings.primary : settings.chartColor);
    root.style.setProperty("--chart-2", settings.secondary);
    root.style.setProperty("--chart-3", settings.tertiary);

    root.style.setProperty("--radius", `${Math.max(settings.borderRadius / 16, 0.4)}rem`);

    if (settings.darkMode) {
        // Dark mode: background, sidebar, topbar ALL use the same #09090b
        root.style.setProperty("--background", "#09090b");
        root.style.setProperty("--foreground", "#f8fafc");
        root.style.setProperty("--card", "#110a14");
        root.style.setProperty("--card-foreground", "#f8fafc");
        root.style.setProperty("--popover", "#110a14");
        root.style.setProperty("--popover-foreground", "#f8fafc");
        root.style.setProperty("--sidebar", "#09090b");
        root.style.setProperty("--sidebar-foreground", "#9a7da0");
        root.style.setProperty("--sidebar-border", "rgba(255,255,255,0.05)");
        root.style.setProperty("--sidebar-accent", "rgba(255,255,255,0.06)");
        root.style.setProperty("--sidebar-accent-foreground", "#e2e8f0");
        root.style.setProperty("--sidebar-primary", settings.primary);
        root.style.setProperty("--sidebar-primary-foreground", "#ffffff");
        root.style.setProperty("--primary-foreground", onPrimary);
        root.style.setProperty("--border", "rgba(255,255,255,0.08)");
        root.style.setProperty("--input", "rgba(255,255,255,0.08)");
        root.style.setProperty("--secondary", "#1a0e1e");
        root.style.setProperty("--secondary-foreground", onSecondary);
        root.style.setProperty("--muted", "#13101a");
        root.style.setProperty("--background-overlay", "rgba(0,0,0,0.55)");
        root.style.setProperty("--topbar-bg", "#09090b");
        root.style.setProperty("--topbar-border", "rgba(255,255,255,0.06)");
        root.style.setProperty("--topbar-item-bg", "rgba(255,255,255,0.06)");
        root.style.setProperty("--topbar-item-border", "rgba(255,255,255,0.10)");
        root.style.setProperty("--topbar-item-hover", "rgba(255,255,255,0.12)");
        root.style.setProperty("--topbar-fg", "#f8fafc");
        root.style.setProperty("--topbar-muted-fg", "#94a3b8");
        root.style.setProperty("--topbar-divider", "rgba(255,255,255,0.08)");
        root.style.setProperty("--topbar-kbd-bg", "rgba(255,255,255,0.08)");
        root.style.setProperty("--topbar-kbd-border", "rgba(255,255,255,0.12)");
        root.style.setProperty("--topbar-dropdown-bg", "rgba(9,9,11,0.98)");
        root.style.setProperty("--topbar-dropdown-border", "rgba(255,255,255,0.08)");
        root.style.setProperty("--glass-bg", rgba("#110a14", 0.75));
        root.style.setProperty("--glass-border", "rgba(255,255,255,0.08)");
        root.style.setProperty("--muted-foreground", "#cbd5e1");
        root.classList.add("dark");
        root.classList.remove("light");
    } else {
        // Light mode: topbar uses same color as sidebar (#fff5f8)
        root.style.setProperty("--background", "#ffffff");
        root.style.setProperty("--foreground", "#111827");
        root.style.setProperty("--card", "#ffffff");
        root.style.setProperty("--card-foreground", "#111827");
        root.style.setProperty("--popover", "#ffffff");
        root.style.setProperty("--popover-foreground", "#111827");
        root.style.setProperty("--sidebar", "#fff5f8");
        root.style.setProperty("--sidebar-foreground", "#4a3459");
        root.style.setProperty("--sidebar-border", "rgba(232,23,93,0.08)");
        root.style.setProperty("--sidebar-accent", "rgba(232,23,93,0.10)");
        root.style.setProperty("--sidebar-accent-foreground", "#1a1235");
        root.style.setProperty("--sidebar-primary", settings.primary);
        root.style.setProperty("--sidebar-primary-foreground", "#ffffff");
        root.style.setProperty("--primary-foreground", onPrimary);
        root.style.setProperty("--border", "rgba(0,0,0,0.08)");
        root.style.setProperty("--input", "rgba(0,0,0,0.06)");
        root.style.setProperty("--secondary", "#fff5f8");
        root.style.setProperty("--secondary-foreground", onSecondary);
        root.style.setProperty("--muted", "#f3f4f6");
        root.style.setProperty("--background-overlay", "rgba(0,0,0,0.25)");
        root.style.setProperty("--topbar-bg", "#fff5f8");
        root.style.setProperty("--topbar-border", "rgba(232,23,93,0.08)");
        root.style.setProperty("--topbar-item-bg", "rgba(232,23,93,0.06)");
        root.style.setProperty("--topbar-item-border", "rgba(232,23,93,0.12)");
        root.style.setProperty("--topbar-item-hover", "rgba(232,23,93,0.12)");
        root.style.setProperty("--topbar-fg", "#4a3459");
        root.style.setProperty("--topbar-muted-fg", "#9a7da0");
        root.style.setProperty("--topbar-divider", "rgba(232,23,93,0.08)");
        root.style.setProperty("--topbar-kbd-bg", "rgba(232,23,93,0.06)");
        root.style.setProperty("--topbar-kbd-border", "rgba(232,23,93,0.12)");
        root.style.setProperty("--topbar-dropdown-bg", "rgba(255,245,248,0.98)");
        root.style.setProperty("--topbar-dropdown-border", "rgba(232,23,93,0.08)");
        root.style.setProperty("--glass-bg", "rgba(255,255,255,0.92)");
        root.style.setProperty("--glass-border", "rgba(232,23,93,0.08)");
        root.style.setProperty("--muted-foreground", "#374151");
        root.classList.add("light");
        root.classList.remove("dark");
    }
}

export function loadSavedAppearance(): AppearanceSettings {
    if (typeof window === "undefined") return DEFAULT_APPEARANCE;

    try {
        const raw = window.localStorage.getItem(APPEARANCE_STORAGE_KEY);
        if (!raw) return DEFAULT_APPEARANCE;
        return { ...DEFAULT_APPEARANCE, ...JSON.parse(raw) };
    } catch {
        return DEFAULT_APPEARANCE;
    }
}

export function saveAppearance(settings: AppearanceSettings): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(settings));
    previewAppearance(settings);
}

export function previewAppearance(settings: AppearanceSettings): void {
    if (typeof document === "undefined") return;
    applyAppearanceVariables(settings);

    // Dispatch the full settings object to listeners (like ThemeProvider)
    const event = new CustomEvent("botchat-appearance-updated", { detail: settings });
    window.dispatchEvent(event);
}

/**
 * Apply one of the built-in trendy presets by name.
 * e.g. applyPreset("instaGradient")
 */
export function applyPreset(name: keyof typeof THEME_PRESETS): AppearanceSettings {
    const preset = THEME_PRESETS[name] ?? DEFAULT_APPEARANCE;
    saveAppearance(preset);
    return preset;
}