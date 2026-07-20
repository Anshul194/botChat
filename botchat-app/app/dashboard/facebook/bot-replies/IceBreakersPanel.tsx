"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
    Plus, Sparkles, Trash2, RefreshCw, Globe, Bot,
    MessageSquare, UserCircle, GripVertical, Smile
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useModal } from "@/components/providers/ModalProvider";
import { cn } from "@/lib/utils";
import { EmojiPicker } from "@/components/ui/EmojiPicker";

interface IceBreaker {
    id: number;
    title: string;
    payload: string | null;
    target_type: string;
    target_id: number | null;
    sort_order: number;
    enabled: boolean;
    meta_synced: boolean;
    meta_platform: string;
    social_account_type: string;
    social_account_id: number;
}

interface SocialAccountData {
    id: number;
    page_id?: string;
    page_name?: string;
    instagram_id?: string;
    username?: string;
    is_enabled?: boolean;
}

interface TargetOption {
    id: number;
    name: string;
    trigger_type?: string;
    trigger_value?: string;
}

const TARGET_TYPES = [
    { value: 'bot_flow', label: 'Bot Flow', icon: MessageSquare, desc: 'Execute an existing bot flow' },
    { value: 'keyword', label: 'Keyword', icon: Bot, desc: 'Trigger an existing keyword automation' },
    { value: 'ai_agent', label: 'AI Agent', icon: Sparkles, desc: 'Let AI handle the response' },
    { value: 'human', label: 'Assign Human', icon: UserCircle, desc: 'Assign conversation to a human agent' },
];

interface Props {
    pages: SocialAccountData[];
    selectedPageId: string | "all";
    channelType: string;
}

export default function IceBreakersPanel({ pages, selectedPageId, channelType }: Props) {
    const { showModal, showConfirm } = useModal();
    const [icebreakers, setIcebreakers] = useState<IceBreaker[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [editIcebreaker, setEditIcebreaker] = useState<IceBreaker | null>(null);
    const [targetOptions, setTargetOptions] = useState<TargetOption[]>([]);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    const [form, setForm] = useState({
        title: "",
        payload: "",
        target_type: "bot_flow",
        target_id: null as number | null,
        sort_order: 0,
        enabled: true,
    });

    const accountType = channelType === 'facebook'
        ? 'App\\Models\\FacebookPage'
        : 'App\\Models\\InstagramAccount';

    const selectedPageIdScalar = useMemo(() => {
        if (selectedPageId === "all" && pages.length > 0) return pages[0].id;
        const page = pages.find(p => p.page_id === selectedPageId || p.instagram_id === selectedPageId);
        return page?.id ?? null;
    }, [pages, selectedPageId]);

    const fetchIcebreakers = useCallback(async () => {
        if (!selectedPageIdScalar) return;
        setIsLoading(true);
        try {
            const response = await api.get("/ice-breakers", {
                params: {
                    social_account_type: accountType,
                    social_account_id: selectedPageIdScalar,
                    meta_platform: channelType,
                },
            });
            if (response.data.is_success) {
                setIcebreakers(response.data.data || []);
            }
        } catch (error) {
            console.error("Fetch Ice Breakers Error:", error);
        } finally {
            setIsLoading(false);
        }
    }, [selectedPageIdScalar, accountType, channelType]);

    const fetchTargetOptions = useCallback(async (targetType: string) => {
        try {
            const params: Record<string, string> = { target_type: targetType, channel_type: channelType };
            if (selectedPageId !== "all") {
                if (channelType === 'instagram') {
                    params.instagram_id = selectedPageId;
                } else {
                    params.facebook_page_id = selectedPageId;
                }
            }
            const response = await api.get("/ice-breakers/target-options", { params });
            if (response.data.is_success) {
                setTargetOptions(response.data.data || []);
            }
        } catch (error) {
            console.error("Fetch Target Options Error:", error);
            setTargetOptions([]);
        }
    }, [selectedPageId, channelType]);

    useEffect(() => {
        fetchIcebreakers();
    }, [fetchIcebreakers]);

    useEffect(() => {
        if (showCreateModal || editIcebreaker) {
            fetchTargetOptions(form.target_type);
        }
    }, [showCreateModal, editIcebreaker, form.target_type, fetchTargetOptions]);

    const handleSave = async () => {
        if (!form.title.trim()) return;
        if (!selectedPageIdScalar) return;
        setIsSaving(true);
        try {
            const payload = {
                ...form,
                social_account_type: accountType,
                social_account_id: selectedPageIdScalar,
                meta_platform: channelType,
            };

            if (editIcebreaker) {
                await api.patch(`/ice-breakers/${editIcebreaker.id}`, form);
            } else {
                await api.post("/ice-breakers", payload);
            }

            setShowCreateModal(false);
            setEditIcebreaker(null);
            resetForm();
            fetchIcebreakers();
        } catch (error) {
            console.error("Save Ice Breaker Error:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (icebreaker: IceBreaker) => {
        const confirmed = await showConfirm({
            title: "Delete Ice Breaker",
            message: `Are you sure you want to delete "${icebreaker.title}"?`,
            confirmLabel: "Delete",
            variant: "danger",
        });
        if (!confirmed) return;

        try {
            await api.delete(`/ice-breakers/${icebreaker.id}`);
            fetchIcebreakers();
        } catch (error) {
            console.error("Delete Ice Breaker Error:", error);
        }
    };

    const handleToggle = async (icebreaker: IceBreaker) => {
        try {
            await api.patch(`/ice-breakers/${icebreaker.id}`, { enabled: !icebreaker.enabled });
            fetchIcebreakers();
        } catch (error) {
            console.error("Toggle Ice Breaker Error:", error);
        }
    };

    const handleSyncToMeta = async () => {
        if (!selectedPageIdScalar) return;
        try {
            await api.post("/ice-breakers/sync-to-meta", {
                social_account_type: accountType,
                social_account_id: selectedPageIdScalar,
                meta_platform: channelType,
            });
        } catch (error) {
            console.error("Sync Error:", error);
        }
    };

    const openEdit = (icebreaker: IceBreaker) => {
        setEditIcebreaker(icebreaker);
        setForm({
            title: icebreaker.title,
            payload: icebreaker.payload || "",
            target_type: icebreaker.target_type,
            target_id: icebreaker.target_id,
            sort_order: icebreaker.sort_order,
            enabled: icebreaker.enabled,
        });
        setShowCreateModal(true);
    };

    const resetForm = () => {
        setForm({ title: "", payload: "", target_type: "bot_flow", target_id: null, sort_order: 0, enabled: true });
    };

    const targetTypeLabel = (type: string) => TARGET_TYPES.find(t => t.value === type)?.label || type;

    const filteredIcebreakers = useMemo(() => {
        if (selectedPageId === "all") return icebreakers;
        return icebreakers;
    }, [icebreakers, selectedPageId]);

    if (!selectedPageIdScalar) {
        return (
            <motion.div key="ice-breakers-empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-neutral-400">
                <Sparkles className="w-12 h-12 mb-4 opacity-30" />
                <p className="text-sm font-semibold uppercase tracking-widest">Select a page to manage Ice Breakers</p>
            </motion.div>
        );
    }

    return (
        <motion.div key="ice-breakers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 pb-12">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-100 dark:border-neutral-800 pb-6">
                <div>
                    <h2 className="text-2xl font-black text-neutral-900 dark:text-white tracking-tight uppercase">Ice Breakers</h2>
                    <p className="text-[11px] text-neutral-400 font-bold uppercase tracking-[0.15em] mt-1">
                        Predefined conversation starters shown to customers
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={handleSyncToMeta}
                        className="p-3 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:bg-neutral-50 transition-all shadow-sm active:scale-95"
                        title="Sync to Meta"
                    >
                        <Globe className="w-4 h-4" />
                    </button>
                    <button
                        onClick={() => { setEditIcebreaker(null); resetForm(); setShowCreateModal(true); }}
                        className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all shadow-sm active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Add Ice Breaker
                    </button>
                </div>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-44 rounded-3xl bg-neutral-100 dark:bg-neutral-800 animate-pulse" />
                    ))}
                </div>
            ) : filteredIcebreakers.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
                    <Sparkles className="w-16 h-16 mb-4 opacity-20" />
                    <p className="text-sm font-semibold uppercase tracking-widest mb-2">No ice breakers yet</p>
                    <p className="text-xs text-neutral-300">Create your first ice breaker to get started</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredIcebreakers.sort((a, b) => a.sort_order - b.sort_order).map((ib) => (
                        <div
                            key={ib.id}
                            className="group flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 hover:border-blue-200 dark:hover:border-blue-800 transition-all shadow-sm"
                        >
                            <GripVertical className="w-4 h-4 text-neutral-300 cursor-grab shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className={cn(
                                        "text-sm font-semibold text-neutral-900 dark:text-white",
                                        !ib.enabled && "line-through opacity-50"
                                    )}>
                                        {ib.title}
                                    </span>
                                    <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                                        {targetTypeLabel(ib.target_type)}
                                    </span>
                                    {ib.meta_synced && (
                                        <Globe className="w-3 h-3 text-emerald-500" />
                                    )}
                                </div>
                                <p className="text-[11px] text-neutral-400 font-medium mt-0.5">
                                    Sort: {ib.sort_order} | Payload: {ib.payload || 'auto'}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => handleToggle(ib)}
                                    className={cn(
                                        "p-2 rounded-xl border transition-all active:scale-90 text-[10px] font-bold uppercase tracking-wider",
                                        ib.enabled
                                            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                            : "bg-neutral-50 text-neutral-400 border-neutral-200"
                                    )}
                                >
                                    {ib.enabled ? 'ON' : 'OFF'}
                                </button>
                                <button
                                    onClick={() => openEdit(ib)}
                                    className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-neutral-400 hover:text-neutral-600 transition-all active:scale-90"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 3a2.83 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                                </button>
                                <button
                                    onClick={() => handleDelete(ib)}
                                    className="p-2 rounded-xl border border-neutral-200 dark:border-neutral-700 text-red-400 hover:text-red-600 hover:border-red-200 transition-all active:scale-90"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {showCreateModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
                        onClick={() => { setShowCreateModal(false); setEditIcebreaker(null); }}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            onClick={e => e.stopPropagation()}
                            className="bg-white dark:bg-neutral-900 rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden border border-neutral-200 dark:border-neutral-800"
                        >
                            <div className="p-6 border-b border-neutral-100 dark:border-neutral-800">
                                <h3 className="text-lg font-black text-neutral-900 dark:text-white uppercase tracking-tight">
                                    {editIcebreaker ? 'Edit Ice Breaker' : 'New Ice Breaker'}
                                </h3>
                            </div>
                            <div className="p-6 space-y-5">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">Title *</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={form.title}
                                            onChange={e => setForm({ ...form, title: e.target.value })}
                                            placeholder="e.g. Track Order"
                                            className="w-full pl-4 pr-12 py-3 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm font-medium outline-none focus:border-blue-400 transition-all"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                                        >
                                            <Smile className="w-5 h-5" />
                                        </button>
                                        
                                        {showEmojiPicker && (
                                            <div className="absolute top-full mt-2 left-0 z-[100]">
                                                <EmojiPicker 
                                                    onSelect={(emoji) => {
                                                        setForm({ ...form, title: form.title + emoji });
                                                        setShowEmojiPicker(false);
                                                    }}
                                                    onClose={() => setShowEmojiPicker(false)}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">Payload (optional)</label>
                                    <input
                                        type="text"
                                        value={form.payload}
                                        onChange={e => setForm({ ...form, payload: e.target.value })}
                                        placeholder="TRACK_ORDER_PAYLOAD — auto-generated if empty"
                                        className="w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm font-medium outline-none focus:border-blue-400 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-3">Target Type</label>
                                    <div className="grid grid-cols-2 gap-3">
                                        {TARGET_TYPES.map(tt => (
                                            <button
                                                key={tt.value}
                                                onClick={() => setForm({ ...form, target_type: tt.value, target_id: null })}
                                                className={cn(
                                                    "p-4 rounded-2xl border-2 text-left transition-all",
                                                    form.target_type === tt.value
                                                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                                                        : "border-neutral-100 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-950/50 hover:border-neutral-200"
                                                )}
                                            >
                                                <div className="flex items-center gap-2 mb-1">
                                                    <tt.icon className="w-4 h-4 text-neutral-500" />
                                                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-700 dark:text-neutral-300">
                                                        {tt.label}
                                                    </span>
                                                </div>
                                                <p className="text-[10px] text-neutral-400 leading-tight">{tt.desc}</p>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {(form.target_type === 'bot_flow' || form.target_type === 'keyword') && (
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">
                                            {form.target_type === 'bot_flow' ? 'Select Bot Flow' : 'Select Keyword Automation'}
                                        </label>
                                        <select
                                            value={form.target_id ?? ''}
                                            onChange={e => setForm({ ...form, target_id: e.target.value ? Number(e.target.value) : null })}
                                            className="w-full px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm font-medium outline-none focus:border-blue-400 transition-all"
                                        >
                                            <option value="">-- Select --</option>
                                            {targetOptions.map(opt => (
                                                <option key={opt.id} value={opt.id}>
                                                    {opt.name} {opt.trigger_value ? `(${opt.trigger_value})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-neutral-500 mb-2">Sort Order</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.sort_order}
                                        onChange={e => setForm({ ...form, sort_order: parseInt(e.target.value) || 0 })}
                                        className="w-24 px-4 py-3 rounded-2xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 text-sm font-medium outline-none focus:border-blue-400 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="p-6 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-3">
                                <button
                                    onClick={() => { setShowCreateModal(false); setEditIcebreaker(null); }}
                                    className="px-6 py-3 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-[10px] font-bold uppercase tracking-widest hover:bg-neutral-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={isSaving || !form.title.trim()}
                                    className="px-6 py-3 rounded-2xl bg-blue-600 text-white text-[10px] font-bold uppercase tracking-widest hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSaving ? 'Saving...' : editIcebreaker ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
