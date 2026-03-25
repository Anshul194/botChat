"use client";

import { useState, useEffect } from "react";
import {
    X, Save, Calendar, Clock, Globe,
    Target, Sparkles, MessageSquare,
    ChevronDown, Info, AlertCircle,
    Pause, Play
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Template {
    id: number;
    name: string;
}

interface PostAutoCommentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSaved: () => void;
    platform: "facebook" | "instagram";
    postId: string;
    pageId: string;
}

export function PostAutoCommentModal({
    isOpen,
    onClose,
    onSaved,
    platform,
    postId,
    pageId
}: PostAutoCommentModalProps) {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isFetchingConfig, setIsFetchingConfig] = useState(false);

    // Form Data
    const [existingCampaignId, setExistingCampaignId] = useState<number | null>(null);
    const [name, setName] = useState("");
    const [templateId, setTemplateId] = useState("");
    const [selectionMode, setSelectionMode] = useState<"random" | "serial">("random");
    const [status, setStatus] = useState<"active" | "paused">("active");
    const [scheduleType, setScheduleType] = useState<"periodic" | "one_time">("one_time");
    const [startTime, setStartTime] = useState("09:00");
    const [endTime, setEndTime] = useState("21:00");
    const [betweenStart, setBetweenStart] = useState("09:00");
    const [betweenEnd, setBetweenEnd] = useState("21:00");
    const [timezone, setTimezone] = useState("UTC");

    useEffect(() => {
        if (isOpen) {
            fetchTemplates();
            if (postId) fetchCampaignConfig();
        }
    }, [isOpen, postId]);

    const fetchCampaignConfig = async () => {
        setIsFetchingConfig(true);
        try {
            // Usually we'd have a 'get single' or check if campaign exists in status
            const endpoint = platform === "facebook"
                ? `/facebook/post-auto-comment/${postId}`
                : `/instagram/comment-manager/post/${postId}`;
            const res = await api.put(`${endpoint}?page_id=${pageId}`);
            const data = res.data?.data;
            if (data) {
                const c = data;
                setExistingCampaignId(c.id);
                setName(c.campaign_name || "");
                setTemplateId(c.template_id || "");
                setSelectionMode(c.comment_type || "random");
                setScheduleType(c.schedule_type || "periodic");
                setStatus(c.status || "active");
                
                // Set times - slice to H:i format
                if (c.start_time) setStartTime(c.start_time.slice(0, 5));
                if (c.end_time) setEndTime(c.end_time.slice(0, 5));
                if (c.comment_between_start) setBetweenStart(c.comment_between_start.slice(0, 5));
                if (c.comment_between_end) setBetweenEnd(c.comment_between_end.slice(0, 5));
                if (c.timezone) setTimezone(c.timezone);
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
            const endpoint = platform === "facebook" ? "/facebook/comment-template" : "/instagram/comment-template";
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
        if (!name || !templateId) {
            toast.error("Please fill in the required fields");
            return;
        }

        setIsSaving(true);
        try {
            const endpoint = platform === "facebook" ? "/facebook/post-auto-comment" : "/instagram/post-auto-comment";

            // Format time for backend (using H:i format as per error feedback)
            const payload = {
                post_id: postId,
                template_id: templateId,
                campaign_name: name,
                schedule_type: scheduleType,
                schedule_time: "09:00", // Default H:i
                timezone: timezone || "Asia/Kolkata",
                start_time: startTime, // already H:i from input
                end_time: endTime,
                comment_between_start: betweenStart,
                comment_between_end: betweenEnd,
                comment_type: selectionMode,
                ...(platform === "facebook" ? { facebook_page_id: pageId } : { instagram_account_id: pageId })
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
                ? `/facebook/post-auto-comment/${postId}/status`
                : `/instagram/post-auto-comment/${postId}/status`;

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
                className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-[40px] w-full max-w-2xl shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
            >
                {/* Header */}
                <div className="p-8 pb-6 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-pink-500 flex items-center justify-center text-white shadow-lg shadow-primary/20">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-xl font-black text-neutral-900 dark:text-white uppercase tracking-tight leading-none">Auto Comment Campaign</h2>
                            <div className="flex items-center gap-2 mt-2">
                                <span className={cn(
                                    "px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest",
                                    status === "active" ? "bg-emerald-500/10 text-emerald-600" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500"
                                )}>
                                    {status}
                                </span>
                                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest leading-none border-l pl-2 dark:border-neutral-800">
                                    {existingCampaignId ? "Editing Active Post" : "Configure New Stream"}
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
                <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">

                    {/* Section 1: Basic Info */}
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                                    <Target className="w-3 h-3 text-primary" /> Campaign Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. Daily Welcome Comment"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full px-5 py-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 outline-none focus:border-primary/50 text-[13px] font-semibold transition-all placeholder:text-neutral-400"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                                    <MessageSquare className="w-3 h-3 text-primary" /> Comment Template
                                </label>
                                <div className="relative">
                                    <select
                                        value={templateId}
                                        onChange={(e) => setTemplateId(e.target.value)}
                                        className="w-full px-5 py-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 outline-none focus:border-primary/50 text-[13px] font-semibold transition-all appearance-none cursor-pointer pr-12"
                                    >
                                        <option value="" disabled>Select a template</option>
                                        {templates.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Strategy */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-6 rounded-3xl bg-neutral-50/50 dark:bg-neutral-950/20 border border-neutral-100 dark:border-neutral-800 space-y-4">
                            <label className="text-[11px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                                <Sparkles className="w-3 h-3 text-primary" /> Selection Mode
                            </label>
                            <div className="flex flex-col gap-2">
                                {[
                                    { id: 'random', label: 'Random', desc: 'Pick a random message each time' },
                                    { id: 'serial', label: 'Serial', desc: 'Cycle through messages in order' }
                                ].map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setSelectionMode(opt.id as any)}
                                        className={cn(
                                            "flex items-center gap-4 p-3 rounded-2xl border transition-all text-left",
                                            selectionMode === opt.id
                                                ? "bg-white border-primary shadow-sm ring-4 ring-primary/5"
                                                : "bg-transparent border-transparent hover:bg-white hover:border-neutral-200"
                                        )}
                                    >
                                        <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all", selectionMode === opt.id ? "border-primary" : "border-neutral-300")}>
                                            {selectionMode === opt.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-neutral-900 dark:text-white leading-none">{opt.label}</p>
                                            <p className="text-[10px] text-neutral-400 font-medium mt-1">{opt.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="p-6 rounded-3xl bg-neutral-50/50 dark:bg-neutral-950/20 border border-neutral-100 dark:border-neutral-800 space-y-4">
                            <label className="text-[11px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2">
                                <Calendar className="w-3 h-3 text-primary" /> Schedule Type
                            </label>
                            <div className="flex flex-col gap-2">
                                {[
                                    { id: 'periodic', label: 'Periodic', desc: 'Run on a recurring schedule' },
                                    { id: 'one_time', label: 'One Time', desc: 'Execute once at defined time' }
                                ].map(opt => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setScheduleType(opt.id as any)}
                                        className={cn(
                                            "flex items-center gap-4 p-3 rounded-2xl border transition-all text-left",
                                            scheduleType === opt.id
                                                ? "bg-white border-primary shadow-sm ring-4 ring-primary/5"
                                                : "bg-transparent border-transparent hover:bg-white hover:border-neutral-200"
                                        )}
                                    >
                                        <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all", scheduleType === opt.id ? "border-primary" : "border-neutral-300")}>
                                            {scheduleType === opt.id && <div className="w-2 h-2 rounded-full bg-primary" />}
                                        </div>
                                        <div>
                                            <p className="text-[13px] font-bold text-neutral-900 dark:text-white leading-none">{opt.label}</p>
                                            <p className="text-[10px] text-neutral-400 font-medium mt-1">{opt.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Time Settings */}
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <label className="text-[11px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2 px-1">
                                    <Clock className="w-3 h-3 text-primary" /> Active Window (Start/End)
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="relative">
                                        <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full pl-4 pr-10 py-3 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 text-[13px] font-bold outline-none focus:border-primary/50 transition-all" />
                                        <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                                    </div>
                                    <div className="relative">
                                        <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full pl-4 pr-10 py-3 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 text-[13px] font-bold outline-none focus:border-primary/50 transition-all" />
                                        <Clock className="absolute right-4 top-2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none mt-[1.2rem]" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <label className="text-[11px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2 px-1">
                                    <Clock className="w-3 h-3 text-primary" /> Comment Between Window <Info size={12} className="text-neutral-300" />
                                </label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="relative">
                                        <input type="time" value={betweenStart} onChange={(e) => setBetweenStart(e.target.value)} className="w-full pl-4 pr-10 py-3 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 text-[13px] font-bold outline-none focus:border-primary/50 transition-all" />
                                        <Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
                                    </div>
                                    <div className="relative">
                                        <input type="time" value={betweenEnd} onChange={(e) => setBetweenEnd(e.target.value)} className="w-full pl-4 pr-10 py-3 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 text-[13px] font-bold outline-none focus:border-primary/50 transition-all" />
                                        <Clock className="absolute right-4 top-2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400 pointer-events-none mt-[1.2rem]" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-black uppercase tracking-widest text-neutral-400 flex items-center gap-2 px-1">
                                <Globe className="w-3 h-3 text-primary" /> Timezone
                            </label>
                            <div className="relative">
                                <select
                                    value={timezone}
                                    onChange={(e) => setTimezone(e.target.value)}
                                    className="w-full px-5 py-3.5 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 outline-none focus:border-primary/50 text-[13px] font-bold transition-all appearance-none cursor-pointer pr-12"
                                >
                                    <option value="UTC">UTC (Universal Time)</option>
                                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                                    <option value="America/New_York">America/New_York (EST)</option>
                                    <option value="Europe/London">Europe/London (GMT)</option>
                                </select>
                                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-8 border-t border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/30 flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 rounded-2xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[12px] font-black uppercase tracking-[0.2em] text-neutral-500 hover:bg-neutral-50 transition-all active:scale-95"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-[2] py-4 rounded-2xl bg-gradient-to-r from-primary to-pink-600 text-[12px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                        {isSaving ? <span className="animate-spin text-lg">⏳</span> : <Save size={16} />}
                        Save Campaign
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
