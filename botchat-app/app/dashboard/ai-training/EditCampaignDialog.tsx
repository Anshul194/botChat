"use client";

import { useEffect, useState } from "react";
import { Edit2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { updateCampaign, clearSelectedCampaign, type Campaign } from "@/store/slices/aiTrainingSlice";
import {
    FormField, StyledInput, StyledTextarea, StatusRadio,
} from "./CreateCampaignPanel";
import { Tag, AlignLeft, Bot, CheckCircle } from "lucide-react";

// ── Default form state ────────────────────────────────────────────────────────
const DEFAULT_FORM = {
    name: "",
    status: "active" as "active" | "inactive",
    description: "",
    system_prompt: "",
};

// ── Component ─────────────────────────────────────────────────────────────────
interface Props {
    campaign: Campaign | null;
    open: boolean;
    onClose: () => void;
}

export default function EditCampaignDialog({ campaign, open, onClose }: Props) {
    const dispatch = useAppDispatch();
    const { isSubmitting } = useAppSelector((s) => s.aiTraining);
    const [form, setForm] = useState(DEFAULT_FORM);

    useEffect(() => {
        if (campaign) {
            setForm({
                name: campaign.name || "",
                status: (campaign.status as "active" | "inactive") || "active",
                description: campaign.description || "",
                system_prompt: campaign.system_prompt || "",
            });
        }
    }, [campaign]);

    const set = (key: keyof typeof DEFAULT_FORM) => (val: string) =>
        setForm((f) => ({ ...f, [key]: val }));

    const handleClose = () => {
        dispatch(clearSelectedCampaign());
        onClose();
    };

    const handleSubmit = async () => {
        if (!campaign || !form.name.trim()) return toast.error("Campaign name is required");

        const res = await dispatch(updateCampaign({ id: campaign.id, ...form }));
        if (updateCampaign.fulfilled.match(res)) {
            toast.success("Campaign updated successfully!");
            handleClose();
        } else {
            toast.error((res.payload as string) || "Failed to update campaign");
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[520px] p-0 gap-0 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl overflow-hidden bg-white dark:bg-neutral-950">

                {/* Header */}
                <DialogHeader className="px-6 pt-5 pb-4 border-b border-neutral-100 dark:border-neutral-800">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center flex-shrink-0">
                            <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <DialogTitle className="text-base font-bold text-neutral-900 dark:text-white leading-tight">
                                Edit Campaign
                            </DialogTitle>
                            <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-0.5">
                                Update campaign details and AI configuration
                            </p>
                        </div>
                    </div>
                </DialogHeader>

                {/* Body */}
                <div className="px-6 py-5 space-y-4 max-h-[65vh] overflow-y-auto">
                    <FormField label="Campaign Name" icon={Tag} required>
                        <StyledInput
                            placeholder="Enter Campaign Name"
                            value={form.name}
                            onChange={set("name")}
                        />
                    </FormField>

                    <FormField label="Status" icon={CheckCircle}>
                        <StatusRadio
                            value={form.status}
                            onChange={(v) => setForm((f) => ({ ...f, status: v }))}
                        />
                    </FormField>

                    <FormField label="Description" icon={AlignLeft}>
                        <StyledTextarea
                            placeholder="Enter description about this campaign"
                            value={form.description}
                            onChange={set("description")}
                            rows={2}
                        />
                    </FormField>

                    <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4">
                        <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-3">
                            AI Configuration
                        </p>
                        <FormField
                            label="System Persona / Prompt (Global)"
                            icon={Bot}
                            hint="This prompt will be sent as the base persona for all pages using this campaign."
                        >
                            <StyledTextarea
                                placeholder="Enter the global AI persona or instructions for this campaign"
                                value={form.system_prompt}
                                onChange={set("system_prompt")}
                                rows={4}
                            />
                        </FormField>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-end gap-3 bg-neutral-50/60 dark:bg-neutral-900/60">
                    <button
                        onClick={handleClose}
                        className="h-9 px-4 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="h-9 px-5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold flex items-center gap-2 shadow-sm active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
