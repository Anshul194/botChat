"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBroadcastAssets, uploadBroadcastAsset, deleteBroadcastAsset } from "@/services/messengerBroadcast.service";
import { toast } from "sonner";
import {
    Loader2, Search, UploadCloud, Trash2, Image as ImageIcon,
    FileVideo, Music, FileText, Film, Copy, ExternalLink, X
} from "lucide-react";
import { Button } from "@/components/ui/button";

const TYPES = ["All", "image", "video", "audio", "document", "gif"];

const TYPE_ICONS: Record<string, any> = {
    image: ImageIcon,
    video: FileVideo,
    audio: Music,
    document: FileText,
    gif: Film,
};

function formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes'
    const k = 1024
    const dm = decimals < 0 ? 0 : decimals
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export default function ContentLibraryPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("All");
    const [page, setPage] = useState(1);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { data, isLoading } = useQuery({
        queryKey: ["broadcastAssets", typeFilter, search, page],
        queryFn: () => getBroadcastAssets({
            type: typeFilter !== "All" ? typeFilter : undefined,
            search: search || undefined,
            page,
            per_page: 30
        }),
        keepPreviousData: true,
    } as any);

    const assets = (data as any)?.data ?? [];
    const meta = (data as any)?.meta ?? {};

    const uploadMutation = useMutation({
        mutationFn: ({ file, type }: { file: File, type: string }) => uploadBroadcastAsset(file, type),
        onSuccess: () => {
            toast.success("File uploaded successfully");
            queryClient.invalidateQueries({ queryKey: ["broadcastAssets"] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Upload failed");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteBroadcastAsset(id),
        onSuccess: () => {
            toast.success("File deleted");
            queryClient.invalidateQueries({ queryKey: ["broadcastAssets"] });
        }
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        let type = 'document';
        if (file.type.startsWith('image/')) {
            type = file.type === 'image/gif' ? 'gif' : 'image';
        } else if (file.type.startsWith('video/')) {
            type = 'video';
        } else if (file.type.startsWith('audio/')) {
            type = 'audio';
        }

        uploadMutation.mutate({ file, type });
        if (fileInputRef.current) fileInputRef.current.value = ""; // reset
    };

    const copyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        toast.success("URL copied to clipboard");
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Content Library</h1>
                    <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
                        Manage your media assets for broadcasts.
                    </p>
                </div>
                <div>
                    <input
                        type="file"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                    />
                    <Button onClick={() => fileInputRef.current?.click()} disabled={uploadMutation.isPending}>
                        {uploadMutation.isPending ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        ) : (
                            <UploadCloud className="w-4 h-4 mr-2" />
                        )}
                        Upload File
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1 md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
                    <input
                        type="text"
                        placeholder="Search files..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                        style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                    />
                </div>
                <div className="overflow-x-auto flex-1 hide-scrollbar">
                    <div className="flex gap-2">
                        {TYPES.map(type => (
                            <button
                                key={type}
                                onClick={() => { setTypeFilter(type); setPage(1); }}
                                className="px-4 py-2 rounded-full text-sm font-medium capitalize whitespace-nowrap transition-all"
                                style={typeFilter === type ? {
                                    background: "var(--brand-purple)", color: "white"
                                } : {
                                    background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)"
                                }}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin" style={{ color: "var(--brand-purple)" }} />
                </div>
            ) : assets.length === 0 ? (
                <div className="flex flex-col h-64 items-center justify-center text-center gap-4 rounded-2xl"
                    style={{ background: "var(--glass-bg)", border: "1px dashed var(--glass-border)" }}>
                    <UploadCloud className="w-12 h-12 opacity-20" style={{ color: "var(--foreground)" }} />
                    <div>
                        <p className="font-semibold" style={{ color: "var(--foreground)" }}>No media found</p>
                        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Upload some files to get started.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {assets.map((asset: any) => {
                        const Icon = TYPE_ICONS[asset.type] || FileText;
                        const isImg = asset.type === 'image' || asset.type === 'gif';

                        return (
                            <div key={asset.id} className="group relative rounded-2xl overflow-hidden flex flex-col transition-all hover:shadow-xl hover:-translate-y-1"
                                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>

                                {/* Preview */}
                                <div className="aspect-square relative bg-neutral-100 dark:bg-neutral-800/50 flex items-center justify-center overflow-hidden">
                                    {isImg ? (
                                        <img src={asset.url} alt={asset.name} className="w-full h-full object-cover" />
                                    ) : asset.type === 'video' ? (
                                        <video src={asset.url} className="w-full h-full object-cover" />
                                    ) : (
                                        <Icon className="w-10 h-10 opacity-30 text-neutral-500" />
                                    )}

                                    {/* Hover Actions */}
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <button onClick={() => copyUrl(asset.url)} className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-colors" title="Copy URL">
                                            <Copy className="w-4 h-4" />
                                        </button>
                                        <a href={asset.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white backdrop-blur-sm transition-colors" title="Open">
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                        <button onClick={() => { if (confirm('Delete this file?')) deleteMutation.mutate(asset.id); }} className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white backdrop-blur-sm transition-colors" title="Delete">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Meta */}
                                <div className="p-3">
                                    <p className="text-xs font-semibold truncate" style={{ color: "var(--foreground)" }} title={asset.name}>
                                        {asset.name}
                                    </p>
                                    <div className="flex items-center justify-between mt-1">
                                        <p className="text-[10px] uppercase font-bold" style={{ color: "var(--brand-purple)" }}>
                                            {asset.type}
                                        </p>
                                        <p className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                                            {formatBytes(asset.size)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
