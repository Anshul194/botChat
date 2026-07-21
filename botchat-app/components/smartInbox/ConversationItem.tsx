"use client";

import { useState } from "react";
import { Facebook, Instagram, Star, Pin, VolumeX, Archive } from "lucide-react";
import { formatRelativeTime } from "@/lib/date";
import { SmartInboxConversation } from "@/store/slices/smartInboxSlice";
import { useSmartInbox } from "@/hooks/useSmartInbox";

interface ConversationItemProps {
    conversation: SmartInboxConversation;
}

export default function ConversationItem({ conversation }: ConversationItemProps) {
    const {
        selectedConversation,
        selectConversation,
        typingUsers,
        onlineUsers
    } = useSmartInbox();

    const [imgError, setImgError] = useState(false);
    const isSelected = selectedConversation?.id === conversation.id;
    const isOnline = onlineUsers[conversation.customer_id] ?? conversation.is_online;
    const isTyping = typingUsers[conversation.id] !== null && typingUsers[conversation.id] !== undefined;
    const typingMsg = typingUsers[conversation.id];

    const isFB = conversation.platform === "facebook";

    // Format timestamp nicely (e.g., 2m, 1h, 5d)
    const formatTime = (isoString: string | null) => {
        if (!isoString) return "";
        try { return formatRelativeTime(isoString); } catch { return ""; }
    };

    // ── Rich last-message preview ─────────────────────────────────────────────
    const getMessagePreview = (text: string | null): string => {
        if (!text) return "No messages yet";
        // Check for emoji prefixes that the backend inserts for media types
        if (text.startsWith("📷") || text.startsWith("📎 Image")) return "📷 Image";
        if (text.startsWith("🎥") || text.startsWith("📎 Video")) return "🎥 Video";
        if (text.startsWith("🎵") || text.startsWith("📎 Audio")) return "🎵 Voice message";
        if (text.startsWith("📄") || text.startsWith("📎 File")) return "📄 File";
        if (text.startsWith("🎠 Carousel")) return "🎠 Carousel";
        if (text.startsWith("🔘") || text.toLowerCase().includes("button")) return text.length > 30 ? `🔘 ${text.slice(0, 28)}…` : `🔘 ${text}`;
        // Truncate long messages
        return text.length > 48 ? `${text.slice(0, 46)}…` : text;
    };

    return (
        <div
            onClick={() => selectConversation(conversation)}
            className={`flex gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 relative group ${
                isSelected
                    ? "bg-primary text-white shadow-md"
                    : "hover:bg-muted/60 border-transparent"
            }`}
        >
            {/* Avatar block */}
            <div className="relative flex-shrink-0">
                {conversation.customer_avatar && !imgError ? (
                    <img
                        src={conversation.customer_avatar}
                        alt={conversation.customer_name ?? 'User'}
                        onError={() => setImgError(true)}
                        className="w-10 h-10 rounded-full object-cover"
                    />
                ) : (
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium text-xs ${
                        isSelected ? "bg-[var(--card)]/20 text-white" : "bg-primary/10 text-primary"
                    }`}>
                        {(conversation.customer_name ?? '?')[0]?.toUpperCase()}
                    </div>
                )}

                {/* Online indicator */}
                {isOnline && (
                    <div className={`absolute top-0 right-0 w-2.5 h-2.5 rounded-full border-2 ${isSelected ? "border-primary bg-emerald-400" : "border-background bg-emerald-500"}`} />
                )}

                {/* Platform Badge */}
                <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full flex items-center justify-center shadow-sm text-white border-[1.5px] ${
                    isSelected ? "border-primary" : "border-background"
                } ${
                    isFB ? "bg-blue-600" : "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]"
                }`}>
                    {isFB ? (
                        <Facebook className="w-2 h-2 fill-current" />
                    ) : (
                        <Instagram className="w-2 h-2" />
                    )}
                </div>
            </div>

            {/* Meta details */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-0.5">
                    <h4 className={`text-[13px] font-medium truncate max-w-[140px] ${isSelected ? "text-white" : "text-foreground"}`}>
                        {conversation.customer_name}
                    </h4>
                    <span className={`text-[10px] text-muted-foreground/80 ${isSelected ? "text-white/60" : ""}`}>
                        {formatTime(conversation.last_message_at)}
                    </span>
                </div>

                {/* Last message snippet */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                        {isTyping ? (
                            <p className={`text-[11px] font-medium animate-pulse truncate ${isSelected ? "text-white/80" : "text-primary"}`}>
                                {typingMsg || "Typing..."}
                            </p>
                        ) : (
                            <p className={`text-[11px] truncate ${isSelected ? "text-white/70" : "text-muted-foreground"}`}>
                                {getMessagePreview(conversation.last_message)}
                            </p>
                        )}
                    </div>

                    {/* Unread badge count */}
                    {!isSelected && conversation.unread_count > 0 && (
                        <div className="flex-shrink-0">
                            <span className="min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center text-[9px] font-medium bg-primary text-white shadow-sm">
                                {conversation.unread_count}
                            </span>
                        </div>
                    )}
                </div>

                {/* Indicator icons */}
                <div className="flex gap-1.5 mt-1 items-center">
                    {conversation.is_pinned && (
                        <Pin className={`w-3 h-3 rotate-45 ${isSelected ? "text-white/70 fill-current" : "text-amber-500/70 fill-current"}`} />
                    )}
                    {conversation.is_starred && (
                        <Star className={`w-3 h-3 ${isSelected ? "text-white/70 fill-current" : "text-yellow-500/70 fill-current"}`} />
                    )}
                    {conversation.is_muted && (
                        <VolumeX className={`w-3 h-3 ${isSelected ? "text-white/50" : "text-neutral-400/70"}`} />
                    )}
                </div>
            </div>
        </div>
    );
}

