"use client";

export default function TypingIndicator() {
    return (
        <div className="flex items-center gap-1 bg-neutral-100 dark:bg-neutral-800/80 px-4 py-2.5 rounded-2xl w-fit">
            <span className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 bg-neutral-400 dark:bg-neutral-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
    );
}
