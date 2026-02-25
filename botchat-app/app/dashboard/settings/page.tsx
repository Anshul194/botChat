"use client";

import { useState } from "react";
import {
    User, Bell, Shield, Key, Database, Save,
    Eye, EyeOff, Plus, Trash2, Copy, Check,
} from "lucide-react";

const tabs = [
    { id: "profile", label: "Profile", Icon: User },
    { id: "notifications", label: "Notifications", Icon: Bell },
    { id: "security", label: "Security", Icon: Shield },
    { id: "api", label: "API Keys", Icon: Key },
    { id: "data", label: "Data & Privacy", Icon: Database },
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

function InputField({ label, type = "text", placeholder, defaultValue }: { label: string; type?: string; placeholder?: string; defaultValue?: string }) {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{label}</label>
            <input type={type} placeholder={placeholder} defaultValue={defaultValue}
                className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--brand-purple)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(124,58,237,0.15)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--glass-border)"; e.currentTarget.style.boxShadow = "none"; }}
            />
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

    return (
        <div className="space-y-6 max-w-[900px]">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>Settings</h1>
                <p className="text-sm mt-1" style={{ color: "var(--muted-foreground)" }}>Manage your account preferences and configuration</p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-1 p-1 rounded-2xl" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                {tabs.map(({ id, label, Icon }) => (
                    <button key={id} onClick={() => setTab(id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                        style={tab === id
                            ? { background: "var(--brand-gradient)", color: "white" }
                            : { color: "var(--muted-foreground)" }}>
                        <Icon className="w-4 h-4" />{label}
                    </button>
                ))}
            </div>

            {/* Profile */}
            {tab === "profile" && (
                <div className="space-y-4">
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

            {/* Notifications */}
            {tab === "notifications" && (
                <Section title="Notification Preferences" desc="Choose what alerts you receive">
                    <Toggle label="New conversation started" desc="When a user starts a new DM" defaultChecked={true} />
                    <Toggle label="Automation triggered" desc="Each time a flow is activated" defaultChecked={true} />
                    <Toggle label="New lead captured" desc="When a lead is added to your pipeline" defaultChecked={true} />
                    <Toggle label="Weekly performance report" desc="Summary emailed every Monday" defaultChecked={true} />
                    <Toggle label="Billing alerts" desc="Renewal reminders and receipts" defaultChecked={true} />
                    <Toggle label="Product updates" desc="New features and changelog" defaultChecked={false} />
                    <Toggle label="Marketing emails" desc="Tips, guides, and promotions" defaultChecked={false} />
                </Section>
            )}

            {/* Security */}
            {tab === "security" && (
                <div className="space-y-4">
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
                <div className="space-y-4">
                    <Section title="API Keys" desc="Use these to connect BotChat with external services">
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
                <div className="space-y-4">
                    <Section title="Data Export" desc="Download all your data">
                        <p className="text-sm" style={{ color: "var(--muted-foreground)" }}>Export all conversations, contacts, automation data, and analytics as a ZIP file.</p>
                        <button className="px-4 py-2 rounded-xl text-sm font-semibold hover:opacity-80 transition-all"
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
        </div>
    );
}
