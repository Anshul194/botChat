"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Plus, X, Sparkles, Tag, AlignLeft, Bot, Info,
    CheckCircle, Circle, Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { createCampaign } from "@/store/slices/aiTrainingSlice";

// ── Shared Sub-components ────────────────────────────────────────────────────
export function FormField({
    label,
    hint,
    icon: Icon,
    required,
    children,
}: {
    label: string;
    hint?: string;
    icon?: React.ElementType;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <div className="flex items-center gap-1.5">
                {Icon && <Icon className="w-3.5 h-3.5 text-neutral-400" />}
                <label className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                    {label}
                    {required && <span className="text-rose-500 ml-0.5">*</span>}
                </label>
            </div>
            {children}
            {hint && (
                <p className="text-xs text-neutral-400 dark:text-neutral-500 flex items-start gap-1 leading-relaxed">
                    <Info className="w-3 h-3 mt-0.5 flex-shrink-0" />
                    {hint}
                </p>
            )}
        </div>
    );
}

export function StyledInput({
    placeholder,
    value,
    onChange,
    className,
}: {
    placeholder?: string;
    value: string;
    onChange: (v: string) => void;
    className?: string;
}) {
    return (
        <input
            type="text"
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
                "w-full h-11 px-4 rounded-xl text-sm",
                "bg-neutral-50 dark:bg-neutral-800/80",
                "border border-neutral-200 dark:border-neutral-700",
                "placeholder:text-neutral-400 text-neutral-900 dark:text-white",
                "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10",
                "transition-all duration-200",
                className
            )}
        />
    );
}

export function StyledTextarea({
    placeholder,
    value,
    onChange,
    rows = 3,
    className,
}: {
    placeholder?: string;
    value: string;
    onChange: (v: string) => void;
    rows?: number;
    className?: string;
}) {
    return (
        <textarea
            placeholder={placeholder}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            className={cn(
                "w-full px-4 py-3 rounded-xl text-sm",
                "bg-neutral-50 dark:bg-neutral-800/80",
                "border border-neutral-200 dark:border-neutral-700",
                "placeholder:text-neutral-400 text-neutral-900 dark:text-white",
                "focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10",
                "transition-all duration-200 resize-none",
                className
            )}
        />
    );
}

export function StatusRadio({
    value,
    onChange,
}: {
    value: "active" | "inactive";
    onChange: (v: "active" | "inactive") => void;
}) {
    return (
        <div className="flex gap-3">
            {(["active", "inactive"] as const).map((opt) => {
                const isSelected = value === opt;
                return (
                    <button
                        key={opt}
                        type="button"
                        onClick={() => onChange(opt)}
                        className={cn(
                            "flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200",
                            isSelected
                                ? opt === "active"
                                    ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400"
                                    : "border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300"
                                : "border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-500 dark:text-neutral-400 hover:border-neutral-300 dark:hover:border-neutral-600"
                        )}
                    >
                        {isSelected
                            ? <CheckCircle className={cn("w-4 h-4 flex-shrink-0", opt === "active" ? "text-emerald-500" : "text-neutral-400")} />
                            : <Circle className="w-4 h-4 flex-shrink-0 text-neutral-300 dark:text-neutral-600" />
                        }
                        <span className="capitalize">{opt}</span>
                    </button>
                );
            })}
        </div>
    );
}

// ── Default form state ────────────────────────────────────────────────────────
const DEFAULT_FORM = {
    name: "",
    status: "active" as "active" | "inactive",
    description: "",
    prompt_message: "",
};

// ── Component ─────────────────────────────────────────────────────────────────
interface Props {
    open: boolean;
    onClose: () => void;
}

export default function CreateCampaignPanel({ open, onClose }: Props) {
    const dispatch = useAppDispatch();
    const { isSubmitting } = useAppSelector((s) => s.aiTraining);
    const [form, setForm] = useState(DEFAULT_FORM);

    const set = (key: keyof typeof DEFAULT_FORM) => (val: string) =>
        setForm((f) => ({ ...f, [key]: val }));

    const handleClose = () => {
        setForm(DEFAULT_FORM);
        onClose();
    };

    const handleSubmit = async () => {
        if (!form.name.trim()) return toast.error("Campaign name is required");

        const res = await dispatch(createCampaign(form));
        if (createCampaign.fulfilled.match(res)) {
            toast.success("Campaign created successfully!");
            handleClose();
        } else {
            toast.error((res.payload as string) || "Failed to create campaign");
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
                        onClick={handleClose}
                    />

                    {/* Slide-in Panel (full-screen on mobile) */}
                    <motion.div
                        key="panel"
                        initial={{ x: "100%", opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: "100%", opacity: 0 }}
                        transition={{ type: "spring", stiffness: 320, damping: 32 }}
                        className="fixed inset-0 sm:inset-auto sm:right-0 sm:top-0 sm:bottom-0 z-[100] w-full sm:max-w-[520px] bg-white dark:bg-neutral-950 shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 sm:px-6 py-5 border-b border-neutral-100 dark:border-neutral-800 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-neutral-900 dark:text-white">
                                        New Campaign
                                    </h2>
                                    <p className="text-xs text-neutral-400 dark:text-neutral-500">
                                        Set up a new AI training campaign
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="w-8 h-8 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Scrollable Body */}
                        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
                            {/* Section: Campaign Details */}
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-4">
                                    Campaign Details
                                </p>
                                <div className="space-y-4">
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
                                            rows={3}
                                        />
                                    </FormField>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="border-t border-neutral-100 dark:border-neutral-800" />

                            {/* Section: AI Configuration */}
                            <div>
                                <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 mb-4">
                                    AI Configuration
                                </p>
                                <FormField
                                    label="System Persona / Prompt (Global)"
                                    icon={Bot}
                                    hint="This prompt will be sent as the base persona for all pages using this campaign."
                                >
                                    <StyledTextarea
                                        placeholder="Enter the global AI persona or instructions for this campaign"
                                        value={form.prompt_message}
                                        onChange={set("prompt_message")}
                                        rows={6}
                                    />
                                </FormField>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="px-4 sm:px-6 py-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center gap-3 bg-neutral-50/60 dark:bg-neutral-900/60 flex-shrink-0">
                            <button
                                onClick={handleClose}
                                className="h-10 px-5 rounded-xl border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className="flex-1 h-10 rounded-xl text-white text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
                                style={{ background: "var(--brand-gradient)", boxShadow: "0 8px 20px -4px rgba(29, 110, 245, 0.3)" }}
                            >
                                {isSubmitting ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4" />
                                        Create Campaign
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
