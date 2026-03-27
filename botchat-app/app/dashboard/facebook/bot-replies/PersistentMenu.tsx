"use client";

import { useEffect, useState } from "react";
import {
    Plus, Trash2, Save, RefreshCw,
    Link2, MousePointerClick, Layers, Info, Trash
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useModal } from "@/components/providers/ModalProvider";
import { cn } from "@/lib/utils";

interface PersistentMenuItem {
    id?: string;
    title: string;
    type: "web_url" | "postback" | "nested";
    url?: string;
    payload?: string;
    call_to_actions?: PersistentMenuItem[];
}

interface PersistentMenuProps {
    pageId: string;
    actions: any[];
}

/* ─────────────────────────────────────────────────────────────
   MenuItemForm is defined OUTSIDE the parent so it is never
   re-mounted on every render – this is the root cause of the
   cursor-jumping bug.
───────────────────────────────────────────────────────────── */
interface MenuItemFormProps {
    item: PersistentMenuItem;
    index: number;
    subIndex?: number;
    actions: any[];
    onUpdate: (index: number, subIndex: number | undefined, data: Partial<PersistentMenuItem>) => void;
    onRemove: (index: number, subIndex?: number) => void;
    onAddSub: (parentIndex: number) => void;
}

function MenuItemForm({ item, index, subIndex, actions, onUpdate, onRemove, onAddSub }: MenuItemFormProps) {
    return (
        <div className={cn(
            "p-4 rounded-2xl border border-pink-100 dark:border-pink-900/30 bg-white dark:bg-neutral-900 shadow-sm",
            subIndex !== undefined ? "ml-6 mt-3" : "mt-4"
        )}>
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 space-y-3">

                    {/* Title */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-medium uppercase tracking-widest text-pink-400">
                            Title <span className="normal-case text-neutral-400">(max 30)</span>
                        </label>
                        <input
                            type="text"
                            maxLength={30}
                            placeholder="Menu item label"
                            value={item.title}
                            onChange={(e) => onUpdate(index, subIndex, { title: e.target.value })}
                            className="w-full px-4 py-2.5 rounded-xl bg-pink-50 dark:bg-neutral-950 border border-pink-100 dark:border-pink-900/30 text-sm font-normal text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 outline-none focus:border-pink-400 dark:focus:border-pink-500 transition-colors"
                        />
                    </div>

                    {/* Type */}
                    <div className="flex flex-col gap-1">
                        <label className="text-[11px] font-medium uppercase tracking-widest text-pink-400">Type</label>
                        <select
                            value={item.type}
                            onChange={(e) => onUpdate(index, subIndex, { type: e.target.value as any })}
                            className="w-full px-4 py-2.5 rounded-xl bg-pink-50 dark:bg-neutral-950 border border-pink-100 dark:border-pink-900/30 text-sm font-normal text-neutral-800 dark:text-neutral-200 outline-none focus:border-pink-400 dark:focus:border-pink-500 transition-colors appearance-none"
                        >
                            <option value="web_url">Web URL</option>
                            <option value="postback">Postback</option>
                            {subIndex === undefined && <option value="nested">Nested Menu</option>}
                        </select>
                    </div>

                    {/* URL field */}
                    {item.type === "web_url" && (
                        <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-medium uppercase tracking-widest text-pink-400">URL</label>
                            <div className="relative">
                                <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-300" />
                                <input
                                    type="url"
                                    placeholder="https://example.com"
                                    value={item.url || ""}
                                    onChange={(e) => onUpdate(index, subIndex, { url: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-pink-50 dark:bg-neutral-950 border border-pink-100 dark:border-pink-900/30 text-sm font-normal text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 outline-none focus:border-pink-400 dark:focus:border-pink-500 transition-colors"
                                />
                            </div>
                        </div>
                    )}

                    {/* Postback / Bot Flow */}
                    {item.type === "postback" && (
                        <div className="flex flex-col gap-1">
                            <label className="text-[11px] font-medium uppercase tracking-widest text-pink-400">
                                Postback Payload / Bot Flow
                            </label>
                            <div className="relative">
                                <MousePointerClick className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-300" />
                                <select
                                    value={item.payload || ""}
                                    onChange={(e) => onUpdate(index, subIndex, { payload: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-pink-50 dark:bg-neutral-950 border border-pink-100 dark:border-pink-900/30 text-sm font-normal text-neutral-800 dark:text-neutral-200 outline-none focus:border-pink-400 dark:focus:border-pink-500 transition-colors appearance-none"
                                >
                                    <option value="" disabled>Select bot flow</option>
                                    {actions.map((a: any) => (
                                        <option key={a.type} value={a.type}>{a.label}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Remove button */}
                <div className="flex sm:flex-col justify-end gap-2 pt-2 sm:pt-6">
                    <button
                        onClick={() => onRemove(index, subIndex)}
                        className="p-2.5 rounded-xl border border-transparent hover:bg-red-50 dark:hover:bg-red-500/10 text-neutral-300 hover:text-red-500 transition-all"
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            </div>

            {/* Nested sub-items */}
            {item.type === "nested" && (
                <div className="mt-4 pt-4 border-t border-pink-50 dark:border-pink-900/20">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Layers className="w-3.5 h-3.5 text-pink-500" />
                            <span className="text-[11px] font-medium uppercase text-neutral-500 tracking-wider">
                                Sub Menu Items ({item.call_to_actions?.length || 0}/5)
                            </span>
                        </div>
                        <button
                            onClick={() => onAddSub(index)}
                            className="px-3 py-1.5 rounded-lg bg-pink-50 dark:bg-pink-950/40 text-pink-600 dark:text-pink-400 text-[11px] font-medium hover:bg-pink-100 transition-all flex items-center gap-1.5"
                        >
                            <Plus className="w-3 h-3" /> Add Sub
                        </button>
                    </div>

                    {item.call_to_actions?.map((subItem, si) => (
                        <MenuItemForm
                            key={si}
                            item={subItem}
                            index={index}
                            subIndex={si}
                            actions={actions}
                            onUpdate={onUpdate}
                            onRemove={onRemove}
                            onAddSub={onAddSub}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

/* ─────────────────────────────────────────────────────────────
   Main component
───────────────────────────────────────────────────────────── */
export default function PersistentMenu({ pageId, actions }: PersistentMenuProps) {
    const { showModal } = useModal();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isSyncing, setIsSyncing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [composerInputDisabled, setComposerInputDisabled] = useState(false);
    const [items, setItems] = useState<PersistentMenuItem[]>([]);

    /** Convert API menu format → internal form format (url → web_url) */
    const apiToForm = (menuItems: any[]): PersistentMenuItem[] =>
        menuItems.map((m: any) => ({
            ...m,
            type: m.type === "url" ? "web_url" : m.type,
            call_to_actions: m.call_to_actions ? apiToForm(m.call_to_actions) : undefined,
        }));

    /** Convert internal form format → API payload format (web_url → url) */
    const formToApi = (formItems: PersistentMenuItem[]): any[] =>
        formItems.map((item) => ({
            title: item.title,
            type: item.type === "web_url" ? "url" : item.type,
            ...(item.url && { url: item.url }),
            ...(item.payload && { payload: item.payload }),
            ...(item.call_to_actions?.length && { call_to_actions: formToApi(item.call_to_actions) }),
        }));

    const fetchMenu = async () => {
        setIsLoading(true);
        try {
            const response = await api.get(`/facebook/persistent-menu/${pageId}`);
            if (response.data.success || response.data.is_success) {
                const data = response.data.data;
                if (data) {
                    setComposerInputDisabled(data.composer_input_disabled || false);
                    // Support both `menu` and legacy `items` keys from API
                    const raw = data.menu || data.items || [];
                    setItems(apiToForm(raw));
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
        if (pageId) fetchMenu();
    }, [pageId]);

    const handleAddItem = (parentIndex?: number) => {
        const newItem: PersistentMenuItem = { title: "", type: "web_url", url: "" };

        if (parentIndex !== undefined) {
            const newItems = [...items];
            if (!newItems[parentIndex].call_to_actions) newItems[parentIndex].call_to_actions = [];
            if (newItems[parentIndex].call_to_actions!.length >= 5) {
                showModal("error", "Error", "Max 5 items allowed in nested menu");
                return;
            }
            newItems[parentIndex].call_to_actions!.push(newItem);
            setItems(newItems);
        } else {
            if (items.length >= 3) { showModal("error", "Error", "Max 3 items allowed in top-level menu"); return; }
            setItems([...items, newItem]);
        }
    };

    const handleRemoveItem = (index: number, subIndex?: number) => {
        const newItems = [...items];
        if (subIndex !== undefined) {
            newItems[index].call_to_actions?.splice(subIndex, 1);
        } else {
            newItems.splice(index, 1);
        }
        setItems(newItems);
    };

    const handleUpdateItem = (index: number, subIndex: number | undefined, data: Partial<PersistentMenuItem>) => {
        const newItems = [...items];
        if (subIndex !== undefined) {
            const item = newItems[index].call_to_actions![subIndex];
            newItems[index].call_to_actions![subIndex] = { ...item, ...data };
            if (data.type) {
                if (data.type === "web_url") delete newItems[index].call_to_actions![subIndex].payload;
                if (data.type === "postback") delete newItems[index].call_to_actions![subIndex].url;
            }
        } else {
            newItems[index] = { ...newItems[index], ...data };
            if (data.type) {
                if (data.type === "web_url") { delete newItems[index].payload; delete newItems[index].call_to_actions; }
                if (data.type === "postback") { delete newItems[index].url; delete newItems[index].call_to_actions; }
                if (data.type === "nested") {
                    delete newItems[index].url;
                    delete newItems[index].payload;
                    if (!newItems[index].call_to_actions) newItems[index].call_to_actions = [];
                }
            }
        }
        setItems(newItems);
    };

    const handleSave = async () => {
        const validateItems = (itemList: PersistentMenuItem[]): string | null => {
            for (const item of itemList) {
                if (!item.title) return "All items must have a title";
                if (item.type === "web_url" && !item.url) return `"${item.title}" must have a URL`;
                if (item.type === "postback" && !item.payload) return `"${item.title}" must have a payload`;
                if (item.type === "nested") {
                    if (!item.call_to_actions?.length) return `Nested item "${item.title}" must have sub-items`;
                    const subError = validateItems(item.call_to_actions);
                    if (subError) return subError;
                }
            }
            return null;
        };
        const error = validateItems(items);
        if (error) { showModal("error", "Error", error); return; }

        setIsSaving(true);
        try {
            const response = await api.post("/facebook/persistent-menu/save", {
                facebook_page_id: pageId,
                composer_input_disabled: composerInputDisabled,
                locale: "default",
                menu: formToApi(items),
            });
            if (response.data.success || response.data.is_success) showModal("success", "Saved", "Persistent menu saved locally");
        } catch (error: any) {
            showModal("error", "Error", error.response?.data?.message || "Failed to save menu");
        } finally {
            setIsSaving(false);
        }
    };

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const response = await api.post(`/facebook/persistent-menu/sync/${pageId}`);
            if (response.data.success || response.data.is_success) showModal("success", "Synced", "Persistent menu synced to Facebook!");
        } catch (error: any) {
            showModal("error", "Error", error.response?.data?.message || "Failed to sync with Meta");
        } finally {
            setIsSyncing(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Remove persistent menu from Facebook?")) return;
        setIsDeleting(true);
        try {
            const response = await api.delete(`/facebook/persistent-menu/${pageId}`);
            if (response.data.success || response.data.is_success) {
                showModal("success", "Deleted", "Persistent menu removed");
                setItems([]);
            }
        } catch (error: any) {
            showModal("error", "Error", error.response?.data?.message || "Failed to delete");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="w-full space-y-6 pb-12 animate-in fade-in duration-500">

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white dark:bg-neutral-900 border border-pink-100 dark:border-pink-900/30 p-5 rounded-2xl shadow-sm">
                <div>
                    <h2 className="text-xl font-semibold text-pink-600 dark:text-pink-400">Persistent Menu</h2>
                    <p className="text-xs text-neutral-400 mt-1">Configure the permanent menu visible in Messenger</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="px-4 py-2 rounded-xl border border-neutral-200 dark:border-neutral-800 text-neutral-500 hover:text-red-500 hover:bg-red-50 transition-all text-xs font-medium flex items-center gap-2"
                    >
                        {isDeleting ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Trash className="w-3 h-3" />}
                        Delete
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="px-4 py-2 rounded-xl border border-pink-200 dark:border-pink-900/40 text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all text-xs font-medium flex items-center gap-2"
                    >
                        {isSaving ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        Save Local
                    </button>
                    <button
                        onClick={handleSync}
                        disabled={isSyncing}
                        className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 active:scale-95 text-white text-xs font-medium flex items-center gap-2 shadow-md shadow-pink-500/20 transition-all"
                    >
                        {isSyncing ? <RefreshCw className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                        Sync to Facebook
                    </button>
                </div>
            </div>

            {/* Config tiles */}
            <div className="flex flex-wrap gap-4">
                {/* Composer lock toggle */}
                <div className={cn(
                    "w-full max-w-sm p-5 rounded-2xl border transition-all flex flex-col gap-4 shadow-sm",
                    composerInputDisabled
                        ? "bg-pink-50/50 border-pink-200 dark:bg-pink-950/10 dark:border-pink-900/40"
                        : "bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800"
                )}>
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <div className={cn(
                                "w-9 h-9 rounded-xl flex items-center justify-center transition-colors",
                                composerInputDisabled ? "bg-pink-100 text-pink-500 dark:bg-pink-900/50" : "bg-neutral-50 text-neutral-400 dark:bg-neutral-800"
                            )}>
                                <Info className="w-5 h-5" />
                            </div>
                            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Composer Lock</span>
                        </div>

                        <button
                            onClick={() => setComposerInputDisabled(!composerInputDisabled)}
                            className={cn(
                                "w-12 h-6 rounded-full relative transition-all duration-300",
                                composerInputDisabled ? "bg-pink-500" : "bg-neutral-200 dark:bg-neutral-800"
                            )}
                        >
                            <div className={cn(
                                "absolute top-1 w-4 h-4 rounded-full bg-white transition-all duration-300 shadow-sm",
                                composerInputDisabled ? "left-7" : "left-1"
                            )} />
                        </button>
                    </div>

                    <div>
                        <h4 className="text-sm font-medium text-neutral-800 dark:text-neutral-200 mb-1">Disable Chat Composer?</h4>
                        <p className="text-xs text-neutral-400 leading-relaxed">If enabled, users can only interact via menu buttons. Keyboard input will be disabled in the chat bar.</p>
                    </div>
                </div>

                {/* Add item tile */}
                <div className="flex-1 min-w-[300px] flex items-center justify-between px-5 bg-pink-50/30 dark:bg-neutral-900/30 border border-dashed border-pink-100 dark:border-pink-900/30 rounded-2xl p-5">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Layers className="w-4 h-4 text-pink-500" />
                            <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">Menu Items ({items.length}/3)</h3>
                        </div>
                        <p className="text-xs text-neutral-400">Main persistent menu navigation</p>
                    </div>
                    <button
                        onClick={() => handleAddItem()}
                        disabled={items.length >= 3}
                        className="px-5 py-2 rounded-xl bg-pink-500 hover:bg-pink-600 active:scale-95 text-white text-xs font-medium flex items-center gap-2 shadow-md shadow-pink-500/20 disabled:opacity-50 transition-all"
                    >
                        <Plus size={14} strokeWidth={2.5} /> Add Item
                    </button>
                </div>
            </div>

            {/* Items list */}
            <div className="space-y-4">
                <AnimatePresence>
                    {items.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="py-12 border-2 border-dashed border-pink-100 dark:border-pink-900/20 rounded-2xl text-center"
                        >
                            <p className="text-sm text-neutral-400">No menu items configured yet.</p>
                        </motion.div>
                    ) : (
                        items.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                            >
                                <MenuItemForm
                                    item={item}
                                    index={idx}
                                    actions={actions}
                                    onUpdate={handleUpdateItem}
                                    onRemove={handleRemoveItem}
                                    onAddSub={handleAddItem}
                                />
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
