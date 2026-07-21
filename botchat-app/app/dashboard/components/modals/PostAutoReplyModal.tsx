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
import { TextareaWithEmoji } from "@/components/ui/EmojiPicker";

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
        <div className="space-y-1.5 flex-1 min-w-0">
            <label className="text-sm font-medium text-[var(--muted-foreground)] flex items-center gap-1.5">
                {Icon && <Icon className="w-3.5 h-3.5 text-[var(--muted-foreground)]/70" />}
                {label} {required && <span className="text-rose-400">*</span>}
                {desc && <span className="text-[10px] text-[var(--muted-foreground)]/70 font-medium ml-auto">{desc}</span>}
            </label>
            {children}
        </div>
    );
}

function CustomToggle({ active, onClick, label }: { active: boolean; onClick: () => void; label?: string }) {
    return (
        <div className="flex items-center gap-3 group cursor-pointer" onClick={onClick}>
            {label && <span className="text-sm font-medium text-[var(--muted-foreground)] group-hover:text-[var(--foreground)] transition-colors">{label}</span>}
            <div className="flex items-center gap-2">
                <div className={cn(
                    "w-10 h-5 rounded-full relative transition-all duration-200",
                    active ? "bg-[var(--primary)]" : "bg-[var(--muted)]/70"
                )}>
                    <div className={cn(
                        "absolute top-0.5 w-4 h-4 rounded-full bg-[var(--card)] shadow transition-all",
                        active ? "left-5.5" : "left-0.5"
                    )} />
                </div>
                <span className="text-xs font-medium text-[var(--muted-foreground)]/70 w-6">{active ? "On" : "Off"}</span>
            </div>
        </div>
    );
}

function CapsuleSwitch({ active }: { active: boolean }) {
    return (
        <div className={cn("w-11 h-5 rounded-full relative transition-all", active ? "bg-[var(--primary)]" : "bg-[var(--muted)] shadow-inner")}>
            <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-[var(--card)] transition-all", active ? "left-6.5" : "left-0.5")} />
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
    const [botReplies, setBotReplies] = useState<any[]>([]);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
    const [isLoadingBotReplies, setIsLoadingBotReplies] = useState(false);
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
    const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
    const addRecent = (e: string) => setRecentEmojis(p => [e, ...p.filter(x => x !== e)].slice(0, 32));

    useEffect(() => {
        if (isOpen) {
            fetchTemplates();
            fetchBotReplies();
            if (postId) fetchCampaignConfig();
            else setView("choice");
        } else {
            resetForm();
        }
    }, [isOpen, postId, pageId]);

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
            const base = platform === "facebook"
                ? `/facebook/post-auto-reply`
                : `/instagram/comment-manager/post-auto-reply`;

            const params: any = {};
            if (platform === "facebook") {
                params.page_id = pageId;
                params.post_id = postId;
            } else {
                params.platform = "instagram";
            }

            const fetchUrl = platform === "facebook" ? `${base}/${postId}` : `${base}/${postId}`;
            const res = await api.get(fetchUrl, { params });
            const data = res.data?.data;

            if (data) {
                setExistingCampaignId(data.id || data.post_id || 1); // some non-null value
                setStatus(data.status || "active");

                const isUseTemplate = data.use_template === "1" || data.use_template === 1 || data.use_template === true;

                if (isUseTemplate) {
                    setView("template");
                } else {
                    setView("custom");
                }

                const configData = data.template || data;

                setForm(f => ({
                    ...f,
                    name: configData.name || configData.campaign_name || "",
                    reply_type: configData.reply_type || "generic",
                    message: configData.message || "",
                    image: configData.image || "",
                    video: configData.video || "",
                    multiple_reply_enabled: configData.multiple_reply_enabled === "1" || configData.multiple_reply_enabled === 1 || !!configData.multiple_reply_enabled,
                    comment_reply_enabled: configData.comment_reply_enabled !== "0" && configData.comment_reply_enabled !== 0 && configData.comment_reply_enabled !== false,
                    hide_after_reply: configData.hide_after_reply === "1" || configData.hide_after_reply === 1 || !!configData.hide_after_reply,
                    template_id: data.template_id || null,
                    private_template_id: configData.private_template_id || null,
                    save_as_template: false,
                    use_template: isUseTemplate,
                    offensive: {
                        hide_comment: configData.offensive?.hide_comment === "1" || !!configData.offensive?.hide_comment,
                        delete_comment: configData.offensive?.delete_comment === "1" || !!configData.offensive?.delete_comment,
                        offensive_keywords: configData.offensive?.offensive_keywords || "",
                        private_reply_template_id: configData.offensive?.private_reply_template_id || null
                    }
                }));

                const rules = configData.rules || [];
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
            const endpoint = platform === "facebook"
                ? `/facebook/auto-reply-template`
                : `/instagram/auto-reply-template?platform=instagram`;
            const res = await api.get(endpoint);
            setTemplates(Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []));
        } catch (error) {
            console.error("Fetch Templates Error:", error);
        } finally {
            setIsLoadingTemplates(false);
        }
    };

    const fetchBotReplies = async () => {
        setIsLoadingBotReplies(true);
        try {
            const endpoint = platform === "facebook"
                ? `/facebook/bot-replies?facebook_page_id=${pageId}`
                : `/instagram/bot-replies?page_id=${pageId}&platform=instagram`;
            const res = await api.get(endpoint);
            setBotReplies(Array.isArray(res.data?.data) ? res.data.data : (Array.isArray(res.data) ? res.data : []));
        } catch (error) {
            console.error("Fetch Bot Replies Error:", error);
        } finally {
            setIsLoadingBotReplies(false);
        }
    };

    const handleSave = async () => {
        if (!form.name && view === "custom") { toast.error("Campaign name is required"); return; }
        if (!form.template_id && view === "template") { toast.error("Please select a template"); return; }

        setIsSaving(true);
        const isFB = platform === "facebook";
        const endpoint = isFB ? `/facebook/post-auto-reply` : `/instagram/comment-manager/post-auto-reply`;

        try {
            const payload: any = {
                post_id: postId,
                use_template: view === "template",
                name: form.name,
                reply_type: form.reply_type,
                message: form.message,
                image: form.image || null,
                video: form.video || null,
                save_as_template: form.save_as_template,
            };

            if (isFB) {
                payload.facebook_page_id = pageId;
            } else {
                payload.instagram_id = pageId;
                payload.platform = "instagram";
            }

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
                if (form.reply_type !== "generic") {
                    payload.rules = (filterRules || []).map(r => ({
                        keyword: r.keyword,
                        match_type: r.match_type,
                        message: r.message,
                        image: r.image || null,
                        video: r.video || null,
                        private_template_id: r.private_template_id
                    }));
                }
            }

            let res;
            if (existingCampaignId) {
                const updateUrl = isFB ? `${endpoint}/${postId}` : `${endpoint}/${postId}?platform=instagram`;
                res = await api.put(updateUrl, payload);
            } else {
                const createUrl = isFB ? endpoint : `${endpoint}?platform=instagram`;
                res = await api.post(createUrl, payload);
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
            const endpoint = platform === "facebook"
                ? `/facebook/post-auto-reply/status`
                : `/instagram/comment-manager/post-auto-reply/${postId}/status?platform=instagram`;

            const payload: any = {
                post_id: postId,
                status: newStatus
            };
            if (platform === "facebook") {
                payload.page_id = pageId;
            } else {
                payload.platform = "instagram";
            }

            const res = await api.patch(endpoint, payload);
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
            const endpoint = platform === "facebook"
                ? `/facebook/post-auto-reply/${postId}`
                : `/instagram/comment-manager/post-auto-reply/${postId}?platform=instagram`;

            const params: any = {};
            if (platform === "facebook") {
                params.page_id = pageId;
            }

            const res = await api.delete(endpoint, { params });
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
            <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

                <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 24 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 24 }}
                    className={cn(
                        "relative z-10 w-full bg-[var(--card)] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh] transition-all",
                        view === "choice" ? "max-w-lg" : "max-w-[950px]"
                    )}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-8 py-5 border-b border-[var(--border)] bg-[var(--card)] sticky top-0 z-20">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
                                <Zap size={18} />
                            </div>
                            <h2 className="text-[14px] font-semibold text-[var(--foreground)]">
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
                            <button onClick={onClose} className="text-[var(--muted-foreground)]/50 hover:text-rose-500 transition-colors ml-4">
                                <X size={22} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[var(--card)] custom-scrollbar">
                        <AnimatePresence mode="wait">
                            {isFetchingConfig ? (
                                <div className="h-[300px] flex flex-col items-center justify-center space-y-4">
                                    <Loader2 className="w-8 h-8 text-[var(--primary)] animate-spin" />
                                    <p className="text-sm font-medium text-[var(--muted-foreground)]/70">Syncing configuration...</p>
                                </div>
                            ) : view === "choice" ? (
                                <motion.div key="choice" className="space-y-8 py-8">
                                    <div className="text-center space-y-2 mb-10">
                                        <h3 className="text-xl font-bold text-[var(--foreground)] tracking-tight">Automation Choice</h3>
                                        <p className="text-sm text-[var(--muted-foreground)] font-medium">How would you like to build this automation?</p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-5 max-w-sm mx-auto">
                                        <button onClick={() => setView("template")} className="group p-6 rounded-2xl border-2 border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all text-left relative overflow-hidden">
                                            <div className="flex items-center gap-5 relative z-10">
                                                <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center group-hover:bg-[var(--primary)] group-hover:text-white transition-all">
                                                    <Layers size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-[15px] font-bold text-[var(--foreground)] tracking-tight">Use Template</p>
                                                    <p className="text-[12px] text-[var(--muted-foreground)]/70 font-medium">Link a pre-existing template</p>
                                                </div>
                                            </div>
                                            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center">
                                                    <Check className="w-3 h-3 text-white" />
                                                </div>
                                            </div>
                                        </button>
                                        <button onClick={() => setView("custom")} className="group p-6 rounded-2xl border-2 border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all text-left relative overflow-hidden">
                                            <div className="flex items-center gap-5 relative z-10">
                                                <div className="w-12 h-12 rounded-xl bg-[var(--muted)]/50 text-[var(--muted-foreground)]/70 flex items-center justify-center group-hover:bg-[var(--primary)] group-hover:text-white transition-all">
                                                    <Edit3 size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-[15px] font-bold text-[var(--foreground)] tracking-tight">Custom Build</p>
                                                    <p className="text-[12px] text-[var(--muted-foreground)]/70 font-medium">Create specific rules now</p>
                                                </div>
                                            </div>
                                            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <div className="w-5 h-5 rounded-full bg-[var(--primary)] flex items-center justify-center">
                                                    <Check className="w-3 h-3 text-white" />
                                                </div>
                                            </div>
                                        </button>
                                    </div>
                                </motion.div>
                            ) : view === "template" ? (
                                <motion.div key="template" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-lg mx-auto py-8">
                                    <div className="bg-[var(--card)] p-10 rounded-2xl border border-[var(--border)] shadow-sm space-y-6 text-center">
                                        <div className="w-16 h-16 rounded-2xl bg-[var(--primary)]/10 flex items-center justify-center mx-auto text-[var(--primary)]">
                                            <Layers className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-[var(--foreground)] tracking-tight uppercase">Link Template Engine</h3>
                                            <p className="text-sm text-[var(--muted-foreground)]/70 font-medium px-4 mt-2">Connect a verified automation template to this post.</p>
                                        </div>
                                        <div className="space-y-5 pt-8 text-left">
                                            <div className="flex items-center justify-between px-1">
                                                <label className="text-sm font-medium text-[var(--muted-foreground)]">Please select a message template</label>
                                                <button onClick={() => fetchTemplates()} className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1">
                                                    <RefreshCw className={cn("w-2.5 h-2.5", isLoadingTemplates && "animate-spin")} /> Refresh Assets
                                                </button>
                                            </div>
                                            <div className="relative">
                                                <select
                                                    value={form.template_id || ""}
                                                    onChange={(e) => setForm({ ...form, template_id: e.target.value })}
                                                    className="w-full px-5 py-4 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all text-[14px] font-medium appearance-none bg-[var(--card)] cursor-pointer"
                                                >
                                                    <option value="" disabled>{isLoadingTemplates ? "Syncing..." : "Choose your template"}</option>
                                                    {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                </select>
                                                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]/70 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div key="custom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">

                                    {/* SECTION: BASICS */}
                                    <div className="bg-[var(--card)] p-7 rounded-2xl border border-[var(--border)] shadow-xs">
                                        <Field label="Auto Reply Campaign Name" required icon={Edit3}>
                                            <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all font-medium text-[14px]"
                                                placeholder="e.g. Daily Engagement Flow"
                                            />
                                        </Field>
                                    </div>

                                    {/* SECTION: OFFENSIVE SETTINGS */}
                                    <div className="bg-[var(--card)] p-7 rounded-2xl border border-[var(--border)] shadow-xs space-y-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <ShieldAlert className="w-4 h-4 text-rose-400" />
                                            <h3 className="text-sm font-semibold text-[var(--foreground)]">Offensive Comments Settings</h3>
                                        </div>
                                        <div className="flex gap-8">
                                            <CustomToggle active={form.offensive.hide_comment} onClick={() => setForm({ ...form, offensive: { ...form.offensive, hide_comment: !form.offensive.hide_comment } })} label="Hide Comment" />
                                            <CustomToggle active={form.offensive.delete_comment} onClick={() => setForm({ ...form, offensive: { ...form.offensive, delete_comment: !form.offensive.delete_comment } })} label="Delete Comment" />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-[var(--muted-foreground)]">Offensive keywords <span className="text-[var(--muted-foreground)]/70 font-normal">(comma separated)</span></label>
                                                <div className="relative">
                                                    <textarea rows={4} value={form.offensive.offensive_keywords} onChange={e => setForm({ ...form, offensive: { ...form.offensive, offensive_keywords: e.target.value } })}
                                                        className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all font-medium text-[14px] resize-none"
                                                        placeholder="keyword1, keyword2..."
                                                    />
                                                    <Edit3 className="absolute bottom-3 right-3 w-4 h-4 text-[var(--muted-foreground)]/50" />
                                                </div>
                                            </div>
                                            <div className="space-y-5">
                                                <div className="flex items-center justify-between px-1">
                                                    <label className="text-sm font-medium text-[var(--muted-foreground)]">Private reply template</label>
                                                    <button onClick={() => fetchBotReplies()} className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1">
                                                        <RefreshCw className={cn("w-2.5 h-2.5", isLoadingBotReplies && "animate-spin")} /> Refresh List
                                                    </button>
                                                </div>
                                                <div className="relative">
                                                    <select
                                                        value={form.offensive.private_reply_template_id || ""}
                                                        onChange={e => setForm({ ...form, offensive: { ...form.offensive, private_reply_template_id: e.target.value } })}
                                                        className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all font-medium text-[14px] appearance-none cursor-pointer bg-[var(--card)]"
                                                    >
                                                        <option value="">Please select a message template</option>
                                                        {botReplies.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]/70 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* SECTION: BEHAVIOR TOGGLES */}
                                    <div className="bg-[var(--card)] p-7 rounded-2xl border border-[var(--border)] shadow-xs grid grid-cols-1 gap-4">
                                        <div className="flex items-center justify-between py-1 px-1">
                                            <div className="flex items-center gap-3">
                                                <RefreshCw className="w-4 h-4 text-[var(--muted-foreground)]/70" />
                                                <span className="text-[13px] font-medium text-[var(--muted-foreground)]">Do you want to send reply message to a user multiple times?</span>
                                            </div>
                                            <CustomToggle active={form.multiple_reply_enabled} onClick={() => setForm({ ...form, multiple_reply_enabled: !form.multiple_reply_enabled })} />
                                        </div>
                                        <div className="flex items-center justify-between py-1 px-1 border-t border-[var(--border)]">
                                            <div className="flex items-center gap-3">
                                                <MessageCircle className="w-4 h-4 text-[var(--muted-foreground)]/70" />
                                                <span className="text-[13px] font-medium text-[var(--muted-foreground)]">Do you want to enable comment reply?</span>
                                            </div>
                                            <CustomToggle active={form.comment_reply_enabled} onClick={() => setForm({ ...form, comment_reply_enabled: !form.comment_reply_enabled })} />
                                        </div>
                                        <div className="flex items-center justify-between py-1 px-1 border-t border-[var(--border)]">
                                            <div className="flex items-center gap-3">
                                                <EyeOff className="w-4 h-4 text-[var(--muted-foreground)]/70" />
                                                <span className="text-[13px] font-medium text-[var(--muted-foreground)]">Do you want to hide comments after comment reply?</span>
                                            </div>
                                            <CustomToggle active={form.hide_after_reply} onClick={() => setForm({ ...form, hide_after_reply: !form.hide_after_reply })} />
                                        </div>
                                    </div>

                                    {/* SECTION: MODE SELECTION */}
                                    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-6 shadow-xs space-y-5">
                                        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setForm({ ...form, reply_type: "generic" })}>
                                            <CapsuleSwitch active={form.reply_type === "generic"} />
                                            <span className={cn("text-sm font-medium transition-colors", form.reply_type === "generic" ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]/70")}>Generic message for all</span>
                                        </div>
                                        <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setForm({ ...form, reply_type: "filter" })}>
                                            <CapsuleSwitch active={form.reply_type === "filter"} />
                                            <span className={cn("text-sm font-medium transition-colors", form.reply_type === "filter" ? "text-[var(--primary)]" : "text-[var(--muted-foreground)]/70")}>Send different messages by keyword filter</span>
                                        </div>
                                    </div>

                                    {/* SECTION: CONTENT EDITOR */}
                                    <div className="space-y-8">
                                        <AnimatePresence mode="wait">
                                            {form.reply_type === "generic" ? (
                                                <motion.div key="generic" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="bg-[var(--card)] p-7 rounded-2xl border border-[var(--border)] shadow-sm space-y-8">
                                                    <Field label="Message for Comment Reply" required icon={MessageCircle}>
                                                        <div className="relative border border-[var(--border)] rounded-2xl p-4 focus-within:border-[var(--primary)] bg-[var(--card)]">
                                                            <TextareaWithEmoji
                                                                value={form.message}
                                                                onChange={v => setForm({ ...form, message: v })}
                                                                placeholder="Type your message here..."
                                                                rows={5}
                                                                minHeight="120px"
                                                                recent={recentEmojis}
                                                                onAddRecent={addRecent}
                                                            />
                                                        </div>
                                                    </Field>
                                                    <div className="space-y-5">
                                                        <div className="flex items-center justify-between px-1">
                                                            <label className="text-sm font-medium text-[var(--muted-foreground)] flex items-center gap-1.5"><Settings className="w-3.5 h-3.5" /> Private reply template</label>
                                                            <button onClick={() => fetchBotReplies()} className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1">
                                                                <RefreshCw className={cn("w-2.5 h-2.5", isLoadingBotReplies && "animate-spin")} /> Refresh List
                                                            </button>
                                                        </div>
                                                        <div className="relative">
                                                            <select value={form.private_template_id ?? ""} onChange={e => setForm({ ...form, private_template_id: e.target.value })}
                                                                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all font-medium text-[14px] appearance-none bg-[var(--card)] cursor-pointer"
                                                            >
                                                                <option value="">Please select a message template</option>
                                                                {botReplies.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                            </select>
                                                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]/70 pointer-events-none" />
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ) : (
                                                <motion.div key="filter" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">
                                                    {filterRules.map((rule, idx) => (
                                                        <div key={rule.id} className="bg-[var(--card)] p-7 rounded-2xl border border-[var(--border)] shadow-sm space-y-8 relative group">
                                                            <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-6 h-6 rounded-full bg-[var(--muted)]/50 flex items-center justify-center text-[11px] font-bold text-[var(--muted-foreground)]">{idx + 1}</div>
                                                                    <h4 className="text-[13px] font-semibold text-[var(--foreground)]">Filter Logic Rule</h4>
                                                                </div>
                                                                <div className="flex items-center gap-6 px-1">
                                                                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => updateRule(rule.id!!, { match_type: "contains" })}>
                                                                        <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all", rule.match_type === "contains" ? "border-[var(--primary)] bg-[var(--primary)]" : "border-[var(--border)]/70")}>
                                                                            {rule.match_type === "contains" && <div className="w-1.5 h-1.5 rounded-full bg-[var(--card)]" />}
                                                                        </div>
                                                                        <span className={cn("text-xs font-medium", rule.match_type === "contains" ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]/70")}>Contains word</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => updateRule(rule.id!!, { match_type: "exact" })}>
                                                                        <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all", rule.match_type === "exact" ? "border-[var(--primary)] bg-[var(--primary)]" : "border-[var(--border)]/70")}>
                                                                            {rule.match_type === "exact" && <div className="w-1.5 h-1.5 rounded-full bg-[var(--card)]" />}
                                                                        </div>
                                                                        <span className={cn("text-xs font-medium", rule.match_type === "exact" ? "text-[var(--foreground)]" : "text-[var(--muted-foreground)]/70")}>Exact match</span>
                                                                    </div>
                                                                </div>
                                                                <button onClick={() => removeRule(rule.id!!)} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-colors">
                                                                    <Trash2 size={15} />
                                                                </button>
                                                            </div>
                                                            <div className="grid grid-cols-1 gap-8">
                                                                <Field label="Filter Word/Sentence" required icon={Search}>
                                                                    <input type="text" value={rule.keyword} onChange={e => updateRule(rule.id!!, { keyword: e.target.value })}
                                                                        className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all font-medium text-[14px]"
                                                                        placeholder="Write your filter word here"
                                                                    />
                                                                </Field>
                                                                <Field label="Message for Comment Reply" required icon={MessageCircle}>
                                                                    <div className="relative border border-[var(--border)] rounded-2xl p-4 focus-within:border-[var(--primary)] bg-[var(--card)]">
                                                                        <TextareaWithEmoji
                                                                            value={rule.message}
                                                                            onChange={v => updateRule(rule.id!!, { message: v })}
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
                                                                        <label className="text-sm font-medium text-[var(--muted-foreground)] flex items-center gap-1.5"><Settings className="w-3.5 h-3.5" /> Private reply template</label>
                                                                        <button onClick={() => fetchBotReplies()} className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1">
                                                                            <RefreshCw className={cn("w-2.5 h-2.5", isLoadingBotReplies && "animate-spin")} /> Refresh List
                                                                        </button>
                                                                    </div>
                                                                    <div className="relative">
                                                                        <select value={rule.private_template_id || ""} onChange={e => updateRule(rule.id!!, { private_template_id: e.target.value })}
                                                                            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all font-medium text-[14px] appearance-none bg-[var(--card)] cursor-pointer"
                                                                        >
                                                                            <option value="">Please select a message template</option>
                                                                            {botReplies.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                                        </select>
                                                                        <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]/70 pointer-events-none" />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div className="flex justify-end">
                                                        <button onClick={addRule} className="px-6 py-2.5 rounded-xl border-2 border-[var(--primary)] text-[var(--primary)] font-semibold text-[11px] hover:bg-[var(--primary)]/10 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-[var(--primary)]/10/20">
                                                            <Plus className="w-4 h-4" /> Add another filter rule
                                                        </button>
                                                    </div>
                                                    <div className="bg-[var(--muted)]/50 p-8 rounded-2xl border border-[var(--border)] border-dashed space-y-8 mt-10">
                                                        <div className="flex items-center gap-3">
                                                            <Info className="w-4 h-4 text-[var(--muted-foreground)]/70" />
                                                            <span className="text-sm font-medium text-[var(--muted-foreground)]">Fallback reply (when no filter matches)</span>
                                                        </div>
                                                        <Field label="Message for Comment Reply" icon={MessageCircle}>
                                                            <div className="relative border border-[var(--border)] rounded-2xl p-4 focus-within:border-[var(--primary)] transition-all bg-[var(--card)] shadow-sm">
                                                                <TextareaWithEmoji
                                                                    value={form.message}
                                                                    onChange={v => setForm({ ...form, message: v })}
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
                                                                <label className="text-sm font-medium text-[var(--muted-foreground)] flex items-center gap-1.5"><Settings className="w-3.5 h-3.5" /> Private reply template (Fallback)</label>
                                                                <button onClick={() => fetchBotReplies()} className="text-xs font-semibold text-[var(--primary)] hover:underline flex items-center gap-1">
                                                                    <RefreshCw className={cn("w-2.5 h-2.5", isLoadingBotReplies && "animate-spin")} /> Refresh List
                                                                </button>
                                                            </div>
                                                            <div className="relative">
                                                                <select value={form.private_template_id ?? ""} onChange={e => setForm({ ...form, private_template_id: e.target.value })}
                                                                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] outline-none transition-all font-medium text-[14px] appearance-none bg-[var(--card)] cursor-pointer shadow-sm"
                                                                >
                                                                    <option value="">Please select a message template</option>
                                                                    {botReplies.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                                </select>
                                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]/70 pointer-events-none" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    <div className="flex flex-col gap-4 p-5 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-xs">
                                        <CustomToggle active={form.save_as_template} onClick={() => setForm({ ...form, save_as_template: !form.save_as_template })} label="Save this configuration as a generic template?" />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="flex gap-4 p-8 bg-[var(--card)] border-t border-[var(--border)] flex-shrink-0 relative z-20">
                        <button onClick={view === "choice" ? onClose : () => setView("choice")} className="flex-1 py-3 rounded-xl border border-[var(--border)] text-[var(--muted-foreground)] font-bold text-[13px] hover:bg-[var(--muted)]/50 transition-all">
                            {view === "choice" ? "Cancel" : "Back to Choice"}
                        </button>
                        {view !== "choice" && (
                            <button onClick={handleSave} disabled={isSaving} className="flex-[2] py-3 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold text-[14px] shadow-xl shadow-[var(--primary)]/10 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50">
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Check size={20} />}
                                <span>{existingCampaignId ? 'UPDATE CHANGES' : 'ACTIVATE STRATEGY'}</span>
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
