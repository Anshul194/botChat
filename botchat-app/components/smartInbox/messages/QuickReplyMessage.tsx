"use client";

interface QuickReply {
    title: string;
    payload?: string;
}

interface QuickReplyMessageProps {
    text: string;
    replies: QuickReply[];
}

export default function QuickReplyMessage({ text, replies }: QuickReplyMessageProps) {
    return (
        <div className="min-w-[160px] max-w-[280px]">
            {text && (
                <p className="text-sm font-medium whitespace-pre-wrap break-words leading-relaxed mb-2.5">
                    {text}
                </p>
            )}
            <div className="flex flex-wrap gap-1.5">
                {replies.map((qr, i) => (
                    <span
                        key={i}
                        className="inline-flex items-center px-2.5 py-1 rounded-full border border-primary/40 bg-primary/5 text-xs font-semibold text-primary whitespace-nowrap select-none"
                        title={qr.title}
                    >
                        {qr.title}
                    </span>
                ))}
            </div>
        </div>
    );
}
