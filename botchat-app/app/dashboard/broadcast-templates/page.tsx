"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBroadcastTemplates, deleteBroadcastTemplate, updateBroadcastTemplate, createBroadcastFromTemplate } from "@/services/messengerBroadcast.service";
import { toast } from "sonner";
import {
    Loader2, Search, Plus, Star, MoreVertical, Trash2, Edit3, MessageSquare,
    Copy, ExternalLink, CalendarDays, Filter
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const CATEGORIES = ["All", "Promotions", "Sales", "Offers", "Events", "Announcements", "Follow Up", "Customer Support", "Product Launch", "Custom"];

export default function BroadcastTemplatesPage() {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("All");
    const [page, setPage] = useState(1);

    // UI state
    const [isCreatingCampaign, setIsCreatingCampaign] = useState<number | null>(null);

    const { data, isLoading } = useQuery({
        queryKey: ["broadcastTemplates", category, search, page],
        queryFn: () => getBroadcastTemplates({
            category: category !== "All" ? category : undefined,
            search: search || undefined,
            page,
            per_page: 24
        }),
        keepPreviousData: true,
    } as any);

    const templates = (data as any)?.data ?? [];
    const meta = (data as any)?.meta ?? {};

    const toggleFavMutation = useMutation({
        mutationFn: ({ id, is_favorite }: { id: number, is_favorite: boolean }) => updateBroadcastTemplate(id, { is_favorite }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["broadcastTemplates"] }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deleteBroadcastTemplate(id),
        onSuccess: () => {
            toast.success("Template deleted");
            queryClient.invalidateQueries({ queryKey: ["broadcastTemplates"] });
        }
    });

    const createCampaignMutation = useMutation({
        mutationFn: (templateId: number) => createBroadcastFromTemplate(templateId, {}),
        onSuccess: (res) => {
            toast.success("Campaign created from template!");
            router.push(`/dashboard/broadcasts/${res.data.id}`);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to create campaign");
            setIsCreatingCampaign(null);
        }
    });

    const handleCreateCampaign = (id: number) => {
        setIsCreatingCampaign(id);
        createCampaignMutation.mutate(id);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6 p-4 sm:p-6 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Broadcast Templates</h1>
                    <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>
                        Manage reusable message templates for quick campaign creation.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button onClick={() => router.push("/dashboard/broadcast-templates/new")}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Template
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="relative flex-1 md:max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
                    <input
                        type="text"
                        placeholder="Search templates..."
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                        style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                    />
                </div>
                <div className="overflow-x-auto flex-1 hide-scrollbar">
                    <div className="flex gap-2">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => { setCategory(cat); setPage(1); }}
                                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all`}
                                style={category === cat ? {
                                    background: "var(--brand-purple)", color: "white"
                                } : {
                                    background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)"
                                }}
                            >
                                {cat}
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
            ) : templates.length === 0 ? (
                <div className="flex flex-col h-64 items-center justify-center text-center gap-4 rounded-2xl"
                    style={{ background: "var(--glass-bg)", border: "1px dashed var(--glass-border)" }}>
                    <MessageSquare className="w-12 h-12 opacity-20" style={{ color: "var(--foreground)" }} />
                    <div>
                        <p className="font-semibold" style={{ color: "var(--foreground)" }}>No templates found</p>
                        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Try adjusting your filters or create a new template.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {templates.map((t: any) => (
                        <div key={t.id} className="group relative rounded-2xl p-5 flex flex-col gap-4 transition-all hover:-translate-y-1 hover:shadow-xl"
                            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>

                            {/* Header */}
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-sm truncate" style={{ color: "var(--foreground)" }}>{t.name}</h3>
                                    <p className="text-xs truncate mt-0.5" style={{ color: "var(--brand-purple)" }}>{t.category}</p>
                                </div>
                                <div className="flex items-center gap-1">
                                    <button onClick={() => toggleFavMutation.mutate({ id: t.id, is_favorite: !t.is_favorite })}
                                        className="p-1.5 rounded-lg transition-colors hover:bg-white/10">
                                        <Star className={`w-4 h-4 ${t.is_favorite ? 'fill-yellow-400 text-yellow-400' : 'text-neutral-400'}`} />
                                    </button>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="p-1.5 rounded-lg transition-colors hover:bg-white/10">
                                                <MoreVertical className="w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleCreateCampaign(t.id)}>
                                                <Copy className="w-3.5 h-3.5 mr-2" /> Use Template
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => router.push(`/dashboard/broadcast-templates/${t.id}`)}>
                                                <Edit3 className="w-3.5 h-3.5 mr-2" /> Edit Template
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="text-red-500 focus:text-red-500" onClick={() => {
                                                if (confirm('Delete this template?')) deleteMutation.mutate(t.id);
                                            }}>
                                                <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>

                            {/* Desc */}
                            <p className="text-xs flex-1 line-clamp-2" style={{ color: "var(--muted-foreground)" }}>
                                {t.description || "No description provided."}
                            </p>

                            {/* Stats */}
                            <div className="flex items-center justify-between text-xs pt-3 border-t" style={{ borderColor: "var(--border)" }}>
                                <span className="flex items-center gap-1.5" style={{ color: "var(--muted-foreground)" }}>
                                    <MessageSquare className="w-3.5 h-3.5" />
                                    {t.message_type}
                                </span>
                                <span className="flex items-center gap-1.5" style={{ color: "var(--muted-foreground)" }}>
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    Used {t.usage_count}x
                                </span>
                            </div>

                            {/* Overlay Loading */}
                            {isCreatingCampaign === t.id && (
                                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl"
                                    style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(2px)" }}>
                                    <Loader2 className="w-8 h-8 animate-spin text-white mb-2" />
                                    <span className="text-white text-xs font-semibold">Creating Campaign...</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
