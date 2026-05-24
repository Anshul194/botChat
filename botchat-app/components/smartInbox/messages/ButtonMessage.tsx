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
}

export default function ButtonMessage({ text, buttons }: ButtonMessageProps) {
    return (
        <div className="min-w-[200px] max-w-[280px]">
            {text && (
                <p className="text-sm font-medium whitespace-pre-wrap break-words leading-relaxed mb-3">
                    {text}
                </p>
            )}
            <div className="flex flex-col gap-1.5">
                {buttons.map((btn, i) => (
                    <div
                        key={i}
                        className="px-3 py-2 rounded-lg border border-primary/30 bg-primary/5 text-center text-xs font-semibold text-primary truncate select-none"
                        title={btn.title}
                    >
                        {btn.title}
                    </div>
                ))}
            </div>
        </div>
    );
}
