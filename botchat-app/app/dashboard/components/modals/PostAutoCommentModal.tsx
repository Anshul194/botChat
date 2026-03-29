"use client";

import { useState, useEffect } from "react";
import {
    X, Save, Calendar, Clock, Globe,
    Target, Sparkles, MessageSquare,
    ChevronDown, Info, AlertCircle,
    Pause, Play, Settings2, LayoutGrid, Loader2, ArrowRight,
    RefreshCw, Layers, Plus, ChevronLeft, Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useModal } from "@/components/providers/ModalProvider";
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
    const { showModal } = useModal();
    const [view, setView] = useState<"choice" | "template" | "custom" | "fetching">("fetching");
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
    const [exactTime, setExactTime] = useState("12:00");
    const [timezone, setTimezone] = useState("Asia/Kolkata");

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
            // Use GET for fetching config
            const res = await api.get(`${endpoint}?page_id=${pageId}${platform === 'instagram' ? '&platform=instagram' : ''}`);
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
                if (data.schedule_time) setExactTime(data.schedule_time.slice(0, 5));
                if (data.timezone) setTimezone(data.timezone);

                setView("custom");
            } else {
                setView("choice");
            }
        } catch (error) {
            console.error("Fetch Config Error:", error);
            setView("choice");
        } finally {
            setIsFetchingConfig(false);
        }
    };

    const fetchTemplates = async () => {
        setIsLoadingTemplates(true);
        try {
            const endpoint = platform === "facebook" ? "/facebook/comment-template" : "/instagram/comment-template";
            const res = await api.get(`${endpoint}?page_id=${pageId}${platform === 'instagram' ? '&platform=instagram' : ''}`);
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
            showModal("error", "Error", "Please fill in all required fields");
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
                schedule_time: exactTime,
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
                res = await api.patch(`${endpoint}/${postId}?page_id=${pageId}`, payload);
            } else {
                res = await api.post(`${endpoint}?page_id=${pageId}`, payload);
            }

            if (res.data.success || res.data.is_success) {
                showModal("success", "Success", existingCampaignId ? "Campaign updated!" : "Campaign enabled!");
                onSaved();
                onClose();
            }
        } catch (error: any) {
            showModal("error", "Error", error.response?.data?.message || "Failed to save campaign");
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
                showModal("success", "Updated", `Campaign ${newStatus === 'active' ? 'resumed' : 'paused'}!`);
                onSaved();
            }
        } catch (error: any) {
            showModal("error", "Error", error.response?.data?.message || "Status update failed");
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
                showModal("success", "Deleted", "Campaign deleted");
                onSaved();
                onClose();
            }
        } catch (error: any) {
            showModal("error", "Error", error.response?.data?.message || "Deletion failed");
        } finally {
            setIsDeleting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-neutral-950/40 backdrop-blur-sm" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 30 }}
                className={cn(
                    "bg-white/95 dark:bg-neutral-900/95 backdrop-blur-xl border border-white/20 dark:border-neutral-800 rounded-[40px] shadow-[0_32px_120px_-15px_rgba(0,0,0,0.3)] relative z-10 overflow-hidden flex flex-col max-h-[95vh] transition-all duration-500 w-full mx-4",
                    view === "choice" ? "max-w-xl" : "max-w-5xl"
                )}
            >
                {/* Vibrant Header */}
                <div className="relative px-8 py-7 flex items-center justify-between overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-white/0 to-primary/10 opacity-50" />
                    <div className="flex items-center gap-5 relative z-10">
                        <div className="w-14 h-14 rounded-[22px] bg-gradient-to-br from-primary to-rose-500 flex items-center justify-center text-white shadow-[0_8px_20px_-6px_rgba(219,39,119,0.5)] rotate-3">
                            <Sparkles size={28} />
                        </div>
                        <div className="flex flex-col">
                            <h2 className="text-[18px] font-black text-neutral-900 dark:text-white uppercase tracking-tight leading-none">Auto Comment Flow</h2>
                            <div className="flex items-center gap-2 mt-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] leading-none">Intelligence Hub</p>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 relative z-10">
                        {existingCampaignId && (
                            <div className="flex items-center gap-3 bg-white/50 dark:bg-black/20 p-1 rounded-2xl border border-white/20">
                                <button onClick={handleStatusToggle} className={cn("px-4 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm active:scale-95", status === "active" ? "bg-amber-500 text-white shadow-amber-200" : "bg-emerald-500 text-white shadow-emerald-200")}>
                                    {status === "active" ? "Pause Flow" : "Resume Flow"}
                                </button>
                                <button onClick={handleDelete} disabled={isDeleting} className="w-10 h-10 rounded-xl text-rose-500 hover:bg-rose-50 transition-all flex items-center justify-center">
                                    {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={18} />}
                                </button>
                            </div>
                        )}
                        <button onClick={onClose} className="w-10 h-10 rounded-full bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm"><X size={20} /></button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-slate-50/10 dark:bg-neutral-950/20 min-h-[400px] flex flex-col">
                    <AnimatePresence mode="wait">
                        {view === "fetching" && (
                            <motion.div 
                                key="fetching"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-6"
                            >
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-[30px] border-4 border-primary/10 border-t-primary animate-spin" />
                                    <Sparkles className="absolute inset-0 m-auto w-8 h-8 text-primary animate-pulse" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Syncing Campaign</h3>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Retrieving your deployment protocol...</p>
                                </div>
                            </motion.div>
                        )}

                        {view === "choice" && (
                            <motion.div
                                key="choice"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 1.05 }}
                                className="space-y-10 text-center py-10"
                            >
                                <div className="space-y-3">
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Activation Hub</h3>
                                    <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Choose your deployment strategy</p>
                                </div>
                                <div className="grid grid-cols-1 gap-5 max-w-sm mx-auto">
                                    {[
                                        { id: 'template', label: 'Template Mode', desc: 'Deploy existing presets', icon: Layers, color: 'bg-primary' },
                                        { id: 'custom', label: 'Direct Config', desc: 'Bespoke logic flow', icon: Plus, color: 'bg-slate-900 dark:bg-white' }
                                    ].map(opt => (
                                        <button key={opt.id} onClick={() => setView(opt.id as any)} className="group relative p-8 rounded-[32px] border-2 border-slate-100 dark:border-neutral-800 hover:border-primary/30 hover:bg-white dark:hover:bg-neutral-900 transition-all duration-300 shadow-sm hover:shadow-2xl hover:shadow-primary/10">
                                            <div className="flex items-center gap-6">
                                                <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg group-hover:scale-110 group-hover:rotate-6", opt.id === 'template' ? "bg-primary text-white" : "bg-slate-900 dark:bg-white text-white dark:text-slate-900")}>
                                                    <opt.icon size={32} />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-[17px] font-black text-slate-900 dark:text-white uppercase tracking-tight">{opt.label}</p>
                                                    <p className="text-[12px] text-slate-400 font-bold uppercase tracking-widest mt-1">{opt.desc}</p>
                                                </div>
                                            </div>
                                            <ArrowRight className="absolute right-8 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-200 group-hover:text-primary group-hover:translate-x-2 transition-all" />
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}

                        {(view === "custom" || view === "template") && (
                            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                                <button onClick={() => setView("choice")} className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-colors"><ChevronLeft size={14} /> Change Path</button>

                                <div className="grid grid-cols-12 gap-8 items-start">
                                    <div className="col-span-7 space-y-2">
                                        <label className="text-[11px] font-black text-neutral-400 uppercase tracking-widest ml-1">Campaign Title <span className="text-primary">*</span></label>
                                        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Daily Engagement Flow" className="w-full px-6 py-4 rounded-[20px] bg-white dark:bg-neutral-900 border-2 border-slate-50 dark:border-neutral-800 focus:border-primary/20 outline-none transition-all font-black text-[15px] shadow-sm focus:shadow-xl focus:shadow-primary/5" />
                                    </div>
                                    <div className="col-span-5 space-y-2">
                                        <label className="text-[11px] font-black text-neutral-400 uppercase tracking-widest ml-1">Contextual Zone</label>
                                        <div className="relative group">
                                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary transition-colors">
                                                <Globe size={18} />
                                            </div>
                                            <select value={timezone} onChange={e => setTimezone(e.target.value)} className="w-full pl-14 pr-12 py-4 rounded-[20px] bg-white dark:bg-neutral-900 border-2 border-slate-50 dark:border-neutral-800 focus:border-primary/20 font-black transition-all appearance-none cursor-pointer shadow-sm text-[13px] outline-none">
                                                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                                                <option value="UTC">UTC (Universal)</option>
                                                <option value="America/New_York">America/New_York (EST)</option>
                                                <option value="Europe/London">Europe/London (GMT)</option>
                                                <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                                                <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                                            </select>
                                            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 rounded-[32px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl shadow-slate-100/50 dark:shadow-none space-y-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                                            <MessageSquare className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-[14px] font-black uppercase tracking-tight text-neutral-800 dark:text-neutral-200">Content Repository</h3>
                                    </div>

                                    <div className="grid grid-cols-12 gap-10">
                                        <div className="col-span-6 space-y-4">
                                            <label className="text-[11px] font-black text-neutral-400 uppercase tracking-widest ml-1">Target Comment Template</label>
                                            <div className="relative group">
                                                <select value={templateId} onChange={(e) => setTemplateId(e.target.value)} className="w-full px-6 py-5 rounded-[22px] bg-slate-50 dark:bg-neutral-800 border-2 border-transparent focus:border-primary/20 outline-none text-[15px] font-black transition-all appearance-none cursor-pointer pr-14 shadow-inner">
                                                    <option value="" disabled>Select from library...</option>
                                                    {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                </select>
                                                <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none group-focus-within:rotate-180 transition-transform" />
                                            </div>
                                        </div>
                                        <div className="col-span-6 space-y-4">
                                            <label className="text-[11px] font-black text-neutral-400 uppercase tracking-widest ml-1">Selection Logic</label>
                                            <div className="grid grid-cols-2 gap-4">
                                                {[
                                                    { id: 'random', label: 'Random', icon: Sparkles },
                                                    { id: 'serial', label: 'Serial', icon: LayoutGrid }
                                                ].map(opt => (
                                                    <button key={opt.id} onClick={() => setSelectionMode(opt.id as any)} className={cn("px-6 py-4 rounded-[22px] border-2 transition-all text-left flex items-center gap-4 group", selectionMode === opt.id ? "bg-primary/5 border-primary shadow-sm" : "bg-transparent border-slate-50 dark:border-neutral-800 hover:bg-neutral-50")}>
                                                        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-sm", selectionMode === opt.id ? "bg-primary text-white" : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 group-hover:bg-primary/10 group-hover:text-primary")}><opt.icon size={18} /></div>
                                                        <span className={cn("text-[13px] font-black uppercase tracking-tight", selectionMode === opt.id ? "text-primary" : "text-neutral-500")}>{opt.label}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-8 rounded-[32px] border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl shadow-slate-200/50 dark:shadow-none space-y-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                                            <Calendar className="w-4 h-4" />
                                        </div>
                                        <h3 className="text-[14px] font-black uppercase tracking-tight text-neutral-800 dark:text-neutral-200">Timing Protocol</h3>
                                    </div>

                                    <div className="flex gap-2 p-1.5 bg-slate-50 dark:bg-neutral-950 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-inner">
                                        {[
                                            { id: 'periodic', label: 'Periodic Flow' },
                                            { id: 'one_time', label: 'One Time Blast' }
                                        ].map(opt => (
                                            <button key={opt.id} onClick={() => setScheduleType(opt.id as any)} className={cn("flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all duration-300", scheduleType === opt.id ? "bg-primary text-white shadow-lg shadow-primary/30 scale-[1.02]" : "text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300")}>{opt.label}</button>
                                        ))}
                                    </div>

                                    <AnimatePresence mode="wait">
                                        {scheduleType === "one_time" ? (
                                            <motion.div
                                                key="one_time"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="space-y-4 pt-2"
                                            >
                                                <div className="space-y-3">
                                                    <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Exact Time to Comment (HH:MM)</label>
                                                    <div className="relative group cursor-pointer" onClick={(e) => (e.currentTarget.querySelector('input') as HTMLInputElement).showPicker()}>
                                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-slate-50 dark:bg-neutral-800 flex items-center justify-center text-neutral-400 group-hover:bg-primary/10 group-hover:text-primary transition-all shadow-inner">
                                                            <Clock size={16} />
                                                        </div>
                                                        <input
                                                            type="time"
                                                            value={exactTime}
                                                            onChange={e => setExactTime(e.target.value)}
                                                            className="w-full pl-20 pr-6 py-4 rounded-2xl bg-white dark:bg-neutral-900 border-2 border-transparent focus:border-primary/20 outline-none font-bold text-[16px] transition-all shadow-sm group-hover:shadow-xl group-hover:shadow-primary/5 cursor-pointer"
                                                        />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ) : (
                                            <motion.div
                                                key="periodic"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="space-y-6 pt-2"
                                            >
                                                <div className="grid grid-cols-2 gap-6 p-6 rounded-3xl bg-slate-50/30 dark:bg-neutral-950/20 border border-slate-100 dark:border-neutral-800/50">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Protocol Start</label>
                                                        <div className="relative group cursor-pointer" onClick={(e) => (e.currentTarget.querySelector('input') as HTMLInputElement).showPicker()}>
                                                            <input
                                                                type="time"
                                                                value={startTime}
                                                                onChange={e => setStartTime(e.target.value)}
                                                                className="w-full px-5 py-3.5 rounded-2xl bg-white dark:bg-neutral-900 border-2 border-transparent focus:border-primary/20 outline-none font-bold text-[14px] transition-all shadow-sm group-hover:shadow-md cursor-pointer"
                                                            />
                                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-300 group-hover:text-primary transition-colors pointer-events-none">
                                                                <Clock size={16} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest ml-1">Protocol End</label>
                                                        <div className="relative group cursor-pointer" onClick={(e) => (e.currentTarget.querySelector('input') as HTMLInputElement).showPicker()}>
                                                            <input
                                                                type="time"
                                                                value={endTime}
                                                                onChange={e => setEndTime(e.target.value)}
                                                                className="w-full px-5 py-3.5 rounded-2xl bg-white dark:bg-neutral-900 border-2 border-transparent focus:border-primary/20 outline-none font-bold text-[14px] transition-all shadow-sm group-hover:shadow-md cursor-pointer"
                                                            />
                                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-300 group-hover:text-primary transition-colors pointer-events-none">
                                                                <Clock size={16} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-6 p-6 rounded-3xl bg-primary/[0.02] border border-primary/5">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-primary/40 uppercase tracking-widest ml-1">Active Peak From</label>
                                                        <div className="relative group cursor-pointer" onClick={(e) => (e.currentTarget.querySelector('input') as HTMLInputElement).showPicker()}>
                                                            <input
                                                                type="time"
                                                                value={betweenStart}
                                                                onChange={e => setBetweenStart(e.target.value)}
                                                                className="w-full px-5 py-3.5 rounded-2xl bg-white dark:bg-neutral-900 border-2 border-transparent focus:border-primary/20 outline-none font-bold text-[14px] transition-all shadow-sm group-hover:shadow-md cursor-pointer"
                                                            />
                                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-primary/20 group-hover:text-primary transition-colors pointer-events-none">
                                                                <Clock size={16} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-primary/40 uppercase tracking-widest ml-1">Active Peak To</label>
                                                        <div className="relative group cursor-pointer" onClick={(e) => (e.currentTarget.querySelector('input') as HTMLInputElement).showPicker()}>
                                                            <input
                                                                type="time"
                                                                value={betweenEnd}
                                                                onChange={e => setBetweenEnd(e.target.value)}
                                                                className="w-full px-5 py-3.5 rounded-2xl bg-white dark:bg-neutral-900 border-2 border-transparent focus:border-primary/20 outline-none font-bold text-[14px] transition-all shadow-sm group-hover:shadow-md cursor-pointer"
                                                            />
                                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 text-primary/20 group-hover:text-primary transition-colors pointer-events-none">
                                                                <Clock size={16} />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    <div className="grid grid-cols-12 gap-8 items-center pt-4 border-t border-neutral-100 dark:border-neutral-800">
                                        <div className="col-span-12 py-2">
                                            <p className="text-[9px] text-neutral-400 font-bold uppercase tracking-[0.4em] text-center opacity-40">Deployment Protocol Established</p>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
                {view !== "choice" && (
                    <div className="p-8 border-t border-neutral-100 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md flex gap-5 shadow-2xl relative z-20">
                        <button onClick={onClose} className="flex-1 py-5 rounded-3xl bg-slate-50 dark:bg-neutral-800 text-[12px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-rose-500 transition-all active:scale-95 border border-slate-100 dark:border-neutral-700">Cancel</button>
                        <button onClick={handleSave} disabled={isSaving} className="flex-[2.5] py-5 rounded-3xl bg-gradient-to-r from-primary to-rose-600 text-white font-black text-[13px] uppercase tracking-[0.2em] shadow-[0_20px_40px_-10px_rgba(219,39,119,0.4)] hover:shadow-[0_25px_50px_-12px_rgba(219,39,119,0.5)] hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50">
                            {isSaving ? <Loader2 className="w-5 h-5 animate-spin text-white" /> : <Save size={20} />} Deploy Flow
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
