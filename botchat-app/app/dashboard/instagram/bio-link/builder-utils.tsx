import React from "react";
import { LinkIcon, FileCode2, User, ImageIcon, Share2, CircleDot, Info, Megaphone, ShoppingBag, Orbit, Youtube, Video, Layers, Grid, MonitorPlay, Smartphone, Monitor, Hexagon, SmartphoneNfc, Globe, Mail, Camera, Sparkles, MoreHorizontal, LayoutTemplate, Zap, Star, ShieldCheck, Clock, Phone } from "lucide-react";

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
    social_medias_section: <Share2 size={16} />,
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

/**
 * All supported social platforms for the picker UI.
 * Each has a key, label, brand color, and URL prefix.
 */
export const SOCIAL_PLATFORMS = [
    { key: 'tel',       label: 'Phone',     color: '#25D366', prefix: 'tel:' },
    { key: 'email',     label: 'Email',     color: '#EA4335', prefix: 'mailto:' },
    { key: 'whatsapp',  label: 'WhatsApp',  color: '#25D366', prefix: 'https://wa.me/' },
    { key: 'instagram', label: 'Instagram', color: '#E1306C', prefix: 'https://instagram.com/' },
    { key: 'facebook',  label: 'Facebook',  color: '#1877F2', prefix: 'https://facebook.com/' },
    { key: 'x',         label: 'X (Twitter)', color: '#000000', prefix: 'https://x.com/' },
    { key: 'youtube',   label: 'YouTube',   color: '#FF0000', prefix: 'https://youtube.com/' },
    { key: 'linkedin',  label: 'LinkedIn',  color: '#0A66C2', prefix: 'https://linkedin.com/in/' },
    { key: 'tiktok',    label: 'TikTok',    color: '#010101', prefix: 'https://tiktok.com/@' },
    { key: 'pinterest', label: 'Pinterest', color: '#E60023', prefix: 'https://pinterest.com/' },
    { key: 'snapchat',  label: 'Snapchat',  color: '#FFFC00', prefix: 'https://snapchat.com/add/' },
    { key: 'spotify',   label: 'Spotify',   color: '#1DB954', prefix: 'https://open.spotify.com/user/' },
    { key: 'discord',   label: 'Discord',   color: '#5865F2', prefix: 'https://discord.gg/' },
    { key: 'github',    label: 'GitHub',    color: '#333333', prefix: 'https://github.com/' },
    { key: 'telegram',  label: 'Telegram',  color: '#26A5E4', prefix: 'https://t.me/' },
    { key: 'twitch',    label: 'Twitch',    color: '#9146FF', prefix: 'https://twitch.tv/' },
    { key: 'threads',   label: 'Threads',   color: '#000000', prefix: 'https://threads.net/@' },
    { key: 'bereal',    label: 'BeReal',    color: '#000000', prefix: 'https://bere.al/' },
];

export const getBrandColor = (name: string): string => {
    const platform = SOCIAL_PLATFORMS.find(p => p.key === name.toLowerCase());
    return platform?.color || '#6366f1';
};

export const BrandIcon = ({ name, size = 20, colored = false }: { name: string; size?: number; colored?: boolean }) => {
    const n = name?.toLowerCase() || '';
    const color = colored ? getBrandColor(n) : 'currentColor';

    switch (n) {
        case 'instagram':
            return (
                <svg width={size} height={size} viewBox="0 0 24 24" fill={colored ? "url(#ig-grad-" + size + ")" : color}>
                    {colored && (
                        <defs>
                            <linearGradient id={"ig-grad-" + size} x1="0%" y1="100%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#f09433" />
                                <stop offset="25%" stopColor="#e6683c" />
                                <stop offset="50%" stopColor="#dc2743" />
                                <stop offset="75%" stopColor="#cc2366" />
                                <stop offset="100%" stopColor="#bc1888" />
                            </linearGradient>
                        </defs>
                    )}
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm3.98-10.169a1.44 1.44 0 11-2.88 0 1.44 1.44 0 012.88 0z" />
                </svg>
            );
        case 'twitter':
        case 'x':
            return <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>;
        case 'facebook':
            return <svg width={size} height={size} viewBox="0 0 24 24" fill={colored ? "#1877F2" : color}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>;
        case 'youtube':
            return <svg width={size} height={size} viewBox="0 0 24 24" fill={colored ? "#FF0000" : color}><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>;
        case 'tiktok':
            return <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.33 6.33 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>;
        case 'whatsapp':
            return <svg width={size} height={size} viewBox="0 0 24 24" fill={colored ? "#25D366" : color}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" /></svg>;
        case 'tel':
        case 'phone':
            return <svg width={size} height={size} viewBox="0 0 24 24" fill={colored ? "#25D366" : color}><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>;
        case 'email':
        case 'mail':
            return <svg width={size} height={size} viewBox="0 0 24 24" fill={colored ? "#EA4335" : color}><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>;
        case 'linkedin':
            return <svg width={size} height={size} viewBox="0 0 24 24" fill={colored ? "#0A66C2" : color}><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>;
        case 'pinterest':
            return <svg width={size} height={size} viewBox="0 0 24 24" fill={colored ? "#E60023" : color}><path d="M12 0C5.373 0 0 5.372 0 12c0 5.084 3.163 9.426 7.627 11.174-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.719-.359-1.782c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 0 1 .083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.632-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0z"/></svg>;
        case 'snapchat':
            return <svg width={size} height={size} viewBox="0 0 24 24" fill={colored ? "#FFFC00" : color}><path d="M12.012 0C8.766 0 6.53 1.52 5.33 3.78c-.597 1.12-.784 2.357-.744 3.518l-.018.008c-.29.208-.665.313-1.072.313-.372 0-.724-.087-1.018-.244-.077-.04-.182-.014-.218.074l-.013.066c-.023.13-.009.266.038.393.222.599.783 1.009 1.44 1.062.022.001.046.002.07.002.177 0 .351-.035.511-.1l.018.088c-.277.278-.59.492-.944.625-.355.135-.738.198-1.127.186-.162-.005-.345-.002-.505.034-.17.04-.38.124-.38.416 0 .41.522.574.835.67l.018.005c.284.088.577.165.862.268.76.275 1.136.614 1.136 1.006 0 .055-.007.108-.019.16.038-.003.076-.008.113-.008.193 0 .38.024.556.066.455.11.883.34 1.27.668.48.404 1.114.625 1.786.625.596 0 1.14-.178 1.58-.48.315-.215.69-.332 1.077-.332.388 0 .763.117 1.077.332.44.302.984.48 1.58.48.672 0 1.306-.22 1.786-.625.387-.328.815-.558 1.27-.668.176-.042.363-.066.556-.066.037 0 .075.005.113.008a1.112 1.112 0 0 1-.019-.16c0-.392.376-.731 1.136-1.006.285-.103.578-.18.862-.268l.018-.005c.313-.096.835-.26.835-.67 0-.292-.21-.376-.38-.416-.16-.036-.343-.039-.505-.034a3.624 3.624 0 0 1-1.127-.186 2.963 2.963 0 0 1-.944-.625l.018-.088c.16.065.334.1.511.1.024 0 .048-.001.07-.002.657-.053 1.218-.463 1.44-1.062.047-.127.061-.263.038-.393l-.013-.066c-.036-.088-.141-.114-.218-.074-.294.157-.646.244-1.018.244-.407 0-.782-.105-1.072-.313l-.018-.008c.04-1.161-.147-2.398-.744-3.518C17.47 1.52 15.234 0 12.012 0z"/></svg>;
        case 'spotify':
            return <svg width={size} height={size} viewBox="0 0 24 24" fill={colored ? "#1DB954" : color}><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.2-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>;
        case 'discord':
            return <svg width={size} height={size} viewBox="0 0 24 24" fill={colored ? "#5865F2" : color}><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.001.022.012.043.03.056a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>;
        case 'github':
            return <svg width={size} height={size} viewBox="0 0 24 24" fill={colored ? "#333333" : color}><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>;
        case 'telegram':
            return <svg width={size} height={size} viewBox="0 0 24 24" fill={colored ? "#26A5E4" : color}><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>;
        case 'twitch':
            return <svg width={size} height={size} viewBox="0 0 24 24" fill={colored ? "#9146FF" : color}><path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z"/></svg>;
        case 'threads':
            return <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.868 1.205 8.62.024 12.201 0h.014c2.704.012 5.009.807 6.846 2.362 1.797 1.534 2.878 3.658 3.226 6.396l.016.124-1.98.275-.016-.124c-.28-2.221-1.143-3.957-2.565-5.158-1.43-1.205-3.308-1.822-5.536-1.832-2.921.016-5.1.995-6.486 2.91C4.4 6.607 3.748 8.948 3.72 11.99c.028 3.041.68 5.382 1.999 7.038 1.386 1.916 3.565 2.895 6.47 2.912 2.478-.015 4.11-.639 5.408-2.06 1.274-1.394 1.976-3.455 2.068-5.931L19.66 12c0-1.72-.313-3.072-.948-4.018-.621-.924-1.519-1.488-2.722-1.718-.191.842-.46 1.626-.794 2.302-.67 1.358-1.61 2.349-2.784 2.945-.706.357-1.464.543-2.254.551-1.278.024-2.342-.405-3.08-1.266-.692-.814-1.062-1.963-1.066-3.322.004-1.284.343-2.35 1.007-3.17.673-.834 1.658-1.275 2.868-1.278h.014c.898 0 1.678.276 2.275.798.34.295.633.663.876 1.093.298-.512.68-.898 1.116-1.127.496-.261 1.04-.359 1.612-.295.988.111 1.812.684 2.455 1.708.615.99.95 2.284.966 3.737l.003.3c-.015 2.867-.84 5.237-2.41 7.049-1.627 1.877-3.82 2.82-6.517 2.803zm.067-5.34c1.374-.01 2.473-.434 3.27-1.257.815-.844 1.306-2.12 1.46-3.782-.09-.012-.183-.02-.28-.024-.72-.033-1.28.167-1.726.611-.518.52-.8 1.337-.84 2.427l-.006.196-.194.027c-.066.009-.133.017-.201.023-.136.012-.271.018-.404.018zm-.012-6.258c-.7-.014-1.17.245-1.476.79a3.1 3.1 0 0 0-.39 1.522c.003.77.221 1.408.651 1.891.417.467 1.008.706 1.758.703l.22-.007c.56-.036 1.082-.315 1.452-.765a3.17 3.17 0 0 0 .693-1.928 3.247 3.247 0 0 0-.49-1.712c-.292-.448-.72-.68-1.272-.686h-.146z"/></svg>;
        case 'bereal':
            return <svg width={size} height={size} viewBox="0 0 24 24" fill={color}><rect width="24" height="24" rx="6"/><text x="50%" y="55%" dominantBaseline="middle" textAnchor="middle" fontSize="10" fontWeight="bold" fill="white">Be</text></svg>;
        default:
            return <Globe size={size} />;
    }
};
