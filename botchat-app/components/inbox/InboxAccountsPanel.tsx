"use client";

import { useState, useEffect, useCallback } from "react";
import { Facebook, Instagram, CheckCircle, XCircle, RefreshCw, Inbox, Settings, WifiOff } from "lucide-react";
import { getAccounts, toggleInbox, connectAccount, disconnectAccount } from "@/services/smartInboxService";

interface Account {
    id: number;
    platform: "facebook" | "instagram";
    name: string;
    username: string;
    profile_image: string | null;
    sync_status: "connected" | "disconnected" | "syncing";
    inbox_enabled: boolean;
    last_sync_at: string | null;
}

export default function InboxAccountsPanel({ onClose }: { onClose: () => void }) {
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [loading, setLoading] = useState(true);
    const [togglingId, setTogglingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    const fetchAccounts = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await getAccounts();
            setAccounts(res.data ?? []);
        } catch (e: any) {
            setError("Failed to load accounts. Please try again.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    const handleToggle = async (account: Account) => {
        setTogglingId(account.id);
        const newEnabled = !account.inbox_enabled;
        // Optimistic update
        setAccounts((prev) =>
            prev.map((a) => (a.id === account.id ? { ...a, inbox_enabled: newEnabled } : a))
        );
        try {
            await toggleInbox(account.platform, account.id, newEnabled);
        } catch (e) {
            // Revert on failure
            setAccounts((prev) =>
                prev.map((a) => (a.id === account.id ? { ...a, inbox_enabled: !newEnabled } : a))
            );
            setError(`Failed to update inbox status for ${account.name}.`);
        } finally {
            setTogglingId(null);
        }
    };

    const handleConnect = async (account: Account) => {
        setTogglingId(account.id);
        try {
            await connectAccount(account.platform, account.id);
            setAccounts((prev) =>
                prev.map((a) => (a.id === account.id ? { ...a, sync_status: "connected", inbox_enabled: true } : a))
            );
        } catch {
            setError(`Failed to connect ${account.name}.`);
        } finally {
            setTogglingId(null);
        }
    };

    const handleDisconnect = async (account: Account) => {
        setTogglingId(account.id);
        try {
            await disconnectAccount(account.platform, account.id);
            setAccounts((prev) =>
                prev.map((a) => (a.id === account.id ? { ...a, sync_status: "disconnected", inbox_enabled: false } : a))
            );
        } catch {
            setError(`Failed to disconnect ${account.name}.`);
        } finally {
            setTogglingId(null);
        }
    };

    const facebook = accounts.filter((a) => a.platform === "facebook");
    const instagram = accounts.filter((a) => a.platform === "instagram");

    return (
        <div
            className="flex flex-col h-full"
            style={{ background: "var(--card)" }}
        >
            {/* Header */}
            <div
                className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
                style={{ borderColor: "var(--glass-border)" }}
            >
                <div className="flex items-center gap-2">
                    <Settings className="w-4 h-4" style={{ color: "var(--brand-purple)" }} />
                    <h2 className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
                        Inbox Accounts
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchAccounts}
                        className="p-1.5 rounded-lg hover:opacity-70 transition-opacity"
                        style={{ background: "var(--glass-bg)" }}
                        title="Refresh"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} style={{ color: "var(--muted-foreground)" }} />
                    </button>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg hover:opacity-70 transition-opacity text-xs font-medium px-3"
                        style={{ background: "var(--glass-bg)", color: "var(--muted-foreground)", border: "1px solid var(--glass-border)" }}
                    >
                        ← Back
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-5">
                {/* Error */}
                {error && (
                    <div className="text-xs px-3 py-2 rounded-xl bg-red-50 text-red-600 border border-red-100 flex items-center gap-2">
                        <XCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        {error}
                    </div>
                )}

                {/* Info Banner */}
                <div
                    className="flex items-start gap-2 p-3 rounded-xl text-xs"
                    style={{ background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)", color: "var(--muted-foreground)" }}
                >
                    <Inbox className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "#a855f7" }} />
                    <span>
                        Toggle <strong style={{ color: "var(--foreground)" }}>Inbox</strong> to enable or disable message syncing from each account into the Smart Inbox.
                    </span>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div
                                key={i}
                                className="rounded-xl p-3 animate-pulse"
                                style={{ background: "var(--glass-bg)", height: "72px" }}
                            />
                        ))}
                    </div>
                ) : accounts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                        <WifiOff className="w-8 h-8 text-gray-300" />
                        <p className="text-sm text-gray-400">No connected accounts found.</p>
                        <p className="text-xs text-gray-400">Connect a Facebook Page or Instagram Account first.</p>
                    </div>
                ) : (
                    <>
                        {/* Facebook Section */}
                        {facebook.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Facebook className="w-3.5 h-3.5" style={{ color: "#3b82f6" }} />
                                    <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                                        Facebook Pages ({facebook.length})
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {facebook.map((account) => (
                                        <AccountCard
                                            key={account.id}
                                            account={account}
                                            isToggling={togglingId === account.id}
                                            onToggle={handleToggle}
                                            onConnect={handleConnect}
                                            onDisconnect={handleDisconnect}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Instagram Section */}
                        {instagram.length > 0 && (
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Instagram className="w-3.5 h-3.5" style={{ color: "#ec4899" }} />
                                    <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                                        Instagram Accounts ({instagram.length})
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {instagram.map((account) => (
                                        <AccountCard
                                            key={account.id}
                                            account={account}
                                            isToggling={togglingId === account.id}
                                            onToggle={handleToggle}
                                            onConnect={handleConnect}
                                            onDisconnect={handleDisconnect}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

function AccountCard({
    account,
    isToggling,
    onToggle,
    onConnect,
    onDisconnect,
}: {
    account: Account;
    isToggling: boolean;
    onToggle: (a: Account) => void;
    onConnect: (a: Account) => void;
    onDisconnect: (a: Account) => void;
}) {
    const isConnected = account.sync_status === "connected";
    const isFacebook = account.platform === "facebook";

    return (
        <div
            className="rounded-xl p-3 flex items-center gap-3 transition-all"
            style={{
                background: "var(--glass-bg)",
                border: `1px solid ${account.inbox_enabled && isConnected ? "rgba(124,58,237,0.2)" : "var(--glass-border)"}`,
            }}
        >
            {/* Avatar */}
            <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                style={{
                    background: isFacebook
                        ? "linear-gradient(135deg,#3b82f6,#06b6d4)"
                        : "linear-gradient(135deg,#ec4899,#7c3aed)",
                }}
            >
                {account.name?.[0]?.toUpperCase() ?? (isFacebook ? "F" : "I")}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate" style={{ color: "var(--foreground)" }}>
                    {account.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                        className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                        style={{
                            background: isConnected ? "rgba(16,185,129,0.1)" : "rgba(107,114,128,0.1)",
                            color: isConnected ? "#10b981" : "#6b7280",
                        }}
                    >
                        {isConnected ? "● Connected" : "○ Disconnected"}
                    </span>
                    {account.last_sync_at && (
                        <span className="text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                            {new Date(account.last_sync_at).toLocaleDateString()}
                        </span>
                    )}
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-2 flex-shrink-0">
                {/* Connect / Disconnect button */}
                {!isConnected ? (
                    <button
                        onClick={() => onConnect(account)}
                        disabled={isToggling}
                        className="text-[10px] px-2.5 py-1 rounded-lg font-semibold transition-all hover:opacity-80 disabled:opacity-40"
                        style={{ background: "rgba(16,185,129,0.15)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)" }}
                    >
                        Connect
                    </button>
                ) : (
                    <button
                        onClick={() => onDisconnect(account)}
                        disabled={isToggling}
                        className="text-[10px] px-2.5 py-1 rounded-lg font-semibold transition-all hover:opacity-80 disabled:opacity-40"
                        style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}
                    >
                        Disconnect
                    </button>
                )}

                {/* Inbox toggle — only show when connected */}
                {isConnected && (
                    <div className="flex flex-col items-center gap-0.5">
                        <button
                            onClick={() => onToggle(account)}
                            disabled={isToggling}
                            title={account.inbox_enabled ? "Disable Inbox" : "Enable Inbox"}
                            className={`relative w-10 h-5 rounded-full transition-all duration-300 disabled:opacity-50 ${account.inbox_enabled ? "opacity-100" : "opacity-60"}`}
                            style={{
                                background: account.inbox_enabled
                                    ? "linear-gradient(135deg, #7c3aed, #a855f7)"
                                    : "var(--glass-border)",
                            }}
                        >
                            {isToggling ? (
                                <span className="absolute inset-0 flex items-center justify-center">
                                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                </span>
                            ) : (
                                <span
                                    className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-300"
                                    style={{ left: account.inbox_enabled ? "calc(100% - 18px)" : "2px" }}
                                />
                            )}
                        </button>
                        <span className="text-[9px]" style={{ color: account.inbox_enabled ? "#a855f7" : "var(--muted-foreground)" }}>
                            {account.inbox_enabled ? "Inbox ON" : "Inbox OFF"}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
