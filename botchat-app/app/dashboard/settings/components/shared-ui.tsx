// @ts-nocheck
"use client";

import { useState } from "react";
import { Eye, EyeOff, Check, Copy, Trash2 } from "lucide-react";

export function Section({ title, desc, children }: { title: string; desc?: string; children: React.ReactNode }) {
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

export function InputField({ label, name, type = "text", placeholder, defaultValue, value, onChange, readOnly }: { label: string; name?: string; type?: string; placeholder?: string; defaultValue?: string; value?: string; onChange?: any; readOnly?: boolean }) {
    const resolvedReadOnly = readOnly ?? (!!value && !onChange);

    return (
        <div className="space-y-1.5">
            <label className="text-sm font-medium block" style={{ color: "var(--foreground)" }}>{label}</label>
            <input
                type={type}
                name={name}
                placeholder={placeholder}
                defaultValue={value === undefined ? defaultValue : undefined}
                value={value}
                onChange={onChange}
                readOnly={resolvedReadOnly}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all duration-300"
                style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "var(--primary)"; e.currentTarget.style.boxShadow = "var(--input-focus-ring)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "var(--glass-border)"; e.currentTarget.style.boxShadow = "none"; }}
            />
        </div>
    );
}

export function IntegrationHeader({ title, desc, Icon, color, isConnected = false }: { title: string; desc: string; Icon: any; color: string; isConnected?: boolean }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl mb-6 relative overflow-hidden group" style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
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

export function Toggle({ label, desc, defaultChecked = false }: { label: string; desc?: string; defaultChecked?: boolean }) {
    const [on, setOn] = useState(defaultChecked);
    return (
        <div className="flex items-center justify-between py-3" style={{ borderBottom: "1px solid var(--glass-border)" }}>
            <div>
                <p className="text-sm font-medium" style={{ color: "var(--foreground)" }}>{label}</p>
                {desc && <p className="text-xs mt-0.5" style={{ color: "var(--muted-foreground)" }}>{desc}</p>}
            </div>
            <button onClick={() => setOn(!on)}
                className="relative w-11 h-6 rounded-full transition-all duration-300 flex-shrink-0"
                style={{ background: on ? "var(--primary)" : "var(--glass-border)" }}>
                <span className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-300"
                    style={{ left: on ? "calc(100% - 22px)" : "2px" }} />
            </button>
        </div>
    );
}

export function ApiKeyRow({ label, value }: { label: string; value: string }) {
    const [shown, setShown] = useState(false);
    const [copied, setCopied] = useState(false);
    function handleCopy() {
        navigator.clipboard.writeText(value);
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
                    <button onClick={handleCopy} className="p-1.5 rounded-lg hover:opacity-70" style={{ background: "var(--glass-border)" }}>
                        {copied ? <Check className="w-3.5 h-3.5" style={{ color: "#10b981" }} /> : <Copy className="w-3.5 h-3.5" style={{ color: "var(--muted-foreground)" }} />}
                    </button>
                    <button className="p-1.5 rounded-lg hover:opacity-70" style={{ background: "rgba(239,68,68,0.1)" }}>
                        <Trash2 className="w-3.5 h-3.5" style={{ color: "#ef4444" }} />
                    </button>
                </div>
            </div>
            <code className="text-xs font-mono block" style={{ color: "var(--muted-foreground)" }}>
                {shown ? value : value.slice(0, 8) + "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"}
            </code>
        </div>
    );
}
