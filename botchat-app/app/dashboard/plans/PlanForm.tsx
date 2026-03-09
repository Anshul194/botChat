"use client";

import { useState, useEffect } from "react";
import {
    ArrowLeft, Save, Loader2, Check, Zap,
    MessageSquare, Users, Bot, CreditCard,
    Smartphone, Globe, Send, BarChart3,
    DollarSign, Clock, Tag, CheckCircle,
    Facebook, Instagram, Wifi, Activity,
    Radio, Settings2, ChevronRight
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

const INITIAL_FEATURES = {
    whatsapp: "0",
    telegram: "0",
    facebook: "0",
    instagram: "0",
    connect_account: "5",
    message_credit: "10000",
    subscribers: "5000",
    bot_typing_on_display: "0",
    bot_message_insight: "0",
    bot_conditional_reply: "0",
    bot_ai_token: "0",
    bot_ai_agent: "0",
    bot_ai_assistant: "0",
    live_chat: "0",
    live_chat_advanced: "0",
    live_chat_translator: "0",
    livechat_restriction: "0",
    incoming_message_webhook: "0",
    input_flow_campaign: "0",
    broadcast: "0",
    drip_campaign: "0",
    ecommerce: "0",
    keyword_reply: "0",
    recurring_notification: "0",
    comment_reply: "0",
    ads_click_to_message: "0",
    opt_in_message: "0",
    bot_flow_message: "0",
    smart_inbox: "0",
};

const INITIAL_FORM = {
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
    features: { ...INITIAL_FEATURES },
};

interface PlanFormProps {
    initialData?: any;
    isSubmitting?: boolean;
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
}

export default function PlanForm({ initialData, isSubmitting, onClose, onSubmit }: PlanFormProps) {
    const [formData, setFormData] = useState<any>(INITIAL_FORM);
    const [activeTab, setActiveTab] = useState<"general" | "channels" | "features" | "discount">("general");

    useEffect(() => {
        if (initialData) {
            const features = { ...INITIAL_FEATURES };
            if (initialData.features) {
                Object.keys(initialData.features).forEach(k => {
                    const v = initialData.features[k];
                    features[k as keyof typeof features] = typeof v === "object" && v !== null ? v.value : String(v);
                });
            }
            setFormData({
                name: initialData.name || "",
                price: initialData.price || "",
                duration: initialData.duration || "30",
                duration_type: (initialData.duration_type || "day").toLowerCase(),
                description: initialData.description || "",
                status: initialData.status ?? true,
                is_highlighted: initialData.is_highlighted ?? false,
                discount: initialData.discount || 0,
                discount_terms: initialData.discount_terms || "",
                discount_start: initialData.discount_start || "",
                discount_end: initialData.discount_end || "",
                discount_status: initialData.discount_status ?? false,
                apply_to_other_packages: initialData.apply_to_other_packages || "no",
                features,
            });
        } else {
            setFormData(INITIAL_FORM);
        }
    }, [initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    const setFeature = (key: string, val: string) =>
        setFormData((p: any) => ({ ...p, features: { ...p.features, [key]: val } }));

    const isEdit = !!initialData;

    const tabs = [
        { id: "general", label: "General", icon: Settings2 },
        { id: "channels", label: "Channels", icon: Wifi },
        { id: "features", label: "Features", icon: Zap },
        { id: "discount", label: "Discount", icon: Tag },
    ] as const;

    return (
        <div className="min-h-screen bg-background">
            {/* Top Navigation Bar */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-md border-b border-border">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="gap-2 text-muted-foreground hover:text-foreground font-medium"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Plans
                        </Button>
                        <span className="text-muted-foreground">/</span>
                        <span className="text-sm font-semibold">
                            {isEdit ? `Edit: ${initialData?.name}` : "New Plan"}
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge
                            variant="outline"
                            className={cn(
                                "text-xs font-medium",
                                formData.status
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800"
                                    : "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800"
                            )}
                        >
                            {formData.status ? "Active" : "Draft"}
                        </Badge>
                        <Button variant="outline" size="sm" onClick={onClose} className="font-medium">
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="gap-2 font-medium min-w-[110px]"
                        >
                            {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Save className="w-4 h-4" />
                            )}
                            {isEdit ? "Save Changes" : "Create Plan"}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-8">
                {/* Page Title */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold tracking-tight">
                        {isEdit ? "Edit Subscription Plan" : "Create Subscription Plan"}
                    </h1>
                    <p className="text-muted-foreground mt-1 text-sm">
                        {isEdit
                            ? "Update plan details, features, and pricing."
                            : "Set up pricing, features, and availability for your new plan."}
                    </p>
                </div>

                <div className="flex gap-8">
                    {/* Left Sidebar — Tab Nav */}
                    <div className="w-48 shrink-0">
                        <nav className="space-y-1 sticky top-24">
                            {tabs.map(tab => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={cn(
                                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left",
                                        activeTab === tab.id
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                    )}
                                >
                                    <tab.icon className="w-4 h-4 shrink-0" />
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.15 }}
                            >
                                {/* ── General ── */}
                                {activeTab === "general" && (
                                    <div className="space-y-6">
                                        <Section title="Plan Details" description="Basic information about this subscription plan.">
                                            <Field label="Plan Name" required>
                                                <Input
                                                    placeholder="e.g. Pro, Business, Enterprise"
                                                    value={formData.name}
                                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                />
                                            </Field>
                                            <Field label="Description">
                                                <Textarea
                                                    placeholder="Briefly describe what this plan offers..."
                                                    value={formData.description}
                                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                                    className="resize-none"
                                                    rows={3}
                                                />
                                            </Field>
                                        </Section>

                                        <Section title="Pricing" description="Set the billing amount and cycle for this plan.">
                                            <div className="grid grid-cols-2 gap-4">
                                                <Field label="Price (USD)" required>
                                                    <div className="relative">
                                                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                        <Input
                                                            type="number"
                                                            placeholder="0.00"
                                                            className="pl-9"
                                                            value={formData.price}
                                                            onChange={e => setFormData({ ...formData, price: e.target.value })}
                                                        />
                                                    </div>
                                                </Field>
                                                <Field label="Billing Cycle" required>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            type="number"
                                                            placeholder="30"
                                                            value={formData.duration}
                                                            onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                                            className="w-24 shrink-0"
                                                        />
                                                        <select
                                                            value={formData.duration_type}
                                                            onChange={e => setFormData({ ...formData, duration_type: e.target.value })}
                                                            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                                        >
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
                                                <ToggleRow
                                                    label="Active"
                                                    description="Make this plan available for new subscriptions."
                                                    checked={formData.status}
                                                    onChange={v => setFormData({ ...formData, status: v })}
                                                />
                                                <ToggleRow
                                                    label="Featured"
                                                    description="Highlight this plan on the pricing page as recommended."
                                                    checked={formData.is_highlighted}
                                                    onChange={v => setFormData({ ...formData, is_highlighted: v })}
                                                />
                                            </div>
                                        </Section>
                                    </div>
                                )}

                                {/* ── Channels ── */}
                                {activeTab === "channels" && (
                                    <div className="space-y-6">
                                        <Section title="Messaging Channels" description="Enable the platforms included in this plan.">
                                            <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
                                                {[
                                                    { key: "whatsapp", label: "WhatsApp", icon: Smartphone, color: "text-green-600" },
                                                    { key: "telegram", label: "Telegram", icon: Send, color: "text-blue-500" },
                                                    { key: "facebook", label: "Facebook Messenger", icon: Facebook, color: "text-blue-600" },
                                                    { key: "instagram", label: "Instagram DM", icon: Instagram, color: "text-pink-500" },
                                                ].map(ch => {
                                                    const active = formData.features[ch.key] === "1";
                                                    return (
                                                        <div key={ch.key} className="flex items-center justify-between px-4 py-3 bg-card">
                                                            <div className="flex items-center gap-3">
                                                                <ch.icon className={cn("w-5 h-5", ch.color)} />
                                                                <div>
                                                                    <p className="text-sm font-medium">{ch.label}</p>
                                                                </div>
                                                            </div>
                                                            <Switch
                                                                checked={active}
                                                                onCheckedChange={v => setFeature(ch.key, v ? "1" : "0")}
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </Section>
                                    </div>
                                )}

                                {/* ── Features ── */}
                                {activeTab === "features" && (
                                    <div className="space-y-6">
                                        <Section title="Usage Limits" description="Set the resource quotas included in this plan.">
                                            <div className="grid grid-cols-2 gap-4">
                                                {[
                                                    { key: "connect_account", label: "Connected Accounts", icon: Users },
                                                    { key: "message_credit", label: "Message Credits", icon: CreditCard },
                                                    { key: "subscribers", label: "Subscribers", icon: Activity },
                                                    { key: "bot_ai_token", label: "AI Tokens", icon: Bot },
                                                ].map(q => {
                                                    const raw = formData.features[q.key];
                                                    const val = typeof raw === "object" && raw !== null ? raw.value : raw;
                                                    return (
                                                        <div key={q.key} className="rounded-lg border border-border p-4 bg-card space-y-2">
                                                            <div className="flex items-center gap-2">
                                                                <q.icon className="w-4 h-4 text-muted-foreground" />
                                                                <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{q.label}</Label>
                                                            </div>
                                                            <Input
                                                                type="number"
                                                                value={val}
                                                                onChange={e => setFeature(q.key, e.target.value)}
                                                                className="font-semibold"
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </Section>

                                        <Section title="Bot Capabilities" description="Choose which bot features are available on this plan.">
                                            <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
                                                {[
                                                    { key: "bot_typing_on_display", label: "Typing Indicator", description: "Show typing status to users" },
                                                    { key: "bot_message_insight", label: "Message Insights", description: "Analytics on bot messages" },
                                                    { key: "bot_conditional_reply", label: "Conditional Replies", description: "Rule-based response logic" },
                                                    { key: "bot_ai_agent", label: "AI Agent", description: "Autonomous AI agent support" },
                                                    { key: "bot_ai_assistant", label: "AI Assistant", description: "Guided AI assistant mode" },
                                                    { key: "bot_flow_message", label: "Flow Messages", description: "Visual flow builder for responses" },
                                                ].map(feat => {
                                                    const active = formData.features[feat.key] === "1";
                                                    return (
                                                        <div key={feat.key} className="flex items-center justify-between px-4 py-3 bg-card">
                                                            <div>
                                                                <p className="text-sm font-medium">{feat.label}</p>
                                                                <p className="text-xs text-muted-foreground">{feat.description}</p>
                                                            </div>
                                                            <Switch
                                                                checked={active}
                                                                onCheckedChange={v => setFeature(feat.key, v ? "1" : "0")}
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </Section>

                                        <Section title="Live Chat" description="Live chat and support features included in this plan.">
                                            <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
                                                {[
                                                    { key: "live_chat", label: "Live Chat", description: "Real-time customer support" },
                                                    { key: "live_chat_advanced", label: "Advanced Live Chat", description: "Priority routing & team assignment" },
                                                    { key: "live_chat_translator", label: "Live Translator", description: "Real-time language translation" },
                                                    { key: "smart_inbox", label: "Smart Inbox", description: "AI-powered conversation sorting" },
                                                ].map(feat => {
                                                    const active = formData.features[feat.key] === "1";
                                                    return (
                                                        <div key={feat.key} className="flex items-center justify-between px-4 py-3 bg-card">
                                                            <div>
                                                                <p className="text-sm font-medium">{feat.label}</p>
                                                                <p className="text-xs text-muted-foreground">{feat.description}</p>
                                                            </div>
                                                            <Switch
                                                                checked={active}
                                                                onCheckedChange={v => setFeature(feat.key, v ? "1" : "0")}
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </Section>

                                        <Section title="Automation & Campaigns" description="Marketing and automation tools available on this plan.">
                                            <div className="divide-y divide-border rounded-lg border border-border overflow-hidden">
                                                {[
                                                    { key: "broadcast", label: "Broadcast Messaging", description: "Send mass messages to subscribers" },
                                                    { key: "drip_campaign", label: "Drip Campaigns", description: "Automated sequential messaging" },
                                                    { key: "keyword_reply", label: "Keyword Replies", description: "Auto-reply based on keywords" },
                                                    { key: "comment_reply", label: "Comment Reply", description: "Auto-reply to post comments" },
                                                    { key: "incoming_message_webhook", label: "Webhooks", description: "Receive incoming message events" },
                                                    { key: "recurring_notification", label: "Recurring Notifications", description: "Scheduled recurring messages" },
                                                    { key: "opt_in_message", label: "Opt-In Messages", description: "Subscriber opt-in management" },
                                                    { key: "ads_click_to_message", label: "Click-to-Message Ads", description: "Integrated ad click triggers" },
                                                    { key: "ecommerce", label: "E-Commerce", description: "Product catalog & order management" },
                                                ].map(feat => {
                                                    const active = formData.features[feat.key] === "1";
                                                    return (
                                                        <div key={feat.key} className="flex items-center justify-between px-4 py-3 bg-card">
                                                            <div>
                                                                <p className="text-sm font-medium">{feat.label}</p>
                                                                <p className="text-xs text-muted-foreground">{feat.description}</p>
                                                            </div>
                                                            <Switch
                                                                checked={active}
                                                                onCheckedChange={v => setFeature(feat.key, v ? "1" : "0")}
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </Section>
                                    </div>
                                )}

                                {/* ── Discount ── */}
                                {activeTab === "discount" && (
                                    <div className="space-y-6">
                                        <Section title="Promotional Discount" description="Offer a time-limited discount on this plan.">
                                            <ToggleRow
                                                label="Enable Discount"
                                                description="Activate a promotional discount for this plan."
                                                checked={formData.discount_status}
                                                onChange={v => setFormData({ ...formData, discount_status: v })}
                                            />

                                            <AnimatePresence>
                                                {formData.discount_status && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: "auto" }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="space-y-4 pt-4 border-t border-border mt-4">
                                                            <Field label="Discount (%)" required>
                                                                <div className="relative">
                                                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                                    <Input
                                                                        type="number"
                                                                        placeholder="e.g. 20"
                                                                        className="pl-9"
                                                                        min={0}
                                                                        max={100}
                                                                        value={formData.discount}
                                                                        onChange={e => setFormData({ ...formData, discount: parseInt(e.target.value) || 0 })}
                                                                    />
                                                                </div>
                                                            </Field>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <Field label="Start Date">
                                                                    <Input
                                                                        type="date"
                                                                        value={formData.discount_start}
                                                                        onChange={e => setFormData({ ...formData, discount_start: e.target.value })}
                                                                    />
                                                                </Field>
                                                                <Field label="End Date">
                                                                    <Input
                                                                        type="date"
                                                                        value={formData.discount_end}
                                                                        onChange={e => setFormData({ ...formData, discount_end: e.target.value })}
                                                                    />
                                                                </Field>
                                                            </div>
                                                            <Field label="Terms & Conditions">
                                                                <Input
                                                                    placeholder="e.g. Valid for annual subscribers only"
                                                                    value={formData.discount_terms}
                                                                    onChange={e => setFormData({ ...formData, discount_terms: e.target.value })}
                                                                />
                                                            </Field>
                                                            <Field label="Apply to Existing Packages">
                                                                <select
                                                                    value={formData.apply_to_other_packages}
                                                                    onChange={e => setFormData({ ...formData, apply_to_other_packages: e.target.value })}
                                                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                                                >
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
                        <div className="flex items-center justify-between pt-6 mt-6 border-t border-border">
                            <Button variant="ghost" onClick={onClose} className="text-muted-foreground">
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2 min-w-[130px]">
                                {isSubmitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <CheckCircle className="w-4 h-4" />
                                )}
                                {isEdit ? "Save Changes" : "Create Plan"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Sub-components ────────────────────────────────────────────────

function Section({ title, description, children }: {
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-xl border border-border bg-card p-6 space-y-4">
            <div className="space-y-1 pb-2 border-b border-border">
                <h3 className="text-sm font-semibold">{title}</h3>
                {description && <p className="text-xs text-muted-foreground">{description}</p>}
            </div>
            {children}
        </div>
    );
}

function Field({ label, required, children }: {
    label: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <Label className="text-sm font-medium">
                {label}
                {required && <span className="text-destructive ml-0.5">*</span>}
            </Label>
            {children}
        </div>
    );
}

function ToggleRow({ label, description, checked, onChange }: {
    label: string;
    description: string;
    checked: boolean;
    onChange: (v: boolean) => void;
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
