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
    const clean = hex.replace("#", "").trim();
    const full = clean.length === 3
        ? clean.split("").map((c) => c + c).join("")
        : clean;

    const value = Number.parseInt(full, 16);
    if (Number.isNaN(value)) return [108, 92, 231];

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

    root.style.setProperty("--chart-1", settings.chartMatchTheme ? settings.primary : settings.chartColor);
    root.style.setProperty("--chart-2", settings.secondary);
    root.style.setProperty("--chart-3", settings.tertiary);

    root.style.setProperty("--radius", `${Math.max(settings.borderRadius / 16, 0.4)}rem`);

    if (settings.darkMode) {
        root.style.setProperty("--background", "#0b1020");
        root.style.setProperty("--foreground", "#e8ecff");
        root.style.setProperty("--card", "#11182b");
        root.style.setProperty("--card-foreground", "#e8ecff");
        root.style.setProperty("--popover", "#11182b");
        root.style.setProperty("--popover-foreground", "#e8ecff");
        root.style.setProperty("--sidebar", "#0a1124");
        root.style.setProperty("--sidebar-foreground", "#c6d1ec");
        root.style.setProperty("--sidebar-border", "rgba(255,255,255,0.07)");
        root.style.setProperty("--glass-bg", rgba("#11182b", 0.82));
        root.style.setProperty("--glass-border", "rgba(255,255,255,0.08)");
        root.style.setProperty("--muted-foreground", "#9aa6c7");
        root.classList.add("dark");
        root.classList.remove("light");
    } else {
        root.style.setProperty("--background", "#f8fafc");
        root.style.setProperty("--foreground", "#111827");
        root.style.setProperty("--card", "#ffffff");
        root.style.setProperty("--card-foreground", "#111827");
        root.style.setProperty("--popover", "#ffffff");
        root.style.setProperty("--popover-foreground", "#111827");
        root.style.setProperty("--sidebar", "#ffffff");
        root.style.setProperty("--sidebar-foreground", "#374151");
        root.style.setProperty("--sidebar-border", "rgba(15,23,42,0.08)");
        root.style.setProperty("--glass-bg", "rgba(255,255,255,0.92)");
        root.style.setProperty("--glass-border", "rgba(15,23,42,0.08)");
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

    // Dispatch to ThemeProvider so it syncs its internal state
    const newTheme = settings.darkMode ? "dark" : "light";
    const event = new CustomEvent("botchat-appearance-updated", { detail: newTheme });
    window.dispatchEvent(event);
}
