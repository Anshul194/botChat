"use client";

interface TextMessageProps {
    text: string;
    isInbound?: boolean;
}

export default function TextMessage({ text }: TextMessageProps) {
    // Simple URL detection for auto-linking
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return (
        <p className="text-sm font-medium whitespace-pre-wrap break-words leading-relaxed">
            {parts.map((part, i) =>
                urlRegex.test(part) ? (
                    <a
                        key={i}
                        href={part}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline underline-offset-2 opacity-80 hover:opacity-100"
                    >
                        {part}
                    </a>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </p>
    );
}
