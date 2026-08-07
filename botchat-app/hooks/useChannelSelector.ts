"use client";

import { useState, useEffect, useCallback } from "react";
import api from "@/lib/api";
import { ChannelItem } from "@/components/channels/ChannelDisabledWarningModal";

export interface UseChannelSelectorOptions {
    platform?: "facebook" | "instagram";
    initialValue?: string | number | null;
    onChange?: (channel: ChannelItem | null) => void;
    allowDisabledSelection?: boolean;
}

export function useChannelSelector({
    platform = "facebook",
    initialValue = null,
    onChange,
    allowDisabledSelection = false,
}: UseChannelSelectorOptions = {}) {
    const [channels, setChannels] = useState<ChannelItem[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [selectedChannelId, setSelectedChannelId] = useState<string | number | null>(initialValue);
    const [warningModalOpen, setWarningModalOpen] = useState<boolean>(false);
    const [disabledClickedChannel, setDisabledClickedChannel] = useState<ChannelItem | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>("");

    const isFacebook = platform === "facebook";

    const fetchChannels = useCallback(async () => {
        setIsLoading(true);
        try {
            if (isFacebook) {
                const response = await api.get("/facebook/pages");
                const data = response.data?.data || response.data?.pages || response.data || [];
                const parsed: ChannelItem[] = (Array.isArray(data) ? data : []).map((item: any) => ({
                    ...item,
                    platform: "facebook",
                    is_enabled: Boolean(item.is_enabled ?? (item.status === "active")),
                }));
                setChannels(parsed);
            } else {
                const response = await api.get("/social/instagram-connect");
                const data = response.data?.data?.instagram_accounts || response.data?.instagram_accounts || response.data?.data || response.data || [];
                const parsed: ChannelItem[] = (Array.isArray(data) ? data : []).map((item: any) => ({
                    ...item,
                    platform: "instagram",
                    is_enabled: Boolean(item.is_active ?? item.is_enabled ?? true),
                }));
                setChannels(parsed);
            }
        } catch (error) {
            console.error(`Failed to fetch ${platform} channels:`, error);
        } finally {
            setIsLoading(false);
        }
    }, [isFacebook, platform]);

    // Initial fetch + auto-refresh on window focus when user returns from integration page
    useEffect(() => {
        fetchChannels();

        const handleFocus = () => {
            fetchChannels();
        };

        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, [fetchChannels]);

    // Update selectedChannelId if initialValue changes externally
    useEffect(() => {
        if (initialValue !== undefined && initialValue !== null) {
            setSelectedChannelId(initialValue);
        }
    }, [initialValue]);

    const handleSelectChannel = useCallback((channel: ChannelItem) => {
        const isEnabled = Boolean(channel.is_enabled ?? channel.is_active);

        if (isEnabled || allowDisabledSelection) {
            setSelectedChannelId(channel.id);
            if (onChange) {
                onChange(channel);
            }
        } else {
            // Keep previous selection, show Warning Modal
            setDisabledClickedChannel(channel);
            setWarningModalOpen(true);
        }
    }, [allowDisabledSelection, onChange]);

    const filteredChannels = channels.filter((ch) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        const name = (ch.page_name || ch.name || ch.username || "").toLowerCase();
        const pageId = (ch.page_id || ch.instagram_id || String(ch.id)).toLowerCase();
        return name.includes(query) || pageId.includes(query);
    });

    const selectedChannel = channels.find(
        (ch) => String(ch.id) === String(selectedChannelId) || String(ch.page_id) === String(selectedChannelId) || String(ch.instagram_id) === String(selectedChannelId)
    ) || null;

    return {
        channels,
        filteredChannels,
        isLoading,
        selectedChannelId,
        selectedChannel,
        warningModalOpen,
        setWarningModalOpen,
        disabledClickedChannel,
        searchQuery,
        setSearchQuery,
        handleSelectChannel,
        refreshChannels: fetchChannels,
    };
}
