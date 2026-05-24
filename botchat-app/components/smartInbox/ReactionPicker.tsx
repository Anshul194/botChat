"use client";

import { motion } from "framer-motion";

interface ReactionPickerProps {
    onSelect: (reaction: string | null) => void;
    onClose: () => void;
}

const EMOJIS = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

export default function ReactionPicker({ onSelect, onClose }: ReactionPickerProps) {
    return (
        <div className="relative">
            {/* Backdrop overlay */}
            <div className="fixed inset-0 z-[1000]" onClick={onClose} />
            
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 5 }}
                className="absolute bottom-full mb-2 left-0 z-[1001] flex items-center gap-1 p-1.5 bg-card border border-border/40 rounded-full shadow-lg"
            >
                {EMOJIS.map((emoji) => (
                    <button
                        key={emoji}
                        onClick={() => {
                            onSelect(emoji);
                            onClose();
                        }}
                        className="text-lg w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all active:scale-125"
                    >
                        {emoji}
                    </button>
                ))}
                
                <button
                    onClick={() => {
                        onSelect(null);
                        onClose();
                    }}
                    className="text-[10px] font-black text-muted-foreground px-2 h-8 flex items-center justify-center rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all active:scale-95"
                    title="Remove reaction"
                >
                    Clear
                </button>
            </motion.div>
        </div>
    );
}
