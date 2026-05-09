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

export const BrandIcon = ({ name, size = 20 }: { name: string; size?: number }) => {
    switch (name.toLowerCase()) {
        case 'instagram':
            return (
                <svg width={size} height={size} viewBox="0 0 24 24" fill="url(#ig-grad)">
                    <defs>
                        <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#f09433" />
                            <stop offset="25%" stopColor="#e6683c" />
                            <stop offset="50%" stopColor="#dc2743" />
                            <stop offset="75%" stopColor="#cc2366" />
                            <stop offset="100%" stopColor="#bc1888" />
                        </linearGradient>
                    </defs>
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm3.98-10.169a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" />
                </svg>
            );
        case 'twitter':
        case 'x':
            return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;
        case 'facebook':
            return <svg width={size} height={size} viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>;
        case 'youtube':
            return <svg width={size} height={size} viewBox="0 0 24 24" fill="#FF0000"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>;
        case 'tiktok':
            return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.33 6.33 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>;
        case 'whatsapp':
        case 'tel':
            return <svg width={size} height={size} viewBox="0 0 24 24" fill="#25D366"><path d="M12.031 0C5.385 0 .002 5.385.002 12.031c0 2.119.546 4.184 1.59 6h-.002l-1.92 7 7.158-1.879a12.008 12.008 0 0 0 5.203 1.196L12.03 24c6.646 0 12.03-5.383 12.03-12.03S18.677 0 12.031 0H12.031zM11.996 22H11.986a9.98 9.98 0 0 1-5.111-1.4l-.364-.216-3.8.997 1.01-3.7-.238-.376C2.399 15.65 1.889 13.882 1.889 12.031 1.889 6.452 6.425 1.916 12 1.916c2.709 0 5.253 1.055 7.17 2.973 1.916 1.917 2.972 4.461 2.97 7.168.002 5.58-4.532 10.116-10.111 10.116H11.996zm5.556-7.585c-.305-.152-1.802-.888-2.08-.992-.28-.104-.482-.153-.686.151-.205.305-.788.993-.967 1.196-.178.204-.356.23-.66.077-1.4-.712-2.585-1.579-3.486-2.905-.236-.347.01-.527.169-.738.163-.217.305-.356.457-.558.152-.204.204-.343.305-.572.102-.23.05-.433-.025-.586-.077-.152-.686-1.654-.94-2.264-.247-.594-.496-.513-.686-.523l-.585-.01c-.204 0-.533.076-.813.38s-1.066 1.042-1.066 2.54 1.092 2.946 1.245 3.148c.152.204 2.146 3.275 5.195 4.59.723.313 1.288.5 1.727.64.726.233 1.388.2 1.908.121.583-.087 1.802-.736 2.055-1.447.254-.71.254-1.32.178-1.448-.076-.127-.28-.204-.585-.356z" /></svg>;
        case 'email':
            return <Mail size={size} />;
        case 'spotify':
            return <svg width={size} height={size} viewBox="0 0 24 24" fill="#1DB954"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.2-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" /></svg>;
        case 'smartphone':
            return <Smartphone size={size} />;
        default:
            return <Globe size={size} />;
    }
}
