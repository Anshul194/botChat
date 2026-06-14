"use client";

import { useState } from "react";
import { useSmartInbox } from "@/hooks/useSmartInbox";
import { Mail, Phone, MapPin, Clock, Calendar, User, Tag, Plus, ExternalLink, X, Instagram, Facebook, MessageSquare } from "lucide-react";
import { format } from "date-fns";

interface ContactSidebarProps {
    onClose?: () => void;
}

export default function ContactSidebar({ onClose }: ContactSidebarProps) {
    const { selectedConversation, onlineUsers } = useSmartInbox();
    const [imgError, setImgError] = useState(false);

    if (!selectedConversation) return null;

    const isOnline = onlineUsers[selectedConversation.customer_id] ?? selectedConversation.is_online;

    const contactInfo: { email?: string; phone?: string; location?: string; localTime: string } = {
        localTime: format(new Date(), "h:mm a")
    };

    const recentActivities: { id: number; text: string; time: string }[] = [];

    const tags: string[] = [];

    return (
        <div className="flex flex-col h-full bg-card p-5 overflow-y-auto scrollbar-thin">
            {/* Close button for mobile */}
            {onClose && (
                <button onClick={onClose} className="absolute top-4 right-4 p-1.5 hover:bg-muted text-muted-foreground rounded-lg transition-all md:hidden">
                    <X className="w-4 h-4" />
                </button>
            )}

            {/* Profile Header */}
            <div className="flex flex-col items-center text-center pb-5 border-b border-border/50 mb-5">
                <div className="relative mb-3">
                    {selectedConversation.customer_avatar && !imgError ? (
                        <img
                            src={selectedConversation.customer_avatar}
                            alt={selectedConversation.customer_name ?? 'User'}
                            onError={() => setImgError(true)}
                            className="w-16 h-16 rounded-full object-cover shadow-sm"
                        />
                    ) : (
                        <div className="w-16 h-16 rounded-full bg-primary/10 text-primary flex items-center justify-center font-medium text-lg">
                            {(selectedConversation.customer_name ?? '?')[0]?.toUpperCase()}
                        </div>
                    )}
                    {isOnline && (
                        <div className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-card bg-emerald-500" />
                    )}
                </div>

                <h3 className="text-sm font-medium text-foreground">{selectedConversation.customer_name}</h3>
                <p className="text-[11px] text-muted-foreground/80 mt-0.5">
                    @{selectedConversation.customer_username
                        || (selectedConversation.customer_name ?? '').toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
                        || selectedConversation.customer_id
                        || 'unknown'
                    } • {selectedConversation.platform === "instagram" ? "Instagram" : "Facebook"}
                </p>
            </div>

            {/* Contact Info */}
            <div className="space-y-3 mb-5">
                <p className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider">Contact Info</p>
                <div className="space-y-2">
                    <div className="flex items-center gap-2.5 text-sm text-foreground">
                        <Clock className="w-3.5 h-3.5 text-muted-foreground/70 flex-shrink-0" />
                        <span className="text-[12px] text-foreground/90">{contactInfo.localTime}</span>
                    </div>
                </div>
            </div>

            {/* Tags */}
            {tags.length > 0 && (
                <div className="mb-5">
                    <p className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider mb-2">Tags</p>
                    <div className="flex flex-wrap gap-1.5">
                        {tags.map(tag => (
                            <span key={tag} className="px-2 py-0.5 rounded-md bg-primary/5 text-primary text-[10px] font-medium border border-primary/10">
                                #{tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Activity */}
            {recentActivities.length > 0 && (
                <div>
                    <p className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider mb-2">Recent Activity</p>
                    <div className="space-y-2">
                        {recentActivities.map(activity => (
                            <div key={activity.id} className="flex items-start gap-2.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 mt-1.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-[11px] text-foreground/90 truncate">{activity.text}</p>
                                    <p className="text-[9px] text-muted-foreground/60">{activity.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
