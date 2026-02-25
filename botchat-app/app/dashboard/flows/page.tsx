"use client";

import { useState } from "react";
import {
    GitBranch, Plus, Play, Save, Eye, Bot, Zap,
    MessageSquare, Users, Clock, ChevronRight, X,
    Settings, Tag, ArrowRight,
} from "lucide-react";

interface FlowNode {
    id: string;
    type: string;
    label: string;
    x: number;
    y: number;
    color: string;
    icon: React.ElementType;
    config?: Record<string, string>;
}

const nodeTypes = [
    {
        group: "Triggers", items: [
            { type: "story_reply", label: "Story Reply", icon: MessageSquare, color: "#ec4899" },
            { type: "dm_keyword", label: "DM Keyword", icon: MessageSquare, color: "#7c3aed" },
            { type: "comment_keyword", label: "Comment", icon: MessageSquare, color: "#f59e0b" },
            { type: "new_follower", label: "New Follower", icon: Users, color: "#10b981" },
        ]
    },
    {
        group: "Actions", items: [
            { type: "send_dm", label: "Send DM", icon: MessageSquare, color: "#7c3aed" },
            { type: "wait", label: "Wait / Delay", icon: Clock, color: "#6b7280" },
            { type: "tag_contact", label: "Tag Contact", icon: Tag, color: "#06b6d4" },
            { type: "add_to_list", label: "Add to List", icon: Users, color: "#10b981" },
        ]
    },
    {
        group: "Conditions", items: [
            { type: "if_else", label: "If / Else", icon: GitBranch, color: "#f59e0b" },
            { type: "check_tag", label: "Check Tag", icon: Tag, color: "#8b5cf6" },
        ]
    },
    {
        group: "AI", items: [
            { type: "ai_reply", label: "AI Auto Reply", icon: Bot, color: "#06b6d4" },
            { type: "ai_classify", label: "AI Classify", icon: Bot, color: "#7c3aed" },
        ]
    },
];

const defaultFlow: FlowNode[] = [
    { id: "1", type: "story_reply", label: "Story Reply Trigger", x: 280, y: 60, color: "#ec4899", icon: MessageSquare },
    { id: "2", type: "ai_reply", label: "AI Auto Reply", x: 280, y: 200, color: "#06b6d4", icon: Bot },
    { id: "3", type: "if_else", label: "If Interested?", x: 280, y: 340, color: "#f59e0b", icon: GitBranch },
    { id: "4", type: "send_dm", label: "Send Offer DM", x: 120, y: 470, color: "#7c3aed", icon: MessageSquare },
    { id: "5", type: "tag_contact", label: "Tag as Lead", x: 440, y: 470, color: "#06b6d4", icon: Tag },
];

const connections = [
    { from: "1", to: "2" },
    { from: "2", to: "3" },
    { from: "3", to: "4" },
    { from: "3", to: "5" },
];

export default function FlowBuilderPage() {
    const [nodes, setNodes] = useState<FlowNode[]>(defaultFlow);
    const [selected, setSelected] = useState<FlowNode | null>(null);
    const [isLive, setIsLive] = useState(false);

    return (
        <div className="flex flex-col" style={{ height: "calc(100vh - 128px)" }}>
            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 py-3 rounded-2xl mb-3 flex-shrink-0"
                style={{ background: "var(--card)", border: "1px solid var(--glass-border)" }}>
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "var(--brand-gradient)" }}>
                        <GitBranch className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Story Reply Funnel</p>
                        <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>5 nodes · Last saved 2m ago</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Live toggle */}
                    <button onClick={() => setIsLive(!isLive)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all"
                        style={isLive
                            ? { background: "rgba(16,185,129,0.12)", color: "#10b981", border: "1px solid rgba(16,185,129,0.25)" }
                            : { background: "var(--glass-bg)", color: "var(--muted-foreground)", border: "1px solid var(--glass-border)" }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: isLive ? "#10b981" : "var(--muted-foreground)" }} />
                        {isLive ? "Live" : "Draft"}
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium hover:opacity-80"
                        style={{ background: "var(--glass-bg)", color: "var(--muted-foreground)", border: "1px solid var(--glass-border)" }}>
                        <Eye className="w-3.5 h-3.5" />Preview
                    </button>
                    <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium hover:opacity-80"
                        style={{ background: "var(--glass-bg)", color: "var(--muted-foreground)", border: "1px solid var(--glass-border)" }}>
                        <Save className="w-3.5 h-3.5" />Save
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold hover:opacity-90 transition-all"
                        style={{ background: "var(--brand-gradient)", color: "white" }}>
                        <Play className="w-3.5 h-3.5" />Publish
                    </button>
                </div>
            </div>

            {/* Main Area */}
            <div className="flex flex-1 gap-3 min-h-0">
                {/* Node Palette */}
                <div className="w-[200px] flex-shrink-0 rounded-2xl overflow-y-auto p-3 space-y-4"
                    style={{ background: "var(--card)", border: "1px solid var(--glass-border)" }}>
                    {nodeTypes.map((group) => (
                        <div key={group.group}>
                            <p className="text-[10px] font-semibold tracking-widest px-1 mb-2" style={{ color: "var(--muted-foreground)" }}>
                                {group.group.toUpperCase()}
                            </p>
                            <div className="space-y-1">
                                {group.items.map((n) => (
                                    <div key={n.type}
                                        className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-grab text-xs font-medium transition-all hover:scale-[1.02]"
                                        style={{ background: `${n.color}10`, border: `1px solid ${n.color}20`, color: "var(--foreground)" }}
                                        draggable
                                    >
                                        <n.icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: n.color }} />
                                        <span className="truncate">{n.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Canvas */}
                <div className="flex-1 rounded-2xl relative overflow-hidden"
                    style={{ background: "var(--background)", border: "1px solid var(--glass-border)" }}
                    onClick={() => setSelected(null)}>
                    {/* Grid dots */}
                    <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
                        <defs>
                            <pattern id="dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                                <circle cx="2" cy="2" r="1" fill="var(--muted-foreground)" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#dots)" />
                    </svg>

                    {/* Connection lines */}
                    <svg className="absolute inset-0 w-full h-full pointer-events-none">
                        {connections.map((c) => {
                            const from = nodes.find((n) => n.id === c.from);
                            const to = nodes.find((n) => n.id === c.to);
                            if (!from || !to) return null;
                            const x1 = from.x + 90, y1 = from.y + 40;
                            const x2 = to.x + 90, y2 = to.y;
                            const cy1 = y1 + (y2 - y1) * 0.5;
                            return (
                                <g key={`${c.from}-${c.to}`}>
                                    <path d={`M${x1},${y1} C${x1},${cy1} ${x2},${cy1} ${x2},${y2}`}
                                        stroke="var(--glass-border)" strokeWidth="2" fill="none" strokeDasharray="5 3" />
                                    <circle cx={x2} cy={y2} r="4" fill="var(--brand-purple)" />
                                </g>
                            );
                        })}
                    </svg>

                    {/* Nodes */}
                    {nodes.map((node) => (
                        <div key={node.id}
                            className="flow-node absolute cursor-pointer select-none transition-all duration-150"
                            style={{
                                left: node.x, top: node.y, width: 180,
                                border: selected?.id === node.id ? `2px solid ${node.color}` : "1px solid var(--glass-border)",
                                boxShadow: selected?.id === node.id ? `0 0 0 3px ${node.color}20, var(--shadow-hover)` : "var(--shadow-card)",
                            }}
                            onClick={(e) => { e.stopPropagation(); setSelected(node); }}
                        >
                            <div className="flex items-center gap-2 p-3">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                                    style={{ background: `${node.color}20` }}>
                                    <node.icon className="w-3.5 h-3.5" style={{ color: node.color }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold truncate" style={{ color: "var(--foreground)" }}>{node.label}</p>
                                    <p className="text-[10px] capitalize" style={{ color: "var(--muted-foreground)" }}>{node.type.replace(/_/g, " ")}</p>
                                </div>
                                <div style={{ color: node.color }}>
                                    <ChevronRight className="w-3.5 h-3.5" />
                                </div>
                            </div>
                            {/* Output handle */}
                            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-5 h-5 rounded-full flex items-center justify-center"
                                style={{ background: node.color, boxShadow: `0 0 8px ${node.color}60` }}>
                                <Plus className="w-3 h-3 text-white" />
                            </div>
                        </div>
                    ))}

                    {/* Add node prompt */}
                    <div className="absolute bottom-4 right-4">
                        <button className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium hover:opacity-90 transition-all"
                            style={{ background: "var(--brand-gradient)", color: "white", boxShadow: "0 4px 15px rgba(124,58,237,0.4)" }}>
                            <Plus className="w-3.5 h-3.5" />Add Node
                        </button>
                    </div>

                    {/* Stats overlay */}
                    <div className="absolute top-3 right-3 flex gap-2">
                        {[
                            { label: "Nodes", value: nodes.length },
                            { label: "Triggers", value: 1284 },
                            { label: "Success", value: "87%" },
                        ].map((s) => (
                            <div key={s.label} className="px-2.5 py-1.5 rounded-xl text-center" style={{ background: "var(--card)", border: "1px solid var(--glass-border)" }}>
                                <div className="text-xs font-bold gradient-text">{s.value}</div>
                                <div className="text-[9px]" style={{ color: "var(--muted-foreground)" }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Settings Panel */}
                {selected ? (
                    <div className="w-[220px] flex-shrink-0 rounded-2xl p-4 overflow-y-auto space-y-4"
                        style={{ background: "var(--card)", border: "1px solid var(--glass-border)" }}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Settings className="w-4 h-4" style={{ color: "var(--muted-foreground)" }} />
                                <span className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Node Settings</span>
                            </div>
                            <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:opacity-70"
                                style={{ background: "var(--glass-bg)" }}>
                                <X className="w-3.5 h-3.5" style={{ color: "var(--muted-foreground)" }} />
                            </button>
                        </div>

                        <div className="flex items-center gap-2 p-3 rounded-xl"
                            style={{ background: `${selected.color}10`, border: `1px solid ${selected.color}20` }}>
                            <selected.icon className="w-4 h-4" style={{ color: selected.color }} />
                            <span className="text-xs font-semibold" style={{ color: "var(--foreground)" }}>{selected.label}</span>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-[10px] font-semibold block mb-1.5 tracking-wider" style={{ color: "var(--muted-foreground)" }}>NODE NAME</label>
                                <input defaultValue={selected.label} className="w-full px-3 py-2 rounded-xl text-xs outline-none transition-all"
                                    style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                                    onFocus={(e) => { e.currentTarget.style.borderColor = selected.color; }}
                                    onBlur={(e) => { e.currentTarget.style.borderColor = "var(--glass-border)"; }}
                                />
                            </div>
                            {selected.type === "send_dm" && (
                                <div>
                                    <label className="text-[10px] font-semibold block mb-1.5 tracking-wider" style={{ color: "var(--muted-foreground)" }}>MESSAGE</label>
                                    <textarea rows={4} placeholder="Enter your DM message..." className="w-full px-3 py-2 rounded-xl text-xs outline-none resize-none transition-all"
                                        style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }}
                                        onFocus={(e) => { e.currentTarget.style.borderColor = selected.color; }}
                                        onBlur={(e) => { e.currentTarget.style.borderColor = "var(--glass-border)"; }}
                                    />
                                </div>
                            )}
                            {selected.type === "wait" && (
                                <div>
                                    <label className="text-[10px] font-semibold block mb-1.5 tracking-wider" style={{ color: "var(--muted-foreground)" }}>DELAY (minutes)</label>
                                    <input type="number" defaultValue={30} className="w-full px-3 py-2 rounded-xl text-xs outline-none transition-all"
                                        style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }} />
                                </div>
                            )}
                            {selected.type === "ai_reply" && (
                                <div>
                                    <label className="text-[10px] font-semibold block mb-1.5 tracking-wider" style={{ color: "var(--muted-foreground)" }}>AI INSTRUCTIONS</label>
                                    <textarea rows={4} placeholder="Describe how the AI should respond..." className="w-full px-3 py-2 rounded-xl text-xs outline-none resize-none transition-all"
                                        style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)", color: "var(--foreground)" }} />
                                </div>
                            )}
                        </div>

                        <button className="w-full py-2 rounded-xl text-xs font-semibold hover:opacity-90 transition-all mt-auto"
                            style={{ background: `${selected.color}15`, color: selected.color, border: `1px solid ${selected.color}30` }}>
                            Apply Changes
                        </button>
                    </div>
                ) : (
                    <div className="w-[220px] flex-shrink-0 rounded-2xl p-4 space-y-3 flex flex-col items-center justify-center text-center"
                        style={{ background: "var(--card)", border: "1px solid var(--glass-border)" }}>
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: "rgba(124,58,237,0.1)" }}>
                            <GitBranch className="w-6 h-6" style={{ color: "#7c3aed" }} />
                        </div>
                        <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>Flow Builder</p>
                        <p className="text-xs leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                            Click any node to configure its settings, or drag nodes from the palette to build your flow.
                        </p>
                        <div className="w-full space-y-2 mt-2">
                            {[
                                { label: "Total Nodes", value: nodes.length },
                                { label: "Triggers Today", value: "1,284" },
                                { label: "Success Rate", value: "87%" },
                            ].map((s) => (
                                <div key={s.label} className="flex items-center justify-between px-3 py-2 rounded-xl"
                                    style={{ background: "var(--glass-bg)", border: "1px solid var(--glass-border)" }}>
                                    <span className="text-xs" style={{ color: "var(--muted-foreground)" }}>{s.label}</span>
                                    <span className="text-xs font-bold" style={{ color: "var(--brand-purple)" }}>{s.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
