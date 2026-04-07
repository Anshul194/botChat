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
import { TextareaWithEmoji } from "@/components/ui/EmojiPicker";

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
        <div className="space-y-1.5 flex-1 min-w-0">
            <label className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
                {label} {required && <span className="text-rose-400">*</span>}
                {desc && <span className="text-[10px] text-slate-400 font-medium ml-auto">{desc}</span>}
            </label>
            {children}
        </div>
    );
}

function CustomToggle({ active, onClick, label }: { active: boolean; onClick: () => void; label?: string }) {
    return (
        <div className="flex items-center gap-3 group cursor-pointer" onClick={onClick}>
            {label && <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">{label}</span>}
            <div className="flex items-center gap-2">
                <div className={cn(
                    "w-10 h-5 rounded-full relative transition-all duration-200",
                    active ? "bg-pink-500" : "bg-slate-200"
                )}>
                    <div className={cn(
                        "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all",
                        active ? "left-5.5" : "left-0.5"
                    )} />
                </div>
                <span className="text-xs font-medium text-slate-400 w-6">{active ? "On" : "Off"}</span>
            </div>
        </div>
    );
}

function CapsuleSwitch({ active }: { active: boolean }) {
    return (
        <div className={cn("w-11 h-5 rounded-full relative transition-all", active ? "bg-pink-600" : "bg-slate-300 shadow-inner")}>
            <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all", active ? "left-6.5" : "left-0.5")} />
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
    const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
    const addRecent = (e: string) => setRecentEmojis(p => [e, ...p.filter(x => x !== e)].slice(0, 32));

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
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
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
                                <p className="text-sm font-medium text-slate-400">Loading configuration...</p>
                            </div>
                        ) : (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                
                                {/* SECTION: BASICS */}
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
                                    <Field label="Mention Reply Campaign Name" required>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={e => setName(e.target.value)}
                                            placeholder="Write your mention reply campaign name here"
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px]"
                                        />
                                    </Field>
                                </div>

                                {/* SECTION: OFFENSIVE SETTINGS */}
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                                        <h3 className="text-sm font-semibold text-slate-700">Offensive Comments Settings</h3>
                                    </div>
                                    <div className="flex gap-8">
                                        <CustomToggle active={hideOffensive} onClick={() => setHideOffensive(!hideOffensive)} label="Hide Comment" />
                                        <CustomToggle active={deleteOffensive} onClick={() => setDeleteOffensive(!deleteOffensive)} label="Delete Comment" />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-600">Offensive keywords <span className="text-slate-400 font-normal">(comma separated)</span></label>
                                            <div className="relative">
                                                <textarea rows={4} value={offensiveKeywords} onChange={e => setOffensiveKeywords(e.target.value)}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px] resize-none"
                                                    placeholder="keyword1, keyword2..."
                                                />
                                                <Edit3 className="absolute bottom-3 right-3 w-4 h-4 text-slate-300" />
                                            </div>
                                        </div>
                                        <div className="space-y-5">
                                            <div className="flex items-center justify-between px-1">
                                                <label className="text-sm font-medium text-slate-600">Private reply template</label>
                                                <div className="flex gap-3 text-xs font-medium text-pink-500">
                                                    <button onClick={() => fetchTemplates()} className="hover:underline flex items-center gap-1">
                                                        <RefreshCw className={cn("w-2.5 h-2.5", isLoadingTemplates && "animate-spin")} /> Refresh List
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <select
                                                    value={offensiveTemplateId || ""}
                                                    onChange={e => setOffensiveTemplateId(e.target.value || null)}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px] appearance-none cursor-pointer bg-white"
                                                >
                                                    <option value="">Please select a message template</option>
                                                    {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* SECTION: BEHAVIOR TOGGLES */}
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs grid grid-cols-1 gap-4">
                                    <div className="flex items-center justify-between py-1 px-1">
                                        <div className="flex items-center gap-3">
                                            <RefreshCw className="w-4 h-4 text-slate-400" />
                                            <span className="text-[13px] font-medium text-slate-600">Do you want to send reply message to a user multiple times?</span>
                                        </div>
                                        <CustomToggle active={multipleReply} onClick={() => setMultipleReply(!multipleReply)} />
                                    </div>
                                    <div className="flex items-center justify-between py-1 px-1 border-t border-slate-50">
                                        <div className="flex items-center gap-3">
                                            <MessageCircle className="w-4 h-4 text-slate-400" />
                                            <span className="text-[13px] font-medium text-slate-600">Do you want to enable comment reply?</span>
                                        </div>
                                        <CustomToggle active={commentReplyEnabled} onClick={() => setCommentReplyEnabled(!commentReplyEnabled)} />
                                    </div>
                                    <div className="flex items-center justify-between py-1 px-1 border-t border-slate-50">
                                        <div className="flex items-center gap-3">
                                            <EyeOff className="w-4 h-4 text-slate-400" />
                                            <span className="text-[13px] font-medium text-slate-600">Do you want to hide comments after comment reply?</span>
                                        </div>
                                        <CustomToggle active={hideAfterReply} onClick={() => setHideAfterReply(!hideAfterReply)} />
                                    </div>
                                </div>

                                {/* SECTION: MODE SELECTION */}
                                <div className="bg-white border border-slate-100 rounded-[22px] p-6 shadow-xs space-y-5">
                                    <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setReplyType("generic")}>
                                        <CapsuleSwitch active={replyType === "generic"} />
                                        <span className={cn("text-sm font-medium", replyType === "generic" ? "text-pink-600" : "text-slate-400")}>Generic message for all mentions</span>
                                    </div>
                                    <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setReplyType("filter")}>
                                        <CapsuleSwitch active={replyType === "filter"} />
                                        <span className={cn("text-sm font-medium", replyType === "filter" ? "text-pink-600" : "text-slate-400")}>Send different messages by keyword filter</span>
                                    </div>
                                </div>

                                {/* SECTION: CONTENT EDITOR */}
                                <div className="space-y-8">
                                    <AnimatePresence mode="wait">
                                        {replyType === "generic" ? (
                                            <motion.div key="generic" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-white p-7 rounded-2xl border border-slate-100 shadow-sm space-y-8">
                                                <Field label="Message for Comment Reply" required icon={MessageCircle}>
                                                    <div className="relative border border-slate-200 rounded-2xl p-4 focus-within:border-pink-400 transition-all bg-white">
                                                        <TextareaWithEmoji
                                                            value={fallbackMessage}
                                                            onChange={setFallbackMessage}
                                                            placeholder="Type your message here..."
                                                            rows={5}
                                                            minHeight="120px"
                                                            recent={recentEmojis}
                                                            onAddRecent={addRecent}
                                                        />
                                                    </div>
                                                </Field>

                                                <div className="space-y-4">
                                                    <div className="flex items-center justify-between px-1">
                                                        <label className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                                                            <Settings className="w-3.5 h-3.5 text-slate-400" /> Private reply template
                                                        </label>
                                                        <div className="flex gap-3 text-xs font-medium text-pink-500">
                                                            <button onClick={() => fetchTemplates()} className="hover:underline flex items-center gap-1">
                                                                <RefreshCw className={cn("w-2.5 h-2.5", isLoadingTemplates && "animate-spin")} /> Refresh List
                                                            </button>
                                                        </div>
                                                    </div>
                                                    <div className="relative">
                                                        <select
                                                            value={privateTemplateId || ""}
                                                            onChange={e => setPrivateTemplateId(e.target.value || null)}
                                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px] appearance-none bg-white cursor-pointer"
                                                        >
                                                            <option value="">Please select a message template</option>
                                                            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                        </select>
                                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                                    </div>
                                                </div>
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
                                                            <div className="flex items-center gap-6 px-1">
                                                                <div className="flex items-center gap-3 cursor-pointer" onClick={() => updateRule(rule.id, { match_type: "contains" })}>
                                                                    <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all", rule.match_type === "contains" ? "border-pink-600 bg-pink-600" : "border-slate-300")}>
                                                                        {rule.match_type === "contains" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                                    </div>
                                                                    <span className={cn("text-xs font-medium", rule.match_type === "contains" ? "text-slate-700" : "text-slate-400")}>Contains word</span>
                                                                </div>
                                                                <div className="flex items-center gap-3 cursor-pointer" onClick={() => updateRule(rule.id, { match_type: "exact" })}>
                                                                    <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all", rule.match_type === "exact" ? "border-pink-600 bg-pink-600" : "border-slate-300")}>
                                                                        {rule.match_type === "exact" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                                    </div>
                                                                    <span className={cn("text-xs font-medium", rule.match_type === "exact" ? "text-slate-700" : "text-slate-400")}>Exact match</span>
                                                                </div>
                                                            </div>
                                                            <button onClick={() => removeRule(rule.id)} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-colors">
                                                                <Trash2 size={15} />
                                                            </button>
                                                        </div>

                                                        <div className="grid grid-cols-1 gap-8">
                                                            <Field label="Filter Word/Sentence" required>
                                                                <input
                                                                    type="text"
                                                                    value={rule.keywords}
                                                                    onChange={e => updateRule(rule.id, { keywords: e.target.value })}
                                                                    placeholder="Write your filter word here"
                                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px]"
                                                                />
                                                            </Field>
                                                            <Field label="Message for Comment Reply" required icon={MessageCircle}>
                                                                <div className="relative border border-slate-200 rounded-2xl p-4 focus-within:border-pink-400 transition-all bg-white">
                                                                    <TextareaWithEmoji
                                                                        value={rule.message}
                                                                        onChange={v => updateRule(rule.id, { message: v })}
                                                                        placeholder="Type your message here..."
                                                                        rows={4}
                                                                        minHeight="100px"
                                                                        recent={recentEmojis}
                                                                        onAddRecent={addRecent}
                                                                    />
                                                                </div>
                                                            </Field>
                                                            <div className="space-y-4">
                                                                <div className="flex items-center justify-between px-1">
                                                                    <label className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                                                                        <Settings className="w-3.5 h-3.5 text-slate-400" /> Private reply template
                                                                    </label>
                                                                    <div className="flex gap-3 text-xs font-medium text-pink-500">
                                                                        <button onClick={() => fetchTemplates()} className="hover:underline flex items-center gap-1">
                                                                            <RefreshCw className={cn("w-2.5 h-2.5", isLoadingTemplates && "animate-spin")} /> Refresh List
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                                <div className="relative">
                                                                    <select
                                                                        value={rule.template_id || ""}
                                                                        onChange={e => updateRule(rule.id, { template_id: e.target.value || null })}
                                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px] appearance-none bg-white cursor-pointer"
                                                                    >
                                                                        <option value="">Please select a message template</option>
                                                                        {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                                    </select>
                                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}

                                                <div className="flex justify-end">
                                                    <button onClick={addRule} className="px-6 py-2.5 rounded-xl border-2 border-pink-600 text-pink-600 font-semibold text-[11px] hover:bg-pink-50 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-pink-100/20">
                                                        <Plus className="w-4 h-4" /> Add another filter rule
                                                    </button>
                                                </div>

                                                {/* FALLBACK FOR FILTER */}
                                                <div className="bg-slate-50/50 p-8 rounded-2xl border border-slate-200 border-dashed space-y-8">
                                                    <div className="flex items-center gap-3">
                                                        <Info className="w-4 h-4 text-slate-400" />
                                                        <span className="text-sm font-medium text-slate-500">Fallback reply (when no filter matches)</span>
                                                    </div>
                                                    <Field label="Message for Comment Reply" icon={MessageCircle}>
                                                        <div className="relative border border-slate-200 rounded-2xl p-4 focus-within:border-pink-400 transition-all bg-white shadow-sm">
                                                            <TextareaWithEmoji
                                                                value={fallbackMessage}
                                                                onChange={setFallbackMessage}
                                                                placeholder="Type default response here..."
                                                                rows={4}
                                                                minHeight="100px"
                                                                recent={recentEmojis}
                                                                onAddRecent={addRecent}
                                                            />
                                                        </div>
                                                    </Field>
                                                    <div className="space-y-4">
                                                        <div className="flex items-center justify-between px-1">
                                                            <label className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                                                                <Settings className="w-3.5 h-3.5 text-slate-400" /> Private reply template (Fallback)
                                                            </label>
                                                            <div className="flex gap-3 text-xs font-medium text-pink-500">
                                                                <button onClick={() => fetchTemplates()} className="hover:underline flex items-center gap-1">
                                                                    <RefreshCw className={cn("w-2.5 h-2.5", isLoadingTemplates && "animate-spin")} /> Refresh List
                                                                </button>
                                                            </div>
                                                        </div>
                                                        <div className="relative">
                                                            <select
                                                                value={privateTemplateId || ""}
                                                                onChange={e => setPrivateTemplateId(e.target.value || null)}
                                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px] appearance-none bg-white cursor-pointer shadow-sm"
                                                            >
                                                                <option value="">Please select a message template</option>
                                                                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                            </select>
                                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    <div className="flex gap-4 p-8 bg-white border-t border-slate-100 flex-shrink-0 relative z-20">
                        <button onClick={onClose} className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-500 font-bold text-[13px] hover:bg-slate-50 transition-all">Cancel</button>
                        <button onClick={handleSave} disabled={isSaving} className="flex-[2] py-3.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 text-white font-semibold text-[14px] shadow-xl shadow-pink-100 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50">
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Check size={20} />}
                            <span>{existingConfigId ? 'UPDATE CHANGES' : 'ACTIVATE STRATEGY'}</span>
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
