"use client";

import { useState, useEffect, KeyboardEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Loader2, Save, Bot, ChevronDown,
    HelpCircle, RefreshCw, Plus, X
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useModal } from "@/components/providers/ModalProvider";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchCampaigns } from "@/store/slices/aiTrainingSlice";

interface AiAgentSettings {
    ai_enabled: boolean;
    ai_mode: string;
    ai_training_campaign_id: number | string | null;
    ai_agent_prompt: string;
    ai_reply_delay: number;
    enable_intent_detection: boolean;
    ai_reasoning_level: "low" | "medium" | "high";
    restricted_topics_json: string | null;
    restricted_response: string | null;
    enable_typing_indicator: boolean;
    ai_as_fallback_only: boolean;
    ai_agent_all_queries: boolean;
    enable_contextual_memory: boolean;
    enable_assignment: boolean;
    no_agent_off_hours: boolean;
}

// ── Simple Pink Form Components ───────────────────────────────────────────

function FormField({ label, children, hint, showInfo = true }: { label: string; children: React.ReactNode; hint?: string; showInfo?: boolean }) {
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-1.5 min-h-[18px]">
                <label className="text-sm font-bold text-neutral-700 dark:text-neutral-300">
                    {label}
                </label>
                {showInfo && <HelpCircle className="w-4 h-4 text-neutral-300 dark:text-neutral-700" />}
            </div>
            {children}
            {hint && <p className="text-xs text-neutral-400 font-medium italic">{hint}</p>}
        </div>
    );
}

function ThemeToggle({ enabled, onToggle, label }: { enabled: boolean; onToggle: () => void; label: string }) {
    return (
        <div className="flex items-center justify-between p-5 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-xl hover:border-primary/20 dark:hover:border-primary/20 transition-all group">
            <span className="text-[13px] font-medium text-neutral-700 dark:text-neutral-300 group-hover:text-neutral-900 dark:group-hover:text-white transition-colors">{label}</span>
            <button
                onClick={onToggle}
                className={cn(
                    "w-11 h-6 rounded-full transition-all relative px-1 flex items-center shadow-sm",
                    enabled ? "bg-primary shadow-primary/20" : "bg-neutral-200 dark:bg-neutral-800"
                )}
            >
                <motion.div
                    animate={{ x: enabled ? 20 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="w-4 h-4 rounded-full bg-white shadow-sm"
                />
            </button>
        </div>
    );
}

// ── Main Panel ─────────────────────────────────────────────────────────────

export function AiAgentSettingsPanel({
    platform,
    accountId,
    accountName,
}: {
    platform: "instagram" | "facebook";
    accountId: number | string;
    accountName: string;
}) {
    const dispatch = useAppDispatch();
    const { campaigns } = useAppSelector((s) => s.aiTraining);
    const { showModal } = useModal();

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [topicInput, setTopicInput] = useState("");
    const [settings, setSettings] = useState<AiAgentSettings>({
        ai_enabled: false,
        ai_mode: "fallback_only",
        ai_training_campaign_id: null,
        ai_agent_prompt: "",
        ai_reply_delay: 0,
        enable_intent_detection: true,
        ai_reasoning_level: "low",
        restricted_topics_json: null,
        restricted_response: null,
        enable_typing_indicator: true,
        ai_as_fallback_only: false,
        ai_agent_all_queries: true,
        enable_contextual_memory: false,
        enable_assignment: false,
        no_agent_off_hours: false,
    });

    useEffect(() => {
        dispatch(fetchCampaigns());
        fetchSettings();
    }, [accountId, platform]);

    const fetchSettings = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/social/ai-agent-settings/${platform}/${accountId}/data`);
            const s = response.data?.data?.settings || response.data?.settings;
            if (s) {
                setSettings({
                    ai_enabled: !!s.ai_enabled,
                    ai_mode: s.ai_mode || "fallback_only",
                    ai_training_campaign_id: s.ai_training_campaign_id || null,
                    ai_agent_prompt: s.ai_agent_prompt || "",
                    ai_reply_delay: Number(s.ai_reply_delay) || 0,
                    enable_intent_detection: s.enable_intent_detection !== undefined ? !!s.enable_intent_detection : true,
                    ai_reasoning_level: s.ai_reasoning_level || "low",
                    restricted_topics_json: s.restricted_topics_json || null,
                    restricted_response: s.restricted_response || null,
                    enable_typing_indicator: !!s.enable_typing_indicator,
                    ai_as_fallback_only: !!s.ai_as_fallback_only,
                    ai_agent_all_queries: s.ai_agent_all_queries !== undefined ? !!s.ai_agent_all_queries : true,
                    enable_contextual_memory: !!s.enable_contextual_memory,
                    enable_assignment: !!s.enable_assignment,
                    no_agent_off_hours: !!s.no_agent_off_hours,
                });
            }
        } catch (err) {
            console.error("Fetch Error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = {
                ...settings,
                ai_enabled: settings.ai_enabled ? 1 : 0,
                enable_intent_detection: settings.enable_intent_detection ? 1 : 0,
                enable_typing_indicator: settings.enable_typing_indicator ? 1 : 0,
                ai_as_fallback_only: settings.ai_as_fallback_only ? 1 : 0,
                ai_agent_all_queries: settings.ai_agent_all_queries ? 1 : 0,
                enable_contextual_memory: settings.enable_contextual_memory ? 1 : 0,
                enable_assignment: settings.enable_assignment ? 1 : 0,
                no_agent_off_hours: settings.no_agent_off_hours ? 1 : 0,
            };
            await api.post(`/social/ai-agent-settings/${platform}/${accountId}/save`, payload);
            showModal("success", "Success", "Configuration Synchronized.");
        } catch (err: any) {
            showModal("error", "Error", "Failed to finalize sync.");
        } finally {
            setIsSaving(false);
        }
    };

    const addTopic = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && topicInput.trim()) {
            e.preventDefault();
            const currentTopics = settings.restricted_topics_json ? settings.restricted_topics_json.split(',').map(t => t.trim()) : [];
            if (!currentTopics.includes(topicInput.trim())) {
                const newTopics = [...currentTopics, topicInput.trim()].filter(Boolean).join(', ');
                setSettings(s => ({ ...s, restricted_topics_json: newTopics }));
            }
            setTopicInput("");
        }
    };

    const removeTopic = (topic: string) => {
        const currentTopics = settings.restricted_topics_json ? settings.restricted_topics_json.split(',').map(t => t.trim()) : [];
        const newTopics = currentTopics.filter(t => t !== topic).join(', ');
        setSettings(s => ({ ...s, restricted_topics_json: newTopics || null }));
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Loading Neural Context...</p>
            </div>
        );
    }

    const topicList = settings.restricted_topics_json ? settings.restricted_topics_json.split(',').map(t => t.trim()).filter(Boolean) : [];

    return (
        <div className="bg-white dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 rounded-3xl shadow-xl shadow-neutral-200/20 dark:shadow-none max-w-6xl mx-auto overflow-hidden">
            {/* Header Area */}
            <div className="px-6 py-6 sm:px-10 sm:py-8 border-b border-neutral-50 dark:border-neutral-900 bg-neutral-50/30 dark:bg-neutral-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                        <Bot className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-neutral-900 dark:text-neutral-100 tracking-tight">AI Agent Configuration</h3>
                        <p className="text-xs text-neutral-500 font-medium">Neural settings for @{accountName}</p>
                    </div>
                </div>
                <button className="h-10 px-6 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-xs font-bold text-neutral-600 dark:text-neutral-400 flex items-center gap-2 hover:bg-neutral-50 transition-all">
                    Advanced Options <ChevronDown size={16} />
                </button>
            </div>

            {/* Grid Form */}
            <div className="p-6 sm:p-12 grid grid-cols-1 lg:grid-cols-2 gap-x-16 gap-y-12">

                {/* Activation & Core Section */}
                <div className="space-y-10">
                    <FormField label="System Status" showInfo={false}>
                        <div className="flex items-center gap-6">
                            <button
                                onClick={() => setSettings(s => ({ ...s, ai_enabled: !s.ai_enabled }))}
                                className={cn(
                                    "px-8 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                                    settings.ai_enabled ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800"
                                )}
                            >
                                {settings.ai_enabled ? "ENABLED" : "DISABLED"}
                            </button>
                            <button
                                onClick={() => setSettings(s => ({ ...s, ai_enabled: !s.ai_enabled }))}
                                className={cn(
                                    "w-12 h-7 rounded-full transition-all relative px-1 flex items-center shadow-inner",
                                    settings.ai_enabled ? "bg-primary" : "bg-neutral-200 dark:bg-neutral-800"
                                )}
                            >
                                <motion.div animate={{ x: settings.ai_enabled ? 20 : 0 }} className="w-5 h-5 rounded-full bg-white shadow-sm" />
                            </button>
                        </div>
                    </FormField>

                    <AnimatePresence mode="wait">
                        {settings.ai_enabled && (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-10">
                                <ThemeToggle label="Enable Intent Detection" enabled={settings.enable_intent_detection} onToggle={() => setSettings(s => ({ ...s, enable_intent_detection: !s.enable_intent_detection }))} />

                                <div className="flex items-center gap-5 p-5 bg-neutral-50/50 dark:bg-neutral-900/50 rounded-2xl">
                                    <button
                                        onClick={() => setSettings(s => ({ ...s, ai_agent_all_queries: !s.ai_agent_all_queries }))}
                                        className={cn("w-11 h-6 rounded-full relative px-1 flex items-center shadow-sm", settings.ai_agent_all_queries ? "bg-primary shadow-primary/20" : "bg-neutral-200 dark:bg-neutral-800")}
                                    >
                                        <div className={cn("w-4 h-4 rounded-full bg-white transition-all shadow-sm", settings.ai_agent_all_queries ? "translate-x-5" : "translate-x-0")} />
                                    </button>
                                    <span className="text-sm font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-tight">Execute for All Queries</span>
                                </div>

                                <ThemeToggle label="Enable Contextual Memory" enabled={settings.enable_contextual_memory} onToggle={() => setSettings(s => ({ ...s, enable_contextual_memory: !s.enable_contextual_memory }))} />

                                <FormField label="Restricted Topics" hint="Add topics and press Enter to secure.">
                                    <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-3 min-h-[56px] flex flex-wrap gap-2 shadow-sm focus-within:border-primary/30 transition-all">
                                        {topicList.map(topic => (
                                            <span key={topic} className="flex items-center gap-2 px-4 py-1.5 bg-primary/10 text-primary text-[11px] font-black uppercase tracking-widest rounded-xl border border-primary/20">
                                                {topic}
                                                <X size={12} className="cursor-pointer hover:rotate-90 transition-transform" onClick={() => removeTopic(topic)} />
                                            </span>
                                        ))}
                                        <input
                                            value={topicInput}
                                            onChange={(e) => setTopicInput(e.target.value)}
                                            onKeyDown={addTopic}
                                            placeholder={topicList.length === 0 ? "e.g. pricing, competition..." : "Add more..."}
                                            className="flex-1 bg-transparent outline-none text-sm font-bold text-neutral-700 dark:text-neutral-300 min-w-[120px] px-2 h-10 uppercase tracking-tight placeholder:text-neutral-200"
                                        />
                                    </div>
                                </FormField>

                                <ThemeToggle label="Automated Department Assignment" enabled={settings.enable_assignment} onToggle={() => setSettings(s => ({ ...s, enable_assignment: !s.enable_assignment }))} />
                                <ThemeToggle label="Real-time Typing Simulator" enabled={settings.enable_typing_indicator} onToggle={() => setSettings(s => ({ ...s, enable_typing_indicator: !s.enable_typing_indicator }))} />

                                <FormField label="Intelligence Reasoning Depth">
                                    <div className="grid grid-cols-3 gap-3">
                                        {(['low', 'medium', 'high'] as const).map(l => (
                                            <button
                                                key={l}
                                                onClick={() => setSettings(s => ({ ...s, ai_reasoning_level: l }))}
                                                className={cn(
                                                    "h-12 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all border",
                                                    settings.ai_reasoning_level === l
                                                        ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                                                        : "bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800 text-neutral-400 hover:border-primary/30"
                                                )}
                                            >
                                                {l}
                                            </button>
                                        ))}
                                    </div>
                                </FormField>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Training & Logistics Section */}
                <div className="space-y-10">
                    <FormField label="Neural Training Data">
                        <div className="flex items-center gap-8 absolute right-0 -top-8">
                            <button className="text-[11px] font-black text-primary tracking-widest flex items-center gap-1.5 hover:opacity-70 transition-all"><Plus size={14} strokeWidth={3} /> NEW</button>
                            <button onClick={() => dispatch(fetchCampaigns())} className="text-[11px] font-black text-primary tracking-widest flex items-center gap-1.5 hover:opacity-70 transition-all"><RefreshCw size={14} strokeWidth={3} /> REFRESH</button>
                        </div>
                        <div className="relative group">
                            <select
                                value={settings.ai_training_campaign_id || ""}
                                onChange={(e) => setSettings(s => ({ ...s, ai_training_campaign_id: e.target.value }))}
                                className="w-full h-14 px-6 appearance-none bg-neutral-50 dark:bg-neutral-800 border-none rounded-2xl text-sm font-bold text-neutral-700 dark:text-neutral-300 outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                            >
                                <option value="">Select AI training campaign source</option>
                                {campaigns.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                            </select>
                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
                        </div>
                    </FormField>

                    <AnimatePresence mode="wait">
                        {settings.ai_enabled && (
                            <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="space-y-10">
                                <div className="flex items-center gap-5 p-5 bg-neutral-50/50 dark:bg-neutral-900/50 rounded-2xl">
                                    <button
                                        onClick={() => setSettings(s => ({ ...s, ai_as_fallback_only: !s.ai_as_fallback_only }))}
                                        className={cn("w-11 h-6 rounded-full relative px-1 flex items-center shadow-sm", settings.ai_as_fallback_only ? "bg-primary shadow-primary/20" : "bg-neutral-200 dark:bg-neutral-800")}
                                    >
                                        <div className={cn("w-4 h-4 rounded-full bg-white transition-all shadow-sm", settings.ai_as_fallback_only ? "translate-x-5" : "translate-x-0")} />
                                    </button>
                                    <span className="text-sm font-bold text-neutral-600 dark:text-neutral-400 uppercase tracking-tight">Strict Fallback Mode</span>
                                </div>

                                <ThemeToggle label="Suspend Agent During Off Hours" enabled={settings.no_agent_off_hours} onToggle={() => setSettings(s => ({ ...s, no_agent_off_hours: !s.no_agent_off_hours }))} />

                                <FormField label="Restricted Content Response" hint="Define the automated response for guardrail events.">
                                    <textarea
                                        value={settings.restricted_response || ""}
                                        onChange={(e) => setSettings(s => ({ ...s, restricted_response: e.target.value }))}
                                        className="w-full h-40 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-6 text-sm font-medium text-neutral-700 dark:text-neutral-300 outline-none focus:border-primary shadow-sm transition-all resize-none leading-relaxed"
                                        placeholder="e.g. Protocol mismatch. Redirecting to human operator..."
                                    />
                                </FormField>

                                <FormField label="Inference Delay (Seconds)" hint="Simulate natural conversation latency (Max 60s)">
                                    <div className="bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl h-14 px-6 flex items-center shadow-sm">
                                        <input
                                            type="number"
                                            value={settings.ai_reply_delay}
                                            onChange={(e) => setSettings(s => ({ ...s, ai_reply_delay: Number(e.target.value) }))}
                                            className="w-full bg-transparent outline-none text-xl font-black text-primary"
                                            placeholder="0"
                                        />
                                    </div>
                                </FormField>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

            </div>

            {/* Commit Footer */}
            <div className="px-6 py-6 sm:px-12 sm:py-8 bg-neutral-50/50 dark:bg-neutral-900/50 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end">
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="w-full sm:w-auto h-14 sm:h-16 px-8 sm:px-16 rounded-[20px] sm:rounded-[24px] bg-primary text-white font-black text-[10px] sm:text-xs uppercase tracking-[0.25em] shadow-2xl shadow-primary/30 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4"
                >
                    {isSaving ? <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-white/50" /> : <Save className="w-5 h-5 sm:w-6 sm:h-6" />}
                    Initialize Context Save
                </button>
            </div>
        </div>
    );
}

