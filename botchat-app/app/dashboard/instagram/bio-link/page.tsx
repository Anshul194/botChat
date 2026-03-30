"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Plus, Trash2, Edit3, Save, Loader2, Link as LinkIcon,
    Image as ImageIcon, GripVertical, RefreshCw, LayoutTemplate,
    Search, Upload, Wand2, ArrowRight, CheckCircle2, X, Eye, Share2, Grid, User,
    Layers, Video, Youtube, MonitorPlay, Smartphone, Monitor, Hexagon, ShoppingBag, SmartphoneNfc
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { useModal } from "@/components/providers/ModalProvider";
import { cn } from "@/lib/utils";

interface BioProfile {
    id: number;
    title: string;
    bio: string;
    avatar: string;
    email_link: string;
    contact_link: string;
    theme: string;
}

interface BioTab {
    id: number;
    title: string;
    is_active: number;
    sections: BioSection[];
}

interface BioSection {
    id: number;
    tab_id: number;
    title: string;
    type: string;
    is_active: number;
    blocks: BioBlock[];
}

interface BioBlock {
    id: number;
    section_id: number;
    type: string;
    is_active: number;
    items: any[];
}

const CarouselBlock = ({ items }: { items: any[] }) => {
    const scrollRef = React.useRef<HTMLDivElement>(null);

    React.useEffect(() => {
        if (!scrollRef.current || items.length < 2) return;
        let direction = 1;
        const interval = setInterval(() => {
            const el = scrollRef.current;
            if (el) {
                const maxScroll = el.scrollWidth - el.clientWidth;
                let nextScroll = el.scrollLeft + (240 + 16) * direction;
                if (nextScroll >= maxScroll) { direction = -1; nextScroll = maxScroll; }
                if (nextScroll <= 0) { direction = 1; nextScroll = 0; }
                el.scrollTo({ left: nextScroll, behavior: 'smooth' });
            }
        }, 2500);
        return () => clearInterval(interval);
    }, [items.length]);

    return (
        <div ref={scrollRef} className="w-[105%] -ml-[2.5%] flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory py-4 px-6 relative scroll-smooth">
            {items.map((item: any, idx: number) => (
                <a key={idx} href={item.url || "#"} target="_blank" className="flex-shrink-0 w-[220px] bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)] snap-center border border-[#f1f3f5] flex flex-col group transition-all duration-300 hover:-translate-y-1 relative">
                    <div className="w-full h-32 bg-slate-100 relative overflow-hidden flex-shrink-0">
                        {item.image_url ? (
                            <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-300"><ImageIcon size={24} className="opacity-50" /></div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>

                    <div className="p-5 flex flex-col flex-1 bg-white relative z-10">
                        <h4 className="font-bold text-[15px] text-[#111] leading-tight mb-2 group-hover:text-[#db2777] transition-colors">{item.title || "Link Title"}</h4>
                        {(item.description || item.url) && (
                            <p className="text-[12px] text-slate-500 line-clamp-2 leading-relaxed mb-4">{item.description || item.url}</p>
                        )}

                        <div className="mt-auto pt-3 border-t border-slate-50 flex items-center justify-between">
                            <span className="text-[#db2777] text-[12px] font-bold flex items-center gap-1.5 group-hover:gap-2 transition-all">
                                {item.button_text || "Visit Link"} <ArrowRight size={12} />
                            </span>
                        </div>
                    </div>
                </a>
            ))}
        </div>
    );
};const getBlockIcon = (type: string) => {
    switch (type) {
        case 'links_carousel': return <Layers />;
        case 'hero_single_link': return <LinkIcon />;
        case 'links_grid': return <Grid />;
        case 'ig_reels_sync':
        case 'ig_reels': return <Video />;
        case 'youtube_shorts': return <Youtube />;
        case 'long_form_videos':
        case 'long_video': return <MonitorPlay />;
        case 'vertical_media': return <Smartphone />;
        case 'square_media': return <ImageIcon />;
        case 'horizontal_media': return <Monitor />;
        case 'add_logos': return <Hexagon />;
        case 'add_products': return <ShoppingBag />;
        case 'add_apps': return <SmartphoneNfc />;
        default: return <LayoutTemplate />;
    }
};

export default function BioLinkBuilder() {
    const { showModal, showConfirm } = useModal();
    const [isLoading, setIsLoading] = useState(true);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
    const [blockCategories, setBlockCategories] = useState<{ [category: string]: any[] }>({});

    // Data State
    const [profile, setProfile] = useState<BioProfile | null>(null);
    const [tabs, setTabs] = useState<BioTab[]>([]);
    const [selectedTabId, setSelectedTabId] = useState<number | null>(null);

    // Creation Modal Setup
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [createForm, setCreateForm] = useState({ title: "", username: "" });

    // Edit Profile Modal Setup
    const [showEditProfileModal, setShowEditProfileModal] = useState(false);
    const [editProfileForm, setEditProfileForm] = useState<Partial<BioProfile>>({});

    // Add Tab Modal Setup
    const [showAddTabModal, setShowAddTabModal] = useState(false);
    const [newTabTitle, setNewTabTitle] = useState("");

    // Add Section Modal Setup
    const [showAddSectionModal, setShowAddSectionModal] = useState(false);
    const [newSectionTitle, setNewSectionTitle] = useState("");

    // Add Block Modal Setup
    const [showAddBlockModal, setShowAddBlockModal] = useState(false);
    const [targetSectionId, setTargetSectionId] = useState<number | null>(null);

    // Carousel Editor Setup
    const [showCarouselEditorModal, setShowCarouselEditorModal] = useState(false);
    const [editingCarouselBlock, setEditingCarouselBlock] = useState<any>(null);

    const handleOpenCarouselEditor = (block: any) => {
        const items = block.items || block.content?.items || [];
        setEditingCarouselBlock({ ...block, items });
        setShowCarouselEditorModal(true);
    };

    const handleSaveCarouselEditor = async () => {
        if (!editingCarouselBlock) return;
        try {
            await api.put(`/bio-builder/blocks/${editingCarouselBlock.id}`, {
                type: editingCarouselBlock.type,
                items: editingCarouselBlock.items || []
            });
            fetchBuilderData();
            setShowCarouselEditorModal(false);
        } catch (err) {
            showModal("error", "Error", "Failed to save block data.");
        }
    };

    const updateCarouselItem = (idx: number, field: string, value: string) => {
        const updated = { ...editingCarouselBlock };
        if (!updated.items) updated.items = [];
        if (!updated.items[idx]) updated.items[idx] = {};
        updated.items[idx][field] = value;
        setEditingCarouselBlock(updated);
    };

    // Load Accounts
    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const response = await api.get("/social/instagram-connect");
                if (response.data?.data?.instagram_accounts) {
                    const accs = response.data.data.instagram_accounts;
                    setAccounts(accs);
                    if (accs.length > 0) {
                        setSelectedPageId(accs[0].id.toString());
                    }
                }
            } catch (err) {
                console.error("Failed to fetch accounts", err);
            }
        };

        const fetchBlockCategories = async () => {
            try {
                const response = await api.get("/bio-builder/block-types");
                if (response.data?.success && response.data?.data) {
                    setBlockCategories(response.data.data);
                }
            } catch (err) {
                console.error("Failed to fetch block types", err);
            }
        };

        fetchAccounts();
        fetchBlockCategories();
    }, []);

    // 15. GET /api/v1/bio-builder?page={{PAGE_ID}}
    const fetchBuilderData = useCallback(async () => {
        if (!selectedPageId) return;
        setIsLoading(true);
        try {
            const res = await api.get(`/bio-builder?page=${selectedPageId}`);
            const payload = res.data?.data || res.data;

            // If the payload itself is the profile
            if (payload && payload.id) {
                setProfile(payload);
                setTabs(payload.tabs || []);
                if (payload.tabs && payload.tabs.length > 0 && !selectedTabId) {
                    setSelectedTabId(payload.tabs[0].id);
                }
            } else if (payload && payload.profile) {
                // Just in case it's wrapped in a profile property later
                setProfile(payload.profile);
                setTabs(payload.tabs || []);
                if (payload.tabs && payload.tabs.length > 0 && !selectedTabId) {
                    setSelectedTabId(payload.tabs[0].id);
                }
            } else {
                setProfile(null);
                setTabs([]);
                setSelectedTabId(null);
            }
        } catch (err) {
            console.error("Failed to load builder data", err);
            setProfile(null);
            setTabs([]);
            setSelectedTabId(null);
        } finally {
            setIsLoading(false);
        }
    }, [selectedPageId]);

    useEffect(() => {
        fetchBuilderData();
    }, [fetchBuilderData]);

    // 16. PUT /api/v1/bio-builder/profile/{{BIO_PROFILE_ID}}
    const handleUpdateProfile = async (updates: Partial<BioProfile>) => {
        if (!profile) return;
        try {
            await api.put(`/bio-builder/profile/${profile.id}`, updates);
            setProfile({ ...profile, ...updates });
        } catch (err) {
            showModal("error", "Error", "Failed to update profile.");
        }
    };

    // 9. POST /api/v1/bio-builder/tabs
    const handleAddTab = async () => {
        if (!profile || !newTabTitle.trim()) return;
        try {
            await api.post("/bio-builder/tabs", {
                profile_id: profile.id,
                title: newTabTitle
            });
            setShowAddTabModal(false);
            setNewTabTitle("");
            fetchBuilderData();
        } catch (err) {
            showModal("error", "Error", "Failed to add tab.");
        }
    };

    // 11. DELETE /api/v1/bio-builder/tabs/{{BIO_TAB_ID}}
    const handleDeleteTab = async (tabId: number) => {
        try {
            await api.delete(`/bio-builder/tabs/${tabId}`);
            if (selectedTabId === tabId) setSelectedTabId(null);
            fetchBuilderData();
        } catch (err) {
            showModal("error", "Error", "Failed to delete tab.");
        }
    };

    // 5. POST /api/v1/bio-builder/sections
    const handleAddSection = async () => {
        if (!profile || !currentTab || !newSectionTitle.trim()) return;
        try {
            await api.post("/bio-builder/sections", {
                profile_id: profile.id,
                tab_id: currentTab.id,
                title: newSectionTitle,
                type: "links"
            });
            setShowAddSectionModal(false);
            setNewSectionTitle("");
            fetchBuilderData();
        } catch (err) {
            showModal("error", "Error", "Failed to add section.");
        }
    };

    // 7. DELETE /api/v1/bio-builder/sections/{{BIO_SECTION_ID}}
    const handleDeleteSection = async (sectionId: number) => {
        try {
            await api.delete(`/bio-builder/sections/${sectionId}`);
            fetchBuilderData();
        } catch (err) {
            showModal("error", "Error", "Failed to delete section.");
        }
    };

    // 1. POST /api/v1/bio-builder/blocks
    const handleAddBlock = async (sectionId: number, type: string) => {
        if (!profile) return;
        let items: any[] = [];
        if (type === "social") {
            items = [{ platform: "facebook", url: "https://" }];
        } else if (type === "links_carousel") {
            items = [
                { title: "My First Link", url: "https://", description: "This is a great link to click.", button_text: "Visit Now", image_url: "" },
                { title: "Another Link", url: "https://", description: "You might also like this one.", button_text: "Read More", image_url: "" }
            ];
        } else if (type === "hero_single_link") {
            items = [
                { title: "Featured Product", url: "https://", description: "Check out our latest release.", button_text: "Shop Now", image_url: "" }
            ];
        } else if (type === "links_grid") {
            items = [
                { title: "Store", url: "https://", description: "", button_text: "", image_url: "" },
                { title: "Blog", url: "https://", description: "", button_text: "", image_url: "" }
            ];
        } else if (type === "add_products") {
            items = [
                { title: "Awesome Product", url: "https://", description: "$49.99", button_text: "Buy Now", image_url: "" }
            ];
        } else if (type === "add_apps") {
            items = [
                { title: "My App Space", url: "https://", description: "Utilities", button_text: "GET", image_url: "" }
            ];
        } else {
            items = [{ label: "New Link", url: "https://" }];
        }

        try {
            await api.post("/bio-builder/blocks", {
                profile_id: profile.id,
                section_id: sectionId,
                type: type,
                items: items
            });
            fetchBuilderData();
        } catch (err) {
            showModal("error", "Error", "Failed to add block.");
        }
    };

    // 3. DELETE /api/v1/bio-builder/blocks/{{BIO_BLOCK_ID}}
    const handleDeleteBlock = async (blockId: number) => {
        try {
            await api.delete(`/bio-builder/blocks/${blockId}`);
            fetchBuilderData();
        } catch (err) {
            showModal("error", "Error", "Failed to delete block.");
        }
    };

    // 14. POST /api/v1/bio-builder/upload-image
    const handleUploadImage = async (file: File) => {
        try {
            const formData = new FormData();
            formData.append("image", file);
            const res = await api.post("/bio-builder/upload-image", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            return res.data?.url;
        } catch (err) {
            showModal("error", "Error", "Failed to upload image.");
            return null;
        }
    };

    // Handle Create Profile
    const handleCreateProfile = async () => {
        if (!selectedPageId) return showModal("error", "Error", "Please select a page first");
        if (!createForm.title.trim()) return showModal("error", "Validation", "Title is required");

        setIsCreating(true);
        try {
            await api.post(`/bio-builder/profile`, {
                facebook_page_id: selectedPageId,
                title: createForm.title,
                theme: "classic"
            });
            setShowCreateModal(false);
            fetchBuilderData();
        } catch (err) {
            showModal("error", "Error", "Failed to initialize portfolio. Check API parameters.");
        } finally {
            setIsCreating(false);
        }
    };

    // Arrange Mode
    const [isArranging, setIsArranging] = useState(false);

    // Reorder Helpers
    const reorderInArray = <T extends { id: number }>(arr: T[], from: number, to: number) => {
        const result = Array.from(arr);
        const [removed] = result.splice(from, 1);
        result.splice(to, 0, removed);
        return result;
    };

    // 17. POST /api/v1/bio-builder/tabs/reorder
    const handleReorderTabs = async (fromIdx: number, toIdx: number) => {
        if (!tabs || toIdx < 0 || toIdx >= tabs.length) return;
        const newTabs = reorderInArray(tabs, fromIdx, toIdx);
        setTabs(newTabs); // Optimistic Update
        try {
            await api.post("/bio-builder/tabs/reorder", {
                ids: newTabs.map(t => t.id)
            });
        } catch (err) {
            showModal("error", "Error", "Failed to reorder tabs.");
            fetchBuilderData(); // Rollback
        }
    };

    // 18. POST /api/v1/bio-builder/sections/reorder
    const handleReorderSections = async (fromIdx: number, toIdx: number) => {
        if (!currentTab?.sections || toIdx < 0 || toIdx >= currentTab.sections.length) return;
        const newSections = reorderInArray(currentTab.sections, fromIdx, toIdx);

        // Update local state nested structure
        const updatedTabs = tabs.map(t => t.id === currentTab.id ? { ...t, sections: newSections } : t);
        setTabs(updatedTabs);

        try {
            await api.post("/bio-builder/sections/reorder", {
                ids: newSections.map(s => s.id)
            });
        } catch (err) {
            showModal("error", "Error", "Failed to reorder sections.");
            fetchBuilderData(); // Rollback
        }
    };

    // 19. POST /api/v1/bio-builder/blocks/reorder
    const handleReorderBlocks = async (sectionId: number, fromIdx: number, toIdx: number) => {
        const section = currentTab?.sections.find(s => s.id === sectionId);
        if (!section || !section.blocks || toIdx < 0 || toIdx >= section.blocks.length) return;

        const newBlocks = reorderInArray(section.blocks, fromIdx, toIdx);

        // Update local state deep nested structure
        const updatedTabs = tabs.map(t => ({
            ...t,
            sections: t.sections.map(s => s.id === sectionId ? { ...s, blocks: newBlocks } : s)
        }));
        setTabs(updatedTabs);

        try {
            await api.post("/bio-builder/blocks/reorder", {
                ids: newBlocks.map(b => b.id)
            });
        } catch (err) {
            showModal("error", "Error", "Failed to reorder steps.");
            fetchBuilderData(); // Rollback
        }
    };
    const currentTab = tabs.find(t => t.id === selectedTabId) || tabs[0];
    const instagramUsername = accounts.find(a => String(a.id) === selectedPageId)?.username || "username";

    return (
        <div className="bg-[#F8F9FB] min-h-screen text-[#2D334A] font-sans selection:bg-[#db2777] selection:text-white">
            <header className="bg-white border-b border-[#EAEBEE] px-6 py-4 flex items-center justify-between sticky top-0 z-30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#db2777] to-[#f472b6] flex items-center justify-center text-white shadow-sm">
                        <LayoutTemplate className="w-5 h-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 leading-tight">Bio Page Builder</h1>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <select
                        value={selectedPageId || ""}
                        onChange={(e) => setSelectedPageId(e.target.value)}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-[#db2777] outline-none"
                    >
                        <option value="" disabled>Select Profile</option>
                        {accounts.map(acc => (
                            <option key={acc.id} value={acc.id}>@{acc.username}</option>
                        ))}
                    </select>
                    <button onClick={fetchBuilderData} className="p-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-500">
                        <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                    </button>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-8">
                {isLoading ? (
                    <div className="flex flex-1 justify-center items-center h-[60vh]"><Loader2 className="animate-spin w-8 h-8 text-[#db2777]" /></div>
                ) : !profile ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-16 bg-white rounded-[24px] border border-slate-100 shadow-sm text-center">
                        <div className="w-20 h-20 roundedfull bg-gradient-to-br from-[#db2777] to-[#f472b6] p-1 mb-6 shadow-xl shadow-[#db2777]/20">
                            <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                                <LayoutTemplate className="w-8 h-8 text-[#db2777]" />
                            </div>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 mb-3">Initialize Page</h2>
                        <p className="text-slate-500 font-medium text-[15px] max-w-sm mb-8">Set up your bio link builder to start creating your portfolio.</p>
                        <button onClick={() => setShowCreateModal(true)} className="h-12 px-8 rounded-full bg-[#db2777] text-white font-bold text-sm tracking-wide shadow-xl shadow-[#db2777]/20 hover:bg-[#be185d] transition-all flex items-center gap-2">
                            <Wand2 className="w-4 h-4" /> Create Profile
                        </button>
                    </div>
                ) : (
                    <>
                        {/* LEFT COLUMN: Builder */}
                        <div className="flex-[1.5] bg-white rounded-[16px] border border-[#EAEBEE] shadow-sm relative overflow-hidden flex flex-col">
                            {/* Header / Tabs */}
                            <div className="px-8 py-5 border-b border-[#EAEBEE] flex items-center justify-between bg-white z-10">
                                <h2 className="font-bold text-[16px] text-[#2D334A]">Bio Page Builder</h2>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setShowAddTabModal(true)} className="w-8 h-8 rounded-full border border-[#D5D8DF] bg-white text-[#db2777] flex items-center justify-center hover:bg-slate-50 transition-colors">
                                        <Plus size={16} />
                                    </button>
                                    <button
                                        onClick={() => setIsArranging(!isArranging)}
                                        className={cn("h-8 px-4 border rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all",
                                            isArranging ? "bg-[#db2777] border-[#db2777] text-white" : "border-[#D5D8DF] bg-white text-[#6C768A] hover:bg-slate-50")}
                                    >
                                        <GripVertical size={12} className="opacity-50" /> {isArranging ? "Done" : "Arrange"}
                                    </button>
                                </div>
                            </div>

                            {tabs.length > 0 && (
                                <div className="px-8 py-2 border-b border-[#EAEBEE] flex gap-2 overflow-x-auto no-scrollbar items-center">
                                    {tabs.map((tab, idx) => (
                                        <motion.div layout key={tab.id} className="flex items-center gap-1 group/tabitem">
                                            {isArranging && idx > 0 && (
                                                <button onClick={() => handleReorderTabs(idx, idx - 1)} className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 hover:text-[#db2777] flex items-center justify-center transition-all opacity-0 group-hover/tabitem:opacity-100">
                                                    <ArrowRight size={10} className="rotate-180" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setSelectedTabId(tab.id)}
                                                className={cn("px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap",
                                                    selectedTabId === tab.id ? "bg-[#db2777] text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200")}
                                            >
                                                {tab.title}
                                                {!isArranging && selectedTabId === tab.id && tabs.length > 1 && (
                                                    <span onClick={(e) => { e.stopPropagation(); handleDeleteTab(tab.id); }} className="ml-2 py-0.5 px-1.5 bg-white/20 hover:bg-red-500 text-white rounded-full">×</span>
                                                )}
                                            </button>
                                            {isArranging && idx < tabs.length - 1 && (
                                                <button onClick={() => handleReorderTabs(idx, idx + 1)} className="w-5 h-5 rounded-full bg-slate-100 text-slate-400 hover:text-[#db2777] flex items-center justify-center transition-all opacity-0 group-hover/tabitem:opacity-100">
                                                    <ArrowRight size={10} />
                                                </button>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            )}

                            {/* Content */}
                            <div className="flex-1 overflow-y-auto p-12 bg-white flex flex-col items-center">

                                {/* Identity Block */}
                                <div className="flex flex-col items-center mb-10 group relative">
                                    <div className="w-24 h-24 rounded-full border border-slate-100 bg-[#F8F9FB] shadow-md relative mb-4 items-center justify-center flex overflow-hidden">
                                        {profile.avatar ? <img src={profile.avatar} className="w-full h-full object-cover" /> : <User className="w-8 h-8 text-slate-300" />}
                                        {/* Edit Avatar */}
                                        <label className="absolute bottom-0 right-[-4px] w-8 h-8 bg-[#1f2937] text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-black transition-colors border-2 border-white shadow-sm z-10 translate-x-[-15px] translate-y-[-5px]">
                                            <Edit3 size={12} />
                                            <input type="file" className="hidden" onChange={async (e) => {
                                                if (e.target.files?.[0]) {
                                                    const url = await handleUploadImage(e.target.files[0]);
                                                    if (url) handleUpdateProfile({ avatar: url });
                                                }
                                            }} />
                                        </label>
                                    </div>

                                    <div className="flex items-center gap-2 mb-1 group/title">
                                        <input
                                            value={profile.title || ""}
                                            onChange={(e) => setProfile({ ...profile, title: e.target.value })}
                                            onBlur={(e) => handleUpdateProfile({ title: e.target.value })}
                                            className="text-[22px] font-bold text-[#1f2937] text-center bg-transparent outline-none w-[180px] focus:bg-slate-50 rounded"
                                            placeholder="Your Name"
                                        />
                                    </div>
                                    <div className="flex items-center gap-1.5 text-[#6c7281] text-[13px] font-medium mb-4">
                                        <ImageIcon className="w-3.5 h-3.5" />
                                        <span>@{instagramUsername}</span>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (!profile) return;
                                            setEditProfileForm({ title: profile.title || "", bio: profile.bio || "", email_link: profile.email_link || "", contact_link: profile.contact_link || "" });
                                            setShowEditProfileModal(true);
                                        }}
                                        className="text-[#db2777] text-[13px] font-medium hover:underline flex items-center gap-1.5"
                                    >
                                        Edit Basic Details <Edit3 size={12} />
                                    </button>
                                </div>

                                {/* Primary Buttons */}
                                <div className="flex gap-4 w-full max-w-[500px] mb-12">
                                    <button
                                        onClick={() => {
                                            if (!profile) return;
                                            setEditProfileForm({ title: profile.title || "", bio: profile.bio || "", email_link: profile.email_link || "", contact_link: profile.contact_link || "" });
                                            setShowEditProfileModal(true);
                                        }}
                                        className="flex-1 h-14 rounded-xl bg-[#db2777] text-white text-[14px] font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#db2777]/20 transition-transform active:scale-95"
                                    >
                                        Email <Edit3 size={14} className="opacity-70" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (!profile) return;
                                            setEditProfileForm({ title: profile.title || "", bio: profile.bio || "", email_link: profile.email_link || "", contact_link: profile.contact_link || "" });
                                            setShowEditProfileModal(true);
                                        }}
                                        className="flex-1 h-14 rounded-xl bg-[#db2777] text-white text-[14px] font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[#db2777]/20 transition-transform active:scale-95"
                                    >
                                        Contact <Edit3 size={14} className="opacity-70" />
                                    </button>
                                </div>

                                {/* Sections List */}
                                <div className="w-full max-w-[500px]">
                                    <div className="flex items-center gap-4 mb-6">
                                        <span className="text-[11px] font-bold uppercase tracking-widest text-[#8890A5]">Sections</span>
                                        <button onClick={() => setShowAddSectionModal(true)} className="text-[#db2777] flex items-center gap-1.5 text-[12px] font-semibold hover:underline">
                                            <div className="w-4 h-4 rounded-full bg-[#db2777] text-white flex items-center justify-center"><Plus size={10} /></div> Add Section
                                        </button>
                                        <button className="text-[#6C768A] flex items-center gap-1 text-[12px] font-medium ml-2 border border-slate-200 px-2 py-0.5 rounded-md">
                                            <GripVertical size={10} /> Arrange
                                        </button>
                                    </div>

                                    {(!currentTab?.sections || currentTab.sections.length === 0) ? (
                                        <div className="flex flex-col items-center justify-center py-16 text-[#8890A5]">
                                            <Grid size={20} className="mb-3 opacity-50" />
                                            <p className="text-[13px] font-medium">No sections in this tab</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 w-full">
                                            {currentTab.sections.map((section, sidx) => (
                                                <motion.div layout key={section.id} className="bg-white border text-sm border-slate-200 rounded-2xl p-4 shadow-sm relative group w-full">
                                                    <div className="flex items-center justify-between mb-3 border-b border-slate-50 pb-3">
                                                        <div className="flex items-center gap-2">
                                                            {isArranging ? (
                                                                <div className="flex flex-col gap-0.5">
                                                                    <button onClick={() => handleReorderSections(sidx, sidx - 1)} disabled={sidx === 0} className="p-1 hover:text-[#db2777] disabled:opacity-30"><Layers size={12} className="rotate-180" /></button>
                                                                    <button onClick={() => handleReorderSections(sidx, sidx + 1)} disabled={sidx === currentTab.sections.length - 1} className="p-1 hover:text-[#db2777] disabled:opacity-30"><Layers size={12} /></button>
                                                                </div>
                                                            ) : (
                                                                <GripVertical className="w-4 h-4 text-slate-300" />
                                                            )}
                                                            <h4 className="font-bold text-slate-700">{section.title}</h4>
                                                        </div>
                                                        <button onClick={() => handleDeleteSection(section.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14} /></button>
                                                    </div>

                                                    {section.blocks?.length === 0 ? (
                                                        <p className="text-xs text-center text-slate-400 py-4 italic">Empty section</p>
                                                    ) : (
                                                        <div className="space-y-2">
                                                            {section.blocks?.map((block, bidx) => {
                                                                const isEditableLink = ['links_carousel', 'hero_single_link', 'links_grid', 'add_products', 'add_apps'].includes(block.type);
                                                                return (
                                                                    <motion.div layout key={block.id} onClick={() => { if (isEditableLink) handleOpenCarouselEditor(block) }} className={cn("bg-slate-50 px-3 py-2 rounded-lg flex items-center justify-between transition-colors", isEditableLink ? "cursor-pointer hover:border-[#db2777] border border-transparent shadow-sm" : "")}>
                                                                        <div className="flex items-center gap-2">
                                                                            {isArranging ? (
                                                                                <div className="flex flex-col gap-0.5 pr-2 border-r border-slate-200 mr-2">
                                                                                    <button onClick={(e) => { e.stopPropagation(); handleReorderBlocks(section.id, bidx, bidx - 1); }} disabled={bidx === 0} className="p-0.5 hover:text-[#db2777] disabled:opacity-10"><Wand2 size={10} className="rotate-180" /></button>
                                                                                    <button onClick={(e) => { e.stopPropagation(); handleReorderBlocks(section.id, bidx, bidx + 1); }} disabled={bidx === section.blocks.length - 1} className="p-0.5 hover:text-[#db2777] disabled:opacity-10"><Wand2 size={10} /></button>
                                                                                </div>
                                                                            ) : null}
                                                                            <span className="text-xs font-bold text-[#db2777] uppercase bg-[#db2777]/10 px-2 py-1 rounded inline-flex items-center gap-1">
                                                                                {block.type === 'links_carousel' && <Layers size={10} />}
                                                                                {block.type === 'hero_single_link' && <LinkIcon size={10} />}
                                                                                {block.type === 'links_grid' && <Grid size={10} />}
                                                                                {block.type === 'add_products' && <ShoppingBag size={10} />}
                                                                                {block.type === 'add_apps' && <SmartphoneNfc size={10} />}
                                                                                {block.type}
                                                                            </span>
                                                                            {isEditableLink && !isArranging && <span className="text-[10px] text-slate-400 font-medium">Click to edit items</span>}
                                                                        </div>
                                                                        {!isArranging && <button onClick={(e) => { e.stopPropagation(); handleDeleteBlock(block.id); }} className="text-slate-400 hover:text-red-500"><Trash2 size={14} /></button>}
                                                                    </motion.div>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}

                                    <div className="flex justify-center mt-16 mb-8 w-full">
                                        <button
                                            onClick={() => {
                                                if (currentTab?.sections && currentTab.sections.length > 0) {
                                                    setTargetSectionId(currentTab.sections[0].id);
                                                    setShowAddBlockModal(true);
                                                } else {
                                                    showModal("error", "Error", "Create a section first");
                                                }
                                            }}
                                            className="h-12 px-8 rounded-full bg-[#db2777] text-white font-semibold text-[13px] flex items-center gap-2 shadow-lg shadow-[#db2777]/30 hover:bg-[#be185d] transition-colors"
                                        >
                                            <Grid size={14} /> Add New Block
                                        </button>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* RIGHT COLUMN: Preview & Actions */}
                        <div className="flex-[1] flex flex-col items-center">
                            {/* Actions Top Bar */}                             <div className="flex items-center justify-center gap-3 w-full max-w-[400px] mb-8 bg-white py-3 rounded-[16px] shadow-sm border border-[#EAEBEE]">
                                <button className="h-9 px-4 rounded-full border border-[#D5D8DF] bg-white text-[#6C768A] text-xs font-semibold flex items-center gap-2 hover:bg-slate-50">
                                    <Eye size={14} /> Preview
                                </button>
                                <button
                                    onClick={() => setIsArranging(!isArranging)}
                                    className={cn("h-9 px-4 rounded-full border text-xs font-semibold flex items-center gap-2 transition-all",
                                        isArranging ? "bg-[#db2777] border-[#db2777] text-white" : "border-[#D5D8DF] bg-white text-[#6C768A] hover:bg-slate-50")}
                                >
                                    <GripVertical size={14} className="opacity-50" /> {isArranging ? "Finish" : "Arrange"}
                                </button>
                                <button className="h-9 px-5 rounded-full bg-[#db2777] text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-[#db2777]/20 hover:scale-105 transition-transform">
                                    <Share2 size={12} /> Share
                                </button>
                            </div>


                            {/* Mobile Mockup Form Factor */}
                            <div className="w-[360px] h-[720px] bg-[#333333] rounded-[48px] shadow-[0_30px_60px_rgba(0,0,0,0.1)] p-4 relative flex-shrink-0">

                                {/* Inner Screen */}
                                <div className="w-full h-full bg-[#FAFAFA] rounded-[36px] overflow-hidden relative border border-[#444]">

                                    {/* Notch */}
                                    <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
                                        <div className="w-32 h-6 bg-[#333333] rounded-b-3xl"></div>
                                    </div>

                                    {/* Preview Content Area */}
                                    <div className="w-full h-full overflow-y-auto pt-16 pb-12 px-6 flex flex-col items-center relative no-scrollbar">

                                        <div className="w-20 h-20 rounded-full border-2 border-white bg-slate-100 shadow-md flex items-center justify-center overflow-hidden mb-4">
                                            {profile.avatar ? <img src={profile.avatar} className="w-full h-full object-cover" /> : <User className="w-8 h-8 text-slate-300" />}
                                        </div>

                                        <h2 className="text-[20px] font-bold text-[#111] mb-1">{profile.title || "My Bio"}</h2>
                                        <p className="text-[12px] font-medium text-[#777] mb-8 flex items-center gap-1">
                                            <ImageIcon size={10} /> {instagramUsername}
                                        </p>

                                        {profile.bio && (
                                            <p className="text-[14px] text-[#444] text-center mb-6">{profile.bio}</p>
                                        )}

                                        {/* Mobile Preview Tabs */}
                                        {tabs && tabs.length > 1 && (
                                            <div className="w-full mb-6">
                                                <div className="w-full flex items-center gap-2 overflow-x-auto no-scrollbar p-1">
                                                    {tabs.map((tab) => (
                                                        <button
                                                            key={tab.id}
                                                            type="button"
                                                            onClick={(e) => { e.preventDefault(); setSelectedTabId(tab.id); }}
                                                            className={cn("flex-shrink-0 px-5 py-2 rounded-full text-[11px] font-bold transition-all whitespace-nowrap",
                                                                selectedTabId === tab.id ? "bg-[#db2777] text-white shadow-md shadow-[#db2777]/20" : "bg-white border border-[#eaeaea] text-slate-500 shadow-sm hover:bg-slate-50"
                                                            )}
                                                        >
                                                            {tab.title}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="w-full space-y-4">
                                            {currentTab?.sections?.map(section => (
                                                <div key={section.id} className="w-full space-y-3">
                                                    {section.title !== "New Section" && <h3 className="text-[10px] uppercase font-bold text-slate-400 px-2 tracking-widest">{section.title}</h3>}
                                                    {section.blocks?.map(block => {
                                                        if (block.type === 'links_carousel') {
                                                            const items = block.items || (block as any).content?.items || [];
                                                            return <CarouselBlock key={block.id} items={items} />;
                                                        }
                                                        if (block.type === 'hero_single_link') {
                                                            const items = block.items || (block as any).content?.items || [];
                                                            const item = items[0];
                                                            if (!item) return null;
                                                            return (
                                                                <a key={block.id} href={item.url || "#"} target="_blank" className="w-[100%] mx-auto bg-slate-900 rounded-[28px] overflow-hidden shadow-[0_12px_30px_rgb(0,0,0,0.12)] border border-[#f1f3f5] group transition-all duration-300 hover:-translate-y-1 relative mb-6 block h-[220px]">
                                                                    {item.image_url ? (
                                                                        <img src={item.image_url} className="w-full h-full object-cover absolute inset-0 group-hover:scale-105 transition-transform duration-700" />
                                                                    ) : (
                                                                        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 text-slate-400"><ImageIcon size={40} className="opacity-30" /></div>
                                                                    )}
                                                                    <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/40 to-black/80"></div>

                                                                    <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                                                        <h4 className="font-bold text-[20px] text-white leading-tight mb-3 drop-shadow-md group-hover:text-pink-200 transition-colors">{item.title || "Featured Link"}</h4>
                                                                        <div className="inline-flex mt-1">
                                                                            <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white rounded-full text-[13px] font-bold px-6 py-2.5 flex items-center gap-2 group-hover:bg-white group-hover:text-black transition-all">
                                                                                {item.button_text || "View Collection"} <ArrowRight size={14} />
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </a>
                                                            )
                                                        }
                                                        if (block.type === 'links_grid') {
                                                            const items = block.items || (block as any).content?.items || [];
                                                            return (
                                                                <div key={block.id} className="w-[100%] mx-auto grid grid-cols-2 gap-3 mb-6">
                                                                    {items.map((item: any, idx: number) => (
                                                                        <a key={idx} href={item.url || "#"} target="_blank" className="bg-white rounded-[20px] overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.04)] border border-[#f1f3f5] flex flex-col group hover:shadow-md transition-all hover:border-[#db2777]/30 hover:-translate-y-0.5">
                                                                            <div className="w-full h-24 bg-slate-50 relative overflow-hidden">
                                                                                {item.image_url ? (
                                                                                    <img src={item.image_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                                                ) : (
                                                                                    <div className="absolute inset-0 flex items-center justify-center text-slate-300"><Grid size={20} className="opacity-40" /></div>
                                                                                )}
                                                                            </div>
                                                                            <div className="p-3 text-center bg-white border-t border-slate-50 relative z-10">
                                                                                <h4 className="font-bold text-[12px] text-[#111] leading-tight truncate group-hover:text-[#db2777]">{item.title || "Grid Link"}</h4>
                                                                            </div>
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            )
                                                        }
                                                        if (block.type === 'add_products') {
                                                            const items = block.items || (block as any).content?.items || [];
                                                            return (
                                                                <div key={block.id} className="w-[105%] -ml-[2.5%] flex gap-4 overflow-x-auto no-scrollbar snap-x snap-mandatory py-2 px-6 relative mb-4">
                                                                    {items.map((item: any, idx: number) => (
                                                                        <a key={idx} href={item.url || "#"} target="_blank" className="flex-shrink-0 w-[180px] bg-white rounded-[24px] overflow-hidden shadow-[0_4px_20px_rgb(0,0,0,0.04)] snap-center border border-[#f1f3f5] flex flex-col group transition-all duration-300 hover:-translate-y-1 relative focus:outline-none">
                                                                            <div className="w-full h-[180px] bg-[#F8F9FB] relative overflow-hidden flex-shrink-0 p-4">
                                                                                {item.image_url ? (
                                                                                    <img src={item.image_url} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 drop-shadow-sm" />
                                                                                ) : (
                                                                                    <div className="absolute inset-0 flex items-center justify-center text-slate-300"><ShoppingBag size={32} className="opacity-40" /></div>
                                                                                )}
                                                                            </div>
                                                                            <div className="p-4 flex flex-col flex-1 bg-white text-center z-10">
                                                                                <h4 className="font-bold text-[14px] text-[#111] leading-tight mb-1 group-hover:text-[#db2777] transition-colors line-clamp-1">{item.title || "Product Name"}</h4>
                                                                                {(item.description || item.url) && (
                                                                                    <p className="text-[12px] font-bold text-slate-400 line-clamp-1">{item.description}</p>
                                                                                )}
                                                                                <div className="mt-4 pt-3 border-t border-slate-50">
                                                                                    <span className="bg-[#db2777]/10 text-[#db2777] group-hover:bg-[#db2777] group-hover:text-white transition-colors text-[11px] font-bold px-4 py-2 rounded-full inline-block w-full shadow-sm">{item.button_text || "Buy Now"}</span>
                                                                                </div>
                                                                            </div>
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            )
                                                        }
                                                        if (block.type === 'add_apps') {
                                                            const items = block.items || (block as any).content?.items || [];
                                                            return (
                                                                <div key={block.id} className="w-full space-y-3 mb-6">
                                                                    {items.map((item: any, idx: number) => (
                                                                        <a key={idx} href={item.url || "#"} target="_blank" className="w-full bg-white rounded-[20px] p-3 shadow-sm border border-[#f1f3f5] flex items-center gap-4 group transition-all duration-300 hover:shadow-md hover:border-[#db2777]/30">
                                                                            <div className="w-[68px] h-[68px] rounded-[16px] bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200/60 shadow-inner p-0.5">
                                                                                {item.image_url ? (
                                                                                    <img src={item.image_url} className="w-full h-full object-cover rounded-[14px]" />
                                                                                ) : (
                                                                                    <div className="w-full h-full flex items-center justify-center text-slate-300"><SmartphoneNfc size={24} className="opacity-50" /></div>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex-1 min-w-0">
                                                                                <h4 className="font-bold text-[14px] text-[#111] leading-tight mb-0.5 truncate group-hover:text-[#db2777] transition-colors">{item.title || "App Name"}</h4>
                                                                                {(item.description || item.url) && <p className="text-[12px] text-slate-400 truncate font-medium">{item.description}</p>}
                                                                            </div>
                                                                            <div className="flex-shrink-0 bg-[#F8F9FB] group-hover:bg-[#db2777] group-hover:text-white text-slate-500 shadow-sm text-[11px] font-bold px-4 py-2 rounded-full transition-colors mr-1">
                                                                                {item.button_text || "GET"}
                                                                            </div>
                                                                        </a>
                                                                    ))}
                                                                </div>
                                                            )
                                                        }
                                                        return (
                                                            <div key={block.id} className="w-full bg-white border border-[#eaeaea] p-4 rounded-[16px] shadow-sm text-center text-[13px] font-semibold text-[#333]">
                                                                {block.type} Block
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ))}

                                            {/* Extra spacing filler if no blocks */}
                                            {currentTab?.sections?.every(s => s.blocks?.length === 0) && (
                                                <div className="py-20 text-center opacity-30 text-xs font-bold uppercase tracking-widest text-[#db2777]">No content yet</div>
                                            )}
                                        </div>

                                        <div className="mt-auto pt-12 text-center w-full relative z-10 bottom-0 mb-4">
                                            <p className="text-[10px] font-bold text-[#888] tracking-widest uppercase">Powered by Laravel</p>
                                        </div>
                                    </div>

                                    {/* Home Indicator */}
                                    <div className="absolute bottom-2 inset-x-0 h-1 flex justify-center z-50">
                                        <div className="w-24 border-b-[3px] border-[#CCC] rounded-full"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </main>

            {/* Creation Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#333]/40 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-lg bg-white rounded-[24px] shadow-2xl relative z-10 overflow-hidden"
                        >
                            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-[16px] font-bold text-slate-800">Create Portfolio</h3>
                                <button onClick={() => setShowCreateModal(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Portfolio Title</label>
                                    <input
                                        type="text"
                                        value={createForm.title}
                                        onChange={e => setCreateForm({ ...createForm, title: e.target.value })}
                                        className="w-full px-5 py-3 rounded-lg border border-[#D5D8DF] outline-none focus:border-[#db2777] transition-colors font-medium text-[14px]"
                                        placeholder="e.g. My Creative Space"
                                        autoFocus
                                    />
                                    <p className="text-[11px] text-slate-400 font-medium">You can easily change this later in your settings.</p>
                                </div>
                            </div>
                            <div className="px-8 pb-8 flex gap-3">
                                <button onClick={() => setShowCreateModal(false)} className="flex-1 h-12 rounded-lg border border-[#D5D8DF] bg-white text-slate-600 font-bold text-[13px] hover:bg-slate-50 transition-colors">Cancel</button>
                                <button onClick={handleCreateProfile} disabled={isCreating} className="flex-[1.5] h-12 rounded-lg bg-[#db2777] text-white font-bold text-[13px] shadow-lg shadow-[#db2777]/20 hover:bg-[#be185d] transition-colors flex items-center justify-center gap-2">
                                    {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                                    {isCreating ? "Initializing..." : "Build Portfolio"}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Edit Profile Details Modal */}
            <AnimatePresence>
                {showEditProfileModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#333]/40 backdrop-blur-sm" onClick={() => setShowEditProfileModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-lg bg-white rounded-[24px] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white/80 backdrop-blur-md z-10">
                                <h3 className="text-[16px] font-bold text-slate-800">Edit Profile Details</h3>
                                <button onClick={() => setShowEditProfileModal(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-8 space-y-6 overflow-y-auto">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Portfolio Title</label>
                                    <input
                                        type="text"
                                        value={editProfileForm.title || ""}
                                        onChange={e => setEditProfileForm({ ...editProfileForm, title: e.target.value })}
                                        className="w-full px-5 py-3 rounded-lg border border-[#D5D8DF] outline-none focus:border-[#db2777] transition-colors font-medium text-[14px]"
                                        placeholder="e.g. My Creative Space"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Bio Description</label>
                                    <textarea
                                        value={editProfileForm.bio || ""}
                                        onChange={e => setEditProfileForm({ ...editProfileForm, bio: e.target.value })}
                                        rows={3}
                                        className="w-full px-5 py-3 rounded-lg border border-[#D5D8DF] outline-none focus:border-[#db2777] transition-colors font-medium text-[14px] resize-none"
                                        placeholder="Describe what you do..."
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Email Link</label>
                                    <input
                                        type="email"
                                        value={editProfileForm.email_link || ""}
                                        onChange={e => setEditProfileForm({ ...editProfileForm, email_link: e.target.value })}
                                        className="w-full px-5 py-3 rounded-lg border border-[#D5D8DF] outline-none focus:border-[#db2777] transition-colors font-medium text-[14px]"
                                        placeholder="e.g. hello@example.com"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Contact number</label>
                                    <input
                                        type="tel"
                                        value={editProfileForm.contact_link || ""}
                                        onChange={e => setEditProfileForm({ ...editProfileForm, contact_link: e.target.value })}
                                        className="w-full px-5 py-3 rounded-lg border border-[#D5D8DF] outline-none focus:border-[#db2777] transition-colors font-medium text-[14px]"
                                        placeholder="e.g. +1 234 567 890"
                                    />
                                </div>
                            </div>
                            <div className="px-8 py-5 border-t border-slate-100 flex gap-3 bg-slate-50 mt-auto">
                                <button onClick={() => setShowEditProfileModal(false)} className="flex-1 h-12 rounded-lg border border-[#D5D8DF] bg-white text-slate-600 font-bold text-[13px] hover:bg-slate-50 transition-colors">Cancel</button>
                                <button
                                    onClick={async () => {
                                        await handleUpdateProfile(editProfileForm);
                                        setShowEditProfileModal(false);
                                    }}
                                    className="flex-[1.5] h-12 rounded-lg bg-[#db2777] text-white font-bold text-[13px] shadow-lg shadow-[#db2777]/20 hover:bg-[#be185d] transition-colors flex items-center justify-center gap-2"
                                >
                                    <Save className="w-4 h-4" /> Save Details
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Add Tab Details Modal */}
            <AnimatePresence>
                {showAddTabModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#333]/40 backdrop-blur-sm" onClick={() => setShowAddTabModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-md bg-white rounded-[24px] shadow-2xl relative z-10 overflow-hidden flex flex-col"
                        >
                            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                                <h3 className="text-[16px] font-bold text-slate-800">Create New Tab</h3>
                                <button onClick={() => setShowAddTabModal(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="bg-pink-50 text-pink-600 p-4 rounded-xl flex items-start gap-3">
                                    <LayoutTemplate className="w-5 h-5 shrink-0 mt-0.5" />
                                    <p className="text-[13px] font-medium leading-relaxed">
                                        <strong>What is a Tab?</strong> Tabs allow you to organize your portfolio into different categories. For example: "About Me", "My Links", "Media Gallery", or "Latest Reels".
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Tab Name</label>
                                    <input
                                        type="text"
                                        value={newTabTitle}
                                        onChange={e => setNewTabTitle(e.target.value)}
                                        className="w-full px-5 py-3 rounded-lg border border-[#D5D8DF] outline-none focus:border-[#db2777] transition-colors font-medium text-[14px]"
                                        placeholder="e.g. Media Gallery"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div className="px-8 py-5 border-t border-slate-100 flex gap-3 bg-slate-50">
                                <button onClick={() => setShowAddTabModal(false)} className="flex-1 h-12 rounded-lg border border-[#D5D8DF] bg-white text-slate-600 font-bold text-[13px] hover:bg-slate-50 transition-colors">Cancel</button>
                                <button
                                    onClick={handleAddTab}
                                    disabled={!newTabTitle.trim()}
                                    className="flex-[1.5] h-12 rounded-lg bg-[#db2777] text-white font-bold text-[13px] shadow-lg shadow-[#db2777]/20 hover:bg-[#be185d] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Plus className="w-4 h-4" /> Create Tab
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Add Section Details Modal */}
            <AnimatePresence>
                {showAddSectionModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#333]/40 backdrop-blur-sm" onClick={() => setShowAddSectionModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-md bg-white rounded-[24px] shadow-2xl relative z-10 overflow-hidden flex flex-col"
                        >
                            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white z-10">
                                <h3 className="text-[16px] font-bold text-slate-800">Add New Section</h3>
                                <button onClick={() => setShowAddSectionModal(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="bg-pink-50 text-pink-600 p-4 rounded-xl flex items-start gap-3">
                                    <LayoutTemplate className="w-5 h-5 shrink-0 mt-0.5" />
                                    <p className="text-[13px] font-medium leading-relaxed">
                                        <strong>What is a Section?</strong> Sections group blocks together within a tab. Name your section to keep your links organized (e.g. "My Socials", "Latest Videos").
                                    </p>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Section Heading</label>
                                    <input
                                        type="text"
                                        value={newSectionTitle}
                                        onChange={e => setNewSectionTitle(e.target.value)}
                                        className="w-full px-5 py-3 rounded-lg border border-[#D5D8DF] outline-none focus:border-[#db2777] transition-colors font-medium text-[14px]"
                                        placeholder="e.g. My Social Links"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <div className="px-8 py-5 border-t border-slate-100 flex gap-3 bg-slate-50">
                                <button onClick={() => setShowAddSectionModal(false)} className="flex-1 h-12 rounded-lg border border-[#D5D8DF] bg-white text-slate-600 font-bold text-[13px] hover:bg-slate-50 transition-colors">Cancel</button>
                                <button
                                    onClick={handleAddSection}
                                    disabled={!newSectionTitle.trim()}
                                    className="flex-[1.5] h-12 rounded-lg bg-[#db2777] text-white font-bold text-[13px] shadow-lg shadow-[#db2777]/20 hover:bg-[#be185d] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Plus className="w-4 h-4" /> Create Section
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Block Selector Modal */}
            <AnimatePresence>
                {showAddBlockModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#333]/40 backdrop-blur-sm" onClick={() => setShowAddBlockModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-4xl bg-[#F8F9FB] rounded-[24px] shadow-2xl relative z-10 overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            <div className="px-8 py-5 border-b border-slate-200 flex items-center justify-between bg-white z-10 sticky top-0">
                                <h3 className="text-[18px] font-bold text-slate-800">Add New Block</h3>
                                <button onClick={() => setShowAddBlockModal(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto space-y-10">
                                {Object.keys(blockCategories).length > 0 ? (
                                    Object.keys(blockCategories).map(categoryName => (
                                        <div key={categoryName}>
                                            <h4 className="text-[13px] font-black text-slate-800 mb-4 px-1">{categoryName}</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                {blockCategories[categoryName].map(block => (
                                                    <button 
                                                        key={block.type} 
                                                        onClick={() => { if (targetSectionId) { handleAddBlock(targetSectionId, block.type); setShowAddBlockModal(false); } }} 
                                                        className="bg-white border border-[#EAEBEE] rounded-[16px] overflow-hidden hover:shadow-xl hover:border-[#db2777] transition-all group flex flex-col text-left"
                                                    >
                                                        <div className="w-full h-[76px] bg-[#f4f5f7] flex items-center justify-center text-slate-400 group-hover:bg-[#db2777]/5 group-hover:text-[#db2777] transition-colors border-b border-[#EAEBEE]/80">
                                                            {React.cloneElement(getBlockIcon(block.type) as React.ReactElement, { size: 30, strokeWidth: 1.5 })}
                                                        </div>
                                                        <div className="p-4 w-full flex flex-col justify-center bg-white h-[84px]">
                                                            <h5 className="font-bold text-[13px] text-slate-900 mb-1 leading-tight">{block.label}</h5>
                                                            <p className="text-[11px] font-medium text-slate-500 leading-snug line-clamp-2">{block.description}</p>
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex justify-center items-center py-10">
                                        <Loader2 className="animate-spin w-8 h-8 text-[#db2777]" />
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Link Carousel Editor Modal */}
            <AnimatePresence>
                {showCarouselEditorModal && editingCarouselBlock && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[#333]/40 backdrop-blur-sm" onClick={() => setShowCarouselEditorModal(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-2xl bg-white rounded-[24px] shadow-2xl relative z-10 flex flex-col max-h-[90vh]"
                        >
                            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10 rounded-t-[24px]">
                                <h3 className="text-[16px] font-bold text-slate-800 flex items-center gap-2">
                                    {editingCarouselBlock.type === 'links_carousel' && <Layers size={18} className="text-[#db2777]" />}
                                    {editingCarouselBlock.type === 'hero_single_link' && <LinkIcon size={18} className="text-[#db2777]" />}
                                    {editingCarouselBlock.type === 'links_grid' && <Grid size={18} className="text-[#db2777]" />}
                                    {editingCarouselBlock.type === 'add_products' && <ShoppingBag size={18} className="text-[#db2777]" />}
                                    {editingCarouselBlock.type === 'add_apps' && <SmartphoneNfc size={18} className="text-[#db2777]" />}
                                    Edit {editingCarouselBlock.type.replace('_', ' ')}
                                </h3>
                                <button onClick={() => setShowCarouselEditorModal(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto bg-slate-50/50 space-y-6">
                                {(editingCarouselBlock.items || []).map((item: any, idx: number) => (
                                    <div key={idx} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm relative space-y-4 hover:border-[#db2777]/30 transition-colors">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                                <div className="w-5 h-5 rounded-full bg-pink-100 text-[#db2777] flex items-center justify-center font-black">{idx + 1}</div>
                                                Card
                                            </span>
                                            <button onClick={() => {
                                                const updated = { ...editingCarouselBlock };
                                                updated.items.splice(idx, 1);
                                                setEditingCarouselBlock(updated);
                                            }} className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition-all"><Trash2 size={15} /></button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5 col-span-2 md:col-span-1">
                                                <label className="text-[11px] font-bold text-slate-500 uppercase">Title <span className="text-red-400">*</span></label>
                                                <input value={item.title || ""} onChange={e => updateCarouselItem(idx, 'title', e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-[13px] outline-none focus:border-[#db2777]" placeholder="e.g. My Latest Product" />
                                            </div>
                                            <div className="space-y-1.5 col-span-2 md:col-span-1">
                                                <label className="text-[11px] font-bold text-slate-500 uppercase">Destination URL <span className="text-red-400">*</span></label>
                                                <input value={item.url || ""} onChange={e => updateCarouselItem(idx, 'url', e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-[13px] outline-none focus:border-[#db2777]" placeholder="https://..." />
                                            </div>
                                            <div className="space-y-1.5 col-span-2">
                                                <label className="text-[11px] font-bold text-slate-500 uppercase">Description</label>
                                                <textarea value={item.description || ""} onChange={e => updateCarouselItem(idx, 'description', e.target.value)} rows={2} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-[13px] outline-none focus:border-[#db2777] resize-none" placeholder="Add some context context or a catchy subtitle..." />
                                            </div>
                                            <div className="space-y-1.5 col-span-2 md:col-span-1">
                                                <label className="text-[11px] font-bold text-slate-500 uppercase">Button Text</label>
                                                <input value={item.button_text || ""} onChange={e => updateCarouselItem(idx, 'button_text', e.target.value)} className="w-full px-4 py-2 border border-slate-200 rounded-lg text-[13px] outline-none focus:border-[#db2777]" placeholder="e.g. Visit, Shop Now, Read More" />
                                            </div>
                                            <div className="space-y-1.5 col-span-2 md:col-span-1">
                                                <label className="text-[11px] font-bold text-slate-500 uppercase">Thumbnail Image (URL or Upload)</label>
                                                <div className="flex gap-2">
                                                    <input value={item.image_url || ""} onChange={e => updateCarouselItem(idx, 'image_url', e.target.value)} className="flex-1 px-4 py-2 border border-slate-200 rounded-lg text-[13px] outline-none focus:border-[#db2777] min-w-0" placeholder="https://..." />
                                                    <label className="h-[38px] px-3 bg-[#db2777]/10 text-[#db2777] rounded-lg text-[12px] font-bold flex items-center justify-center cursor-pointer hover:bg-[#db2777]/20 transition-colors shrink-0">
                                                        <Upload size={14} className="mr-1.5" /> Upload
                                                        <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                                                            if (e.target.files?.[0]) {
                                                                const url = await handleUploadImage(e.target.files[0]);
                                                                if (url) updateCarouselItem(idx, 'image_url', url);
                                                            }
                                                        }} />
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button onClick={() => {
                                    const updated = { ...editingCarouselBlock };
                                    if (!updated.items) updated.items = [];
                                    updated.items.push({ title: "New Card", url: "https://", description: "", button_text: "Visit Now" });
                                    setEditingCarouselBlock(updated);
                                }} className="w-full py-4 border-2 border-dashed border-[#db2777]/30 bg-[#db2777]/5 text-[#db2777] rounded-2xl text-[13px] font-bold hover:bg-[#db2777]/10 transition-colors">
                                    + Add Another Card
                                </button>
                            </div>

                            <div className="px-8 py-5 border-t border-slate-100 flex gap-3 bg-white sticky bottom-0 rounded-b-[24px]">
                                <button onClick={() => setShowCarouselEditorModal(false)} className="flex-1 h-12 rounded-lg border border-[#D5D8DF] bg-white text-slate-600 font-bold text-[13px] hover:bg-slate-50 transition-colors">Cancel</button>
                                <button
                                    onClick={handleSaveCarouselEditor}
                                    className="flex-[1.5] h-12 rounded-lg bg-[#db2777] text-white font-bold text-[13px] shadow-lg shadow-[#db2777]/20 hover:bg-[#be185d] transition-colors flex items-center justify-center gap-2"
                                >
                                    <Save size={16} /> Save Changes
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
