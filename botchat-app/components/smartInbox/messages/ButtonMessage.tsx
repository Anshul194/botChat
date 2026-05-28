"use client";

interface Button {
    type: string;
    title: string;
    payload?: string;
    url?: string;
}

interface ButtonMessageProps {
    text: string;
    buttons: Button[];
    isInbound?: boolean;
}

export default function ButtonMessage({ text, buttons, isInbound }: ButtonMessageProps) {
    const bubbleClass = isInbound
        ? "bg-muted text-foreground border border-border"
        : "bg-primary text-white shadow-sm";

    const buttonClass = isInbound
        ? "border-t border-border/50 text-primary hover:bg-muted-foreground/10 active:bg-muted-foreground/20"
        : "border-t border-white/20 text-white hover:bg-white/10 active:bg-white/20";

    return (
        <div className={`min-w-[200px] max-w-[280px] rounded-2xl overflow-hidden flex flex-col ${bubbleClass}`}>
            {text && (
                <div className="px-4 py-3">
                    <p className="text-sm font-medium whitespace-pre-wrap break-words leading-relaxed">
                        {text}
                    </p>
                </div>
            )}
            <div className="flex flex-col">
                {buttons.map((btn, i) => (
                    <button
                        key={i}
                        className={`w-full px-3 py-2.5 text-center text-[13px] font-semibold transition-colors truncate select-none ${buttonClass}`}
                        title={btn.title}
                    >
                        {btn.title}
                    </button>
                ))}
            </div>
        </div>
    );
}
