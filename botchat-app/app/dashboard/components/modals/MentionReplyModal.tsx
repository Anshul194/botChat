"use client";

import { useState, useEffect } from "react";
import {
    X, Save, Sparkles, MessageSquare,
    ChevronDown, Info, ShieldAlert,
    Trash2, Plus, Edit3, RefreshCw,
    MessageCircle, EyeOff, Check, Loader2,
    Settings, Send, Wand2, Calendar, LayoutGrid,
    Search, Filter, Globe, AtSign
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useModal } from "@/components/providers/ModalProvider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface FilterRule {
    id: string;
    match_type: "exact" | "contains";
    keywords: string;
    message: string;
    template_id: string | null;
}

interface MentionReplyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
    instagramId: string;
    platform: "instagram";
}

// ── Reusable Field Components ──────────────────────────────────────────────────

function Field({ label, required, children, icon: Icon, desc }: { label: string; required?: boolean; children: React.ReactNode; icon?: any, desc?: string }) {
    return (
        <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center justify-between">
                <label className="text-[13px] font-semibold text-slate-700 flex items-center gap-2">
                    {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
                    {label} {required && <span className="text-rose-400">*</span>}
                </label>
                {desc && <span className="text-[11px] text-slate-400 font-medium">{desc}</span>}
            </div>
            {children}
        </div>
    );
}

function CustomToggle({ active, onClick, label }: { active: boolean; onClick: () => void; label?: string }) {
    return (
        <div className="flex items-center gap-3 group cursor-pointer" onClick={onClick}>
            <div className={cn(
                "w-10 h-5 rounded-full relative transition-all duration-200 shadow-sm",
                active ? "bg-pink-600" : "bg-slate-200"
            )}>
                <div className={cn(
                    "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-sm",
                    active ? "left-5.5" : "left-0.5"
                )} />
            </div>
            {label && <span className="text-[12px] font-medium text-slate-600 group-hover:text-slate-900 transition-colors uppercase tracking-tight">{label}</span>}
        </div>
    );
}

// ── MAIN MODAL ────────────────────────────────────────────────────────────────

export function MentionReplyModal({
    isOpen,
    onClose,
    onSaved,
    instagramId,
    platform
}: MentionReplyModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [templates, setTemplates] = useState<any[]>([]);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
    const [existingConfigId, setExistingConfigId] = useState<number | null>(null);

    // Form State
    const [name, setName] = useState("");
    const [replyType, setReplyType] = useState<"generic" | "filter">("generic");
    const [multipleReply, setMultipleReply] = useState(false);
    const [commentReplyEnabled, setCommentReplyEnabled] = useState(true);
    const [hideAfterReply, setHideAfterReply] = useState(false);
    const [fallbackMessage, setFallbackMessage] = useState("");
    const [privateTemplateId, setPrivateTemplateId] = useState<string | null>(null);

    // Offensive State
    const [hideOffensive, setHideOffensive] = useState(false);
    const [deleteOffensive, setDeleteOffensive] = useState(false);
    const [offensiveKeywords, setOffensiveKeywords] = useState("");
    const [offensiveTemplateId, setOffensiveTemplateId] = useState<string | null>(null);

    // Rules State
    const [rules, setRules] = useState<FilterRule[]>([]);

    useEffect(() => {
        if (isOpen && instagramId) {
            fetchConfig();
            fetchTemplates();
        }
    }, [isOpen, instagramId]);

    const fetchConfig = async () => {
        setIsLoading(true);
        try {
            const res = await api.get(`/instagram/comment-manager/mention-reply/${instagramId}?platform=instagram`);
            const configData = res.data?.data;
            const template = configData?.template;
            
            if (template) {
                setExistingConfigId(template.id);
                setName(template.name || "");
                setReplyType(template.reply_type || "generic");
                setMultipleReply(template.multiple_reply_enabled === "1" || template.multiple_reply_enabled === 1 || template.multiple_reply_enabled === true);
                setCommentReplyEnabled(template.comment_reply_enabled === "1" || template.comment_reply_enabled === 1 || template.comment_reply_enabled === true);
                setHideAfterReply(template.hide_after_reply === "1" || template.hide_after_reply === 1 || template.hide_after_reply === true);
                setFallbackMessage(template.message || "");
                setPrivateTemplateId(template.private_template_id ? String(template.private_template_id) : null);

                const offensive = template.offensive || configData.offensive;
                if (offensive) {
                    setHideOffensive(offensive.hide_comment === "1" || offensive.hide_comment === 1 || offensive.hide_comment === true);
                    setDeleteOffensive(offensive.delete_comment === "1" || offensive.delete_comment === 1 || offensive.delete_comment === true);
                    setOffensiveKeywords(offensive.offensive_keywords || "");
                    setOffensiveTemplateId(offensive.private_reply_template_id ? String(offensive.private_reply_template_id) : null);
                }

                const configRules = template.rules || configData.rules;
                if (configRules && Array.isArray(configRules)) {
                    setRules(configRules.map((r: any) => ({
                        id: String(r.id || Math.random()),
                        match_type: r.match_type || "contains",
                        keywords: r.keyword || r.keywords || "",
                        message: r.message || "",
                        template_id: r.private_template_id ? String(r.private_template_id) : null
                    })));
                } else {
                    setRules([]);
                }
            } else {
                resetForm();
            }
        } catch (error) {
            console.error("Fetch Mention Config Error:", error);
            resetForm();
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setExistingConfigId(null);
        setName("");
        setReplyType("generic");
        setMultipleReply(false);
        setCommentReplyEnabled(true);
        setHideAfterReply(false);
        setFallbackMessage("");
        setPrivateTemplateId(null);
        setHideOffensive(false);
        setDeleteOffensive(false);
        setOffensiveKeywords("");
        setOffensiveTemplateId(null);
        setRules([]);
    };

    const fetchTemplates = async () => {
        setIsLoadingTemplates(true);
        try {
            const res = await api.get(`/instagram/bot-replies?page_id=${instagramId}&platform=instagram`);
            setTemplates(Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []));
        } catch (error) {
            console.error("Fetch Templates Error:", error);
        } finally {
            setIsLoadingTemplates(false);
        }
    };

    const handleSave = async () => {
        if (!name.trim()) {
            toast.error("Strategy name is required");
            return;
        }

        if (replyType === "filter") {
            const hasEmptyKeywords = rules.some(r => !r.keywords.trim());
            if (hasEmptyKeywords) {
                toast.error("All keywords are required for filter rules");
                return;
            }
        }

        setIsSaving(true);
        try {
            const payload = {
                instagram_id: instagramId,
                name,
                reply_type: replyType,
                multiple_reply_enabled: multipleReply,
                comment_reply_enabled: commentReplyEnabled,
                hide_after_reply: hideAfterReply,
                message: fallbackMessage,
                private_template_id: privateTemplateId,
                offensive: {
                    hide_comment: hideOffensive,
                    delete_comment: deleteOffensive,
                    offensive_keywords: offensiveKeywords,
                    private_reply_template_id: offensiveTemplateId
                },
                rules: rules.map(r => ({
                    keyword: r.keywords,
                    match_type: r.match_type,
                    message: r.message,
                    private_template_id: r.template_id
                }))
            };

            let res;
            if (existingConfigId) {
                res = await api.put(`/instagram/comment-manager/mention-reply/${existingConfigId}?platform=instagram`, payload);
            } else {
                res = await api.post(`/instagram/comment-manager/mention-reply?platform=instagram`, payload);
            }

            if (res.data.success || res.data.is_success) {
                toast.success("Mention Reply Strategy saved successfully");
                onSaved();
                onClose();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save strategy");
        } finally {
            setIsSaving(false);
        }
    };

    const addRule = () => {
        setRules([...rules, {
            id: Math.random().toString(),
            match_type: "contains",
            keywords: "",
            message: "",
            template_id: null
        }]);
    };

    const removeRule = (id: string) => {
        setRules(rules.filter(r => r.id !== id));
    };

    const updateRule = (id: string, updates: Partial<FilterRule>) => {
        setRules(rules.map(r => r.id === id ? { ...r, ...updates } : r));
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

                <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 24 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 24 }}
                    className="relative z-10 w-full max-w-[950px] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh]"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-white sticky top-0 z-20">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center">
                                <AtSign size={18} />
                            </div>
                            <h2 className="text-[14px] font-semibold text-slate-800">
                                {existingConfigId ? 'Edit' : 'Create'} Mention Reply Strategy (Instagram)
                            </h2>
                        </div>
                        <button onClick={onClose} className="text-slate-300 hover:text-rose-500 transition-colors">
                            <X size={22} />
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#FDFDFF] custom-scrollbar">
                        
                        {isLoading ? (
                            <div className="h-[400px] flex flex-col items-center justify-center space-y-4">
                                <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
                                <p className="text-sm font-medium text-slate-400">Loading mention configuration...</p>
                            </div>
                        ) : (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                
                                <div className="bg-pink-50/50 border border-pink-100 rounded-xl px-6 py-3 mb-8">
                                    <p className="text-[12px] font-medium text-pink-600">Automate responses for comments where your business is @mentioned.</p>
                                </div>

                                <div className="space-y-8">
                                    
                                    {/* SECTION: BASICS */}
                                    <div className="grid grid-cols-1 md:grid-cols-1 gap-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
                                        <Field label="Mention Reply Strategy Name" required icon={Edit3}>
                                            <input
                                                type="text"
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                                placeholder="e.g. Shoutout Awareness Flow"
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px] placeholder:text-slate-300"
                                            />
                                        </Field>
                                    </div>

                                    {/* SECTION: OFFENSIVE SETTINGS */}
                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <ShieldAlert className="w-4 h-4 text-rose-500" />
                                            <h3 className="text-sm font-semibold text-slate-700">Content Moderation (Optional)</h3>
                                        </div>
                                        <div className="flex gap-8">
                                            <CustomToggle active={hideOffensive} onClick={() => setHideOffensive(!hideOffensive)} label="Hide Comment" />
                                            <CustomToggle active={deleteOffensive} onClick={() => setDeleteOffensive(!deleteOffensive)} label="Delete Comment" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <Field label="Filtered Keywords" desc="(comma separated)" icon={Filter}>
                                                <textarea
                                                    rows={4}
                                                    value={offensiveKeywords}
                                                    onChange={e => setOffensiveKeywords(e.target.value)}
                                                    placeholder="spam, scam, badword..."
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px] resize-none"
                                                />
                                            </Field>
                                            <Field label="Private Response Preset" icon={RefreshCw}>
                                                <div className="relative">
                                                    <select
                                                        value={offensiveTemplateId || ""}
                                                        onChange={e => setOffensiveTemplateId(e.target.value || null)}
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px] appearance-none bg-white cursor-pointer"
                                                    >
                                                        <option value="">Select a message template</option>
                                                        {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                                </div>
                                            </Field>
                                        </div>
                                    </div>

                                    {/* SECTION: BEHAVIOR TOGGLES */}
                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs grid grid-cols-1 gap-4">
                                        <div className="flex items-center justify-between py-1 border-b border-slate-50">
                                            <div className="flex items-center gap-3">
                                                <RefreshCw size={14} className="text-slate-400" />
                                                <span className="text-[13px] font-medium text-slate-600">Send reply every time mentioned?</span>
                                            </div>
                                            <CustomToggle active={multipleReply} onClick={() => setMultipleReply(!multipleReply)} />
                                        </div>
                                        <div className="flex items-center justify-between py-1 border-b border-slate-50">
                                            <div className="flex items-center gap-3">
                                                <MessageCircle size={14} className="text-slate-400" />
                                                <span className="text-[13px] font-medium text-slate-600">Enable automated comment responses?</span>
                                            </div>
                                            <CustomToggle active={commentReplyEnabled} onClick={() => setCommentReplyEnabled(!commentReplyEnabled)} />
                                        </div>
                                        <div className="flex items-center justify-between py-1">
                                            <div className="flex items-center gap-3">
                                                <EyeOff size={14} className="text-slate-400" />
                                                <span className="text-[13px] font-medium text-slate-600">Hide comments after response?</span>
                                            </div>
                                            <CustomToggle active={hideAfterReply} onClick={() => setHideAfterReply(!hideAfterReply)} />
                                        </div>
                                    </div>

                                    {/* SECTION: REPLY MODE */}
                                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                                        <div
                                            onClick={() => setReplyType("generic")}
                                            className={cn(
                                                "flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer group",
                                                replyType === "generic" ? "border-pink-500 bg-pink-50/30" : "border-slate-50 hover:border-slate-200"
                                            )}
                                        >
                                            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", replyType === "generic" ? "bg-pink-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200")}>
                                                <MessageSquare size={20} />
                                            </div>
                                            <div>
                                                <p className={cn("text-sm font-semibold", replyType === "generic" ? "text-slate-900" : "text-slate-500")}>Generic mode</p>
                                                <p className="text-[11px] text-slate-400 font-medium">Auto-reply to all mentions</p>
                                            </div>
                                            <div className="ml-auto">
                                                <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", replyType === "generic" ? "border-pink-600 bg-pink-600" : "border-slate-300")}>
                                                    {replyType === "generic" && <div className="w-2 h-2 rounded-full bg-white" />}
                                                </div>
                                            </div>
                                        </div>
                                        <div
                                            onClick={() => setReplyType("filter")}
                                            className={cn(
                                                "flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer group",
                                                replyType === "filter" ? "border-pink-500 bg-pink-50/30" : "border-slate-50 hover:border-slate-200"
                                            )}
                                        >
                                            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", replyType === "filter" ? "bg-pink-600 text-white" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200")}>
                                                <Settings size={20} />
                                            </div>
                                            <div>
                                                <p className={cn("text-sm font-semibold", replyType === "filter" ? "text-slate-900" : "text-slate-500")}>Intent Filter</p>
                                                <p className="text-[11px] text-slate-400 font-medium">Filter by keyword/intent</p>
                                            </div>
                                            <div className="ml-auto">
                                                <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", replyType === "filter" ? "border-pink-600 bg-pink-600" : "border-slate-300")}>
                                                    {replyType === "filter" && <div className="w-2 h-2 rounded-full bg-white" />}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECTION: CONTENT EDITOR */}
                                    <div className="space-y-8">
                                        <AnimatePresence mode="wait">
                                            {replyType === "generic" ? (
                                                <motion.div key="generic" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white p-7 rounded-2xl border border-slate-100 shadow-sm space-y-8">
                                                    <Field label="Mention Reply Content" required icon={MessageCircle}>
                                                        <div className="relative border border-slate-200 rounded-xl p-4 focus-within:border-pink-400 transition-all bg-white">
                                                            <textarea
                                                                rows={5}
                                                                value={fallbackMessage}
                                                                onChange={e => setFallbackMessage(e.target.value)}
                                                                placeholder="Thanks for mentioning us! We appreciate it..."
                                                                className="w-full outline-none font-medium text-[14px] text-slate-700 resize-none h-[120px]"
                                                            />
                                                        </div>
                                                    </Field>

                                                    <Field label="Private Reply Template" icon={Settings}>
                                                        <div className="relative">
                                                            <select
                                                                value={privateTemplateId || ""}
                                                                onChange={e => setPrivateTemplateId(e.target.value || null)}
                                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px] appearance-none bg-white cursor-pointer"
                                                            >
                                                                <option value="">Select a message template</option>
                                                                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                            </select>
                                                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                        </div>
                                                    </Field>
                                                </motion.div>
                                            ) : (
                                                <motion.div key="filter" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8">
                                                    {rules.map((rule, index) => (
                                                        <div key={rule.id} className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-8 relative group">
                                                            <div className="flex items-center justify-between border-b border-slate-50 pb-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-500">
                                                                        {index + 1}
                                                                    </div>
                                                                    <h4 className="text-[13px] font-semibold text-slate-700">Filter Logic Rule</h4>
                                                                </div>
                                                                <button onClick={() => removeRule(rule.id)} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-colors">
                                                                    <Trash2 size={15} />
                                                                </button>
                                                            </div>

                                                            <div className="flex gap-6 px-1">
                                                                <div className="flex items-center gap-2 cursor-pointer" onClick={() => updateRule(rule.id, { match_type: "contains" })}>
                                                                    <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center", rule.match_type === "contains" ? "border-pink-600 bg-pink-600" : "border-slate-300")}>
                                                                        {rule.match_type === "contains" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                                    </div>
                                                                    <span className={cn("text-[12px] font-medium", rule.match_type === "contains" ? "text-slate-900" : "text-slate-400")}>Keyword match</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 cursor-pointer" onClick={() => updateRule(rule.id, { match_type: "exact" })}>
                                                                    <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center", rule.match_type === "exact" ? "border-pink-600 bg-pink-600" : "border-slate-300")}>
                                                                        {rule.match_type === "exact" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                                    </div>
                                                                    <span className={cn("text-[12px] font-medium", rule.match_type === "exact" ? "text-slate-900" : "text-slate-400")}>Exact term</span>
                                                                </div>
                                                            </div>

                                                            <div className="grid grid-cols-1 gap-8">
                                                                <Field label="Mention Logic Keyword" required icon={Search}>
                                                                    <input
                                                                        type="text"
                                                                        value={rule.keywords}
                                                                        onChange={e => updateRule(rule.id, { keywords: e.target.value })}
                                                                        placeholder="Keywords that trigger this response..."
                                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px]"
                                                                    />
                                                                </Field>
                                                                <Field label="Specific Response Content" required icon={MessageCircle}>
                                                                    <div className="relative border border-slate-200 rounded-xl p-4 focus-within:border-pink-400 transition-all bg-white">
                                                                        <textarea
                                                                            rows={4}
                                                                            value={rule.message}
                                                                            onChange={e => updateRule(rule.id, { message: e.target.value })}
                                                                            placeholder="Type specific matching response here..."
                                                                            className="w-full outline-none font-medium text-[14px] text-slate-700 resize-none h-[100px]"
                                                                        />
                                                                    </div>
                                                                </Field>
                                                                <Field label="Private Reply Preset" icon={Settings}>
                                                                    <div className="relative">
                                                                        <select
                                                                            value={rule.template_id || ""}
                                                                            onChange={e => updateRule(rule.id, { template_id: e.target.value || null })}
                                                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px] appearance-none bg-white cursor-pointer"
                                                                        >
                                                                            <option value="">Select a message template</option>
                                                                            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                                        </select>
                                                                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                                                    </div>
                                                                </Field>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    <button onClick={addRule} className="w-full py-4 rounded-xl border-2 border-dashed border-pink-200 text-pink-600 font-semibold text-[13px] hover:bg-pink-50 transition-all flex items-center justify-center gap-2 group">
                                                        <Plus size={18} className="group-hover:rotate-90 transition-transform" /> Add logic rule
                                                    </button>

                                                    <div className="bg-slate-50/5 p-8 rounded-2xl border-2 border-dashed border-slate-100 space-y-8 mt-10">
                                                        <div className="flex items-center gap-2">
                                                            <Info className="w-4 h-4 text-slate-400" />
                                                            <h3 className="text-sm font-semibold text-slate-500">Fallback Strategy</h3>
                                                        </div>
                                                        <Field label="Default Mention Response" icon={MessageCircle}>
                                                            <div className="relative border border-slate-200 rounded-xl p-4 focus-within:border-pink-400 transition-all bg-white shadow-sm">
                                                                <textarea
                                                                    rows={4}
                                                                    value={fallbackMessage}
                                                                    onChange={e => setFallbackMessage(e.target.value)}
                                                                    placeholder="Type default response here..."
                                                                    className="w-full outline-none font-medium text-[14px] text-slate-700 resize-none h-[100px]"
                                                                />
                                                            </div>
                                                        </Field>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex gap-4 p-8 bg-white border-t border-slate-100 flex-shrink-0 relative z-20">
                        <button onClick={onClose} className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-500 font-bold text-[13px] hover:bg-slate-50 transition-all">Cancel</button>
                        <button onClick={handleSave} disabled={isSaving} className="flex-[2] py-3.5 rounded-xl bg-pink-600 text-white font-semibold text-[14px] shadow-xl shadow-pink-100 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50">
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Check size={20} />}
                            <span>{existingConfigId ? 'UPDATE STRATEGY' : 'ACTIVATE MENTION FLOW'}</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
