"use client";

import { useSmartInbox } from "@/hooks/useSmartInbox";
import { Mail, Phone, MapPin, Clock, Calendar, User, Tag, Plus, ExternalLink, X } from "lucide-react";
import { format } from "date-fns";

interface ContactSidebarProps {
    onClose?: () => void;
}

export default function ContactSidebar({ onClose }: ContactSidebarProps) {
    const { selectedConversation, onlineUsers } = useSmartInbox();

    if (!selectedConversation) return null;

    const isOnline = onlineUsers[selectedConversation.customer_id] ?? selectedConversation.is_online;

    // Dummy contact details mapping to the mockup image
    const contactInfo = {
        email: selectedConversation.customer_username
            ? `${selectedConversation.customer_username}@email.com`
            : `${(selectedConversation.customer_name ?? 'customer').toLowerCase().replace(/\s+/g, '.')}@email.com`,
        phone: "+49 176 12345678",
        location: "Berlin, Germany",
        localTime: format(new Date(), "h:mm a")
    };

    // Dummy activities matching the mockup image
    const recentActivities = [
        { id: 1, text: "Conversation assigned to you", time: "2m ago" },
        { id: 2, text: "Tag #vip added", time: "5m ago" },
        { id: 3, text: "Marked as Open", time: "5m ago" },
        { id: 4, text: "Auto-reply sent", time: "10:42 AM" }
    ];

    const tags = ["customer", "vip"];

    return (
        <div className="flex flex-col h-full bg-card rounded-[2.25rem] border border-border/40 p-5 overflow-y-auto scrollbar-thin shadow-sm relative">
            {/* Close button for mobile drawers */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-muted-foreground rounded-lg transition-all md:hidden"
                >
                    <X className="w-4.5 h-4.5" />
                </button>
            )}

            {/* Profile Header */}
            <div className="flex flex-col items-center text-center pb-6 border-b border-border/40 mb-6 mt-2">
                <div className="relative mb-3">
                    {selectedConversation.customer_avatar ? (
                        <img
                            src={selectedConversation.customer_avatar}
                            alt={selectedConversation.customer_name ?? 'User'}
                            className="w-20 h-20 rounded-full object-cover shadow-sm"
                        />
                    ) : (
                        <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center font-black text-2xl">
                            {(selectedConversation.customer_name ?? '?')[0]?.toUpperCase()}
                        </div>
                    )}
                    {isOnline && (
                        <div className="absolute top-1 right-1 w-4.5 h-4.5 rounded-full border-2 border-card bg-emerald-500 shadow-md" />
                    )}
                </div>
                
                <h3 className="text-sm font-black text-foreground">
                    {selectedConversation.customer_name}
                </h3>
                <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5 justify-center">
                    @{selectedConversation.customer_username
                        || (selectedConversation.customer_name ?? '').toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
                        || selectedConversation.customer_id
                        || 'unknown'
                    } • {selectedConversation.platform === "instagram" ? "Instagram" : "Facebook"}
                </p>

                <a
                    href="#"
                    onClick={(e) => e.preventDefault()}
                    className="text-[10px] font-black text-primary hover:text-opacity-80 flex items-center gap-1 mt-3 cursor-pointer"
                >
                    View Profile <ExternalLink className="w-3 h-3" />
                </a>
            </div>

            {/* Contact Info section */}
            
        </div>
    );
}
