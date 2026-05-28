"use client";

import { Workflow, AlertCircle } from "lucide-react";

interface FlowStepMessageProps {
    text: string;
    field?: string | null;
    event?: string;
    isInbound?: boolean;
}

/**
 * FlowStepMessage
 *
 * Renders bot flow step messages (questions, retries, max-retry errors).
 * Shows a subtle badge to distinguish from regular text bubbles.
 */
export default function FlowStepMessage({ text, field, event, isInbound }: FlowStepMessageProps) {
    const isError = event === "validation_error" || event === "max_retry";

    const bubbleClass = isInbound
        ? "bg-muted text-foreground border border-border"
        : "bg-primary text-white shadow-sm";

    return (
        <div className={`min-w-[160px] max-w-[280px] px-4 py-2.5 rounded-2xl ${bubbleClass}`}>
            {/* Flow step indicator badge */}
            <div className="flex items-center gap-1 mb-2">
                {isError ? (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/30 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-700/50">
                        <AlertCircle className="w-2.5 h-2.5" />
                        {event === "max_retry" ? "Max Attempts" : "Retry"}
                    </span>
                ) : (
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-2 py-0.5 rounded-full border border-violet-200 dark:border-violet-700/50">
                        <Workflow className="w-2.5 h-2.5" />
                        {field ? `Ask: ${field}` : "Flow"}
                    </span>
                )}
            </div>
            <p className="text-sm font-medium whitespace-pre-wrap break-words leading-relaxed">{text}</p>
        </div>
    );
}
