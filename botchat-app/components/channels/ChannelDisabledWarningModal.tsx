"use "client";

import React from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertTriangle, ExternalLink, CheckCircle2, ShieldAlert } from "lucide-react";

export interface ChannelItem {
    id: string | number;
    page_id?: string;
    instagram_id?: string;
    page_name?: string;
    username?: string;
    name?: string;
    picture?: string;
    profile_picture?: string;
    is_enabled?: boolean | number;
    is_active?: boolean | number;
    platform?: "facebook" | "instagram";
}

interface ChannelDisabledWarningModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    channel: ChannelItem | null;
    platform?: "facebook" | "instagram";
}

const AUTOMATION_FEATURES = [
    "Bot Reply",
    "Comment Automation",
    "Reply Templates",
    "Broadcast",
    "Social Posting",
    "Smart Inbox",
    "AI Agent",
    "Ice Breakers",
    "Persistent Menu",
    "Action Buttons",
];

export function ChannelDisabledWarningModal({
    open,
    onOpenChange,
    channel,
    platform = "facebook",
}: ChannelDisabledWarningModalProps) {
    const router = useRouter();

    if (!channel) return null;

    const channelName = channel.page_name || channel.name || (channel.username ? `@${channel.username}` : "Selected Channel");
    const avatarSrc = channel.picture || channel.profile_picture || "";
    const effectivePlatform = channel.platform || platform;
    const isFacebook = effectivePlatform === "facebook";

    const integrationUrl = isFacebook
        ? `/dashboard/facebook?highlight_page=${channel.id}`
        : `/dashboard/instagram?highlight_account=${channel.id}`;

    const handleGoToIntegration = () => {
        onOpenChange(false);
        router.push(integrationUrl);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[480px] rounded-3xl p-6">
                <DialogHeader className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
                            <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-black tracking-tight">
                                {isFacebook ? "Page Disabled" : "Instagram Account Disabled"}
                            </DialogTitle>
                            <DialogDescription className="text-xs font-medium text-muted-foreground mt-0.5">
                                Enable this channel before configuring automations
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Target Channel Banner */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-muted/30 border border-white/5 my-2">
                    <div className="flex items-center gap-3 min-w-0">
                        <Avatar className="h-10 w-10 border-2 border-background shadow-md">
                            <AvatarImage src={avatarSrc} />
                            <AvatarFallback className="bg-amber-500/10 text-amber-500 text-xs font-black">
                                {channelName[0]}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                            <h4 className="text-sm font-black truncate">{channelName}</h4>
                            <p className="text-[11px] text-muted-foreground font-medium flex items-center gap-1">
                                <ShieldAlert className="h-3 w-3 text-amber-500" /> Connected but currently disabled
                            </p>
                        </div>
                    </div>
                    <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/20 text-[10px] font-black uppercase tracking-wider shrink-0">
                        Disabled
                    </Badge>
                </div>

                {/* Automation Features Warning */}
                <div className="space-y-2">
                    <p className="text-xs font-bold text-muted-foreground">
                        Enable this page/account to use it in these modules:
                    </p>
                    <div className="grid grid-cols-2 gap-1.5 p-3 rounded-2xl bg-card/40 border border-white/5 text-[11px] font-bold text-muted-foreground">
                        {AUTOMATION_FEATURES.map((feature) => (
                            <div key={feature} className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-3 w-3 text-amber-500 shrink-0" />
                                <span>{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <DialogFooter className="pt-4 flex flex-col-reverse sm:flex-row gap-2">
                    <Button variant="outline" className="rounded-xl font-bold text-xs" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleGoToIntegration}
                        className="rounded-xl font-bold text-xs gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/25 hover:from-amber-600 hover:to-orange-600"
                    >
                        <span>{isFacebook ? "Go to Facebook Integration" : "Go to Instagram Integration"}</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
