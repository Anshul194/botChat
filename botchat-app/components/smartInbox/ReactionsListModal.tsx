"use client";

import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useAppSelector } from "@/store/hooks";

interface Reaction {
    user_id: string | number;
    reaction: string;
}

interface ReactionsListModalProps {
    isOpen: boolean;
    onClose: () => void;
    reactions: Reaction[];
}

export default function ReactionsListModal({ isOpen, onClose, reactions }: ReactionsListModalProps) {
    const selectedConversation = useAppSelector(s => s.smartInbox.selectedConversation);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-sm bg-background border border-border rounded-2xl shadow-xl overflow-hidden z-10"
                    >
                        <div className="flex items-center justify-between p-4 border-b border-border">
                            <h3 className="font-bold text-foreground">Reactions</h3>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                            {reactions.length === 0 ? (
                                <p className="p-4 text-center text-sm text-muted-foreground">No reactions yet.</p>
                            ) : (
                                reactions.map((r, idx) => {
                                    const isCustomer = String(r.user_id) === String(selectedConversation?.customer_id);
                                    const isAgent = String(r.user_id) === '1' || (!isCustomer && String(r.user_id).length < 10);
                                    const displayName = isAgent 
                                        ? 'Agent (You)' 
                                        : isCustomer 
                                            ? (selectedConversation?.customer_name || 'Customer') 
                                            : `User ${String(r.user_id).substring(0, 6)}`;
                                    
                                    const initial = isAgent ? 'A' : (displayName.charAt(0).toUpperCase() || 'U');

                                    return (
                                        <div key={idx} className="flex items-center justify-between p-3 hover:bg-muted/50 rounded-xl transition-colors">
                                            <div className="flex items-center gap-3">
                                                {isCustomer && selectedConversation?.customer_avatar ? (
                                                    <img src={selectedConversation.customer_avatar} alt={displayName} className="w-10 h-10 rounded-full object-cover border border-border" />
                                                ) : (
                                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                        {initial}
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="font-semibold text-sm text-foreground">
                                                        {displayName}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">Reacted to message</p>
                                                </div>
                                            </div>
                                            <div className="text-2xl">{r.reaction}</div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
