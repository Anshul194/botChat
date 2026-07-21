"use client";

import { useEffect, useState, useMemo } from "react";
import {
    Plus, Trash2, Save, RefreshCw, ChevronDown, ChevronRight,
    Link2, MousePointerClick, Layers, Info, Trash, Check, X, Instagram
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useModal } from "@/components/providers/ModalProvider";
import { cn } from "@/lib/utils";

interface PersistentMenuItem {
    id?: string;
    title: string;
    type: "url" | "postback" | "nested";
    url?: string;
    payload?: string;
    children?: PersistentMenuItem[];
}

interface PersistentMenuProps {
    instagramId: string;
    pageId: string;
    actions: any[];
}

interface MenuItemFormProps {
    item: PersistentMenuItem;
    index: number;
    subIndex?: number;
    onUpdate: (index: number, subIndex: number | undefined, data: Partial<PersistentMenuItem>) => void;
    onRemove: (index: number, subIndex?: number) => void;
    onAddSub: (index: number) => void;
    actions: any[];
}

const MenuItemForm = ({ item, index, subIndex, onUpdate, onRemove, onAddSub, actions }: MenuItemFormProps) => {
    // Local state for Title to prevent focus loss during heavy re-renders
    const [title, setTitle] = useState(item.title);

    useEffect(() => {
        setTitle(item.title);
    }, [item.title]);

    const handleTitleChange = (val: string) => {
        setTitle(val);
        onUpdate(index, subIndex, { title: val });
    };

    return (
        <div className={cn(
            "p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm relative group/item",
            subIndex !== undefined ? "ml-6 mt-3" : "mt-4"
        )}>
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-3">
                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)] px-1">Title (Max 30)</label>
                        <input
                            type="text"
                            maxLength={30}
                            placeholder="Menu Item Label"
                            value={title}
                            onChange={(e) => handleTitleChange(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] text-[var(--foreground)] text-sm outline-none focus:border-[var(--primary)] transition-all font-semibold"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)] px-1">Type</label>
                        <select
                            value={item.type}
                            onChange={(e) => onUpdate(index, subIndex, { type: e.target.value as any })}
                            className="w-full px-4 py-2 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] text-[var(--foreground)] text-sm outline-none focus:border-[var(--primary)] transition-all font-semibold appearance-none cursor-pointer"
                        >
                            <option value="url">Web URL</option>
                            <option value="postback">Postback</option>
                            {subIndex === undefined && <option value="nested">Nested Menu</option>}
                        </select>
                    </div>

                    {item.type === 'url' && (
                        <div className="flex flex-col gap-1 animate-in slide-in-from-top-2 duration-300">
                            <label className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)] px-1">URL</label>
                            <div className="relative">
                                <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                                <input
                                    type="url"
                                    placeholder="https://example.com"
                                    value={item.url || ""}
                                    onChange={(e) => onUpdate(index, subIndex, { url: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] text-[var(--foreground)] text-sm outline-none focus:border-[var(--primary)] transition-all font-medium animate-in fade-in"
                                />
                            </div>
                        </div>
                    )}

                    {item.type === 'postback' && (
                        <div className="flex flex-col gap-1 animate-in slide-in-from-top-2 duration-300">
                            <label className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)] px-1">Postback Payload / Bot Flow</label>
                            <div className="relative">
                                <MousePointerClick className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted-foreground)]" />
                                <select
                                    value={item.payload || ""}
                                    onChange={(e) => onUpdate(index, subIndex, { payload: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-[var(--muted)]/50 border border-[var(--border)] text-[var(--foreground)] text-sm outline-none focus:border-[var(--primary)] transition-all font-semibold appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>Select Bot Flow</option>
                                    {actions.map((a: any) => (
                                        <option key={a.type} value={a.type}>{a.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex sm:flex-col justify-end gap-2 pt-2 sm:pt-6">
                    <button
                        onClick={() => onRemove(index, subIndex)}
                        className="p-2.5 rounded-xl border border-transparent hover:bg-rose-500/10 text-neutral-400 hover:text-red-500 transition-all cursor-pointer"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {item.type === 'nested' && (
                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5 text-[var(--primary)]" />
                            <span className="text-[11px] font-semibold uppercase text-[var(--muted-foreground)] tracking-wider">Sub Menu Items ({item.children?.length || 0}/5)</span>
                        </div>
                        <button
                            onClick={() => onAddSub(index)}
                            className="px-3 py-1.5 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-semibold uppercase tracking-widest hover:bg-[var(--primary)]/20 transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                            <Plus className="w-3 h-3" /> Add Sub
                        </button>
                    </div>

                    {item.children?.map((subItem, si) => (
                        <MenuItemForm
                            key={subItem.id || si}
                            item={subItem}
                            index={index}
                            subIndex={si}
                            onUpdate={onUpdate}
                            onRemove={onRemove}
                            onAddSub={onAddSub}
                            actions={actions}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default function PersistentMenu({ instagramId, pageId, actions }: PersistentMenuProps) {
    const { showModal } = useModal();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const [composerInputDisabled, setComposerInputDisabled] = useState(false);
    const [items, setItems] = useState<PersistentMenuItem[]>([]);

    const fetchMenu = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/instagram/persistent-menu/${instagramId}?platform=instagram`);
            if (response.data.success || response.data.is_success) {
                const data = response.data.data;
                if (data && data.menu) {
                    setComposerInputDisabled(data.composer_input_disabled || false);
                    const mappedMenu = data.menu.map((m: any) => ({
                        ...m,
                        id: m.id || Math.random().toString(36).substr(2, 9),
                        children: m.children?.map((c: any) => ({
                            ...c,
                            id: c.id || Math.random().toString(36).substr(2, 9)
                        }))
                    }));
                    setItems(mappedMenu);
                } else {
                    setItems([]);
                }
            }
        } catch (error) {
            console.error("Fetch Menu Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (instagramId) fetchMenu();
    }, [instagramId]);

    const handleAddItem = (parentIndex?: number) => {
        const newItem: PersistentMenuItem = {
            id: Math.random().toString(36).substr(2, 9),
            title: "",
            type: "url",
            url: ""
        };

        if (parentIndex !== undefined) {
            const newItems = [...items];
            if (!newItems[parentIndex].children) {
                newItems[parentIndex].children = [];
            }
            if (newItems[parentIndex].children!.length >= 5) {
                showModal("error", "Error", "Max 5 items allowed in nested menu");
                return;
            }
            newItems[parentIndex].children!.push(newItem);
            setItems(newItems);
        } else {
            if (items.length >= 3) {
                showModal("error", "Error", "Max 3 items allowed in top-level menu");
                return;
            }
            setItems([...items, newItem]);
        }
    };

    const handleRemoveItem = (index: number, subIndex?: number) => {
        if (subIndex !== undefined) {
            const newItems = [...items];
            newItems[index].children?.splice(subIndex, 1);
            setItems(newItems);
        } else {
            const newItems = [...items];
            newItems.splice(index, 1);
            setItems(newItems);
        }
    };

    const handleUpdateItem = (index: number, subIndex: number | undefined, data: Partial<PersistentMenuItem>) => {
        const newItems = [...items];
        if (subIndex !== undefined) {
            const item = newItems[index].children![subIndex];
            newItems[index].children![subIndex] = { ...item, ...data };

            if (data.type) {
                if (data.type === 'url') delete newItems[index].children![subIndex].payload;
                if (data.type === 'postback') delete newItems[index].children![subIndex].url;
            }
        } else {
            const item = newItems[index];
            newItems[index] = { ...item, ...data };

            if (data.type) {
                if (data.type === 'url') {
                    delete newItems[index].payload;
                    delete newItems[index].children;
                }
                if (data.type === 'postback') {
                    delete newItems[index].url;
                    delete newItems[index].children;
                }
                if (data.type === 'nested') {
                    delete newItems[index].url;
                    delete newItems[index].payload;
                    if (!newItems[index].children) newItems[index].children = [];
                }
            }
        }
        setItems(newItems);
    };

    const handleSave = async () => {
        const validateItems = (itemList: PersistentMenuItem[]): string | null => {
            for (const item of itemList) {
                if (!item.title) return "All items must have a title";
                if (item.type === 'url' && !item.url) return `Item "${item.title}" must have a URL`;
                if (item.type === 'postback' && !item.payload) return `Item "${item.title}" must have a payload`;
                if (item.type === 'nested') {
                    if (!item.children || item.children.length === 0) return `Nested item "${item.title}" must have sub-items`;
                    const subError: string | null = validateItems(item.children);
                    if (subError) return subError;
                }
            }
            return null;
        };

        const error = validateItems(items);
        if (error) {
            showModal("error", "Error", error);
            return;
        }

        setIsSaving(true);
        try {
            await api.post('/instagram/persistent-menu/save', {
                instagram_id: instagramId,
                facebook_page_id: pageId,
                locale: "default",
                composer_input_disabled: composerInputDisabled,
                menu: items
            });
            showModal("success", "Saved", "Persistent menu saved locally");
        } catch (error: any) {
            showModal("error", "Error", error.response?.data?.message || "Failed to save menu");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            await api.post(`/instagram/persistent-menu/sync/${instagramId}`, { platform: "instagram" });
            showModal("success", "Synced", "Persistent menu synced to Instagram!");
        } catch (error: any) {
            showModal("error", "Error", error.response?.data?.message || "Failed to sync with Instagram");
        } finally {
            setIsSyncing(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Remove persistent menu from Instagram?")) return;
        setIsDeleting(true);
        try {
            await api.delete(`/instagram/persistent-menu/${instagramId}`);
            showModal("success", "Deleted", "Persistent menu removed");
            setItems([]);
        } catch (error: any) {
            showModal("error", "Error", error.response?.data?.message || "Failed to delete");
        } finally {
            setIsDeleting(false);
        }
    };



    return (
        <div className="w-full space-y-6 pb-12 animate-in fade-in duration-500">
            {/* Header Controls */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-[var(--card)] border border-[var(--border)] p-5 rounded-2xl shadow-sm">
                <div>
                    <h2 className="text-xl font-semibold text-[var(--foreground)] uppercase tracking-tight">Persistent Menu</h2>
                    <p className="text-[11px] text-[var(--muted-foreground)] font-medium uppercase tracking-widest mt-1">Configure the permanent menu visible in Instagram DMs</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="px-5 py-2.5 rounded-xl border border-[var(--border)] text-[var(--muted-foreground)] hover:text-red-500 hover:bg-rose-500/10 transition-all text-[11px] font-medium uppercase tracking-widest flex items-center gap-2 cursor-pointer"
                    >
                        {isDeleting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Trash className="w-3 h-3" />}
                        Delete
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-5 py-2.5 rounded-xl bg-transparent border border-[var(--border)] text-[var(--muted-foreground)] hover:bg-[var(--muted)]/50 transition-all text-[11px] font-medium uppercase tracking-widest flex items-center gap-2 shadow-sm cursor-pointer"
                    >
                        {isSaving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        Save Local
                    </button>
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="px-5 py-2.5 rounded-xl bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] font-medium text-[11px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-[var(--primary)]/20 active:scale-95 transition-all cursor-pointer"
                    >
                        {isSyncing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Instagram className="w-3 h-3" />}
                        Sync to Instagram
                    </button>
                </div>
            </div>

            {/* Compact Configuration Tile */}
            <div className="flex flex-wrap gap-4">
                <div className={cn(
                    "w-full max-w-sm p-5 rounded-3xl border transition-all flex flex-col gap-4 shadow-sm",
                    composerInputDisabled
                        ? "bg-[var(--primary)]/5 border-[var(--primary)]/20"
                        : "bg-[var(--card)] border border-[var(--border)]"
                )}>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-9 h-9 rounded-xl flex items-center justify-center transition-colors",
                                composerInputDisabled ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                            )}>
                                <Info className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-semibold text-[var(--primary)] uppercase tracking-widest leading-none">Composer Lock</span>
                        </div>

                        <button
                            onClick={() => setComposerInputDisabled(!composerInputDisabled)}
                            className={cn(
                                "w-12 h-6 rounded-full relative transition-all duration-300 cursor-pointer",
                                composerInputDisabled ? "bg-[var(--primary)]" : "bg-[var(--muted)]"
                            )}
                        >
                            <div className={cn(
                                "absolute top-1 w-4 h-4 rounded-full bg-[var(--card)] transition-all duration-300 shadow-sm",
                                composerInputDisabled ? "left-7" : "left-1"
                            )} />
                        </button>
                    </div>

                    <div>
                        <h4 className="text-[13px] font-bold text-[var(--foreground)] mb-1">Disable Chat Composer?</h4>
                        <p className="text-[10px] text-[var(--muted-foreground)] font-medium leading-relaxed">If enabled, users can only interact via menu buttons. Keyboard input will be disabled in the IG DM bar.</p>
                    </div>
                </div>

                <div className="flex-1 min-w-[300px] flex items-center justify-between px-2 bg-[var(--muted)]/20 border border-dashed border-[var(--border)] rounded-3xl p-5">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-[var(--primary)]" />
                            <h3 className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-widest">Menu Items ({items.length}/3)</h3>
                        </div>
                        <p className="text-[10px] text-[var(--muted-foreground)] font-medium uppercase tracking-widest">Main persistent menu navigation</p>
                    </div>
                    <button
                        onClick={() => handleAddItem()}
                        disabled={items.length >= 3}
                        className="px-6 py-2.5 rounded-2xl bg-[var(--primary)] hover:opacity-90 text-[var(--primary-foreground)] text-[10px] font-semibold uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 shadow-xl shadow-[var(--primary)]/20 disabled:opacity-50 cursor-pointer"
                    >
                        <Plus size={14} strokeWidth={2} /> Add Item
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <AnimatePresence>
                    {items.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="py-12 border-2 border-dashed border-[var(--border)] rounded-2xl text-center"
                        >
                            <p className="text-xs text-[var(--muted-foreground)] font-medium italic">No menu items configured yet.</p>
                        </motion.div>
                    ) : (
                        items.map((item, idx) => (
                            <motion.div
                                key={item.id || idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <MenuItemForm
                                    key={item.id || idx}
                                    item={item}
                                    index={idx}
                                    onUpdate={handleUpdateItem}
                                    onRemove={handleRemoveItem}
                                    onAddSub={handleAddItem}
                                    actions={actions}
                                />
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
