// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Palette, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppDispatch, RootState } from "../../../../store/store";
import {
    updateGeneralSettings, fetchGeneralSettings,
} from "../../../../store/slices/settingsSlice";
import {
    DEFAULT_APPEARANCE,
    applyAppearanceVariables,
    loadSavedAppearance,
    saveAppearance,
    previewAppearance,
} from "@/lib/appearance";
import { Section, IntegrationHeader } from "./shared-ui";

const fontOptions = [
    "var(--font-inter), sans-serif", "Poppins, sans-serif", "var(--font-montserrat), sans-serif",
    "Nunito, sans-serif", "Roboto, sans-serif", "Open Sans, sans-serif",
    "Lato, sans-serif", "Raleway, sans-serif", "var(--font-dm-sans), sans-serif",
    "Manrope, sans-serif", "Mulish, sans-serif", "Work Sans, sans-serif",
    "Urbanist, sans-serif", "Source Sans Pro, sans-serif", "PT Sans, sans-serif",
    "Merriweather, serif", "Playfair Display, serif", "Lora, serif",
    "Libre Baskerville, serif", "Fira Sans, sans-serif", "IBM Plex Sans, sans-serif",
    "Josefin Sans, sans-serif", "Plus Jakarta Sans, sans-serif", "Sora, sans-serif",
    "Space Grotesk, sans-serif",
];

const creatorPresets = [
    // --- LIGHT & WHITE GROUP ---
    { name: "Default Pink", vibe: "Landing page signature vibe", mode: "Light", primary: "#EC1560", secondary: "#7C1D6F", tertiary: "#FF6FA3", fontFamily: "var(--font-inter), sans-serif", fontSize: 15, fontWeight: 500, darkMode: false },
    { name: "Reels Pop", vibe: "Bold creator funnel style", mode: "Light", primary: "#FF4D6D", secondary: "#7C3AED", tertiary: "#2DD4BF", fontFamily: "var(--font-inter), sans-serif", fontSize: 16, fontWeight: 600, darkMode: false },
    { name: "Ocean Blue Light", vibe: "Clean enterprise blue style", mode: "Light", primary: "#2563EB", secondary: "#1E3A8A", tertiary: "#60A5FA", fontFamily: "var(--font-inter), sans-serif", fontSize: 15, fontWeight: 500, darkMode: false },
    { name: "Soft Editorial", vibe: "Clean editorial & content focus", mode: "Light", primary: "#1E40AF", secondary: "#DB2777", tertiary: "#3B82F6", fontFamily: "var(--font-inter), sans-serif", fontSize: 15, fontWeight: 500, darkMode: false },
    { name: "Twitch Purple Light", vibe: "Vibrant streamer-chat style", mode: "Light", primary: "#9146FF", secondary: "#772CE8", tertiary: "#BF94FF", fontFamily: "var(--font-inter), sans-serif", fontSize: 15, fontWeight: 600, darkMode: false },
    { name: "Growth Mint Light", vibe: "Clean coaching brand style", mode: "Light", primary: "#0EA5A4", secondary: "#2563EB", tertiary: "#F97316", fontFamily: "var(--font-montserrat), sans-serif", fontSize: 16, fontWeight: 500, darkMode: false },
    { name: "Emerald Fintech Light", vibe: "Fintech style mint light theme", mode: "Light", primary: "#10B981", secondary: "#064E3B", tertiary: "#6EE7B7", fontFamily: "var(--font-montserrat), sans-serif", fontSize: 16, fontWeight: 500, darkMode: false },
    { name: "Retro Pop Light", vibe: "High energy neon-light hybrid", mode: "Light", primary: "#FFD300", secondary: "#FF007F", tertiary: "#00F0FF", fontFamily: "var(--font-inter), sans-serif", fontSize: 15, fontWeight: 700, darkMode: false },

    // --- DARK & NEON GROUP ---
    { name: "Pink Dark", vibe: "Midnight plum & pink glow", mode: "Dark", primary: "#EC1560", secondary: "#7C1D6F", tertiary: "#FF6FA3", fontFamily: "var(--font-inter), sans-serif", fontSize: 15, fontWeight: 500, darkMode: true },
    { name: "Velvet Royal", vibe: "Luxurious deep ruby dark", mode: "Dark", primary: "#FF0055", secondary: "#3A000F", tertiary: "#FF8AA5", fontFamily: "var(--font-inter), sans-serif", fontSize: 15, fontWeight: 600, darkMode: true },
    { name: "Messenger Blue", vibe: "Familiar Messenger style", mode: "Dark", primary: "#006AFF", secondary: "#0084FF", tertiary: "#00C6FF", fontFamily: "var(--font-inter), sans-serif", fontSize: 15, fontWeight: 500, darkMode: true },
    { name: "Ocean Depths", vibe: "Tech and SaaS scale", mode: "Dark", primary: "#0EA5E9", secondary: "#0369A1", tertiary: "#38BDF8", fontFamily: "var(--font-inter), sans-serif", fontSize: 15, fontWeight: 500, darkMode: true },
    { name: "Insta Gradient", vibe: "Iconic Instagram DM gradient", mode: "Dark", primary: "#DD2A7B", secondary: "#8134AF", tertiary: "#FEDA77", fontFamily: "var(--font-inter), sans-serif", fontSize: 15, fontWeight: 600, darkMode: true },
    { name: "Discord Blurple", vibe: "Modern community chat dark", mode: "Dark", primary: "#5865F2", secondary: "#2C2F33", tertiary: "#EB459E", fontFamily: "var(--font-inter), sans-serif", fontSize: 15, fontWeight: 500, darkMode: true },
    { name: "Midnight Studio", vibe: "Premium dark creator studio", mode: "Dark", primary: "#8B5CF6", secondary: "#06B6D4", tertiary: "#F59E0B", fontFamily: "var(--font-inter), sans-serif", fontSize: 15, fontWeight: 600, darkMode: true },
    { name: "Chat Green", vibe: "WhatsApp style messaging mint", mode: "Dark", primary: "#25D366", secondary: "#075E54", tertiary: "#34D399", fontFamily: "var(--font-montserrat), sans-serif", fontSize: 15, fontWeight: 500, darkMode: true },
    { name: "Aurora Borealis", vibe: "Northern lights gradient theme", mode: "Dark", primary: "#4ade80", secondary: "#818cf8", tertiary: "#c084fc", fontFamily: "var(--font-montserrat), sans-serif", fontSize: 16, fontWeight: 600, darkMode: true },
    { name: "Cyberpunk Neon", vibe: "High-contrast neon yellow & cyan", mode: "Dark", primary: "#FCE205", secondary: "#FF003C", tertiary: "#00FF9F", fontFamily: "var(--font-inter), sans-serif", fontSize: 15, fontWeight: 700, darkMode: true },
    { name: "Neon Pulse", vibe: "Nightlife creator glow theme", mode: "Dark", primary: "#FF2E9F", secondary: "#00C2FF", tertiary: "#FFFFFF", fontFamily: "var(--font-inter), sans-serif", fontSize: 15, fontWeight: 600, darkMode: true },
    { name: "Synthwave Sunset", vibe: "Vibrant hot pink & synthwave glow", mode: "Dark", primary: "#FF7E67", secondary: "#FF2A54", tertiary: "#230B48", fontFamily: "var(--font-inter), sans-serif", fontSize: 15, fontWeight: 600, darkMode: true },
    { name: "Matrix Green", vibe: "Electric acid green hacker dev", mode: "Dark", primary: "#A6E22E", secondary: "#1A1A1A", tertiary: "#66D9EF", fontFamily: "var(--font-inter), sans-serif", fontSize: 15, fontWeight: 500, darkMode: true },
];

export default function AppearanceTab({ showModal }: { showModal: (type: string, title: string, desc: string) => void }) {
    const dispatch = useDispatch<AppDispatch>();
    const [appearance, setAppearance] = useState(DEFAULT_APPEARANCE);
    const [appearancePreview, setAppearancePreview] = useState(DEFAULT_APPEARANCE);

    const getContrastTextColor = (hex: string) => {
        const clean = hex.replace("#", "").trim();
        const full = clean.length === 3 ? clean.split("").map((c) => `${c}${c}`).join("") : clean;
        const value = Number.parseInt(full, 16);
        if (Number.isNaN(value)) return "#FFFFFF";
        const r = (value >> 16) & 255;
        const g = (value >> 8) & 255;
        const b = value & 255;
        const linear = (channel: number) => { const c = channel / 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
        const luminance = (0.2126 * linear(r)) + (0.7152 * linear(g)) + (0.0722 * linear(b));
        return luminance < 0.5 ? "#FFFFFF" : "#111827";
    };

    const getGradientContrastTextColor = (startHex: string, endHex: string) => {
        const toRgb = (hex: string) => {
            const clean = hex.replace("#", "").trim();
            const full = clean.length === 3 ? clean.split("").map((c) => `${c}${c}`).join("") : clean;
            const value = Number.parseInt(full, 16);
            if (Number.isNaN(value)) return [108, 92, 231] as const;
            return [(value >> 16) & 255, (value >> 8) & 255, value & 255] as const;
        };
        const [r1, g1, b1] = toRgb(startHex);
        const [r2, g2, b2] = toRgb(endHex);
        const avgHex = `#${Math.round((r1 + r2) / 2).toString(16).padStart(2, "0")}${Math.round((g1 + g2) / 2).toString(16).padStart(2, "0")}${Math.round((b1 + b2) / 2).toString(16).padStart(2, "0")}`;
        return getContrastTextColor(avgHex);
    };

    useEffect(() => {
        const saved = loadSavedAppearance();
        setAppearance(saved);
        setAppearancePreview(saved);
        previewAppearance(saved);
    }, []);

    useEffect(() => {
        setAppearancePreview(appearance);
        previewAppearance(appearance);
    }, [appearance]);

    useEffect(() => {
        const handleExternalUpdate = (e: any) => {
            if (e.detail && typeof e.detail === "object") {
                const incoming = e.detail;
                setAppearance(prev => JSON.stringify(prev) === JSON.stringify(incoming) ? prev : incoming);
                setAppearancePreview(prev => JSON.stringify(prev) === JSON.stringify(incoming) ? prev : incoming);
            }
        };
        window.addEventListener("botchat-appearance-updated", handleExternalUpdate);
        return () => window.removeEventListener("botchat-appearance-updated", handleExternalUpdate);
    }, []);

    const applyCreatorPreset = (preset: typeof creatorPresets[number]) => {
        setAppearance((prev) => ({
            ...prev,
            primary: preset.primary,
            secondary: preset.secondary,
            tertiary: preset.tertiary,
            buttonPrimary: preset.primary,
            buttonSecondary: preset.secondary,
            buttonText: "#FFFFFF",
            chartColor: preset.primary,
            fontFamily: preset.fontFamily,
            fontSize: preset.fontSize,
            fontWeight: preset.fontWeight,
            darkMode: preset.darkMode,
        }));
    };

    const lightPresets = creatorPresets.filter(p => !p.darkMode);
    const darkPresets = creatorPresets.filter(p => p.darkMode);

    return (
        <div className="space-y-8 slide-up">
            <IntegrationHeader title="Appearance & Theme" desc="Personalize color theme and typography across the dashboard." Icon={Palette} color={appearance.primary} />
            
            <Section title="Theme Modes & Presets" desc="Pick your style. Themes are separated into Light & White bases and Dark & Neon bases.">
                <div className="mb-8">
                    <label className="text-xs font-semibold mb-3 block" style={{ color: "var(--foreground)" }}>Manual Mode Override</label>
                    <div className="flex bg-[var(--glass-bg)] border border-[var(--glass-border)] p-1 rounded-2xl w-fit gap-1">
                        <button
                            type="button"
                            onClick={() => setAppearance({ ...appearance, darkMode: false })}
                            className={cn("flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300", !appearance.darkMode ? "bg-[var(--card)] dark:bg-black-800 shadow-lg scale-[1.02] text-amber-500" : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5")}
                        ><Sun className="w-4 h-4" /> Light</button>
                        <button
                            type="button"
                            onClick={() => setAppearance({ ...appearance, darkMode: true })}
                            className={cn("flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300", appearance.darkMode ? "bg-[var(--card)] dark:bg-black-800 shadow-lg scale-[1.02] text-indigo-400" : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5")}
                        ><Moon className="w-4 h-4" /> Dark</button>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* LIGHT & WHITE PRESETS SECTION */}
                    <div>
                        <h4 className="text-sm font-bold tracking-tight uppercase mb-4 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400" />
                            Light & White Presets
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {lightPresets.map((preset) => (
                                <button
                                    key={preset.name}
                                    type="button"
                                    className="group relative flex flex-col items-start overflow-hidden rounded-2xl p-5 text-left transition-all duration-500 hover:-translate-y-1 hover:shadow-xl border border-[var(--glass-border)]"
                                    style={{
                                        background: "rgba(255,255,255,0.9)",
                                        boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
                                    }}
                                    onClick={() => applyCreatorPreset(preset)}
                                >
                                    <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-40" style={{ background: preset.primary }} />
                                    <div className="flex w-full items-center justify-between gap-3 relative z-10">
                                        <div>
                                            <div className="text-base font-bold tracking-tight text-neutral-900">{preset.name}</div>
                                            <div className="text-xs font-medium mt-0.5 text-neutral-500">{preset.vibe}</div>
                                        </div>
                                        <div className="flex -space-x-1">
                                            <span className="h-6 w-6 rounded-full border-2 border-white shadow-sm z-30" style={{ background: preset.primary }} />
                                            <span className="h-6 w-6 rounded-full border-2 border-white shadow-sm z-20" style={{ background: preset.secondary }} />
                                            <span className="h-6 w-6 rounded-full border-2 border-white shadow-sm z-10" style={{ background: preset.tertiary }} />
                                        </div>
                                    </div>
                                    <div className="mt-6 flex w-full items-center justify-between relative z-10">
                                        <div className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-600">
                                            {preset.fontFamily.split(",")[0]}
                                        </div>
                                        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 border bg-white border-neutral-200 text-neutral-800">
                                            <div className="h-2 w-2 rounded-full bg-amber-500" /> {preset.mode}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* DARK & NEON PRESETS SECTION */}
                    <div>
                        <h4 className="text-sm font-bold tracking-tight uppercase mb-4 flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                            <span className="inline-block w-2.5 h-2.5 rounded-full bg-indigo-500" />
                            Dark & Neon Presets
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                            {darkPresets.map((preset) => (
                                <button
                                    key={preset.name}
                                    type="button"
                                    className="group relative flex flex-col items-start overflow-hidden rounded-2xl p-5 text-left transition-all duration-500 hover:-translate-y-1 hover:shadow-xl border border-[var(--glass-border)]"
                                    style={{
                                        background: "rgba(15,15,20,0.95)",
                                        boxShadow: "0 4px 20px rgba(0,0,0,0.3)"
                                    }}
                                    onClick={() => applyCreatorPreset(preset)}
                                >
                                    <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-40" style={{ background: preset.primary }} />
                                    <div className="flex w-full items-center justify-between gap-3 relative z-10">
                                        <div>
                                            <div className="text-base font-bold tracking-tight text-white">{preset.name}</div>
                                            <div className="text-xs font-medium mt-0.5 text-neutral-400">{preset.vibe}</div>
                                        </div>
                                        <div className="flex -space-x-1">
                                            <span className="h-6 w-6 rounded-full border-2 border-neutral-900 shadow-sm z-30" style={{ background: preset.primary }} />
                                            <span className="h-6 w-6 rounded-full border-2 border-neutral-900 shadow-sm z-20" style={{ background: preset.secondary }} />
                                            <span className="h-6 w-6 rounded-full border-2 border-neutral-900 shadow-sm z-10" style={{ background: preset.tertiary }} />
                                        </div>
                                    </div>
                                    <div className="mt-6 flex w-full items-center justify-between relative z-10">
                                        <div className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-white/10 text-neutral-300">
                                            {preset.fontFamily.split(",")[0]}
                                        </div>
                                        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 border border-neutral-800 bg-neutral-900 text-white">
                                            <div className="h-2 w-2 rounded-full bg-indigo-500" /> {preset.mode}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </Section>
            <Section title="Typography" desc="Customize font family, size, and weight.">
                <div className="flex flex-wrap gap-6 items-center">
                    <div>
                        <label className="text-xs font-semibold mb-1 block">Font Family</label>
                        <select value={appearance.fontFamily} onChange={(e) => setAppearance({ ...appearance, fontFamily: e.target.value })} className="px-2 py-1 rounded border text-xs">
                            {fontOptions.map((font) => (<option key={font} value={font}>{font.split(",")[0]}</option>))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-semibold mb-1 block">Font Size</label>
                        <input type="number" min={12} max={32} value={appearance.fontSize} onChange={(e) => setAppearance({ ...appearance, fontSize: Number(e.target.value) })} className="w-16 px-2 py-1 rounded border text-xs" /> px
                    </div>
                    <div>
                        <label className="text-xs font-semibold mb-1 block">Font Weight</label>
                        <select value={appearance.fontWeight} onChange={(e) => setAppearance({ ...appearance, fontWeight: Number(e.target.value) })} className="px-2 py-1 rounded border text-xs">
                            <option value={400}>Regular</option>
                            <option value={500}>Medium</option>
                            <option value={600}>SemiBold</option>
                            <option value={700}>Bold</option>
                        </select>
                    </div>
                </div>
            </Section>
            <Section title="Live Preview" desc="See your changes in real time.">
                <div className="rounded-2xl p-8 flex flex-col items-center justify-center transition-all duration-500 w-full" style={{
                    background: "var(--card)",
                    border: `1px solid ${appearancePreview.primary}22`,
                    borderRadius: 16,
                    boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
                    fontFamily: appearancePreview.fontFamily,
                    fontSize: appearancePreview.fontSize,
                    fontWeight: appearancePreview.fontWeight,
                    color: appearancePreview.darkMode ? "#fff" : "#23272F",
                    transition: "all 0.5s cubic-bezier(.4,0,.2,1)",
                }}>
                    <div className="flex gap-3 mb-4">
                        <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: appearancePreview.secondary, color: getContrastTextColor(appearancePreview.secondary) }}>Primary</span>
                        <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: appearancePreview.tertiary, color: getContrastTextColor(appearancePreview.tertiary) }}>Accent</span>
                    </div>
                    <div className="text-lg font-bold mb-2">Live Preview Panel</div>
                    <div className="text-sm mb-2">Only theme colors and fonts are customized.</div>
                    <div className="flex gap-2 mt-2">
                        <button className="px-4 py-2 rounded-xl font-semibold" style={{ background: `linear-gradient(135deg, ${appearancePreview.primary} 0%, ${appearancePreview.secondary} 100%)`, color: getGradientContrastTextColor(appearancePreview.primary, appearancePreview.secondary) }}>Button</button>
                        <button className="px-4 py-2 rounded-xl font-semibold" style={{ background: appearancePreview.tertiary, color: getContrastTextColor(appearancePreview.tertiary) }}>Accent</button>
                    </div>
                </div>
            </Section>
            <div className="flex items-center gap-4 mt-6">
                <button
                    type="button"
                    className="px-4 py-2 rounded-xl font-semibold"
                    style={{ background: `linear-gradient(135deg, ${appearance.primary} 0%, ${appearance.secondary} 100%)`, color: getGradientContrastTextColor(appearance.primary, appearance.secondary) }}
                    onClick={() => {
                        setAppearance(DEFAULT_APPEARANCE);
                        setAppearancePreview(DEFAULT_APPEARANCE);
                        applyAppearanceVariables(DEFAULT_APPEARANCE);
                        saveAppearance(DEFAULT_APPEARANCE);
                    }}
                >Reset to Default</button>
                <button
                    type="button"
                    className="px-4 py-2 rounded-xl font-semibold"
                    style={{ background: `linear-gradient(135deg, ${appearance.primary} 0%, ${appearance.secondary} 100%)`, color: getGradientContrastTextColor(appearance.primary, appearance.secondary) }}
                    onClick={async () => {
                        setAppearancePreview(appearance);
                        applyAppearanceVariables(appearance);
                        saveAppearance(appearance);
                        try {
                            await dispatch(updateGeneralSettings({
                                theme: appearance,
                            })).unwrap();
                            dispatch(fetchGeneralSettings({}));
                        } catch (err: any) {
                            const msg = typeof err === 'string' ? err : err?.message || "Failed to save appearance";
                            showModal("error", "Error", msg);
                            return;
                        }
                        showModal("success", "Appearance Saved", "Theme applied across your dashboard panels.");
                    }}
                >Save Changes</button>
            </div>
        </div>
    );
}