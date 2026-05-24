"use client";

import { Facebook, Instagram, Plus } from "lucide-react";
import { useSmartInbox } from "@/hooks/useSmartInbox";

export default function ConnectedAccounts() {
    const {
        accounts,
        selectedAccount,
        selectAccount,
        conversations
    } = useSmartInbox();

    // Helper to calculate unread counts per account
    const getUnreadCount = (accountId: number) => {
        return conversations
            .filter(c => c.platform_account_id === accountId)
            .reduce((sum, c) => sum + (c.unread_count || 0), 0);
    };

    const handleConnectClick = () => {
        // Trigger connecting popups or redirect
        window.dispatchEvent(new CustomEvent('openInstagramConnect'));
    };

    return (
        <div className="flex items-center gap-4 bg-transparent py-1 overflow-hidden">
            <button
                onClick={handleConnectClick}
                className="flex-shrink-0 w-10 h-10 rounded-lg border-2 border-dashed border-border text-muted-foreground flex items-center justify-center hover:border-primary hover:text-primary transition-all group"
                title="Connect new account"
            >
                <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>

            <div className="flex-1 flex items-center gap-3 overflow-x-auto scrollbar-none py-1">
                {accounts.length === 0 ? (
                    <div className="text-[10px] uppercase font-bold tracking-tight text-muted-foreground opacity-40 px-2">
                        No accounts
                    </div>
                ) : (
                    accounts.map((account) => {
                        const isSelected = selectedAccount?.id === account.id;
                        const unread = getUnreadCount(account.id);
                        const isFB = account.platform === "facebook";

                        return (
                            <button
                                key={account.id}
                                onClick={() => selectAccount(isSelected ? null : account)}
                                className={`relative flex-shrink-0 transition-all duration-200 ${isSelected ? "scale-105" : "hover:scale-105 opacity-80 hover:opacity-100"}`}
                                title={account.name}
                            >
                                <div className={`p-0.5 rounded-lg border-2 transition-colors ${isSelected ? "border-primary shadow-sm shadow-primary/20" : "border-transparent"}`}>
                                    {account.profile_pic ? (
                                        <img
                                            src={account.profile_pic}
                                            alt={account.name}
                                            className="w-9 h-9 rounded-md object-cover"
                                        />
                                    ) : (
                                        <div className="w-9 h-9 rounded-md bg-muted flex items-center justify-center font-bold text-xs text-foreground uppercase">
                                            {account.name[0]}
                                        </div>
                                    )}
                                </div>
                                
                                {/* Platform icon badge */}
                                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center shadow-sm text-white border border-background ${
                                    isFB ? "bg-blue-600" : "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]"
                                }`}>
                                    {isFB ? (
                                        <Facebook className="w-2.5 h-2.5 fill-current" />
                                    ) : (
                                        <Instagram className="w-2.5 h-2.5" />
                                    )}
                                </div>

                                {unread > 0 && (
                                    <div className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-md flex items-center justify-center text-[8px] font-bold bg-primary text-white border border-background">
                                        {unread}
                                    </div>
                                )}
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}


