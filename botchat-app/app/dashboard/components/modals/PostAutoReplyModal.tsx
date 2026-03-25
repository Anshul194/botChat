"use client";

import { useState, useEffect } from "react";
import {
    X, Save, Zap, MessageSquare,
    ChevronDown, Info, AlertCircle,
    Pause, Play, ShieldAlert, Filter,
    Plus, Trash2, Layers, Megaphone
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Template {
    id: number;
    name: string;
}

interface PostAutoReplyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
    platform: "facebook" | "instagram";
    postId: string;
    pageId: string;
}

export function PostAutoReplyModal({
    isOpen,
    onClose,
    onSaved,
    platform,
    postId,
    pageId
}: PostAutoReplyModalProps) {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isFetchingConfig, setIsFetchingConfig] = useState(false);

    // Form Data
    const [existingCampaignId, setExistingCampaignId] = useState<number | null>(null);
    const [name, setName] = useState("");
    const [status, setStatus] = useState<"active" | "paused">("active");

    const [form, setForm] = useState({
        hide_comment: false,
        delete_comment: false,
        offensive_keywords: "",
        multiple_reply_enabled: false,
        comment_reply_enabled: true,
        hide_after_reply: false,
        reply_type: "generic", // generic or filtering
        message: "",
        image: "",
        video: "",
        private_template_id: "",
        filters: [] as { keywords: string, message: string }[]
    });

    useEffect(() => {
        if (isOpen) {
            fetchTemplates();
            if (postId) fetchCampaignConfig();
        }
    }, [isOpen, postId]);

    const fetchCampaignConfig = async () => {
        setIsFetchingConfig(true);
        try {
            const endpoint = platform === "facebook"
                ? `/facebook/post-auto-reply/${postId}`
                : `/instagram/post-auto-reply/${postId}`;
            const res = await api.put(`${endpoint}?page_id=${pageId}`);
            const data = res.data?.data;

            if (data) {
                setExistingCampaignId(data.id);
                setName(data.campaign_name || data.name || "");
                setStatus(data.status || "active");

                setForm({
                    hide_comment: data.hide_comment === "1" || !!data.hide_comment,
                    delete_comment: data.delete_comment === "1" || !!data.delete_comment,
                    offensive_keywords: data.offensive_keywords || "",
                    multiple_reply_enabled: data.multiple_reply_enabled === "1" || !!data.multiple_reply_enabled,
                    comment_reply_enabled: data.comment_reply_enabled !== "0" && data.comment_reply_enabled !== false,
                    hide_after_reply: data.hide_after_reply === "1" || !!data.hide_after_reply,
                    reply_type: data.reply_type === "filter" ? "filtering" : "generic",
                    message: data.message || "",
                    image: data.image || "",
                    video: data.video || "",
                    private_template_id: data.private_template_id || "",
                    filters: Array.isArray(data.filters) ? data.filters : []
                });
            } else {
                setExistingCampaignId(null);
            }
        } catch (error) {
            console.error("Fetch Config Error:", error);
        } finally {
            setIsFetchingConfig(false);
        }
    };

    const fetchTemplates = async () => {
        setIsLoading(true);
        try {
            const endpoint = platform === "facebook" ? "/facebook/auto-reply-template" : "/instagram/auto-reply-template";
            const res = await api.get(`${endpoint}?page_id=${pageId}`);
            if (res.data.success || res.data.is_success) {
                setTemplates(res.data.data || []);
            }
        } catch (error) {
            console.error("Fetch Templates Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!name) {
            toast.error("Please enter a campaign name");
            return;
        }

        setIsSaving(true);
        try {
            const endpoint = platform === "facebook" ? "/facebook/post-auto-reply" : "/instagram/post-auto-reply";

            const payload = {
                post_id: postId,
                campaign_name: name,
                platform,
                ...(platform === "facebook" ? { facebook_page_id: pageId } : { instagram_account_id: pageId }),
                ...form
            };

            let res;
            if (existingCampaignId) {
                // Update existing campaign
                res = await api.put(`${endpoint}/${postId}?page_id=${pageId}`, payload);
            } else {
                // Create new campaign
                res = await api.post(`${endpoint}?page_id=${pageId}`, payload);
            }

            if (res.data.success || res.data.is_success) {
                toast.success(existingCampaignId ? "Campaign updated!" : "Campaign enabled!");
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
                ? `/facebook/post-auto-reply/${postId}/status`
                : `/instagram/post-auto-reply/${postId}/status`;

            const res = await api.patch(endpoint, { status: newStatus });
            if (res.data.success || res.data.is_success) {
                setStatus(newStatus);
                toast.success(`Campaign ${newStatus === 'active' ? 'resumed' : 'paused'}!`);
                onSaved();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Status update failed");
        } finally {
            setIsSaving(false);
        }
    };

    const addFilter = () => setForm({ ...form, filters: [...form.filters, { keywords: "", message: "" }] });

    const Toggle = ({ active, label, onClick }: any) => (
        <div className="flex items-center justify-between py-2">
            <span className="text-[12px] font-black uppercase tracking-tight text-neutral-500 dark:text-neutral-400">{label}</span>
            <div className="flex items-center gap-3">
                <div
                    onClick={onClick}
                    className={cn(
                        "w-10 h-5 rounded-full relative transition-all duration-300 cursor-pointer",
                        active ? "bg-indigo-600" : "bg-neutral-200 dark:bg-neutral-800"
                    )}
                >
                    <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-md", active ? "left-5.5" : "left-0.5")} />
                </div>
                <span className="text-[9px] font-black text-neutral-400 w-6 uppercase tracking-widest">{active ? "YES" : "NO"}</span>
            </div>
        </div>
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-neutral-950/40 backdrop-blur-md"
                onClick={onClose}
            />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[40px] w-full max-w-3xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="px-8 py-6 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                            <Megaphone className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tight leading-none">Auto Reply Campaign</h2>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={cn(
                                    "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest",
                                    status === "active" ? "bg-emerald-500/10 text-emerald-600" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                                )}>
                                    {status}
                                </span>
                                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none border-l pl-2 dark:border-neutral-800">
                                    Post Level Automation
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {existingCampaignId && (
                            <button
                                onClick={handleStatusToggle}
                                className={cn(
                                    "px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2",
                                    status === "active"
                                        ? "bg-amber-50 text-amber-600 hover:bg-amber-100"
                                        : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                                )}
                            >
                                {status === "active" ? <Pause size={14} /> : <Play size={14} />}
                                {status === "active" ? "Pause" : "Resume"}
                            </button>
                        )}
                        <button onClick={onClose} className="p-3 rounded-2xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-neutral-400"><X className="w-5 h-5" /></button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">

                    {/* Campaign Name */}
                    <div className="space-y-3">
                        <label className="text-[11px] font-black text-neutral-400 uppercase tracking-[0.2em] ml-1">Campaign Identity <span className="text-indigo-500">*</span></label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Summer Sale Reply Bot"
                            className="w-full px-6 py-4 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 focus:border-indigo-500 outline-none transition-all font-bold text-[14px]"
                        />
                    </div>

                    {/* Offensive Filtering */}
                    <div className="p-6 rounded-3xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/30 dark:bg-white/[0.02] space-y-6">
                        <div className="flex items-center gap-2 text-indigo-500">
                            <ShieldAlert className="w-4 h-4" />
                            <h3 className="text-[11px] font-black uppercase tracking-widest">Offensive Comments Shield</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-8 border-b border-neutral-100 dark:border-neutral-800 pb-6">
                            <Toggle label="Hide Comment" active={form.hide_comment} onClick={() => setForm({ ...form, hide_comment: !form.hide_comment })} />
                            <Toggle label="Delete Comment" active={form.delete_comment} onClick={() => setForm({ ...form, delete_comment: !form.delete_comment })} />
                        </div>
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Offensive Keywords (comma separated)</label>
                            <textarea
                                rows={2}
                                value={form.offensive_keywords}
                                onChange={e => setForm({ ...form, offensive_keywords: e.target.value })}
                                placeholder="word1, word2, word3..."
                                className="w-full px-6 py-4 rounded-2xl bg-white dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 outline-none focus:border-indigo-500 transition-all text-[13px] font-medium resize-none"
                            />
                        </div>
                    </div>

                    {/* Logic Toggles */}
                    <div className="p-6 rounded-3xl border border-neutral-100 dark:border-neutral-800 bg-neutral-50/30 dark:bg-white/[0.02] space-y-4">
                        <Toggle label="Enable Multiple Replies per User?" active={form.multiple_reply_enabled} onClick={() => setForm({ ...form, multiple_reply_enabled: !form.multiple_reply_enabled })} />
                        <Toggle label="Enable Inline Comment Reply?" active={form.comment_reply_enabled} onClick={() => setForm({ ...form, comment_reply_enabled: !form.comment_reply_enabled })} />
                        <Toggle label="Auto-Hide Comment after Reply?" active={form.hide_after_reply} onClick={() => setForm({ ...form, hide_after_reply: !form.hide_after_reply })} />
                    </div>

                    {/* Reply Type Selection */}
                    <div className="flex gap-4 p-2 bg-neutral-50 dark:bg-neutral-950 rounded-2xl border border-neutral-100 dark:border-neutral-800">
                        <button
                            onClick={() => setForm({ ...form, reply_type: "generic" })}
                            className={cn(
                                "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                form.reply_type === "generic" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-neutral-400 hover:text-neutral-600"
                            )}>Generic Message</button>
                        <button
                            onClick={() => setForm({ ...form, reply_type: "filtering" })}
                            className={cn(
                                "flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                form.reply_type === "filtering" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" : "text-neutral-400 hover:text-neutral-600"
                            )}>Keyword Filtering</button>
                    </div>

                    {form.reply_type === "filtering" ? (
                        <div className="space-y-4">
                            {form.filters.map((f, i) => (
                                <div key={i} className="p-6 rounded-3xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm space-y-6">
                                    <div className="flex items-center justify-between border-b border-neutral-50 dark:border-neutral-800 pb-4">
                                        <div className="flex items-center gap-2 text-indigo-600">
                                            <Filter className="w-4 h-4" />
                                            <h3 className="text-[10px] font-black uppercase tracking-widest">Filter Rule #{i + 1}</h3>
                                        </div>
                                        <button onClick={() => setForm({ ...form, filters: form.filters.filter((_, idx) => idx !== i) })} className="text-neutral-300 hover:text-rose-500 transition-colors">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Filter Keywords</label>
                                            <input
                                                type="text"
                                                value={f.keywords}
                                                onChange={e => {
                                                    const newFilters = [...form.filters];
                                                    newFilters[i].keywords = e.target.value;
                                                    setForm({ ...form, filters: newFilters });
                                                }}
                                                className="w-full px-5 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 outline-none focus:border-indigo-500 transition-all font-medium text-[13px]"
                                                placeholder="price, cost, showroom..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Reply Payload</label>
                                            <textarea
                                                rows={2}
                                                value={f.message}
                                                onChange={e => {
                                                    const newFilters = [...form.filters];
                                                    newFilters[i].message = e.target.value;
                                                    setForm({ ...form, filters: newFilters });
                                                }}
                                                className="w-full px-5 py-3 rounded-xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 outline-none focus:border-indigo-500 transition-all text-[13px] font-medium resize-none"
                                                placeholder="Write the automated response..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <button
                                onClick={addFilter}
                                className="w-full py-4 rounded-3xl border-2 border-dashed border-neutral-200 dark:border-neutral-800 text-neutral-400 font-black text-[10px] uppercase tracking-widest hover:border-indigo-200 hover:text-indigo-600 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Add Logic Filter
                            </button>
                        </div>
                    ) : (
                        <div className="p-6 rounded-3xl border border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-950 shadow-sm space-y-4">
                            <div className="flex items-center gap-2 text-indigo-600">
                                <MessageSquare className="w-4 h-4" />
                                <h3 className="text-[10px] font-black uppercase tracking-widest">Generic Response Body</h3>
                            </div>
                            <textarea
                                rows={4}
                                value={form.message}
                                onChange={e => setForm({ ...form, message: e.target.value })}
                                placeholder="Write your universal reply message here..."
                                className="w-full p-5 rounded-2xl bg-neutral-50 dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 outline-none focus:border-indigo-500 transition-all text-[14px] font-medium resize-none shadow-inner"
                            />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/30 flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[11px] font-black uppercase tracking-[0.2em] text-neutral-500 hover:bg-neutral-50 transition-all active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-[2] py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-[11px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-indigo-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isSaving ? <Layers className="w-4 h-4 animate-spin text-white" /> : <Save size={16} />}
                        Deploy Campaign
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
