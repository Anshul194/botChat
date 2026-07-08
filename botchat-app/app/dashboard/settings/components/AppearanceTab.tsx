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
    "Inter, sans-serif", "Poppins, sans-serif", "Montserrat, sans-serif",
    "Nunito, sans-serif", "Roboto, sans-serif", "Open Sans, sans-serif",
    "Lato, sans-serif", "Raleway, sans-serif", "DM Sans, sans-serif",
    "Manrope, sans-serif", "Mulish, sans-serif", "Work Sans, sans-serif",
    "Urbanist, sans-serif", "Source Sans Pro, sans-serif", "PT Sans, sans-serif",
    "Merriweather, serif", "Playfair Display, serif", "Lora, serif",
    "Libre Baskerville, serif", "Fira Sans, sans-serif", "IBM Plex Sans, sans-serif",
    "Josefin Sans, sans-serif",
];

const creatorPresets = [
    // LIGHT GROUP
    { name: "Reels Pop", vibe: "Bold creator funnel", mode: "Light", primary: "#FF4D6D", secondary: "#7C3AED", tertiary: "#2DD4BF", fontFamily: "Poppins, sans-serif", fontSize: 16, fontWeight: 600, darkMode: false },
    { name: "Nordic Minimal", vibe: "Clean, organic, airy", mode: "Light", primary: "#4A5568", secondary: "#A0AEC0", tertiary: "#E2E8F0", fontFamily: "Inter, sans-serif", fontSize: 15, fontWeight: 400, darkMode: false },
    { name: "Matcha Zen", vibe: "Peaceful holistic brand", mode: "Light", primary: "#7C9082", secondary: "#E8EAE6", tertiary: "#D6E5D8", fontFamily: "Nunito, sans-serif", fontSize: 16, fontWeight: 500, darkMode: false },
    { name: "Neobrutalism", vibe: "Bold startup energy", mode: "Light", primary: "#000000", secondary: "#FF90E8", tertiary: "#FFC900", fontFamily: "IBM Plex Sans, sans-serif", fontSize: 16, fontWeight: 700, darkMode: false },
    { name: "Golden Hour", vibe: "Warm photography portfolio", mode: "Light", primary: "#F6A867", secondary: "#D7816A", tertiary: "#F4EBD9", fontFamily: "Lora, serif", fontSize: 17, fontWeight: 500, darkMode: false },
    { name: "Soft Editorial", vibe: "Course creator aesthetic", mode: "Light", primary: "#2563EB", secondary: "#EC4899", tertiary: "#14B8A6", fontFamily: "Playfair Display, serif", fontSize: 17, fontWeight: 600, darkMode: false },
    { name: "Growth Mint", vibe: "Clean coaching brand", mode: "Light", primary: "#0EA5A4", secondary: "#2563EB", tertiary: "#F97316", fontFamily: "Nunito, sans-serif", fontSize: 17, fontWeight: 600, darkMode: false },
    { name: "Creator Luxe", vibe: "Elegant product launch", mode: "Light", primary: "#BE185D", secondary: "#9333EA", tertiary: "#F59E0B", fontFamily: "Roboto, sans-serif", fontSize: 16, fontWeight: 500, darkMode: false },
    // DARK GROUP
    { name: "Midnight Studio", vibe: "Premium dark creator", mode: "Dark", primary: "#8B5CF6", secondary: "#06B6D4", tertiary: "#F59E0B", fontFamily: "Montserrat, sans-serif", fontSize: 16, fontWeight: 500, darkMode: true },
    { name: "Cyberpunk 2077", vibe: "High contrast neon glow", mode: "Dark", primary: "#FCE205", secondary: "#FF003C", tertiary: "#00FF9F", fontFamily: "Urbanist, sans-serif", fontSize: 16, fontWeight: 700, darkMode: true },
    { name: "Velvet Royal", vibe: "Luxurious & elegant", mode: "Dark", primary: "#D4AF37", secondary: "#4A0404", tertiary: "#800020", fontFamily: "Playfair Display, serif", fontSize: 17, fontWeight: 600, darkMode: true },
    { name: "Aurora Borealis", vibe: "Northern lights gradient", mode: "Dark", primary: "#4ade80", secondary: "#818cf8", tertiary: "#c084fc", fontFamily: "Manrope, sans-serif", fontSize: 16, fontWeight: 600, darkMode: true },
    { name: "Ocean Depths", vibe: "Tech and SaaS scale", mode: "Dark", primary: "#0EA5E9", secondary: "#0369A1", tertiary: "#38BDF8", fontFamily: "DM Sans, sans-serif", fontSize: 16, fontWeight: 500, darkMode: true },
    { name: "Sunset Drive", vibe: "Vibrant synthwave", mode: "Dark", primary: "#FF7E67", secondary: "#FF2A54", tertiary: "#230B48", fontFamily: "Work Sans, sans-serif", fontSize: 16, fontWeight: 600, darkMode: true },
    { name: "Monokai Dev", vibe: "Hacker / Coder aesthetic", mode: "Dark", primary: "#A6E22E", secondary: "#F92672", tertiary: "#66D9EF", fontFamily: "Fira Sans, sans-serif", fontSize: 15, fontWeight: 500, darkMode: true },
    { name: "Noir Creator", vibe: "Dark black and white focus", mode: "Dark", primary: "#E5E7EB", secondary: "#9CA3AF", tertiary: "#6B7280", fontFamily: "DM Sans, sans-serif", fontSize: 16, fontWeight: 600, darkMode: true },
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

    return (
        <div className="space-y-8 slide-up">
            <IntegrationHeader title="Appearance & Theme" desc="Personalize color theme and typography across the dashboard." Icon={Palette} color={appearance.primary} />
            <Section title="Color Customization" desc="Pick your brand colors or choose a creator-focused preset.">
                <div className="flex flex-wrap gap-6 items-center mb-4">
                    {(["primary", "secondary", "tertiary"] as const).map((key) => (
                        <div key={key} className="flex flex-col items-center">
                            <label className="text-xs font-semibold mb-1" style={{ color: "var(--foreground)" }}>
                                {key.charAt(0).toUpperCase() + key.slice(1)} Color
                            </label>
                            <input type="color" value={appearance[key]} onChange={(e) => setAppearance({ ...appearance, [key]: e.target.value })} className="w-12 h-12 rounded-full border-2 border-[var(--glass-border)]" />
                            <input type="text" value={appearance[key]} onChange={(e) => setAppearance({ ...appearance, [key]: e.target.value })} className="mt-1 w-20 px-2 py-1 rounded text-xs border" />
                        </div>
                    ))}
                </div>
                <div className="mb-6">
                    <label className="text-xs font-semibold mb-3 block" style={{ color: "var(--foreground)" }}>Dashboard Mode</label>
                    <div className="flex bg-[var(--glass-bg)] border border-[var(--glass-border)] p-1 rounded-2xl w-fit gap-1">
                        <button
                            type="button"
                            onClick={() => setAppearance({ ...appearance, darkMode: false })}
                            className={cn("flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300", !appearance.darkMode ? "bg-white dark:bg-slate-800 shadow-lg scale-[1.02] text-amber-500" : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5")}
                        ><Sun className="w-4 h-4" /> Light</button>
                        <button
                            type="button"
                            onClick={() => setAppearance({ ...appearance, darkMode: true })}
                            className={cn("flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all duration-300", appearance.darkMode ? "bg-white dark:bg-slate-800 shadow-lg scale-[1.02] text-indigo-400" : "text-muted-foreground hover:bg-black/5 dark:hover:bg-white/5")}
                        ><Moon className="w-4 h-4" /> Dark</button>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {creatorPresets.map((preset) => (
                        <button
                            key={preset.name}
                            type="button"
                            className="group relative flex flex-col items-start overflow-hidden rounded-2xl p-5 text-left transition-all duration-500 hover:-translate-y-1 hover:shadow-xl dark:hover:shadow-primary/10"
                            style={{
                                background: preset.darkMode ? "rgba(10,10,10,0.8)" : "rgba(255,255,255,0.9)",
                                border: `1px solid ${preset.darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}`,
                                boxShadow: "0 4px 20px rgba(0,0,0,0.03)"
                            }}
                            onClick={() => applyCreatorPreset(preset)}
                        >
                            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-40" style={{ background: preset.primary }} />
                            <div className="flex w-full items-center justify-between gap-3 relative z-10">
                                <div>
                                    <div className="text-base font-bold tracking-tight" style={{ color: preset.darkMode ? "#fff" : "#111" }}>{preset.name}</div>
                                    <div className="text-xs font-medium mt-0.5 opacity-60" style={{ color: preset.darkMode ? "#fff" : "#111" }}>{preset.vibe}</div>
                                </div>
                                <div className="flex -space-x-1">
                                    <span className="h-6 w-6 rounded-full border-2 border-white dark:border-black shadow-sm z-30" style={{ background: preset.primary }} />
                                    <span className="h-6 w-6 rounded-full border-2 border-white dark:border-black shadow-sm z-20" style={{ background: preset.secondary }} />
                                    <span className="h-6 w-6 rounded-full border-2 border-white dark:border-black shadow-sm z-10" style={{ background: preset.tertiary }} />
                                </div>
                            </div>
                            <div className="mt-6 flex w-full items-center justify-between relative z-10">
                                <div className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-black/5 dark:bg-white/10" style={{ color: preset.darkMode ? "#ddd" : "#444" }}>
                                    {preset.fontFamily.split(",")[0]}
                                </div>
                                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 border" style={{
                                    background: preset.mode === "Dark" ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,1)",
                                    borderColor: preset.darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                                    color: preset.darkMode ? "#fff" : "#000"
                                }}>
                                    <div className="h-2 w-2 rounded-full" style={{ background: preset.mode === "Dark" ? "#fff" : "#000" }} /> {preset.mode}
                                </span>
                            </div>
                        </button>
                    ))}
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
