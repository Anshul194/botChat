"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Plus, Trash2, Edit3, Save, Loader2, Link as LinkIcon,
    Image as ImageIcon, GripVertical, RefreshCw, LayoutTemplate,
    Upload, Wand2, ArrowRight, CheckCircle2, X, Eye, Share2, Grid, User,
    Layers, Video, Youtube, MonitorPlay, Smartphone, Monitor, Hexagon,
    ShoppingBag, SmartphoneNfc, Sparkles, ChevronLeft, ChevronRight,
    Settings, Zap, MoreHorizontal, PanelLeft, Columns, Search, Camera
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useModal } from "@/components/providers/ModalProvider";
import { cn } from "@/lib/utils";
import { VisualsLab, getTheme, isColorLight, ThemeEffectsLayer, ThemeAnimationStyles } from "./TemplateSystem";

interface BioProfile { id: number; title: string; bio: string; avatar: string; email_link: string; contact_link: string; theme: string; }
interface BioTab { id: number; title: string; is_active: number; sections: BioSection[]; }
interface BioSection { id: number; tab_id: number; title: string; type: string; is_active: number; blocks: BioBlock[]; }
interface BioBlock { id: number; section_id: number; type: string; is_active: number; items: any[]; }

const BLOCK_ICONS: Record<string, React.ReactNode> = {
    links_carousel: <Layers size={16} />, hero_single_link: <LinkIcon size={16} />, links_grid: <Grid size={16} />,
    ig_reels_sync: <Video size={16} />, ig_reels: <Video size={16} />, youtube_shorts: <Youtube size={16} />,
    long_form_videos: <MonitorPlay size={16} />, long_video: <MonitorPlay size={16} />,
    vertical_media: <Smartphone size={16} />, square_media: <ImageIcon size={16} />, horizontal_media: <Monitor size={16} />,
    add_logos: <Hexagon size={16} />, add_products: <ShoppingBag size={16} />, add_apps: <SmartphoneNfc size={16} />,
};

const BLOCK_COLORS: Record<string, string> = {
    links_carousel: "#6366F1", hero_single_link: "#EC4899", links_grid: "#8B5CF6",
    vertical_media: "#06B6D4", square_media: "#10B981", horizontal_media: "#F59E0B",
    add_logos: "#EF4444", add_products: "#F97316", add_apps: "#3B82F6",
    ig_reels: "#E11D48", ig_reels_sync: "#E11D48", youtube_shorts: "#DC2626",
};

const CarouselPreview = ({ items }: { items: any[] }) => (
    <div className="flex gap-3 overflow-x-auto no-scrollbar py-1">
        {items.map((item, i) => (
            <a key={i} href={item.url || "#"} target="_blank"
                className="flex-shrink-0 w-[160px] bg-white dark:bg-neutral-800 rounded-xl overflow-hidden border border-neutral-100 dark:border-neutral-700 group">
                <div className="h-24 bg-neutral-100 dark:bg-neutral-700 relative overflow-hidden">
                    {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" /> :
                        <div className="absolute inset-0 flex items-center justify-center text-neutral-300"><ImageIcon size={20} /></div>}
                </div>
                <div className="p-3">
                    <p className="text-[12px] font-semibold text-neutral-800 dark:text-white truncate">{item.title || "Link"}</p>
                    <p className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1">{item.button_text || "Visit"} <ArrowRight size={9} /></p>
                </div>
            </a>
        ))}
    </div>
);

const ModalShell = ({ open, onClose, title, icon, children, footer }: any) => (
    <AnimatePresence>
        {open && (
            <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-0 sm:p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative z-10 w-full sm:max-w-xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-[0_32px_128px_rgba(0,0,0,0.5)]">
                    <div className="flex items-center gap-4 px-8 pt-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                        {icon && <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">{icon}</div>}
                        <h2 className="text-xl font-black text-slate-900 dark:text-white flex-1 tracking-tight">{title}</h2>
                        <button onClick={onClose} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8">{children}</div>
                    {footer && <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">{footer}</div>}
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

const InputField = ({ label, ...props }: any) => (
    <div className="space-y-2">
        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{label}</label>
        <input {...props} className="w-full h-12 px-5 rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-rose-500/20 text-[14px] font-bold text-slate-900 dark:text-white outline-none transition-all shadow-inner" />
    </div>
);

const PhonePreview = ({ profile, tabs, selectedTabId, setSelectedTabId }: any) => {
    const currentTab = tabs.find((t: any) => t.id === selectedTabId) || tabs[0];
    const theme = getTheme(profile?.theme);
    const accentLight = isColorLight(theme.accent);

    return (
        <div className="relative mx-auto w-[300px]">
            <div className="relative bg-[#020617] rounded-[54px] p-2.5 shadow-[0_50px_100px_rgba(0,0,0,0.4),0_0_0_4px_rgba(255,255,255,0.05)] border-4 border-slate-800">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-[#020617] rounded-b-3xl z-20" />
                <div className="rounded-[44px] overflow-hidden h-[600px] relative flex flex-col shadow-inner transition-all duration-700"
                    style={theme.bgStyle}>
                    <ThemeAnimationStyles />
                    <ThemeEffectsLayer theme={theme} />
                    <div className="flex-1 overflow-y-auto no-scrollbar pt-10 px-5 pb-20 relative z-10">
                        <div className="flex flex-col items-center pt-6 pb-8">
                            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}
                                className="w-20 h-20 rounded-full overflow-hidden shadow-2xl mb-4 p-0.5"
                                style={{ border: `3px solid ${theme.textColor}35`, backgroundColor: `${theme.textColor}08` }}>
                                {profile?.avatar ? <img src={profile.avatar} className="w-full h-full rounded-full object-cover" /> :
                                    <div className="w-full h-full flex items-center justify-center rounded-full" style={{ color: `${theme.textColor}50` }}><User size={32} /></div>}
                            </motion.div>
                            <div className="backdrop-blur-md rounded-2xl px-8 py-2.5 shadow-xl"
                                style={{ backgroundColor: `${theme.textColor}0D`, border: `1px solid ${theme.textColor}18` }}>
                                <p className="text-[14px] font-black tracking-tight" style={{ color: theme.textColor }}>{profile?.title || "Your Brand"}</p>
                            </div>
                        </div>
                        {tabs.length > 1 && (
                            <div className="flex gap-2 mb-6 overflow-x-auto no-scrollbar justify-center px-2">
                                {tabs.map((t: any) => (
                                    <button key={t.id} onClick={() => setSelectedTabId(t.id)}
                                        className="flex-shrink-0 px-5 py-2 rounded-full text-[11px] font-black tracking-wide transition-all shadow-sm"
                                        style={selectedTabId === t.id
                                            ? { backgroundColor: theme.accent, color: accentLight ? '#000' : '#fff' }
                                            : { backgroundColor: `${theme.textColor}12`, color: `${theme.textColor}AA`, backdropFilter: 'blur(8px)' }}>
                                        {t.title}
                                    </button>
                                ))}
                            </div>
                        )}
                        <div className="space-y-4">
                            {currentTab?.sections?.map((sec: any) => (
                                <div key={sec.id}>
                                    {sec.title !== "New Section" && <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-4 pl-2" style={{ color: `${theme.textColor}70` }}>{sec.title}</p>}
                                    <div className="space-y-3">
                                        {sec.blocks?.map((block: any) => (
                                            (block.items || []).map((item: any, i: number) => (
                                                <motion.a key={i} whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}
                                                    href={item.url || "#"} className={cn("block w-full flex items-center justify-center transition-all", theme.fontClass)}
                                                    style={theme.btnStyle}>
                                                    {item.title}
                                                </motion.a>
                                            ))
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="absolute top-6 left-6 w-10 h-10 rounded-full flex items-center justify-center border z-10"
                        style={{ backgroundColor: `${theme.textColor}10`, borderColor: `${theme.textColor}20`, color: theme.textColor }}>
                        <ChevronLeft size={18} />
                    </div>
                    <div className="absolute top-6 right-6 w-10 h-10 rounded-full flex items-center justify-center border z-10"
                        style={{ backgroundColor: `${theme.textColor}10`, borderColor: `${theme.textColor}20`, color: theme.textColor }}>
                        <Share2 size={16} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const SectionCard = ({ section, sidx, sectionsLength, isArranging, onReorder, onDeleteSection, onDeleteBlock, onOpenEditor, onAddBlock }: any) => (
    <motion.div layout key={section.id}
        className="group/sec rounded-3xl border border-slate-200/60 dark:border-slate-800/60 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500">
        <div className="flex items-center gap-4 px-8 py-5 bg-slate-50/50 dark:bg-slate-950/30 border-b border-slate-100 dark:border-slate-800/50">
            {isArranging ? (
                <div className="flex items-center gap-1.5 mr-2">
                    <button disabled={sidx === 0} onClick={() => onReorder(sidx, sidx - 1)} 
                        className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center disabled:opacity-30 hover:bg-rose-500 hover:text-white transition-all border border-slate-200 dark:border-slate-700">
                        <ChevronLeft size={14} />
                    </button>
                    <button disabled={sidx === sectionsLength - 1} onClick={() => onReorder(sidx, sidx + 1)} 
                        className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 shadow-sm flex items-center justify-center disabled:opacity-30 hover:bg-rose-500 hover:text-white transition-all border border-slate-200 dark:border-slate-700">
                        <ChevronRight size={14} />
                    </button>
                </div>
            ) : (
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-500 shadow-inner ring-1 ring-rose-500/20">
                    <Layers size={16} />
                </div>
            )}
            <div className="flex-1">
                <span className="text-[14px] font-black text-slate-900 dark:text-white uppercase tracking-[0.1em]">{section.title}</span>
                <div className="flex items-center gap-2 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{section.blocks?.length || 0} Items linked</span>
                </div>
            </div>
            <button onClick={() => onDeleteSection(section.id)} 
                className="w-10 h-10 rounded-xl opacity-0 group-hover/sec:opacity-100 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 text-slate-300 flex items-center justify-center transition-all">
                <Trash2 size={16} />
            </button>
        </div>

        <div className="p-8 space-y-4">
            {section.blocks?.length === 0 ? (
                <div className="py-12 text-center rounded-[28px] border-2 border-dashed border-slate-100 dark:border-slate-800 bg-slate-50/30">
                    <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.2em]">Empty Category</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {section.blocks?.map((block: any) => {
                        const color = BLOCK_COLORS[block.type] || "#6B7280";
                        const icon = BLOCK_ICONS[block.type] || <LayoutTemplate size={20} />;
                        const isEditable = ['links_carousel', 'hero_single_link', 'links_grid', 'add_products', 'add_apps', 'vertical_media', 'square_media', 'horizontal_media', 'add_logos'].includes(block.type);
                        
                        return (
                            <motion.div layout key={block.id} onClick={() => isEditable && onOpenEditor(block)}
                                className={cn("flex items-center gap-5 p-6 rounded-3xl border-2 transition-all group/block relative overflow-hidden",
                                    isEditable ? "cursor-pointer bg-white dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 hover:border-rose-500/30 hover:shadow-xl hover:translate-x-1"
                                        : "bg-slate-50 dark:bg-slate-950/40 border-transparent opacity-60")}>
                                <div className="absolute top-[-20px] right-[-20px] w-24 h-24 bg-rose-500/5 blur-2xl rounded-full" />
                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg" style={{ backgroundColor: `${color}15`, color }}>
                                    {icon}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[15px] font-black text-slate-900 dark:text-slate-100 tracking-tight capitalize">{block.type.replace(/_/g, " ")}</p>
                                    <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{isEditable ? "Tap to Edit Settings" : "System Content"}</p>
                                </div>
                                {!isArranging && (
                                    <button onClick={e => { e.stopPropagation(); onDeleteBlock(block.id); }}
                                        className="w-10 h-10 rounded-xl opacity-0 group-hover/block:opacity-100 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 text-slate-300 flex items-center justify-center transition-all shrink-0">
                                        <Trash2 size={16} />
                                    </button>
                                )}
                            </motion.div>
                        );
                    })}
                </div>
            )}
            <button onClick={() => onAddBlock(section.id)}
                className="w-full flex items-center justify-center gap-3 h-16 rounded-[28px] border-2 border-rose-500/10 bg-rose-500/[0.02] text-rose-500 hover:bg-rose-500 hover:text-white transition-all text-xs font-black uppercase tracking-[0.2em] mt-4 shadow-sm">
                <Plus size={20} /> Add New Link / Photo
            </button>
        </div>
    </motion.div>
);


export default function BioLinkBuilder() {
    const { showModal } = useModal();
    const [isLoading, setIsLoading] = useState(true);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
    const [blockCategories, setBlockCategories] = useState<{ [cat: string]: any[] }>({});
    const [profile, setProfile] = useState<BioProfile | null>(null);
    const [tabs, setTabs] = useState<BioTab[]>([]);
    const [selectedTabId, setSelectedTabId] = useState<number | null>(null);

    const [showCreate, setShowCreate] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [createTitle, setCreateTitle] = useState("");
    const [showAddTab, setShowAddTab] = useState(false);
    const [newTabTitle, setNewTabTitle] = useState("");
    const [showAddSection, setShowAddSection] = useState(false);
    const [newSectionTitle, setNewSectionTitle] = useState("");
    const [showAddBlock, setShowAddBlock] = useState(false);
    const [targetSectionId, setTargetSectionId] = useState<number | null>(null);
    const [showCarouselEditor, setShowCarouselEditor] = useState(false);
    const [editingBlock, setEditingBlock] = useState<any>(null);

    const [isArranging, setIsArranging] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const [activePanel, setActivePanel] = useState<"builder" | "preview">("builder");
    const [view, setView] = useState("blocks");

    const instagramUsername = accounts.find(a => String(a.id) === selectedPageId)?.username || "username";
    const publicUrl = typeof window !== "undefined"
        ? `${window.location.origin}/p?u=${instagramUsername}&id=${selectedPageId}`
        : `/p?u=${instagramUsername}&id=${selectedPageId}`;

    const currentTab = tabs.find(t => t.id === selectedTabId) || tabs[0];

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const res = await api.get("/social/instagram-connect");
                const accs = res.data?.data?.instagram_accounts || [];
                setAccounts(accs);
                if (accs.length > 0) setSelectedPageId(accs[0].id.toString());
            } catch { }
        };
        const fetchBlockCategories = async () => {
            try {
                const res = await api.get("/bio-builder/block-types");
                if (res.data?.success) setBlockCategories(res.data.data);
            } catch { }
        };
        fetchAccounts(); fetchBlockCategories();
    }, []);

    const fetchBuilderData = useCallback(async () => {
        if (!selectedPageId) return;
        setIsLoading(true);
        try {
            const res = await api.get(`/bio-builder?page=${selectedPageId}`);
            const payload = res.data?.data || res.data;
            if (payload?.id) { setProfile(payload); setTabs(payload.tabs || []); if (payload.tabs?.length > 0 && !selectedTabId) setSelectedTabId(payload.tabs[0].id); }
            else if (payload?.profile) { setProfile(payload.profile); setTabs(payload.tabs || []); if (payload.tabs?.length > 0 && !selectedTabId) setSelectedTabId(payload.tabs[0].id); }
            else { setProfile(null); setTabs([]); setSelectedTabId(null); }
        } catch { setProfile(null); setTabs([]); setSelectedTabId(null); }
        finally { setIsLoading(false); }
    }, [selectedPageId]);

    useEffect(() => { fetchBuilderData(); }, [fetchBuilderData]);

    const handleUpdateProfile = async (updates: Partial<BioProfile>) => {
        if (!profile) return;
        try { await api.put(`/bio-builder/profile/${profile.id}`, updates); setProfile({ ...profile, ...updates }); }
        catch { showModal("error", "Error", "Failed to update profile."); }
    };

    const handleAddTab = async () => {
        if (!profile || !newTabTitle.trim()) return;
        try { await api.post("/bio-builder/tabs", { profile_id: profile.id, title: newTabTitle }); setShowAddTab(false); setNewTabTitle(""); fetchBuilderData(); }
        catch { showModal("error", "Error", "Failed to add tab."); }
    };

    const handleAddSection = async () => {
        if (!profile || !currentTab || !newSectionTitle.trim()) return;
        try { await api.post("/bio-builder/sections", { profile_id: profile.id, tab_id: currentTab.id, title: newSectionTitle, type: "links" }); setShowAddSection(false); setNewSectionTitle(""); fetchBuilderData(); }
        catch { showModal("error", "Error", "Failed to add section."); }
    };

    const handleDeleteSection = async (id: number) => {
        try { await api.delete(`/bio-builder/sections/${id}`); fetchBuilderData(); }
        catch { showModal("error", "Error", "Failed to delete section."); }
    };

    const handleAddBlock = async (sectionId: number, type: string) => {
        if (!profile) return;
        const defaultItems = type.includes('media') ? [{ image_url: '' }] : [{ title: 'New Item', url: 'https://', description: '', button_text: 'Visit Now' }];
        try { await api.post("/bio-builder/blocks", { profile_id: profile.id, section_id: sectionId, type, items: defaultItems }); fetchBuilderData(); setShowAddBlock(false); }
        catch { showModal("error", "Error", "Failed to add block."); }
    };

    const handleDeleteBlock = async (id: number) => {
        try { await api.delete(`/bio-builder/blocks/${id}`); fetchBuilderData(); }
        catch { showModal("error", "Error", "Failed to delete block."); }
    };

    const handleUploadImage = async (file: File) => {
        try {
            const fd = new FormData(); fd.append("image", file);
            const res = await api.post("/bio-builder/upload-image", fd, { headers: { "Content-Type": "multipart/form-data" } });
            return res.data?.url;
        } catch { showModal("error", "Error", "Failed to upload image."); return null; }
    };

    const openEditor = (block: any) => { setEditingBlock({ ...block, items: block.items || block.content?.items || [] }); setShowCarouselEditor(true); };

    const saveEditor = async () => {
        if (!editingBlock) return;
        try { await api.put(`/bio-builder/blocks/${editingBlock.id}`, { type: editingBlock.type, items: editingBlock.items || [] }); fetchBuilderData(); setShowCarouselEditor(false); }
        catch { showModal("error", "Error", "Failed to save block."); }
    };

    const updateItem = (idx: number, field: string, value: any) => { if (!editingBlock) return; const items = [...(editingBlock.items || [])]; items[idx] = { ...items[idx], [field]: value }; setEditingBlock({ ...editingBlock, items }); };

    const handleReorderSections = async (fromIdx: number, toIdx: number) => {
        if (!currentTab?.sections) return;
        const newSections = [...currentTab.sections];
        const [moved] = newSections.splice(fromIdx, 1);
        newSections.splice(toIdx, 0, moved);
        setTabs(tabs.map(t => t.id === currentTab.id ? { ...t, sections: newSections } : t));
        try { await api.post("/bio-builder/reorder-sections", { tab_id: currentTab.id, section_ids: newSections.map(s => s.id) }); }
        catch { fetchBuilderData(); }
    };

    const handleShareLink = () => { navigator.clipboard.writeText(publicUrl); setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); };

    if (!selectedPageId) return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex items-center justify-center p-6">
            <div className="max-w-md w-full text-center space-y-6">
                <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto text-rose-500 shadow-inner"><Monitor size={40} /></div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Deployment Required</h2>
                <p className="text-slate-500 font-medium">Please connect your Instagram account first to unlock the Creator Studio.</p>
                <button onClick={() => window.location.href='/dashboard/instagram/connect'} className="h-14 px-10 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-xs hover:scale-105 transition-all">Connect Now</button>
            </div>
        </div>
    );

    const PHASES = [
        { id: "identity", label: "1. Info", desc: "Name & Bio" },
        { id: "blocks", label: "2. Content", desc: "Links & Photos" },
        { id: "visuals", label: "3. Style", desc: "Colors & Design" },
        { id: "advanced", label: "4. Growth", desc: "Launch Gear" }
    ];

    return (
        <div className="min-h-screen bg-white dark:bg-[#020617] font-sans selection:bg-rose-500/10 flex flex-col relative">
            
            {/* ── PINK AMBIENT GLOW ── */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-rose-500/5 blur-[120px] rounded-full" />
                <div className="absolute bottom-0 left-0 w-[30%] h-[30%] bg-pink-500/5 blur-[100px] rounded-full" />
            </div>

            {/* ── STABLE TOP BAR ── */}
            <header className="relative z-50 h-14 flex items-center justify-between px-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-rose-500 flex items-center justify-center text-white shadow-lg">
                        <Sparkles size={16} />
                    </div>
                    <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Creator Studio</span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden md:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        {accounts.map(a => (
                            <button key={a.id} onClick={() => setSelectedPageId(a.id.toString())}
                                className={cn("px-4 py-1.5 rounded-md text-[10px] font-black tracking-tight transition-all",
                                    selectedPageId === a.id.toString() ? "bg-white dark:bg-slate-700 text-rose-500 shadow-sm" : "text-slate-400 hover:text-slate-600")}>
                                @{a.username}
                            </button>
                        ))}
                    </div>
                    <button onClick={handleShareLink} className="h-8 px-4 rounded-lg bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-rose-600 transition-all shadow-md">
                        {copiedLink ? <CheckCircle2 size={14} /> : <Share2 size={14} />}
                        {copiedLink ? "COPIED" : "SHARE"}
                    </button>
                </div>
            </header>

            {/* ── CREATOR WORKSPACE ── */}
            <div className="relative flex-1 flex overflow-hidden">
                
                <main className="flex-1 overflow-y-auto no-scrollbar relative z-10">
                    <div className="max-w-4xl mx-auto px-6 py-8">
                        
                        {/* ── SIMPLE PROGRESS MAP ── */}
                        <div className="mb-10 flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-2xl border border-slate-100 dark:border-slate-800">
                            {PHASES.map((p, idx) => (
                                <button key={p.id} onClick={() => setView(p.id)}
                                    className="flex-1 group relative outline-none">
                                    <div className={cn("flex flex-col items-center py-4 rounded-xl transition-all duration-300", 
                                        view === p.id ? "bg-white dark:bg-slate-800 text-rose-500 shadow-md scale-[1.02]" : "text-slate-400 hover:bg-white/50 dark:hover:bg-slate-800/20")}>
                                        <span className="text-[11px] font-black uppercase tracking-[0.2em]">{p.label}</span>
                                        <span className="text-[9px] font-bold opacity-60 mt-1">{p.desc}</span>
                                        {view === p.id && <div className="absolute -bottom-1 w-12 h-1 bg-rose-500 rounded-full" />}
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* ── PHASE CONTENT AREA ── */}
                        <AnimatePresence mode="wait">
                            <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }}>
                                
                                <div className="mb-8">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-1 capitalize">
                                        {view ==='identity' ? "Setup your Profile" : view === 'blocks' ? "Build your Content" : view === 'visuals' ? 'Style your Page' : 'Launch Preparation'}
                                    </h2>
                                    <p className="text-sm text-slate-500 font-medium">Follow the steps below to complete this phase.</p>
                                </div>

                                {view === "identity" && (
                                    <div className="space-y-6">
                                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                                            <div className="flex items-center gap-8 mb-10 pb-10 border-b border-slate-100 dark:border-slate-800">
                                                <label className="relative cursor-pointer shrink-0">
                                                    <div className="w-24 h-24 rounded-full bg-slate-50 dark:bg-slate-800 overflow-hidden ring-4 ring-rose-500/5 shadow-inner border-2 border-slate-100 dark:border-slate-700">
                                                        {profile?.avatar ? <img src={profile.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><User size={32} /></div>}
                                                        <div className="absolute inset-0 bg-rose-500/20 opacity-0 hover:opacity-100 flex items-center justify-center transition-all">
                                                            <Upload size={20} className="text-white" />
                                                        </div>
                                                    </div>
                                                    <input type="file" className="hidden" onChange={async e => { if (e.target.files?.[0]) { const url = await handleUploadImage(e.target.files[0]); if (url) handleUpdateProfile({ avatar: url }); } }} />
                                                </label>
                                                <div>
                                                    <h3 className="text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1">Your Profile Photo</h3>
                                                    <p className="text-[12px] text-slate-400 font-medium">Click the circle to upload your logo or face shot.</p>
                                                </div>
                                            </div>
                                            <div className="grid gap-6">
                                                <InputField label="Name or Brand Title" value={profile?.title || ""} onChange={(e: any) => setProfile({ ...profile!, title: e.target.value })} 
                                                    onBlur={(e: any) => handleUpdateProfile({ title: e.target.value })} placeholder="e.g. My Awesome Studio" />
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Short Biography</label>
                                                    <textarea value={profile?.bio || ""} onChange={e => setProfile({ ...profile!, bio: e.target.value })} 
                                                        onBlur={e => handleUpdateProfile({ bio: e.target.value })} rows={3}
                                                        className="w-full px-5 py-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-rose-500/20 text-sm font-medium text-slate-900 dark:text-white outline-none resize-none transition-all" 
                                                        placeholder="Write a few lines about what you do..." />
                                                </div>
                                                <div className="flex justify-end pt-4">
                                                    <button onClick={() => setView('blocks')} className="h-11 px-8 rounded-xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-800 transition-all">
                                                        Next: Add Content <ArrowRight size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {view === "blocks" && (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2 bg-slate-200/50 dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
                                            {tabs.map((tab) => (
                                                <button key={tab.id} onClick={() => setSelectedTabId(tab.id)}
                                                    className={cn("h-10 px-6 rounded-lg text-[11px] font-bold tracking-tight transition-all relative flex-1 max-w-[160px]",
                                                        selectedTabId === tab.id ? "text-slate-900 dark:text-white" : "text-slate-400")}>
                                                    {selectedTabId === tab.id && <motion.div layoutId="tab-pill" className="absolute inset-0 bg-white dark:bg-slate-800 rounded-md shadow-sm" />}
                                                    <span className="relative z-10">{tab.title}</span>
                                                </button>
                                            ))}
                                            <button onClick={() => setShowAddTab(true)} className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white flex items-center justify-center hover:bg-slate-50 border border-slate-100 dark:border-slate-700 ml-auto transition-all"><Plus size={18} /></button>
                                        </div>

                                        <div className="space-y-6">
                                            {(!currentTab || !currentTab.sections || currentTab.sections.length === 0) ? (
                                                <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center">
                                                    <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-500/5 flex items-center justify-center text-rose-500 mb-6">
                                                        <Layers size={28} />
                                                    </div>
                                                    <h3 className="text-xl font-black text-slate-950 dark:text-white mb-2 tracking-tight">Ready to Start?</h3>
                                                    <p className="text-[13px] text-slate-400 mb-8 max-w-xs mx-auto font-medium">Add your first section to organize your links and content.</p>
                                                    <button onClick={() => !currentTab ? setShowAddTab(true) : setShowAddSection(true)} 
                                                        className="h-12 px-10 rounded-xl bg-rose-500 text-white text-[11px] font-black uppercase tracking-widest shadow-xl shadow-rose-500/20 active:scale-95 transition-all animate-bounce">
                                                        Deploy First Content Section
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    {currentTab.sections.map((sec, sidx) => (
                                                        <SectionCard key={sec.id} section={sec} sidx={sidx} sectionsLength={currentTab.sections.length}
                                                            isArranging={isArranging} onReorder={handleReorderSections}
                                                            onDeleteSection={handleDeleteSection} onDeleteBlock={handleDeleteBlock}
                                                            onOpenEditor={openEditor}
                                                            onAddBlock={(secId: number) => { setTargetSectionId(secId); setShowAddBlock(true); }} />
                                                    ))}
                                                    <div className="flex items-center gap-4">
                                                        <button onClick={() => setShowAddSection(true)} 
                                                            className="flex-1 h-16 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center gap-3 text-slate-400 hover:border-rose-500/50 hover:text-rose-500 transition-all text-[11px] font-black uppercase tracking-widest group">
                                                            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                                                            Add New Category Section
                                                        </button>
                                                        <button onClick={() => setView('visuals')} className="h-16 px-8 rounded-2xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest flex items-center gap-2">
                                                            Next: Style <ArrowRight size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {view === "visuals" && <VisualsLab profile={profile} updateProfile={handleUpdateProfile} />}

                                {view === "advanced" && (
                                    <div className="max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                                        <h3 className="text-[13px] font-black text-slate-950 dark:text-white uppercase tracking-tight mb-8">Growth Engine & Domain</h3>
                                        <div className="space-y-4">
                                            {[
                                                { label: "Search Engine Optimization", desc: "Manage Google visibility", icon: <Search size={20} /> },
                                                { label: "Custom Domain Mapping", desc: "Connect your personal .com", icon: <LinkIcon size={20} /> },
                                                { label: "Growth Analytics", desc: "Visitor telemetry & insights", icon: <CheckCircle2 size={20} /> },
                                            ].map((item, i) => (
                                                <div key={i} className="flex items-center justify-between p-5 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-rose-500/30 transition-all group cursor-pointer shadow-sm">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-rose-500 group-hover:bg-rose-500 group-hover:text-white transition-all">{item.icon}</div>
                                                        <div>
                                                            <p className="text-sm font-black text-slate-900 dark:text-white mb-0.5">{item.label}</p>
                                                            <p className="text-[12px] text-slate-400 font-medium">{item.desc}</p>
                                                        </div>
                                                    </div>
                                                    <ChevronRight size={18} className="text-slate-300 group-hover:translate-x-1 transition-all" />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>

                {/* ── PHONE PREVIEW PORTAL (PERMANENTLY VISIBLE ON XL) ── */}
                <aside className={cn("relative z-50 w-[440px] hidden xl:flex flex-col p-8 bg-slate-50 dark:bg-[#020617] border-l border-slate-200 dark:border-slate-800 transition-all duration-500", 
                    activePanel === "preview" ? "translate-x-0 opacity-100" : "translate-x-0 opacity-100")}>
                    <div className="flex-1 flex flex-col gap-8">
                        <div className="flex items-center justify-between">
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Live Preview</h3>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Realtime Sync</span>
                            </div>
                        </div>
                        
                        <div className="flex-1 flex items-center justify-center">
                            <PhonePreview profile={profile} tabs={tabs} selectedTabId={selectedTabId} 
                                setSelectedTabId={setSelectedTabId} instagramUsername={instagramUsername} />
                        </div>
                        
                        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-[10px] font-black text-rose-500 uppercase tracking-tight">Public URL</span>
                                <button onClick={handleShareLink} className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase">Copy URL</button>
                            </div>
                            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-[13px] font-medium text-slate-600 dark:text-slate-300 truncate">
                                {publicUrl}
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* ── MOBILE SWITCHER ── */}
            <div className="xl:hidden fixed bottom-6 left-6 right-6 z-[200] h-16 bg-slate-950/90 backdrop-blur-xl rounded-2xl flex p-1.5 shadow-2xl">
                <button onClick={() => setActivePanel('builder')} className={cn("flex-1 rounded-xl flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all", activePanel === 'builder' ? 'bg-white text-slate-950 shadow-lg' : 'text-white/40')}>
                    <Edit3 size={16} /> Studio
                </button>
                <button onClick={() => setActivePanel('preview')} className={cn("flex-1 rounded-xl flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all", activePanel === 'preview' ? 'bg-white text-slate-950 shadow-lg' : 'text-white/40')}>
                    <Eye size={16} /> Portal
                </button>
            </div>

            {/* MODALS */}
            <ModalShell open={showAddTab} onClose={() => setShowAddTab(false)} title="Add a New Page Tab" icon={<Plus size={20} />} 
                footer={<button onClick={handleAddTab} className="w-full h-14 rounded-2xl bg-rose-500 text-white font-black uppercase tracking-widest text-[12px] shadow-xl">Create Tab</button>}>
                <InputField label="Tab Name" value={newTabTitle} onChange={(e: any) => setNewTabTitle(e.target.value)} placeholder="e.g. Links" />
            </ModalShell>

            <ModalShell open={showAddSection} onClose={() => setShowAddSection(false)} title="Create a Category" icon={<Layers size={20} />}
                footer={<button onClick={handleAddSection} className="w-full h-14 rounded-2xl bg-rose-500 text-white font-black uppercase tracking-widest text-[12px] shadow-xl">Add Category</button>}>
                <InputField label="Category Title" value={newSectionTitle} onChange={(e: any) => setNewSectionTitle(e.target.value)} placeholder="e.g. Latest Links" />
            </ModalShell>

            <ModalShell open={showAddBlock} onClose={() => setShowAddBlock(false)} title="Module Marketplace" icon={<Grid size={20} />}>
                <div className="space-y-10">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input type="text" placeholder="Search for links, videos, stores..." 
                            className="w-full h-14 pl-12 pr-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-rose-500/20 text-sm font-medium outline-none transition-all shadow-inner" />
                    </div>
                    {Object.entries(blockCategories).map(([cat, types]) => (
                        <div key={cat} className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">{cat} Library</h4>
                                <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                {types.map((t: any) => (
                                    <button key={t.type} onClick={() => handleAddBlock(targetSectionId!, t.type)}
                                        className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:border-rose-500 hover:shadow-xl hover:translate-y-[-2px] transition-all flex items-center gap-4 group/btn text-left shadow-sm">
                                        <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover/btn:text-rose-500 group-hover/btn:bg-rose-500/10 transition-all">
                                            {BLOCK_ICONS[t.type] || <LayoutTemplate size={20} />}
                                        </div>
                                        <div>
                                            <p className="text-[12px] font-black uppercase tracking-tight text-slate-900 dark:text-white">{t.label}</p>
                                            <p className="text-[10px] text-slate-400 font-bold mt-0.5">Ready to use</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </ModalShell>

            <ModalShell open={showCarouselEditor && !!editingBlock} onClose={() => setShowCarouselEditor(false)}
                title={`Edit ${editingBlock?.type?.replace(/_/g, " ") || "Block"}`}
                icon={editingBlock && (BLOCK_ICONS[editingBlock.type] || <LayoutTemplate size={20} />)}
                footer={<button onClick={saveEditor} className="w-full h-14 rounded-2xl bg-rose-500 text-white font-black uppercase tracking-widest text-[12px] shadow-xl">Save Changes</button>}>
                {editingBlock && (
                    <div className="space-y-6">
                        {(editingBlock.items || []).map((item: any, idx: number) => (
                            <div key={idx} className="p-6 rounded-[32px] bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 space-y-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">Instance #{idx + 1}</span>
                                    <button onClick={() => { const items = editingBlock.items.filter((_: any, i: number) => i !== idx); setEditingBlock({ ...editingBlock, items }); }} className="text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16} /></button>
                                </div>
                                <InputField label="Interaction Text" value={item.title || ""} onChange={(e: any) => updateItem(idx, 'title', e.target.value)} placeholder="Button Label" />
                                <InputField label="Endpoint URL" value={item.url || ""} onChange={(e: any) => updateItem(idx, 'url', e.target.value)} placeholder="https://..." />
                                <div className="flex items-center gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                                    <label className="flex-1 flex items-center gap-3 cursor-pointer group">
                                        <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 overflow-hidden flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                                            {item.image_url ? <img src={item.image_url} className="w-full h-full object-cover" /> : <ImageIcon size={20} className="text-slate-300" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-[11px] font-black uppercase tracking-widest text-slate-900 dark:text-white">Media Link</p>
                                            <p className="text-[10px] font-bold text-slate-400 tracking-tight">Tap to upload visual asset</p>
                                        </div>
                                        <input type="file" className="hidden" onChange={async e => { if (e.target.files?.[0]) { const url = await handleUploadImage(e.target.files[0]); if (url) updateItem(idx, 'image_url', url); } }} />
                                    </label>
                                </div>
                            </div>
                        ))}
                        <button onClick={() => setEditingBlock({ ...editingBlock, items: [...(editingBlock.items || []), { title: 'New Item', url: 'https://' }] })}
                            className="w-full h-14 rounded-2xl border-2 border-dashed border-rose-500/20 text-rose-500 hover:bg-rose-500 hover:text-white transition-all font-black text-xs uppercase tracking-widest">Add New Item</button>
                    </div>
                )}
            </ModalShell>
        </div>
    );
}