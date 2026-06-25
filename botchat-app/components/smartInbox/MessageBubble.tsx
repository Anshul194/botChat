"use client";

import { useState } from "react";
import { SmartInboxMessage } from "@/store/slices/smartInboxSlice";
import { useSmartInbox } from "@/hooks/useSmartInbox";
import { Check, CheckCheck, Smile, Bot, User, Settings, Sparkles, Instagram, Facebook } from "lucide-react";
import { formatTime } from "@/lib/date";
import { motion } from "framer-motion";
import ReactionPicker from "./ReactionPicker";
import MediaPreview from "./MediaPreview";
import MessageRenderer from "./messages/MessageRenderer";
import ReactionsListModal from "./ReactionsListModal";

interface MessageBubbleProps {
    message: SmartInboxMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
    const { reactToMessage } = useSmartInbox();
    const [showReactions, setShowReactions] = useState(false);
    const [showReactionsList, setShowReactionsList] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const isInbound = message.direction === "inbound";
    const isBot = message.sender_type === "bot";
    const isAgent = message.sender_type === "agent";

    // ── Format timestamp ──────────────────────────────────────────────────────
    const formatTime = (isoString: string | null | undefined) => {
        if (!isoString) return "";
        try { return formatTime(new Date(isoString), 'h:mm A'); } catch { return ""; }
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

    // ── Delivery status logic ────────────────────────────────────────────────
    const renderDeliveryStatus = () => {
        if (isInbound || !message.status) return null;
        const status = message.status;
        
        return (
            <div className="flex items-center gap-1">
                {status === 'seen' || status === 'read' ? (
                    <CheckCheck className="w-3 h-3 text-primary" />
                ) : (
                    <Check className="w-3 h-3 text-muted-foreground/40" />
                )}
            </div>
        );
    };

    // ── Sender badge (only for outbound) ─────────────────────────────────────
    const renderSenderBadge = () => {
        if (isBot) {
            return (
                <span className="flex items-center gap-1 text-[9px] font-bold text-primary px-1.5 py-0.5 rounded bg-primary/10">
                    Bot
                </span>
            );
        }
        if (!isInbound) {
            return (
                <span className="text-[9px] font-bold text-muted-foreground/60 px-1.5 py-0.5 border border-border rounded bg-muted/30">
                    Agent
                </span>
            );
        }
        return null;
    };


    // ── Bubble styling by direction + type ───────────────────────────────────
    const isMediaOnly = ["image", "video", "audio", "voice", "sticker", "carousel", "generic_template", "template", "button", "quick_reply", "flow_step"].includes(message.message_type);
    const bubbleClasses = `relative transition-all duration-200 max-w-[75%] ${
        isMediaOnly ? "" : "px-3.5 py-2 rounded-xl"
    } ${
        isMediaOnly ? "" : (isInbound ? "bg-muted/80 text-foreground border border-border/50" : "bg-primary text-white shadow-sm")
    }`;

    return (
        <div 
            className={`flex flex-col group ${isInbound ? "items-start" : "items-end"} w-full py-0.5`}
        >
            <div className={`flex items-end gap-1.5 ${isInbound ? "flex-row" : "flex-row-reverse"}`}>
                
                <div className={bubbleClasses}>
                    <MessageRenderer
                        message={message}
                        onImageClick={(url) => setPreviewUrl(url)}
                    />

                    {/* Status icon for outbound */}
                    {!isInbound && (
                        <div className="absolute -right-5 bottom-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {message.status === "sent" && <Check className="w-3 h-3 text-muted-foreground" />}
                            {message.status === "delivered" && <CheckCheck className="w-3 h-3 text-muted-foreground" />}
                            {message.status === "seen" && <CheckCheck className="w-3 h-3 text-primary animate-pulse" />}
                        </div>
                    )}

                    {/* Display Reactions */}
                    {reactionsList.length > 0 && (
                        <button 
                            onClick={() => setShowReactionsList(true)}
                            className={`absolute -bottom-3 ${isInbound ? "-right-2" : "-left-2"} flex items-center bg-background border border-border rounded-full px-1.5 py-0.5 shadow-sm z-10 scale-[0.90] origin-bottom hover:bg-muted transition-colors cursor-pointer`}
                        >
                            {reactionsList.map((r, i) => (
                                <span key={i} className="text-[12px] leading-none" title={r.reaction}>{r.reaction}</span>
                            ))}
                        </button>
                    )}
                </div>

                {/* Reaction trigger — shows on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center gap-2">
                    <button
                        onClick={() => setShowReactions(true)}
                        className="w-8 h-8 flex items-center justify-center bg-background border border-border text-muted-foreground hover:text-primary rounded-full shadow-sm transition-all active:scale-90"
                        title="React"
                    >
                        <Smile className="w-4 h-4" />
                    </button>
                    {showReactions && (
                        <ReactionPicker
                            onSelect={(emoji) => {
                                reactToMessage(message.id, emoji);
                                setShowReactions(false);
                            }}
                            onClose={() => setShowReactions(false)}
                        />
                    )}
                </div>
            </div>

            {/* Time / sender / delivery bar */}
            <div className={`flex items-center gap-2 text-[10px] text-muted-foreground/70 px-1.5 ${isInbound ? "ml-1" : "mr-1"}`} style={{ fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" }}>
                {renderSenderBadge()}
                <span>{formatMsgTime((message as any).sent_at || (message as any).created_at)}</span>
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
            
            <ReactionsListModal 
                isOpen={showReactionsList} 
                onClose={() => setShowReactionsList(false)} 
                reactions={reactionsList} 
            />
        </div>
    );
}
