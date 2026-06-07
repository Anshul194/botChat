"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getBroadcastTemplate, updateBroadcastTemplate } from "@/services/messengerBroadcast.service";
import { toast } from "sonner";
import { Loader2, ArrowLeft, Save, FileJson } from "lucide-react";
import { Button } from "@/components/ui/button";

const CATEGORIES = ["Promotions", "Sales", "Offers", "Events", "Announcements", "Follow Up", "Customer Support", "Product Launch", "Custom"];

export default function BroadcastTemplateEditorPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const id = Number(params.id);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("Custom");

    const { data: res, isLoading } = useQuery({
        queryKey: ["broadcastTemplate", id],
        queryFn: () => getBroadcastTemplate(id),
    });

    const template = res?.data;

    useEffect(() => {
        if (template) {
            setName(template.name || "");
            setDescription(template.description || "");
            setCategory(template.category || "Custom");
        }
    }, [template]);

    const updateMutation = useMutation({
        mutationFn: () => updateBroadcastTemplate(id, { name, description, category }),
        onSuccess: () => {
            toast.success("Template metadata updated");
            queryClient.invalidateQueries({ queryKey: ["broadcastTemplate", id] });
            queryClient.invalidateQueries({ queryKey: ["broadcastTemplates"] });
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update template");
        }
    });

    if (isLoading) {
        return (
            <div className="flex h-[50vh] items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-brand-purple" />
            </div>
        );
    }

    if (!template) {
        return (
            <div className="p-6 text-center text-red-500">
                Template not found.
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 p-4 sm:p-6 pb-20">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.push('/dashboard/broadcast-templates')}>
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Edit Template</h1>
                        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Update template settings</p>
                    </div>
                </div>
                <Button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                    Save Changes
                </Button>
            </div>

            {/* Form */}
            <div className="rounded-2xl p-6 space-y-6" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                <div>
                    <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--foreground)" }}>Template Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                        style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                    />
                </div>

                <div>
                    <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--foreground)" }}>Category</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                        style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                    >
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div>
                    <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--foreground)" }}>Description (Optional)</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                        style={{ background: "var(--background)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                    />
                </div>
            </div>

            {/* Payload Preview */}
            <div className="rounded-2xl p-6 space-y-4" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                <h3 className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                    <FileJson className="w-4 h-4 text-brand-purple" />
                    Message Payload Preview
                </h3>
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                    To modify the actual message content, create a new campaign from this template, edit it there, and save it as a new template.
                </p>
                <div className="bg-neutral-900 rounded-xl p-4 overflow-x-auto">
                    <pre className="text-xs text-green-400 font-mono">
                        {JSON.stringify(template.payload_json, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
}
