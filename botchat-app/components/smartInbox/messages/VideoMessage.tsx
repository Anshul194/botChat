"use client";

interface VideoMessageProps {
    url: string;
    caption?: string | null;
}

export default function VideoMessage({ url, caption }: VideoMessageProps) {
    if (!url) return <span className="text-xs text-muted-foreground italic">Video unavailable</span>;

    return (
        <div className="space-y-1 max-w-[280px]">
            <div className="relative rounded-xl overflow-hidden shadow-sm bg-black">
                <video
                    src={url}
                    controls
                    preload="metadata"
                    playsInline
                    className="max-h-60 w-full object-contain"
                    onError={(e) => {
                        const container = (e.target as HTMLVideoElement).parentElement;
                        if (container) {
                            container.innerHTML = `<div class="flex items-center justify-center h-24 text-xs text-gray-400">Video unavailable</div>`;
                        }
                    }}
                />
            </div>
            {caption && (
                <p className="text-[11px] text-muted-foreground px-0.5 truncate max-w-[260px]">{caption}</p>
            )}
        </div>
    );
}
