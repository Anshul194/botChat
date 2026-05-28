"use client";

interface QuickReply {
    title: string;
    payload?: string;
}

interface QuickReplyMessageProps {
    text: string;
    replies: QuickReply[];
    isInbound?: boolean;
}

export default function QuickReplyMessage({ text, replies, isInbound }: QuickReplyMessageProps) {
    const bubbleClass = isInbound
        ? "bg-muted text-foreground border border-border"
        : "bg-primary text-white shadow-sm";

    return (
        <div className="flex flex-col gap-2 min-w-[160px] max-w-[280px]">
            {/* Main Text Bubble */}
            <div className={`px-4 py-2.5 rounded-2xl ${bubbleClass}`}>
                {text && (
                    <p className="text-sm font-medium whitespace-pre-wrap break-words leading-relaxed">
                        {text}
                    </p>
                )}
            </div>

            {/* Quick Replies (Pills) */}
            <div className="flex flex-wrap gap-1.5 justify-end">
                {replies.map((qr, i) => (
                    <span
                        key={i}
                        className="inline-flex items-center px-3 py-1.5 rounded-full border border-primary/40 bg-background text-xs font-semibold text-primary whitespace-nowrap select-none hover:bg-primary/5 cursor-pointer transition-colors shadow-sm"
                        title={qr.title}
                    >
                        {qr.title}
                    </span>
                ))}
            </div>
        </div>
    );
}
