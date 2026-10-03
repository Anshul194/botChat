"use client";

import { Instagram, Play } from "lucide-react";

interface ShareMessageProps {
    url: string;
    caption?: string | null;
}

export default function ShareMessage({ url, caption }: ShareMessageProps) {
    if (!url) return <span className="text-xs text-muted-foreground italic">Shared post unavailable</span>;

    const isReel = url.includes("/reel/") || url.includes("/p/");
    const title = caption || (isReel ? "Instagram Post/Reel" : "Shared Link");

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 p-3 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-orange-500/10 dark:from-pink-500/20 dark:via-purple-500/20 dark:to-orange-500/20 border border-pink-500/20 rounded-xl text-xs hover:opacity-80 transition-all text-foreground min-w-[200px] max-w-[260px]"
        >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-orange-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                {isReel ? <Play className="w-5 h-5 ml-0.5 fill-white" /> : <Instagram className="w-5 h-5" />}
            </div>

            <div className="min-w-0 flex-1">
                <p className="font-semibold truncate max-w-[160px] text-foreground leading-tight">{title}</p>
                <p className="text-[10px] text-pink-600 dark:text-pink-400 uppercase tracking-wide mt-0.5 font-medium">Tap to view on Instagram</p>
            </div>
        </a>
    );
}
