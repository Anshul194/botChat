"use client";

import { useState, useEffect } from "react";
import { Instagram, Play, X } from "lucide-react";

interface ShareMessageProps {
    url: string;
    caption?: string | null;
    mediaData?: any; // To access html and thumbnail_url
}

export default function ShareMessage({ url, caption, mediaData }: ShareMessageProps) {
    const [isPlaying, setIsPlaying] = useState(false);

    // Extract oEmbed data if available
    let thumbnailUrl = null;
    let embedHtml = null;
    let title = caption;

    if (mediaData) {
        try {
            const parsed = typeof mediaData === "string" ? JSON.parse(mediaData) : mediaData;
            const att = Array.isArray(parsed) ? parsed[0] : parsed;
            if (att?.thumbnail_url) thumbnailUrl = att.thumbnail_url;
            if (att?.html) embedHtml = att.html;
            if (att?.title && !title) title = att.title;
        } catch (e) {
            // parsing failed
        }
    }

    if (!url) return <span className="text-xs text-muted-foreground italic">Shared post unavailable</span>;

    const isReel = url.includes("/reel/") || url.includes("/p/");
    const displayTitle = title || (isReel ? "Instagram Post/Reel" : "Shared Link");

    // Re-run Instagram embed script when HTML is injected
    useEffect(() => {
        if (isPlaying && embedHtml) {
            // @ts-ignore
            if (window.instgrm) {
                // @ts-ignore
                window.instgrm.Embeds.process();
            } else {
                const s = document.createElement("script");
                s.async = true;
                s.src = "//www.instagram.com/embed.js";
                document.body.appendChild(s);
            }
        }
    }, [isPlaying, embedHtml]);

    if (isPlaying && embedHtml) {
        return (
            <div className="relative min-w-[250px] max-w-[320px] bg-white dark:bg-black rounded-xl overflow-hidden border border-border/40">
                <button
                    onClick={() => setIsPlaying(false)}
                    className="absolute top-2 right-2 z-10 p-1.5 bg-black/50 hover:bg-black/80 text-white rounded-full transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
                <div 
                    className="w-full bg-white dark:bg-black"
                    dangerouslySetInnerHTML={{ __html: embedHtml }}
                />
            </div>
        );
    }

    return (
        <a
            href={embedHtml ? "#" : url}
            target={embedHtml ? "_self" : "_blank"}
            rel="noopener noreferrer"
            onClick={(e) => {
                if (embedHtml) {
                    e.preventDefault();
                    setIsPlaying(true);
                }
            }}
            className="group block relative overflow-hidden rounded-xl border border-border/40 text-left transition-all text-foreground min-w-[200px] max-w-[280px]"
        >
            {thumbnailUrl ? (
                <div className="relative w-full aspect-[4/5] bg-black">
                    <img src={thumbnailUrl} alt={displayTitle} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/10 transition-colors">
                        <div className="w-12 h-12 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
                            {isReel ? <Play className="w-6 h-6 ml-1 fill-white" /> : <Instagram className="w-6 h-6" />}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex items-center gap-3 p-3 bg-gradient-to-br from-pink-500/10 via-purple-500/10 to-orange-500/10 dark:from-pink-500/20 dark:via-purple-500/20 dark:to-orange-500/20 hover:opacity-80 transition-all">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-orange-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                        {isReel ? <Play className="w-5 h-5 ml-0.5 fill-white" /> : <Instagram className="w-5 h-5" />}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="font-semibold truncate max-w-[160px] text-foreground leading-tight">{displayTitle}</p>
                        <p className="text-[10px] text-pink-600 dark:text-pink-400 uppercase tracking-wide mt-0.5 font-medium">Tap to view</p>
                    </div>
                </div>
            )}
            
            {thumbnailUrl && (
                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="font-medium truncate text-white text-sm leading-tight drop-shadow-md">{displayTitle}</p>
                </div>
            )}
        </a>
    );
}
