"use client";

import { useState, useEffect, useMemo } from "react";
import {
    ArrowLeft, Save, Loader2, CheckCircle,
    Zap, Settings2, Wifi, Tag, DollarSign,
    Facebook, Instagram, Smartphone, Send, AlertCircle,
    Info, Search
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/currency";

// ── Types ──────────────────────────────────────────────────────────

interface FeatureDefinition {
    label: string;
    description?: string;
    unit?: string;
    tooltip?: string;
    depends_on?: string;
    type: "toggle" | "limit";
    group: string;
    default: string;
    default_type?: "fixed" | "monthly";
}
interface FeatureDefinitions {
    [key: string]: FeatureDefinition;
}

const GROUP_LABELS: Record<string, { label: string; description: string }> = {
    platform: { label: "🌐 Platform Access", description: "Messaging channels and integrations" },
    core: { label: "⚡ Core Limits", description: "Account capacities and usage quotas" },
    chat: { label: "📨 Smart Inbox", description: "Conversation management" },
    bot: { label: "🤖 Bot Capabilities", description: "Bot builder, AI and automation" },
    campaign: { label: "📢 Campaigns", description: "Broadcasting and automation" },
    links: { label: "🔗 Bio Links", description: "Landing pages and short links" },
    developer: { label: "⚙ Developer", description: "API & integrations" },
};

const GROUP_ORDER = ["core", "chat", "bot", "campaign", "links", "developer"];

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

export default function PlanForm({ initialData, isSubmitting, onClose, onSubmit }: any) {
    const [definitions, setDefinitions] = useState<FeatureDefinitions>({});
    const [defsLoading, setDefsLoading] = useState(true);
    const [defsError, setDefsError]     = useState<string | null>(null);
    const [formData, setFormData]       = useState<any>({ ...INITIAL_BASE, features: {} });
    const [activeTab, setActiveTab]     = useState<"general" | "channels" | "features" | "discount">("general");
    
    // UI states
    const [searchQuery, setSearchQuery] = useState("");
    const [isReviewOpen, setIsReviewOpen] = useState(false);

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
        setFormData({
            ...INITIAL_BASE,
            ...initialData,
            features,
        });
    }, [initialData, definitions]);

    // Validation for inputs
    const handleLimitChange = (key: string, val: string) => {
        if (val === "") {
            setFormData((p: any) => ({ ...p, features: { ...p.features, [key]: "" } }));
            return;
        }
        const num = parseInt(val);
        if (isNaN(num) || num < 0) return;
        setFormData((p: any) => ({ ...p, features: { ...p.features, [key]: String(num) } }));
    };

    const toggleUnlimited = (key: string, checked: boolean) => {
        if (checked) {
            setFormData((p: any) => ({ ...p, features: { ...p.features, [key]: "-1" } }));
        } else {
            setFormData((p: any) => ({ ...p, features: { ...p.features, [key]: definitions[key]?.default ?? "0" } }));
        }
    };

    // Calculate disabled status recursively based on dependencies
    const isFeatureDisabled = (key: string): boolean => {
        const def = definitions[key];
        if (!def?.depends_on) return false;
        
        if (formData.features[def.depends_on] === "0") return true;
        
        return isFeatureDisabled(def.depends_on);
    };

    const handleFeatureToggle = (key: string, checked: boolean) => {
        setFormData((p: any) => {
            const newFeatures = { ...p.features, [key]: checked ? "1" : "0" };
            
            if (!checked) {
                const turnOffChildren = (parentKey: string) => {
                    Object.entries(definitions).forEach(([childKey, childDef]) => {
                        if (childDef.depends_on === parentKey) {
                            if (childDef.type === "toggle") {
                                newFeatures[childKey] = "0";
                            }
                            turnOffChildren(childKey);
                        }
                    });
                };
                turnOffChildren(key);
            }
            
            return { ...p, features: newFeatures };
        });
    };

    const handleSubmit = async () => {
        setIsReviewOpen(false);
        const cleanedFeatures = { ...formData.features };
        Object.keys(cleanedFeatures).forEach(k => {
            if (cleanedFeatures[k] === "") cleanedFeatures[k] = "0";
            if (isFeatureDisabled(k)) {
                cleanedFeatures[k] = "0";
            }
        });
        await onSubmit({ ...formData, features: cleanedFeatures });
    };

    const scrollToSection = (id: string) => {
        const el = document.getElementById(`section-${id}`);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    const featuresByGroup = useMemo(() => {
        const groups: Record<string, Array<[string, FeatureDefinition]>> = {};
        const query = searchQuery.toLowerCase();
        
        Object.entries(definitions).forEach(([key, def]) => {
            if (key === "live_chat") return; // legacy
            if (query && !def.label.toLowerCase().includes(query) && !def.description?.toLowerCase().includes(query)) {
                return;
            }
            const g = def.group || "other";
            if (!groups[g]) groups[g] = [];
            groups[g].push([key, def]);
        });
        return groups;
    }, [definitions, searchQuery]);

    // Live counter stats
    const stats = useMemo(() => {
        let enabled = 0, disabled = 0, unlimited = 0, limited = 0;
        Object.entries(definitions).forEach(([key, def]) => {
            if (key === "live_chat") return;
            if (def.type === "toggle") {
                if (formData.features[key] === "1" && !isFeatureDisabled(key)) enabled++;
                else disabled++;
            } else if (def.type === "limit") {
                if (!isFeatureDisabled(key)) {
                    if (formData.features[key] === "-1") unlimited++;
                    else limited++;
                }
            }
        });
        return { enabled, disabled, unlimited, limited };
    }, [formData.features, definitions]);

    const isEdit = !!initialData;
    const tabs = [
        { id: "general",  label: "General",  icon: Settings2 },
        { id: "channels", label: "Channels", icon: Wifi },
        { id: "features", label: "Features", icon: Zap },
        { id: "discount", label: "Discount", icon: Tag },
    ] as const;

    return (
        <TooltipProvider>
            <div className="min-h-screen bg-background flex flex-col">
                {/* Top Bar */}
                <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
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
                                formData.status ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-amber-50 text-amber-700 border-amber-200"
                            )}>
                                {formData.status ? "Active" : "Draft"}
                            </Badge>
                            <Button variant="outline" size="sm" onClick={onClose} className="font-medium hidden sm:flex">Cancel</Button>
                            <Button size="sm" onClick={() => setIsReviewOpen(true)} disabled={isSubmitting || defsLoading}
                                className="gap-2 font-medium min-w-[110px]">
                                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                <span className="hidden xs:inline">Review & Save</span>
                                <span className="xs:hidden">Save</span>
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* LEFT NAV (3 cols on lg) */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="sticky top-24 space-y-8">
                            <div className="hidden lg:block">
                                <h1 className="text-2xl font-bold tracking-tight">Plan Builder</h1>
                                <p className="text-muted-foreground mt-1 text-sm">Design your subscription tier.</p>
                            </div>
                            
                            <nav className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:space-y-1 lg:pb-0 no-scrollbar">
                                {tabs.map(tab => (
                                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                                        className={cn(
                                            "flex shrink-0 items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left lg:w-full",
                                            activeTab === tab.id
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                        )}>
                                        <tab.icon className="w-4 h-4 shrink-0" />
                                        {tab.label}
                                    </button>
                                ))}
                            </nav>

                            {/* Sticky Features Jump Nav */}
                            <AnimatePresence>
                                {activeTab === "features" && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="hidden lg:block space-y-1 pt-4 border-t border-border">
                                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-3">Sections</p>
                                        {GROUP_ORDER.filter(g => featuresByGroup[g]?.length).map(group => (
                                            <button key={group} onClick={() => scrollToSection(group)}
                                                className="w-full text-left px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors truncate">
                                                {GROUP_LABELS[group]?.label.replace(/[^a-zA-Z\s]/g, '') || group}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* MAIN FORM (6 cols on lg) */}
                    <div className="lg:col-span-6 min-w-0 pb-20">
                        {defsError && (
                            <div className="mb-6 flex items-start gap-3 rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>{defsError}</span>
                            </div>
                        )}

                        <AnimatePresence mode="wait">
                            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}>
                                
                                {/* ── General ── */}
                                {activeTab === "general" && (
                                    <div className="space-y-8">
                                        <Section title="Plan Details" description="Basic information about this subscription plan.">
                                            <Field label="Plan Name" required>
                                                <Input placeholder="e.g. Professional" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="max-w-md" />
                                            </Field>
                                            <Field label="Description">
                                                <Textarea placeholder="Briefly describe what this plan offers..." value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="resize-none" rows={3} />
                                            </Field>
                                        </Section>

                                        <Section title="Pricing" description="Set the billing amount and cycle.">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-xl">
                                                <Field label="Price" required>
                                                    <div className="relative">
                                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                        <Input type="number" placeholder="0" className="pl-9 font-semibold" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                                    </div>
                                                </Field>
                                                <Field label="Billing Cycle" required>
                                                    <div className="flex gap-2">
                                                        <Input type="number" placeholder="30" className="w-20 shrink-0 text-center font-semibold" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} />
                                                        <select value={formData.duration_type} onChange={e => setFormData({ ...formData, duration_type: e.target.value })} className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
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
                                            <div className="space-y-4 max-w-xl">
                                                <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-border bg-card">
                                                    <div>
                                                        <p className="text-sm font-semibold">Active Status</p>
                                                        <p className="text-xs text-muted-foreground mt-0.5">Make this plan available for new subscriptions.</p>
                                                    </div>
                                                    <Switch checked={formData.status} onCheckedChange={v => setFormData({ ...formData, status: v })} />
                                                </div>
                                                <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-border bg-card">
                                                    <div>
                                                        <p className="text-sm font-semibold">Featured Plan</p>
                                                        <p className="text-xs text-muted-foreground mt-0.5">Highlight this plan on the pricing page.</p>
                                                    </div>
                                                    <Switch checked={formData.is_highlighted} onCheckedChange={v => setFormData({ ...formData, is_highlighted: v })} />
                                                </div>
                                            </div>
                                        </Section>
                                    </div>
                                )}

                                {/* ── Channels ── */}
                                {activeTab === "channels" && (
                                    <div className="space-y-8">
                                        <Section title={GROUP_LABELS.platform.label} description={GROUP_LABELS.platform.description}>
                                            <div className="grid gap-4 max-w-2xl">
                                                {(featuresByGroup["platform"] ?? []).map(([key, def]) => {
                                                    const active = formData.features[key] === "1";
                                                    const Icon = CHANNEL_ICONS[key] ?? Wifi;
                                                    return (
                                                        <div key={key} className={cn("flex items-center justify-between p-4 rounded-xl border transition-colors", active ? "border-primary/40 bg-primary/5" : "border-border bg-card")}>
                                                            <div className="flex items-start gap-4">
                                                                <div className={cn("p-2 rounded-lg bg-background shadow-sm border border-border", CHANNEL_COLORS[key])}>
                                                                    <Icon className="w-5 h-5" />
                                                                </div>
                                                                <div>
                                                                    <div className="flex items-center gap-2">
                                                                        <p className="text-sm font-semibold">{def.label}</p>
                                                                        {def.tooltip && (
                                                                            <Tooltip><TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger><TooltipContent>{def.tooltip}</TooltipContent></Tooltip>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-xs text-muted-foreground mt-0.5">{def.description}</p>
                                                                </div>
                                                            </div>
                                                            <Switch checked={active} onCheckedChange={v => handleFeatureToggle(key, v)} />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </Section>
                                    </div>
                                )}

                                {/* ── Features ── */}
                                {activeTab === "features" && (
                                    <div className="space-y-10">
                                        <div className="relative sticky top-16 z-30 pt-4 pb-2 bg-background/95 backdrop-blur shadow-[0_8px_10px_-10px_rgba(0,0,0,0.1)]">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 mt-1 w-4 h-4 text-muted-foreground" />
                                            <Input placeholder="Search features... (e.g. AI, Bio)" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 h-11 bg-muted/40 font-medium" />
                                        </div>

                                        {GROUP_ORDER.map(group => {
                                            const entries = featuresByGroup[group] ?? [];
                                            if (entries.length === 0) return null;
                                            
                                            const toggles = entries.filter(([, d]) => d.type === "toggle");
                                            const limits  = entries.filter(([, d]) => d.type === "limit");

                                            return (
                                                <div key={group} id={`section-${group}`} className="scroll-mt-32">
                                                    <Section title={GROUP_LABELS[group]?.label ?? group} description={GROUP_LABELS[group]?.description}>
                                                        
                                                        {limits.length > 0 && (
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                                                {limits.map(([key, def]) => {
                                                                    const disabled = isFeatureDisabled(key);
                                                                    const isUnlim = formData.features[key] === "-1";
                                                                    const val = formData.features[key] ?? def.default;
                                                                    return (
                                                                        <div key={key} className={cn("rounded-xl border p-4 transition-all duration-200 flex flex-col justify-between gap-4", disabled ? "border-border/50 bg-muted/30 opacity-60 pointer-events-none grayscale-[0.5]" : "border-border bg-card shadow-sm hover:border-primary/30")}>
                                                                            <div>
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <Label className="text-sm font-semibold">{def.label}</Label>
                                                                                    {def.tooltip && (
                                                                                        <Tooltip><TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger><TooltipContent>{def.tooltip}</TooltipContent></Tooltip>
                                                                                    )}
                                                                                </div>
                                                                                {def.description && <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{def.description}</p>}
                                                                            </div>
                                                                            <div className="flex items-center gap-3">
                                                                                {!isUnlim ? (
                                                                                    <div className="relative flex-1">
                                                                                        <Input type="number" value={val === "-1" ? "" : val} onChange={e => handleLimitChange(key, e.target.value)} disabled={disabled} placeholder="Enter limit..." className="pr-20 font-semibold" />
                                                                                        {def.unit && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-medium pointer-events-none">{def.unit}</span>}
                                                                                    </div>
                                                                                ) : (
                                                                                    <div className="flex-1 h-9 rounded-md border border-dashed border-primary/40 bg-primary/5 flex items-center justify-center text-primary text-sm font-semibold">
                                                                                        Unlimited
                                                                                    </div>
                                                                                )}
                                                                                <label className="flex items-center gap-2 text-sm cursor-pointer select-none group">
                                                                                    <input type="checkbox" className="rounded border-input text-primary focus:ring-primary w-4 h-4 cursor-pointer" checked={isUnlim} onChange={(e) => toggleUnlimited(key, e.target.checked)} disabled={disabled} />
                                                                                    <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">Unlimited</span>
                                                                                </label>
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}

                                                        {toggles.length > 0 && (
                                                            <div className="divide-y divide-border rounded-xl border border-border overflow-hidden bg-card shadow-sm">
                                                                {toggles.map(([key, def]) => {
                                                                    const disabled = isFeatureDisabled(key);
                                                                    const active = formData.features[key] === "1" && !disabled;
                                                                    return (
                                                                        <div key={key} className={cn("flex items-center justify-between px-5 py-4 transition-all duration-200", disabled && "bg-muted/30 opacity-60 pointer-events-none grayscale-[0.5]", active && !disabled && "bg-primary/[0.02]")}>
                                                                            <div className="pr-4">
                                                                                <div className="flex items-center gap-1.5">
                                                                                    <p className="text-sm font-semibold">{def.label}</p>
                                                                                    {def.tooltip && (
                                                                                        <Tooltip><TooltipTrigger><Info className="w-3.5 h-3.5 text-muted-foreground" /></TooltipTrigger><TooltipContent>{def.tooltip}</TooltipContent></Tooltip>
                                                                                    )}
                                                                                </div>
                                                                                {def.description && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{def.description}</p>}
                                                                            </div>
                                                                            <div className="flex items-center gap-3 shrink-0">
                                                                                {disabled && <Badge variant="outline" className="text-[10px] uppercase font-bold text-muted-foreground">Disabled</Badge>}
                                                                                <Switch checked={active} disabled={disabled} onCheckedChange={v => handleFeatureToggle(key, v)} />
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}
                                                            </div>
                                                        )}
                                                    </Section>
                                                </div>
                                            );
                                        })}
                                        {Object.values(featuresByGroup).every(arr => arr.length === 0) && (
                                            <div className="text-center py-20 text-muted-foreground flex flex-col items-center">
                                                <Search className="w-10 h-10 mb-4 opacity-20" />
                                                <p className="font-medium text-foreground">No features found</p>
                                                <p className="text-sm mt-1">Try adjusting your search query.</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ── Discount ── */}
                                {activeTab === "discount" && (
                                    <div className="space-y-8">
                                        <Section title="Promotional Discount" description="Offer a time-limited discount on this plan.">
                                            <div className="max-w-xl space-y-6">
                                                <div className="flex items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card">
                                                    <div>
                                                        <p className="text-sm font-semibold">Enable Discount</p>
                                                        <p className="text-xs text-muted-foreground mt-0.5">Activate a promotional discount for this plan.</p>
                                                    </div>
                                                    <Switch checked={formData.discount_status} onCheckedChange={v => setFormData({ ...formData, discount_status: v })} />
                                                </div>
                                                <AnimatePresence>
                                                    {formData.discount_status && (
                                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                                                            <div className="space-y-6 pt-4 border-t border-border">
                                                                <Field label="Discount (%)" required>
                                                                    <div className="relative">
                                                                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                                        <Input type="number" placeholder="e.g. 20" className="pl-9 font-semibold" min={0} max={100} value={formData.discount} onChange={e => setFormData({ ...formData, discount: parseInt(e.target.value) || 0 })} />
                                                                    </div>
                                                                </Field>
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                    <Field label="Start Date">
                                                                        <Input type="date" value={formData.discount_start} onChange={e => setFormData({ ...formData, discount_start: e.target.value })} />
                                                                    </Field>
                                                                    <Field label="End Date">
                                                                        <Input type="date" value={formData.discount_end} onChange={e => setFormData({ ...formData, discount_end: e.target.value })} />
                                                                    </Field>
                                                                </div>
                                                                <Field label="Terms & Conditions">
                                                                    <Input placeholder="e.g. Valid for annual subscribers only" value={formData.discount_terms} onChange={e => setFormData({ ...formData, discount_terms: e.target.value })} />
                                                                </Field>
                                                                <Field label="Apply to Existing Packages">
                                                                    <select value={formData.apply_to_other_packages} onChange={e => setFormData({ ...formData, apply_to_other_packages: e.target.value })} className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                                                                        <option value="no">No — new subscribers only</option>
                                                                        <option value="yes">Yes — all subscribers</option>
                                                                    </select>
                                                                </Field>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </Section>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* RIGHT SUMMARY (3 cols on lg) */}
                    <div className="hidden lg:block lg:col-span-3">
                        <div className="sticky top-24 rounded-xl border border-border bg-card shadow-sm overflow-hidden flex flex-col">
                            <div className="p-5 border-b border-border bg-muted/20">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">Plan Summary</p>
                                <h3 className="text-xl font-extrabold truncate tracking-tight">{formData.name || "Untitled Plan"}</h3>
                                <div className="mt-3 flex items-end gap-1.5 text-primary">
                                    <span className="text-3xl font-extrabold tracking-tight">{formData.price ? formatCurrency(formData.price) : "Free"}</span>
                                    {formData.price && <span className="text-sm font-semibold mb-1">/ {formData.duration_type}</span>}
                                </div>
                            </div>
                            
                            <div className="p-5 flex-1 overflow-y-auto space-y-6 max-h-[calc(100vh-320px)] no-scrollbar">
                                <div>
                                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                                        Modules Enabled
                                        <Badge variant="secondary" className="px-1.5 py-0 text-[9px]">{stats.enabled}</Badge>
                                    </h4>
                                    <ul className="space-y-3">
                                        {['smart_inbox', 'bot_reply', 'social_posting_access', 'bio_links', 'api_developer'].map(key => {
                                            const def = definitions[key];
                                            if (!def) return null;
                                            const active = formData.features[key] === "1" && !isFeatureDisabled(key);
                                            return (
                                                <li key={key} className="flex items-center gap-3 text-sm">
                                                    {active ? <CheckCircle className="w-4 h-4 text-primary shrink-0" /> : <div className="w-4 h-4 border-2 border-muted rounded-full shrink-0" />}
                                                    <span className={cn(active ? "text-foreground font-semibold" : "text-muted-foreground opacity-60")}>{def.label}</span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>

                                <div>
                                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                                        Core Limits
                                    </h4>
                                    <ul className="space-y-2.5">
                                        {['connect_account', 'message_credit', 'subscribers', 'bot_ai_token', 'domains_limit'].map(key => {
                                            const def = definitions[key];
                                            if (!def) return null;
                                            const disabled = isFeatureDisabled(key);
                                            const val = formData.features[key];
                                            return (
                                                <li key={key} className="flex items-center justify-between text-sm py-1 border-b border-border/50 last:border-0">
                                                    <span className="text-muted-foreground font-medium">{def.unit || def.label}</span>
                                                    <span className="font-bold text-foreground bg-muted px-2 py-0.5 rounded text-xs">
                                                        {disabled ? "0" : (val === "-1" ? "Unlimited" : (val || "0"))}
                                                    </span>
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            </div>
                            
                            <div className="p-4 bg-muted/30 border-t border-border grid grid-cols-4 gap-2 text-center text-xs">
                                <div><p className="font-bold text-foreground text-sm">{stats.enabled}</p><p className="text-muted-foreground text-[10px] uppercase font-bold mt-0.5">Enabled</p></div>
                                <div><p className="font-bold text-foreground text-sm">{stats.disabled}</p><p className="text-muted-foreground text-[10px] uppercase font-bold mt-0.5">Disabled</p></div>
                                <div><p className="font-bold text-primary text-sm">{stats.unlimited}</p><p className="text-muted-foreground text-[10px] uppercase font-bold mt-0.5">Unlimited</p></div>
                                <div><p className="font-bold text-foreground text-sm">{stats.limited}</p><p className="text-muted-foreground text-[10px] uppercase font-bold mt-0.5">Limited</p></div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>

            {/* Review Modal */}
            <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Review Plan Details</DialogTitle>
                        <DialogDescription>Please review the configuration before saving.</DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-5">
                        <div className="flex items-center justify-between bg-primary/5 p-4 rounded-xl border border-primary/20">
                            <div>
                                <p className="font-bold text-xl text-primary">{formData.name || "Untitled Plan"}</p>
                                <p className="text-xs text-primary/70 font-semibold mt-1 uppercase tracking-wide">{formData.status ? "Active Plan" : "Draft Plan"}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-xl text-primary">{formData.price ? formatCurrency(formData.price) : "Free"}</p>
                                <p className="text-xs text-primary/70 font-semibold mt-1 uppercase tracking-wide">/ {formData.duration_type}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-4 gap-3">
                            <div className="p-3 border border-border bg-card rounded-xl text-center shadow-sm">
                                <p className="text-xl font-extrabold">{stats.enabled}</p>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold mt-1">Enabled</p>
                            </div>
                            <div className="p-3 border border-border bg-card rounded-xl text-center shadow-sm">
                                <p className="text-xl font-extrabold">{stats.disabled}</p>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold mt-1">Disabled</p>
                            </div>
                            <div className="p-3 border border-border bg-card rounded-xl text-center shadow-sm">
                                <p className="text-xl font-extrabold text-primary">{stats.unlimited}</p>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold mt-1">Unlimited</p>
                            </div>
                            <div className="p-3 border border-border bg-card rounded-xl text-center shadow-sm">
                                <p className="text-xl font-extrabold">{stats.limited}</p>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold mt-1">Limited</p>
                            </div>
                        </div>
                        
                        <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg flex items-start gap-3">
                            <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <p>You are about to {isEdit ? "update an existing plan" : "create a new subscription plan"}. All associated limits and feature access will take effect immediately for new subscribers.</p>
                        </div>
                    </div>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="ghost" onClick={() => setIsReviewOpen(false)}>Back to Editing</Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting} className="min-w-[140px]">
                            {isSubmitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                            Confirm & Save
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </TooltipProvider>
    );
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode; }) {
    return (
        <div className="space-y-5">
            <div className="space-y-1.5 pb-2">
                <h3 className="text-lg font-extrabold tracking-tight">{title}</h3>
                {description && <p className="text-sm text-muted-foreground font-medium">{description}</p>}
            </div>
            {children}
        </div>
    );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode; }) {
    return (
        <div className="space-y-2">
            <Label className="text-sm font-bold text-foreground/90 flex items-center gap-1">
                {label}{required && <span className="text-destructive">*</span>}
            </Label>
            {children}
        </div>
    );
}
