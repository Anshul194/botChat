// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { Shield, Check, Copy, Eye, EyeOff, KeyRound, Smartphone, RefreshCw, Loader2 } from "lucide-react";
import { useAppDispatch } from "@/store/hooks";
import { changePassword } from "@/store/slices/authSlice";
import api from "@/lib/api";
import { Section, InputField, IntegrationHeader } from "./shared-ui";

export default function SecurityTab({ showModal }: { showModal: (type: string, title: string, desc: string) => void }) {
    const dispatch = useAppDispatch();

    // ── 2FA status ───────────────────────────────────────────────────────────
    const [security, setSecurity] = useState<any>(null);
    const [loadingStatus, setLoadingStatus] = useState(true);
    // Setup payload from /security/2fa/setup (secret + QR data URIs)
    const [setup, setSetup] = useState<any>(null);
    // Freshly generated recovery codes (shown once, with a copy button)
    const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
    const [showRecoveryCodes, setShowRecoveryCodes] = useState(false);
    const [copied, setCopied] = useState(false);

    // Enable flow
    const [enablePassword, setEnablePassword] = useState("");
    const [verifyCode, setVerifyCode] = useState("");
    const [showEnablePassword, setShowEnablePassword] = useState(false);

    // Disable flow
    const [disablePassword, setDisablePassword] = useState("");
    const [disableCode, setDisableCode] = useState("");
    const [showDisablePassword, setShowDisablePassword] = useState(false);

    // Regenerate flow
    const [regenPassword, setRegenPassword] = useState("");
    const [regenCode, setRegenCode] = useState("");
    const [showRegenPassword, setShowRegenPassword] = useState(false);
    const [showRegenForm, setShowRegenForm] = useState(false);

    const [busy, setBusy] = useState(false);

    // Change password
    const [passwordForm, setPasswordForm] = useState({ current_password: "", password: "", password_confirmation: "" });
    const [changingPassword, setChangingPassword] = useState(false);

    const isEnabled = !!security?.two_factor_enabled;

    const loadStatus = async () => {
        setLoadingStatus(true);
        try {
            const res = await api.get("/me/security");
            if (res.data?.success) setSecurity(res.data.data);
        } catch (e) {
            // Ignore — individual actions surface their own errors.
        } finally {
            setLoadingStatus(false);
        }
    };

    useEffect(() => { loadStatus(); }, []);

    const handleStartSetup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!enablePassword) {
            showModal("error", "Validation", "Enter your current password.");
            return;
        }
        setBusy(true);
        try {
            const res = await api.post("/security/2fa/setup", { password: enablePassword });
            if (res.data?.success) {
                setSetup(res.data.data);
                setVerifyCode("");
            } else {
                showModal("error", "Error", res.data?.message || "Failed to start two-factor setup.");
            }
        } catch (err: any) {
            showModal("error", "Error", err.response?.data?.message || err.message || "Failed to start two-factor setup.");
        } finally {
            setBusy(false);
        }
    };

    const handleConfirmSetup = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!verifyCode) {
            showModal("error", "Validation", "Enter the 6-digit code from your authenticator app.");
            return;
        }
        setBusy(true);
        try {
            const res = await api.post("/security/2fa/verify", { code: verifyCode });
            if (res.data?.success) {
                setRecoveryCodes(res.data.data?.recovery_codes || []);
                setShowRecoveryCodes(true);
                setSetup(null);
                setEnablePassword("");
                setSecurity((prev: any) => ({
                    ...(prev || {}),
                    two_factor_enabled: true,
                    recovery_codes_count: res.data.data?.recovery_codes?.length,
                }));
                showModal("success", "Two-Factor Enabled", "Your account is now protected with an authenticator app.");
            } else {
                showModal("error", "Error", res.data?.message || "Invalid code. Please try again.");
            }
        } catch (err: any) {
            showModal("error", "Error", err.response?.data?.message || err.message || "Invalid code. Please try again.");
        } finally {
            setBusy(false);
        }
    };

    const handleDisable = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!disablePassword || !disableCode) {
            showModal("error", "Validation", "Your current password and an authentication code are required.");
            return;
        }
        setBusy(true);
        try {
            const res = await api.post("/security/2fa/disable", { password: disablePassword, code: disableCode });
            if (res.data?.success) {
                setSecurity((prev: any) => ({ ...(prev || {}), two_factor_enabled: false, recovery_codes_count: 0 }));
                setDisablePassword("");
                setDisableCode("");
                setRecoveryCodes([]);
                setShowRecoveryCodes(false);
                showModal("success", "Two-Factor Disabled", "Two-factor authentication has been turned off.");
            } else {
                showModal("error", "Error", res.data?.message || "Failed to disable two-factor authentication.");
            }
        } catch (err: any) {
            showModal("error", "Error", err.response?.data?.message || err.message || "Failed to disable two-factor authentication.");
        } finally {
            setBusy(false);
        }
    };

    const handleRegenerate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!regenPassword || !regenCode) {
            showModal("error", "Validation", "Your current password and an authentication code are required.");
            return;
        }
        setBusy(true);
        try {
            const res = await api.post("/security/2fa/recovery", { password: regenPassword, code: regenCode });
            if (res.data?.success) {
                setRecoveryCodes(res.data.data?.recovery_codes || []);
                setShowRecoveryCodes(true);
                setRegenPassword("");
                setRegenCode("");
                setShowRegenForm(false);
                showModal("success", "Recovery Codes Regenerated", "Your old recovery codes are now invalid.");
            } else {
                showModal("error", "Error", res.data?.message || "Failed to regenerate recovery codes.");
            }
        } catch (err: any) {
            showModal("error", "Error", err.response?.data?.message || err.message || "Failed to regenerate recovery codes.");
        } finally {
            setBusy(false);
        }
    };

    const handleCopyCodes = () => {
        navigator.clipboard.writeText(recoveryCodes.join("\n"));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleChangePassword = async () => {
        const { current_password, password, password_confirmation } = passwordForm;
        if (!current_password || !password) {
            showModal("error", "Validation", "All password fields are required.");
            return;
        }
        if (password.length < 8) {
            showModal("error", "Validation", "New password must be at least 8 characters.");
            return;
        }
        if (password !== password_confirmation) {
            showModal("error", "Validation", "Passwords do not match.");
            return;
        }
        setChangingPassword(true);
        try {
            await dispatch(changePassword({ current_password, password, password_confirmation })).unwrap();
            showModal("success", "Password Updated", "Your password has been changed successfully.");
            setPasswordForm({ current_password: "", password: "", password_confirmation: "" });
        } catch (err: any) {
            showModal("error", "Error", typeof err === 'string' ? err : "Failed to change password.");
        } finally {
            setChangingPassword(false);
        }
    };

    return (
        <div className="space-y-4">
            <IntegrationHeader title="Security & Authentication" desc="Manage your password, 2FA, and active sessions." Icon={Shield} color="#10b981" isConnected={isEnabled} />

            {/* Change Password */}
            <Section title="Change Password" desc="Use a strong, unique password">
                <InputField label="Current Password" type="password" placeholder="••••••••" value={passwordForm.current_password} onChange={(e: any) => setPasswordForm(p => ({ ...p, current_password: e.target.value }))} />
                <InputField label="New Password" type="password" placeholder="Min 8 characters" value={passwordForm.password} onChange={(e: any) => setPasswordForm(p => ({ ...p, password: e.target.value }))} />
                <InputField label="Confirm Password" type="password" placeholder="Repeat new password" value={passwordForm.password_confirmation} onChange={(e: any) => setPasswordForm(p => ({ ...p, password_confirmation: e.target.value }))} />
                <div className="flex justify-end">
                    <button onClick={handleChangePassword} disabled={changingPassword} className="w-full px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50 sm:w-auto"
                        style={{ background: "var(--brand-gradient)", color: "white" }}>{changingPassword ? "Updating..." : "Update Password"}</button>
                </div>
            </Section>

            {/* Two-Factor Authentication */}
            <Section
                title="Two-Factor Authentication"
                desc={isEnabled ? "Your account is protected by an authenticator app." : "Add an extra layer of security with a TOTP authenticator app."}
                icon={<Smartphone className="w-5 h-5 text-emerald-500" />}
                rightContent={
                    loadingStatus ? null : (
                        <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full"
                            style={isEnabled
                                ? { background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }
                                : { background: "var(--glass-border)", color: "var(--muted-foreground)", border: "1px solid var(--glass-border)" }}>
                            {isEnabled ? <><Check className="w-3.5 h-3.5" /> Enabled</> : "Not Configured"}
                        </span>
                    )
                }
            >
                {loadingStatus ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-5 h-5 animate-spin" style={{ color: "var(--muted-foreground)" }} />
                    </div>
                ) : !isEnabled ? (
                    /* ── Setup flow ── */
                    <div className="space-y-5">
                        {!setup ? (
                            <form onSubmit={handleStartSetup} className="space-y-4">
                                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                                    You&apos;ll scan a QR code with Google Authenticator, Microsoft Authenticator, Authy, 1Password, or Apple Passwords.
                                </p>
                                <div className="max-w-sm">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium block" style={{ color: "var(--foreground)" }}>Current Password</label>
                                        <div className="relative">
                                            <input
                                                type={showEnablePassword ? "text" : "password"}
                                                value={enablePassword}
                                                onChange={(e: any) => setEnablePassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm outline-none transition-all"
                                                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                                                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "var(--input-focus-ring)"; }}
                                                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--glass-border)"; e.currentTarget.style.boxShadow = "none"; }}
                                            />
                                            <button type="button" onClick={() => setShowEnablePassword(v => !v)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                                                style={{ color: "var(--muted-foreground)" }}>
                                                {showEnablePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button type="submit" disabled={busy} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50"
                                        style={{ background: "var(--brand-gradient)", color: "white" }}>
                                        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />} Enable Two-Factor
                                    </button>
                                </div>
                            </form>
                        ) : (
                            /* ── QR + manual key + confirm ── */
                            <div className="space-y-5">
                                <div className="flex flex-col sm:flex-row gap-6 items-start">
                                    <div className="p-3 rounded-xl shrink-0" style={{ background: "#ffffff", border: "1px solid var(--glass-border)" }}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={setup.qr_code_png || setup.qr_code_svg} alt="QR Code" width={190} height={190} className="rounded-lg" />
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                                            Scan this QR code with your authenticator app, or enter the key manually. Then enter the 6-digit code it shows.
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 px-3 py-2.5 rounded-xl text-xs font-mono break-all" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>{setup.secret}</code>
                                            <button type="button" onClick={() => navigator.clipboard.writeText(setup.secret)} className="p-2 rounded-lg hover:opacity-70" style={{ background: "var(--glass-border)" }}>
                                                <Copy className="w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
                                            </button>
                                        </div>
                                        <form onSubmit={handleConfirmSetup} className="space-y-3 pt-1">
                                            <div className="max-w-xs">
                                                <InputField label="6-digit code" type="text" inputMode="numeric" maxLength={6} placeholder="000000" value={verifyCode} onChange={(e: any) => setVerifyCode(e.target.value.replace(/\D/g, ""))} />
                                            </div>
                                            <div className="flex justify-end">
                                                <button type="submit" disabled={busy} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50"
                                                    style={{ background: "var(--brand-gradient)", color: "white" }}>
                                                    {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />} Confirm & Enable
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* ── Enabled: recovery codes + regenerate + disable ── */
                    <div className="space-y-6">
                        {showRecoveryCodes && recoveryCodes.length > 0 && (
                            <div className="p-4 rounded-xl" style={{ background: "rgba(245,158,11,0.08)", border: "1px solid rgba(245,158,11,0.25)" }}>
                                <p className="text-sm font-semibold mb-1 flex items-center gap-2" style={{ color: "#f59e0b" }}>
                                    <KeyRound className="w-4 h-4" /> Your Recovery Codes
                                </p>
                                <p className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>
                                    Save these immediately. Each code works only once — treat them like passwords.
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                                    {recoveryCodes.map((code, i) => (
                                        <code key={i} className="px-3 py-2 rounded-lg text-xs font-mono tracking-wider" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>{code}</code>
                                    ))}
                                </div>
                                <button type="button" onClick={handleCopyCodes} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-80 transition-all"
                                    style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" }}>
                                    {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} {copied ? "Copied!" : "Copy all codes"}
                                </button>
                            </div>
                        )}

                        <div className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid var(--glass-border)" }}>
                            <div>
                                <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Recovery codes</p>
                                <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                                    {security?.recovery_codes_count || 0} active — regenerate to invalidate old ones.
                                </p>
                            </div>
                            <button type="button" onClick={() => setShowRegenForm(v => !v)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold hover:opacity-80 transition-all"
                                style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}>
                                <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                            </button>
                        </div>

                        {showRegenForm && (
                            <form onSubmit={handleRegenerate} className="space-y-3 rounded-xl p-4" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium block" style={{ color: "var(--foreground)" }}>Current Password</label>
                                        <div className="relative">
                                            <input type={showRegenPassword ? "text" : "password"} value={regenPassword}
                                                onChange={(e: any) => setRegenPassword(e.target.value)} placeholder="••••••••"
                                                className="w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm outline-none transition-all"
                                                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                                                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "var(--input-focus-ring)"; }}
                                                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--glass-border)"; e.currentTarget.style.boxShadow = "none"; }} />
                                            <button type="button" onClick={() => setShowRegenPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70" style={{ color: "var(--muted-foreground)" }}>
                                                {showRegenPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium block" style={{ color: "var(--foreground)" }}>Authenticator code</label>
                                        <input type="text" inputMode="numeric" maxLength={6} value={regenCode}
                                            onChange={(e: any) => setRegenCode(e.target.value.replace(/\D/g, ""))} placeholder="000000"
                                            className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all"
                                            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                                            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "var(--input-focus-ring)"; }}
                                            onBlur={(e) => { e.currentTarget.style.borderColor = "var(--glass-border)"; e.currentTarget.style.boxShadow = "none"; }} />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button type="submit" disabled={busy} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50"
                                        style={{ background: "var(--brand-gradient)", color: "white" }}>
                                        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Generate New Codes
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="p-4 rounded-xl" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
                            <p className="text-sm font-semibold mb-1" style={{ color: "#ef4444" }}>Disable Two-Factor Authentication</p>
                            <p className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>
                                Removing 2FA lowers the security of your account. You&apos;ll need your current password and an authentication code.
                            </p>
                            <form onSubmit={handleDisable} className="space-y-3">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium block" style={{ color: "var(--foreground)" }}>Current Password</label>
                                        <div className="relative">
                                            <input type={showDisablePassword ? "text" : "password"} value={disablePassword}
                                                onChange={(e: any) => setDisablePassword(e.target.value)} placeholder="••••••••"
                                                className="w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm outline-none transition-all"
                                                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                                                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "var(--input-focus-ring)"; }}
                                                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--glass-border)"; e.currentTarget.style.boxShadow = "none"; }} />
                                            <button type="button" onClick={() => setShowDisablePassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70" style={{ color: "var(--muted-foreground)" }}>
                                                {showDisablePassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium block" style={{ color: "var(--foreground)" }}>Authenticator code</label>
                                        <input type="text" inputMode="numeric" maxLength={6} value={disableCode}
                                            onChange={(e: any) => setDisableCode(e.target.value.replace(/\D/g, ""))} placeholder="000000"
                                            className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all"
                                            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                                            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "var(--input-focus-ring)"; }}
                                            onBlur={(e) => { e.currentTarget.style.borderColor = "var(--glass-border)"; e.currentTarget.style.boxShadow = "none"; }} />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button type="submit" disabled={busy} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-80 transition-all disabled:opacity-50"
                                        style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                                        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />} Disable Two-Factor
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </Section>
        </div>
    );
}
