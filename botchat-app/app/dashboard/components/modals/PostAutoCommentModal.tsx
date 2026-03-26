"use client";

import { useState, useEffect } from "react";
import {
    X, Save, Calendar, Clock, Globe,
    Target, Sparkles, MessageSquare,
    ChevronDown, Info, AlertCircle,
    Pause, Play, Settings2, LayoutGrid, Loader2,
    RefreshCw, Layers, Plus, ChevronLeft, Trash2
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
    const [view, setView] = useState<"choice" | "template" | "custom">("choice");
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
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
            else setView("choice");
        }
    }, [isOpen, postId]);

    const fetchCampaignConfig = async () => {
        setIsFetchingConfig(true);
        try {
            const endpoint = platform === "facebook"
                ? `/facebook/post-auto-comment/${postId}`
                : `/instagram/post-auto-comment/${postId}`;
            const res = await api.put(`${endpoint}?page_id=${pageId}`);
            const data = res.data?.data;
            if (data) {
                setExistingCampaignId(data.id);
                setName(data.campaign_name || "");
                setTemplateId(data.template_id || "");
                setSelectionMode(data.comment_type || "random");
                setScheduleType(data.schedule_type || "periodic");
                setStatus(data.status || "active");
                if (data.start_time) setStartTime(data.start_time.slice(0, 5));
                if (data.end_time) setEndTime(data.end_time.slice(0, 5));
                if (data.comment_between_start) setBetweenStart(data.comment_between_start.slice(0, 5));
                if (data.comment_between_end) setBetweenEnd(data.comment_between_end.slice(0, 5));
                if (data.timezone) setTimezone(data.timezone);

                setView("custom");
            }
        } catch (error) {
            console.error("Fetch Config Error:", error);
        } finally {
            setIsFetchingConfig(false);
        }
    };

    const fetchTemplates = async () => {
        setIsLoadingTemplates(true);
        try {
            const endpoint = platform === "facebook" ? "/facebook/comment-template" : "/instagram/comment-template";
            const res = await api.get(`${endpoint}?page_id=${pageId}`);
            if (res.data.success || res.data.is_success) {
                setTemplates(res.data.data || []);
            }
        } catch (error) {
            console.error("Fetch Templates Error:", error);
        } finally {
            setIsLoadingTemplates(false);
        }
    };

    const handleSave = async () => {
        if (!name || (view === "custom" && !templateId) || (view === "template" && !templateId)) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsSaving(true);
        try {
            const endpoint = platform === "facebook" ? "/facebook/post-auto-comment" : "/instagram/post-auto-comment";
            const payload = {
                post_id: postId,
                template_id: templateId,
                campaign_name: name,
                schedule_type: scheduleType,
                schedule_time: "09:00",
                timezone: timezone || "Asia/Kolkata",
                start_time: startTime,
                end_time: endTime,
                comment_between_start: betweenStart,
                comment_between_end: betweenEnd,
                comment_type: selectionMode,
                ...(platform === "facebook" ? { facebook_page_id: pageId } : { instagram_id: pageId })
            };

            let res;
            if (existingCampaignId) {
                res = await api.put(`${endpoint}/${postId}?page_id=${pageId}`, payload);
            } else {
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
            const endpoint = platform === "facebook" ? `/facebook/post-auto-comment/${postId}/status` : `/instagram/post-auto-comment/${postId}/status`;
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

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this auto-comment campaign?")) return;
        setIsDeleting(true);
        try {
            const endpoint = platform === "facebook" ? `/facebook/post-auto-comment/${postId}` : `/instagram/post-auto-comment/${postId}`;
            const res = await api.delete(`${endpoint}?page_id=${pageId}`);
            if (res.data.success || res.data.is_success) {
                toast.success("Campaign deleted");
                onSaved();
                onClose();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Deletion failed");
        } finally {
            setIsDeleting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-neutral-950/40 backdrop-blur-sm" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
                className={cn(
                    "bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-xl relative z-10 overflow-hidden flex flex-col max-h-[90vh] transition-all",
                    view === "choice" ? "max-w-lg" : "max-w-3xl"
                )}
            >
                {/* Header */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20"><Sparkles size={20} /></div>
                        <div className="flex flex-col">
                            <h2 className="text-[14px] font-bold text-neutral-900 dark:text-white uppercase tracking-tight leading-none">Auto Comment Flow</h2>
                            {existingCampaignId && view !== "choice" && (
                                <p className="text-[10px] font-semibold text-primary uppercase mt-1 leading-none tracking-widest">Post Level Hub</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {existingCampaignId && (
                            <>
                                <button onClick={handleStatusToggle} className={cn("px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all", status === "active" ? "bg-amber-50 text-amber-600 hover:bg-amber-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100")}>
                                    {status === "active" ? "Pause" : "Resume"}
                                </button>
                                <button onClick={handleDelete} disabled={isDeleting} className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-rose-500 bg-rose-50 hover:bg-rose-100 transition-all flex items-center gap-1">
                                    {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />} Delete
                                </button>
                            </>
                        )}
                        <button onClick={onClose} className="p-2.5 rounded-xl hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors text-neutral-400"><X className="w-4 h-4" /></button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/20 dark:bg-neutral-950/20 font-medium">
                    <AnimatePresence mode="wait">
                        {view === "choice" && (
                            <motion.div key="choice" className="space-y-6 text-center py-10">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Campaign Activation Hub</h3>
                                    <p className="text-sm text-slate-500 font-medium">Configure how this post generates engagement.</p>
                                </div>
                                <div className="grid grid-cols-1 gap-4 max-w-sm mx-auto pt-4">
                                    <button onClick={() => setView("template")} className="group p-6 rounded-2xl border-2 border-slate-200 dark:border-neutral-800 hover:border-primary hover:bg-primary/5 transition-all text-left">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm"><Layers size={24} /></div>
                                            <div>
                                                <p className="text-[14px] font-bold text-slate-800 dark:text-white uppercase">Template Mode</p>
                                                <p className="text-[11px] text-slate-500">Pick from existing presets</p>
                                            </div>
                                        </div>
                                    </button>
                                    <button onClick={() => setView("custom")} className="group p-6 rounded-2xl border-2 border-slate-200 dark:border-neutral-800 hover:border-primary hover:bg-primary/5 transition-all text-left">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-neutral-800 text-slate-500 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm"><Plus size={24} /></div>
                                            <div>
                                                <p className="text-[14px] font-bold text-slate-800 dark:text-white uppercase">Direct Config</p>
                                                <p className="text-[11px] text-slate-500">Build custom logic for this post</p>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {(view === "custom" || view === "template") && (
                            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <button onClick={() => setView("choice")} className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-colors"><ChevronLeft size={14} /> Change Path</button>

                                <div className="space-y-2">
                                    <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Campaign Title <span className="text-primary">*</span></label>
                                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Daily Engagement Flow" className="w-full px-5 py-3.5 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 focus:border-primary/50 outline-none transition-all font-semibold text-[14px] shadow-sm" />
                                </div>

                                <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-6">
                                    <div className="flex items-center gap-2 text-primary"><MessageSquare className="w-4 h-4" /><h3 className="text-[12px] font-bold uppercase tracking-widest leading-none">Content Repository</h3></div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest">Select Comment Template</label>
                                        <div className="relative">
                                            <select value={templateId} onChange={(e) => setTemplateId(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none focus:border-primary/50 text-[14px] font-semibold transition-all appearance-none cursor-pointer pr-12">
                                                <option value="" disabled>Select from library...</option>
                                                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                            </select>
                                            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        {[
                                            { id: 'random', label: 'Randomized', icon: Sparkles, desc: 'Variable order flow' },
                                            { id: 'serial', label: 'Sequential', icon: LayoutGrid, desc: 'Linear queue flow' }
                                        ].map(opt => (
                                            <button key={opt.id} onClick={() => setSelectionMode(opt.id as any)} className={cn("p-4 rounded-xl border transition-all text-left group", selectionMode === opt.id ? "bg-primary/5 border-primary shadow-sm" : "bg-transparent border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50")}>
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center transition-all", selectionMode === opt.id ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400")}><opt.icon size={16} /></div>
                                                    <div>
                                                        <p className={cn("text-[12px] font-bold uppercase tracking-tight", selectionMode === opt.id ? "text-primary" : "text-neutral-500")}>{opt.label}</p>
                                                        <p className="text-[10px] text-neutral-400 font-semibold mt-0.5">{opt.desc}</p>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-sm space-y-8">
                                    <div className="flex items-center gap-2 text-primary"><Calendar className="w-4 h-4" /><h3 className="text-[12px] font-bold uppercase tracking-widest leading-none">Timing Protocol</h3></div>
                                    <div className="flex gap-4 p-1.5 bg-slate-50 dark:bg-neutral-950 rounded-xl border border-neutral-100 dark:border-neutral-800">
                                        {[
                                            { id: 'periodic', label: 'Periodic' },
                                            { id: 'one_time', label: 'One Time' }
                                        ].map(opt => (
                                            <button key={opt.id} onClick={() => setScheduleType(opt.id as any)} className={cn("flex-1 py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all", scheduleType === opt.id ? "bg-primary text-white shadow-md lg:shadow-primary/20" : "text-neutral-400 hover:text-neutral-600")}>{opt.label}</button>
                                        ))}
                                    </div>
                                    <div className="grid grid-cols-2 gap-6 border-b border-neutral-50 dark:border-neutral-800 pb-6">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Protocol Start</label>
                                            <div className="relative"><input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 outline-none focus:border-primary/50 font-bold transition-all shadow-inner" /><Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" /></div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Protocol End</label>
                                            <div className="relative"><input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 outline-none focus:border-primary/50 font-bold transition-all shadow-inner" /><Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" /></div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-6 border-b border-neutral-50 dark:border-neutral-800 pb-6">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Active From</label>
                                            <div className="relative"><input type="time" value={betweenStart} onChange={e => setBetweenStart(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 outline-none focus:border-primary/50 font-bold transition-all shadow-inner" /><Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" /></div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Active To</label>
                                            <div className="relative"><input type="time" value={betweenEnd} onChange={e => setBetweenEnd(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-neutral-950 border border-neutral-100 dark:border-neutral-800 outline-none focus:border-primary/50 font-bold transition-all shadow-inner" /><Clock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" /></div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Contextual Zone</label>
                                        <div className="relative">
                                            <select value={timezone} onChange={e => setTimezone(e.target.value)} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 outline-none focus:border-primary/50 font-bold transition-all appearance-none cursor-pointer pr-12 shadow-inner">
                                                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option><option value="UTC">UTC (Universal)</option><option value="America/New_York">America/New_York (EST)</option><option value="Europe/London">Europe/London (GMT)</option>
                                            </select>
                                            <Globe className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                {view !== "choice" && (
                    <div className="p-6 border-t border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex gap-4 shadow-sm">
                        <button onClick={onClose} className="flex-1 py-3.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-rose-500 transition-all active:scale-95">Cancel</button>
                        <button onClick={handleSave} disabled={isSaving} className="flex-[2] py-3.5 rounded-xl bg-primary text-white font-bold text-[12px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Save size={16} />} Deploy Flow
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
