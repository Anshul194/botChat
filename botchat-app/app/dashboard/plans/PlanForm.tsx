"use client";

import { useState, useEffect, useMemo } from "react";
import {
    ArrowLeft, Save, Loader2, CheckCircle,
    Zap, Settings2, Wifi, Tag, DollarSign,
    Facebook, Instagram, Smartphone, Send, AlertCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";

// ── Types ──────────────────────────────────────────────────────────

interface FeatureDefinition {
    label: string;
    type: "toggle" | "limit";
    group: string;
    default: string;
    default_type?: "fixed" | "monthly";
}
interface FeatureDefinitions {
    [key: string]: FeatureDefinition;
}

const GROUP_LABELS: Record<string, string> = {
    platform:  "Messaging Channels",
    core:      "Core Limits",
    chat:      "Smart Inbox",
    bot:       "Bot Capabilities",
    campaign:  "Campaigns & Automation",
    links:     "Link Builder",
    analytics: "Analytics",
    developer: "Developer & API",
};

const GROUP_ORDER = ["platform", "core", "chat", "bot", "campaign", "links", "analytics", "developer"];

const CHANNEL_ICONS: Record<string, React.ElementType> = {
    whatsapp:  Smartphone,
    telegram:  Send,
    facebook:  Facebook,
    instagram: Instagram,
};
const CHANNEL_COLORS: Record<string, string> = {
    whatsapp:  "text-green-500",
    telegram:  "text-blue-400",
    facebook:  "text-blue-600",
    instagram: "text-pink-500",
};

// ── Initial form base ──────────────────────────────────────────────

const INITIAL_BASE = {
    name: "",
    price: "",
    duration: "30",
    duration_type: "day",
    description: "",
    status: true,
    is_highlighted: false,
    discount: 0,
    discount_terms: "",
    discount_start: "",
    discount_end: "",
    discount_status: false,
    apply_to_other_packages: "no",
};

// ── Infinity icon inline (avoid lucide import collision) ───────────

function InfinityIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 12c-2-2.5-4-4-6-4a4 4 0 0 0 0 8c2 0 4-1.5 6-4z"/>
            <path d="M12 12c2 2.5 4 4 6 4a4 4 0 0 0 0-8c-2 0-4 1.5-6 4z"/>
        </svg>
    );
}

// ── Component ──────────────────────────────────────────────────────

interface PlanFormProps {
    initialData?: any;
    isSubmitting?: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
}

export default function PlanForm({ initialData, isSubmitting, onClose, onSubmit }: PlanFormProps) {
    const [definitions, setDefinitions] = useState<FeatureDefinitions>({});
    const [defsLoading, setDefsLoading] = useState(true);
    const [defsError, setDefsError]     = useState<string | null>(null);
    const [formData, setFormData]       = useState<any>({ ...INITIAL_BASE, features: {} });
    const [activeTab, setActiveTab]     = useState<"general" | "channels" | "features" | "discount">("general");
    const [unlimitedKeys, setUnlimitedKeys] = useState<Set<string>>(new Set());

    // Load definitions from backend
    useEffect(() => {
        setDefsLoading(true);
        api.get("/plans/definitions")
            .then(res => {
                const defs: FeatureDefinitions = res.data?.data ?? res.data ?? {};
                setDefinitions(defs);
                const defaults: Record<string, string> = {};
                Object.entries(defs).forEach(([key, def]) => {
                    defaults[key] = def.default;
                });
                setFormData((prev: any) => ({
                    ...prev,
                    features: { ...defaults, ...(prev.features ?? {}) },
                }));
            })
            .catch(() => setDefsError("Could not load plan feature definitions. Please refresh."))
            .finally(() => setDefsLoading(false));
    }, []);

    // Populate form when editing
    useEffect(() => {
        if (!initialData || Object.keys(definitions).length === 0) return;
        const features: Record<string, string> = {};
        Object.entries(definitions).forEach(([key, def]) => { features[key] = def.default; });
        if (initialData.features) {
            Object.keys(initialData.features).forEach(k => {
                const v = initialData.features[k];
                features[k] = typeof v === "object" && v !== null ? String(v.value) : String(v);
            });
        }
        const unlimited = new Set<string>();
        Object.entries(features).forEach(([key, val]) => {
            if (val === "-1" && definitions[key]?.type === "limit") unlimited.add(key);
        });
        setUnlimitedKeys(unlimited);
        setFormData({
            name:                    initialData.name || "",
            price:                   initialData.price || "",
            duration:                initialData.duration || "30",
            duration_type:           (initialData.duration_type || "day").toLowerCase(),
            description:             initialData.description || "",
            status:                  initialData.status ?? true,
            is_highlighted:          initialData.is_highlighted ?? false,
            discount:                initialData.discount || 0,
            discount_terms:          initialData.discount_terms || "",
            discount_start:          initialData.discount_start || "",
            discount_end:            initialData.discount_end || "",
            discount_status:         initialData.discount_status ?? false,
            apply_to_other_packages: initialData.apply_to_other_packages || "no",
            features,
        });
    }, [initialData, definitions]);

    const setFeature = (key: string, val: string) =>
        setFormData((p: any) => ({ ...p, features: { ...p.features, [key]: val } }));

    const toggleUnlimited = (key: string) => {
        setUnlimitedKeys(prev => {
            const next = new Set(prev);
            if (next.has(key)) {
                next.delete(key);
                setFeature(key, definitions[key]?.default ?? "0");
            } else {
                next.add(key);
                setFeature(key, "-1");
            }
            return next;
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    const featuresByGroup = useMemo(() => {
        const groups: Record<string, Array<[string, FeatureDefinition]>> = {};
        Object.entries(definitions).forEach(([key, def]) => {
            if (key === "live_chat") return; // legacy alias — hidden
            const g = def.group || "other";
            if (!groups[g]) groups[g] = [];
            groups[g].push([key, def]);
        });
        return groups;
    }, [definitions]);

    const isEdit = !!initialData;
    const tabs = [
        { id: "general",  label: "General",  icon: Settings2 },
        { id: "channels", label: "Channels", icon: Wifi },
        { id: "features", label: "Features", icon: Zap },
        { id: "discount", label: "Discount", icon: Tag },
    ] as const;

    return (
        <div className="min-h-screen bg-background">
            {/* Top Bar */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                        <Button variant="ghost" size="sm" onClick={onClose}
                            className="gap-2 text-muted-foreground hover:text-foreground font-medium shrink-0">
                            <ArrowLeft className="w-4 h-4" />
                            <span className="hidden xs:inline">Plans</span>
                        </Button>
                        <span className="text-muted-foreground shrink-0">/</span>
                        <span className="text-sm font-semibold truncate min-w-0">
                            {isEdit ? `Edit: ${initialData?.name}` : "New Plan"}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                        <Badge variant="outline" className={cn(
                            "hidden text-xs font-medium sm:inline-flex",
                            formData.status
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800"
                                : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800"
                        )}>
                            {formData.status ? "Active" : "Draft"}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={onClose} className="font-medium">Cancel</Button>
                        <Button size="sm" onClick={handleSubmit} disabled={isSubmitting || defsLoading}
                            className="gap-2 font-medium min-w-[110px]">
                            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            {isEdit ? "Save Changes" : "Create Plan"}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                        {isEdit ? "Edit Subscription Plan" : "Create Subscription Plan"}
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        {isEdit ? "Update plan details, features, and pricing."
                                : "Set up pricing, features, and availability for your new plan."}
                    </p>
                </div>

                {defsError && (
                    <div className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <span>{defsError}</span>
                    </div>
                )}

                <div className="flex flex-col gap-6 md:flex-row md:gap-8">
                    {/* Tab Nav */}
                    <div className="w-full md:w-48 md:shrink-0">
                        <nav className="flex gap-2 overflow-x-auto no-scrollbar pb-1 md:flex-col md:space-y-1 md:overflow-visible md:pb-0 md:sticky md:top-24">
                            {tabs.map(tab => (
                                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "flex shrink-0 items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left md:w-full",
                                        activeTab === tab.id
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                    )}>
                                    <tab.icon className="w-4 h-4 shrink-0" />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            <motion.div key={activeTab}
                                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.15 }}>

                                {/* ── General ── */}
                                {activeTab === "general" && (
                                    <div className="space-y-6">
                                        <Section title="Plan Details" description="Basic information about this subscription plan.">
                                            <Field label="Plan Name" required>
                                                <Input placeholder="e.g. Pro, Business, Enterprise"
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })} />
                                            </Field>
                                            <Field label="Description">
                                                <Textarea placeholder="Briefly describe what this plan offers..."
                                                    value={formData.description}
                                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                    className="resize-none" rows={3} />
                                            </Field>
                                        </Section>

                                        <Section title="Pricing" description="Set the billing amount and cycle for this plan.">
                                            <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                                                <Field label="Price (INR)" required>
                                                    <div className="relative">
                                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                        <Input type="number" placeholder="0.00" className="pl-9"
                                                            value={formData.price}
                                                            onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                                    </div>
                                                </Field>
                                                <Field label="Billing Cycle" required>
                                                    <div className="flex gap-2">
                                                        <Input type="number" placeholder="30" className="w-24 shrink-0"
                                                            value={formData.duration}
                                                            onChange={e => setFormData({ ...formData, duration: e.target.value })} />
                                                        <select value={formData.duration_type}
                                                            onChange={e => setFormData({ ...formData, duration_type: e.target.value })}
                                                            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                                            <option value="day">Day(s)</option>
                                                            <option value="week">Week(s)</option>
                                                            <option value="month">Month(s)</option>
                                                            <option value="year">Year(s)</option>
                                                        </select>
                                                    </div>
                                                </Field>
                                            </div>
                                        </Section>

                                        <Section title="Visibility" description="Control how and where this plan appears.">
                                            <div className="space-y-4">
                                                <ToggleRow label="Active" description="Make this plan available for new subscriptions."
                                                    checked={formData.status} onChange={v => setFormData({ ...formData, status: v })} />
                                                <ToggleRow label="Featured" description="Highlight this plan on the pricing page as recommended."
                                                    checked={formData.is_highlighted} onChange={v => setFormData({ ...formData, is_highlighted: v })} />
                                            </div>
                                        </Section>
                                    </div>
                                )}

                                {/* ── Channels ── */}
                                {activeTab === "channels" && (
                                    <div className="space-y-6">
                                        {defsLoading ? <SkeletonSection rows={4} /> : (
                                            <Section title="Messaging Channels" description="Enable the platforms included in this plan.">
                                                <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
                                                    {(featuresByGroup["platform"] ?? []).map(([key, def]) => {
                                                        const active = formData.features[key] === "1";
                                                        const Icon = CHANNEL_ICONS[key] ?? Wifi;
                                                        const color = CHANNEL_COLORS[key] ?? "";
                                                        return (
                                                            <div key={key} className="flex items-center justify-between px-4 py-3 bg-card">
                                                                <div className="flex items-center gap-3">
                                                                    <Icon className={cn("w-5 h-5", color)} />
                                                                    <p className="text-sm font-medium">{def.label}</p>
                                                                </div>
                                                                <Switch checked={active} onCheckedChange={v => setFeature(key, v ? "1" : "0")} />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </Section>
                                        )}
                                    </div>
                                )}

                                {/* ── Features ── */}
                                {activeTab === "features" && (
                                    <div className="space-y-6">
                                        {defsLoading ? (
                                            <>
                                                <SkeletonSection rows={3} />
                                                <SkeletonSection rows={5} />
                                                <SkeletonSection rows={4} />
                                            </>
                                        ) : (
                                            GROUP_ORDER.filter(g => g !== "platform" && featuresByGroup[g]?.length).map(group => {
                                                const entries = featuresByGroup[group] ?? [];
                                                const toggles = entries.filter(([, d]) => d.type === "toggle");
                                                const limits  = entries.filter(([, d]) => d.type === "limit");
                                                return (
                                                    <Section key={group} title={GROUP_LABELS[group] ?? group}>
                                                        {limits.length > 0 && (
                                                            <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 mb-4">
                                                                {limits.map(([key, def]) => {
                                                                    const isUnlim = unlimitedKeys.has(key);
                                                                    const val = formData.features[key] ?? def.default;
                                                                    return (
                                                                        <div key={key} className="rounded-lg border border-border p-4 bg-card space-y-2">
                                                                            <div className="flex items-center justify-between">
                                                                                <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                                                                    {def.label}
                                                                                    {def.default_type === "monthly" && (
                                                                                        <span className="ml-1.5 text-[10px] font-normal normal-case text-primary">/mo</span>
                                                                                    )}
                                                                                </Label>
                                                                                <button type="button" onClick={() => toggleUnlimited(key)}
                                                                                    title={isUnlim ? "Set a specific limit" : "Set to Unlimited"}
                                                                                    className={cn("p-1 rounded transition-colors",
                                                                                        isUnlim ? "text-primary bg-primary/10" : "text-muted-foreground hover:text-foreground")}>
                                                                                    <InfinityIcon className="w-3.5 h-3.5" />
                                                                                </button>
                                                                            </div>
                                                                            {isUnlim ? (
                                                                                <div className="flex items-center h-9 px-3 rounded-md border border-dashed border-primary/40 bg-primary/5 text-primary text-sm font-medium">
                                                                                    Unlimited
                                                                                </div>
                                                                            ) : (
                                                                                <Input type="number" min="0"
                                                                                    value={val === "-1" ? "" : val}
                                                                                    onChange={e => setFeature(key, e.target.value)}
                                                                                    className="font-semibold" placeholder="0" />
                                                                            )}
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                        {toggles.length > 0 && (
                                                            <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
                                                                {toggles.map(([key, def]) => {
                                                                    const active = formData.features[key] === "1";
                                                                    return (
                                                                        <div key={key} className="flex items-center justify-between px-4 py-3 bg-card">
                                                                            <p className="text-sm font-medium">{def.label}</p>
                                                                            <Switch checked={active} onCheckedChange={v => setFeature(key, v ? "1" : "0")} />
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </Section>
                                                );
                                            })
                                        )}
                                    </div>
                                )}

                                {/* ── Discount ── */}
                                {activeTab === "discount" && (
                                    <div className="space-y-6">
                                        <Section title="Promotional Discount" description="Offer a time-limited discount on this plan.">
                                            <ToggleRow label="Enable Discount" description="Activate a promotional discount for this plan."
                                                checked={formData.discount_status}
                                                onChange={v => setFormData({ ...formData, discount_status: v })} />
                                            <AnimatePresence>
                                                {formData.discount_status && (
                                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                                        <div className="space-y-4 pt-4 border-t border-border mt-4">
                                                            <Field label="Discount (%)" required>
                                                                <div className="relative">
                                                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                                    <Input type="number" placeholder="e.g. 20" className="pl-9"
                                                                        min={0} max={100} value={formData.discount}
                                                                        onChange={e => setFormData({ ...formData, discount: parseInt(e.target.value) || 0 })} />
                                                                </div>
                                                            </Field>
                                                            <div className="grid grid-cols-1 xs:grid-cols-2 gap-4">
                                                                <Field label="Start Date">
                                                                    <Input type="date" value={formData.discount_start}
                                                                        onChange={e => setFormData({ ...formData, discount_start: e.target.value })} />
                                                                </Field>
                                                                <Field label="End Date">
                                                                    <Input type="date" value={formData.discount_end}
                                                                        onChange={e => setFormData({ ...formData, discount_end: e.target.value })} />
                                                                </Field>
                                                            </div>
                                                            <Field label="Terms & Conditions">
                                                                <Input placeholder="e.g. Valid for annual subscribers only"
                                                                    value={formData.discount_terms}
                                                                    onChange={e => setFormData({ ...formData, discount_terms: e.target.value })} />
                                                            </Field>
                                                            <Field label="Apply to Existing Packages">
                                                                <select value={formData.apply_to_other_packages}
                                                                    onChange={e => setFormData({ ...formData, apply_to_other_packages: e.target.value })}
                                                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                                                    <option value="no">No — new subscribers only</option>
                                                                    <option value="yes">Yes — all subscribers</option>
                                                                </select>
                                                            </Field>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </Section>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>

                        {/* Bottom action bar */}
                        <div className="flex flex-col-reverse gap-3 pt-6 mt-6 border-t border-border sm:flex-row sm:items-center sm:justify-between">
                            <Button variant="ghost" onClick={onClose} className="w-full text-muted-foreground sm:w-auto">Cancel</Button>
                            <Button onClick={handleSubmit} disabled={isSubmitting || defsLoading} className="w-full gap-2 min-w-[130px] sm:w-auto">
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                {isEdit ? "Save Changes" : "Create Plan"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Sub-components ─────────────────────────────────────────────────

function Section({ title, description, children }: {
    title: string; description?: string; children: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4">
            <div className="space-y-1 pb-2 border-b border-border">
                <h3 className="text-sm font-semibold">{title}</h3>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </div>
            {children}
        </div>
    );
}

function Field({ label, required, children }: {
    label: string; required?: boolean; children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <Label className="text-sm font-medium">
                {label}{required && <span className="text-destructive ml-0.5">*</span>}
            </Label>
            {children}
        </div>
    );
}

function ToggleRow({ label, description, checked, onChange }: {
    label: string; description: string; checked: boolean; onChange: (v: boolean) => void;
}) {
    return (
        <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <Switch checked={checked} onCheckedChange={onChange} />
        </div>
    );
}

function SkeletonSection({ rows }: { rows: number }) {
    return (
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 space-y-4 animate-pulse">
            <div className="h-4 w-32 bg-muted rounded" />
            <div className="space-y-3">
                {Array.from({ length: rows }).map((_, i) => (
                    <div key={i} className="h-10 bg-muted rounded-lg" />
                ))}
            </div>
        </div>
    );
}
