"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    X, Save, Zap, MessageSquare,
    ChevronDown, Info, AlertCircle,
    Pause, Play, ShieldAlert, Filter,
    Plus, Trash2, Layers, Megaphone,
    Search, Check, Sparkles, Smile, Settings, Clock, Globe, Loader2,
    RefreshCw, MessageCircle, EyeOff, LayoutGrid, Image as ImageIcon, Video,
    Edit3, ChevronLeft, BarChart2, AtSign
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useModal } from "@/components/providers/ModalProvider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────────
interface ReplyTemplate {
    id: number;
    name: string;
    reply_type: string;
    message: string;
    image?: string;
    video?: string;
    multiple_reply_enabled: boolean;
    comment_reply_enabled: boolean;
    hide_after_reply: boolean;
    private_template_id: number | null;
}

interface FilterRule {
    id?: string;
    keyword: string;
    match_type: "contains" | "exact";
    message: string;
    image: string | null;
    video: string | null;
    private_template_id: string | number | null;
}

interface PostAutoReplyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
    platform: "facebook" | "instagram";
    postId: string;
    pageId: string;
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

function CapsuleSwitch({ active }: { active: boolean }) {
    return (
        <div className={cn("w-11 h-5 rounded-full relative transition-all", active ? "bg-pink-600" : "bg-slate-300 shadow-inner")}>
            <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all", active ? "left-6.5" : "left-0.5")} />
        </div>
    );
}

// ── Main Modal ────────────────────────────────────────────────────────────────
export function PostAutoReplyModal({
    isOpen,
    onClose,
    onSaved,
    platform,
    postId,
    pageId
}: PostAutoReplyModalProps) {
    const { showModal } = useModal();
    const [view, setView] = useState<"choice" | "template" | "custom">("choice");
    const [templates, setTemplates] = useState<ReplyTemplate[]>([]);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isFetchingConfig, setIsFetchingConfig] = useState(false);
    const [existingCampaignId, setExistingCampaignId] = useState<number | null>(null);

    const [form, setForm] = useState({
        name: "",
        reply_type: "generic", // "generic" or "filter"
        multiple_reply_enabled: false,
        comment_reply_enabled: true,
        hide_after_reply: false,
        message: "",
        image: "",
        video: "",
        template_id: "" as string | number | null,
        private_template_id: "" as string | number | null,
        save_as_template: false,
        use_template: false,
        offensive: {
            hide_comment: false,
            delete_comment: false,
            offensive_keywords: "",
            private_reply_template_id: "" as string | number | null
        }
    });

    const [filterRules, setFilterRules] = useState<FilterRule[]>([]);
    const [status, setStatus] = useState<"active" | "paused">("active");

    useEffect(() => {
        if (isOpen) {
            fetchTemplates();
            if (postId) fetchCampaignConfig();
            else setView("choice");
        } else {
            resetForm();
        }
    }, [isOpen, postId]);

    const resetForm = () => {
        setExistingCampaignId(null);
        setView("choice");
        setForm({
            name: "",
            reply_type: "generic",
            multiple_reply_enabled: false,
            comment_reply_enabled: true,
            hide_after_reply: false,
            message: "",
            image: "",
            video: "",
            template_id: null,
            private_template_id: null,
            save_as_template: false,
            use_template: false,
            offensive: {
                hide_comment: false,
                delete_comment: false,
                offensive_keywords: "",
                private_reply_template_id: null
            }
        });
        setFilterRules([{ id: Math.random().toString(), keyword: "", match_type: "contains", message: "", image: "", video: "", private_template_id: "" }]);
    };

    const fetchCampaignConfig = async () => {
        setIsFetchingConfig(true);
        try {
            const base = `/instagram/comment-manager/post-auto-reply`;
            const res = await api.get(`${base}/${postId}?platform=instagram`);
            const data = res.data?.data;

            if (data) {
                setExistingCampaignId(data.id || data.post_id || 1); // some non-null value
                setStatus(data.status || "active");

                if (data.use_template || data.template_id) {
                    setView("template");
                } else {
                    setView("custom");
                }

                setForm(f => ({
                    ...f,
                    name: data.name || data.campaign_name || "",
                    reply_type: data.reply_type || "generic",
                    message: data.message || "",
                    image: data.image || "",
                    video: data.video || "",
                    multiple_reply_enabled: data.multiple_reply_enabled === "1" || data.multiple_reply_enabled === 1 || !!data.multiple_reply_enabled,
                    comment_reply_enabled: data.comment_reply_enabled !== "0" && data.comment_reply_enabled !== 0 && data.comment_reply_enabled !== false,
                    hide_after_reply: data.hide_after_reply === "1" || data.hide_after_reply === 1 || !!data.hide_after_reply,
                    template_id: data.template_id || null,
                    private_template_id: data.private_template_id || null,
                    save_as_template: false,
                    use_template: !!data.use_template,
                    offensive: {
                        hide_comment: data.offensive?.hide_comment === "1" || !!data.offensive?.hide_comment,
                        delete_comment: data.offensive?.delete_comment === "1" || !!data.offensive?.delete_comment,
                        offensive_keywords: data.offensive?.offensive_keywords || "",
                        private_reply_template_id: data.offensive?.private_reply_template_id || null
                    }
                }));

                const rules = data.rules || [];
                if (rules && Array.isArray(rules) && rules.length > 0) {
                    setFilterRules(rules.map((r: any) => ({
                        id: String(r.id || Math.random()),
                        keyword: r.keyword || r.keywords || "",
                        match_type: r.match_type || "contains",
                        message: r.message || "",
                        image: r.image || null,
                        video: r.video || null,
                        private_template_id: r.private_template_id || null
                    })));
                } else {
                    setFilterRules([{ id: Math.random().toString(), keyword: "", match_type: "contains", message: "", image: "", video: "", private_template_id: "" }]);
                }
            }
        } catch (error: any) {
            console.error("Fetch Config Error:", error);
            setView("choice");
        } finally {
            setIsFetchingConfig(false);
        }
    };

    const fetchTemplates = async () => {
        setIsLoadingTemplates(true);
        try {
            const endpoint = `/instagram/comment-manager/post-auto-reply/templates/${pageId}?platform=instagram`;
            const res = await api.get(endpoint);
            setTemplates(Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []));
        } catch (error) {
            console.error("Fetch Templates Error:", error);
        } finally {
            setIsLoadingTemplates(false);
        }
    };

    const handleSave = async () => {
        if (!form.name && view === "custom") { toast.error("Campaign name is required"); return; }
        if (!form.template_id && view === "template") { toast.error("Please select a template"); return; }

        setIsSaving(true);
        try {
            const endpoint = `/instagram/comment-manager/post-auto-reply`;
            const payload: any = {
                post_id: postId,
                instagram_id: pageId,
                use_template: view === "template",
                name: form.name,
                reply_type: form.reply_type,
                message: form.message,
                save_as_template: form.save_as_template,
            };

            // Enhanced fields
            if (view === "template") {
                payload.template_id = form.template_id;
            } else {
                payload.multiple_reply_enabled = form.multiple_reply_enabled;
                payload.comment_reply_enabled = form.comment_reply_enabled;
                payload.hide_after_reply = form.hide_after_reply;
                payload.private_template_id = form.private_template_id;
                payload.offensive = {
                    hide_comment: form.offensive.hide_comment,
                    delete_comment: form.offensive.delete_comment,
                    offensive_keywords: form.offensive.offensive_keywords,
                    private_reply_template_id: form.offensive.private_reply_template_id
                };
                payload.rules = filterRules.map(r => ({
                    keyword: r.keyword,
                    match_type: r.match_type,
                    message: r.message,
                    private_template_id: r.private_template_id
                }));
            }

            let res;
            if (existingCampaignId) {
                res = await api.put(`${endpoint}/${postId}?platform=instagram`, payload);
            } else {
                res = await api.post(`${endpoint}?platform=instagram`, payload);
            }

            if (res.data.success || res.data.is_success) {
                toast.success(existingCampaignId ? "Campaign updated!" : "Post automation activated!");
                onSaved();
                onClose();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to save campaign");
        } finally {
            setIsSaving(false);
        }
    };

    const handleStatusToggle = async () => {
        setIsSaving(true);
        try {
            const newStatus = status === "active" ? "paused" : "active";
            const res = await api.post(`/instagram/comment-manager/post-auto-reply/status?platform=instagram`, {
                post_id: postId,
                status: newStatus
            });
            if (res.data.success || res.data.is_success) {
                setStatus(newStatus);
                toast.success(`Automation ${newStatus === 'active' ? 'resumed' : 'paused'}`);
                onSaved();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Status update failed");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure? This will remove all automation rules for this post.")) return;
        setIsDeleting(true);
        try {
            const res = await api.delete(`/instagram/comment-manager/post-auto-reply/${postId}?platform=instagram`);
            if (res.data.success || res.data.is_success) {
                toast.success("Post automation removed");
                onSaved();
                onClose();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Removal failed");
        } finally {
            setIsDeleting(false);
        }
    };

    const addRule = () => {
        setFilterRules([...filterRules, { id: Math.random().toString(), keyword: "", match_type: "contains", message: "", image: null, video: null, private_template_id: null }]);
    };

    const removeRule = (id: string) => {
        setFilterRules(filterRules.filter(r => r.id !== id));
    };

    const updateRule = (id: string, updates: Partial<FilterRule>) => {
        setFilterRules(rules => rules.map(r => r.id === id ? { ...r, ...updates } : r));
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
                    className={cn(
                        "relative z-10 w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh] transition-all",
                        view === "choice" ? "max-w-lg" : "max-w-[950px]"
                    )}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-white sticky top-0 z-20">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center">
                                <Zap size={18} />
                            </div>
                            <h2 className="text-[14px] font-semibold text-slate-800">
                                {view === "choice" ? "Post Automation Hub" : (existingCampaignId ? 'Edit' : 'Configure') + ' Post Auto Reply'}
                            </h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {existingCampaignId && view !== "choice" && (
                                <>
                                    <button onClick={handleStatusToggle} className={cn("px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all", status === "active" ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100")}>
                                        {status === "active" ? "Pause" : "Resume"}
                                    </button>
                                    <button onClick={handleDelete} disabled={isDeleting} className="w-9 h-9 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all">
                                        {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                    </button>
                                </>
                            )}
                            <button onClick={onClose} className="text-slate-300 hover:text-rose-500 transition-colors ml-4">
                                <X size={22} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#FDFDFF] custom-scrollbar">
                        <AnimatePresence mode="wait">
                            {isFetchingConfig ? (
                                <div className="h-[300px] flex flex-col items-center justify-center space-y-4">
                                    <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
                                    <p className="text-sm font-medium text-slate-400">Syncing post configuration...</p>
                                </div>
                            ) : view === "choice" ? (
                                <motion.div key="choice" className="space-y-6 text-center py-8">
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-bold text-slate-900">CHOOSE STRATEGY</h3>
                                        <p className="text-sm text-slate-500 font-medium">Pick a deployment path for this post</p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-4 max-w-sm mx-auto pt-6">
                                        <button onClick={() => setView("template")} className="group p-6 rounded-2xl border-2 border-slate-100 hover:border-pink-600 hover:bg-pink-50/30 transition-all text-left">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center group-hover:bg-pink-600 group-hover:text-white transition-all shadow-sm">
                                                    <Layers size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-[14px] font-bold text-slate-800 uppercase tracking-tight">Template Engine</p>
                                                    <p className="text-[11px] text-slate-400 font-medium tracking-tight">Pick from existing presets</p>
                                                </div>
                                            </div>
                                        </button>
                                        <button onClick={() => setView("custom")} className="group p-6 rounded-2xl border-2 border-slate-100 hover:border-pink-600 hover:bg-pink-50/30 transition-all text-left">
                                            <div className="flex items-center gap-5">
                                                <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-pink-600 group-hover:text-white transition-all shadow-sm">
                                                    <Edit3 size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-[14px] font-bold text-slate-800 uppercase tracking-tight">Direct Build</p>
                                                    <p className="text-[11px] text-slate-400 font-medium tracking-tight">Create specific rules now</p>
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                </motion.div>
                            ) : view === "template" ? (
                                <motion.div key="template" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-lg mx-auto py-8">
                                    <div className="bg-white p-10 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-center">
                                        <div className="w-16 h-16 rounded-2xl bg-pink-50 flex items-center justify-center mx-auto text-pink-600 shadow-inner">
                                            <Layers className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 uppercase">Link Template</h3>
                                            <p className="text-sm text-slate-400 font-medium px-4 mt-1">Deploy rules from your preset inventory.</p>
                                        </div>
                                        <div className="space-y-4 pt-6 text-left">
                                            <Field label="Choose Asset Preset" required icon={Plus}>
                                                <div className="relative">
                                                    <select
                                                        value={form.template_id || ""}
                                                        onChange={(e) => setForm({ ...form, template_id: e.target.value })}
                                                        className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all text-[14px] font-medium appearance-none bg-white cursor-pointer"
                                                    >
                                                        <option value="" disabled>{isLoadingTemplates ? "Loading Assets..." : "Select Template"}</option>
                                                        {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                    </select>
                                                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                                </div>
                                            </Field>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div key="custom" className="space-y-8 animate-in fade-in duration-500">
                                    {/* SECTION: BASICS */}
                                    <div className="bg-white p-7 rounded-2xl border border-slate-100 shadow-xs">
                                        <Field label="Auto Reply Campaign Name" required icon={Edit3}>
                                            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px] placeholder:text-slate-300"
                                                placeholder="e.g. Daily Engagement Flow"
                                            />
                                        </Field>
                                    </div>

                                    {/* SECTION: OFFENSIVE */}
                                    <div className="bg-white p-7 rounded-2xl border border-slate-100 shadow-xs space-y-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <ShieldAlert className="w-4 h-4 text-rose-500" />
                                            <h3 className="text-sm font-semibold text-slate-700">Offensive Comments Settings</h3>
                                        </div>
                                        <div className="flex gap-8">
                                            <CustomToggle active={form.offensive.hide_comment} onClick={() => setForm({ ...form, offensive: { ...form.offensive, hide_comment: !form.offensive.hide_comment } })} label="Hide" />
                                            <CustomToggle active={form.offensive.delete_comment} onClick={() => setForm({ ...form, offensive: { ...form.offensive, delete_comment: !form.offensive.delete_comment } })} label="Delete" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <Field label="Keywords to Filter" desc="(comma separated)" icon={Filter}>
                                                <textarea rows={4} value={form.offensive.offensive_keywords} onChange={e => setForm({ ...form, offensive: { ...form.offensive, offensive_keywords: e.target.value } })}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px] resize-none"
                                                    placeholder="spam, scam..."
                                                />
                                            </Field>
                                            <Field label="Private Warning Preset" icon={RefreshCw}>
                                                <div className="relative">
                                                    <select
                                                        value={form.offensive.private_reply_template_id || ""}
                                                        onChange={e => setForm({ ...form, offensive: { ...form.offensive, private_reply_template_id: e.target.value } })}
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px] appearance-none bg-white cursor-pointer"
                                                    >
                                                        <option value="">Select template</option>
                                                        {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                    </select>
                                                    <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                                </div>
                                            </Field>
                                        </div>
                                    </div>

                                    {/* SECTION: BEHAVIOR */}
                                    <div className="bg-white p-7 rounded-2xl border border-slate-100 shadow-xs grid grid-cols-1 gap-4">
                                        <div className="flex items-center justify-between py-1 border-b border-slate-50">
                                            <div className="flex items-center gap-3">
                                                <RefreshCw size={14} className="text-slate-400" />
                                                <span className="text-[13px] font-medium text-slate-600">Reply multiple times?</span>
                                            </div>
                                            <CustomToggle active={form.multiple_reply_enabled} onClick={() => setForm({ ...form, multiple_reply_enabled: !form.multiple_reply_enabled })} />
                                        </div>
                                        <div className="flex items-center justify-between py-1 border-b border-slate-50">
                                            <div className="flex items-center gap-3">
                                                <MessageCircle size={14} className="text-slate-400" />
                                                <span className="text-[13px] font-medium text-slate-600">Enable comment reply?</span>
                                            </div>
                                            <CustomToggle active={form.comment_reply_enabled} onClick={() => setForm({ ...form, comment_reply_enabled: !form.comment_reply_enabled })} />
                                        </div>
                                        <div className="flex items-center justify-between py-1">
                                            <div className="flex items-center gap-3">
                                                <EyeOff size={14} className="text-slate-400" />
                                                <span className="text-[13px] font-medium text-slate-600">Hide comments after reply?</span>
                                            </div>
                                            <CustomToggle active={form.hide_after_reply} onClick={() => setForm({ ...form, hide_after_reply: !form.hide_after_reply })} />
                                        </div>
                                    </div>

                                    {/* SECTION: REPLY MODE */}
                                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                                        <div onClick={() => setForm({ ...form, reply_type: "generic" })} className={cn("flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer", form.reply_type === "generic" ? "border-pink-500 bg-pink-50/30" : "border-slate-50")}>
                                            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", form.reply_type === "generic" ? "bg-pink-600 text-white" : "bg-slate-100")}>
                                                <AtSign size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">Generic Mode</p>
                                                <p className="text-[11px] text-slate-400 font-medium">Broadcast to all</p>
                                            </div>
                                            <div className="ml-auto">
                                                <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", form.reply_type === "generic" ? "border-pink-600 bg-pink-600" : "border-slate-300")}>
                                                    {form.reply_type === "generic" && <div className="w-2 h-2 rounded-full bg-white" />}
                                                </div>
                                            </div>
                                        </div>
                                        <div onClick={() => setForm({ ...form, reply_type: "filter" })} className={cn("flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer", form.reply_type === "filter" ? "border-pink-500 bg-pink-50/30" : "border-slate-50")}>
                                            <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", form.reply_type === "filter" ? "bg-pink-600 text-white" : "bg-slate-100")}>
                                                <Settings size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">Intelligence Filter</p>
                                                <p className="text-[11px] text-slate-400 font-medium">Keyword matching</p>
                                            </div>
                                            <div className="ml-auto">
                                                <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center", form.reply_type === "filter" ? "border-pink-600 bg-pink-600" : "border-slate-300")}>
                                                    {form.reply_type === "filter" && <div className="w-2 h-2 rounded-full bg-white" />}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECTION: CONTENT */}
                                    <div className="space-y-8">
                                        <AnimatePresence mode="wait">
                                            {form.reply_type === "generic" ? (
                                                <motion.div key="generic" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-7 rounded-2xl border border-slate-100 shadow-sm space-y-8">
                                                    <Field label="Comment Response Message" required icon={MessageCircle}>
                                                        <div className="relative border border-slate-200 rounded-xl p-4 focus-within:border-pink-400 bg-white">
                                                            <textarea rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                                                                className="w-full outline-none font-medium text-[14px] text-slate-700 resize-none h-[120px]"
                                                                placeholder="Type your message here..."
                                                            />
                                                        </div>
                                                    </Field>
                                                    <Field label="Private Reply Preset" icon={RefreshCw}>
                                                        <div className="relative">
                                                            <select value={form.private_template_id ?? ""} onChange={e => setForm({ ...form, private_template_id: e.target.value })}
                                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px] appearance-none bg-white cursor-pointer"
                                                            >
                                                                <option value="">Select a message template</option>
                                                                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                            </select>
                                                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                                        </div>
                                                    </Field>
                                                </motion.div>
                                            ) : (
                                                <motion.div key="filter" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                                    {filterRules.map((rule, idx) => (
                                                        <div key={rule.id} className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-8 relative">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-500">{idx + 1}</div>
                                                                    <h4 className="text-[13px] font-semibold text-slate-700">Filter Logic Rule</h4>
                                                                </div>
                                                                <button onClick={() => removeRule(rule.id!!)} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all">
                                                                    <Trash2 size={15} />
                                                                </button>
                                                            </div>
                                                            <div className="flex gap-6 px-1">
                                                                <div className="flex items-center gap-2 cursor-pointer" onClick={() => updateRule(rule.id!!, { match_type: "contains" })}>
                                                                    <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center", rule.match_type === "contains" ? "border-pink-600 bg-pink-600" : "border-slate-300")}>
                                                                        {rule.match_type === "contains" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                                    </div>
                                                                    <span className={cn("text-[12px] font-medium", rule.match_type === "contains" ? "text-slate-900" : "text-slate-400")}>Keyword match</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 cursor-pointer" onClick={() => updateRule(rule.id!!, { match_type: "exact" })}>
                                                                    <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center", rule.match_type === "exact" ? "border-pink-600 bg-pink-600" : "border-slate-300")}>
                                                                        {rule.match_type === "exact" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                                    </div>
                                                                    <span className={cn("text-[12px] font-medium", rule.match_type === "exact" ? "text-slate-900" : "text-slate-400")}>Exact term</span>
                                                                </div>
                                                            </div>
                                                            <div className="grid grid-cols-1 gap-8">
                                                                <Field label="Trigger Keyword" required icon={Search}>
                                                                    <input type="text" value={rule.keyword} onChange={e => updateRule(rule.id!!, { keyword: e.target.value })}
                                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px]"
                                                                        placeholder="Trigger keyword..."
                                                                    />
                                                                </Field>
                                                                <Field label="Matching Response" required icon={MessageCircle}>
                                                                    <div className="relative border border-slate-200 rounded-xl p-4 focus-within:border-pink-400 bg-white">
                                                                        <textarea rows={4} value={rule.message} onChange={e => updateRule(rule.id!!, { message: e.target.value })}
                                                                            className="w-full outline-none font-medium text-[14px] text-slate-700 resize-none h-[100px]"
                                                                        />
                                                                    </div>
                                                                </Field>
                                                                <Field label="Private Preset" icon={Settings}>
                                                                    <div className="relative">
                                                                        <select value={rule.private_template_id || ""} onChange={e => updateRule(rule.id!!, { private_template_id: e.target.value })}
                                                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px] appearance-none bg-white cursor-pointer"
                                                                        >
                                                                            <option value="">Select template</option>
                                                                            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                                        </select>
                                                                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
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
                                                            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-tight">Fallback Deployment Logic</h3>
                                                        </div>
                                                        <Field label="Default Response Content" icon={MessageCircle}>
                                                            <div className="relative border border-slate-200 rounded-xl p-4 focus-within:border-pink-400 transition-all bg-white shadow-sm">
                                                                <textarea rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                                                                    className="w-full outline-none font-medium text-[14px] text-slate-700 resize-none h-[100px]"
                                                                />
                                                            </div>
                                                        </Field>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    <div className="flex flex-col gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                                        <CustomToggle active={form.save_as_template} onClick={() => setForm({ ...form, save_as_template: !form.save_as_template })} label="Save this configuration as a generic template?" />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex gap-4 p-8 bg-white border-t border-slate-100 flex-shrink-0 relative z-20">
                        <button onClick={view === "choice" ? onClose : () => setView("choice")} className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-500 font-bold text-[13px] hover:bg-slate-50 transition-all">
                            {view === "choice" ? "Cancel" : "Back to Choice"}
                        </button>
                        {view !== "choice" && (
                            <button onClick={handleSave} disabled={isSaving} className="flex-[2] py-3.5 rounded-xl bg-pink-600 text-white font-semibold text-[14px] shadow-xl shadow-pink-100 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50">
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Check size={20} />}
                                <span>{existingCampaignId ? 'UPDATE AUTO REPLY' : 'ENABLE AUTO REPLY'}</span>
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
