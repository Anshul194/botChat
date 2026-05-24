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

export const DEFAULT_APPEARANCE: AppearanceSettings = {
    primary: "#1d6ef5",
    secondary: "#38b2ff",
    tertiary: "#6366f1",
    gradient: true,
    gradientDirection: "horizontal",
    buttonStyle: "gradient",
    buttonPrimary: "#1d6ef5",
    buttonSecondary: "#38b2ff",
    buttonText: "#FFFFFF",
    fontFamily: "Inter, sans-serif",
    fontSize: 14,
    fontWeight: 500,
    chartColor: "#1d6ef5",
    chartMatchTheme: true,
    panelBgType: "solid",
    borderRadius: 16,
    shadow: 0.1,
    glass: true,
    glassOpacity: 0.8,
    darkMode: false,
};

function hexToRgb(hex: string): [number, number, number] {
    if (!hex || typeof hex !== 'string') return [29, 110, 245];
    const clean = hex.replace("#", "").trim();
    const full = clean.length === 3
        ? clean.split("").map((c) => c + c).join("")
        : clean;

    const value = Number.parseInt(full, 16);
    if (Number.isNaN(value)) return [29, 110, 245];

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
    // Keep brand-blue tokens in sync with the user-chosen primary/secondary
    // so all globals.css consumers (links, scrollbar, glows) reflect the theme.
    root.style.setProperty("--brand-blue", settings.primary);
    root.style.setProperty("--brand-blue-light", settings.secondary);
    const [_r, _g, _b] = hexToRgb(settings.primary);
    root.style.setProperty("--brand-blue-dark", `rgb(${Math.max(0, _r - 30)},${Math.max(0, _g - 30)},${Math.max(0, _b - 30)})`);
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

    // Nav active color follows primary
    root.style.setProperty("--nav-active-color", settings.secondary || settings.primary);

    root.style.setProperty("--chart-1", settings.chartMatchTheme ? settings.primary : settings.chartColor);
    root.style.setProperty("--chart-2", settings.secondary);
    root.style.setProperty("--chart-3", settings.tertiary);

    root.style.setProperty("--radius", `${Math.max(settings.borderRadius / 16, 0.4)}rem`);

    if (settings.darkMode) {
        root.style.setProperty("--background", "#020617");
        root.style.setProperty("--foreground", "#e2e8f8");
        root.style.setProperty("--card", "#080d1a");
        root.style.setProperty("--card-foreground", "#e2e8f8");
        root.style.setProperty("--popover", "#080d1a");
        root.style.setProperty("--popover-foreground", "#e2e8f8");
        root.style.setProperty("--sidebar", "#050914");
        root.style.setProperty("--sidebar-foreground", "#6b7fa8");
        root.style.setProperty("--sidebar-border", "rgba(255,255,255,0.05)");
        root.style.setProperty("--topbar-bg", "rgba(9, 11, 20, 0.95)");
        root.style.setProperty("--topbar-border", "rgba(255, 255, 255, 0.05)");
        root.style.setProperty("--topbar-item-bg", "rgba(255, 255, 255, 0.07)");
        root.style.setProperty("--topbar-item-border", "rgba(255, 255, 255, 0.09)");
        root.style.setProperty("--topbar-item-hover", "rgba(255, 255, 255, 0.12)");
        root.style.setProperty("--glass-bg", rgba("#080911", 0.75));
        root.style.setProperty("--glass-border", "rgba(255,255,255,0.08)");
        root.style.setProperty("--muted-foreground", "#64748b");
        root.classList.add("dark");
        root.classList.remove("light");
    } else {
        root.style.setProperty("--background", "#f8fafc");
        root.style.setProperty("--foreground", "#0f172a");
        root.style.setProperty("--card", "#ffffff");
        root.style.setProperty("--card-foreground", "#0f172a");
        root.style.setProperty("--popover", "#ffffff");
        root.style.setProperty("--popover-foreground", "#0f172a");
        root.style.setProperty("--sidebar", "#ffffff"); // Consistent with light theme sidebar
        root.style.setProperty("--sidebar-foreground", "#334155");
        root.style.setProperty("--sidebar-border", "rgba(0,0,0,0.06)");
        root.style.setProperty("--topbar-bg", "rgba(255, 255, 255, 0.94)");
        root.style.setProperty("--topbar-border", "rgba(0, 0, 0, 0.07)");
        root.style.setProperty("--topbar-item-bg", "rgba(0, 0, 0, 0.05)");
        root.style.setProperty("--topbar-item-border", "rgba(0, 0, 0, 0.08)");
        root.style.setProperty("--topbar-item-hover", "rgba(0, 0, 0, 0.09)");
        root.style.setProperty("--glass-bg", "rgba(255,255,255,0.92)");
        root.style.setProperty("--glass-border", "rgba(0,0,0,0.07)");
        root.style.setProperty("--muted-foreground", "#64748b");
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
