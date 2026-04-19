"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
    Plus, Trash2, Edit3, Save, Loader2, Link as LinkIcon,
    Image as ImageIcon, GripVertical, RefreshCw, LayoutTemplate,
    Upload, Wand2, ArrowRight, CheckCircle2, X, Eye, Share2, Grid, User,
    Layers, Video, Youtube, MonitorPlay, Smartphone, Monitor, Hexagon,
    ShoppingBag, SmartphoneNfc, Sparkles, ChevronLeft, ChevronRight,
    Settings, Zap, MoreHorizontal, PanelLeft, Columns, Search, Camera,
    Shuffle, Palette, KeyRound, ShieldAlert, CircleDot, Orbit, Megaphone, Code2, FileCode2, Info, Maximize2, Globe, Clock, Mail,
    Instagram, Twitter, Facebook, EyeOff
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { useModal } from "@/components/providers/ModalProvider";
import { cn } from "@/lib/utils";
import { VisualsLab, getTheme, isColorLight, ThemeEffectsLayer, ThemeAnimationStyles } from "./TemplateSystem";
import BlockMarketplaceContent from "./BlockMarketplaceContent";
import { PhonePreview } from "./PhonePreview";
import { PortfolioCanvas as SectionCard } from "./PortfolioCanvas";
import { BLOCK_ICONS, BLOCK_COLORS, getUiTypeFromBlock, mergeTabsPreservingItems } from "./builder-utils";

export interface BioProfile { 
    link_id: string; 
    title: string; 
    description: string; 
    url: string; 
    is_enabled: string; 
    settings?: any;
    theme?: string; 
    avatar?: string; 
    bio?: string;
    email_link?: string; 
    contact_link?: string; 
    id?: number | string;
}
export interface BioTab { id: number; title: string; is_active: number; sections: BioSection[]; }
interface BioSection { id: number; tab_id: number; title: string; type: string; is_active: number; blocks: BioBlock[]; }
interface BioBlock { id: number; section_id: number; type: string; is_active: number; items: any[]; }

type PhaseIconType = React.ComponentType<{ size?: number; className?: string }>;

interface BioAdvancedSettings {
    // SEO
    seoBlock: boolean;
    seoTitle: string;
    seoDescription: string;
    seoKeywords: string;
    seoOpenGraphImage: string;
    seoLanguage: string;
    // Branding
    displayBranding: boolean;
    brandingName: string;
    brandingUrl: string;
    brandingTextColor: string;
    // Pixels
    pixelFacebookEnabled: boolean;
    pixelGoogleEnabled: boolean;
    // UTM
    utmSource: string;
    utmMedium: string;
    utmCampaign: string;
    // Visual
    backgroundType: string;
    background: string;
    textColor: string;
    fontSize: number;
    width: number;
    blockSpacing: number;
    hoverAnimation: string;
    // Protection
    password: string;
    sensitiveContentWarning: boolean;
    // Buttons
    enableShareButton: boolean;
    enableScrollButtons: boolean;
    // Branded button
    brandedButtonEnabled: boolean;
    brandedIconUrl: string;
    brandedModalTitle: string;
    brandedModalContent: string;
    // Directory
    enableDirectoryDisplaying: boolean;
    // Links
    projectName: string;
    splashPageName: string;
    leapLinkUrl: string;
    // Code
    customCss: string;
    customJs: string;
}

const DEFAULT_ADVANCED_SETTINGS: BioAdvancedSettings = {
    // SEO
    seoBlock: false,
    seoTitle: "",
    seoDescription: "",
    seoKeywords: "",
    seoOpenGraphImage: "",
    seoLanguage: "en",
    // Branding
    displayBranding: true,
    brandingName: "",
    brandingUrl: "",
    brandingTextColor: "",
    // Pixels
    pixelFacebookEnabled: true,
    pixelGoogleEnabled: true,
    // UTM
    utmSource: "",
    utmMedium: "",
    utmCampaign: "",
    // Visual
    backgroundType: "color",
    background: "",
    textColor: "",
    fontSize: 16,
    width: 8,
    blockSpacing: 2,
    hoverAnimation: "smooth",
    // Protection
    password: "",
    sensitiveContentWarning: false,
    // Buttons
    enableShareButton: true,
    enableScrollButtons: true,
    // Branded button
    brandedButtonEnabled: false,
    brandedIconUrl: "",
    brandedModalTitle: "",
    brandedModalContent: "",
    // Directory
    enableDirectoryDisplaying: true,
    // Links
    projectName: "None",
    splashPageName: "None",
    leapLinkUrl: "",
    // Code
    customCss: "",
    customJs: "",
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

const ModalShell = ({ open, onClose, title, icon, children, footer, maxWidthClassName = "sm:max-w-xl" }: any) => (
    <AnimatePresence>
        {open && (
            <div className="fixed inset-0 z-[500] flex items-end sm:items-center justify-center p-0 sm:p-4">
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className={cn("relative z-10 w-full bg-white dark:bg-slate-950 rounded-t-3xl sm:rounded-3xl overflow-hidden flex flex-col max-h-[90vh] shadow-[0_32px_128px_rgba(0,0,0,0.3)]", maxWidthClassName)}>
                    <div className="flex items-center gap-4 px-8 pt-8 pb-6 border-b border-slate-100 dark:border-slate-800">
                        {icon && <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">{icon}</div>}
                        <h2 className="text-xl font-black text-slate-900 dark:text-white flex-1 tracking-tight">{title}</h2>
                        <button onClick={onClose} className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-8">{children}</div>
                    {footer && <div className="px-8 py-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">{footer}</div>}
                </motion.div>
            </div>
        )}
    </AnimatePresence>
);

const InputField = ({ label, ...props }: any) => (
    <div className="space-y-2">
        <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">{label}</label>
        <input {...props} className="w-full h-12 px-5 rounded-xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-slate-300 dark:focus:border-slate-600 text-[14px] font-bold text-slate-900 dark:text-white outline-none transition-all shadow-inner" />
    </div>
);

const ToggleSwitch = ({ checked, onChange, disabled = false }: { checked: boolean; onChange: (value: boolean) => void; disabled?: boolean }) => (
    <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
            "relative inline-flex h-7 w-12 items-center rounded-full transition-all",
            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
            checked ? "bg-slate-900 dark:bg-slate-700" : "bg-slate-200 dark:bg-slate-800"
        )}
    >
        <span
            className={cn(
                "inline-block h-5 w-5 transform rounded-full bg-white shadow transition-all",
                checked ? "translate-x-6" : "translate-x-1"
            )}
        />
    </button>
);

export default function BioLinkBuilder() {
    const searchParams = useSearchParams();
    const { showModal } = useModal();
    const [isLoading, setIsLoading] = useState(true);
    const [accounts, setAccounts] = useState<any[]>([]);
    const [selectedPageId, setSelectedPageId] = useState<string | null>(null);
    const [profile, setProfile] = useState<BioProfile | null>(null);
    const [tabs, setTabs] = useState<BioTab[]>([]);
    const [uiTypeOverrides, setUiTypeOverrides] = useState<Record<number, string>>({});
    const [selectedTabId, setSelectedTabId] = useState<number | null>(null);

    const [showCreate, setShowCreate] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [createTitle, setCreateTitle] = useState("");
    const [showAddBlock, setShowAddBlock] = useState(false);
    const [targetSectionId, setTargetSectionId] = useState<number | null>(null);
    const [showCarouselEditor, setShowCarouselEditor] = useState(false);
    const [editingBlock, setEditingBlock] = useState<any>(null);

    const [isArranging, setIsArranging] = useState(false);
    const [copiedLink, setCopiedLink] = useState(false);
    const [activePanel, setActivePanel] = useState<"builder" | "preview">("builder");
    const [view, setView] = useState("blocks");
    const [advancedSettings, setAdvancedSettings] = useState<BioAdvancedSettings>(DEFAULT_ADVANCED_SETTINGS);
    const [isSavingAdvanced, setIsSavingAdvanced] = useState(false);
    const [growthTab, setGrowthTab] = useState("seo");
    const [showPassword, setShowPassword] = useState(false);

    const instagramUsername = accounts.find(a => String(a.id) === selectedPageId)?.username || "username";
    const publicUrl = typeof window !== "undefined"
        ? `${window.location.origin}/p?u=${instagramUsername}&id=${selectedPageId}`
        : `/p?u=${instagramUsername}&id=${selectedPageId}`;

    const currentTab = tabs.find(t => t.id === selectedTabId) || tabs[0];
    const flatBlocks = (tabs || []).flatMap((tab: any) => tab.sections || []).flatMap((sec: any) => sec.blocks || []);
    const visibleBlocks = flatBlocks;
    const requestedPageId = searchParams.get("page");
    const advancedFlowTips = [
        "1. Turn features ON that you want visitors to use.",
        "2. Fill only the fields needed for your current campaign.",
        "3. Click Save Advanced Settings to apply changes.",
    ];
    const enabledAdvancedFlags = [
        advancedSettings.displayBranding && "Branding",
        advancedSettings.pixelFacebookEnabled && "Facebook Pixel",
        advancedSettings.pixelGoogleEnabled && "Google Analytics",
        advancedSettings.sensitiveContentWarning && "Sensitive Warning",
        advancedSettings.brandedButtonEnabled && "Branded Button",
        advancedSettings.enableShareButton && "Share Button",
        advancedSettings.enableScrollButtons && "Scroll Buttons",
        advancedSettings.enableDirectoryDisplaying && "Directory Listing",
        !!advancedSettings.password && "Password Protection",
        !!advancedSettings.leapLinkUrl && "Leap Redirect",
    ].filter(Boolean) as string[];

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const res = await api.get("/social/instagram-connect");
                const accs = res.data?.data?.instagram_accounts || [];
                setAccounts(accs);
                if (accs.length > 0) {
                    const preferredId = requestedPageId || accs[0].id.toString();
                    setSelectedPageId(preferredId);
                }
            } catch { }
        };
        fetchAccounts();
    }, [requestedPageId]);


    const fetchBuilderData = useCallback(async () => {
        if (!selectedPageId) return;
        setIsLoading(true);
        try {
            const res = await api.get("/bio/pages");
            const pages = res.data?.data || res.data || [];
            const payload = pages.find((p: any) => String(p.link_id) === selectedPageId || p.url === selectedPageId);

            if (payload?.link_id) {
                setProfile(payload);
                const linkId = payload.link_id;
                
                // Fetch blocks for this specific page
                const bRes = await api.get(`/bio/pages/${linkId}/blocks`);
                const bData = bRes.data?.data || bRes.data || [];
                const mappedBlocks = bData.map((b: any) => ({
                    ...b,
                    id: b.biolink_block_id || b.id,
                }));

                // Ensure we have a tab/section structure to show blocks in panel/canvas
                const activeTabs = payload.tabs?.length > 0 ? payload.tabs : [{ id: 1, title: "Main", sections: [{ id: 1, title: "Standard", blocks: [] }] }];
                
                const finalTabs = activeTabs.map((tab: any, idx: number) => {
                    // For now, if it's the first tab, inject the fetched blocks into the first section
                    if (idx === 0) {
                        const sections = tab.sections?.length > 0 ? tab.sections : [{ id: 1, title: "Standard", blocks: [] }];
                        sections[0].blocks = mappedBlocks;
                        return { ...tab, sections };
                    }
                    return tab;
                });

                setTabs(finalTabs);
                if (finalTabs.length > 0 && !selectedTabId) setSelectedTabId(finalTabs[0].id);
            }
            else {
                setProfile(null);
                setTabs([]);
                setSelectedTabId(null);
            }
        } catch (err) {
            console.error("Fetch Error:", err);
            setProfile(null);
            setTabs([]);
            setSelectedTabId(null);
        }
        finally { setIsLoading(false); }
    }, [selectedPageId, selectedTabId]);

    useEffect(() => { fetchBuilderData(); }, [fetchBuilderData]);

    useEffect(() => {
        if (!profile) {
            setAdvancedSettings(DEFAULT_ADVANCED_SETTINGS);
            return;
        }
        // Hydrate all settings from the profile.settings object (API response)
        const s = profile.settings || {};
        setAdvancedSettings(prev => ({
            ...DEFAULT_ADVANCED_SETTINGS,
            // SEO
            seoBlock: s.seo?.block ?? prev.seoBlock,
            seoTitle: s.seo?.title ?? (profile.title || ""),
            seoDescription: s.seo?.meta_description ?? prev.seoDescription,
            seoKeywords: s.seo?.meta_keywords ?? prev.seoKeywords,
            seoOpenGraphImage: s.seo?.opengraph_image ?? prev.seoOpenGraphImage,
            seoLanguage: s.seo?.language ?? prev.seoLanguage,
            // Branding
            displayBranding: s.display_branding ?? prev.displayBranding,
            brandingName: s.branding?.name ?? profile.title ?? prev.brandingName,
            brandingUrl: s.branding?.url ?? (typeof window !== "undefined" ? window.location.origin : ""),
            brandingTextColor: s.branding?.text_color ?? prev.brandingTextColor,
            // UTM
            utmSource: s.utm?.source ?? prev.utmSource,
            utmMedium: s.utm?.medium ?? prev.utmMedium,
            // Visual
            backgroundType: s.background_type ?? prev.backgroundType,
            background: s.background ?? prev.background,
            textColor: s.text_color ?? prev.textColor,
            fontSize: s.font_size ?? prev.fontSize,
            width: s.width ?? prev.width,
            blockSpacing: s.block_spacing ?? prev.blockSpacing,
            hoverAnimation: s.hover_animation ?? prev.hoverAnimation,
            // Toggles
            enableShareButton: s.share_is_enabled ?? prev.enableShareButton,
            enableScrollButtons: s.scroll_buttons_is_enabled ?? prev.enableScrollButtons,
            password: s.password ?? prev.password,
            sensitiveContentWarning: s.sensitive_content ?? prev.sensitiveContentWarning,
            // Branded button
            brandedButtonEnabled: s.branded_button_is_enabled ?? prev.brandedButtonEnabled,
            brandedIconUrl: s.branded_button_icon ?? prev.brandedIconUrl,
            brandedModalTitle: s.branded_button_title ?? prev.brandedModalTitle,
            brandedModalContent: s.branded_button_content ?? prev.brandedModalContent,
        }));
    }, [profile]);

    const handleUpdateProfile = async (updates: Partial<BioProfile>) => {
        if (!profile) return;
        const previousProfile = profile;
        const nextProfile = { ...profile, ...updates };
        setProfile(nextProfile);
        try {
            await api.put(`/bio-builder/profile/${profile.id}`, updates);
        } catch {
            setProfile(previousProfile);
            showModal("error", "Error", "Failed to update profile.");
        }
    };

    const syncBlockItemsLocally = (blockId: number, items: any[]) => {
        setTabs((prevTabs) =>
            prevTabs.map((tab) => ({
                ...tab,
                sections: (tab.sections || []).map((section) => ({
                    ...section,
                    blocks: (section.blocks || []).map((block) =>
                        block.id === blockId ? { ...block, items } : block
                    ),
                })),
            }))
        );
    };

    const handleDeleteSection = async (id: number) => {
        if (typeof window !== "undefined") {
            const ok = window.confirm("Are you sure you want to delete this section?");
            if (!ok) return;
        }
        try { await api.delete(`/bio-builder/sections/${id}`); fetchBuilderData(); }
        catch { showModal("error", "Error", "Failed to delete section."); }
    };

    const ensureSectionForBlocks = async () => {
        if (!profile || !selectedPageId) return;

        let latestTabs = tabs;
        try {
            const res = await api.get("/bio/pages");
            const pages = res.data?.data || res.data || [];
            const payload = pages.find((p: any) => String(p.link_id) === selectedPageId || p.url === selectedPageId);
            latestTabs = payload?.tabs || tabs;
        } catch {
            // If refresh fails, continue with current local state.
        }

        let resolvedTabId = currentTab?.id || selectedTabId || latestTabs[0]?.id;

        if (!resolvedTabId) {
             showModal("error", "Error", "Could not resolve a tab for adding blocks.");
             return null;
        }

        try {
            const res = await api.get("/bio/pages");
            const pages = res.data?.data || res.data || [];
            const payload = pages.find((p: any) => String(p.link_id) === selectedPageId || p.url === selectedPageId);
            latestTabs = payload?.tabs || tabs;
            if (!resolvedTabId) {
                resolvedTabId = payload?.tabs?.[0]?.id;
            }
        } catch {
            // If refresh fails, we still continue with local state.
        }

        if (!resolvedTabId) {
            showModal("error", "Error", "Could not resolve a tab for adding blocks.");
            return null;
        }

        const activeTab = latestTabs.find((tab: any) => tab.id === resolvedTabId) || latestTabs[0];
        const existingSection = activeTab?.sections?.[0];
        if (existingSection?.id) {
            setSelectedTabId(activeTab.id);
            return existingSection.id;
        }

        showModal("error", "Error", "Content structure is missing. Please re-load the page.");
        return null;
    };

    const openBlockMarketplace = async (sectionId?: number) => {
        if (!profile || !selectedPageId) {
            showModal("error", "Not Ready", "We couldn't resolve your bio profile. Please re-select it from the list.");
            return;
        }

        if (sectionId) {
            setTargetSectionId(sectionId);
            setShowAddBlock(true);
            return;
        }

        const existingSectionId = currentTab?.sections?.[0]?.id || null;
        setTargetSectionId(existingSectionId);
        setShowAddBlock(true);
    };



    const handleAddBlock = async (type: string, settings: any = {}) => {
        if (!profile) return;
        const linkId = profile.link_id || profile.id;
        
        // Extract location_url (some modules have it at top level)
        const locationUrl = settings.location_url || settings.url || "";
        
        // Ensure required fields like 'name' or 'text' are present
        const processedSettings = { ...settings };
        
        // Use a fallback if all name/text fields are empty to pass validation
        const fallbackName = type.charAt(0).toUpperCase() + type.slice(1);
        
        processedSettings.name = (processedSettings.name || processedSettings.text || processedSettings.label || fallbackName).trim();
        processedSettings.text = (processedSettings.text || processedSettings.name).trim();

        // Location URL placeholder if empty for link-like types
        let finalLocationUrl = locationUrl;
        if (!finalLocationUrl && ["link", "image", "soundcloud", "spotify", "youtube", "twitch", "vimeo", "tiktok_video"].includes(type)) {
            finalLocationUrl = "https://";
        }

        // Prepare payload according to backend expectations (Reference 1-15)
        const payload: any = {
            link_id: linkId,
            type: type,
            settings: processedSettings,
        };

        // Standard, Image, and Embeds use top-level location_url (Reference 27, 197, 467)
        if (["link", "image", "soundcloud", "spotify", "youtube", "twitch", "vimeo", "tiktok_video"].includes(type)) {
            payload.location_url = finalLocationUrl;
            // Clean up to avoid duplication
            delete payload.settings.url;
            delete payload.settings.location_url;
        }

        try {
            await api.post("/bio/blocks", payload);
            
            // After successful creation, call the specific GET blocks API for this page
            const blocksRes = await api.get(`/bio/pages/${linkId}/blocks`);
            const refreshedBlocks = (blocksRes.data?.data || blocksRes.data || []).map((b: any) => ({
                ...b,
                id: b.biolink_block_id || b.id
            }));
            
            // Sync the refreshed blocks into the tabs state
            setTabs(prev => prev.map((tab, idx) => {
                if (idx === 0) {
                    const sections = tab.sections?.length > 0 ? tab.sections : [{ id: 1, title: "Standard", blocks: [] }];
                    sections[0].blocks = refreshedBlocks;
                    return { ...tab, sections };
                }
                return tab;
            }));
            
            await fetchBuilderData(); // Also refresh overall data
            setShowAddBlock(false);
            setShowCarouselEditor(false);
            setEditingBlock(null);
            showModal("success", "Success", "Block created successfully.");
        } catch (err: any) {
            console.error("Failed to add block via /bio/blocks", err);
            const msg = err.response?.data?.message || "Failed to add block.";
            showModal("error", "Error", msg);
        }
    };

    const handleSelectBlockType = async (type: string, defaults?: any) => {
        const mockBlock = {
            id: "new",
            type: type,
            settings: defaults || {},
            _uiType: type,
            _isNew: true,
            items: defaults ? [{ ...defaults }] : []
        };
        setEditingBlock(mockBlock);
        setShowAddBlock(false);
        setShowCarouselEditor(true);
    };

    const openEditor = (block: any) => {
        const uiType = getUiTypeFromBlock(block, uiTypeOverrides);
        
        // Deep clone settings so edits don't mutate original block
        const settings = JSON.parse(JSON.stringify(block.settings || {}));

        if (uiType === "socials") {
            if (Array.isArray(settings.socials)) { settings.socials = {}; }
            if (settings.socials && typeof settings.socials === "object") {
                const px = { facebook: "facebook.com/", instagram: "instagram.com/", twitter: "x.com/", youtube: "youtube.com/", tiktok: "tiktok.com/@", linkedin: "linkedin.com/", discord: "discord.gg/", telegram: "t.me/" };
                Object.entries(settings.socials).forEach(([k, v]) => {
                    if (typeof v === "string" && px[k]) {
                        let cln = v.replace(/^https?:\/\/(www\.)?/, "");
                        if (cln.startsWith(px[k])) cln = cln.substring(px[k].length);
                        settings.socials[k] = cln;
                    }
                });
            }
        }
        
        // For embed/link types, map the top-level location_url into settings so the form shows it
        if (block.location_url && block.location_url !== "https://") {
            settings.url = block.location_url;
            settings.location_url = block.location_url;
        }
        
        // For heading blocks: ensure 'title' is synced with 'text' for the form display
        if (uiType === "heading" && settings.title && !settings.text) {
            settings.text = settings.title;
        }
        
        // For paragraph blocks: ensure 'description' is synced with 'text' for the form
        if (uiType === "paragraph" && settings.description && !settings.text) {
            settings.text = settings.description;
        }

        const items = [{ ...settings, builder_type: uiType }];
        
        setEditingBlock({
            ...block,
            _uiType: uiType,
            _originalSettings: { ...block.settings },
            items
        });
        setShowCarouselEditor(true);
    };

    const handleDeleteBlock = async (id: number | string) => {
        if (id === "new") {
            setShowCarouselEditor(false);
            setEditingBlock(null);
            return;
        }
        if (typeof window !== "undefined") {
            const ok = window.confirm("Are you sure you want to delete this block?");
            if (!ok) return;
        }

        // Local-first delete
        setTabs((prevTabs) =>
            prevTabs.map((tab) => ({
                ...tab,
                sections: (tab.sections || []).map((section) => ({
                    ...section,
                    blocks: (section.blocks || []).filter((block) => block.id !== id),
                })),
            }))
        );

        if (editingBlock?.id === id) {
            setShowCarouselEditor(false);
            setEditingBlock(null);
        }

        try {
            await api.delete(`/bio/blocks/${id}`);
        } catch {
            showModal("error", "Error", "Failed to delete block on server.");
            await fetchBuilderData();
        }
    };

    const saveEditor = async () => {
        if (!editingBlock) return;
        
        // Data lives in editingBlock.items[0] from the editor form
        const editorSettings = editingBlock.items?.[0] || editingBlock.settings || {};
        
        if (editingBlock._isNew) {
            await handleAddBlock(editingBlock._uiType, editorSettings);
            return;
        }

        const uiType = getUiTypeFromBlock(editingBlock, uiTypeOverrides);
        
        // Build a CLEAN settings object ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â strip internal/editor-only fields
        const cleanSettings = { ...editorSettings };
        delete cleanSettings.builder_type;
        delete cleanSettings._uiType;
        delete cleanSettings.url;          // url goes as top-level location_url
        delete cleanSettings.location_url; // location_url goes at top level

        if (uiType === "socials" && cleanSettings.socials && typeof cleanSettings.socials === "object") {
            const prefixes = {
                facebook: "https://facebook.com/", instagram: "https://instagram.com/", twitter: "https://x.com/",
                youtube: "https://youtube.com/", tiktok: "https://tiktok.com/@", linkedin: "https://linkedin.com/",
                discord: "https://discord.gg/", telegram: "https://t.me/",
            };
            const rebuiltSocials = {};
            Object.entries(cleanSettings.socials).forEach(([key, val]) => {
                if (typeof val === "string" && val.trim() !== "") {
                    if (val.startsWith("http") || !prefixes[key]) {
                        rebuiltSocials[key] = val;
                    } else {
                        rebuiltSocials[key] = prefixes[key] + val;
                    }
                }
            });
            cleanSettings.socials = rebuiltSocials;
        }
        
        // Build the payload per the Biolink Blocks API
        const payload: any = {
            settings: cleanSettings
        };

        // For types that use top-level location_url
        const locationUrlTypes = ["link", "image", "soundcloud", "spotify", "youtube", "twitch", "vimeo", "tiktok_video"];
        if (locationUrlTypes.includes(uiType)) {
            const locationUrl = editorSettings.url || editorSettings.location_url || "";
            if (locationUrl) {
                payload.location_url = locationUrl;
            }
        }

        // Optimistic local update ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â merge edited settings into the block
        const mergedSettings = { ...(editingBlock._originalSettings || editingBlock.settings), ...cleanSettings };
        setTabs((prevTabs) =>
            prevTabs.map((tab) => ({
                ...tab,
                sections: (tab.sections || []).map((section) => ({
                    ...section,
                    blocks: (section.blocks || []).map((block) =>
                        block.id === editingBlock.id
                            ? { ...block, settings: mergedSettings, location_url: payload.location_url || block.location_url }
                            : block
                    ),
                })),
            }))
        );
        setUiTypeOverrides((prev) => ({ ...prev, [editingBlock.id]: uiType }));
        setShowCarouselEditor(false);
        setEditingBlock(null);

        try {
            await api.put(`/bio/blocks/${editingBlock.id}`, payload);
            await fetchBuilderData();
        }
        catch {
            showModal("error", "Error", "Failed to update block on server.");
            await fetchBuilderData();
        }
    };

    const updateItem = (idx: number, field: string, value: any) => {
        if (!editingBlock) return;
        const items = [...(editingBlock.items || [])];
        items[idx] = { ...items[idx], [field]: value };
        setEditingBlock({ ...editingBlock, items });
        syncBlockItemsLocally(editingBlock.id, items);
    };

    const handleReorderBlocks = async (newTabs: any) => {
        if (!profile) return;
        setTabs(newTabs);
        
        const allBlocks: any[] = [];
        newTabs.forEach((tab: any) => {
            tab.sections?.forEach((section: any) => {
                section.blocks?.forEach((block: any, index: number) => {
                    allBlocks.push({ id: block.id, order: index });
                });
            });
        });

        try {
            await api.post("/bio/blocks/reorder", {
                link_id: profile.link_id || profile.id,
                blocks: allBlocks
            });
        } catch {
            fetchBuilderData();
        }
    };

    // Replace handleReorderSections if it existed with handleReorderBlocks
    const handleReorderSections = handleReorderBlocks as any;

    const handleUploadImage = async (file: File) => {
        try {
            const fd = new FormData(); fd.append("image", file);
            // This endpoint might also change? Assuming /bio/upload-image for now
            const res = await api.post("/bio-builder/upload-image", fd, { headers: { "Content-Type": "multipart/form-data" } });
            return res.data?.url;
        } catch { showModal("error", "Error", "Failed to upload image."); return null; }
    };

    const handleShareLink = () => { navigator.clipboard.writeText(publicUrl); setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); };

    const handleSaveAdvanced = async () => {
        if (!profile) return;
        const linkId = profile.link_id || profile.id;
        setIsSavingAdvanced(true);
        try {
            // Build the exact payload expected by PUT /bio/pages/{link_id}
            const payload = {
                url: profile.url,
                is_enabled: true,
                biolink_theme_id: (profile as any).biolink_theme_id ?? null,
                settings: {
                    seo: {
                        block: advancedSettings.seoBlock,
                        title: advancedSettings.seoTitle,
                        meta_description: advancedSettings.seoDescription,
                        meta_keywords: advancedSettings.seoKeywords,
                        opengraph_image: advancedSettings.seoOpenGraphImage,
                        language: advancedSettings.seoLanguage,
                    },
                    branding: {
                        name: advancedSettings.brandingName,
                        url: advancedSettings.brandingUrl,
                    },
                    display_branding: advancedSettings.displayBranding,
                    utm: {
                        source: advancedSettings.utmSource,
                        medium: advancedSettings.utmMedium,
                    },
                    background_type: advancedSettings.backgroundType,
                    background: advancedSettings.background,
                    text_color: advancedSettings.textColor,
                    font_size: advancedSettings.fontSize,
                    width: advancedSettings.width,
                    block_spacing: advancedSettings.blockSpacing,
                    hover_animation: advancedSettings.hoverAnimation,
                    share_is_enabled: advancedSettings.enableShareButton,
                    scroll_buttons_is_enabled: advancedSettings.enableScrollButtons,
                    password: advancedSettings.password || null,
                    sensitive_content: advancedSettings.sensitiveContentWarning,
                    branded_button_is_enabled: advancedSettings.brandedButtonEnabled,
                    branded_button_icon: advancedSettings.brandedIconUrl,
                    branded_button_title: advancedSettings.brandedModalTitle,
                    branded_button_content: advancedSettings.brandedModalContent,
                },
            };
            await api.put(`/bio/pages/${linkId}`, payload);
            // Refresh profile to sync hydrated state
            await fetchBuilderData();
            showModal("success", "Saved", "Growth settings saved successfully.");
        } catch {
            showModal("error", "Error", "Failed to save advanced settings.");
        } finally {
            setIsSavingAdvanced(false);
        }
    };

    const PHASES: Array<{ id: string; label: string; desc: string; hint: string; Icon: PhaseIconType; details: string[] }> = [
        { id: "identity", label: "1. Info", desc: "Name & Bio", hint: "Set your title, avatar, and short intro.", Icon: User, details: ["Upload your profile image.", "Add your brand title.", "Write a short bio visitors understand fast."] },
        { id: "blocks", label: "2. Content", desc: "Links & Photos", hint: "Add sections, buttons, and media blocks.", Icon: Layers, details: ["Create content sections.", "Add links, photos, or products.", "Arrange items in the order you want."] },
        { id: "visuals", label: "3. Style", desc: "Colors & Design", hint: "Pick the look, theme, and visual mood.", Icon: Palette, details: ["Choose the page look and feel.", "Match colors to your brand.", "Preview the design before launch."] },
        { id: "advanced", label: "4. Growth", desc: "Launch Gear", hint: "Turn on tracking, protection, and extras.", Icon: Sparkles, details: ["Enable pixels and analytics.", "Turn on password or warning protection.", "Add advanced brand controls and redirects."] }
    ];
    const currentPhase = PHASES.find((p) => p.id === view) || PHASES[0];
    const currentPhaseNumber = Math.max(PHASES.findIndex((p) => p.id === currentPhase.id), 0) + 1;
    const nextPhase = PHASES[currentPhaseNumber] || null;
    const completionPercent = Math.round((currentPhaseNumber / PHASES.length) * 100);
    const previewDemoProfile = {
        title: "Preview locked",
        bio: "Connect your Instagram account to unlock live editing. This demo keeps the layout visible.",
        theme: "photo_aura",
    };
    const previewDemoTabs = [{
        id: 1,
        title: "Demo",
        sections: [{
            id: 1,
            title: "Starter Links",
            blocks: [{ items: [{ title: "Join Waitlist", url: "#" }, { title: "Watch Demo", url: "#" }] }],
        }],
    }];

    if (!selectedPageId) return (
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-6"
             style={{ background: 'var(--app-surface-bg, var(--background))' }}>
            <div className="w-full max-w-6xl grid gap-6 xl:grid-cols-[minmax(0,1fr)_auto] items-center">
                <div className="rounded-[32px] border border-slate-200 dark:border-white/10 bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl shadow-[0_24px_80px_rgba(0,0,0,0.05)] p-6 sm:p-10">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center text-primary shadow-inner mb-6"><Monitor size={40} /></div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Deployment Required</h2>
                    <p className="mt-3 max-w-xl text-slate-600 dark:text-slate-300 font-medium leading-relaxed">Please connect your Instagram account first to unlock the Creator Studio. A demo preview is shown beside this message so you can still verify the layout.</p>
                    <button onClick={() => window.location.href = '/dashboard/instagram/connect'} className="mt-6 h-14 px-10 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all shadow-lg shadow-primary/20">Connect Now</button>
                </div>
                <div className="w-full flex justify-center">
                    <PhonePreview profile={previewDemoProfile} tabs={previewDemoTabs} selectedTabId={1} setSelectedTabId={() => { }} viewportOffset={220} previewWidth={360} uiTypeOverrides={{}} />
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-transparent font-sans selection:bg-primary/10 flex flex-col relative"
             style={{ background: 'var(--app-surface-bg, var(--background))' }}>

            {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ STABLE TOP BAR ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
            <header className="relative z-50 h-14 flex items-center justify-between px-6 bg-white/85 dark:bg-black/70 backdrop-blur-2xl border-b border-slate-100 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
                        <Sparkles size={16} />
                    </div>
                    <div className="min-w-0">
                        <span className="block text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">Creator Studio</span>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">Bio link builder</span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-300">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        {instagramUsername}
                    </div>
                    <button onClick={handleShareLink} className="h-8 px-4 rounded-lg bg-primary text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:opacity-90 transition-all shadow-md shadow-primary/10">
                        {copiedLink ? <CheckCircle2 size={14} /> : <Share2 size={14} />}
                        {copiedLink ? "COPIED" : "SHARE"}
                    </button>
                </div>
            </header>

            {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ CREATOR WORKSPACE ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
            <div className="relative flex-1 flex overflow-hidden">

                <main className={cn("flex-1 overflow-y-auto no-scrollbar relative z-10 xl:pr-[440px] pb-56 sm:pb-60 xl:pb-64", activePanel === "preview" ? "hidden xl:block" : "block")}>
                    <div className="max-w-5xl mx-auto px-3 sm:px-6 py-5 xl:pl-4">

                        {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ FLOATING STEP GUIDE + BAR ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
                        <div className="fixed bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[min(460px,calc(100%-1rem))] sm:w-[min(560px,calc(100%-1.5rem))] rounded-full border border-slate-200 dark:border-white/10 bg-white/96 dark:bg-slate-900/90 backdrop-blur-2xl px-1 py-1 shadow-[0_16px_34px_rgba(0,0,0,0.05)]">
                            <div className="grid grid-cols-4 gap-1">
                                {PHASES.map((p, idx) => (
                                    <button key={p.id} onClick={() => setView(p.id)}
                                        className="group relative outline-none">
                                        <div className="pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+12px)] w-[200px] sm:w-[240px] hidden group-hover:block">
                                            <div className="rounded-[22px] border border-slate-200/80 dark:border-white/10 bg-white/98 dark:bg-slate-950 p-2.5 shadow-[0_16px_34px_rgba(0,0,0,0.08)] text-left opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200">
                                                <div className="flex items-start gap-3">
                                                    <div className={cn("w-9 h-9 rounded-2xl flex items-center justify-center shrink-0", p.id === view ? "bg-slate-900 text-white" : "bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-300")}>
                                                        <p.Icon size={18} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Step {idx + 1}</p>
                                                        <p className="text-[13px] font-semibold text-slate-900 dark:text-white mt-1 leading-snug">{p.desc}</p>
                                                        <p className="text-[11px] text-slate-500 dark:text-slate-300 mt-1 leading-relaxed">{p.hint}</p>
                                                    </div>
                                                </div>
                                                <div className="mt-2.5 space-y-1.5 border-t border-slate-100 dark:border-white/10 pt-2.5">
                                                    {p.details.map((detail) => (
                                                        <div key={detail} className="flex items-start gap-2 text-[11px] text-slate-600 dark:text-slate-300">
                                                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                                                            <span>{detail}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className={cn("flex flex-col items-center justify-center gap-0.5 min-h-[44px] sm:min-h-[48px] px-1.5 rounded-full transition-all duration-300 border",
                                            view === p.id
                                                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.02]"
                                                : "bg-white/80 dark:bg-white/5 text-slate-500 border-transparent hover:border-slate-200 dark:hover:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10")}>
                                            <div className={cn("w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[11px] font-black", view === p.id ? "bg-white/20 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-500")}>{idx + 1}</div>
                                            <span className={cn("hidden lg:block text-[8px] font-black uppercase tracking-[0.12em] truncate", view === p.id ? "text-white" : "text-slate-600 dark:text-slate-300")}>{p.label}</span>
                                            {view === p.id && <div className="absolute inset-x-6 -bottom-1 h-1 bg-white/40 rounded-full" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-8 flex flex-wrap items-center justify-between gap-3 rounded-[20px] border border-slate-200/80 dark:border-white/10 bg-white/85 dark:bg-white/5 px-4 py-3 shadow-sm mt-4">
                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Step {currentPhaseNumber} of {PHASES.length}</p>
                                <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">Current: {currentPhase.desc}</p>
                                <p className="text-xs text-slate-500 mt-1 leading-relaxed">Use the steps above to move through setup in order. Each step shows what to complete next.</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="hidden sm:block w-44 h-2 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                                    <div className="h-full rounded-full bg-slate-400 dark:bg-slate-600" style={{ width: `${completionPercent}%` }} />
                                </div>
                                <span className="text-xs font-black text-slate-900 dark:text-white">{completionPercent}%</span>
                                {nextPhase ? (
                                    <button
                                        onClick={() => setView(nextPhase.id)}
                                        className="h-9 px-4 rounded-full bg-primary text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-md shadow-primary/20 hover:opacity-90 transition-all"
                                    >
                                        Next <ArrowRight size={12} />
                                    </button>
                                ) : (
                                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Final step ready</span>
                                )}
                            </div>
                        </div>

                        {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ PHASE CONTENT AREA ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
                        <AnimatePresence mode="wait">
                            <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2 }}>

                                <div className="mb-8">
                                    <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white tracking-normal mb-2 capitalize">
                                        {view === 'identity' ? "Setup your Profile" : view === 'blocks' ? "Build your Content" : view === 'visuals' ? 'Style your Page' : 'Launch Preparation'}
                                    </h2>
                                    <p className="text-sm text-slate-500 font-normal max-w-2xl leading-relaxed">Each section is designed to guide you from setup to launch without needing to guess what happens next.</p>
                                </div>

                                {view === "identity" && (
                                    <div className="space-y-6">
                                        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                                            <div className="flex items-center gap-8 mb-10 pb-10 border-b border-slate-100 dark:border-slate-800">
                                                <label className="relative cursor-pointer shrink-0">
                                                    <div className="w-24 h-24 rounded-full bg-slate-50 dark:bg-slate-800 overflow-hidden ring-4 ring-slate-100 dark:ring-slate-700 shadow-inner border-2 border-slate-100 dark:border-slate-700">
                                                        {profile?.avatar ? <img src={profile.avatar} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-300"><User size={32} /></div>}
                                                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 hover:opacity-100 flex items-center justify-center transition-all">
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
                                                        className="w-full px-5 py-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-slate-300 dark:focus:border-slate-600 text-sm font-medium text-slate-900 dark:text-white outline-none resize-none transition-all"
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
                                    <div className="space-y-6 pb-28 sm:pb-32">
                                        <div className="flex items-center justify-between rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 px-4 py-3">
                                            <div>
                                                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-400">Content Area</p>
                                                <p className="text-sm font-semibold text-slate-900 dark:text-white">Blocks</p>
                                            </div>
                                            <span className="text-xs text-slate-500">{visibleBlocks.length} items</span>
                                        </div>

                                        <div className="space-y-6">
                                            {(!currentTab || visibleBlocks.length === 0) ? (
                                                <div className="py-20 text-center bg-white dark:bg-slate-950 rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center">
                                                    <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 mb-6">
                                                        <Grid size={28} />
                                                    </div>
                                                    <h3 className="text-xl font-black text-slate-950 dark:text-white mb-2 tracking-tight">Ready to Start?</h3>
                                                    <p className="text-[13px] text-slate-400 mb-8 max-w-xs mx-auto font-medium">Create your first block to start building your content canvas.</p>
                                                    <button onClick={() => openBlockMarketplace()}
                                                        className="h-12 px-10 rounded-xl bg-primary text-white text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all animate-bounce">
                                                        Create Block
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-6">
                                                    <div className="grid gap-4">
                                                        {visibleBlocks.map((block: any) => {
                                                            const uiType = getUiTypeFromBlock(block, uiTypeOverrides);
                                                            const color = BLOCK_COLORS[uiType] || "#6B7280";
                                                            const icon = BLOCK_ICONS[uiType] || <LayoutTemplate size={20} />;
                                                            const isEditable = true;

                                                            return (
                                                                <motion.div
                                                                    layout
                                                                    key={block.id}
                                                                    onClick={(e) => {
                                                                        if (!isEditable) return;
                                                                        const target = e.target as HTMLElement;
                                                                        if (target.closest("button, a, input, textarea, select, label, [data-no-edit='true']")) return;
                                                                        openEditor(block);
                                                                    }}
                                                                    className={cn("flex items-center gap-5 p-6 rounded-3xl border-2 transition-all group/block relative overflow-hidden",
                                                                        isEditable ? "cursor-pointer bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-xl hover:translate-x-1"
                                                                            : "bg-slate-50 dark:bg-slate-950 content-none opacity-60")}>
                                                                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg" style={{ backgroundColor: `${color}15`, color }}>
                                                                        {icon}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <p className="text-[15px] font-black text-slate-900 dark:text-slate-100 tracking-tight capitalize truncate">
                                                                            {block.settings?.title || block.settings?.name || block.settings?.text || uiType.replace(/_/g, " ")}
                                                                        </p>
                                                                        <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-widest">{uiType.replace(/_/g, " ")} Ãƒâ€šÃ‚Â· Tap to Edit</p>
                                                                    </div>
                                                                    {!isArranging && (
                                                                        <button
                                                                            onClick={e => { e.stopPropagation(); handleDeleteBlock(block.id); }}
                                                                            data-no-edit="true"
                                                                            className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-red-50 dark:hover:bg-red-500/10 hover:border-red-200 dark:hover:border-red-500/30 hover:text-red-500 text-slate-400 flex items-center justify-center transition-all shrink-0"
                                                                            aria-label="Delete block"
                                                                            title="Delete block"
                                                                        >
                                                                            <Trash2 size={16} />
                                                                        </button>
                                                                    )}
                                                                </motion.div>
                                                            );
                                                        })}
                                                    </div>
                                                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                                                        <button onClick={() => openBlockMarketplace()}
                                                            className="flex-1 h-16 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center gap-3 text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 hover:text-slate-900 dark:hover:text-white transition-all text-[11px] font-black uppercase tracking-widest group">
                                                            <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                                                            Create Block
                                                        </button>
                                                        <button onClick={() => setView('visuals')} className="h-16 px-8 rounded-2xl bg-slate-900 text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2">
                                                            Next: Style <ArrowRight size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {view === "visuals" && <VisualsLab profile={profile} updateProfile={(u: any) => setProfile(prev => prev ? ({ ...prev, ...u }) : prev)} />}

                                {view === "advanced" && (() => {
                                    const GROWTH_TABS = [
                                        { id: "seo",        label: "SEO",        icon: Globe,        color: "emerald", bg: "bg-emerald-500",  ring: "ring-emerald-200 dark:ring-emerald-800",  text: "text-emerald-600 dark:text-emerald-400",  light: "bg-emerald-50 dark:bg-emerald-950/30"  },
                                        { id: "branding",   label: "Branding",   icon: Shuffle,      color: "violet",  bg: "bg-violet-500",   ring: "ring-violet-200 dark:ring-violet-800",    text: "text-violet-600 dark:text-violet-400",    light: "bg-violet-50 dark:bg-violet-950/30"    },
                                        { id: "pixels",     label: "Pixels",     icon: CircleDot,    color: "blue",    bg: "bg-blue-500",     ring: "ring-blue-200 dark:ring-blue-800",        text: "text-blue-600 dark:text-blue-400",        light: "bg-blue-50 dark:bg-blue-950/30"        },
                                        { id: "utm",        label: "UTM",        icon: Grid,         color: "amber",   bg: "bg-amber-500",    ring: "ring-amber-200 dark:ring-amber-800",      text: "text-amber-600 dark:text-amber-400",      light: "bg-amber-50 dark:bg-amber-950/30"      },
                                        { id: "protection", label: "Protection", icon: ShieldAlert,  color: "red",     bg: "bg-red-500",      ring: "ring-red-200 dark:ring-red-800",          text: "text-red-600 dark:text-red-400",          light: "bg-red-50 dark:bg-red-950/30"          },
                                        { id: "popup",      label: "Popup",      icon: SmartphoneNfc,color: "fuchsia", bg: "bg-fuchsia-500",  ring: "ring-fuchsia-200 dark:ring-fuchsia-800",  text: "text-fuchsia-600 dark:text-fuchsia-400",  light: "bg-fuchsia-50 dark:bg-fuchsia-950/30"  },
                                        { id: "more",       label: "Advanced",   icon: Orbit,        color: "slate",   bg: "bg-slate-500",    ring: "ring-slate-200 dark:ring-slate-700",      text: "text-slate-600 dark:text-slate-400",      light: "bg-slate-50 dark:bg-slate-800/30"      },
                                    ];
                                    const activeGT = GROWTH_TABS.find(t => t.id === growthTab) || GROWTH_TABS[0];
                                    const GtIcon = activeGT.icon;

                                    return (
                                    <div className="max-w-4xl space-y-0">

                                        {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ GROWTH HERO HEADER ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
                                        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-6 sm:p-8 mb-6 border border-white/10">
                                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
                                            <div className="relative flex flex-wrap items-center justify-between gap-4">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="w-10 h-10 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary">
                                                            <Sparkles size={20} />
                                                        </div>
                                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Growth Workstation</span>
                                                    </div>
                                                    <h3 className="text-2xl font-black text-white tracking-tight">Launch Gear</h3>
                                                    <p className="text-sm text-slate-400 mt-1 max-w-sm">SEO, tracking pixels, UTM parameters, and advanced protection for your bio page.</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-center">
                                                        <p className="text-3xl font-black text-white">{enabledAdvancedFlags.length}</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active</p>
                                                    </div>
                                                    <div className="h-10 w-px bg-white/10" />
                                                    <div className="text-center">
                                                        <p className="text-3xl font-black text-white">6</p>
                                                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Sections</p>
                                                    </div>
                                                </div>
                                            </div>
                                            {enabledAdvancedFlags.length > 0 && (
                                                <div className="relative mt-5 flex flex-wrap gap-2">
                                                    {enabledAdvancedFlags.map((flag) => (
                                                        <span key={flag} className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-white text-[10px] font-bold uppercase tracking-wide">{flag}</span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ TABS + CONTENT PANEL ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
                                        <div className="flex gap-4 sm:gap-6">

                                            {/* LEFT SIDEBAR TABS */}
                                            <div className="flex flex-col gap-1.5 w-[52px] sm:w-[160px] shrink-0">
                                                {GROWTH_TABS.map((tab) => {
                                                    const Icon = tab.icon;
                                                    const isActive = growthTab === tab.id;
                                                    return (
                                                        <button key={tab.id} onClick={() => setGrowthTab(tab.id)}
                                                            className={cn(
                                                                "group relative flex items-center gap-3 h-12 sm:h-11 rounded-2xl border transition-all duration-200 overflow-hidden text-left",
                                                                isActive
                                                                    ? `${tab.light} border-transparent ring-2 ${tab.ring} shadow-sm`
                                                                    : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                                                            )}>
                                                            {/* Active stripe */}
                                                            {isActive && <div className={cn("absolute left-0 top-2 bottom-2 w-1 rounded-r-full", tab.bg)} />}
                                                            <div className={cn(
                                                                "w-full sm:w-auto flex items-center justify-center sm:justify-start gap-3 px-3 sm:pl-4 sm:pr-3",
                                                            )}>
                                                                <Icon size={16} className={isActive ? tab.text : "text-slate-400"} />
                                                                <span className={cn(
                                                                    "hidden sm:block text-[11px] font-black uppercase tracking-widest truncate",
                                                                    isActive ? tab.text : "text-slate-500 dark:text-slate-400"
                                                                )}>{tab.label}</span>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>

                                            {/* RIGHT CONTENT PANEL */}
                                            <div className="flex-1 min-w-0">
                                                <AnimatePresence mode="wait">
                                                    <motion.div key={growthTab} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -8 }} transition={{ duration: 0.15 }}
                                                        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">

                                                        {/* Panel header */}
                                                        <div className={cn("px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3", activeGT.light)}>
                                                            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm", activeGT.bg)}>
                                                                <GtIcon size={18} />
                                                            </div>
                                                            <div>
                                                                <p className={cn("text-[10px] font-black uppercase tracking-[0.2em]", activeGT.text)}>Growth Workstation</p>
                                                                <p className="text-sm font-black text-slate-900 dark:text-white">{activeGT.label}</p>
                                                            </div>
                                                        </div>

                                                        {/* Panel body */}
                                                        <div className="p-5 sm:p-7 space-y-6">

                                                            {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ SEO ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
                                                            {growthTab === "seo" && (<>
                                                                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                                                    <div>
                                                                        <p className="text-sm font-black text-slate-900 dark:text-white">Block from search engines</p>
                                                                        <p className="text-[11px] text-slate-500 mt-0.5">Adds noindex, nofollow meta tags to this page.</p>
                                                                    </div>
                                                                    <ToggleSwitch checked={advancedSettings.seoBlock} onChange={(v) => setAdvancedSettings({ ...advancedSettings, seoBlock: v })} />
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">SEO Title</label>
                                                                    <input value={advancedSettings.seoTitle} onChange={(e) => setAdvancedSettings({ ...advancedSettings, seoTitle: e.target.value })}
                                                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-300 dark:focus:border-emerald-700 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all"
                                                                        placeholder="My Awesome Bio Page" />
                                                                    <p className="text-[11px] text-slate-400 ml-1">Appears in browser tabs and search results.</p>
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Meta Description</label>
                                                                    <textarea value={advancedSettings.seoDescription} onChange={(e) => setAdvancedSettings({ ...advancedSettings, seoDescription: e.target.value })}
                                                                        rows={3} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-300 dark:focus:border-emerald-700 text-sm font-semibold text-slate-900 dark:text-white outline-none resize-none transition-all"
                                                                        placeholder="Brief description of your page for search results." />
                                                                    <p className="text-[11px] text-slate-400 ml-1">Recommended: 120ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Å“160 characters.</p>
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Meta Keywords</label>
                                                                    <input value={advancedSettings.seoKeywords} onChange={(e) => setAdvancedSettings({ ...advancedSettings, seoKeywords: e.target.value })}
                                                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-300 dark:focus:border-emerald-700 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all"
                                                                        placeholder="bio, links, creator, profile" />
                                                                    <p className="text-[11px] text-slate-400 ml-1">Comma-separated. Optional.</p>
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                                                        <ImageIcon size={12} /> Open graph image
                                                                    </label>
                                                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent transition-all">
                                                                        <div className="flex-1">
                                                                            <input 
                                                                                type="file" 
                                                                                id="og-image-upload" 
                                                                                className="hidden" 
                                                                                accept=".jpg,.jpeg,.png,.svg,.gif,.webp,.avif"
                                                                                onChange={async (e) => {
                                                                                    if (e.target.files && e.target.files[0]) {
                                                                                        const url = await handleUploadImage(e.target.files[0]);
                                                                                        if (url) setAdvancedSettings({ ...advancedSettings, seoOpenGraphImage: url });
                                                                                    }
                                                                                }}
                                                                            />
                                                                            <label htmlFor="og-image-upload" className="cursor-pointer inline-flex h-9 items-center justify-center rounded-lg bg-white dark:bg-slate-700 px-4 text-xs font-semibold text-slate-900 border border-slate-200 dark:border-slate-600 dark:text-white shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                                                                                Choose File
                                                                            </label>
                                                                            <span className="ml-3 text-xs text-slate-500 font-medium truncate max-w-[200px] inline-block align-middle">
                                                                                {advancedSettings.seoOpenGraphImage ? advancedSettings.seoOpenGraphImage.split('/').pop() : 'No file chosen'}
                                                                            </span>
                                                                        </div>
                                                                        {advancedSettings.seoOpenGraphImage && (
                                                                            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white">
                                                                                <img src={advancedSettings.seoOpenGraphImage} alt="OG Preview" className="w-full h-full object-cover" />
                                                                                <button onClick={() => setAdvancedSettings({ ...advancedSettings, seoOpenGraphImage: "" })} className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white rounded-bl flex items-center justify-center">
                                                                                    <X size={10} />
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-[11px] text-slate-400 ml-1">.jpg, .jpeg, .png, .svg, .gif, .webp, .avif allowed. 2 MB maximum.</p>
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                                                        <Globe size={12} /> Language
                                                                    </label>
                                                                    <select value={advancedSettings.seoLanguage} onChange={(e) => setAdvancedSettings({ ...advancedSettings, seoLanguage: e.target.value })}
                                                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-300 dark:focus:border-emerald-700 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all appearance-none cursor-pointer"
                                                                    >
                                                                        <option value="en">English</option>
                                                                        <option value="es">Spanish</option>
                                                                        <option value="fr">French</option>
                                                                        <option value="de">German</option>
                                                                        <option value="it">Italian</option>
                                                                        <option value="pt">Portuguese</option>
                                                                        <option value="hi">Hindi</option>
                                                                        <option value="ar">Arabic</option>
                                                                        <option value="ja">Japanese</option>
                                                                        <option value="ko">Korean</option>
                                                                        <option value="zh">Chinese</option>
                                                                    </select>
                                                                    <p className="text-[11px] text-slate-400 ml-1">Set the meta language of your page to help browsers and search engines identify its language.</p>
                                                                </div>
                                                            </>)}


                                                            {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ BRANDING ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
                                                            {growthTab === "branding" && (<>
                                                                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                                                    <div>
                                                                        <p className="text-sm font-black text-slate-900 dark:text-white">Display branding</p>
                                                                        <p className="text-[11px] text-slate-500 mt-0.5">Show the BotChat branding badge on your public page.</p>
                                                                    </div>
                                                                    <ToggleSwitch checked={advancedSettings.displayBranding} onChange={(v) => setAdvancedSettings({ ...advancedSettings, displayBranding: v })} />
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Branding Name</label>
                                                                    <input value={advancedSettings.brandingName} onChange={(e) => setAdvancedSettings({ ...advancedSettings, brandingName: e.target.value })}
                                                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-violet-300 dark:focus:border-violet-700 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all"
                                                                        placeholder="Your brand name" />
                                                                    <p className="text-[11px] text-slate-400 ml-1">Leave empty to use the default site branding.</p>
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Branding URL</label>
                                                                    <input value={advancedSettings.brandingUrl} onChange={(e) => setAdvancedSettings({ ...advancedSettings, brandingUrl: e.target.value })}
                                                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-violet-300 dark:focus:border-violet-700 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all"
                                                                        placeholder="https://yourbrand.com" />
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Branding Text Color</label>
                                                                    <div className="flex gap-3">
                                                                        <input type="color" value={advancedSettings.brandingTextColor || "#ffffff"}
                                                                            onChange={(e) => setAdvancedSettings({ ...advancedSettings, brandingTextColor: e.target.value })}
                                                                            className="h-12 w-16 rounded-xl cursor-pointer border-2 border-slate-200 dark:border-slate-700 bg-transparent" />
                                                                        <input value={advancedSettings.brandingTextColor} onChange={(e) => setAdvancedSettings({ ...advancedSettings, brandingTextColor: e.target.value })}
                                                                            className="flex-1 h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-violet-300 dark:focus:border-violet-700 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all font-mono"
                                                                            placeholder="#1f2937" />
                                                                    </div>
                                                                </div>
                                                            </>)}

                                                            {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ PIXELS ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
                                                            {growthTab === "pixels" && (<>
                                                                <p className="text-[11px] text-slate-500">Connect your analytics pixels to track bio page visits and conversions.</p>
                                                                <div className="space-y-3">
                                                                    {[
                                                                        { key: "pixelFacebookEnabled", label: "Facebook Pixel", desc: "Track events with the Meta Pixel", icon: Facebook, color: "bg-blue-600" },
                                                                        { key: "pixelGoogleEnabled",   label: "Google Analytics", desc: "Connect Google Analytics to this page", icon: Globe, color: "bg-red-500" },
                                                                    ].map(({ key, label, desc, icon: Ico, color }) => (
                                                                        <div key={key} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                                                            <div className="flex items-center gap-3">
                                                                                <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs", color)}>
                                                                                    <Ico size={16} />
                                                                                </div>
                                                                                <div>
                                                                                    <p className="text-sm font-black text-slate-900 dark:text-white">{label}</p>
                                                                                    <p className="text-[11px] text-slate-500">{desc}</p>
                                                                                </div>
                                                                            </div>
                                                                            <ToggleSwitch checked={(advancedSettings as any)[key]} onChange={(v) => setAdvancedSettings({ ...advancedSettings, [key]: v })} />
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </>)}

                                                            {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ UTM ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
                                                            {growthTab === "utm" && (<>
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                                                        <Shuffle size={12} /> Source
                                                                    </label>
                                                                    <input value={advancedSettings.utmSource} onChange={(e) => setAdvancedSettings({ ...advancedSettings, utmSource: e.target.value })}
                                                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-amber-300 dark:focus:border-amber-700 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all"
                                                                        placeholder="e.g. instagram, newsletter, google" />
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                                                        <Monitor size={12} /> Medium
                                                                    </label>
                                                                    <input value={advancedSettings.utmMedium} onChange={(e) => setAdvancedSettings({ ...advancedSettings, utmMedium: e.target.value })}
                                                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-amber-300 dark:focus:border-amber-700 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all"
                                                                        placeholder="e.g. social, link, banner, email" />
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                                                        <Megaphone size={12} /> Campaign
                                                                    </label>
                                                                    <div className="w-full h-12 px-4 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border-2 border-transparent text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center italic">
                                                                        Automatically set for each link based on the name.
                                                                    </div>
                                                                </div>
                                                                
                                                                <div className="pt-4 space-y-1.5 border-t border-slate-100 dark:border-slate-800">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                                                        <Eye size={12} /> UTM preview
                                                                    </label>
                                                                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800">
                                                                        <p className="text-xs font-mono text-amber-800 dark:text-amber-300 break-all leading-relaxed">
                                                                            {`?utm_source=${advancedSettings.utmSource || "source"}&utm_medium=${advancedSettings.utmMedium || "medium"}&utm_campaign={link_name}`}
                                                                        </p>
                                                                    </div>
                                                                    <p className="text-[11px] text-slate-400 ml-1">This query parameter will be appended to your destination URL.</p>
                                                                </div>
                                                            </>)}

                                                            {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ PROTECTION ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
                                                            {growthTab === "protection" && (<>
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                                                        <KeyRound size={12} /> Page Password
                                                                    </label>
                                                                    <div className="relative group">
                                                                        <input 
                                                                            type={showPassword ? "text" : "password"} 
                                                                            value={advancedSettings.password} 
                                                                            onChange={(e) => setAdvancedSettings({ ...advancedSettings, password: e.target.value })}
                                                                            className="w-full h-12 pl-4 pr-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-red-300 dark:focus:border-red-700 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all"
                                                                            placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢" />
                                                                        <button 
                                                                            type="button"
                                                                            onClick={() => setShowPassword(!showPassword)}
                                                                            className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 dark:text-slate-500 transition-colors"
                                                                        >
                                                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                                        </button>
                                                                    </div>
                                                                    <p className="text-[11px] text-slate-400 ml-1">Require visitors to enter a password to access your page.</p>
                                                                </div>
                                                                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                                                    <div>
                                                                        <p className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                                                                            <ShieldAlert size={14} className="text-red-500" /> Sensitive content warning
                                                                        </p>
                                                                        <p className="text-[11px] text-slate-500 mt-0.5 ml-5">Ask visitors to confirm before accessing potentially sensitive content.</p>
                                                                    </div>
                                                                    <ToggleSwitch checked={advancedSettings.sensitiveContentWarning} onChange={(v) => setAdvancedSettings({ ...advancedSettings, sensitiveContentWarning: v })} />
                                                                </div>
                                                            </>)}

                                                            {/* ── POPUP (BRANDED BUTTON) ── */}
                                                            {growthTab === "popup" && (<>
                                                                <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                                                    <div>
                                                                        <p className="text-sm font-black text-slate-900 dark:text-white">Enable branded button</p>
                                                                        <p className="text-[11px] text-slate-500 mt-0.5">Show a floating button that opens a modal popup.</p>
                                                                    </div>
                                                                    <ToggleSwitch checked={advancedSettings.brandedButtonEnabled} onChange={(v) => setAdvancedSettings({ ...advancedSettings, brandedButtonEnabled: v })} />
                                                                </div>

                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                                                        <ImageIcon size={12} /> Branded icon
                                                                    </label>
                                                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent transition-all">
                                                                        <div className="flex-1">
                                                                            <input 
                                                                                type="file" 
                                                                                id="branded-icon-upload" 
                                                                                className="hidden" 
                                                                                accept=".jpg,.jpeg,.png,.ico,.svg,.gif,.webp"
                                                                                onChange={async (e) => {
                                                                                    if (e.target.files && e.target.files[0]) {
                                                                                        const url = await handleUploadImage(e.target.files[0]);
                                                                                        if (url) setAdvancedSettings({ ...advancedSettings, brandedIconUrl: url });
                                                                                    }
                                                                                }}
                                                                            />
                                                                            <label htmlFor="branded-icon-upload" className="cursor-pointer inline-flex h-9 items-center justify-center rounded-lg bg-white dark:bg-slate-700 px-4 text-xs font-semibold text-slate-900 border border-slate-200 dark:border-slate-600 dark:text-white shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors">
                                                                                Choose File
                                                                            </label>
                                                                            <span className="ml-3 text-xs text-slate-500 font-medium truncate max-w-[200px] inline-block align-middle">
                                                                                {advancedSettings.brandedIconUrl ? advancedSettings.brandedIconUrl.split('/').pop() : 'No file chosen'}
                                                                            </span>
                                                                        </div>
                                                                        {advancedSettings.brandedIconUrl && (
                                                                            <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white">
                                                                                <img src={advancedSettings.brandedIconUrl} alt="Icon Preview" className="w-full h-full object-cover" />
                                                                                <button onClick={() => setAdvancedSettings({ ...advancedSettings, brandedIconUrl: "" })} className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white rounded-bl flex items-center justify-center">
                                                                                    <X size={10} />
                                                                                </button>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <p className="text-[11px] text-slate-400 ml-1">Make sure it's a 1:1 ratio sized image with transparent background. .jpg, .jpeg, .png, .ico, .svg, .gif, .webp allowed. 2 MB maximum.</p>
                                                                </div>

                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Modal title</label>
                                                                    <input value={advancedSettings.brandedModalTitle} onChange={(e) => setAdvancedSettings({ ...advancedSettings, brandedModalTitle: e.target.value })}
                                                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-fuchsia-300 dark:focus:border-fuchsia-700 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all"
                                                                        placeholder="Your Modal Title" />
                                                                </div>
                                                                
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Modal content</label>
                                                                    <textarea value={advancedSettings.brandedModalContent} onChange={(e) => setAdvancedSettings({ ...advancedSettings, brandedModalContent: e.target.value })}
                                                                        rows={4} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-fuchsia-300 dark:focus:border-fuchsia-700 text-sm font-semibold text-slate-900 dark:text-white outline-none resize-none transition-all"
                                                                        placeholder="Write your modal content here..." />
                                                                    <p className="text-[11px] text-slate-400 ml-1">This field accepts the usage of HTML.</p>
                                                                </div>
                                                            </>)}

                                                            {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ ADVANCED / MORE ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
                                                            {growthTab === "more" && (<>
                                                                {[
                                                                    { key: "enableShareButton",       label: "Share button",        desc: "Show a share button at the top of your page." },
                                                                    { key: "enableScrollButtons",     label: "Scroll buttons",      desc: "Add scroll-to-top and scroll-to-bottom buttons." },
                                                                    { key: "enableDirectoryDisplaying", label: "Directory listing", desc: "Make your bio page public in BotChat's directory." },
                                                                ].map(({ key, label, desc }) => (
                                                                    <div key={key} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
                                                                        <div>
                                                                            <p className="text-sm font-black text-slate-900 dark:text-white">{label}</p>
                                                                            <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>
                                                                        </div>
                                                                        <ToggleSwitch checked={(advancedSettings as any)[key]} onChange={(v) => setAdvancedSettings({ ...advancedSettings, [key]: v })} />
                                                                    </div>
                                                                ))}

                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Leap Link URL</label>
                                                                    <input value={advancedSettings.leapLinkUrl} onChange={(e) => setAdvancedSettings({ ...advancedSettings, leapLinkUrl: e.target.value })}
                                                                        className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-slate-300 dark:focus:border-slate-600 text-sm font-semibold text-slate-900 dark:text-white outline-none transition-all"
                                                                        placeholder="https://example.com/" />
                                                                    <p className="text-[11px] text-slate-400 ml-1">Redirect all visitors to this URL. Leave empty to disable.</p>
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Custom CSS</label>
                                                                    <textarea value={advancedSettings.customCss} onChange={(e) => setAdvancedSettings({ ...advancedSettings, customCss: e.target.value })}
                                                                        rows={4} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-slate-300 dark:focus:border-slate-600 text-xs font-mono text-slate-900 dark:text-white outline-none resize-none transition-all"
                                                                        placeholder="body { background: blue !important; }" />
                                                                </div>
                                                                <div className="space-y-1.5">
                                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Custom JS</label>
                                                                    <textarea value={advancedSettings.customJs} onChange={(e) => setAdvancedSettings({ ...advancedSettings, customJs: e.target.value })}
                                                                        rows={4} className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-slate-300 dark:focus:border-slate-600 text-xs font-mono text-slate-900 dark:text-white outline-none resize-none transition-all"
                                                                        placeholder={"<script>console.log('Hello world');</script>"} />
                                                                </div>
                                                            </>)}

                                                        </div>
                                                    </motion.div>
                                                </AnimatePresence>

                                                {/* SAVE BUTTON */}
                                                <div className="mt-5">
                                                    <button onClick={handleSaveAdvanced} disabled={isSavingAdvanced}
                                                        className={cn("w-full h-13 py-3.5 rounded-2xl text-white text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg disabled:opacity-60",
                                                            `${activeGT.bg} hover:opacity-90 shadow-${activeGT.color}-500/20`)}>
                                                        {isSavingAdvanced ? <><Loader2 size={14} className="animate-spin" /> Saving...</> : <><Save size={14} /> Save Growth Settings</>}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    );
                                })()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>


                {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ MOBILE SWITCHER ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
                <div className="xl:hidden fixed bottom-4 left-4 right-4 z-[200] h-16 bg-slate-950/92 backdrop-blur-xl rounded-[22px] flex p-1.5 shadow-2xl border border-white/10">
                    <button onClick={() => setActivePanel('builder')} className={cn("flex-1 rounded-xl flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all", activePanel === 'builder' ? 'bg-white text-slate-950 shadow-lg' : 'text-white/40')}>
                        <Edit3 size={16} /> Studio
                    </button>
                    <button onClick={() => setActivePanel('preview')} className={cn("flex-1 rounded-xl flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all", activePanel === 'preview' ? 'bg-white text-slate-950 shadow-lg' : 'text-white/40')}>
                        <Eye size={16} /> Portal
                    </button>
                </div>

                {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ PHONE PREVIEW PORTAL (PERMANENTLY VISIBLE ON XL) ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
                <aside className={cn("fixed right-0 top-14 z-50 hidden xl:flex w-[440px] flex-col p-6 bg-slate-50/95 dark:bg-[#020617]/95 backdrop-blur-2xl border-l border-slate-200 dark:border-slate-800 transition-all duration-500 h-[calc(100vh-56px)] shadow-[-24px_0_60px_rgba(0,0,0,0.05)]",
                    activePanel === "preview" ? "translate-x-0 opacity-100" : "translate-x-0 opacity-100")}>
                    <div className="flex-1 rounded-[34px] border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.05)] relative overflow-hidden">
                        <div className="relative h-full w-full flex items-center justify-center overflow-hidden rounded-[26px] border border-slate-100 dark:border-white/10 bg-white/55 dark:bg-white/[0.03] backdrop-blur-sm">
                            <PhonePreview profile={profile} tabs={tabs} selectedTabId={selectedTabId}
                                setSelectedTabId={setSelectedTabId} instagramUsername={instagramUsername} viewportOffset={140} previewWidth={360} uiTypeOverrides={uiTypeOverrides} />
                        </div>
                    </div>
                </aside>
            </div>

            {/* ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ MOBILE SWITCHER ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ÃƒÂ¢Ã¢â‚¬ÂÃ¢â€šÂ¬ */}
            <div className="xl:hidden fixed bottom-4 left-4 right-4 z-[200] h-16 bg-slate-950/92 backdrop-blur-xl rounded-[22px] flex p-1.5 shadow-2xl border border-white/10">
                <button onClick={() => setActivePanel('builder')} className={cn("flex-1 rounded-xl flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all", activePanel === 'builder' ? 'bg-white text-slate-950 shadow-lg' : 'text-white/40')}>
                    <Edit3 size={16} /> Studio
                </button>
                <button onClick={() => setActivePanel('preview')} className={cn("flex-1 rounded-xl flex items-center justify-center gap-2 text-[11px] font-black uppercase tracking-widest transition-all", activePanel === 'preview' ? 'bg-white text-slate-950 shadow-lg' : 'text-white/40')}>
                    <Eye size={16} /> Portal
                </button>
            </div>

            {/* MODALS */}
            <ModalShell open={showAddBlock} onClose={() => setShowAddBlock(false)} title="Create Block" icon={<Grid size={20} />} maxWidthClassName="sm:max-w-5xl">
                <BlockMarketplaceContent
                    onSelect={handleSelectBlockType}
                />
            </ModalShell>

            <ModalShell open={showCarouselEditor && !!editingBlock} onClose={() => setShowCarouselEditor(false)}
                title={`Edit ${getUiTypeFromBlock(editingBlock).replace(/_/g, " ") || "Block"}`}
                icon={editingBlock && (BLOCK_ICONS[getUiTypeFromBlock(editingBlock)] || <LayoutTemplate size={20} />)}
                footer={
                    <div className="flex flex-col sm:flex-row gap-3">
                        {!editingBlock?._isNew && (
                            <button
                                onClick={async () => {
                                    if (!editingBlock?.id) return;
                                    await handleDeleteBlock(editingBlock.id);
                                    setEditingBlock(null);
                                    setShowCarouselEditor(false);
                                }}
                                className="h-14 px-6 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 font-black uppercase tracking-widest text-[12px]"
                            >
                                Delete Block
                            </button>
                        )}
                        <button onClick={saveEditor} className="flex-1 h-14 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-[12px] shadow-xl">
                            {editingBlock?._isNew ? "Create block" : "Save Changes"}
                        </button>
                    </div>
                }>
                {editingBlock && (
                    <div className="space-y-6">
                        {(editingBlock.items || []).map((item: any, idx: number) => {
                            const uiType = getUiTypeFromBlock(editingBlock);
                            
                            return (
                                <div key={idx} className="space-y-6">
                                    {/* Image Type */}
                                    {uiType === "image" && (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                    <ImageIcon size={14} className="text-slate-400" /> Image
                                                </label>
                                                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3">
                                                    {item.image && (
                                                        <div className="w-full h-32 rounded-2xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-white dark:border-slate-700 shadow-md mb-2">
                                                            <img src={item.image} className="w-full h-full object-cover" />
                                                        </div>
                                                    )}
                                                    <label className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer hover:border-primary transition-all shadow-sm">
                                                        Choose File
                                                        <input type="file" className="hidden" onChange={async e => { if (e.target.files?.[0]) { const url = await handleUploadImage(e.target.files[0]); if (url) updateItem(idx, 'image', url); } }} />
                                                    </label>
                                                    <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-tight">.jpg, .png, .webp, .svg, .gif allowed. 2 MB maximum.</p>
                                                </div>
                                            </div>
                                            <InputField
                                                label="Destination URL"
                                                value={item.url || item.location_url || ""}
                                                onChange={(e: any) => updateItem(idx, 'url', e.target.value)}
                                                placeholder="https://example.com/"
                                                icon={<LinkIcon size={14} />}
                                            />
                                        </>
                                    )}

                                    {/* Socials Type */}
                                    {uiType === "socials" && (
                                        <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                            {[
                                                { key: 'email', label: 'Email', prefix: '', icon: <Globe size={14} />, placeholder: 'email@domain.com' },
                                                { key: 'tel', label: 'Telephone', prefix: '', icon: <Smartphone size={14} />, placeholder: '+00000000000' },
                                                { key: 'whatsapp', label: 'WhatsApp', prefix: '', icon: <SmartphoneNfc size={14} />, placeholder: '2124567890' },
                                                { key: 'facebook', label: 'Facebook', prefix: 'facebook.com/', icon: <Globe size={14} />, placeholder: 'facebook-page' },
                                                { key: 'instagram', label: 'Instagram', prefix: 'instagram.com/', icon: <Camera size={14} />, placeholder: 'Instagram username' },
                                                { key: 'twitter', label: 'Twitter', prefix: 'x.com/', icon: <Sparkles size={14} />, placeholder: 'Twitter username' },
                                                { key: 'youtube', label: 'YouTube Channel', prefix: 'youtube.com/', icon: <Youtube size={14} />, placeholder: 'Channel ID' },
                                                { key: 'tiktok', label: 'TikTok', prefix: 'tiktok.com/@', icon: <Video size={14} />, placeholder: 'TikTok username' },
                                                { key: 'linkedin', label: 'LinkedIn', prefix: 'linkedin.com/', icon: <Globe size={14} />, placeholder: 'Linked In Profile' },
                                                { key: 'discord', label: 'Discord', prefix: 'discord.gg/', icon: <Grid size={14} />, placeholder: 'Discord username' },
                                                { key: 'telegram', label: 'Telegram', prefix: 't.me/', icon: <Globe size={14} />, placeholder: 'telegram-username' },
                                            ].map((platform) => (
                                                <div key={platform.key} className="space-y-2">
                                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                        {platform.icon} {platform.label}
                                                    </label>
                                                    <div className="flex rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm transition-all focus-within:border-primary/30">
                                                        {platform.prefix && (
                                                            <div className="px-4 flex items-center bg-slate-50 dark:bg-slate-800 border-r border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-400">
                                                                {platform.prefix}
                                                            </div>
                                                        )}
                                                        <input
                                                            value={item.socials?.[platform.key] || ""}
                                                            onChange={(e) => {
                                                                const newSocials = { ...(item.socials || {}), [platform.key]: e.target.value };
                                                                updateItem(idx, 'socials', newSocials);
                                                            }}
                                                            placeholder={platform.placeholder}
                                                            className="flex-1 h-12 px-4 bg-transparent text-sm font-bold text-slate-900 dark:text-white outline-none"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Heading Type */}
                                    {uiType === "heading" && (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                    <LayoutTemplate size={14} className="text-slate-400" /> Type
                                                </label>
                                                <select
                                                    value={item.heading_type || "h1"}
                                                    onChange={(e) => updateItem(idx, 'heading_type', e.target.value)}
                                                    className="w-full h-14 px-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-primary/30 text-sm font-bold text-slate-900 dark:text-white outline-none transition-all appearance-none cursor-pointer"
                                                >
                                                    <option value="h1">H1</option>
                                                    <option value="h2">H2</option>
                                                    <option value="h3">H3</option>
                                                    <option value="h4">H4</option>
                                                    <option value="h5">H5</option>
                                                    <option value="h6">H6</option>
                                                </select>
                                            </div>
                                            <InputField
                                                label="Text"
                                                value={item.text || item.title || ""}
                                                onChange={(e: any) => {
                                                    updateItem(idx, 'text', e.target.value);
                                                    updateItem(idx, 'title', e.target.value); // Sync for display
                                                }}
                                                placeholder="Enter heading text"
                                            />
                                        </>
                                    )}

                                    {/* Business Hours Type */}
                                    {uiType === "business_hours" && (
                                        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                            <div className="flex flex-col gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Open 24/7</p>
                                                        <p className="text-[10px] text-slate-500 font-medium">Mark as always open.</p>
                                                    </div>
                                                    <ToggleSwitch checked={item.open_24_7 || false} onChange={v => updateItem(idx, 'open_24_7', v)} />
                                                </div>
                                                <div className="h-px bg-slate-200 dark:bg-slate-800" />
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900 dark:text-white">Temporarily closed</p>
                                                        <p className="text-[10px] text-slate-500 font-medium">Mark as temporarily closed.</p>
                                                    </div>
                                                    <ToggleSwitch checked={item.temporarily_closed || false} onChange={v => updateItem(idx, 'temporarily_closed', v)} />
                                                </div>
                                            </div>

                                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day, dIdx) => (
                                                <div key={day} className="space-y-2">
                                                    <div className="flex items-center gap-2 text-xs font-black text-slate-400 uppercase tracking-widest pl-2">
                                                        <Clock size={12} /> {day}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <input
                                                            value={day}
                                                            readOnly
                                                            className="w-1/3 h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 text-sm font-bold text-slate-400 outline-none"
                                                        />
                                                        <input
                                                            value={item[`day_${dIdx + 1}`] || ""}
                                                            onChange={(e) => updateItem(idx, `day_${dIdx + 1}`, e.target.value)}
                                                            placeholder="10:00 - 18:00, Closed or 24 H"
                                                            className="flex-1 h-12 px-5 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-primary/30 text-sm font-bold text-slate-900 dark:text-white outline-none transition-all"
                                                        />
                                                    </div>
                                                </div>
                                            ))}

                                            <div className="space-y-2">
                                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 pl-2">
                                                    <Edit3 size={12} /> Additional notice
                                                </label>
                                                <textarea
                                                    value={item.additional_notice || ""}
                                                    onChange={(e: any) => updateItem(idx, 'additional_notice', e.target.value)}
                                                    rows={3}
                                                    className="w-full px-5 py-4 rounded-xl bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 focus:border-primary/30 text-sm font-bold text-slate-900 dark:text-white outline-none resize-none transition-all"
                                                    placeholder="Holiday notices, etc..."
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* PayPal Type */}
                                    {uiType === "paypal" && (
                                        <div className="space-y-5">
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                    <MonitorPlay size={14} className="text-slate-400" /> Type
                                                </label>
                                                <select
                                                    value={item.type || "buy_now"}
                                                    onChange={(e) => updateItem(idx, 'type', e.target.value)}
                                                    className="w-full h-14 px-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-primary/30 text-sm font-bold text-slate-900 dark:text-white outline-none transition-all appearance-none cursor-pointer"
                                                >
                                                    <option value="buy_now">Buy now</option>
                                                    <option value="add_to_cart">Add to cart</option>
                                                    <option value="donation">Donation</option>
                                                </select>
                                            </div>
                                            <InputField label="PayPal email" value={item.email || ""} onChange={(e: any) => updateItem(idx, 'email', e.target.value)} placeholder="your@paypal.com" icon={<Mail size={14} />} />
                                            <InputField label="Product title" value={item.title || ""} onChange={(e: any) => updateItem(idx, 'title', e.target.value)} placeholder="Product Name" icon={<LayoutTemplate size={14} />} />
                                            <div className="grid grid-cols-2 gap-4">
                                                <InputField label="Currency code" value={item.currency || "USD"} onChange={(e: any) => updateItem(idx, 'currency', e.target.value)} placeholder="USD" icon={<Globe size={14} />} />
                                                <InputField label="Price" value={item.price || ""} onChange={(e: any) => updateItem(idx, 'price', e.target.value)} placeholder="0.00" icon={<Zap size={14} />} />
                                            </div>
                                            <InputField label="Name" value={item.name || ""} onChange={(e: any) => updateItem(idx, 'name', e.target.value)} placeholder="Button Text" icon={<Megaphone size={14} />} />
                                        </div>
                                    )}

                                    {/* Collectors */}
                                    {["email_collector", "phone_collector", "contact_collector"].includes(uiType) && (
                                        <InputField
                                            label="Name"
                                            value={item.name || item.title || ""}
                                            onChange={(e: any) => {
                                                updateItem(idx, 'name', e.target.value);
                                                updateItem(idx, 'title', e.target.value);
                                            }}
                                            placeholder="Enter form name"
                                            icon={<Megaphone size={14} />}
                                        />
                                    )}

                                    {/* Embeds */}
                                    {["spotify", "soundcloud", "youtube", "twitch", "vimeo", "tiktok_video"].includes(uiType) && (
                                        <InputField
                                            label={`${uiType.charAt(0).toUpperCase() + uiType.slice(1)} URL`}
                                            value={item.url || item.location_url || ""}
                                            onChange={(e: any) => {
                                                updateItem(idx, 'url', e.target.value);
                                                updateItem(idx, 'location_url', e.target.value);
                                            }}
                                            placeholder={`https://${uiType}.com/...`}
                                            icon={<LinkIcon size={14} />}
                                        />
                                    )}

                                    {/* Link Type */}
                                    {uiType === "link" && (
                                        <>
                                            <InputField
                                                label="Destination URL"
                                                value={item.url || item.location_url || ""}
                                                onChange={(e: any) => updateItem(idx, 'url', e.target.value)}
                                                placeholder="https://example.com/"
                                                icon={<LinkIcon size={14} />}
                                            />
                                            <InputField
                                                label="Name"
                                                value={item.name || item.title || ""}
                                                onChange={(e: any) => {
                                                    updateItem(idx, 'name', e.target.value);
                                                    updateItem(idx, 'title', e.target.value);
                                                }}
                                                placeholder="Your Link Name"
                                                icon={<Megaphone size={14} />}
                                            />
                                        </>
                                    )}

                                    {/* Paragraph Type */}
                                    {uiType === "paragraph" && (
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                <Edit3 size={14} className="text-slate-400" /> Text
                                            </label>
                                            <div className="rounded-2xl border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
                                                <div className="flex items-center gap-4 px-4 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                                                    <span className="text-xs font-bold text-slate-500">Normal</span>
                                                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-2" />
                                                    <div className="flex items-center gap-4 text-slate-400">
                                                        <span className="font-bold hover:text-primary cursor-pointer transition-colors">B</span>
                                                        <span className="italic hover:text-primary cursor-pointer transition-colors">I</span>
                                                        <span className="underline hover:text-primary cursor-pointer transition-colors">U</span>
                                                        <span className="line-through hover:text-primary cursor-pointer transition-colors">S</span>
                                                        <span className="hover:text-primary cursor-pointer transition-colors">A</span>
                                                        <LinkIcon size={14} className="hover:text-primary cursor-pointer transition-colors" />
                                                    </div>
                                                </div>
                                                <textarea
                                                    value={item.text || item.description || ""}
                                                    onChange={(e: any) => {
                                                        updateItem(idx, 'text', e.target.value);
                                                        updateItem(idx, 'description', e.target.value);
                                                    }}
                                                    rows={6}
                                                    className="w-full px-5 py-4 bg-transparent text-sm font-medium text-slate-900 dark:text-white outline-none resize-none"
                                                    placeholder="Write content..."
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Avatar Type */}
                                    {uiType === "avatar" && (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                    <ImageIcon size={14} className="text-slate-400" /> Image
                                                </label>
                                                <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-3">
                                                    <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center overflow-hidden border-2 border-white dark:border-slate-700 shadow-md">
                                                        {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <User size={24} className="text-slate-400" />}
                                                    </div>
                                                    <label className="px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 cursor-pointer hover:border-primary transition-all shadow-sm">
                                                        Choose File
                                                        <input type="file" className="hidden" onChange={async e => { if (e.target.files?.[0]) { const url = await handleUploadImage(e.target.files[0]); if (url) updateItem(idx, 'image', url); } }} />
                                                    </label>
                                                    <p className="text-[10px] text-slate-400 text-center font-bold uppercase tracking-tight">.jpg, .png, .webp allowed. 2 MB maximum.</p>
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                    <Maximize2 size={14} className="text-slate-400" /> Size
                                                </label>
                                                <select
                                                    value={item.size || "75x75px"}
                                                    onChange={(e) => updateItem(idx, 'size', e.target.value)}
                                                    className="w-full h-14 px-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-primary/30 text-sm font-bold text-slate-900 dark:text-white outline-none transition-all appearance-none cursor-pointer"
                                                >
                                                    <option value="75x75px">75x75px</option>
                                                    <option value="100x100px">100x100px</option>
                                                    <option value="125x125px">125x125px</option>
                                                    <option value="150x150px">150x150px</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                    <Grid size={14} className="text-slate-400" /> Border Radius
                                                </label>
                                                <select
                                                    value={item.border_radius || "straight"}
                                                    onChange={(e) => updateItem(idx, 'border_radius', e.target.value)}
                                                    className="w-full h-14 px-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-transparent focus:border-primary/30 text-sm font-bold text-slate-900 dark:text-white outline-none transition-all appearance-none cursor-pointer"
                                                >
                                                    <option value="straight">Straight</option>
                                                    <option value="round">Round</option>
                                                    <option value="rounded">Rounded</option>
                                                </select>
                                            </div>
                                        </>
                                    )}

                                    {/* Fallback for other types */}
                                    {!["heading", "link", "paragraph", "avatar", "image", "socials", "business_hours", "paypal", "email_collector", "phone_collector", "contact_collector", "spotify", "soundcloud", "youtube", "twitch", "vimeo", "tiktok_video"].includes(uiType) && (
                                        <div className="space-y-4">
                                            <InputField
                                                label="Primary Text"
                                                value={item.title || item.name || ""}
                                                onChange={(e: any) => updateItem(idx, 'title', e.target.value)}
                                                placeholder="Enter text"
                                            />
                                            {!["modal_text", "business_hours", "contact_form", "email_collector", "phone_collector"].includes(uiType) && (
                                                <InputField label="Endpoint URL" value={item.url || item.location_url || ""} onChange={(e: any) => updateItem(idx, 'url', e.target.value)} placeholder="https://..." />
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center gap-2 px-4 py-3 bg-blue-50/50 dark:bg-blue-900/10 rounded-xl border border-blue-100/50 dark:border-blue-900/20">
                                        <Info size={14} className="text-blue-500" />
                                        <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">All customization options available after creation.</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </ModalShell>
        </div>
    );
}
