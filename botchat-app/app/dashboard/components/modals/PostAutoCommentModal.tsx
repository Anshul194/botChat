"use client";

import { useState, useEffect } from "react";
import {
    X, Save, Calendar, Clock, Globe,
    Target, Sparkles, MessageSquare,
    ChevronDown, Info, AlertCircle,
    Pause, Play, Settings2, LayoutGrid, Loader2, ArrowRight,
    RefreshCw, Layers, Plus, ChevronLeft, Trash2, Edit3, MessageCircle, BarChart2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useModal } from "@/components/providers/ModalProvider";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ── Types ──────────────────────────────────────────────────────────────────────
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
    facebookPageId?: string;
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

function CapsuleSwitch({ active }: { active: boolean }) {
    return (
        <div className={cn("w-11 h-5 rounded-full relative transition-all", active ? "bg-pink-600" : "bg-slate-300 shadow-inner")}>
            <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all", active ? "left-6.5" : "left-0.5")} />
        </div>
    );
}

// ── Main Modal ────────────────────────────────────────────────────────────────

export function PostAutoCommentModal({
    isOpen,
    onClose,
    onSaved,
    platform,
    postId,
    pageId,
    facebookPageId
}: PostAutoCommentModalProps) {
    const { showModal } = useModal();
    const [view, setView] = useState<"choice" | "config">("choice");
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isFetchingConfig, setIsFetchingConfig] = useState(false);

    // Form Data
    const [existingCampaignId, setExistingCampaignId] = useState<number | null>(null);
    const [form, setForm] = useState({
        campaign_name: "",
        template_id: "",
        schedule_type: "periodic" as "periodic" | "one_time",
        schedule_time: "", // format: YYYY-MM-DD HH:MM:SS
        timezone: "Asia/Kolkata",
        start_time: "", // format: YYYY-MM-DD HH:MM:SS
        end_time: "", // format: YYYY-MM-DD HH:MM:SS
        comment_between_start: "09:00:00",
        comment_between_end: "21:00:00",
        comment_type: "random" as "random" | "serial",
        status: "active" as "active" | "paused"
    });

    useEffect(() => {
        if (isOpen) {
            fetchTemplates();
            if (postId) fetchCampaignConfig();
            else {
                resetForm();
                setView("choice");
            }
        }
    }, [isOpen, postId]);

    const resetForm = () => {
        setExistingCampaignId(null);
        setForm({
            campaign_name: "",
            template_id: "",
            schedule_type: "periodic",
            schedule_time: "",
            timezone: "Asia/Kolkata",
            start_time: "09:00",
            end_time: "21:00",
            comment_between_start: "09:00",
            comment_between_end: "21:00",
            comment_type: "random",
            status: "active"
        });
    };

    const fetchCampaignConfig = async () => {
        setIsFetchingConfig(true);
        try {
            const endpoint = platform === "facebook" 
                ? `/facebook/post-auto-comment/${postId}`
                : `/instagram/post-auto-comment/${postId}`;
            
            const params = platform === "facebook"
                ? { facebook_page_id: pageId }
                : { instagram_id: pageId, platform: "instagram" };

            const res = await api.get(endpoint, { params });
            const data = res.data?.data;
            if (data && (data.id || data.campaign_name)) {
                setExistingCampaignId(data.id || 1);
                
                // Helper to extract HH:MM from various backend formats
                const formatTime = (val: string) => {
                    if (!val) return "";
                    // If it's YYYY-MM-DD HH:MM:SS, extract HH:MM
                    if (val.includes(" ")) return val.split(" ")[1].slice(0, 5);
                    // If it's already HH:MM or HH:MM:SS
                    return val.slice(0, 5);
                };

                setForm({
                    campaign_name: data.campaign_name || "",
                    template_id: data.template_id || "",
                    schedule_type: data.schedule_type || "periodic",
                    schedule_time: data.schedule_time || "",
                    timezone: data.timezone || "Asia/Kolkata",
                    start_time: formatTime(data.start_time),
                    end_time: formatTime(data.end_time),
                    comment_between_start: formatTime(data.comment_between_start) || "09:00",
                    comment_between_end: formatTime(data.comment_between_end) || "21:00",
                    comment_type: data.comment_type || "random",
                    status: data.status || "active"
                });
                setView("config");
            } else {
                setExistingCampaignId(null);
                resetForm();
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
            const endpoint = platform === "facebook"
                ? `/facebook/comment-template?facebook_page_id=${pageId}`
                : `/instagram/comment-template?instagram_id=${pageId}&platform=instagram`;
            const res = await api.get(endpoint);
            if (res.data.success || res.data.is_success) {
                setTemplates(res.data.data || res.data.templates || []);
            }
        } catch (error) {
            console.error("Fetch Templates Error:", error);
        } finally {
            setIsLoadingTemplates(false);
        }
    };

    const handleSave = async () => {
        if (!form.campaign_name || !form.template_id) {
            toast.error("Please fill in all required fields (Campaign Name & Template)");
            return;
        }

        setIsSaving(true);
        try {
            const isFB = platform === "facebook";
            const endpoint = isFB ? `/facebook/post-auto-comment` : `/instagram/post-auto-comment`;
            
            const payload: any = {
                campaign_name: form.campaign_name,
                template_id: form.template_id,
                schedule_type: form.schedule_type,
                timezone: form.timezone,
                comment_type: form.comment_type,
                post_id: postId,
                // Strict H:i format (HH:MM)
                comment_between_start: (form.comment_between_start || "09:00").slice(0, 5),
                comment_between_end: (form.comment_between_end || "21:00").slice(0, 5),
            };

            if (isFB) {
                payload.facebook_page_id = pageId;
                if (form.schedule_type === "periodic") {
                    payload.start_time = (form.start_time || "09:00").slice(0, 5);
                    payload.end_time = (form.end_time || "21:00").slice(0, 5);
                } else {
                     payload.schedule_time = toBackendFormat(form.schedule_time);
                }
            } else {
                // Instagram logic
                payload.instagram_id = facebookPageId; 
                payload.facebook_page_id = pageId; 
                payload.platform = "instagram";
                
                if (form.schedule_type === "periodic") {
                    payload.start_time = (form.start_time || "09:00").slice(0, 5);
                    payload.end_time = (form.end_time || "21:00").slice(0, 5);
                } else {
                    payload.schedule_time = form.schedule_time;
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
                toast.success(existingCampaignId ? "Campaign updated!" : "Auto comment enabled!");
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
            const newStatus = form.status === "active" ? "paused" : "active";
            const endpoint = platform === "facebook"
                ? `/facebook/post-auto-comment/${postId}/status`
                : `/instagram/post-auto-comment/${postId}/status`;
            
            const payload: any = { status: newStatus };
            if (platform === "instagram") payload.platform = "instagram";

            const res = await api.patch(endpoint, payload);
            if (res.data.success || res.data.is_success) {
                setForm(f => ({ ...f, status: newStatus }));
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
            const endpoint = platform === "facebook"
                ? `/facebook/post-auto-comment/${postId}`
                : `/instagram/post-auto-comment/${postId}`;
            
            const params = platform === "facebook"
                ? { facebook_page_id: pageId }
                : { instagram_id: pageId, platform: "instagram" };

            const res = await api.delete(endpoint, { params });
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

    // Helper to format ISO to backend format
    const toBackendFormat = (val: string) => {
        if (!val) return "";
        return val.replace("T", " ") + ":00";
    };

    const fromBackendFormat = (val: string) => {
        if (!val) return "";
        return val.slice(0, 16).replace(" ", "T");
    };

    return (
        <AnimatePresence>
            <div key="post-auto-comment-modal" className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

                <motion.div
                    initial={{ opacity: 0, scale: 0.96, y: 24 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 24 }}
                    className={cn(
                        "relative z-10 w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[96vh] transition-all",
                        view === "choice" ? "max-w-lg" : "max-w-[900px]"
                    )}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-white sticky top-0 z-20">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center">
                                <Sparkles size={18} />
                            </div>
                            <h2 className="text-[14px] font-semibold text-slate-800 uppercase tracking-tight">
                                {existingCampaignId ? "Manage Auto Comment" : "Enable Auto Comment"}
                            </h2>
                        </div>
                        <div className="flex items-center gap-2">
                            {existingCampaignId && view !== "choice" && (
                                <>
                                    <button onClick={handleStatusToggle} className={cn("px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all", form.status === "active" ? "bg-amber-50 text-amber-600 border border-amber-100" : "bg-emerald-50 text-emerald-600 border border-emerald-100")}>
                                        {form.status === "active" ? "Pause" : "Resume"}
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
                                    <p className="text-sm font-medium text-slate-400">Syncing configuration...</p>
                                </div>
                            ) : view === "choice" ? (
                                <motion.div key="choice" className="space-y-8 py-8">
                                    <div className="text-center space-y-2 mb-10">
                                        <h3 className="text-xl font-bold text-slate-900 tracking-tight uppercase">Campaign Activation</h3>
                                        <p className="text-sm text-slate-500 font-medium">Configure your periodic comment engine</p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-5 max-w-sm mx-auto">
                                        <button onClick={() => setView("config")} className="group p-6 rounded-2xl border-2 border-slate-100 hover:border-pink-500 hover:bg-pink-50/30 transition-all text-left relative overflow-hidden">
                                            <div className="flex items-center gap-5 relative z-10">
                                                <div className="w-12 h-12 rounded-xl bg-pink-50 text-pink-600 flex items-center justify-center group-hover:bg-pink-600 group-hover:text-white transition-all">
                                                    <Settings2 size={24} />
                                                </div>
                                                <div>
                                                    <p className="text-[15px] font-bold text-slate-800 tracking-tight uppercase">Configure Flow</p>
                                                    <p className="text-[12px] text-slate-400 font-medium lowercase">Set schedule and logic rules</p>
                                                </div>
                                            </div>
                                            <ArrowRight className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-200 group-hover:text-pink-600 transition-all group-hover:translate-x-1" />
                                        </button>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div key="config" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <Field label="Campaign Name" required icon={Edit3}>
                                            <input type="text" value={form.campaign_name} onChange={e => setForm({ ...form, campaign_name: e.target.value })}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px]"
                                                placeholder="e.g. Daily Engagement Blast"
                                            />
                                        </Field>
                                        <Field label="Timezone" icon={Globe}>
                                            <div className="relative">
                                                <select value={form.timezone} onChange={e => setForm({ ...form, timezone: e.target.value })}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px] appearance-none bg-white cursor-pointer"
                                                >
                                                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                                                    <option value="UTC">UTC (Universal)</option>
                                                    <option value="America/New_York">America/New_York (EST)</option>
                                                    <option value="Europe/London">Europe/London (GMT)</option>
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                            </div>
                                        </Field>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <MessageCircle className="w-4 h-4 text-pink-500" />
                                            <h3 className="text-sm font-semibold text-slate-700">Content Logic</h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <Field label="Choose Message Template" required icon={Layers}>
                                                <div className="relative">
                                                    <select
                                                        value={form.template_id}
                                                        onChange={(e) => setForm({ ...form, template_id: e.target.value })}
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px] appearance-none bg-white cursor-pointer"
                                                    >
                                                        <option value="" disabled>{isLoadingTemplates ? "Fetching templates..." : "Select a template"}</option>
                                                        {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                                </div>
                                            </Field>
                                            <div className="space-y-4">
                                                <label className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                                                    <LayoutGrid className="w-3.5 h-3.5 text-slate-400" />
                                                    Selection Mode
                                                </label>
                                                <div className="flex gap-4">
                                                    {[
                                                        { id: 'random', label: 'Random' },
                                                        { id: 'serial', label: 'Serial' }
                                                    ].map(opt => (
                                                        <button key={opt.id} onClick={() => setForm(f => ({ ...f, comment_type: opt.id as any }))}
                                                            className={cn("flex-1 py-2.5 rounded-xl border-2 transition-all font-bold text-[12px] uppercase tracking-widest", form.comment_type === opt.id ? "border-pink-500 bg-pink-50 text-pink-600" : "border-slate-50 bg-white text-slate-400 hover:border-slate-200")}
                                                        >
                                                            {opt.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Calendar className="w-4 h-4 text-pink-500" />
                                            <h3 className="text-sm font-semibold text-slate-700">Schedule Engine</h3>
                                        </div>
                                        
                                        <div className="flex gap-2 p-1 bg-slate-50 rounded-xl mb-6">
                                            {[
                                                { id: 'periodic', label: 'Periodic Flow' },
                                                { id: 'one_time', label: 'One Time Blast' }
                                            ].map(opt => (
                                                <button key={opt.id} onClick={() => setForm(f => ({ ...f, schedule_type: opt.id as any }))}
                                                    className={cn("flex-1 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all", form.schedule_type === opt.id ? "bg-white text-pink-600 shadow-sm" : "text-slate-400 hover:text-slate-600")}
                                                >
                                                    {opt.label}
                                                </button>
                                            ))}
                                        </div>

                                        <AnimatePresence mode="wait">
                                            {form.schedule_type === "one_time" ? (
                                                <motion.div key="one_time" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-4">
                                                    <Field label="Target Time" required icon={Clock}>
                                                        <input type="datetime-local" value={fromBackendFormat(form.schedule_time)} onChange={e => setForm({ ...form, schedule_time: toBackendFormat(e.target.value) })}
                                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px]"
                                                        />
                                                    </Field>
                                                </motion.div>
                                            ) : (
                                                <motion.div key="periodic" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-8">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <Field label="Cycle Engagement Start" required icon={Clock}>
                                                            <input type="time" value={form.start_time.slice(0, 5)} onChange={e => setForm({ ...form, start_time: e.target.value })}
                                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px]"
                                                            />
                                                        </Field>
                                                        <Field label="Cycle Engagement End" required icon={Clock}>
                                                            <input type="time" value={form.end_time.slice(0, 5)} onChange={e => setForm({ ...form, end_time: e.target.value })}
                                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px]"
                                                            />
                                                        </Field>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-pink-50/30 rounded-2xl border border-pink-100/50">
                                                        <Field label="Comment Active From" desc="HH:MM" icon={Clock}>
                                                            <input type="time" value={form.comment_between_start.slice(0, 5)} onChange={e => setForm({ ...form, comment_between_start: e.target.value })}
                                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px]"
                                                            />
                                                        </Field>
                                                        <Field label="Comment Active To" desc="HH:MM" icon={Clock}>
                                                            <input type="time" value={form.comment_between_end.slice(0, 5)} onChange={e => setForm({ ...form, comment_between_end: e.target.value })}
                                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px]"
                                                            />
                                                        </Field>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {view !== "choice" && (
                        <div className="p-8 bg-white border-t border-slate-50 flex gap-4 sticky bottom-0 z-20">
                            <button onClick={() => setView("choice")} className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-500 font-bold text-[13px] hover:bg-slate-50 transition-all uppercase tracking-widest">Back</button>
                            <button onClick={handleSave} disabled={isSaving} className="flex-[2] py-3.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-500 text-white font-semibold text-[14px] shadow-xl shadow-pink-100 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50">
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={18} />}
                                <span>{existingCampaignId ? "Update Protocol" : "Deploy Campaign"}</span>
                            </button>
                        </div>
                    )}
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
