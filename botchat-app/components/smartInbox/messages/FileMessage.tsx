"use client";

import { FileText, FileImage, FileVideo, FileAudio, Download, File } from "lucide-react";

interface FileMessageProps {
    url: string;
    caption?: string | null;
}

function getFileIcon(filename: string) {
    const ext = filename.split(".").pop()?.toLowerCase() ?? "";
    if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return FileImage;
    if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext)) return FileVideo;
    if (["mp3", "wav", "ogg", "m4a", "aac", "webm"].includes(ext)) return FileAudio;
    if (["pdf", "doc", "docx", "txt", "csv", "xls", "xlsx", "ppt", "pptx"].includes(ext)) return FileText;
    return File;
}

function getFileTypeLabel(filename: string) {
    const ext = filename.split(".").pop()?.toUpperCase() ?? "FILE";
    return ext;
}

export default function FileMessage({ url, caption }: FileMessageProps) {
    if (!url) return <span className="text-xs text-muted-foreground italic">File unavailable</span>;

    const filename = caption || url.split("/").pop()?.split("?")[0] || "Document";
    const Icon = getFileIcon(filename);
    const typeLabel = getFileTypeLabel(filename);

    return (
        <a
            href={url}
            download
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 p-3 bg-neutral-50 dark:bg-neutral-900/60 border border-border/40 rounded-xl text-xs hover:bg-neutral-100 dark:hover:bg-neutral-800/60 transition-all text-foreground min-w-[200px] max-w-[260px]"
        >
            {/* File type icon */}
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                <Icon className="w-5 h-5" />
            </div>

            {/* File info */}
            <div className="min-w-0 flex-1">
                <p className="font-semibold truncate max-w-[160px] text-foreground leading-tight">{filename}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">{typeLabel} · Tap to download</p>
            </div>

            {/* Download arrow */}
            <Download className="w-4 h-4 text-muted-foreground flex-shrink-0 group-hover:text-primary transition-colors" />
        </a>
    );
}
