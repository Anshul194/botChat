"use client";

import { Facebook, Instagram, Star, Pin, VolumeX, Archive } from "lucide-react";
import { formatDistanceToNowStrict } from "date-fns";
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

    const isSelected = selectedConversation?.id === conversation.id;
    const isOnline = onlineUsers[conversation.customer_id] ?? conversation.is_online;
    const isTyping = typingUsers[conversation.id] !== null && typingUsers[conversation.id] !== undefined;
    const typingMsg = typingUsers[conversation.id];

    const isFB = conversation.platform === "facebook";

    // Format timestamp nicely (e.g., 2m, 1h, 5d)
    const formatTime = (isoString: string | null) => {
        if (!isoString) return "";
        try {
            const date = new Date(isoString);
            return formatDistanceToNowStrict(date)
                .replace(" seconds", "s")
                .replace(" second", "s")
                .replace(" minutes", "m")
                .replace(" minute", "m")
                .replace(" hours", "h")
                .replace(" hour", "h")
                .replace(" days", "d")
                .replace(" day", "d");
        } catch {
            return "";
        }
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
            className={`flex gap-3 p-3 rounded-2xl cursor-pointer transition-all border ${
                isSelected
                    ? "bg-primary/5 border-primary/20 shadow-sm"
                    : "border-transparent hover:bg-neutral-50 dark:hover:bg-neutral-900"
            }`}
        >
            {/* Avatar block */}
            <div className="relative flex-shrink-0">
                {conversation.customer_avatar ? (
                    <img
                        src={conversation.customer_avatar}
                        alt={conversation.customer_name ?? 'User'}
                        className="w-11 h-11 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-11 h-11 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                        {(conversation.customer_name ?? '?')[0]?.toUpperCase()}
                    </div>
                )}

                {/* Online indicator */}
                {isOnline && (
                    <div className="absolute top-0 right-0 w-3 h-3 rounded-full border-2 border-card bg-emerald-500 shadow-sm" />
                )}

                {/* Platform Badge */}
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center shadow-sm text-white ${
                    isFB ? "bg-blue-600" : "bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600"
                }`}>
                    {isFB ? (
                        <Facebook className="w-2.5 h-2.5 fill-current" />
                    ) : (
                        <Instagram className="w-2.5 h-2.5" />
                    )}
                </div>
            </div>

            {/* Meta details */}
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-0.5">
                    <h4 className="text-xs font-black text-foreground truncate max-w-[120px]">
                        {conversation.customer_name}
                    </h4>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                        {formatTime(conversation.last_message_at)}
                    </span>
                </div>

                {/* Typing state or Last message snippet */}
                {isTyping ? (
                    <p className="text-xs font-black text-primary animate-pulse truncate">
                        {typingMsg || "Typing..."}
                    </p>
                ) : (
                    <p className="text-xs text-muted-foreground truncate pr-2">
                        {getMessagePreview(conversation.last_message)}
                    </p>
                )}

                {/* Indicator icons */}
                <div className="flex gap-1.5 mt-1.5 items-center">
                    {conversation.is_pinned && (
                        <Pin className="w-3.5 h-3.5 text-amber-500 fill-current rotate-45" />
                    )}
                    {conversation.is_starred && (
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-current" />
                    )}
                    {conversation.is_muted && (
                        <VolumeX className="w-3.5 h-3.5 text-neutral-400" />
                    )}
                    {conversation.is_archived && (
                        <Archive className="w-3.5 h-3.5 text-purple-400" />
                    )}
                </div>
            </div>

            {/* Unread badge count */}
            {!isSelected && conversation.unread_count > 0 && (
                <div className="flex items-center justify-center flex-shrink-0">
                    <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black bg-primary text-white shadow-sm">
                        {conversation.unread_count}
                    </span>
                </div>
            )}
        </div>
    );
}
