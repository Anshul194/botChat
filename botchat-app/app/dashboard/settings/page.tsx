// @ts-nocheck
"use client";

import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store/store";
import {
    fetchGeneralSettings, updateGeneralSettings,
    fetchFacebookSettings, updateFacebookSettings,
    fetchAiSettings, updateAiSettings,
    fetchEmailProfiles, uploadFile
} from "../../../store/slices/settingsSlice";
import {
    selectIsSuperAdmin as isSuperAdminSelector,
    selectIsReseller as isResellerSelector,
    selectIsTenant as isTenantSelector
} from "../../../store/slices/authSlice";
import { toast } from "sonner";
import {
    User, Bell, Shield, Key, Database, Save,
    Eye, EyeOff, Plus, Trash2, Copy, Check,
    Globe, Palette, UploadCloud, AlertCircle, Link2,
    Mail, Smartphone, Facebook, Sparkles, CreditCard, MessageSquare, Zap
} from "lucide-react";

const navigationGroups = [
    {
        title: "Account Setup",
        items: [
            { id: "profile", label: "General Profile", Icon: User },
            { id: "branding", label: "General Settings", Icon: Globe },
            { id: "notifications", label: "Notifications", Icon: Bell },
            { id: "security", label: "Security", Icon: Shield },
        ]
    },
    {
        title: "App Integrations",
        items: [
            { id: "int-email", label: "Email & SMTP", Icon: Mail },
            { id: "int-sms", label: "SMS & OTP", Icon: Smartphone },
            { id: "int-social", label: "Social (Facebook, IG)", Icon: Facebook },
            { id: "int-ai", label: "AI Models", Icon: Sparkles },
            { id: "int-payments", label: "Payment Gateways", Icon: CreditCard },
            { id: "int-storage", label: "File Storage", Icon: UploadCloud },
        ]
    },
    {
        title: "Developers",
        items: [
            { id: "api", label: "API Keys & Webhooks", Icon: Key },
            { id: "data", label: "Data & Privacy", Icon: Database },
        ]
    }
];

function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
    return (
        <div className="glass-card rounded-2xl p-6 space-y-5">
            <div>
                <h3 className="text-base font-semibold" style={{ color: "var(--foreground)" }}>{title}</h3>
                {desc && <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{desc}</p>}
            </div>
            {children}
        </div>
    );
}

function InputField({ label, name, type = "text", placeholder, defaultValue, value, onChange }: { label: string; name?: string; type?: string; placeholder?: string; defaultValue?: string; value?: string; onChange?: any }) {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-medium block" style={{ color: "var(--foreground)" }}>{label}</label>
            <input type={type} name={name} placeholder={placeholder} defaultValue={defaultValue} value={value} onChange={onChange}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all duration-300"
                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--brand-purple)"; e.currentTarget.style.boxShadow = "var(--input-focus-ring)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--glass-border)"; e.currentTarget.style.boxShadow = "none"; }}
            />
        </div>
    );
}

function IntegrationHeader({ title, desc, Icon, color, isConnected = false }: { title: string; desc: string; Icon: any; color: string; isConnected?: boolean }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl mb-6 relative overflow-hidden group" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
            {/* Background animated glow */}
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity duration-700 group-hover:opacity-40" style={{ background: color }} />

            <div className="flex items-center gap-4 relative z-10">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover:scale-105" style={{ background: `color-mix(in srgb, ${color} 15%, transparent)` }}>
                    <Icon className="w-7 h-7" style={{ color: color }} />
                </div>
                <div>
                    <h2 className="text-lg font-bold tracking-tight" style={{ color: "var(--foreground)" }}>{title}</h2>
                    <p className="text-sm mt-0.5" style={{ color: "var(--muted-foreground)" }}>{desc}</p>
                </div>
            </div>

            <div className="relative z-10 shrink-0">
                {isConnected ? (
                    <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full"
                        style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
                        <Check className="w-3.5 h-3.5" /> Connected
                    </span>
                ) : (
                    <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-full"
                        style={{ background: "var(--glass-border)", color: "var(--muted-foreground)", border: "1px solid var(--glass-border)" }}>
                        Not Configured
                    </span>
                )}
            </div>
        </div>
    );
}

function Toggle({ label, desc, defaultChecked = false }: { label: string; desc?: string; defaultChecked?: boolean }) {
    const [on, setOn] = useState(defaultChecked);
    return (
        <div className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid var(--glass-border)" }}>
            <div>
                <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{label}</p>
                {desc && <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{desc}</p>}
            </div>
            <button onClick={() => setOn(!on)}
                className="relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0"
                style={{ background: on ? "var(--brand-purple)" : "var(--glass-border)" }}>
                <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300"
                    style={{ left: on ? "calc(100% - 22px)" : "2px" }} />
            </button>
        </div>
    );
}

function ApiKeyRow({ label, value }: { label: string; value: string }) {
    const [shown, setShown] = useState(false);
    const [copied, setCopied] = useState(false);
    function copy() {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
    return (
        <div className="p-4 rounded-xl" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{label}</span>
                <div className="flex items-center gap-1">
                    <button onClick={() => setShown(!shown)} className="p-1.5 rounded-lg hover:opacity-70" style={{ background: "var(--glass-border)" }}>
                        {shown ? <EyeOff className="w-3.5 h-3.5" style={{ color: "var(--muted-foreground)" }} /> : <Eye className="w-3.5 h-3.5" style={{ color: "var(--muted-foreground)" }} />}
                    </button>
                    <button onClick={copy} className="p-1.5 rounded-lg hover:opacity-70" style={{ background: "var(--glass-border)" }}>
                        {copied ? <Check className="w-3.5 h-3.5" style={{ color: "#10b981" }} /> : <Copy className="w-3.5 h-3.5" style={{ color: "var(--muted-foreground)" }} />}
                    </button>
                    <button className="p-1.5 rounded-lg hover:opacity-70" style={{ background: "rgba(239,68,68,0.1)" }}>
                        <Trash2 className="w-3.5 h-3.5" style={{ color: "#ef4444" }} />
                    </button>
                </div>
            </div>
            <code className="text-xs font-mono block" style={{ color: "var(--muted-foreground)" }}>
                {shown ? value : value.slice(0, 8) + "••••••••••••••••••••••••"}
            </code>
        </div>
    );
}

export default function SettingsPage() {
    const [tab, setTab] = useState("profile");
    const dispatch = useDispatch<AppDispatch>();

    // File Input Refs
    const logoInputRef = useRef<HTMLInputElement>(null);
    const faviconInputRef = useRef<HTMLInputElement>(null);

    // File selection state
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [faviconFile, setFaviconFile] = useState<File | null>(null);

    // Previews for local file selection
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [faviconPreview, setFaviconPreview] = useState<string | null>(null);

    // Selectors
    const { user } = useSelector((state: RootState) => state.auth);
    const { general, facebook, ai, emailProfiles, isLoadingGeneral, isLoadingFacebook, isLoadingAi } = useSelector((state: RootState) => state.settings);

    const isSuperAdmin = useSelector(isSuperAdminSelector);
    const isReseller = useSelector(isResellerSelector);
    const isTenant = useSelector(isTenantSelector);

    // Initial Fetch (when opening relevant tabs for the first time or mounted)
    useEffect(() => {
        const scopeOptions = { scopeType: user?.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : user?.role === 'RESELLER' ? 'RESELLER' : 'TENANT' };

        if (tab === "branding") {
            dispatch(fetchGeneralSettings(scopeOptions));
        } else if (tab === "int-facebook") {
            dispatch(fetchFacebookSettings());
        } else if (tab === "int-ai") {
            dispatch(fetchAiSettings());
        } else if (tab === "int-email") {
            dispatch(fetchEmailProfiles(scopeOptions));
        }
    }, [tab, dispatch, user]);

    // Local form state for General, AI & Facebook
    const [generalForm, setGeneralForm] = useState<GeneralSettings>({
        brandName: "",
        whiteLabelDomain: "",
        timezone: "UTC",
        locale: "en",
        twoFactorAuth: false,
        emailVerification: false,
        smsVerification: false,
        rtlEnabled: false,
        landingPageEnabled: true,
        registerEnabled: false,
        theme: {
            primaryColor: "#6C5CE7",
            sidebarTransparent: true,
            darkLayout: false
        },
        defaultLanguage: "en",
        defaultTimezone: "UTC",
        dateFormat: "MMM DD, YYYY",
        timeFormat: "hh:mm A",
        logo: "",
        favicon: ""
    });

    const [aiForm, setAiForm] = useState({ provider: 'openai', secretKey: '', promptModel: 'gpt-4o', instructionToAi: '' });
    const [fbForm, setFbForm] = useState({ appName: '', appId: '', appSecret: '', siteUrl: '' });

    useEffect(() => {
        if (general) {
            setGeneralForm({
                ...general,
                theme: general.theme || { primaryColor: "#6C5CE7", sidebarTransparent: true, darkLayout: false }
            });
            // Construct full preview URL if backend returns relative filename
            if (general.logo) setLogoPreview(general.logo.startsWith('http') ? general.logo : `${process.env.NEXT_PUBLIC_BASE_URL?.replace('/api/v1', '')}/uploads/${general.logo}`);
            if (general.favicon) setFaviconPreview(general.favicon.startsWith('http') ? general.favicon : `${process.env.NEXT_PUBLIC_BASE_URL?.replace('/api/v1', '')}/uploads/${general.favicon}`);
        }
    }, [general]);

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
            setFbForm({
                appName: facebook.appName || '',
                appId: facebook.appId || '',
                appSecret: '', // Don't pre-fill secret
                siteUrl: facebook.siteUrl || ''
            });
        }
    }, [facebook]);

    const handleSaveGeneral = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const scopeType = user?.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : user?.role === 'RESELLER' ? 'RESELLER' : 'TENANT';

        try {
            // Build FormData to send everything in one pass
            const formData = new FormData();
            formData.append('scopeType', scopeType);
            formData.append('scopeId', ''); // null or empty

            // Append data object as JSON string but handle files separately if needed
            // Actually, many backends prefer a flat FormData or specific structure
            // Let's create the 'data' field expected by the thunk
            const generalData = { ...generalForm };

            // Remove Base64 if present, as it won't be sent here
            // We append the File objects directly to the formData root or inside data
            Object.keys(generalData).forEach(key => {
                if (key === 'theme') {
                    formData.append('data[theme]', JSON.stringify(generalData.theme));
                } else if (key !== 'logo' && key !== 'favicon') {
                    formData.append(`data[${key}]`, (generalData as any)[key]);
                }
            });

            if (logoFile) {
                formData.append('logo', logoFile);
            } else if (generalForm.logo) {
                formData.append('data[logo]', generalForm.logo);
            }

            if (faviconFile) {
                formData.append('favicon', faviconFile);
            } else if (generalForm.favicon) {
                formData.append('data[favicon]', generalForm.favicon);
            }

            await dispatch(updateGeneralSettings(formData as any)).unwrap();
            toast.success("Settings saved successfully!");
        } catch (err: any) {
            toast.error(err || "Failed to update settings");
        }
    };

    const handleSaveAI = async (e: React.FormEvent) => {
        e.preventDefault();
        await dispatch(updateAiSettings(aiForm)).unwrap();
        toast.success("AI Integration saved successfully!");
    };

    const handleSaveFacebook = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload: any = { ...fbForm };
        if (!payload.appSecret) delete payload.appSecret; // Only send if changed

        await dispatch(updateFacebookSettings(payload)).unwrap();
        toast.success("Facebook settings saved successfully!");
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
                                    <InputField label="First Name" defaultValue="Anshul" />
                                    <InputField label="Last Name" defaultValue="" />
                                    <InputField label="Email" type="email" defaultValue="anshul@example.com" />
                                    <InputField label="Phone" type="tel" placeholder="+91 00000 00000" />
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
                    {tab === "branding" && (
                        <div className="space-y-6 slide-up">
                            <IntegrationHeader title="General Settings" desc="Configure platform-wide branding, localization, and features." Icon={Globe} color="#ec4899" />
                            <form onSubmit={handleSaveGeneral} className="space-y-6">
                                <Section title="Site Identity" desc="Configure how your workspace is presented to users">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {isSuperAdmin && (
                                            <InputField label="Site Name" value={generalForm.brandName} onChange={(e: any) => setGeneralForm({ ...generalForm, brandName: e.target.value })} placeholder="e.g. Acme Automation" />
                                        )}
                                        {(isTenant || isReseller) && (
                                            <InputField label="Custom Domain" value={generalForm.whiteLabelDomain} onChange={(e: any) => setGeneralForm({ ...generalForm, whiteLabelDomain: e.target.value })} placeholder="app.botchat.com" />
                                        )}
                                    </div>
                                </Section>

                                <Section title="Appearance" desc="Customize the look and feel of the platform">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <InputField label="Primary Brand Color" value={generalForm.theme?.primaryColor} onChange={(e: any) => setGeneralForm({ ...generalForm, theme: { ...generalForm.theme!, primaryColor: e.target.value } })} placeholder="#6C5CE7" />
                                        <div className="space-y-3 pt-6">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Sidebar Transparency</span>
                                                <button type="button" onClick={() => setGeneralForm({ ...generalForm, theme: { ...generalForm.theme!, sidebarTransparent: !generalForm.theme?.sidebarTransparent } })}
                                                    className="relative w-11 h-6 rounded-full transition-all duration-300"
                                                    style={{ background: generalForm.theme?.sidebarTransparent ? "var(--brand-purple)" : "var(--glass-border)" }}>
                                                    <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300"
                                                        style={{ left: generalForm.theme?.sidebarTransparent ? "calc(100% - 22px)" : "2px" }} />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Dark Layout by Default</span>
                                                <button type="button" onClick={() => setGeneralForm({ ...generalForm, theme: { ...generalForm.theme!, darkLayout: !generalForm.theme?.darkLayout } })}
                                                    className="relative w-11 h-6 rounded-full transition-all duration-300"
                                                    style={{ background: generalForm.theme?.darkLayout ? "var(--brand-purple)" : "var(--glass-border)" }}>
                                                    <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300"
                                                        style={{ left: generalForm.theme?.darkLayout ? "calc(100% - 22px)" : "2px" }} />
                                                </button>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Enable RTL Support</span>
                                                <button type="button" onClick={() => setGeneralForm({ ...generalForm, rtlEnabled: !generalForm.rtlEnabled })}
                                                    className="relative w-11 h-6 rounded-full transition-all duration-300"
                                                    style={{ background: generalForm.rtlEnabled ? "var(--brand-purple)" : "var(--glass-border)" }}>
                                                    <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300"
                                                        style={{ left: generalForm.rtlEnabled ? "calc(100% - 22px)" : "2px" }} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </Section>

                                <Section title="Localization" desc="Configure default language, timezones and data formats">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium block" style={{ color: "var(--foreground)" }}>Default Locale</label>
                                            <select className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all duration-300"
                                                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                                                value={generalForm.locale} onChange={(e) => setGeneralForm({ ...generalForm, locale: e.target.value })}
                                            >
                                                <option value="en">English (US)</option>
                                                <option value="en-GB">English (UK)</option>
                                                <option value="es">Spanish</option>
                                                <option value="fr">French</option>
                                                <option value="de">German</option>
                                                <option value="hi">Hindi</option>
                                                <option value="ar">Arabic</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium block" style={{ color: "var(--foreground)" }}>System Timezone</label>
                                            <select className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all duration-300"
                                                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                                                value={generalForm.timezone} onChange={(e) => setGeneralForm({ ...generalForm, timezone: e.target.value })}
                                            >
                                                <option value="UTC">UTC (Universal)</option>
                                                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                                                <option value="America/New_York">America/New_York (EST)</option>
                                                <option value="Europe/London">Europe/London (GMT)</option>
                                                <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium block" style={{ color: "var(--foreground)" }}>Default Language</label>
                                            <select className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all duration-300"
                                                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                                                value={generalForm.defaultLanguage} onChange={(e) => setGeneralForm({ ...generalForm, defaultLanguage: e.target.value })}
                                            >
                                                <option value="en">English (US)</option>
                                                <option value="en-GB">English (UK)</option>
                                                <option value="es">Spanish</option>
                                                <option value="fr">French</option>
                                                <option value="hi">Hindi</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium block" style={{ color: "var(--foreground)" }}>Default Timezone</label>
                                            <select className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all duration-300"
                                                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                                                value={generalForm.defaultTimezone} onChange={(e) => setGeneralForm({ ...generalForm, defaultTimezone: e.target.value })}
                                            >
                                                <option value="UTC">UTC (Universal)</option>
                                                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                                                <option value="America/New_York">America/New_York (EST)</option>
                                                <option value="Europe/London">Europe/London (GMT)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium block" style={{ color: "var(--foreground)" }}>Date Format</label>
                                            <select className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all duration-300"
                                                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                                                value={generalForm.dateFormat} onChange={(e) => setGeneralForm({ ...generalForm, dateFormat: e.target.value })}
                                            >
                                                <option value="MMM DD, YYYY">MMM DD, YYYY (Mar 02, 2026)</option>
                                                <option value="DD/MM/YYYY">DD/MM/YYYY (02/03/2026)</option>
                                                <option value="MM/DD/YYYY">MM/DD/YYYY (03/02/2026)</option>
                                                <option value="YYYY-MM-DD">YYYY-MM-DD (2026-03-02)</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium block" style={{ color: "var(--foreground)" }}>Time Format</label>
                                            <select className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all duration-300"
                                                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                                                value={generalForm.timeFormat} onChange={(e) => setGeneralForm({ ...generalForm, timeFormat: e.target.value })}
                                            >
                                                <option value="hh:mm A">hh:mm A (12-hour)</option>
                                                <option value="HH:mm">HH:mm (24-hour)</option>
                                            </select>
                                        </div>
                                    </div>
                                </Section>

                                <Section title="Feature Flags" desc="Toggle core platform functionalities">
                                    <div className="space-y-1">
                                        <div className="flex items-center justify-between py-3 border-b border-[var(--glass-border)]">
                                            <div>
                                                <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Landing Page Enabled</p>
                                                <p className="text-xs text-[var(--muted-foreground)]">Show the public landing page for this workspace</p>
                                            </div>
                                            <button type="button" onClick={() => setGeneralForm({ ...generalForm, landingPageEnabled: !generalForm.landingPageEnabled })}
                                                className="relative w-11 h-6 rounded-full transition-all duration-300"
                                                style={{ background: generalForm.landingPageEnabled ? "var(--brand-purple)" : "var(--glass-border)" }}>
                                                <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300"
                                                    style={{ left: generalForm.landingPageEnabled ? "calc(100% - 22px)" : "2px" }} />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between py-3 border-b border-[var(--glass-border)]">
                                            <div>
                                                <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Email Verification</p>
                                                <p className="text-xs text-[var(--muted-foreground)]">Force users to verify email before access</p>
                                            </div>
                                            <button type="button" onClick={() => setGeneralForm({ ...generalForm, emailVerification: !generalForm.emailVerification })}
                                                className="relative w-11 h-6 rounded-full transition-all duration-300"
                                                style={{ background: generalForm.emailVerification ? "var(--brand-purple)" : "var(--glass-border)" }}>
                                                <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300"
                                                    style={{ left: generalForm.emailVerification ? "calc(100% - 22px)" : "2px" }} />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between py-3">
                                            <div>
                                                <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>Two-Factor Auth (2FA)</p>
                                                <p className="text-xs text-[var(--muted-foreground)]">Require extra authentication layer for all users</p>
                                            </div>
                                            <button type="button" onClick={() => setGeneralForm({ ...generalForm, twoFactorAuth: !generalForm.twoFactorAuth })}
                                                className="relative w-11 h-6 rounded-full transition-all duration-300"
                                                style={{ background: generalForm.twoFactorAuth ? "var(--brand-purple)" : "var(--glass-border)" }}>
                                                <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300"
                                                    style={{ left: generalForm.twoFactorAuth ? "calc(100% - 22px)" : "2px" }} />
                                            </button>
                                        </div>
                                    </div>
                                </Section>

                                <div className="flex justify-end pt-3">
                                    <button type="submit" disabled={isLoadingGeneral} className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-all shadow-lg"
                                        style={{ background: "var(--brand-gradient)", color: "white", opacity: isLoadingGeneral ? 0.7 : 1 }}>
                                        <Save className="w-5 h-4" />{isLoadingGeneral ? "Saving..." : "Save Platform Settings"}
                                    </button>
                                </div>
                            </form>

                            <Section title="Brand Assets" desc="Customize your workspace branding with logos and favicons">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Logo Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                                                <Palette className="w-4 h-4 text-purple-500" /> Main Logo
                                            </label>
                                            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md" style={{ background: "rgba(168,85,247,0.1)", color: "#a855f7" }}>SVG/PNG</span>
                                        </div>

                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <Link2 className="w-4 h-4 text-muted-foreground" />
                                            </div>
                                            <input type="text" placeholder="Paste logo URL here..."
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-300"
                                                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                                                value={generalForm.logo || ""}
                                                onChange={(e) => setGeneralForm({ ...generalForm, logo: e.target.value })}
                                            />
                                        </div>

                                        <div className="border-2 border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all duration-500 hover:scale-[1.01] group cursor-pointer relative overflow-hidden"
                                            style={{ borderColor: "var(--glass-border)", background: "var(--glass-bg)" }}
                                            onClick={() => logoInputRef.current?.click()}
                                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--brand-purple)"; e.currentTarget.style.boxShadow = "var(--input-focus-ring)"; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--glass-border)"; e.currentTarget.style.boxShadow = "none"; }}
                                        >
                                            {generalForm.logo ? (
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 text-white font-bold text-xs uppercase cursor-pointer">
                                                    Click to Replace
                                                </div>
                                            ) : null}

                                            {logoPreview ? (
                                                <img src={logoPreview} alt="Logo Preview" className="max-h-24 w-auto object-contain mb-2" />
                                            ) : (
                                                <div className="w-14 h-14 rounded-2xl mb-4 flex items-center justify-center transition-all duration-500 group-hover:rotate-6 shadow-sm" style={{ background: "rgba(168,85,247,0.15)" }}>
                                                    <UploadCloud className="w-6 h-6 text-purple-500" />
                                                </div>
                                            )}

                                            <input
                                                type="file"
                                                ref={logoInputRef}
                                                className="hidden"
                                                accept="image/*"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setLogoFile(file);
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => setLogoPreview(reader.result as string);
                                                        reader.readAsDataURL(file);
                                                        toast.success("Logo selected!");
                                                    }
                                                }}
                                            />
                                            <p className="text-sm font-bold mb-1" style={{ color: "var(--foreground)" }}>{logoPreview ? "Change Logo" : "Upload Logo"}</p>
                                            <p className="text-xs text-muted-foreground">{logoPreview ? "Click to replace" : "Or drag & drop file here"}</p>
                                        </div>
                                    </div>

                                    {/* Favicon Section */}
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-bold flex items-center gap-2" style={{ color: "var(--foreground)" }}>
                                                <Sparkles className="w-4 h-4 text-pink-500" /> Favicon
                                            </label>
                                            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md" style={{ background: "rgba(236,72,153,0.1)", color: "#ec4899" }}>ICO/PNG</span>
                                        </div>

                                        <div className="relative group">
                                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                                                <Link2 className="w-4 h-4 text-muted-foreground" />
                                            </div>
                                            <input type="text" placeholder="Paste favicon URL here..."
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm outline-none transition-all duration-300"
                                                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                                                value={generalForm.favicon || ""}
                                                onChange={(e) => setGeneralForm({ ...generalForm, favicon: e.target.value })}
                                            />
                                        </div>

                                        <div className="border-2 border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all duration-500 hover:scale-[1.01] group cursor-pointer relative overflow-hidden"
                                            style={{ borderColor: "var(--glass-border)", background: "var(--glass-bg)" }}
                                            onClick={() => faviconInputRef.current?.click()}
                                            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "var(--input-focus-ring)"; }}
                                            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--glass-border)"; e.currentTarget.style.boxShadow = "none"; }}
                                        >
                                            {generalForm.favicon ? (
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 text-white font-bold text-xs uppercase cursor-pointer">
                                                    Replace
                                                </div>
                                            ) : null}

                                            {faviconPreview ? (
                                                <img src={faviconPreview} alt="Favicon Preview" className="w-12 h-12 object-contain mb-2 shadow-lg" />
                                            ) : (
                                                <div className="w-14 h-14 rounded-2xl mb-4 flex items-center justify-center transition-all duration-500 group-hover:-rotate-6 shadow-sm" style={{ background: "rgba(236,72,153,0.15)" }}>
                                                    <UploadCloud className="w-6 h-6 text-pink-500" />
                                                </div>
                                            )}

                                            <input
                                                type="file"
                                                ref={faviconInputRef}
                                                className="hidden"
                                                accept="image/x-icon,image/png"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        setFaviconFile(file);
                                                        const reader = new FileReader();
                                                        reader.onloadend = () => setFaviconPreview(reader.result as string);
                                                        reader.readAsDataURL(file);
                                                        toast.success("Favicon selected!");
                                                    }
                                                }}
                                            />
                                            <p className="text-sm font-bold mb-1" style={{ color: "var(--foreground)" }}>{faviconPreview ? "Change Favicon" : "Upload Favicon"}</p>
                                            <p className="text-xs text-muted-foreground">{faviconPreview ? "Click to replace" : "Or drag & drop file here"}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button
                                        type="button"
                                        onClick={() => handleSaveGeneral()}
                                        disabled={isLoadingGeneral}
                                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
                                        style={{ background: "var(--brand-gradient)", color: "white", opacity: isLoadingGeneral ? 0.7 : 1 }}>
                                        <Save className="w-4 h-4" />{isLoadingGeneral ? "Saving..." : "Save Brand Assets"}
                                    </button>
                                </div>
                            </Section>

                            {(isTenant || isReseller) && (
                                <Section title="Custom Domains" desc="Connect your own white-labeled domain or subdomain">

                                    <div className="flex flex-col sm:flex-row gap-3">
                                        <InputField label="" placeholder="e.g. app.yourdomain.com" />
                                        <div className="sm:pt-1.5 flex items-end">
                                            <button className="h-[42px] px-4 rounded-xl text-sm font-semibold hover:opacity-90 transition-all flex items-center gap-2 whitespace-nowrap"
                                                style={{ background: "var(--brand-gradient)", color: "white", boxShadow: "var(--shadow-pink)" }}>
                                                <Link2 className="w-4 h-4" />Add Domain
                                            </button>
                                        </div>
                                    </div>

                                    {/* DNS Validation Table */}
                                    <div className="mt-6 rounded-xl overflow-hidden border transition-all" style={{ borderColor: "var(--glass-border)", background: "var(--glass-bg)" }}>
                                        <div className="px-5 py-3 border-b flex items-center justify-between" style={{ borderColor: "var(--glass-border)", background: "var(--nav-hover-bg)" }}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-2.5 h-2.5 rounded-full pulse-dot status-online" style={{ background: "#f59e0b" }} />
                                                <span className="text-sm font-bold tracking-tight" style={{ color: "var(--foreground)" }}>app.yourdomain.com</span>
                                            </div>
                                            <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded flex items-center gap-1.5" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b" }}>
                                                Pending Validation
                                            </span>
                                        </div>

                                        <div className="p-5 space-y-5">
                                            <p className="text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
                                                Set the following records in your DNS provider to verify and associate the underlying domain.
                                            </p>

                                            <div className="rounded-xl overflow-x-auto border" style={{ borderColor: "var(--glass-border)" }}>
                                                <table className="w-full text-left text-sm whitespace-nowrap">
                                                    <thead>
                                                        <tr className="border-b" style={{ borderColor: "var(--glass-border)", background: "var(--nav-hover-bg)" }}>
                                                            <th className="px-5 py-3.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Type</th>
                                                            <th className="px-5 py-3.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Name</th>
                                                            <th className="px-5 py-3.5 font-semibold text-xs text-muted-foreground uppercase tracking-wider">Value</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y" style={{ borderColor: "var(--glass-border)" }}>
                                                        <tr className="group hover:bg-muted/10 transition-colors">
                                                            <td className="px-5 py-4 font-mono text-xs font-semibold">CNAME</td>
                                                            <td className="px-5 py-4 text-foreground font-semibold">app</td>
                                                            <td className="px-5 py-4 font-mono text-xs flex items-center gap-2" style={{ color: "var(--muted-foreground)" }}>
                                                                cname.botchat.com
                                                                <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-foreground" />
                                                            </td>
                                                        </tr>
                                                        <tr className="group hover:bg-muted/10 transition-colors">
                                                            <td className="px-5 py-4 font-mono text-xs font-semibold">TXT</td>
                                                            <td className="px-5 py-4 text-foreground font-semibold">_botchat-verify.app</td>
                                                            <td className="px-5 py-4 font-mono text-xs flex items-center gap-2" style={{ color: "var(--muted-foreground)" }}>
                                                                vc_verify_q3f8d9sk2lxyz
                                                                <Copy className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-foreground" />
                                                            </td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div className="flex items-start gap-3 p-3.5 rounded-xl transition-all hover:bg-opacity-80" style={{ background: "rgba(245,158,11,0.05)", border: "1px solid rgba(245,158,11,0.2)" }}>
                                                <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: "#f59e0b" }} />
                                                <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                                                    <strong style={{ color: "var(--foreground)" }}>Note:</strong> DNS changes can take up to 48 hours to propagate worldwide, although they typically take effect within 15 minutes. Ensure nameservers are accurate.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Section>
                            )}
                        </div>
                    )}

                    {/* Notifications */}
                    {tab === "notifications" && (
                        <div className="space-y-6 slide-up">
                            <IntegrationHeader title="Notification Preferences" desc="Manage your inbound alerts and system digests." Icon={Bell} color="#f59e0b" />
                            <Section title="Event Subscriptions" desc="Choose what alerts you receive">
                                <Toggle label="New conversation started" desc="When a user starts a new DM" defaultChecked={true} />
                                <Toggle label="Automation triggered" desc="Each time a flow is activated" defaultChecked={true} />
                                <Toggle label="New lead captured" desc="When a lead is added to your pipeline" defaultChecked={true} />
                                <Toggle label="Weekly performance report" desc="Summary emailed every Monday" defaultChecked={true} />
                                <Toggle label="Billing alerts" desc="Renewal reminders and receipts" defaultChecked={true} />
                                <Toggle label="Product updates" desc="New features and changelog" defaultChecked={false} />
                                <Toggle label="Marketing emails" desc="Tips, guides, and promotions" defaultChecked={false} />
                            </Section>
                        </div>
                    )}

                    {/* Security */}
                    {tab === "security" && (
                        <div className="space-y-4">
                            <IntegrationHeader title="Security & Authentication" desc="Manage your password, 2FA, and active sessions." Icon={Shield} color="#10b981" />
                            <Section title="Change Password" desc="Use a strong, unique password">
                                <InputField label="Current Password" type="password" placeholder="••••••••" />
                                <InputField label="New Password" type="password" placeholder="Min 8 characters" />
                                <InputField label="Confirm Password" type="password" placeholder="Repeat new password" />
                                <div className="flex justify-end">
                                    <button className="px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
                                        style={{ background: "var(--brand-gradient)", color: "white" }}>Update Password</button>
                                </div>
                            </Section>
                            <Section title="Two-Factor Authentication" desc="Extra layer of security">
                                <Toggle label="Enable 2FA via Authenticator App" defaultChecked={false} />
                                <Toggle label="Enable 2FA via SMS" defaultChecked={false} />
                            </Section>
                            <Section title="Active Sessions">
                                {[
                                    { device: "Chrome on macOS", ip: "192.168.1.1", time: "Active now", current: true },
                                    { device: "Safari on iPhone", ip: "192.168.1.14", time: "2 hours ago", current: false },
                                    { device: "Firefox on Windows", ip: "10.0.0.5", time: "Yesterday", current: false },
                                ].map((s) => (
                                    <div key={s.device} className="flex items-center justify-between p-3 rounded-xl"
                                        style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                                        <div>
                                            <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{s.device}</p>
                                            <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>{s.ip} · {s.time}</p>
                                        </div>
                                        {s.current
                                            ? <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981" }}>Current</span>
                                            : <button className="text-xs px-2 py-1 rounded-lg hover:opacity-80" style={{ color: "#ef4444", background: "rgba(239,68,68,0.1)" }}>Revoke</button>}
                                    </div>
                                ))}
                            </Section>
                        </div>
                    )}

                    {/* API Keys */}
                    {tab === "api" && (
                        <div className="space-y-6 slide-up">
                            <IntegrationHeader title="Developer Settings & API Keys" desc="Use programatic access to connect BotChat with external services via Webhooks." Icon={Key} color="#6366f1" />
                            <Section title="API Keys" desc="Keys used by your backend server to access BotChat endpoints">
                                <ApiKeyRow label="Live API Key" value="bch_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6" />
                                <ApiKeyRow label="Test API Key" value="bch_test_z9y8x7w6v5u4t3s2r1q0p9o8n7m6l5k4" />
                                <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium hover:opacity-80 transition-all"
                                    style={{ background: "rgba(124,58,237,0.1)", color: "var(--brand-purple-light)", border: "1px solid rgba(124,58,237,0.2)" }}>
                                    <Plus className="w-4 h-4" />Generate New Key
                                </button>
                            </Section>
                            <Section title="Webhooks" desc="Receive real-time events from BotChat">
                                <InputField label="Webhook URL" placeholder="https://your-server.com/webhook" />
                                <div className="flex gap-2 flex-wrap">
                                    {["New Message", "Lead Captured", "Flow Triggered", "Automation Completed"].map((e) => (
                                        <span key={e} className="text-xs px-2 py-1 rounded-lg cursor-pointer hover:opacity-80"
                                            style={{ background: "rgba(124,58,237,0.1)", color: "var(--brand-purple-light)", border: "1px solid rgba(124,58,237,0.2)" }}>{e}</span>
                                    ))}
                                </div>
                                <div className="flex justify-end">
                                    <button className="px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
                                        style={{ background: "var(--brand-gradient)", color: "white" }}>Save Webhook</button>
                                </div>
                            </Section>
                        </div>
                    )}

                    {/* Data & Privacy */}
                    {tab === "data" && (
                        <div className="space-y-6 slide-up">
                            <IntegrationHeader title="Data & Privacy Settings" desc="Manage what data stays locally, export history, or request a complete wipe." Icon={Database} color="#14b8a6" />
                            <Section title="Data Export" desc="Download all your workspace data locally">
                                <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Export all conversations, contacts, automation data, and analytics as a ZIP file.</p>
                                <button className="px-4 py-2 mt-4 rounded-xl text-sm font-semibold hover:opacity-80 transition-all"
                                    style={{ background: "var(--glass-bg)", color: "var(--foreground)", border: "1px solid var(--glass-border)" }}>
                                    Request Data Export
                                </button>
                            </Section>
                            <Section title="Privacy Controls">
                                <Toggle label="Allow anonymous analytics" desc="Help improve BotChat with usage data" defaultChecked={true} />
                                <Toggle label="Share performance benchmarks" desc="Anonymised comparison with similar users" defaultChecked={false} />
                            </Section>
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
                            <IntegrationHeader title="Email Delivery (SMTP/SES)" desc="Connect SendGrid, Mailjet, Postmark, or custom SMTP to send outbound system emails." Icon={Mail} color="#dc2626" isConnected={emailProfiles.length > 0} />

                            {emailProfiles.length > 0 ? (
                                <Section title="Configured Providers">
                                    <div className="space-y-4">
                                        {emailProfiles.map((p: any) => (
                                            <div key={p._id} className="p-4 rounded-xl flex items-center justify-between" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                                                <div>
                                                    <h4 className="text-sm font-bold" style={{ color: "var(--foreground)" }}>{p.profileName} <span className="text-[10px] ml-2 px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 uppercase tracking-wider">{p.provider}</span></h4>
                                                    <p className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>Sender Email: {p.senderEmail}</p>
                                                </div>
                                                {p.isDefault && <span className="text-xs px-3 py-1 bg-green-500/10 text-green-500 rounded-full font-semibold">Default</span>}
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-sm"
                                            style={{ background: "var(--brand-gradient)", color: "white" }}>
                                            <Plus className="w-4 h-4" /> Add Next Provider
                                        </button>
                                    </div>
                                </Section>
                            ) : (
                                <Section title="SMTP Configuration">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <InputField label="SMTP Host" placeholder="smtp.mailserver.com" />
                                        <InputField label="Port" placeholder="587" />
                                        <InputField label="SMTP Username" placeholder="apikey" />
                                        <InputField label="SMTP Password" type="password" placeholder="••••••••" />
                                        <div className="md:col-span-2">
                                            <InputField label="Sender 'From' Address" placeholder="no-reply@botchat.com" />
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-sm"
                                            style={{ background: "var(--brand-gradient)", color: "white" }}>
                                            <Save className="w-4 h-4" /> Save Configuration
                                        </button>
                                    </div>
                                </Section>
                            )}
                        </div>
                    )}

                    {/* SMS Integration */}
                    {tab === "int-sms" && (
                        <div className="space-y-6 slide-up">
                            <IntegrationHeader title="Twilio SMS & OTP" desc="Process global text messaging and one-time passwords natively." Icon={Smartphone} color="#ef4444" isConnected={true} />
                            <Section title="API Credentials">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <InputField label="Account SID" defaultValue="ACxxxxxxxxxxxxxxxxx" />
                                    <InputField label="Auth Token" type="password" defaultValue="••••••••••••••" />
                                    <div className="md:col-span-2">
                                        <InputField label="Default Sender Number ID" defaultValue="+1234567890" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 p-3 mt-2 rounded-xl text-sm" style={{ background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.2)" }}>
                                    <Check className="w-4 h-4" /> Credentials verified successfully.
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-all"
                                        style={{ background: "var(--brand-gradient)", color: "white" }}>
                                        <Save className="w-4 h-4" /> Update Connection
                                    </button>
                                </div>
                            </Section>
                        </div>
                    )}

                    {/* Social Integration */}
                    {tab === "int-social" && (
                        <div className="space-y-6 slide-up">
                            <IntegrationHeader title="Meta for Business" desc="Connect Facebook Pages and Instagram via Developer App Credentials." Icon={Facebook} color="#3b82f6" isConnected={!!facebook?.appId} />
                            <form onSubmit={handleSaveFacebook}>
                                <Section title="Developer Credentials">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <InputField label="App Name" value={fbForm.appName} onChange={(e: any) => setFbForm({ ...fbForm, appName: e.target.value })} placeholder="My AI Assistant" />
                                        <InputField label="Site URL" value={fbForm.siteUrl} onChange={(e: any) => setFbForm({ ...fbForm, siteUrl: e.target.value })} placeholder="https://example.com" />
                                        <InputField label="Facebook App ID" value={fbForm.appId} onChange={(e: any) => setFbForm({ ...fbForm, appId: e.target.value })} placeholder="1234567890" />
                                        <InputField label="App Secret" type="password" value={fbForm.appSecret} onChange={(e: any) => setFbForm({ ...fbForm, appSecret: e.target.value })} placeholder="•••••••• (Leave blank to keep)" />
                                    </div>

                                    {facebook?.webhookVerifyToken && (
                                        <div className="mt-4 p-4 rounded-xl border border-blue-500/20 bg-blue-500/5">
                                            <p className="text-xs text-blue-500 mb-2 font-medium">Webhook Verify Token (Generated by server)</p>
                                            <code className="text-sm font-mono text-foreground">{facebook.webhookVerifyToken}</code>
                                        </div>
                                    )}

                                    <div className="flex justify-end pt-4">
                                        <button type="submit" disabled={isLoadingFacebook} className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 shadow-md"
                                            style={{ background: "#1877F2", opacity: isLoadingFacebook ? 0.7 : 1 }}>
                                            <Save className="w-4 h-4" /> {isLoadingFacebook ? "Saving..." : "Save App Credentials"}
                                        </button>
                                    </div>
                                </Section>
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
                            <IntegrationHeader title="Stripe Payments" desc="Process subscriptions and invoices directly inside chat flows." Icon={CreditCard} color="#6366f1" />
                            <Section title="API Environment (Live)">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="md:col-span-2">
                                        <InputField label="Publishable Key" placeholder="pk_live_..." />
                                    </div>
                                    <div className="md:col-span-2">
                                        <InputField label="Secret Key" type="password" placeholder="sk_live_..." />
                                    </div>
                                    <div className="md:col-span-2">
                                        <InputField label="Webhook Signing Secret" type="password" placeholder="whsec_..." />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-sm"
                                        style={{ background: "var(--brand-gradient)", color: "white" }}>
                                        <Check className="w-4 h-4" /> Verify Key & Save
                                    </button>
                                </div>
                            </Section>
                        </div>
                    )}

                    {/* File Storage */}
                    {tab === "int-storage" && (
                        <div className="space-y-6 slide-up">
                            <IntegrationHeader title="AWS S3 Storage" desc="Send assets and store heavy user attachments globally." Icon={UploadCloud} color="#f59e0b" />
                            <Section title="IAM Credentials">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <InputField label="AWS Region" placeholder="us-east-1" />
                                    <InputField label="S3 Bucket Name" placeholder="botchat-uploads-prod" />
                                    <div className="md:col-span-2">
                                        <InputField label="AWS Access Key ID" placeholder="AKIAIOSFODNN7EXAMPLE" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <InputField label="AWS Secret Access Key" type="password" placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY" />
                                    </div>
                                </div>
                                <div className="flex justify-end pt-4">
                                    <button className="px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-90 transition-all shadow-sm"
                                        style={{ background: "var(--brand-gradient)", color: "white" }}>
                                        Save Credentials
                                    </button>
                                </div>
                            </Section>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
