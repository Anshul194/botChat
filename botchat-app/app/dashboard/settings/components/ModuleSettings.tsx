"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/store/store";
import { updateGeneralSettings, fetchGeneralSettings } from "@/store/slices/settingsSlice";
import { useTenantSettings } from "@/providers/TenantSettingsProvider";
import { Section, IntegrationHeader } from "./shared-ui";
import { Save, Check } from "lucide-react";

interface ModuleConfig {
    [key: string]: any;
}

const MODULE_DEFAULTS: Record<string, ModuleConfig> = {
    "smart-inbox": {
        working_hours_enabled: false,
        working_hours_start: "09:00",
        working_hours_end: "17:00",
        working_days: ["mon", "tue", "wed", "thu", "fri"],
        notification_sound: true,
        auto_close_hours: 0,
        default_timezone: "UTC",
    },
    "broadcast": {
        batch_size: 50,
        delay_seconds: 3,
        daily_limit: 1000,
        retry_count: 3,
    },
    "social-posting": {
        default_timezone: "UTC",
        default_schedule_time: "09:00",
        watermark_enabled: false,
        default_utm_source: "social",
        default_utm_medium: "post",
    },
};

interface ModuleSettingsProps {
    module: string;
    title: string;
    icon: any;
    color: string;
}

export default function ModuleSettings({ module, title, icon: Icon, color }: ModuleSettingsProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { settings } = useTenantSettings();
    const defaults = MODULE_DEFAULTS[module] || {};
    const configKey = `${module}_config`;

    const [form, setForm] = useState<ModuleConfig>({ ...defaults });
    const [saving, setSaving] = useState(false);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        if (settings && !loaded) {
            const saved = (settings as any)[configKey];
            if (saved && typeof saved === 'object') {
                setForm({ ...defaults, ...saved });
            }
            setLoaded(true);
        }
    }, [settings, configKey, defaults, loaded]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await dispatch(updateGeneralSettings({
                [configKey]: form,
            } as any));
            dispatch(fetchGeneralSettings({}));
        } catch (err) {
            console.error("Failed to save", module, "settings:", err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 slide-up">
            <IntegrationHeader title={title} desc={`Configure ${title.toLowerCase()} behaviour for your workspace.`} Icon={Icon} color={color} />
            <form onSubmit={handleSave}>
                <Section title={`${title} Configuration`}>
                    {module === "smart-inbox" && (
                        <div className="space-y-5">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Working Hours</p>
                                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Only reply during business hours</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer"
                                        checked={form.working_hours_enabled}
                                        onChange={(e) => setForm({ ...form, working_hours_enabled: e.target.checked })} />
                                    <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                                        style={{ background: form.working_hours_enabled ? color : "var(--glass-border)" }} />
                                </label>
                            </div>
                            {form.working_hours_enabled && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2" style={{ borderColor: color }}>
                                    <div>
                                        <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--foreground)" }}>Start Time</label>
                                        <input type="time" value={form.working_hours_start}
                                            onChange={(e) => setForm({ ...form, working_hours_start: e.target.value })}
                                            className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                                            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--foreground)" }}>End Time</label>
                                        <input type="time" value={form.working_hours_end}
                                            onChange={(e) => setForm({ ...form, working_hours_end: e.target.value })}
                                            className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                                            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }} />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--foreground)" }}>Auto-close After (hours)</label>
                                        <input type="number" min="0" value={form.auto_close_hours}
                                            onChange={(e) => setForm({ ...form, auto_close_hours: parseInt(e.target.value) || 0 })}
                                            className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                                            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Notification Sound</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" className="sr-only peer"
                                                checked={form.notification_sound}
                                                onChange={(e) => setForm({ ...form, notification_sound: e.target.checked })} />
                                            <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                                                style={{ background: form.notification_sound ? color : "var(--glass-border)" }} />
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {module === "broadcast" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--foreground)" }}>Batch Size</label>
                                <input type="number" min="1" max="500" value={form.batch_size}
                                    onChange={(e) => setForm({ ...form, batch_size: parseInt(e.target.value) || 50 })}
                                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                                    style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }} />
                                <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>Messages per batch</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--foreground)" }}>Delay (seconds)</label>
                                <input type="number" min="0" max="60" step="0.5" value={form.delay_seconds}
                                    onChange={(e) => setForm({ ...form, delay_seconds: parseFloat(e.target.value) || 3 })}
                                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                                    style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }} />
                                <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>Delay between each message</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--foreground)" }}>Daily Limit</label>
                                <input type="number" min="0" value={form.daily_limit}
                                    onChange={(e) => setForm({ ...form, daily_limit: parseInt(e.target.value) || 1000 })}
                                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                                    style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }} />
                                <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>Max messages per day (0 = unlimited)</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--foreground)" }}>Retry Count</label>
                                <input type="number" min="0" max="10" value={form.retry_count}
                                    onChange={(e) => setForm({ ...form, retry_count: parseInt(e.target.value) || 3 })}
                                    className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                                    style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }} />
                                <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>Number of retry attempts on failure</p>
                            </div>
                        </div>
                    )}

                    {module === "social-posting" && (
                        <div className="space-y-5">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--foreground)" }}>Default Timezone</label>
                                    <select value={form.default_timezone}
                                        onChange={(e) => setForm({ ...form, default_timezone: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                                        style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}>
                                        <option value="UTC">UTC</option>
                                        <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                                        <option value="America/New_York">America/New_York (EST)</option>
                                        <option value="Europe/London">Europe/London (GMT)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--foreground)" }}>Default Schedule Time</label>
                                    <input type="time" value={form.default_schedule_time}
                                        onChange={(e) => setForm({ ...form, default_schedule_time: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                                        style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }} />
                                </div>
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Image Watermark</p>
                                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Overlay watermark on posted images</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer"
                                        checked={form.watermark_enabled}
                                        onChange={(e) => setForm({ ...form, watermark_enabled: e.target.checked })} />
                                    <div className="w-11 h-6 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"
                                        style={{ background: form.watermark_enabled ? color : "var(--glass-border)" }} />
                                </label>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--foreground)" }}>Default UTM Source</label>
                                    <input type="text" value={form.default_utm_source}
                                        onChange={(e) => setForm({ ...form, default_utm_source: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                                        style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }} />
                                </div>
                                <div>
                                    <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--foreground)" }}>Default UTM Medium</label>
                                    <input type="text" value={form.default_utm_medium}
                                        onChange={(e) => setForm({ ...form, default_utm_medium: e.target.value })}
                                        className="w-full px-3 py-2 rounded-xl text-sm outline-none"
                                        style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }} />
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end">
                        <button type="submit" disabled={saving}
                            className="flex w-full items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-sm sm:w-auto"
                            style={{ background: "var(--brand-gradient)", color: "white", opacity: saving ? 0.7 : 1 }}>
                            <Check className="w-4 h-4" /> {saving ? "Saving..." : "Save Settings"}
                        </button>
                    </div>
                </Section>
            </form>
        </div>
    );
}
