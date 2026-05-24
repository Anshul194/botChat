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
        <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-card rounded-[2rem] border border-border/40">
            <div className="w-16 h-16 rounded-full flex items-center justify-center bg-primary/10 text-primary mb-4 animate-bounce">
                <Icon className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">{content.title}</h3>
            <p className="text-sm text-muted-foreground max-w-sm">{content.description}</p>
        </div>
    );
}
