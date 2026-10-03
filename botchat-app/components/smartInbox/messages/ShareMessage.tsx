"use client";

import { Instagram, Play } from "lucide-react";

interface ShareMessageProps {
    url: string;
    caption?: string | null;
    mediaData?: any;
}

export default function ShareMessage({ url, caption, mediaData }: ShareMessageProps) {
    if (!url) return <span className="text-xs text-muted-foreground italic">Shared post unavailable</span>;

    // Check if it's an Instagram reel or post
    const isInstagram = url.includes("instagram.com/reel/") || url.includes("instagram.com/p/");
    
    if (isInstagram) {
        // Construct the embed URL by ensuring it ends with /embed
        const cleanUrl = url.split("?")[0].replace(/\/$/, '');
        const embedUrl = `${cleanUrl}/embed/captioned`;

        return (
            <div className="relative w-[280px] bg-white dark:bg-neutral-900 rounded-[24px] overflow-hidden border border-border/60 shadow-sm" style={{ height: '480px' }}>
                <iframe 
                    src={embedUrl} 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    allowTransparency={true}
                    allow="encrypted-media"
                    className="w-full h-full"
                ></iframe>
            </div>
        );
    }

    // Fallback for non-Instagram links
    let title = caption || "Shared Link";
    if (mediaData) {
        try {
            const parsed = typeof mediaData === "string" ? JSON.parse(mediaData) : mediaData;
            const att = Array.isArray(parsed) ? parsed[0] : parsed;
            if (att?.title && !title) title = att.title;
        } catch (e) {}
    }

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-orange-500/10 dark:from-pink-500/20 dark:via-purple-500/20 dark:to-orange-500/20 hover:opacity-80 transition-all rounded-xl border border-border/40 text-foreground min-w-[200px] max-w-[280px]"
        >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-orange-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                <Instagram className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
                <p className="font-semibold truncate max-w-[160px] text-foreground leading-tight">{title}</p>
                <p className="text-[10px] text-pink-600 dark:text-pink-400 uppercase tracking-wide mt-0.5 font-medium">Tap to view</p>
            </div>
        </a>
    );
}
