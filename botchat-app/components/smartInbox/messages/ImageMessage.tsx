"use client";

import { ZoomIn } from "lucide-react";

interface ImageMessageProps {
    url: string;
    caption?: string | null;
    onImageClick?: (url: string) => void;
}

export default function ImageMessage({ url, caption, onImageClick }: ImageMessageProps) {
    if (!url) return <span className="text-xs text-muted-foreground italic">Image unavailable</span>;

    return (
        <div className="space-y-1 max-w-[280px]">
            <div
                className="relative group cursor-zoom-in"
                onClick={() => onImageClick?.(url)}
            >
                <img
                    src={url}
                    alt={caption || "Image"}
                    loading="lazy"
                    className="rounded-xl max-h-64 w-full object-cover hover:brightness-90 transition-all shadow-sm"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src =
                            "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='120' viewBox='0 0 200 120'%3E%3Crect width='200' height='120' fill='%23f0f0f0'/%3E%3Ctext x='100' y='65' text-anchor='middle' fill='%23999' font-size='13' font-family='sans-serif'%3EImage%3C/text%3E%3C/svg%3E";
                    }}
                />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                    <div className="bg-black/40 rounded-full p-2">
                        <ZoomIn className="w-4 h-4 text-white" />
                    </div>
                </div>
            </div>
            {caption && (
                <p className="text-[11px] text-muted-foreground px-0.5 truncate max-w-[260px]">{caption}</p>
            )}
        </div>
    );
}
