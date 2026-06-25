// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import {
    fetchGeneralSettings,
    fetchFacebookSettings,
    updateFacebookSettings,
    fetchAiSettings, updateAiSettings,
    updateEmailSettings,
    updatePaymentSettings, updateStorageSettings,
} from "../../../store/slices/settingsSlice";
import {
    changePassword
} from "../../../store/slices/authSlice";
import { useModal } from "@/components/providers/ModalProvider";
import {
    User, Shield, Database, Save,
    Plus, Check, Eye, EyeOff, Copy, RefreshCw,
    Globe, Palette, UploadCloud,
    Mail,     Smartphone, Facebook, Sparkles, CreditCard,
    MessageCircle, Radio, Image
} from "lucide-react";
import BrandingTab from "./components/BrandingTab";
import AppearanceTab from "./components/AppearanceTab";
import ModuleSettings from "./components/ModuleSettings";
import { Section, InputField, IntegrationHeader, Toggle, ApiKeyRow } from "./components/shared-ui";

const navigationGroups = [
    {
        title: "Personalization",
        items: [
            { id: "appearance", label: "Appearance", Icon: Palette },
        ]
    },
    {
        title: "Account Setup",
        items: [
            { id: "profile", label: "General Profile", Icon: User },
            { id: "branding", label: "General Settings", Icon: Globe },
            { id: "security", label: "Security", Icon: Shield },
        ]
    },
    {
        title: "App Integrations",
        items: [
            { id: "int-email", label: "Email & SMTP", Icon: Mail },
            { id: "int-social", label: "Social (Facebook, IG)", Icon: Facebook },
            { id: "int-ai", label: "AI Models", Icon: Sparkles },
            { id: "int-payments", label: "Payment Gateways", Icon: CreditCard },
            { id: "int-storage", label: "File Storage", Icon: UploadCloud },
        ]
    },
    {
        title: "Module Config",
        items: [
            { id: "mod-smart-inbox", label: "Smart Inbox", Icon: MessageCircle },
            { id: "mod-broadcast", label: "Broadcast", Icon: Radio },
            { id: "mod-social-posting", label: "Social Posting", Icon: Image },
        ]
    },
    {
        title: "Developers",
        items: [
            { id: "data", label: "Data & Privacy", Icon: Database },
        ]
    }
];

export default function SettingsPage() {
    const [tab, setTab] = useState("profile");
    const dispatch = useDispatch<AppDispatch>();
    const { showModal } = useModal();

    // File selection state
    // Selectors
    const { user, isLoading: authLoading } = useSelector((state: RootState) => state.auth);
    const { general, facebook, ai, isLoadingFacebook, isLoadingAi } = useSelector((state: RootState) => state.settings);

    // Initial Fetch (when opening relevant tabs for the first time or mounted)
    useEffect(() => {
        console.log('SettingsPage useEffect fired, tab:', tab);
        dispatch(fetchGeneralSettings({}));
        if (tab === "int-ai") {
            dispatch(fetchAiSettings());
        }
        if (tab === "int-social") {
            dispatch(fetchFacebookSettings());
        }
    }, [tab, dispatch, user]);

    const [aiForm, setAiForm] = useState({ provider: 'openai', secretKey: '', promptModel: 'gpt-4o', instructionToAi: '' });
    const [fbForm, setFbForm] = useState({
        appName: '', appVersion: '', appId: '', appSecret: '',
        socialLoginEnabled: false, appDomain: '', siteUrl: '',
        privacyPolicyUrl: '', termsOfServiceUrl: '',
    });
    const [showFbSecret, setShowFbSecret] = useState(false);
    const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
    const [passwordForm, setPasswordForm] = useState({ current_password: '', password: '', password_confirmation: '' });

    const [paymentForm, setPaymentForm] = useState({
        currency: 'USD',
        currency_symbol: '$',
        razorpaysetting: 'off',
        razorpay_key: '',
        razorpay_secret: '',
        razorpay_description: 'Razorpay Payment',
    });

    const [storageForm, setStorageForm] = useState({
        storage_type: 's3',
        s3_key: '',
        s3_secret: '',
        s3_region: 'us-east-1',
        s3_bucket: '',
        s3_url: '',
        s3_endpoint: '',
    });

    const [emailForm, setEmailForm] = useState({
        email_setting_enable: 'on',
        mail_mailer: 'smtp',
        mail_host: '',
        mail_port: '587',
        mail_username: '',
        mail_password: '',
        mail_encryption: 'tls',
        mail_from_address: '',
        mail_from_name: '',
    });

    useEffect(() => {
        if (ai && ai.provider) {
            setAiForm({
                provider: ai.provider,
                secretKey: ai.secretKey || '',
                promptModel: ai.promptModel || 'gpt-4o',
                instructionToAi: ai.instructionToAi || ''
            });
        }
    }, [ai]);

    useEffect(() => {
        if (facebook) {
            setFbForm(prev => ({
                ...prev,
                appName: facebook.appName || '',
                appVersion: facebook.appVersion || '',
                appId: facebook.appId || '',
                appSecret: '',
                socialLoginEnabled: facebook.socialLoginEnabled ?? false,
                appDomain: facebook.appDomain || '',
                siteUrl: facebook.siteUrl || '',
                privacyPolicyUrl: facebook.privacyPolicyUrl || '',
                termsOfServiceUrl: facebook.termsOfServiceUrl || '',
            }));
        }
    }, [facebook]);

    const handleCopyUrl = (url: string) => {
        navigator.clipboard.writeText(url);
        setCopiedUrl(url);
        setTimeout(() => setCopiedUrl(null), 2000);
    };

    useEffect(() => {
        if (general) {
            setPaymentForm({
                currency: general.currency || 'USD',
                currency_symbol: general.currency_symbol || '$',
                razorpaysetting: general.razorpaysetting === 'on' ? 'on' : 'off',
                razorpay_key: general.razorpay_key || '',
                razorpay_secret: general.razorpay_secret || '',
                razorpay_description: general.razorpay_description || 'Razorpay Payment',
            });
            setStorageForm({
                storage_type: general.storage_type || 's3',
                s3_key: general.s3_key || '',
                s3_secret: general.s3_secret || '',
                s3_region: general.s3_region || 'us-east-1',
                s3_bucket: general.s3_bucket || '',
                s3_url: general.s3_url || '',
                s3_endpoint: general.s3_endpoint || '',
            });
            setEmailForm({
                email_setting_enable: general.email_setting_enable || 'on',
                mail_mailer: general.mail_mailer || 'smtp',
                mail_host: general.mail_host || '',
                mail_port: general.mail_port || '587',
                mail_username: general.mail_username || '',
                mail_password: general.mail_password || '',
                mail_encryption: general.mail_encryption || 'tls',
                mail_from_address: general.mail_from_address || '',
                mail_from_name: general.mail_from_name || '',
            });
        }
    }, [general]);

    const handleSaveAI = async (e: React.FormEvent) => {
        e.preventDefault();
        await dispatch(updateAiSettings(aiForm)).unwrap();
        dispatch(fetchAiSettings());
        showModal("success", "Saved", "AI Integration saved successfully!");
    };

    const handleSaveFacebook = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload: any = { ...fbForm };
        if (!payload.appSecret) delete payload.appSecret;
        try {
            await dispatch(updateFacebookSettings(payload)).unwrap();
            dispatch(fetchFacebookSettings());
            showModal("success", "Saved", "Facebook settings saved successfully!");
        } catch (err: any) {
            showModal("error", "Error", err || "Failed to save Facebook settings.");
        }
    };

    const [isSavingEmail, setIsSavingEmail] = useState(false);
    const handleSaveEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingEmail(true);
        try {
            await dispatch(updateEmailSettings(emailForm)).unwrap();
            dispatch(fetchGeneralSettings({}));
            showModal("success", "Saved", "Email SMTP settings saved successfully!");
        } catch (err: any) {
            showModal("error", "Error", err || "Failed to save email settings");
        } finally {
            setIsSavingEmail(false);
        }
    };

    const [isSavingSms, setIsSavingSms] = useState(false);
    const handleSaveSms = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingSms(true);
        try {
            await dispatch(updateSmsSettings(smsForm)).unwrap();
            dispatch(fetchGeneralSettings({}));
            showModal("success", "Saved", "SMS settings saved successfully!");
        } catch (err: any) {
            showModal("error", "Error", err || "Failed to save SMS settings");
        } finally {
            setIsSavingSms(false);
        }
    };

    const [isSavingPayment, setIsSavingPayment] = useState(false);
    const handleSavePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingPayment(true);
        try {
            await dispatch(updatePaymentSettings(paymentForm)).unwrap();
            dispatch(fetchGeneralSettings({}));
            showModal("success", "Saved", "Payment settings saved successfully!");
        } catch (err: any) {
            showModal("error", "Error", err || "Failed to save payment settings");
        } finally {
            setIsSavingPayment(false);
        }
    };

    const [isSavingStorage, setIsSavingStorage] = useState(false);
    const handleSaveStorage = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSavingStorage(true);
        try {
            await dispatch(updateStorageSettings(storageForm)).unwrap();
            dispatch(fetchGeneralSettings({}));
            showModal("success", "Saved", "Storage settings saved successfully!");
        } catch (err: any) {
            showModal("error", "Error", err || "Failed to save storage settings");
        } finally {
            setIsSavingStorage(false);
        }
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
        try {
            await dispatch(changePassword({ current_password, password, password_confirmation })).unwrap();
            showModal("success", "Password Updated", "Your password has been changed successfully.");
            setPasswordForm({ current_password: '', password: '', password_confirmation: '' });
        } catch (err: any) {
            showModal("error", "Error", typeof err === 'string' ? err : "Failed to change password.");
        }
    };


    const [mobileSettingsView, setMobileSettingsView] = useState<"nav" | "content">("nav");

    return (
        <div className="max-w-[1200px] w-full p-4 sm:p-6">
            {/* Header */}
            <div className="mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: "var(--foreground)" }}>Workspace Settings</h1>
                <p className="text-sm mt-1.5" style={{ color: "var(--muted-foreground)" }}>Connect third-party apps and manage your core configuration.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-6 md:gap-12 pb-12">
                {/* Vertical Navigation Sidebar — full screen on mobile when nav view */}
                <div className={[
                    "w-full md:w-64 flex-shrink-0 space-y-6 md:space-y-8",
                    mobileSettingsView === "content" ? "hidden md:block" : "block",
                ].join(" ")}>
                    {navigationGroups.map((group) => (
                        <div key={group.title}>
                            <h4 className="text-xs font-semibold mb-3 px-3 uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>
                                {group.title}
                            </h4>
                            <div className="space-y-1">
                                {group.items.map(({ id, label, Icon }) => (
                                    <button
                                        key={id}
                                        onClick={() => { setTab(id); setMobileSettingsView("content"); }}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
                                        style={tab === id
                                            ? { background: "var(--nav-hover-bg)", color: "var(--foreground)", boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }
                                            : { color: "var(--muted-foreground)", background: "transparent" }}
                                    >
                                        <Icon className="w-4 h-4" style={tab === id ? { color: "var(--brand-purple)" } : {}} />
                                        <span className="flex-1 text-left">{label}</span>
                                        {/* Arrow hint on mobile */}
                                        <svg className="w-4 h-4 md:hidden opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Pane — full screen on mobile when content view */}
                <div className={[
                    "flex-1 min-w-0 slide-up",
                    mobileSettingsView === "nav" ? "hidden md:block" : "block",
                ].join(" ")}>
                    {/* Mobile back button */}
                    <button
                        className="md:hidden flex items-center gap-2 mb-4 text-sm font-medium hover:opacity-70 transition-opacity"
                        style={{ color: "var(--muted-foreground)" }}
                        onClick={() => setMobileSettingsView("nav")}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        Back to Settings
                    </button>

                    {/* Appearance */}
                    {tab === "appearance" && <AppearanceTab showModal={showModal} />}

                    {/* Profile */}
                    {tab === "profile" && (
                        <div className="space-y-6 slide-up">
                            <IntegrationHeader title="General Profile" desc="Manage your personal details and app preferences." Icon={User} color="#a855f7" />
                            <Section title="Profile Information" desc="Update your public profile details">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-xl font-bold text-white">A</div>
                                    <div>
                                        <button className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                                            style={{ background: "var(--brand-gradient)", color: "white" }}>Upload Photo</button>
                                        <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>JPG, PNG or GIF · Max 2MB</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <InputField label="Full Name" value={user?.name || ""} />
                                    <InputField label="Account Type" value={user?.type || ""} />
                                    <InputField label="Email" type="email" value={user?.email || ""} />
                                    <InputField label="Phone" type="tel" value={user?.phone || ""} placeholder="+91 00000 00000" />
                                    <div className="md:col-span-2">
                                        <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--foreground)" }}>Bio</label>
                                        <textarea rows={3} placeholder="Tell us about yourself..."
                                            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none transition-all"
                                            style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                                            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--brand-purple)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)"; }}
                                            onBlur={(e) => { e.currentTarget.style.borderColor = "var(--glass-border)"; e.currentTarget.style.boxShadow = "none"; }}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
                                        style={{ background: "var(--brand-gradient)", color: "white" }}>
                                        <Save className="w-4 h-4" />Save Changes
                                    </button>
                                </div>
                            </Section>
                        </div>
                    )}

                    {/* Branding & General Settings */}
                    {tab === "branding" && <BrandingTab />}

                    {/* Notifications */}
                    {/* Security */}
                    {tab === "security" && (
                        <div className="space-y-4">
                            <IntegrationHeader title="Security & Authentication" desc="Manage your password, 2FA, and active sessions." Icon={Shield} color="#10b981" />
                            <Section title="Change Password" desc="Use a strong, unique password">
                                <InputField label="Current Password" type="password" placeholder="••••••••" value={passwordForm.current_password} onChange={(e: any) => setPasswordForm(p => ({ ...p, current_password: e.target.value }))} />
                                <InputField label="New Password" type="password" placeholder="Min 8 characters" value={passwordForm.password} onChange={(e: any) => setPasswordForm(p => ({ ...p, password: e.target.value }))} />
                                <InputField label="Confirm Password" type="password" placeholder="Repeat new password" value={passwordForm.password_confirmation} onChange={(e: any) => setPasswordForm(p => ({ ...p, password_confirmation: e.target.value }))} />
                                <div className="flex justify-end">
                                    <button onClick={handleChangePassword} disabled={authLoading} className="px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50"
                                        style={{ background: "var(--brand-gradient)", color: "white" }}>{authLoading ? "Updating..." : "Update Password"}</button>
                                </div>
                            </Section>
                            <Section title="Two-Factor Authentication" desc="Extra layer of security">
                                <Toggle label="Enable 2FA via Authenticator App" defaultChecked={false} />
                                <Toggle label="Enable 2FA via SMS" defaultChecked={false} />
                            </Section>
                        </div>
                    )}

                    {/* Data & Privacy */}
                    {tab === "data" && (
                        <div className="space-y-6 slide-up">
                            <IntegrationHeader title="Data & Privacy Settings" desc="Manage what data stays locally, export history, or request a complete wipe." Icon={Database} color="#14b8a6" />
                            <Section title="Danger Zone" desc="Irreversible actions — proceed with caution">
                                <div className="p-4 rounded-xl" style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)" }}>
                                    <p className="text-sm font-medium mb-1" style={{ color: "#ef4444" }}>Delete Account</p>
                                    <p className="text-xs mb-3" style={{ color: "var(--muted-foreground)" }}>Permanently delete your account and all associated data. This cannot be undone.</p>
                                    <button className="px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-80 transition-all"
                                        style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
                                        Delete My Account
                                    </button>
                                </div>
                            </Section>
                        </div>
                    )}

                    {/* NEW: App Integrations Placeholder Configurations */}

                    {/* Email Integration */}
                    {tab === "int-email" && (
                        <div className="space-y-6 slide-up">
                            <IntegrationHeader title="Email Delivery (SMTP/SES)" desc="Connect SendGrid, Mailjet, Postmark, or custom SMTP to send outbound system emails." Icon={Mail} color="#dc2626" isConnected={!!general?.mail_host} />

                            <form onSubmit={handleSaveEmail}>
                                <Section title="SMTP Configuration">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <InputField label="SMTP Host" value={emailForm.mail_host} onChange={(e: any) => setEmailForm({ ...emailForm, mail_host: e.target.value })} placeholder="smtp.mailserver.com" />
                                        <InputField label="Port" value={emailForm.mail_port} onChange={(e: any) => setEmailForm({ ...emailForm, mail_port: e.target.value })} placeholder="587" />
                                        <InputField label="SMTP Username" value={emailForm.mail_username} onChange={(e: any) => setEmailForm({ ...emailForm, mail_username: e.target.value })} placeholder="apikey" />
                                        <InputField label="SMTP Password" type="password" value={emailForm.mail_password} onChange={(e: any) => setEmailForm({ ...emailForm, mail_password: e.target.value })} placeholder="••••••••" />
                                        <InputField label="Mailer" value={emailForm.mail_mailer} onChange={(e: any) => setEmailForm({ ...emailForm, mail_mailer: e.target.value })} placeholder="smtp" />
                                        <InputField label="Encryption" value={emailForm.mail_encryption} onChange={(e: any) => setEmailForm({ ...emailForm, mail_encryption: e.target.value })} placeholder="tls" />
                                        <div className="md:col-span-2">
                                            <InputField label="Sender 'From' Address" value={emailForm.mail_from_address} onChange={(e: any) => setEmailForm({ ...emailForm, mail_from_address: e.target.value })} placeholder="no-reply@botchat.com" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <InputField label="Sender Name" value={emailForm.mail_from_name} onChange={(e: any) => setEmailForm({ ...emailForm, mail_from_name: e.target.value })} placeholder="App Name" />
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <button type="submit" disabled={isSavingEmail} className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-sm"
                                            style={{ background: "var(--brand-gradient)", color: "white", opacity: isSavingEmail ? 0.7 : 1 }}>
                                            <Save className="w-4 h-4" /> {isSavingEmail ? "Saving..." : "Save Configuration"}
                                        </button>
                                    </div>
                                </Section>
                            </form>
                        </div>
                    )}

                    {/* Facebook API Integration */}
                    {tab === "int-social" && (
                        <div className="space-y-6 slide-up">
                            {/* Header */}
                            <div className="flex items-center gap-3 pb-4 border-b" style={{ borderColor: "var(--glass-border)" }}>
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #1877F2, #0a5ec4)" }}>
                                    <Facebook className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold" style={{ color: "var(--foreground)" }}>Facebook API Integration</h2>
                                    <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Configure your Meta / Facebook App credentials and integration URLs.</p>
                                </div>
                                {facebook?.appId && (
                                    <span className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}>
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                                        Connected
                                    </span>
                                )}
                            </div>

                            <form onSubmit={handleSaveFacebook} className="space-y-5">
                                {/* Row 1: App Name + App Version */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <InputField label="App Name" value={fbForm.appName} onChange={(e: any) => setFbForm({ ...fbForm, appName: e.target.value })} placeholder="BotSocial" />
                                    <InputField label="App Version" value={fbForm.appVersion} onChange={(e: any) => setFbForm({ ...fbForm, appVersion: e.target.value })} placeholder="v19.0" />
                                </div>

                                {/* Row 2: App ID + App Secret */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <InputField label="App ID" value={fbForm.appId} onChange={(e: any) => setFbForm({ ...fbForm, appId: e.target.value })} placeholder="1453440466490610" />
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium block" style={{ color: "var(--foreground)" }}>App Secret</label>
                                        <div className="relative">
                                            <input
                                                type={showFbSecret ? "text" : "password"}
                                                value={fbForm.appSecret}
                                                onChange={(e: any) => setFbForm({ ...fbForm, appSecret: e.target.value })}
                                                placeholder="Leave unchanged to keep existing secret."
                                                className="w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm outline-none transition-all"
                                                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                                                onFocus={(e) => { e.currentTarget.style.borderColor = "#1877F2"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(24,119,242,0.15)"; }}
                                                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--glass-border)"; e.currentTarget.style.boxShadow = "none"; }}
                                            />
                                            <button type="button" onClick={() => setShowFbSecret(v => !v)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
                                                style={{ color: "var(--muted-foreground)" }}>
                                                {showFbSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Leave unchanged to keep existing secret.</p>
                                    </div>
                                </div>

                                {/* Row 3: Social Login toggle + Webhook Verify Token */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="p-4 rounded-xl flex items-center justify-between" style={{ background: "var(--card-bg)", border: "1px solid var(--glass-border)" }}>
                                        <div>
                                            <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Social Login</p>
                                            <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>Enable Facebook social login for users</p>
                                        </div>
                                        <button type="button"
                                            onClick={() => setFbForm(f => ({ ...f, socialLoginEnabled: !f.socialLoginEnabled }))}
                                            className="relative flex-shrink-0 w-12 h-6 rounded-full transition-all duration-300"
                                            style={{ background: fbForm.socialLoginEnabled ? "#1877F2" : "var(--glass-border)" }}>
                                            <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300"
                                                style={{ left: fbForm.socialLoginEnabled ? "calc(100% - 22px)" : "2px" }} />
                                        </button>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium block" style={{ color: "var(--foreground)" }}>Webhook Verify Token</label>
                                        <div className="relative">
                                            <input
                                                readOnly
                                                value={facebook?.webhookVerifyToken || ''}
                                                className="w-full px-3.5 py-2.5 pr-32 rounded-xl text-sm font-mono outline-none"
                                                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                                            />
                                            <button type="button"
                                                onClick={() => dispatch(fetchFacebookSettings())}
                                                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all hover:opacity-80"
                                                style={{ background: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.3)" }}>
                                                <RefreshCw className="w-3 h-3" /> Regenerate
                                            </button>
                                        </div>
                                        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>Paste this token in your Meta App → Webhooks → Verify Token.</p>
                                    </div>
                                </div>

                                {/* Row 4: App Domain + Webhook Callback URL */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <InputField label="App Domain" value={fbForm.appDomain} onChange={(e: any) => setFbForm({ ...fbForm, appDomain: e.target.value })} placeholder="divyangtechlabs.com" />
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium block" style={{ color: "var(--foreground)" }}>Webhook Callback URL</label>
                                        <div className="relative">
                                            <input readOnly value={`${fbForm.siteUrl}/api/v1/facebook/webhook`}
                                                className="w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm font-mono outline-none truncate"
                                                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }} />
                                            <button type="button" onClick={() => handleCopyUrl(`${fbForm.siteUrl}/api/v1/facebook/webhook`)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 transition-all hover:opacity-70"
                                                style={{ color: copiedUrl === `${fbForm.siteUrl}/api/v1/facebook/webhook` ? "#22c55e" : "var(--muted-foreground)" }}>
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Row 5: Site URL + Valid OAuth Redirect URI */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <InputField label="Site URL" value={fbForm.siteUrl} onChange={(e: any) => setFbForm({ ...fbForm, siteUrl: e.target.value })} placeholder="https://botchat.divyangtechlabs.com" />
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium block" style={{ color: "var(--foreground)" }}>Valid OAuth Redirect URI</label>
                                        <div className="relative">
                                            <input readOnly value={`${fbForm.siteUrl}/meta/import/account/`}
                                                className="w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm font-mono outline-none truncate"
                                                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }} />
                                            <button type="button" onClick={() => handleCopyUrl(`${fbForm.siteUrl}/meta/import/account/`)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 transition-all hover:opacity-70"
                                                style={{ color: copiedUrl === `${fbForm.siteUrl}/meta/import/account/` ? "#22c55e" : "var(--muted-foreground)" }}>
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Row 6: Privacy Policy URL + Login Callback URL */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <InputField label="Privacy Policy URL" value={fbForm.privacyPolicyUrl} onChange={(e: any) => setFbForm({ ...fbForm, privacyPolicyUrl: e.target.value })} placeholder="https://botchat.divyangtechlabs.com/policy/privacy" />
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium block" style={{ color: "var(--foreground)" }}>Login Callback URL</label>
                                        <div className="relative">
                                            <input readOnly value={`${fbForm.siteUrl}/login/facebook/callback`}
                                                className="w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm font-mono outline-none truncate"
                                                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }} />
                                            <button type="button" onClick={() => handleCopyUrl(`${fbForm.siteUrl}/login/facebook/callback`)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 transition-all hover:opacity-70"
                                                style={{ color: copiedUrl === `${fbForm.siteUrl}/login/facebook/callback` ? "#22c55e" : "var(--muted-foreground)" }}>
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Row 7: Terms of Service URL + Data Deletion Callback URL */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <InputField label="Terms of Service URL" value={fbForm.termsOfServiceUrl} onChange={(e: any) => setFbForm({ ...fbForm, termsOfServiceUrl: e.target.value })} placeholder="https://botchat.divyangtechlabs.com/terms" />
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium block" style={{ color: "var(--foreground)" }}>Data Deletion Callback URL</label>
                                        <div className="relative">
                                            <input readOnly value={`${fbForm.siteUrl}/webhook/data-deletion`}
                                                className="w-full px-3.5 py-2.5 pr-10 rounded-xl text-sm font-mono outline-none truncate"
                                                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }} />
                                            <button type="button" onClick={() => handleCopyUrl(`${fbForm.siteUrl}/webhook/data-deletion`)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 transition-all hover:opacity-70"
                                                style={{ color: copiedUrl === `${fbForm.siteUrl}/webhook/data-deletion` ? "#22c55e" : "var(--muted-foreground)" }}>
                                                <Copy className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Save */}
                                <div className="flex justify-end pt-2">
                                    <button type="submit" disabled={isLoadingFacebook}
                                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 shadow-md"
                                        style={{ background: "#1877F2", opacity: isLoadingFacebook ? 0.7 : 1 }}>
                                        <Save className="w-4 h-4" />
                                        {isLoadingFacebook ? "Saving..." : "Save"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* AI Integration */}
                    {tab === "int-ai" && (
                        <div className="space-y-6 slide-up">
                            <IntegrationHeader title="AI Provider Config" desc="Select your language model provider and inject API keys." Icon={Sparkles} color="#10b981" isConnected={!!ai?.secretKey || ai?.isInherited} />
                            {ai?.isInherited && (
                                <div className="p-4 rounded-xl mb-4 text-sm" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
                                    <Check className="w-4 h-4 inline mr-2" />
                                    Your AI settings are currently being inherited from the parent workspace.
                                </div>
                            )}

                            <form onSubmit={handleSaveAI}>
                                <Section title="Model Configuration">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium block" style={{ color: "var(--foreground)" }}>AI Provider</label>
                                            <select className="w-full px-3.5 py-3 rounded-xl text-sm outline-none transition-all duration-300 font-medium cursor-pointer"
                                                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                                                value={aiForm.provider} onChange={(e) => setAiForm({ ...aiForm, provider: e.target.value })}
                                            >
                                                <option value="openai">OpenAI</option>
                                                <option value="deepseek">DeepSeek AI</option>
                                            </select>
                                        </div>
                                        <InputField label="Secret API Key" type="password" placeholder="sk-..." value={aiForm.secretKey} onChange={(e: any) => setAiForm({ ...aiForm, secretKey: e.target.value })} />

                                        <div className="space-y-1.5 md:col-span-2">
                                            <label className="text-sm font-medium block" style={{ color: "var(--foreground)" }}>Default Model</label>
                                            <select className="w-full px-3.5 py-3 rounded-xl text-sm outline-none transition-all duration-300 font-medium cursor-pointer"
                                                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                                                value={aiForm.promptModel} onChange={(e) => setAiForm({ ...aiForm, promptModel: e.target.value })}
                                            >
                                                {aiForm.provider === 'openai' ? (
                                                    <>
                                                        <option value="gpt-4o">GPT-4o (Balanced)</option>
                                                        <option value="gpt-4-turbo">GPT-4 Turbo (Smartest, Expensive)</option>
                                                        <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Fastest)</option>
                                                    </>
                                                ) : (
                                                    <>
                                                        <option value="deepseek-chat">DeepSeek Chat</option>
                                                        <option value="deepseek-coder">DeepSeek Coder</option>
                                                        <option value="deepseek-reasoner">DeepSeek Reasoner</option>
                                                    </>
                                                )}
                                            </select>
                                        </div>

                                        <div className="space-y-1.5 md:col-span-2">
                                            <label className="text-sm font-medium block" style={{ color: "var(--foreground)" }}>System Prompt (Instruction to AI)</label>
                                            <textarea rows={3} placeholder="You are a helpful assistant..."
                                                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none resize-none transition-all"
                                                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                                                value={aiForm.instructionToAi} onChange={(e) => setAiForm({ ...aiForm, instructionToAi: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {(ai?.canEdit !== false) && (
                                        <div className="flex justify-end pt-2">
                                            <button disabled={isLoadingAi} type="submit" className="px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm"
                                                style={{ background: "var(--brand-gradient)", color: "white", opacity: isLoadingAi ? 0.7 : 1 }}>
                                                {isLoadingAi ? "Saving AI Settings..." : "Save AI Engine"}
                                            </button>
                                        </div>
                                    )}
                                </Section>
                            </form>
                        </div>
                    )}

                    {/* Payments */}
                    {tab === "int-payments" && (
                        <div className="space-y-6 slide-up">
                            <IntegrationHeader title="Razorpay" desc="Process payments securely with Razorpay." Icon={CreditCard} color="#6366f1" isConnected={!!paymentForm.razorpay_key} />
                            <form onSubmit={handleSavePayment}>
                                <div className="p-6 rounded-2xl transition-all duration-300" style={{
                                    background: "var(--card-bg)",
                                    border: paymentForm.razorpaysetting === 'on' ? "1px solid rgba(99,102,241,0.3)" : "1px solid var(--glass-border)",
                                    boxShadow: paymentForm.razorpaysetting === 'on' ? "0 0 0 1px rgba(99,102,241,0.1)" : "none"
                                }}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300" style={{
                                                background: paymentForm.razorpaysetting === 'on' ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "rgba(99,102,241,0.1)",
                                                boxShadow: paymentForm.razorpaysetting === 'on' ? "0 4px 12px rgba(99,102,241,0.3)" : "none"
                                            }}>
                                                <svg viewBox="0 0 24 24" className="w-8 h-8" fill={paymentForm.razorpaysetting === 'on' ? "white" : "#6366f1"}>
                                                    <path d="M22.436 0l-11.91 7.773-1.174 4.276 6.625-4.297L11.98 24h4.31zM1.565 0l.086.078 7.53 13.994 1.02 3.396L5.835 7.428l-.852 4.276L9.56 24H5.282z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold" style={{ color: "var(--foreground)" }}>Razorpay</h3>
                                                <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>
                                                    {paymentForm.razorpaysetting === 'on' ? "Active — accept payments via UPI, cards, wallets & more" : "Click to enable Razorpay payment gateway"}
                                                </p>
                                            </div>
                                        </div>
                                        <button type="button" onClick={() => setPaymentForm({ ...paymentForm, razorpaysetting: paymentForm.razorpaysetting === 'on' ? 'off' : 'on' })}
                                            className="relative w-12 h-7 rounded-full transition-all duration-300 flex-shrink-0 cursor-pointer"
                                            style={{ background: paymentForm.razorpaysetting === 'on' ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "var(--glass-border)" }}>
                                            <span className="absolute top-0.5 w-6 h-6 rounded-full bg-white shadow-md transition-all duration-300 flex items-center justify-center"
                                                style={{ left: paymentForm.razorpaysetting === 'on' ? "calc(100% - 26px)" : "2px" }}>
                                                {paymentForm.razorpaysetting === 'on' && (
                                                    <svg className="w-3 h-3" fill="#6366f1" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                                                )}
                                            </span>
                                        </button>
                                    </div>
                                </div>

                                {paymentForm.razorpaysetting === 'on' && (
                                    <div className="p-6 rounded-2xl space-y-5 animate-in fade-in slide-in-from-top-2 duration-300" style={{ background: "var(--card-bg)", border: "1px solid var(--glass-border)" }}>
                                        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: "var(--muted-foreground)" }}>API Credentials</p>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--foreground)" }}>Razorpay Key ID</label>
                                                <div className="relative">
                                                    <input value={paymentForm.razorpay_key} onChange={(e: any) => setPaymentForm({ ...paymentForm, razorpay_key: e.target.value })}
                                                        placeholder="rzp_live_..." className="w-full px-3.5 py-2.5 pl-10 rounded-xl text-sm outline-none transition-all duration-300"
                                                        style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                                                        onFocus={(e) => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.15)"; }}
                                                        onBlur={(e) => { e.currentTarget.style.borderColor = "var(--glass-border)"; e.currentTarget.style.boxShadow = "none"; }} />
                                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "var(--muted-foreground)" }}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--foreground)" }}>Razorpay Key Secret</label>
                                                <div className="relative">
                                                    <input type="password" value={paymentForm.razorpay_secret} onChange={(e: any) => setPaymentForm({ ...paymentForm, razorpay_secret: e.target.value })}
                                                        placeholder="••••••••" className="w-full px-3.5 py-2.5 pl-10 rounded-xl text-sm outline-none transition-all duration-300"
                                                        style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                                                        onFocus={(e) => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.15)"; }}
                                                        onBlur={(e) => { e.currentTarget.style.borderColor = "var(--glass-border)"; e.currentTarget.style.boxShadow = "none"; }} />
                                                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: "var(--muted-foreground)" }}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-sm font-medium block mb-1.5" style={{ color: "var(--foreground)" }}>Payment Description</label>
                                                <input value={paymentForm.razorpay_description} onChange={(e: any) => setPaymentForm({ ...paymentForm, razorpay_description: e.target.value })}
                                                    placeholder="e.g. Razorpay Payment" className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all duration-300"
                                                    style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                                                    onFocus={(e) => { e.currentTarget.style.borderColor = "#6366f1"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(99,102,241,0.15)"; }}
                                                    onBlur={(e) => { e.currentTarget.style.borderColor = "var(--glass-border)"; e.currentTarget.style.boxShadow = "none"; }} />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex justify-end pt-4">
                                    <button type="submit" disabled={isSavingPayment} className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-sm"
                                        style={{ background: "var(--brand-gradient)", color: "white", opacity: isSavingPayment ? 0.7 : 1 }}>
                                        <Check className="w-4 h-4" /> {isSavingPayment ? "Saving..." : "Save Payment Settings"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    {/* File Storage */}
                    {tab === "int-storage" && (
                        <div className="space-y-6 slide-up">
                            <IntegrationHeader title="AWS S3 Storage" desc="Send assets and store heavy user attachments globally." Icon={UploadCloud} color="#f59e0b" />
                            <form onSubmit={handleSaveStorage}>
                                <Section title="IAM Credentials">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <InputField label="Storage Type" value={storageForm.storage_type} onChange={(e: any) => setStorageForm({ ...storageForm, storage_type: e.target.value })} placeholder="s3" />
                                        <InputField label="AWS Region" value={storageForm.s3_region} onChange={(e: any) => setStorageForm({ ...storageForm, s3_region: e.target.value })} placeholder="us-east-1" />
                                        <InputField label="S3 Bucket Name" value={storageForm.s3_bucket} onChange={(e: any) => setStorageForm({ ...storageForm, s3_bucket: e.target.value })} placeholder="botchat-uploads-prod" />
                                        <InputField label="S3 URL" value={storageForm.s3_url} onChange={(e: any) => setStorageForm({ ...storageForm, s3_url: e.target.value })} placeholder="https://s3.amazonaws.com" />
                                        <InputField label="S3 Endpoint" value={storageForm.s3_endpoint} onChange={(e: any) => setStorageForm({ ...storageForm, s3_endpoint: e.target.value })} placeholder="https://s3.amazonaws.com" />
                                        <div className="md:col-span-2">
                                            <InputField label="AWS Access Key ID" value={storageForm.s3_key} onChange={(e: any) => setStorageForm({ ...storageForm, s3_key: e.target.value })} placeholder="AKIAIOSFODNN7EXAMPLE" />
                                        </div>
                                        <div className="md:col-span-2">
                                            <InputField label="AWS Secret Access Key" type="password" value={storageForm.s3_secret} onChange={(e: any) => setStorageForm({ ...storageForm, s3_secret: e.target.value })} placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY" />
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <button type="submit" disabled={isSavingStorage} className="px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-sm"
                                            style={{ background: "var(--brand-gradient)", color: "white", opacity: isSavingStorage ? 0.7 : 1 }}>
                                            {isSavingStorage ? "Saving..." : "Save Credentials"}
                                        </button>
                                    </div>
                                </Section>
                            </form>
                        </div>
                    )}

                    {/* Smart Inbox Settings */}
                    {tab === "mod-smart-inbox" && (
                        <ModuleSettings module="smart-inbox" title="Smart Inbox" icon={MessageCircle} color="#8b5cf6" />
                    )}

                    {/* Broadcast Settings */}
                    {tab === "mod-broadcast" && (
                        <ModuleSettings module="broadcast" title="Broadcast" icon={Radio} color="#10b981" />
                    )}

                    {/* Social Posting Settings */}
                    {tab === "mod-social-posting" && (
                        <ModuleSettings module="social-posting" title="Social Posting" icon={Image} color="#f59e0b" />
                    )}

                </div>
            </div>
        </div>
    );
}
