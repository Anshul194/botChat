import React from "react";
import { LinkIcon, FileCode2, User, ImageIcon, Share2, CircleDot, Info, Megaphone, ShoppingBag, Orbit, Youtube, Video, Layers, Grid, MonitorPlay, Smartphone, Monitor, Hexagon, SmartphoneNfc, Globe, Mail, Camera, Sparkles, MoreHorizontal, LayoutTemplate, Zap, Star, ShieldCheck, Clock } from "lucide-react";

export const BLOCK_ICONS: Record<string, React.ReactNode> = {
    vcard: <User size={16} />, newsletter: <Mail size={16} />, divider: <MoreHorizontal size={16} />,
    link: <LinkIcon size={16} />, heading: <FileCode2 size={16} />, paragraph: <FileCode2 size={16} />,
    avatar: <User size={16} />, image: <ImageIcon size={16} />, socials: <Share2 size={16} />,
    business_hours: <CircleDot size={16} />, modal_text: <Info size={16} />,
    email_collector: <Megaphone size={16} />, phone_collector: <Megaphone size={16} />, contact_form: <Megaphone size={16} />,
    paypal: <ShoppingBag size={16} />, soundcloud: <Orbit size={16} />, spotify: <Orbit size={16} />,
    youtube: <Youtube size={16} />, twitch: <Video size={16} />, vimeo: <Video size={16} />, tiktok_video: <Video size={16} />,
    links_carousel: <Layers size={16} />, hero_single_link: <LinkIcon size={16} />, links_grid: <Grid size={16} />,
    ig_reels_sync: <Video size={16} />, ig_reels: <Video size={16} />, youtube_shorts: <Youtube size={16} />,
    long_form_videos: <MonitorPlay size={16} />, long_video: <MonitorPlay size={16} />,
    vertical_media: <Smartphone size={16} />, square_media: <ImageIcon size={16} />, horizontal_media: <Monitor size={16} />,
    add_logos: <Hexagon size={16} />, add_products: <ShoppingBag size={16} />, add_apps: <SmartphoneNfc size={16} />,
    hero_section: <LayoutTemplate size={16} />, stats_section: <CircleDot size={16} />, brands_section: <Hexagon size={16} />,
    portfolio_section: <Grid size={16} />, services_section: <ShoppingBag size={16} />, testimonials_section: <User size={16} />,
    faq_section: <Info size={16} />, cta_section: <Zap size={16} />,
    hero_product_section: <ShoppingBag size={16} />, featured_product_section: <Star size={16} />,
    product_list_section: <Layers size={16} />, trust_badges_section: <ShieldCheck size={16} />,
    urgency_offer_section: <Clock size={16} />, contact_section: <Mail size={16} />,
    // Aesthetic Influencer sections
    hero_aesthetic_section: <Sparkles size={16} />, stats_minimal_section: <CircleDot size={16} />,
    impact_section: <Zap size={16} />, testimonial_highlight_section: <User size={16} />,
    pricing_cards_section: <ShoppingBag size={16} />, portfolio_minimal_section: <Grid size={16} />,
    faq_cards_section: <Info size={16} />, cta_fullscreen_section: <Zap size={16} />,
};

export const BLOCK_COLORS: Record<string, string> = {
    links_carousel: "#6366F1", hero_single_link: "#6366F1", links_grid: "#8B5CF6",
    vertical_media: "#06B6D4", square_media: "#10B981", horizontal_media: "#F59E0B",
    add_logos: "#64748B", add_products: "#F97316", add_apps: "#3B82F6",
    ig_reels: "#4F46E5", ig_reels_sync: "#4F46E5", youtube_shorts: "#4F46E5",
};

export const normalizeBlockType = (value: unknown) => String(value || "").toLowerCase();

export const isImageOnlyType = (value: unknown) => {
    const type = normalizeBlockType(value);
    return /image|photo|picture/.test(type) || type === "square_media" || type === "add_logos";
};

export const isMediaType = (value: unknown) => {
    const type = normalizeBlockType(value);
    return isImageOnlyType(type) || type.includes("avatar") || type.includes("media");
};

export const mapPickerTypeToBackendType = (value: unknown) => {
    const type = normalizeBlockType(value);
    if (["image", "avatar"].includes(type)) return "square_media";
    if (["socials", "business_hours", "email_collector", "phone_collector", "contact_form"].includes(type)) return "links_grid";
    if (["paypal", "soundcloud", "spotify", "youtube", "twitch", "vimeo", "tiktok_video"].includes(type)) return "links_grid";
    return "hero_single_link";
};

export const getUiTypeFromBlock = (block: any, uiTypeOverrides?: Record<number, string>) =>
    normalizeBlockType(
        block?._uiType ||
        block?.items?.[0]?.builder_type ||
        (block?.id && uiTypeOverrides?.[block.id]) ||
        block?.type
    );

export const getDefaultItemForType = (value: unknown) => {
    const type = normalizeBlockType(value);
    if (isMediaType(type)) return { title: "", url: "", image_url: "", builder_type: type };
    if (["paragraph", "modal_text", "business_hours", "newsletter"].includes(type)) return { title: "", description: "", url: "", builder_type: type };
    if (type === "vcard") return { first_name: "", last_name: "", email: "", phone: "", organization: "", builder_type: type };
    if (type === "divider") return { builder_type: type };
    if (type === "heading") return { title: "", builder_type: type };
    if (["email_collector", "phone_collector", "contact_form"].includes(type)) return { title: "", description: "", builder_type: type };
    return { title: "", url: "https://", builder_type: type };
};

export const mergeTabsPreservingItems = (localTabs: any[], incomingTabs: any[]) => {
    if (!Array.isArray(incomingTabs) || incomingTabs.length === 0) {
        return Array.isArray(localTabs) ? localTabs : [];
    }


    return incomingTabs.map((incomingTab) => {
        const localTab = (localTabs || []).find((t: any) => t.id === incomingTab.id);
        const incomingSections = Array.isArray(incomingTab?.sections) ? incomingTab.sections : [];

        const mergedSections = incomingSections.map((incomingSection: any) => {
            const localSection = (localTab?.sections || []).find((s: any) => s.id === incomingSection.id);
            const incomingBlocks = Array.isArray(incomingSection?.blocks) ? incomingSection.blocks : [];

            const mergedBlocks = incomingBlocks.map((incomingBlock: any) => {
                const localBlock = (localSection?.blocks || []).find((b: any) => b.id === incomingBlock.id);
                const incomingItems = Array.isArray(incomingBlock?.items) ? incomingBlock.items : [];
                const localItems = Array.isArray(localBlock?.items) ? localBlock.items : [];
                const mergedItems = incomingItems.length > 0 ? incomingItems : localItems;
                return { ...incomingBlock, items: mergedItems };
            });

            return { ...incomingSection, blocks: mergedBlocks };
        });

        return { ...incomingTab, sections: mergedSections };
    });
};
