"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    X, Save, Zap, MessageSquare,
    ChevronDown, Info, AlertCircle,
    Pause, Play, ShieldAlert, Filter,
    Plus, Trash2, Layers, Megaphone,
    Search, Check, Sparkles, Smile, Settings, Clock, Globe, Loader2,
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
        <div className="space-y-1.5 flex-1 min-w-0">
            <label className="text-sm font-medium text-slate-600 flex items-center gap-1.5">
                {Icon && <Icon className="w-3.5 h-3.5 text-slate-400" />}
                {label} {required && <span className="text-rose-400">*</span>}
            </label>
            {children}
        </div>
    );
}

function Toggle({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
    return (
        <div className="flex items-center gap-3 group">
            {label && <span className="text-sm font-medium text-slate-600 group-hover:text-slate-800 transition-colors">{label}</span>}
            <div className="flex items-center gap-2">
                <button onClick={onClick} className={cn(
                    "w-10 h-5 rounded-full relative transition-all duration-200",
                    active ? "bg-pink-500" : "bg-slate-200"
                )}>
                    <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all", active ? "left-5.5" : "left-0.5")} />
                </button>
                <span className="text-xs font-medium text-slate-400 w-6">{active ? "On" : "Off"}</span>
            </div>
        </div>
    );
}

function UploadBox({ label, value, onChange, icon: Icon }: { label: string; value: string | null; onChange: (v: string | null) => void; icon: any }) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onChange(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const isVideo = label.toLowerCase().includes("video");

    return (
        <div className="space-y-2 flex-1">
            <label className="text-[11px] font-bold text-slate-500 px-1 flex items-center gap-2">
                <Icon className="w-3.5 h-3.5" /> {label}
            </label>
            <div className="flex items-center gap-0 rounded-xl border border-slate-200 bg-white group focus-within:border-pink-400 overflow-hidden transition-all shadow-xs h-[44px]">
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept={isVideo ? "video/*" : "image/*"}
                    onChange={handleFileChange}
                />
                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-pink-600 text-white px-5 h-full text-[12px] font-semibold flex items-center justify-center gap-2 transition-colors flex-shrink-0 cursor-pointer hover:bg-pink-700"
                >
                    <Plus className="w-4 h-4" /> Upload
                </div>
                <input type="text" placeholder={`Put your ${isVideo ? 'video' : 'image'} URL here or click upload`} value={value || ""} onChange={e => onChange(e.target.value || null)}
                    className="flex-1 bg-transparent border-none outline-none text-[13px] font-medium text-slate-700 px-4 placeholder:text-slate-300"
                />
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
        }
    }, [isOpen, postId]);

    const fetchCampaignConfig = async () => {
        setIsFetchingConfig(true);
        try {
            const base = platform === "facebook" ? `/facebook/post-auto-reply` : `/instagram/post-auto-reply`;
            const res = await api.get(`${base}/${postId}?page_id=${pageId}${platform === 'instagram' ? '&platform=instagram' : ''}`);
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
                    image: data.image || "",
                    video: data.video || "",
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
                        ...r, 
                        // In API keyword may be 'keyword' or 'keywords'
                        keyword: r.keyword || r.keywords || "",
                        id: Math.random().toString()
                    })));
                } else {
                    setFilterRules([{
                        id: Math.random().toString(),
                        keyword: "",
                        match_type: "contains",
                        message: "",
                        image: "",
                        video: "",
                        private_template_id: ""
                    }]);
                }
            } else {
                setView("choice");
                setFilterRules([{
                    id: Math.random().toString(),
                    keyword: "",
                    match_type: "contains",
                    message: "",
                    image: "",
                    video: "",
                    private_template_id: ""
                }]);
            }
        } catch (error: any) {
            const status = error?.response?.status;
            if (status === 400 || status === 404) {
                setView("choice");
                setFilterRules([{
                    id: Math.random().toString(),
                    keyword: "",
                    match_type: "contains",
                    message: "",
                    image: "",
                    video: "",
                    private_template_id: ""
                }]);
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
            const res = await api.get(`${endpoint}?page_id=${pageId}${platform === 'instagram' ? '&platform=instagram' : ''}`);
            if (res.data.success || res.data.is_success) {
                setTemplates(res.data.data || []);
            } else if (Array.isArray(res.data)) {
                setTemplates(res.data);
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
                // Template mode
                payload.template_id = String(form.template_id);
            } else {
                // Custom mode: message is used for global OR as fallback for filter
                payload.message = form.message || "";
                payload.image = form.image || "";
                payload.video = form.video || "";
                payload.private_template_id = form.private_template_id ?? "";
                payload.rules = filterRules.map(({ keyword, match_type, message, image, video, private_template_id }) => ({
                    keyword: keyword || "",
                    match_type: match_type || "contains",
                    message: message || "",
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

    const handleAddRule = () => {
        setFilterRules([
            ...filterRules,
            { id: Math.random().toString(), keyword: "", match_type: "contains", message: "", image: "", video: "", private_template_id: "" }
        ]);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96, y: 24 }}
                className={cn(
                    "relative z-10 w-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[96vh] transition-all",
                    view === "choice" ? "max-w-lg" : "max-w-[980px]"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-white sticky top-0 z-20">
                    <div className="flex items-center gap-3">
                        <div>
                            <h2 className="text-[13px] font-semibold text-slate-800">
                                {view === "choice" ? "Post Automation Flow" : "Create / Edit Post Auto Reply"}
                            </h2>
                            {existingCampaignId && view !== "choice" && (
                                <p className="text-[10px] font-bold text-pink-500 uppercase leading-none mt-1">Status: {status}</p>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {existingCampaignId && (
                            <>
                                <button onClick={handleStatusToggle} className={cn("px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all", status === "active" ? "bg-amber-50 text-amber-600 hover:bg-amber-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100")}>
                                    {status === "active" ? "Pause" : "Resume"}
                                </button>
                                <button onClick={handleDelete} disabled={isDeleting} className="px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest text-white bg-rose-500 hover:bg-rose-600 transition-all flex items-center gap-2">
                                    {isDeleting ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />} Delete
                                </button>
                            </>
                        )}
                        <button onClick={onClose} className="text-slate-300 hover:text-rose-500 transition-colors ml-4">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#FDFDFF]">
                    <AnimatePresence mode="wait">
                        {view === "choice" && (
                            <motion.div key="choice" className="space-y-6 text-center py-8">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-bold text-slate-900 uppercase">Choose Strategy</h3>
                                    <p className="text-sm text-slate-500">How do you want to respond to the community?</p>
                                </div>
                                <div className="grid grid-cols-1 gap-4 max-w-sm mx-auto pt-4">
                                    <button onClick={() => setView("template")} className="group p-6 rounded-2xl border-2 border-slate-200 hover:border-pink-600 hover:bg-pink-50 transition-all text-left">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-pink-100 text-pink-600 flex items-center justify-center group-hover:bg-pink-600 group-hover:text-white transition-all"><Layers size={24} /></div>
                                            <div>
                                                <p className="text-[14px] font-bold text-slate-800 uppercase">Template Engine</p>
                                                <p className="text-[11px] text-slate-500">Pick from existing presets</p>
                                            </div>
                                        </div>
                                    </button>
                                    <button onClick={() => setView("custom")} className="group p-6 rounded-2xl border-2 border-slate-200 hover:border-pink-600 hover:bg-pink-50 transition-all text-left">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center group-hover:bg-pink-600 group-hover:text-white transition-all"><Plus size={24} /></div>
                                            <div>
                                                <p className="text-[14px] font-bold text-slate-800 uppercase">Custom Logic</p>
                                                <p className="text-[11px] text-slate-500">Build specific rules for this post</p>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {view === "template" && (
                            <motion.div key="template" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-lg mx-auto py-8">
                                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-center">
                                    <div className="w-14 h-14 rounded-2xl bg-pink-50 flex items-center justify-center mx-auto text-pink-600"><Layers className="w-7 h-7" /></div>
                                    <div className="space-y-1">
                                        <h3 className="text-lg font-bold text-slate-900 uppercase">Link Template</h3>
                                        <p className="text-sm text-slate-500 font-medium px-4">Instantly deploy rules from your preset repository.</p>
                                    </div>
                                    <div className="space-y-4 pt-4 text-left">
                                        <Field label="Choose Preset">
                                            <div className="relative">
                                                <select
                                                    value={form.template_id ?? ""}
                                                    onChange={(e) => setForm({ ...form, template_id: e.target.value })}
                                                    className="w-full px-5 py-4 rounded-xl border border-slate-200 focus:border-pink-400 focus:ring-4 focus:ring-pink-50 outline-none transition-all text-[14px] font-medium appearance-none cursor-pointer bg-white"
                                                >
                                                    <option value="" disabled>{isLoadingTemplates ? "Connecting..." : "Select from library"}</option>
                                                    {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                </select>
                                                <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                            </div>
                                        </Field>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {view === "custom" && (
                            <motion.div key="custom" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">

                                {/* SECTION 1: BASICS */}
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs">
                                    <Field label="Auto Reply Campaign Name" required>
                                        <input type="text" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px]"
                                            placeholder="Write your auto reply campaign name here"
                                        />
                                    </Field>
                                </div>

                                {/* SECTION 2: OFFENSIVE */}
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs space-y-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <ShieldAlert className="w-4 h-4 text-rose-400" />
                                        <h3 className="text-sm font-semibold text-slate-700">Offensive Comments Settings</h3>
                                    </div>
                                    <div className="flex gap-8">
                                        <Toggle label="Hide Comment" active={form.offensive.hide_comment} onClick={() => setForm({ ...form, offensive: { ...form.offensive, hide_comment: !form.offensive.hide_comment } })} />
                                        <Toggle label="Delete Comment" active={form.offensive.delete_comment} onClick={() => setForm({ ...form, offensive: { ...form.offensive, delete_comment: !form.offensive.delete_comment } })} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-600">Offensive keywords <span className="text-slate-400 font-normal">(comma separated)</span></label>
                                            <div className="relative">
                                                <textarea rows={4} value={form.offensive.offensive_keywords} onChange={e => setForm({ ...form, offensive: { ...form.offensive, offensive_keywords: e.target.value } })}
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
                                                    value={form.offensive.private_reply_template_id ?? ""}
                                                    onChange={e => setForm({ ...form, offensive: { ...form.offensive, private_reply_template_id: e.target.value } })}
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

                                {/* SECTION 3: REPLAY TOGGLES */}
                                <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs grid grid-cols-1 gap-4">
                                    <div className="flex items-center justify-between py-1 px-1">
                                        <div className="flex items-center gap-3">
                                            <RefreshCw className="w-4 h-4 text-slate-400" />
                                            <span className="text-[13px] font-medium text-slate-600">Do you want to send reply message to a user multiple times?</span>
                                        </div>
                                        <Toggle label="" active={form.multiple_reply_enabled} onClick={() => setForm({ ...form, multiple_reply_enabled: !form.multiple_reply_enabled })} />
                                    </div>
                                    <div className="flex items-center justify-between py-1 px-1 border-t border-slate-50">
                                        <div className="flex items-center gap-3">
                                            <MessageCircle className="w-4 h-4 text-slate-400" />
                                            <span className="text-[13px] font-medium text-slate-600">Do you want to enable comment reply?</span>
                                        </div>
                                        <Toggle label="" active={form.comment_reply_enabled} onClick={() => setForm({ ...form, comment_reply_enabled: !form.comment_reply_enabled })} />
                                    </div>
                                    <div className="flex items-center justify-between py-1 px-1 border-t border-slate-50">
                                        <div className="flex items-center gap-3">
                                            <EyeOff className="w-4 h-4 text-slate-400" />
                                            <span className="text-[13px] font-medium text-slate-600">Do you want to hide comments after comment reply?</span>
                                        </div>
                                        <Toggle label="" active={form.hide_after_reply} onClick={() => setForm({ ...form, hide_after_reply: !form.hide_after_reply })} />
                                    </div>
                                </div>

                                {/* SECTION 4: LOGIC SELECTION */}
                                <div className="bg-white border border-slate-100 rounded-[22px] p-6 shadow-xs space-y-5">
                                    <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setForm({ ...form, reply_type: "generic" })}>
                                        <CapsuleSwitch active={form.reply_type === "generic"} />
                                        <span className={cn("text-sm font-medium", form.reply_type === "generic" ? "text-pink-600" : "text-slate-400")}>Generic message for all comments</span>
                                    </div>
                                    <div className="flex items-center gap-4 cursor-pointer group" onClick={() => setForm({ ...form, reply_type: "filter" })}>
                                        <CapsuleSwitch active={form.reply_type === "filter"} />
                                        <span className={cn("text-sm font-medium", form.reply_type === "filter" ? "text-pink-600" : "text-slate-400")}>Send different messages by keyword filter</span>
                                    </div>
                                </div>

                                {/* SECTION 5: EDITOR */}
                                <div className="space-y-8">
                                    {form.reply_type === "generic" ? (
                                        <div className="bg-white p-7 rounded-2xl border border-slate-100 shadow-sm space-y-8 animate-in fade-in duration-300">
                                            <Field label="Message for Comment Reply" required icon={MessageCircle}>
                                                <div className="relative border border-slate-200 rounded-2xl p-4 focus-within:border-pink-400 transition-all bg-white">
                                                    <textarea rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                                                        className="w-full outline-none font-medium text-[14px] text-slate-700 resize-none h-[120px]" placeholder="Type your message here..."
                                                    />
                                                    <Edit3 className="absolute bottom-4 right-4 w-4 h-4 text-slate-300" />
                                                </div>
                                            </Field>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                <UploadBox label="Image for Comment Reply" value={form.image} onChange={v => setForm({ ...form, image: v || "" })} icon={ImageIcon} />
                                                <UploadBox label="Video for Comment Reply" value={form.video} onChange={v => setForm({ ...form, video: v || "" })} icon={Video} />
                                            </div>
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
                                                    <select value={form.private_template_id ?? ""} onChange={e => setForm({ ...form, private_template_id: e.target.value })}
                                                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px] appearance-none cursor-pointer bg-white"
                                                    >
                                                        <option value="">Please select a message template</option>
                                                        {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                    </select>
                                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-8 animate-in fade-in duration-300">
                                            {filterRules.map((rule, idx) => (
                                                <div key={rule.id} className="bg-white p-7 rounded-2xl border border-slate-200 shadow-sm space-y-8 relative group">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-6">
                                                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, match_type: "exact" } : r))}>
                                                                <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all", rule.match_type === "exact" ? "border-pink-600 bg-pink-600" : "border-slate-300")}>
                                                                    {rule.match_type === "exact" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                                </div>
                                                                <span className={cn("text-xs font-medium", rule.match_type === "exact" ? "text-slate-700" : "text-slate-400")}>Exact match</span>
                                                            </div>
                                                            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, match_type: "contains" } : r))}>
                                                                <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all", rule.match_type === "contains" ? "border-pink-600 bg-pink-600" : "border-slate-300")}>
                                                                    {rule.match_type === "contains" && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                                                </div>
                                                                <span className={cn("text-xs font-medium", rule.match_type === "contains" ? "text-slate-700" : "text-slate-400")}>Contains word</span>
                                                            </div>
                                                        </div>
                                                        {filterRules.length > 1 && (
                                                            <button onClick={() => setFilterRules(filterRules.filter(r => r.id !== rule.id))} className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 transition-colors">
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>

                                                    <Field label="Filter Word/Sentence" required>
                                                        <input type="text" value={rule.keyword} onChange={e => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, keyword: e.target.value } : r))}
                                                            className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px]"
                                                            placeholder="Write your filter word here"
                                                        />
                                                    </Field>

                                                    <Field label="Message for Comment Reply" required icon={MessageCircle}>
                                                        <div className="relative border border-slate-200 rounded-2xl p-4 focus-within:border-pink-400 transition-all bg-white">
                                                            <textarea rows={4} value={rule.message} onChange={e => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, message: e.target.value } : r))}
                                                                className="w-full outline-none font-medium text-[14px] text-slate-700 resize-none h-[100px]" placeholder="Type your message here..."
                                                            />
                                                            <Edit3 className="absolute bottom-4 right-4 w-4 h-4 text-slate-300" />
                                                        </div>
                                                    </Field>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <UploadBox label="Image for Comment Reply" value={rule.image} onChange={v => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, image: v } : r))} icon={ImageIcon} />
                                                        <UploadBox label="Video for Comment Reply" value={rule.video} onChange={v => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, video: v } : r))} icon={Video} />
                                                    </div>

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
                                                            <select value={rule.private_template_id ?? ""} onChange={e => setFilterRules(filterRules.map(r => r.id === rule.id ? { ...r, private_template_id: e.target.value } : r))}
                                                                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-pink-400 outline-none transition-all font-medium text-[14px] appearance-none cursor-pointer bg-white"
                                                            >
                                                                <option value="">Please select a message template</option>
                                                                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                                            </select>
                                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            <div className="flex justify-end">
                                                <button onClick={handleAddRule} className="px-6 py-2.5 rounded-xl border-2 border-pink-600 text-pink-600 font-semibold text-[11px]  hover:bg-pink-50 transition-all flex items-center gap-2 active:scale-95 shadow-lg shadow-pink-100/20">
                                                    <Plus className="w-4 h-4" /> Add another filter rule
                                                </button>
                                            </div>

                                            {/* Fallback */}
                                            <div className="bg-slate-50/50 p-8 rounded-2xl border border-slate-200 border-dashed space-y-8">
                                                <div className="flex items-center gap-3">
                                                    <Info className="w-4 h-4 text-slate-400" />
                                                    <span className="text-sm font-medium text-slate-500">Fallback reply (when no filter matches)</span>
                                                </div>
                                                <Field label="Message for Comment Reply" icon={MessageCircle}>
                                                    <div className="relative border border-slate-200 rounded-2xl p-4 focus-within:border-pink-400 transition-all bg-white">
                                                        <textarea rows={4} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                                                            className="w-full outline-none font-medium text-[14px] text-slate-700 resize-none h-[100px]" placeholder="Type your message here..."
                                                        />
                                                        <Edit3 className="absolute bottom-4 right-4 w-4 h-4 text-slate-300" />
                                                    </div>
                                                </Field>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                    <UploadBox label="Image for Comment Reply" value={form.image} onChange={v => setForm({ ...form, image: v || "" })} icon={ImageIcon} />
                                                    <UploadBox label="Video for Comment Reply" value={form.video} onChange={v => setForm({ ...form, video: v || "" })} icon={Video} />
                                                </div>
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
                                                        <select value={form.private_template_id ?? ""} onChange={e => setForm({ ...form, private_template_id: e.target.value })}
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
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Footer */}
                {view !== "choice" && (
                    <div className="flex gap-4 p-8 bg-white border-t border-slate-100 flex-shrink-0">
                        <button onClick={view === "template" ? () => setView("choice") : onClose} className="flex-1 py-3.5 rounded-xl border border-slate-200 text-slate-500 font-bold text-[13px] hover:bg-slate-50 transition-all">
                            {view === "template" ? "Back to Choice" : "Cancel"}
                        </button>
                        <button onClick={handleSave} disabled={isSaving} className="flex-[2] py-3.5 rounded-xl bg-pink-600 text-white font-semibold text-[14px] shadow-xl shadow-pink-100 flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50">
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-5 h-5" />}
                            <span>{existingCampaignId ? "UPDATE CAMPAIGN" : "SAVE CHANGES"}</span>
                        </button>
                    </div>
                )}
            </motion.div>
        </div>
    );
}
