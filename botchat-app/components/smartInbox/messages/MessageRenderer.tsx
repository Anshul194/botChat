"use client";

import { SmartInboxMessage } from "@/store/slices/smartInboxSlice";
import TextMessage from "./TextMessage";
import ImageMessage from "./ImageMessage";
import VideoMessage from "./VideoMessage";
import AudioMessage from "./AudioMessage";
import FileMessage from "./FileMessage";
import ButtonMessage from "./ButtonMessage";
import QuickReplyMessage from "./QuickReplyMessage";
import CarouselMessage from "./CarouselMessage";
import FlowStepMessage from "./FlowStepMessage";

interface MessageRendererProps {
    message: SmartInboxMessage;
    onImageClick?: (url: string) => void;
}

/**
 * MessageRenderer
 *
 * Dynamically renders the correct message component based on message_type.
 *
 * URL resolution priority:
 *   1. message_data.url   — always set by backend for agent media & bot steps
 *   2. media_json[0].url  — inbound webhook messages (array shape)
 *   3. media_json string  — legacy plain URL or JSON stringified array
 *   4. message            — last resort (caption / filename)
 */
export default function MessageRenderer({ message, onImageClick }: MessageRendererProps) {
    // Parse message_data safely (may be object, JSON string, or null)
    const data = (() => {
        const raw = message.message_data;
        if (!raw) return null;
        if (typeof raw === "string") {
            try { return JSON.parse(raw); } catch { return null; }
        }
        return raw as any;
    })();

    const isInbound = message.direction === "inbound";

    /**
     * Resolves the media URL from any storage shape the backend may return.
     * Mirrors how FacebookBotReplyStepExecutor stores media in message_data.
     */
    const getMediaUrl = (): string => {
        // 1. message_data.url — set for all agent outbound media and bot step messages
        if (data?.url) return data.url;

        // 2. media_json — webhook inbound / stored media array
        const mj = message.media_json;
        if (!mj) return message.message ?? "";

        // Already an array (Eloquent cast: 'array' auto-decodes JSON)
        if (Array.isArray(mj)) {
            const first = mj[0] as any;
            return first?.url ?? first?.payload?.url ?? "";
        }

        // String shape — either a plain URL or JSON.stringify'd array
        if (typeof mj === "string") {
            if (mj.startsWith("http")) return mj;
            try {
                const parsed = JSON.parse(mj);
                if (Array.isArray(parsed)) return (parsed[0] as any)?.url ?? "";
                if (parsed?.url) return parsed.url;
            } catch {
                // not parseable
            }
            return mj;
        }

        // Object shape (edge case)
        if (typeof mj === "object") {
            return (mj as any)?.url ?? (mj as any)?.payload?.url ?? "";
        }

        return message.message ?? "";
    };

    const getCaption = (): string =>
        data?.caption ?? data?.filename ?? message.message ?? "";

    switch (message.message_type) {
        case "image":
            return (
                <ImageMessage
                    url={getMediaUrl()}
                    caption={getCaption()}
                    onImageClick={onImageClick}
                />
            );

        case "video":
            return <VideoMessage url={getMediaUrl()} caption={getCaption()} />;

        case "audio":
        case "voice":
            return <AudioMessage url={getMediaUrl()} />;

        case "file":
            return <FileMessage url={getMediaUrl()} caption={getCaption()} />;

        case "sticker":
        case "story":
        case "reel":
            return (
                <div className="max-w-[180px]">
                    <img
                        src={getMediaUrl()}
                        alt={message.message_type}
                        className="w-full h-auto rounded-xl"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                </div>
            );

        case "button":
            return (
                <ButtonMessage
                    text={data?.text ?? message.message ?? ""}
                    buttons={data?.buttons ?? []}
                    isInbound={isInbound}
                />
            );

        case "quick_reply":
            return (
                <QuickReplyMessage
                    text={data?.text ?? message.message ?? ""}
                    replies={data?.replies ?? []}
                    isInbound={isInbound}
                />
            );

        case "carousel":
        case "template":
        case "generic_template":
            return <CarouselMessage cards={data?.cards ?? data?.elements ?? (data ? [data] : [])} />;

        case "flow_step":
            return (
                <FlowStepMessage
                    text={data?.text ?? message.message ?? ""}
                    field={data?.field}
                    event={data?.event}
                    isInbound={isInbound}
                />
            );

        case "location":
            return (
                <div className="text-xs text-muted-foreground bg-muted/40 rounded-lg px-3 py-2 flex items-center gap-1.5">
                    📍 <span>{data?.address ?? (data?.lat ? `${data.lat},${data.lng}` : "Location")}</span>
                </div>
            );

        case "text":
        default:
            return <TextMessage text={message.message ?? ""} isInbound={isInbound} />;
    }
}
