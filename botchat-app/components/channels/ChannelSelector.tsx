"use client";

import React, { useState } from "react";
import { useChannelSelector } from "@/hooks/useChannelSelector";
import { ChannelItem, ChannelDisabledWarningModal } from "@/components/channels/ChannelDisabledWarningModal";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, Search, Check, AlertCircle, Loader2, Globe, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChannelSelectorProps {
    platform?: "facebook" | "instagram";
    value?: string | number | null;
    onChange?: (channel: ChannelItem | null) => void;
    multiple?: boolean;
    showDisabled?: boolean;
    allowDisabledSelection?: boolean;
    redirectToIntegration?: boolean;
    showStatusBadge?: boolean;
    showSearch?: boolean;
    placeholder?: string;
    className?: string;
}

export function ChannelSelector({
    platform = "facebook",
    value = null,
    onChange,
    multiple = false,
    showDisabled = true,
    allowDisabledSelection = false,
    redirectToIntegration = true,
    showStatusBadge = true,
    showSearch = true,
    placeholder,
    className,
}: ChannelSelectorProps) {
    const [open, setOpen] = useState(false);

    const {
        channels,
        filteredChannels,
        isLoading,
        selectedChannel,
        warningModalOpen,
        setWarningModalOpen,
        disabledClickedChannel,
        searchQuery,
        setSearchQuery,
        handleSelectChannel,
    } = useChannelSelector({
        platform,
        initialValue: value,
        onChange: (ch) => {
            if (onChange) onChange(ch);
            setOpen(false);
        },
        allowDisabledSelection,
    });

    const isFacebook = platform === "facebook";
    const defaultPlaceholder = placeholder || (isFacebook ? "Select Facebook Page..." : "Select Instagram Account...");

    return (
        <>
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className={cn(
                            "w-full justify-between rounded-xl bg-card/40 border border-white/10 px-3.5 py-2 text-xs font-bold transition-all hover:bg-card/70",
                            !selectedChannel && "text-muted-foreground",
                            className
                        )}
                    >
                        {selectedChannel ? (
                            <div className="flex items-center gap-2.5 truncate">
                                <Avatar className="h-6 w-6 border border-background shrink-0">
                                    <AvatarImage src={selectedChannel.picture || selectedChannel.profile_picture} />
                                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-black">
                                        {(selectedChannel.page_name || selectedChannel.name || selectedChannel.username || "C")[0]}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="truncate text-foreground font-black">
                                    {selectedChannel.page_name || selectedChannel.name || (selectedChannel.username ? `@${selectedChannel.username}` : "Selected Channel")}
                                </span>
                                {showStatusBadge && (
                                    <div className="flex items-center gap-1 shrink-0 ml-1">
                                        <div className={cn("w-1.5 h-1.5 rounded-full", selectedChannel.is_enabled ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" : "bg-rose-500")} />
                                    </div>
                                )}
                            </div>
                        ) : (
                            <span className="truncate">{defaultPlaceholder}</span>
                        )}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-[320px] p-2 rounded-2xl border border-white/10 shadow-2xl bg-card/95 backdrop-blur-xl" align="start">
                    {/* Search Bar */}
                    {showSearch && (
                        <div className="relative mb-2 px-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                placeholder={isFacebook ? "Search pages..." : "Search accounts..."}
                                className="pl-8 pr-3 py-1.5 h-8 text-xs rounded-xl bg-muted/40 border-none"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    )}

                    {/* Channel List */}
                    <div className="max-h-60 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                        {isLoading ? (
                            <div className="flex items-center justify-center py-6 gap-2 text-xs text-muted-foreground font-bold">
                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                <span>Loading channels...</span>
                            </div>
                        ) : filteredChannels.length === 0 ? (
                            <div className="text-center py-6 text-xs text-muted-foreground font-medium">
                                No {isFacebook ? "Facebook Pages" : "Instagram Accounts"} connected.
                            </div>
                        ) : (
                            filteredChannels.map((channel) => {
                                const isEnabled = Boolean(channel.is_enabled ?? channel.is_active);
                                const isSelected = selectedChannel && (String(selectedChannel.id) === String(channel.id) || String(selectedChannel.page_id) === String(channel.page_id));
                                const name = channel.page_name || channel.name || (channel.username ? `@${channel.username}` : "Channel");

                                return (
                                    <div
                                        key={channel.id}
                                        onClick={() => handleSelectChannel(channel)}
                                        className={cn(
                                            "flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer group select-none",
                                            isSelected && "bg-primary/10 border border-primary/20",
                                            !isSelected && isEnabled && "hover:bg-muted/40",
                                            !isEnabled && "opacity-60 hover:bg-rose-500/5 hover:opacity-100"
                                        )}
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0">
                                            <Avatar className="h-7 w-7 border border-background shrink-0">
                                                <AvatarImage src={channel.picture || channel.profile_picture} />
                                                <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-black">
                                                    {name[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold leading-tight truncate">{name}</p>
                                                <p className="text-[10px] text-muted-foreground font-medium truncate flex items-center gap-1 mt-0.5">
                                                    {isEnabled ? (
                                                        <span className="text-emerald-500 font-bold flex items-center gap-1">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.6)]" /> Enabled
                                                        </span>
                                                    ) : (
                                                        <span className="text-rose-500 font-bold flex items-center gap-1">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Disabled (Click to enable)
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-1 shrink-0 ml-2">
                                            {isSelected && <Check className="h-4 w-4 text-primary" />}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </PopoverContent>
            </Popover>

            {/* Global Warning Modal */}
            <ChannelDisabledWarningModal
                open={warningModalOpen}
                onOpenChange={setWarningModalOpen}
                channel={disabledClickedChannel}
                platform={platform}
            />
        </>
    );
}
