"use client";

import { X, FileText, Play, FileAudio, Download } from "lucide-react";

interface MediaPreviewProps {
    file: File | null;
    url?: string;
    type?: "image" | "video" | "audio" | "file" | "voice";
    onClear?: () => void;
    onCloseModal?: () => void;
    isModal?: boolean;
}

export default function MediaPreview({
    file,
    url,
    type,
    onClear,
    onCloseModal,
    isModal = false
}: MediaPreviewProps) {
    const fileUrl = url || (file ? URL.createObjectURL(file) : "");

    // Detect type from: explicit prop → file MIME → URL extension
    const detectTypeFromUrl = (u: string): "image" | "video" | "audio" | "file" => {
        if (!u) return "file";
        const ext = u.split(".").pop()?.split("?")[0]?.toLowerCase() ?? "";
        if (["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(ext)) return "image";
        if (["mp4", "mov", "avi", "mkv", "webm"].includes(ext)) return "video";
        if (["mp3", "wav", "ogg", "m4a", "aac"].includes(ext)) return "audio";
        return "file";
    };

    const fileType = type
        || (file?.type.startsWith("image/") ? "image"
            : file?.type.startsWith("video/") ? "video"
            : file?.type.startsWith("audio/") ? "audio"
            : undefined)
        || detectTypeFromUrl(fileUrl);

    if (isModal) {
        return (
            <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <button
                    onClick={onCloseModal}
                    className="absolute top-4 right-4 p-2 bg-neutral-900/80 hover:bg-neutral-800 text-white rounded-full transition-all"
                >
                    <X className="w-5 h-5" />
                </button>
                <div className="max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl flex items-center justify-center">
                    {fileType === "image" && (
                        <img src={fileUrl} alt="Preview" className="max-w-full max-h-[85vh] object-contain shadow-2xl" />
                    )}
                    {fileType === "video" && (
                        <video src={fileUrl} controls autoPlay className="max-w-full max-h-[85vh] rounded-xl" />
                    )}
                    {fileType === "file" && (
                        <div className="bg-card p-8 rounded-2xl flex flex-col items-center gap-4 text-center max-w-sm">
                            <FileText className="w-16 h-16 text-primary" />
                            <p className="text-sm font-bold truncate max-w-xs">{file?.name || "Document"}</p>
                            <a
                                href={fileUrl}
                                download
                                className="px-6 py-2.5 bg-primary text-white font-bold rounded-xl text-xs flex items-center gap-1.5 hover:bg-opacity-90 active:scale-95 transition-all"
                            >
                                <Download className="w-4 h-4" /> Download File
                            </a>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Input preview state (small bubble thumbnail above input bar)
    return (
        <div className="relative inline-flex items-center gap-2 p-2 bg-neutral-50 dark:bg-neutral-900 border border-border/40 rounded-2xl">
            {fileType === "image" && (
                <img src={fileUrl} alt="Attachment" className="w-12 h-12 rounded-xl object-cover" />
            )}
            {fileType === "video" && (
                <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center relative">
                    <Play className="w-4 h-4 text-white fill-current" />
                </div>
            )}
            {(fileType === "audio" || fileType === "voice") && (
                <div className="w-12 h-12 rounded-xl bg-teal-100 dark:bg-teal-900/40 flex items-center justify-center text-teal-600">
                    <FileAudio className="w-6 h-6" />
                </div>
            )}
            {fileType === "file" && (
                <div className="w-12 h-12 rounded-xl bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-primary">
                    <FileText className="w-6 h-6" />
                </div>
            )}
            <div className="text-[10px] max-w-[100px] truncate pr-4">
                <p className="font-bold text-foreground truncate">{file?.name || "Uploaded Attachment"}</p>
                <p className="text-muted-foreground uppercase">{fileType}</p>
            </div>
            {onClear && (
                <button
                    onClick={onClear}
                    className="absolute -top-1 -right-1 p-1 bg-red-500 hover:bg-red-600 text-white rounded-full transition-all shadow-sm cursor-pointer"
                >
                    <X className="w-3 h-3" />
                </button>
            )}
        </div>
    );
}
