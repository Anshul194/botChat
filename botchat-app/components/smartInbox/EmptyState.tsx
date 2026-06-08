"use client";

import { MessageSquare, ArrowLeftRight } from "lucide-react";

interface EmptyStateProps {
    type: "no-account" | "no-conversation" | "no-messages";
    title?: string;
    description?: string;
}

export default function EmptyState({ type, title, description }: EmptyStateProps) {
    const getContent = () => {
        switch (type) {
            case "no-account":
                return {
                    icon: ArrowLeftRight,
                    title: title || "Connect Facebook or Instagram account",
                    description: description || "In order to view and respond to messages, please connect your social media pages in the accounts section."
                };
            case "no-messages":
                return {
                    icon: MessageSquare,
                    title: title || "No messages",
                    description: description || "There are no messages in this conversation yet. Send a greeting to start."
                };
            case "no-conversation":
            default:
                return {
                    icon: MessageSquare,
                    title: title || "Select a conversation",
                    description: description || "Choose a customer message from the left list to begin replying and managing interactions."
                };
        }
    };

    const content = getContent();
    const Icon = content.icon;

    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-14 h-14 rounded-full flex items-center justify-center bg-muted/80 text-muted-foreground/40 mb-4">
                <Icon className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-medium text-foreground/80 mb-1" style={{ fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" }}>{content.title}</h3>
            <p className="text-[12px] text-muted-foreground/60 max-w-xs" style={{ fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" }}>{content.description}</p>
        </div>
    );
}
