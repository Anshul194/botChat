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
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-muted-foreground">
                    Connected Accounts
                </h3>
                <button
                    onClick={handleConnectClick}
                    className="text-[10px] font-black text-primary hover:text-opacity-80 flex items-center gap-1 cursor-pointer"
                >
                    <Plus className="w-3 h-3" /> Add
                </button>
            </div>

            <div className="space-y-1 max-h-[140px] overflow-y-auto scrollbar-thin">
                {accounts.length === 0 ? (
                    <div className="text-center py-4 text-xs text-muted-foreground">
                        No accounts connected
                    </div>
                ) : (
                    accounts.map((account) => {
                        const isSelected = selectedAccount?.id === account.id;
                        const unread = getUnreadCount(account.id);
                        const isFB = account.platform === "facebook";

                        return (
                            <div
                                key={account.id}
                                onClick={() => selectAccount(isSelected ? null : account)}
                                className={`flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all border ${
                                    isSelected
                                        ? "bg-primary/5 border-primary/25"
                                        : "border-transparent hover:bg-neutral-50 dark:hover:bg-neutral-900"
                                }`}
                            >
                                <div className="flex items-center gap-2.5 min-w-0">
                                    <div className="relative flex-shrink-0">
                                        {account.profile_pic ? (
                                            <img
                                                src={account.profile_pic}
                                                alt={account.name}
                                                className="w-8 h-8 rounded-lg object-cover"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-lg bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center font-bold text-xs text-foreground">
                                                {account.name[0]}
                                            </div>
                                        )}
                                        {/* Platform icon badge */}
                                        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center shadow-sm text-white ${
                                            isFB ? "bg-blue-600" : "bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600"
                                        }`}>
                                            {isFB ? (
                                                <Facebook className="w-2.5 h-2.5 fill-current" />
                                            ) : (
                                                <Instagram className="w-2.5 h-2.5" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-xs font-bold truncate text-foreground">
                                            {account.name}
                                        </div>
                                        <div className="text-[10px] text-muted-foreground truncate">
                                            {isFB ? "Facebook Page" : `@${account.username}`}
                                        </div>
                                    </div>
                                </div>
                                {unread > 0 && (
                                    <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-primary/10 text-primary">
                                        {unread}
                                    </span>
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
