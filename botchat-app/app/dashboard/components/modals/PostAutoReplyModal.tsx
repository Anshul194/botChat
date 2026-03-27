"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
    X, Save, Zap, MessageSquare,
    ChevronDown, Info, AlertCircle,
    Pause, Play, ShieldAlert, Filter,
    Plus, Trash2, Layers, Megaphone,
    Search, Check, Sparkles, Smile, Settings2, Clock, Globe, Loader2,
    RefreshCw, MessageCircle, EyeOff, LayoutGrid, Image as ImageIcon, Video,
    Edit3, ChevronLeft, BarChart2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useModal } from "@/components/providers/ModalProvider";
import { cn } from "@/lib/utils";

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

// ── Reusable Form Components ──────────────────────────────────────────────────
function Field({ label, required, children, icon: Icon }: { label: string; required?: boolean; children: React.ReactNode; icon?: any }) {
    return (
        <div className="space-y-2 flex-1 min-w-0">
            <label className="text-[12px] font-semibold text-slate-700 flex items-center gap-1.5 dark:text-neutral-300">
                {Icon && <Icon className="w-4 h-4 text-primary" />}
                {label} {required && <span className="text-rose-500">*</span>}
            </label>
            {children}
        </div>
    );
}

function Toggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <div className="flex items-center gap-4 group">
            <span className="text-[12px] font-bold text-slate-500 group-hover:text-slate-700 transition-colors uppercase tracking-tight dark:text-neutral-400 dark:group-hover:text-neutral-300">{label}</span>
            <div className="flex items-center gap-3">
                <button onClick={onClick} className={cn(
                    "w-11 h-5 rounded-full relative transition-all duration-200",
                    active ? "bg-primary" : "bg-slate-300 dark:bg-neutral-800 shadow-inner"
                )}>
                    <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all", active ? "left-6.5" : "left-0.5")} />
                </button>
                <span className="text-[10px] font-bold text-slate-400 w-8 text-center uppercase tracking-widest">{active ? "YES" : "NO"}</span>
            </div>
        </div>
    );
}

function CapsuleSwitch({ active }: { active: boolean }) {
    return (
        <div className={cn("w-11 h-5 rounded-full relative transition-all", active ? "bg-primary" : "bg-slate-300 dark:bg-neutral-800 shadow-inner")}>
            <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all", active ? "left-6.5" : "left-0.5")} />
        </div>
    );
}

function UploadBox({ label, value, onChange, icon: Icon }: { label: string; value: string | null; onChange: (v: string | null) => void; icon: any }) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => { onChange(reader.result as string); };
            reader.readAsDataURL(file);
        }
    };
    const isVideo = label.toLowerCase().includes("video");

    return (
        <div className="space-y-2 flex-1">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-tight px-1 flex items-center gap-2 dark:text-neutral-400">
                <Icon className="w-3.5 h-3.5" /> {label}
            </label>
            <div className="flex items-center gap-0 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 group focus-within:border-primary/50 overflow-hidden transition-all shadow-sm h-[44px]">
                <div onClick={() => fileInputRef.current?.click()} className="bg-primary text-white px-5 h-full text-[12px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors flex-shrink-0 cursor-pointer hover:bg-primary/90">
                    <Plus className="w-4 h-4" /> Upload
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept={isVideo ? "video/*" : "image/*"} onChange={handleFileChange} />
                <input type="text" placeholder={`URL here or click upload`} value={value || ""} onChange={e => onChange(e.target.value || null)}
                    className="flex-1 bg-transparent border-none outline-none text-[13px] font-medium text-slate-700 dark:text-neutral-200 px-4 placeholder:text-slate-300 dark:placeholder:text-neutral-600"
                />
            </div>
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
        template_id: "" as string | number | null,       // used in template mode
        private_template_id: "" as string | number | null, // used in generic mode
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
        }
    }, [isOpen, postId]);

    const fetchCampaignConfig = async () => {
        setIsFetchingConfig(true);
        try {
            const base = platform === "facebook" ? `/facebook/post-auto-reply` : `/instagram/post-auto-reply`;
            const res = await api.get(`${base}/${postId}?page_id=${pageId}`);
            const data = res.data?.data;

            if (data) {
                setExistingCampaignId(data.id);
                setStatus(data.status || "active");

                if (data.use_template || data.template_id) {
                    setView("template");
                    setForm(f => ({ ...f, template_id: data.template_id }));
                } else {
                    setView("custom");
                }

                setForm(f => ({
                    ...f,
                    name: data.campaign_name || data.name || "",
                    reply_type: data.reply_type || "generic",
                    message: data.message || "",
                    multiple_reply_enabled: data.multiple_reply_enabled === "1" || !!data.multiple_reply_enabled,
                    comment_reply_enabled: data.comment_reply_enabled !== "0" && data.comment_reply_enabled !== false,
                    hide_after_reply: data.hide_after_reply === "1" || !!data.hide_after_reply,
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

                if (Array.isArray(data.rules)) {
                    setFilterRules(data.rules.map((r: any) => ({
                        ...r, id: Math.random().toString()
                    })));
                }
            } else {
                // No data → no campaign exists yet, show choice screen
                setView("choice");
            }
        } catch (error: any) {
            const status = error?.response?.status;
            if (status === 400 || status === 404) {
                // Backend returns 400/404 when no campaign exists for this post — normal case
                setView("choice");
            } else {
                console.error("Fetch Campaign Config Error:", error);
            }
        } finally {
            setIsFetchingConfig(false);
        }
    };

    const fetchTemplates = async () => {
        setIsLoadingTemplates(true);
        try {
            const endpoint = platform === "facebook" ? "/facebook/auto-reply-template" : "/instagram/auto-reply-template";
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
        if (!form.name && view === "custom") { showModal("error", "Error", "Campaign name is required"); return; }
        if (!form.template_id && view === "template") { showModal("error", "Error", "Please select a template"); return; }

        setIsSaving(true);
        try {
            const endpoint = platform === "facebook" ? "/facebook/post-auto-reply" : "/instagram/post-auto-reply";

            const payload: any = {
                post_id: postId,
                ...(platform === "facebook" ? { facebook_page_id: pageId } : { instagram_id: pageId }),
                use_template: view === "template" ? 1 : 0,
                name: form.name || "My Auto Reply",
                reply_type: form.reply_type,
                multiple_reply_enabled: form.multiple_reply_enabled ? 1 : 0,
                comment_reply_enabled: form.comment_reply_enabled ? 1 : 0,
                hide_after_reply: form.hide_after_reply ? 1 : 0,
                save_as_template: form.save_as_template ? 1 : 0,
                offensive: {
                    offensive_keywords: form.offensive.offensive_keywords ?? "",
                    private_reply_template_id: form.offensive.private_reply_template_id ?? "",
                    hide_comment: form.offensive.hide_comment ? 1 : 0,
                    delete_comment: form.offensive.delete_comment ? 1 : 0,
                },
            };

            if (view === "template") {
                // Template mode: pass template_id and use_template:1
                payload.template_id = String(form.template_id);
            } else {
                // Custom mode: pass message, private_template_id, rules
                payload.message = form.message;
                payload.image = "";
                payload.video = "";
                payload.private_template_id = form.private_template_id ?? "";
                payload.rules = filterRules.map(({ keyword, match_type, message, image, video, private_template_id }) => ({
                    keyword,
                    match_type,
                    message,
                    image: image ?? "",
                    video: video ?? "",
                    private_template_id: private_template_id ?? ""
                }));
            }

            let res;
            if (existingCampaignId) {
                res = await api.put(`${endpoint}/${postId}?page_id=${pageId}`, payload);
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
            const endpoint = platform === "facebook" ? `/facebook/post-auto-reply/${postId}/status` : `/instagram/post-auto-reply/${postId}/status`;
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
        if (!confirm("Are you sure you want to delete this campaign?")) return;
        setIsDeleting(true);
        try {
            const endpoint = platform === "facebook" ? `/facebook/post-auto-reply/${postId}` : `/instagram/post-auto-reply/${postId}`;
            const res = await api.delete(`${endpoint}?page_id=${pageId}`);
            if (res.data.success || res.data.is_success) {
                showModal("success", "Deleted", "Campaign deleted successfully");
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
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                className={cn(
                    "relative z-10 w-full bg-white dark:bg-neutral-900 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[96vh] transition-all",
                    view === "choice" ? "max-w-lg" : "max-w-4xl"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                            {view === "choice" ? <Sparkles size={18} /> : <Megaphone size={18} />}
                        </div>
                        <div>
                            <h2 className="text-[14px] font-bold text-slate-800 dark:text-white uppercase tracking-tight">
                                {view === "choice" ? "Post Automation Flow" : "Auto Reply Configuration"}
                            </h2>
                            {existingCampaignId && view !== "choice" && (
                                <p className="text-[10px] font-semibold text-primary uppercase leading-none mt-1">Status: {status}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {existingCampaignId && (
                            <>
                                <button onClick={handleStatusToggle} className={cn("px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all", status === "active" ? "bg-amber-50 text-amber-600 hover:bg-amber-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100")}>
                                    {status === "active" ? "Pause" : "Resume"}
                                </button>
                                <button onClick={handleDelete} disabled={isDeleting} className="px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest text-rose-500 bg-rose-50 hover:bg-rose-100 transition-all flex items-center gap-1">
                                    {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />} Delete
                                </button>
                            </>
                        )}
                        <button onClick={onClose} className="text-slate-400 hover:text-rose-500 transition-colors bg-slate-50 dark:bg-neutral-800 p-2 rounded-lg ml-2">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30 dark:bg-neutral-950/20 custom-scrollbar font-medium">
                    <AnimatePresence mode="wait">
                        {view === "choice" && (
                            <motion.div key="choice" className="space-y-6 text-center py-8">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase">Choose Strategy</h3>
                                    <p className="text-sm text-slate-500">How do you want to respond to the community?</p>
                                </div>
                                <div className="grid grid-cols-1 gap-4 max-w-sm mx-auto pt-4">
                                    <button onClick={() => setView("template")} className="group p-6 rounded-2xl border-2 border-slate-200 dark:border-neutral-800 hover:border-primary hover:bg-primary/5 transition-all text-left">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all"><Layers size={24} /></div>
                                            <div>
                                                <p className="text-[14px] font-bold text-slate-800 dark:text-white uppercase">Template Engine</p>
                                                <p className="text-[11px] text-slate-500">Pick from existing presets</p>
                                            </div>
                                        </div>
                                    </button>
                                    <button onClick={() => setView("custom")} className="group p-6 rounded-2xl border-2 border-slate-200 dark:border-neutral-800 hover:border-primary hover:bg-primary/5 transition-all text-left">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-neutral-800 text-slate-500 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all"><Plus size={24} /></div>
                                            <div>
                                                <p className="text-[14px] font-bold text-slate-800 dark:text-white uppercase">Custom Logic</p>
                                                <p className="text-[11px] text-slate-500">Build specific rules for this post</p>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {view === "template" && (
                            <motion.div key="template" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-lg mx-auto">
                                <button onClick={() => setView("choice")} className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-colors"><ChevronLeft size={14} /> Back</button>
                                <div className="bg-white dark:bg-neutral-900 p-8 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm space-y-6 text-center">
                                    <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto text-primary"><Layers className="w-7 h-7" /></div>
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase">Link Template</h3>
                                        <p className="text-sm text-slate-500 font-medium px-4">Instantly deploy rules from your preset repository.</p>
                                    </div>
                                    <div className="space-y-4 pt-2 text-left">
                                        <Field label="Choose Preset">
                                            <div className="relative">
                                                <select
                                                    value={form.template_id ?? ""}
                                                    onChange={(e) => setForm({ ...form, template_id: e.target.value })}
                                                    className="w-full px-5 py-3.5 rounded-xl bg-slate-50 dark:bg-neutral-800 border-none outline-none focus:ring-2 focus:ring-primary/20 text-[14px] font-semibold appearance-none cursor-pointer pr-12 dark:text-white"
                                                >
                                                    <option value="" disabled>{isLoadingTemplates ? "Connecting..." : "Select from library"}</option>
                                                    {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                </select>
                                                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                            </div>
                                        </Field>
                                        <button onClick={handleSave} disabled={isSaving || !form.template_id} className="w-full py-4 rounded-xl bg-primary text-white font-bold text-[13px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Deploy Campaign"}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {view === "custom" && (
                            <motion.div key="custom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                                <button onClick={() => setView("choice")} className="flex items-center gap-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-primary transition-colors"><ChevronLeft size={14} /> Back</button>

                                <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-slate-200 dark:border-neutral-800 space-y-6">
                                    <Field label="Campaign Tracking Identity" required icon={Megaphone}>
                                        <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-neutral-800 dark:bg-neutral-950 focus:border-primary/50 outline-none transition-all font-semibold text-[14px] dark:text-neutral-200"
                                            placeholder="e.g. Black Friday Post Flow"
                                        />
                                    </Field>
                                </div>

                                <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-slate-200 dark:border-neutral-800 space-y-6">
                                    <div className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-rose-500" /><h3 className="text-[12px] font-bold text-rose-500 uppercase">Protection Hub</h3></div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <Toggle label="Hide Bad Comments" active={form.offensive.hide_comment} onClick={() => setForm({ ...form, offensive: { ...form.offensive, hide_comment: !form.offensive.hide_comment } })} />
                                        <Toggle label="Delete Bad Comments" active={form.offensive.delete_comment} onClick={() => setForm({ ...form, offensive: { ...form.offensive, delete_comment: !form.offensive.delete_comment } })} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase">Blacklisted Keywords (csv)</label>
                                            <textarea rows={2} value={form.offensive.offensive_keywords} onChange={e => setForm({ ...form, offensive: { ...form.offensive, offensive_keywords: e.target.value } })}
                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-neutral-800 dark:bg-neutral-950 focus:border-primary/50 outline-none transition-all font-semibold text-[13px] resize-none dark:text-neutral-200"
                                                placeholder="scam, spam, fake..."
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[11px] font-bold text-slate-500 uppercase">Private Response Follow-up</label>
                                            <div className="relative">
                                                <select value={form.offensive.private_reply_template_id ?? ""} onChange={e => setForm({ ...form, offensive: { ...form.offensive, private_reply_template_id: e.target.value } })}
                                                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-neutral-800 dark:bg-neutral-950 focus:border-primary/50 outline-none transition-all font-semibold text-[13px] appearance-none dark:text-white"
                                                >
                                                    <option value="">None</option>
                                                    {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                </select>
                                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 space-y-4">
                                    <Toggle label="Multiple user replies?" active={form.multiple_reply_enabled} onClick={() => setForm({ ...form, multiple_reply_enabled: !form.multiple_reply_enabled })} />
                                    <Toggle label="Enable inline response?" active={form.comment_reply_enabled} onClick={() => setForm({ ...form, comment_reply_enabled: !form.comment_reply_enabled })} />
                                    <Toggle label="Auto-hide after reply?" active={form.hide_after_reply} onClick={() => setForm({ ...form, hide_after_reply: !form.hide_after_reply })} />
                                </div>

                                <div className="bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-800 rounded-2xl p-6 space-y-6">
                                    <div className="flex gap-6 pb-2 border-b border-slate-50 dark:border-neutral-800/20">
                                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setForm({ ...form, reply_type: "generic" })}>
                                            <CapsuleSwitch active={form.reply_type === "generic"} />
                                            <span className={cn("text-[11px] font-bold uppercase tracking-widest", form.reply_type === "generic" ? "text-primary" : "text-slate-400")}>Universal Strategy</span>
                                        </div>
                                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setForm({ ...form, reply_type: "filter" })}>
                                            <CapsuleSwitch active={form.reply_type === "filter"} />
                                            <span className={cn("text-[11px] font-bold uppercase tracking-widest", form.reply_type === "filter" ? "text-primary" : "text-slate-400")}>Keyword Rules</span>
                                        </div>
                                    </div>

                                    <div className="pt-2">
                                        {form.reply_type === "generic" ? (
                                            <div className="space-y-6">
                                                <Field label="Response Template" required icon={MessageSquare}>
                                                    <div className="relative bg-slate-50 dark:bg-neutral-950 rounded-xl border border-slate-200 dark:border-neutral-800 p-4 focus-within:border-primary/50 transition-all">
                                                        <textarea rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                                                            className="w-full outline-none font-medium text-[14px] dark:text-neutral-200 resize-none bg-transparent" placeholder="Global response message..."
                                                        />
                                                    </div>
                                                </Field>
                                                <div className="space-y-4">
                                                    <Toggle label="Save as new library template?" active={form.save_as_template} onClick={() => setForm({ ...form, save_as_template: !form.save_as_template })} />
                                                    <div className="space-y-2">
                                                        <label className="text-[11px] font-bold text-slate-500 uppercase">Attach Private Messenger DM</label>
                                                        <div className="relative">
                                                            <select value={form.private_template_id ?? ""} onChange={e => setForm({ ...form, private_template_id: e.target.value })}
                                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-neutral-800 dark:bg-neutral-900 focus:border-primary/50 outline-none transition-all font-semibold text-[13px] appearance-none dark:text-white"
                                                            >
                                                                <option value="">None</option>
                                                                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                            </select>
                                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-4">
                                                {filterRules.map((rule, idx) => (
                                                    <div key={rule.id} className="p-6 rounded-2xl bg-slate-50 dark:bg-neutral-950 border border-slate-200 dark:border-neutral-800 space-y-4 relative group">
                                                        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-neutral-800/10">
                                                            <div className="flex items-center gap-4">
                                                                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, match_type: "contains" } : r))}>
                                                                    <div className={cn("w-3 h-3 rounded-full border flex items-center justify-center", rule.match_type === "contains" ? "border-primary bg-primary text-white" : "border-slate-300")} />
                                                                    <span className="text-[10px] font-bold uppercase text-slate-500">Partial Match</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, match_type: "exact" } : r))}>
                                                                    <div className={cn("w-3 h-3 rounded-full border flex items-center justify-center", rule.match_type === "exact" ? "border-primary bg-primary text-white" : "border-slate-300")} />
                                                                    <span className="text-[10px] font-bold uppercase text-slate-500">Exact Match</span>
                                                                </div>
                                                            </div>
                                                            {filterRules.length > 1 && (
                                                                <button onClick={() => setFilterRules(filterRules.filter(r => r.id !== rule.id))} className="text-rose-400 hover:text-rose-600 transition-colors"><Trash2 size={16} /></button>
                                                            )}
                                                        </div>
                                                        <Field label="Trigger Keyword">
                                                            <input type="text" value={rule.keyword} onChange={e => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, keyword: e.target.value } : r))}
                                                                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-neutral-800 dark:bg-neutral-900 outline-none focus:border-primary/50 transition-all font-semibold text-[13px] dark:text-neutral-200"
                                                                placeholder="price, info, help..."
                                                            />
                                                        </Field>
                                                        <div className="space-y-4">
                                                            <textarea rows={2} value={rule.message} onChange={e => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, message: e.target.value } : r))}
                                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-neutral-800 bg-white dark:bg-white/5 outline-none font-medium text-[13px] dark:text-neutral-200 resize-none shadow-sm" placeholder="Define response payload..."
                                                            />
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <UploadBox label="Add Image" value={rule.image} onChange={v => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, image: v } : r))} icon={ImageIcon} />
                                                                <UploadBox label="Add Video" value={rule.video} onChange={v => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, video: v } : r))} icon={Video} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-[11px] font-bold text-slate-500 uppercase">Rule messenger DM</label>
                                                                <div className="relative">
                                                                    <select value={rule.private_template_id ?? ""} onChange={e => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, private_template_id: e.target.value } : r))}
                                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-neutral-800 dark:bg-neutral-900 focus:border-primary/50 outline-none transition-all font-semibold text-[13px] appearance-none dark:text-white"
                                                                    >
                                                                        <option value="">None</option>
                                                                        {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                                    </select>
                                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 pointer-events-none" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button onClick={() => setFilterRules([...filterRules, { id: Math.random().toString(), keyword: "", match_type: "contains", message: "", image: null, video: null, private_template_id: null }])} className="w-full py-4 rounded-xl border-2 border-dashed border-slate-200 dark:border-neutral-800 text-slate-400 font-bold text-[11px] uppercase tracking-widest hover:border-primary/50 hover:text-primary transition-all flex items-center justify-center gap-2 active:scale-95">
                                                    <Plus size={16} /> Build Logic Node
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                {view !== "choice" && (
                    <div className="p-6 border-t border-slate-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 flex gap-4 sticky bottom-0 z-30">
                        <button onClick={onClose} className="flex-1 py-3.5 rounded-xl bg-slate-50 dark:bg-neutral-800 text-[11px] font-bold uppercase tracking-widest text-slate-500 hover:text-rose-500 transition-all">Cancel</button>
                        <button onClick={handleSave} disabled={isSaving} className="flex-[2] py-3.5 rounded-xl bg-primary text-white font-bold text-[12px] uppercase tracking-widest shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-95 transition-all flex items-center justify-center gap-2">
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save size={16} />}
                            Save Hub Logic
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
