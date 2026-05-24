"use client";

import { useState } from "react";
import { SmartInboxMessage } from "@/store/slices/smartInboxSlice";
import { useSmartInbox } from "@/hooks/useSmartInbox";
import { Check, CheckCheck, Smile, Bot, User, Settings } from "lucide-react";
import { format } from "date-fns";
import ReactionPicker from "./ReactionPicker";
import MediaPreview from "./MediaPreview";
import MessageRenderer from "./messages/MessageRenderer";

interface MessageBubbleProps {
    message: SmartInboxMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
    const { reactToMessage } = useSmartInbox();
    const [showReactions, setShowReactions] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const isInbound = message.direction === "inbound";
    const isBot = message.sender_type === "bot";
    const isAgent = message.sender_type === "agent";

    // ── Format timestamp ──────────────────────────────────────────────────────
    const formatTime = (isoString: string | null | undefined) => {
        if (!isoString) return "";
        try { return format(new Date(isoString), "h:mm a"); } catch { return ""; }
    };

    // ── Reaction list parsing ─────────────────────────────────────────────────
    let reactionsList: any[] = [];
    if (message.reaction_json) {
        try {
            reactionsList = typeof message.reaction_json === "string"
                ? JSON.parse(message.reaction_json)
                : (message.reaction_json as any);
        } catch { reactionsList = []; }
    }

    // ── Delivery tick ─────────────────────────────────────────────────────────
    const renderDeliveryStatus = () => {
        if (isInbound) return null;
        switch (message.status) {
            case "sending":
                return <span className="w-3 h-3 border-2 border-primary/40 border-t-transparent rounded-full animate-spin" />;
            case "failed":
                return <span className="text-[10px] text-red-500 font-bold">Failed</span>;
            case "sent":
                return <Check className="w-3.5 h-3.5 text-muted-foreground" />;
            case "delivered":
                return <CheckCheck className="w-3.5 h-3.5 text-muted-foreground" />;
            case "seen":
                return <CheckCheck className="w-3.5 h-3.5 text-primary" />;
            default:
                return null;
        }
    };

    // ── Sender badge (only for outbound) ─────────────────────────────────────
    const renderSenderBadge = () => {
        if (isInbound) return null;
        if (isBot) {
            return (
                <span className="inline-flex items-center gap-0.5 bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400 px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide">
                    <Bot className="w-2.5 h-2.5" />
                    Bot
                </span>
            );
        }
        if (isAgent) {
            return (
                <span className="inline-flex items-center gap-0.5 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wide">
                    <User className="w-2.5 h-2.5" />
                    Agent
                </span>
            );
        }
        return null;
    };

    // ── Bubble styling by direction + type ───────────────────────────────────
    const isMediaOnly = ["image", "video", "audio", "voice", "sticker"].includes(message.message_type);
    const bubbleClasses = `relative transition-all shadow-[0_1px_2px_rgba(0,0,0,0.04)] ${
        isMediaOnly ? "" : "p-3 rounded-2xl"
    } ${
        isInbound
            ? "bg-neutral-100 dark:bg-neutral-800 text-foreground rounded-2xl rounded-bl-sm"
            : isBot
                ? "bg-gradient-to-br from-violet-600 to-purple-700 text-white rounded-2xl rounded-br-sm"
                : "bg-primary text-white rounded-2xl rounded-br-sm"
    }`;

    return (
        <div className={`flex flex-col ${isInbound ? "items-start" : "items-end"} gap-1.5 group relative`}>

            {/* Bubble row */}
            <div className={`flex items-end gap-2 max-w-[70%] ${isInbound ? "flex-row" : "flex-row-reverse"}`}>
                <div className={bubbleClasses}>
                    <MessageRenderer
                        message={message}
                        onImageClick={(url) => setPreviewUrl(url)}
                    />

                    {/* Reaction badge overlay */}
                    {reactionsList.length > 0 && (
                        <div className="absolute -bottom-2 right-2 flex items-center gap-0.5 bg-card border border-border/60 px-1 py-0.5 rounded-full shadow-sm text-xs select-none">
                            {reactionsList.map((r: any, idx: number) => (
                                <span key={idx} title={`Reacted by user ${r.user_id}`}>
                                    {r.emoji}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Reaction trigger — shows on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5">
                    <button
                        onClick={() => setShowReactions(true)}
                        className="p-1 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-muted-foreground hover:text-foreground rounded-full transition-all cursor-pointer"
                        title="React"
                    >
                        <Smile className="w-4 h-4" />
                    </button>
                    {showReactions && (
                        <ReactionPicker
                            onSelect={(emoji) => reactToMessage(message.id, emoji)}
                            onClose={() => setShowReactions(false)}
                        />
                    )}
                </div>
            </div>

            {/* Time / sender / delivery bar */}
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground px-1">
                {renderSenderBadge()}
                <span>{formatTime((message as any).sent_at || (message as any).created_at)}</span>
                {renderDeliveryStatus()}
            </div>

            {/* Lightbox modal */}
            {previewUrl && (
                <MediaPreview
                    file={null}
                    url={previewUrl}
                    isModal={true}
                    onCloseModal={() => setPreviewUrl(null)}
                />
            )}
        </div>
    );
}
