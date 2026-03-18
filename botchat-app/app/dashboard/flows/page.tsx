// @ts-nocheck
"use client";
import { useState, useRef, useEffect, useCallback, createContext, useContext, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";
import { toast } from "sonner";
import {
  MessageSquare, MousePointer2, Link, Image as ImageIcon, Layers,
  Keyboard, Mail, Phone, Bot, Brain, GitBranch, Timer, Shuffle,
  Tag as TagIcon, ShieldCheck, UserCog, Bell, Users, Zap,
  ExternalLink, Table, CheckCircle2, Search, Wand2, Plus, Trash2,
  Copy, MoreVertical, GripHorizontal, ChevronRight, Share,
  Instagram as InstagramIcon, Facebook as FacebookIcon, X, ArrowLeft, ArrowRight, Save, Play,
  Sparkle, Smartphone, Settings2, HelpCircle, MessageCircle, Star, Mic, File, Upload
} from "lucide-react";

/* ============================================================
   DESIGN SYSTEM — use site CSS vars so preview matches site theme
   ============================================================ */
const PLATFORMS = {
  instagram: {
    name: "Instagram",
    accent: "#E1306C",
    accentSoft: "rgba(225,48,108,0.08)",
    accentBorder: "rgba(225,48,108,0.16)",
    gradient: "linear-gradient(135deg, #833AB4, #FD1D1D, #FCB045)",
    icon: "📸",
  },
  facebook: {
    name: "Facebook",
    accent: "#1877F2",
    accentSoft: "rgba(24,119,242,0.08)",
    accentBorder: "rgba(24,119,242,0.16)",
    gradient: "linear-gradient(135deg, #1877F2, #3B5998)",
    icon: "👤",
  },
};

const getDS = (platform) => {
  const p = PLATFORMS[platform] || PLATFORMS.instagram;
  return {
    bg: "var(--background)",
    card: "var(--card)",
    ink: "var(--foreground)",
    ink2: "var(--muted-foreground)",
    ink3: "var(--muted-foreground)",
    border: "var(--border)",
    borderHover: "var(--border)",
    accent: p.accent,
    accentSoft: p.accentSoft,
    accentBorder: p.accentBorder,
    gradient: p.gradient,
    green: "var(--chart-3)",
    greenSoft: "rgba(16,185,129,0.06)",
    amber: "var(--chart-4)",
    amberSoft: "rgba(245,158,11,0.06)",
    blue: "var(--chart-1)",
    blueSoft: "rgba(29,110,245,0.06)",
    shadow: "0 1px 3px rgba(0,0,0,0.06), 0 6px 18px rgba(0,0,0,0.04)",
    shadowHover: "0 6px 20px rgba(0,0,0,0.08)",
    shadowCard: "0 0 0 1.5px var(--border), 0 2px 12px rgba(0,0,0,0.06)",
    radius: 14,
    radiusSm: 9,
  };
};

const DSContext = createContext(null);
const useDS = () => useContext(DSContext);

/* ============================================================
   DATA DEFINITIONS
   ============================================================ */
const ACTIONS = [
  { id: "message", icon: MessageSquare, label: "Message", desc: "Send a text message" },
  { id: "image", icon: ImageIcon, label: "Image", desc: "Send an image" },
  { id: "video", icon: Play, label: "Video", desc: "Send a video" },
  { id: "audio", icon: Mic, label: "Audio", desc: "Send audio" },
  { id: "file", icon: File, label: "File", desc: "Send a document" },
  { id: "carousel", icon: Layers, label: "Carousel", desc: "Horizontal scrolling cards" },
  { id: "user_input", icon: Keyboard, label: "User Input", desc: "Ask question and save response" },
  { id: "condition", icon: GitBranch, label: "Condition", desc: "Logic branching" },
  { id: "trigger_action", icon: Zap, label: "Trigger Action", desc: "Fire a postback payload" },
];

const VARS = [
  { v: "{first_name}", label: "First Name" },
  { v: "{last_name}", label: "Last Name" },
  { v: "{username}", label: "@Username" },
  { v: "{post_url}", label: "Post URL" },
  { v: "{story_url}", label: "Story URL" },
];

/* ============================================================
   UTILITIES
   ============================================================ */
const uid = () => `s_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
const getActionDef = (id: string) => ACTIONS.find(a => a.id === id) || ACTIONS[0];
const getDef = (kind: string, type: string) => getActionDef(type);
const getColor = (kind: string, type: string) => "#1C1917";

const ensureUrl = (url: string) => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("//") || url.startsWith("data:")) return url;
  // If it's a relative path starting with /, we might need to handle it, but for now assuming host-first
  if (url.startsWith("/")) return url;
  return `https://${url}`;
};

/* ============================================================
   MINI COMPONENTS
   ============================================================ */
function Label({ children, hint }) {
  const DS = useDS();
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: DS.ink3, letterSpacing: "0.08em", textTransform: "uppercase" }}>{children}</span>
      {hint && <span style={{ fontSize: 10.5, color: DS.ink3 }}>{hint}</span>}
    </div>
  );
}

function Input({ value, onChange, placeholder, multiline, rows = 3, type = "text", style: extra = {} }) {
  const DS = useDS();
  const base = {
    width: "100%", padding: "9px 12px", borderRadius: DS.radiusSm,
    border: `1.5px solid ${DS.border}`, fontSize: 13, fontFamily: "inherit",
    background: DS.bg, color: DS.ink, outline: "none", boxSizing: "border-box",
    transition: "border-color 0.15s, box-shadow 0.15s", resize: "vertical", ...extra,
  };
  const handlers = {
    onFocus: e => { e.target.style.borderColor = DS.accent; e.target.style.boxShadow = `0 0 0 3px ${DS.accentSoft}`; },
    onBlur: e => { e.target.style.borderColor = DS.border; e.target.style.boxShadow = "none"; },
  };
  return multiline
    ? <textarea value={value || ""} onChange={onChange} placeholder={placeholder} rows={rows} style={base} {...handlers} />
    : <input type={type} value={value || ""} onChange={onChange} placeholder={placeholder} style={base} {...handlers} />;
}

function Select({ value, onChange, options, style: extra = {} }) {
  const DS = useDS();
  return (
    <select value={value} onChange={onChange} style={{
      width: "100%", padding: "9px 12px", borderRadius: DS.radiusSm,
      border: `1.5px solid ${DS.border}`, fontSize: 13, fontFamily: "inherit",
      background: DS.bg, color: DS.ink, outline: "none", boxSizing: "border-box", cursor: "pointer", ...extra,
    }}>
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function Toggle({ on, onChange, label }) {
  const DS = useDS();
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", borderRadius: DS.radiusSm, background: DS.bg, border: `1.5px solid ${DS.border}` }}>
      <span style={{ fontSize: 13, color: DS.ink2, fontWeight: 500 }}>{label}</span>
      <div onClick={onChange} style={{ width: 40, height: 22, borderRadius: 99, background: on ? DS.accent : DS.border, position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}>
        <div style={{ position: "absolute", top: 3, left: on ? 21 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.2)", transition: "left 0.2s" }} />
      </div>
    </div>
  );
}

function VarPills({ onInsert }) {
  const DS = useDS();
  return (
    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 5 }}>
      {VARS.map(v => (
        <button key={v.v} onClick={() => onInsert(v.v)} style={{
          fontSize: 10.5, padding: "2px 8px", borderRadius: 99, border: `1px solid ${DS.accentBorder}`,
          background: DS.accentSoft, color: DS.accent, cursor: "pointer", fontFamily: "inherit", fontWeight: 600,
        }}>{v.label}</button>
      ))}
    </div>
  );
}

function Tag({ children, color, bg }) {
  const DS = useDS();
  return <span style={{ fontSize: 10.5, fontWeight: 700, color: color || DS.accent, background: bg || DS.accentSoft, border: `1px solid ${color || DS.accent}30`, borderRadius: 99, padding: "2px 8px" }}>{children}</span>;
}

function SmallBtn({ children, onClick, danger, icon, style: extra = {} }) {
  const DS = useDS();
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: DS.radiusSm,
      border: `1.5px solid ${danger && hov ? "#FCA5A5" : DS.border}`,
      background: danger && hov ? "#FFF1F0" : hov ? DS.bg : DS.card,
      color: danger ? (hov ? "#DC2626" : DS.ink3) : DS.ink2,
      cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit",
      transition: "all 0.12s", ...extra,
    }}>
      {icon && (
        <span style={{ display: "flex", alignItems: "center" }}>
          {typeof icon === 'string' ? icon : <icon size={12} />}
        </span>
      )}{children}
    </button>
  );
}

/* ============================================================
   FORM FIELDS PER STEP TYPE
   ============================================================ */

function MessageFields({ step, update, allSteps, onSaveStep, onAddStep }) {
  const c = step.config || {};
  const set = patch => update({ ...step, config: { ...c, ...patch } });
  const [saving, setSaving] = useState(false);
  const textRef = useRef(null);
  const DS = useDS();

  const buttons = c.buttons || [];

  const insertVar = v => {
    const el = textRef.current;
    if (!el) { set({ text: (c.text || "") + v }); return; }
    const s = el.selectionStart, e = el.selectionEnd;
    const val = (c.text || "");
    set({ text: val.slice(0, s) + v + val.slice(e) });
    setTimeout(() => el.setSelectionRange(s + v.length, s + v.length), 0);
  };

  const addButton = () => {
    if (buttons.length >= 3) return;
    set({ buttons: [...buttons, { label: "New Button", action_type: "send_message", action_value: "" }] });
  };

  const updateButton = (idx, patch) => {
    const nb = [...buttons];
    nb[idx] = { ...nb[idx], ...patch };
    set({ buttons: nb });
  };

  const removeButton = (idx) => {
    set({ buttons: buttons.filter((_, i) => i !== idx) });
  };

  const onUpdateSave = async () => {
    setSaving(true);
    if (onSaveStep) {
      await onSaveStep(step);
    } else {
      await new Promise(r => setTimeout(r, 600));
    }
    setSaving(false);
    toast.success("Message step updated");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <Label>Message text</Label>
        <textarea ref={textRef} value={c.text || ""} onChange={e => set({ text: e.target.value })}
          placeholder="Hey {first_name}! 👋 ..." rows={4}
          style={{ width: "100%", padding: "9px 12px", borderRadius: DS.radiusSm, border: `1.5px solid ${DS.border}`, fontSize: 13, fontFamily: "inherit", background: DS.bg, color: DS.ink, outline: "none", boxSizing: "border-box", resize: "vertical" }}
        />
        <VarPills onInsert={insertVar} />
      </div>

      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <Label>Buttons ({buttons.length}/3)</Label>
          {buttons.length < 3 && (
            <button onClick={addButton} style={{ fontSize: 11, fontWeight: 800, color: DS.accent, border: "none", background: "transparent", cursor: "pointer" }}>+ ADD BUTTON</button>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {buttons.map((btn, i) => (
            <div key={i} style={{ background: DS.bg, border: `1.5px solid ${DS.border}`, borderRadius: DS.radiusSm, padding: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 800, color: DS.ink3 }}>BUTTON #{i + 1}</span>
                <button onClick={() => removeButton(i)} style={{ border: "none", background: "transparent", color: "#DC2626", cursor: "pointer", fontSize: 10 }}>✕ REMOVE</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 1 }}>
                    <Label>Title</Label>
                    <Input value={btn.label} onChange={e => updateButton(i, { label: e.target.value })} placeholder="Button label" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <Label>Action</Label>
                    <Select value={btn.action_type} onChange={e => updateButton(i, { action_type: e.target.value })} options={[
                      { value: "send_message", label: "Send Message" },
                      { value: "open_url", label: "Open URL" },
                      { value: "postback_action", label: "Trigger Action" },
                    ]} />
                  </div>
                </div>

                {btn.action_type === "send_message" && (
                  <div>
                    <Label>Next Step</Label>
                    <Select value={btn.action_value} onChange={e => {
                      const val = e.target.value;
                      if (val.startsWith("NEW_")) {
                        const newId = onAddStep(val.replace("NEW_", ""));
                        updateButton(i, { action_value: newId });
                      } else {
                        updateButton(i, { action_value: val });
                      }
                    }} options={[
                      { value: "", label: "Select a step..." },
                      ...allSteps.filter(s => s.id !== step.id).map(s => ({ value: s.id, label: s.label || s.type })),
                      { value: "SEP", label: "--- Create New ---", disabled: true },
                      ...ACTIONS.map(a => ({ value: `NEW_${a.id}`, label: `+ Add ${a.label}` }))
                    ]} />
                  </div>
                )}
                {btn.action_type === "open_url" && (
                  <div>
                    <Label>URL</Label>
                    <Input value={btn.action_value} onChange={e => updateButton(i, { action_value: e.target.value })} placeholder="https://..." />
                  </div>
                )}
                {btn.action_type === "postback_action" && (
                  <div>
                    <Label>Trigger Action (Payload)</Label>
                    <Input value={btn.action_value} onChange={e => updateButton(i, { action_value: e.target.value })} placeholder="trigger_action_key" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <Label>Delay before sending</Label>
        <div style={{ display: "flex", gap: 8 }}>
          <Input type="number" value={c.delayVal || ""} onChange={e => set({ delayVal: e.target.value })} placeholder="0" style={{ flex: 1 }} />
          <Select value={c.delayUnit || "seconds"} onChange={e => set({ delayUnit: e.target.value })} style={{ flex: 1 }} options={[
            { value: "seconds", label: "Seconds" }, { value: "minutes", label: "Minutes" },
          ]} />
        </div>
      </div>

      <button
        onClick={onUpdateSave}
        disabled={saving}
        style={{
          width: "100%", padding: "11px", borderRadius: DS.radiusSm, background: DS.ink, color: "#fff",
          fontSize: 13, fontWeight: 700, border: "none", cursor: saving ? "default" : "pointer", marginTop: 4,
          transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          opacity: saving ? 0.7 : 1
        }}
      >
        {saving ? "Updating..." : <><Save size={14} /> Update Message Step</>}
      </button>
    </div>
  );
}

function QuickReplyFields({ step, update }) {
  const c = step.config || {};
  const set = patch => update({ ...step, config: { ...c, ...patch } });
  const opts = (c.options || "").split("|").map(o => o.trim()).filter(Boolean);
  const DS = useDS();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <Label>Question / Message</Label>
        <Input value={c.question} onChange={e => set({ question: e.target.value })} placeholder="What best describes you?" />
      </div>
      <div>
        <Label hint="separate with |">Button options (max 3)</Label>
        <Input value={c.options} onChange={e => set({ options: e.target.value })} placeholder="Creator|Business Owner|Just browsing" />
        {opts.length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
            {opts.map((o, i) => (
              <div key={i} style={{ background: DS.accentSoft, border: `1.5px solid ${DS.accentBorder}`, color: DS.accent, borderRadius: 20, padding: "5px 12px", fontSize: 12, fontWeight: 600 }}>{o}</div>
            ))}
          </div>
        )}
      </div>
      <div>
        <Label>If user doesn't tap</Label>
        <Select value={c.noReply || "wait"} onChange={e => set({ noReply: e.target.value })} options={[
          { value: "wait", label: "Wait indefinitely" },
          { value: "followup", label: "Send follow-up after 24h" },
          { value: "end", label: "End flow" },
        ]} />
      </div>
    </div>
  );
}

function SendLinkFields({ step, update }) {
  const c = step.config || {};
  const set = patch => update({ ...step, config: { ...c, ...patch } });
  const DS = useDS();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <Label>Message before link</Label>
        <Input value={c.text} onChange={e => set({ text: e.target.value })} placeholder="Here's what you asked for! 🎉" />
      </div>
      <div>
        <Label>URL</Label>
        <Input value={c.url} onChange={e => set({ url: e.target.value })} placeholder="https://yoursite.com/offer" />
      </div>
      <div>
        <Label>Button label (optional)</Label>
        <Input value={c.btnLabel} onChange={e => set({ btnLabel: e.target.value })} placeholder="Get It Now →" />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <Toggle on={c.trackClicks} onChange={() => set({ trackClicks: !c.trackClicks })} label="Track link clicks" />
        </div>
      </div>
      <div>
        <Toggle on={c.rewindIfClicked} onChange={() => set({ rewindIfClicked: !c.rewindIfClicked })} label="⏪ Rewind — re-send if link not clicked after 48h" />
      </div>
    </div>
  );
}

function AIReplyFields({ step, update }) {
  const c = step.config || {};
  const set = patch => update({ ...step, config: { ...c, ...patch } });
  const tones = ["Friendly 😊", "Professional 💼", "Casual 😎", "Enthusiastic 🎉", "Empathetic 💙"];
  const DS = useDS();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <Label>System instructions</Label>
        <Input multiline rows={4} value={c.instructions} onChange={e => set({ instructions: e.target.value })} placeholder="You are a helpful assistant for [Brand]. Answer questions about products, keep responses under 3 sentences. If unsure, offer to connect with the team." />
      </div>
      <div>
        <Label>Tone</Label>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {tones.map(t => (
            <button key={t} onClick={() => set({ tone: t })} style={{
              padding: "5px 11px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer",
              border: `1.5px solid ${c.tone === t ? DS.accent : DS.border}`,
              background: c.tone === t ? DS.accentSoft : "#fff",
              color: c.tone === t ? DS.accent : DS.ink2, fontFamily: "inherit",
            }}>{t}</button>
          ))}
        </div>
      </div>
      <div>
        <Label>Max response length</Label>
        <Select value={c.maxLen || "short"} onChange={e => set({ maxLen: e.target.value })} options={[
          { value: "very_short", label: "Very short (1 sentence)" },
          { value: "short", label: "Short (2–3 sentences)" },
          { value: "medium", label: "Medium (1 paragraph)" },
          { value: "long", label: "Long (detailed)" },
        ]} />
      </div>
      <div>
        <Label>Fallback if AI fails</Label>
        <Input value={c.fallback} onChange={e => set({ fallback: e.target.value })} placeholder="Thanks for reaching out! Our team will reply shortly 🙏" />
      </div>
      <Toggle on={c.humanize} onChange={() => set({ humanize: !c.humanize })} label="Humanize — add natural typos & pauses" />
    </div>
  );
}

function ConditionFields({ step, update, allSteps, onSaveStep, onAddStep }) {
  const c = step.config || {};
  const rules = c.rules || [{ field_type: "system", field_name: "first_name", operator: "equals", value: "" }];
  const match_type = c.match_type || "all";
  const DS = useDS();

  const [saving, setSaving] = useState(false);

  const set = patch => update({ ...step, config: { ...c, ...patch } });

  const onUpdateSave = async () => {
    setSaving(true);
    try {
      if (onSaveStep) {
        await onSaveStep(step);
      } else {
        await new Promise(r => setTimeout(r, 600));
      }
      toast.success("Condition updated successfully");
    } catch (e) {
      toast.error("Failed to update condition");
    } finally {
      setSaving(false);
    }
  };

  const updateRule = (idx, patch) => {
    const newRules = [...rules];
    newRules[idx] = { ...newRules[idx], ...patch };
    set({ rules: newRules });
  };

  const addRule = () => set({ rules: [...rules, { field_type: "system", field_name: "first_name", operator: "equals", value: "" }] });
  const removeRule = (idx) => set({ rules: rules.filter((_, i) => i !== idx) });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <Label>Match Type</Label>
        <Select value={match_type} onChange={e => set({ match_type: e.target.value })} options={[
          { value: "all", label: "All conditions must be met (AND)" },
          { value: "any", label: "Any condition can be met (OR)" },
        ]} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {rules.map((rule, i) => (
          <div key={i} style={{ padding: 12, borderRadius: DS.radiusSm, border: `1.5px solid ${DS.border}`, background: DS.bg, position: "relative" }}>
            <div style={{ position: "absolute", top: 8, right: 8 }}>
              <button onClick={() => removeRule(i)} style={{ border: "none", background: "transparent", color: "#DC2626", cursor: "pointer", fontSize: 14 }}>✕</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div>
                <Label>Field Type</Label>
                <div style={{ display: "flex", gap: 4 }}>
                  {["system", "custom"].map(t => (
                    <button key={t} onClick={() => updateRule(i, { field_type: t })} style={{
                      flex: 1, padding: "5px", fontSize: 11, fontWeight: 700, borderRadius: 6, cursor: "pointer",
                      border: `1.5px solid ${rule.field_type === t ? DS.accent : DS.border}`,
                      background: rule.field_type === t ? DS.accentSoft : "#fff",
                      color: rule.field_type === t ? DS.accent : DS.ink3,
                    }}>{t.toUpperCase()}</button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Field Name</Label>
                {rule.field_type === "system" ? (
                  <Select value={rule.field_name} onChange={e => updateRule(i, { field_name: e.target.value })} options={[
                    { value: "first_name", label: "First Name" },
                    { value: "last_name", label: "Last Name" },
                    { value: "username", label: "Username" },
                    { value: "email", label: "Email" },
                    { value: "phone", label: "Phone" },
                  ]} />
                ) : (
                  <Input value={rule.field_name} onChange={e => updateRule(i, { field_name: e.target.value })} placeholder="custom_field_key" />
                )}
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <Label>Operator</Label>
                  <Select value={rule.operator} onChange={e => updateRule(i, { operator: e.target.value })} options={[
                    { value: "=", label: "Equals (=)" },
                    { value: "!=", label: "Not Equals (!=)" },
                    { value: "contains", label: "Contains" },
                    { value: "starts_with", label: "Starts With" },
                    { value: "ends_with", label: "Ends With" },
                    { value: "exists", label: "Has Value" },
                    { value: "greater_than", label: "Greater Than (>)" },
                    { value: "less_than", label: "Less Than (<)" },
                  ]} />
                </div>
                <div style={{ flex: 1 }}>
                  <Label>Value</Label>
                  <Input value={rule.value} onChange={e => updateRule(i, { value: e.target.value })} placeholder="Target value" />
                </div>
              </div>
            </div>
          </div>
        ))}
        <SmallBtn onClick={addRule}>+ Add Rule</SmallBtn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 6 }}>
        <div style={{ background: DS.greenSoft, border: `1.5px solid #86EFAC`, borderRadius: DS.radiusSm, padding: "10px 12px" }}>
          <div style={{ fontSize: 10.5, fontWeight: 800, color: DS.green, marginBottom: 3 }}>✅ IF TRUE</div>
          <Label>Then go to</Label>
          <Select
            value={c.true_step_id || ""}
            onChange={e => {
              const val = e.target.value;
              if (val.startsWith("NEW_")) {
                const newId = onAddStep(val.replace("NEW_", ""));
                set({ true_step_id: newId });
              } else {
                set({ true_step_id: val });
              }
            }}
            options={[
              { value: "", label: "Next step" },
              ...allSteps.filter(s => s.id !== step.id).map(s => ({ value: s.id, label: s.label || s.type })),
              { value: "SEP", label: "--- Create New ---", disabled: true },
              ...ACTIONS.map(a => ({ value: `NEW_${a.id}`, label: `+ Add ${a.label}` }))
            ]}
            style={{ padding: "4px 8px", fontSize: 11 }}
          />
        </div>
        <div style={{ background: "#FFF1F0", border: "1.5px solid #FCA5A5", borderRadius: DS.radiusSm, padding: "10px 12px" }}>
          <div style={{ fontSize: 10.5, fontWeight: 800, color: "#DC2626", marginBottom: 3 }}>✗ IF FALSE</div>
          <Label>Then go to</Label>
          <Select
            value={c.false_step_id || "end"}
            onChange={e => {
              const val = e.target.value;
              if (val.startsWith("NEW_")) {
                const newId = onAddStep(val.replace("NEW_", ""));
                set({ false_step_id: newId });
              } else {
                set({ false_step_id: val });
              }
            }}
            options={[
              { value: "end", label: "End flow" },
              ...allSteps.filter(s => s.id !== step.id).map(s => ({ value: s.id, label: s.label || s.type })),
              { value: "SEP", label: "--- Create New ---", disabled: true },
              ...ACTIONS.map(a => ({ value: `NEW_${a.id}`, label: `+ Add ${a.label}` }))
            ]}
            style={{ padding: "4px 8px", fontSize: 11 }}
          />
        </div>
      </div>

      <button
        onClick={onUpdateSave}
        disabled={saving}
        style={{
          width: "100%", padding: "11px", borderRadius: DS.radiusSm, background: DS.ink, color: "#fff",
          fontSize: 13, fontWeight: 700, border: "none", cursor: saving ? "default" : "pointer", marginTop: 4,
          transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          opacity: saving ? 0.7 : 1
        }}
      >
        {saving ? "Updating..." : <><Save size={14} /> Update Condition Step</>}
      </button>
    </div>
  );
}

function CarouselFields({ step, update, allSteps, onSaveStep, onAddStep }) {
  const c = step.config || {};
  const items = c.carousel_items || [{ title: "New Item", subtitle: "", image_url: "", destination_url: "", buttons: [] }];
  const [activeItemIdx, setActiveItemIdx] = useState(0);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);
  const DS = useDS();

  const set = patch => update({ ...step, config: { ...c, ...patch } });

  const updateItem = (idx, patch) => {
    const ni = [...items];
    ni[idx] = { ...ni[idx], ...patch };
    set({ carousel_items: ni });
  };

  const addItem = () => set({ carousel_items: [...items, { title: "New Item", subtitle: "", image_url: "", destination_url: "", buttons: [] }] });
  const removeItem = (idx) => set({ carousel_items: items.filter((_, i) => i !== idx) });

  const addButton = (itemIdx) => {
    const ni = [...items];
    const item = ni[itemIdx];
    if ((item.buttons || []).length >= 3) return;
    ni[itemIdx] = { ...item, buttons: [...(item.buttons || []), { title: "New Button", action_type: "open_url", action_value: "" }] };
    set({ carousel_items: ni });
  };

  const updateButton = (itemIdx, btnIdx, patch) => {
    const ni = [...items];
    const nb = [...(ni[itemIdx].buttons || [])];
    nb[btnIdx] = { ...nb[btnIdx], ...patch };
    ni[itemIdx] = { ...ni[itemIdx], buttons: nb };
    set({ carousel_items: ni });
  };

  const removeButton = (itemIdx, btnIdx) => {
    const ni = [...items];
    ni[itemIdx] = { ...ni[itemIdx], buttons: ni[itemIdx].buttons.filter((_, i) => i !== btnIdx) };
    set({ carousel_items: ni });
  };

  const onUpdateSave = async () => {
    setSaving(true);
    try {
      if (onSaveStep) {
        await onSaveStep(step);
      } else {
        await new Promise(r => setTimeout(r, 600));
        toast.success("Carousel step updated (local only)");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', 'image');

    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const response = await api.post('/facebook/bot-replies/media/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
          const url = response.data.url || response.data.data?.url || response.data;
          updateItem(activeItemIdx, { image_url: url });
          resolve(file.name);
        } catch (err) { reject(err); }
      }),
      { loading: `Uploading...`, success: `Uploaded!`, error: 'Upload failed' }
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} style={{ display: "none" }} accept="image/*" />
      
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {items.map((item, i) => (
          <div key={i} style={{ 
            background: DS.bg, border: `1.5px solid ${DS.border}`, borderRadius: 20, padding: 16,
            position: "relative"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: DS.ink3 }}>CARD #{i+1}</span>
              <button onClick={() => removeItem(i)} style={{ border: "none", background: "transparent", color: "#EF4444", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>✕ Delete Card</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", gap: 12 }}>
                <div style={{ 
                  width: 90, height: 90, borderRadius: 14, background: item.image_url ? `url(${item.image_url}) center/cover` : DS.card,
                  flexShrink: 0, cursor: "pointer", border: `1.5px solid ${DS.border}`, display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.04)"
                }} onClick={() => { setActiveItemIdx(i); setTimeout(() => fileInputRef.current?.click(), 10); }}>
                  {!item.image_url && <Upload size={22} color={DS.ink3} />}
                </div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                  <Input value={item.title} onChange={e => updateItem(i, { title: e.target.value })} placeholder="Card Title" />
                  <Input value={item.subtitle} onChange={e => updateItem(i, { subtitle: e.target.value })} placeholder="Subtitle (optional)" />
                </div>
              </div>

              <div>
                <Label>Destination (Card Click)</Label>
                <Input value={item.destination_url} onChange={e => updateItem(i, { destination_url: e.target.value })} placeholder="https://..." />
              </div>

              <div style={{ marginTop: 6, padding: "12px", background: DS.card, borderRadius: 14, border: `1px solid ${DS.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: DS.ink2 }}>Buttons ({item.buttons?.length || 0}/3)</span>
                  {(item.buttons?.length || 0) < 3 && (
                    <button onClick={() => addButton(i)} style={{ fontSize: 10.5, fontWeight: 800, color: DS.accent, border: "none", background: "transparent", cursor: "pointer" }}>+ ADD BUTTON</button>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {item.buttons?.map((btn, bi) => (
                    <div key={bi} style={{ background: DS.bg, border: `1.5px solid ${DS.border}`, borderRadius: 12, padding: 10 }}>
                      <div style={{ display: "flex", gap: 6, marginBottom: 8, alignItems: "center" }}>
                        <input value={btn.title} onChange={e => updateButton(i, bi, { title: e.target.value })} style={{ flex: 1, border: "none", background: "transparent", fontSize: 13, fontWeight: 700, outline: "none", color: DS.ink }} placeholder="Btn Label" />
                        <button onClick={() => removeButton(i, bi)} style={{ border: "none", background: "transparent", color: DS.ink3, cursor: "pointer", padding: "0 4px" }}>✕</button>
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Select value={btn.action_type} onChange={e => updateButton(i, bi, { action_type: e.target.value })} options={[
                          { value: "send_message", label: "Message" },
                          { value: "open_url", label: "Open URL" },
                          { value: "postback_action", label: "Trigger" },
                        ]} style={{ flex: 0.6, height: 32, fontSize: 11.5 }} />
                        
                        {btn.action_type === "send_message" ? (
                          <Select value={btn.action_value} onChange={e => {
                            const val = e.target.value;
                            if (val.startsWith("NEW_")) {
                              const nid = onAddStep(val.replace("NEW_", ""));
                              updateButton(i, bi, { action_value: nid });
                            } else updateButton(i, bi, { action_value: val });
                          }} options={[
                            { value: "", label: "Link to Step..." },
                            ...allSteps.filter(s => s.id !== step.id).map(s => ({ value: s.id, label: s.label || s.type })),
                            ...ACTIONS.map(a => ({ value: `NEW_${a.id}`, label: `+ ${a.label}` }))
                          ]} style={{ flex: 1, height: 32, fontSize: 11.5 }} />
                        ) : (
                          <Input value={btn.action_value} onChange={e => updateButton(i, bi, { action_value: e.target.value })} placeholder="value..." style={{ flex: 1, height: 32, fontSize: 11.5 }} />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button onClick={addItem} style={{ width: "100%", padding: "14px", borderRadius: 18, border: `2px dashed ${DS.border}`, background: "#fff", color: DS.ink3, fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.borderColor = DS.accent} onMouseLeave={e => e.currentTarget.style.borderColor = DS.border}>+ ADD ANOTHER CARD</button>

      <button onClick={onUpdateSave} disabled={saving} style={{ 
        width: "100%", padding: "12px", borderRadius: DS.radiusSm, background: DS.ink, color: "#fff", fontSize: 13.5, fontWeight: 700, border: "none", cursor: saving ? "default" : "pointer", 
        display: "flex", alignItems: "center", justifyContent: "center", gap: 7, opacity: saving ? 0.7 : 1, transition: "all 0.2s" 
      }} onMouseEnter={e => { if(!saving) e.currentTarget.style.opacity = 0.9 }} onMouseLeave={e => { if(!saving) e.currentTarget.style.opacity = 1 }}>
        {saving ? "Updating..." : <><Save size={15} /> Update Carousel Step</>}
      </button>
    </div>
  );
}

function UserInputFields({ step, update, allSteps, onSaveStep, onAddStep }) {
  const c = step.config || {};
  const set = patch => update({ ...step, config: { ...c, ...patch } });
  const DS = useDS();
  const [saving, setSaving] = useState(false);

  const onUpdateSave = async () => {
    setSaving(true);
    try {
      if (onSaveStep) {
        await onSaveStep(step);
      } else {
        await new Promise(r => setTimeout(r, 600));
      }
      toast.success("User input updated successfully");
    } catch (e) {
      toast.error("Failed to update step");
    } finally {
      setSaving(false);
    }
  };

  const updateBtn = (bi, patch) => {
    const btns = [...(c.buttons || [])];
    btns[bi] = { ...btns[bi], ...patch };
    set({ buttons: btns });
  };
  const addBtn = () => set({ buttons: [...(c.buttons || []), { label: "New Button", action_type: "send_message", action_value: "" }] });
  const remBtn = (bi) => set({ buttons: (c.buttons || []).filter((_, i) => i !== bi) });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <Label>Question to ask user</Label>
        <Input
          multiline
          rows={3}
          value={c.question || ""}
          onChange={e => set({ question: e.target.value })}
          placeholder="e.g. What is your phone number?"
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <Label>Input Type</Label>
          <Select
            value={c.input_type || "text"}
            onChange={e => set({ input_type: e.target.value })}
            options={[
              { value: "text", label: "Free Text" },
              { value: "email", label: "Email" },
              { value: "phone", label: "Phone" },
              { value: "number", label: "Number" },
              { value: "custom", label: "Custom Regex" },
            ]}
          />
        </div>
        <div>
          <Label>Validation Rule</Label>
          <Select
            value={c.validation || "text"}
            onChange={e => set({ validation: e.target.value })}
            options={[
              { value: "text", label: "No Validation" },
              { value: "email", label: "Check Email Format" },
              { value: "phone", label: "Check Phone Format" },
              { value: "number", label: "Check is Numeric" },
            ]}
          />
        </div>
      </div>

      <div>
        <Label>Save to Field (Name)</Label>
        <Input
          value={c.save_to || ""}
          onChange={e => set({ save_to: e.target.value })}
          placeholder="e.g. email, favorite_food"
        />
        <div style={{ fontSize: 10, color: DS.ink3, marginTop: 4 }}>
          System fields: email, phone. Others will be saved as custom fields.
        </div>
      </div>

      <div>
        <Label>Retry Message (if invalid)</Label>
        <Input
          value={c.retry_message || ""}
          onChange={e => set({ retry_message: e.target.value })}
          placeholder="e.g. That doesn't look like a valid email. Please try again."
        />
      </div>

      <div>
        <Label>Next Step after valid input</Label>
        <Select
          value={c.next_step_id || "end"}
          onChange={e => {
            const val = e.target.value;
            if (val.startsWith("NEW_")) {
              const newId = onAddStep(val.replace("NEW_", ""));
              set({ next_step_id: newId });
            } else {
              set({ next_step_id: val });
            }
          }}
          options={[
            { value: "end", label: "End Flow" },
            ...allSteps.filter(s => s.id !== step.id).map(s => ({ value: s.id, label: s.label || s.type })),
            { value: "SEP", label: "--- Create New ---", disabled: true },
            ...ACTIONS.map(a => ({ value: `NEW_${a.id}`, label: `+ Add ${a.label}` }))
          ]}
        />
      </div>

      <div style={{ marginTop: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <Label style={{ margin: 0 }}>Quick Replies ({c.buttons?.length || 0}/10)</Label>
          {(c.buttons?.length || 0) < 10 && (
            <button onClick={addBtn} style={{ fontSize: 10, padding: "4px 10px", borderRadius: 8, background: DS.accent, color: "#fff", border: "none", cursor: "pointer", fontWeight: 800 }}>+ ADD</button>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(c.buttons || []).map((btn, bi) => (
            <div key={bi} style={{ background: DS.bg, border: `1px solid ${DS.border}`, borderRadius: 12, padding: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "center" }}>
                <input
                  value={btn.label}
                  onChange={e => updateBtn(bi, { label: e.target.value })}
                  style={{ border: "none", background: "transparent", fontSize: 12, fontWeight: 800, width: "100%", outline: "none", color: DS.ink }}
                  placeholder="Button Label"
                />
                <button onClick={() => remBtn(bi)} style={{ border: "none", background: "transparent", color: DS.ink3, cursor: "pointer", fontSize: 14 }}>✕</button>
              </div>
              <Select
                value={btn.action_value}
                onChange={e => {
                  const val = e.target.value;
                  if (val.startsWith("NEW_")) {
                    const newId = onAddStep(val.replace("NEW_", ""));
                    updateBtn(bi, { action_value: newId });
                  } else {
                    updateBtn(bi, { action_value: val });
                  }
                }}
                options={[
                  { value: "", label: "Link to step..." },
                  ...allSteps.filter(s => s.id !== step.id).map(s => ({ value: s.id, label: s.label || s.type })),
                  { value: "SEP", label: "--- Create New ---", disabled: true },
                  ...ACTIONS.map(a => ({ value: `NEW_${a.id}`, label: `+ Add ${a.label}` }))
                ]}
              />
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: DS.bg, borderRadius: DS.radiusSm, border: `1.5px solid ${DS.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>⚡</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: DS.ink }}>Typing Indicator</span>
        </div>
        <Toggle on={c.typing} onChange={() => set({ typing: !c.typing })} />
      </div>

      <div style={{ display: "flex", border: `1.5px solid ${DS.border}`, borderRadius: DS.radiusSm, overflow: "hidden", height: 38 }}>
        <div style={{ display: "flex", alignItems: "center", padding: "0 14px", background: DS.bg, borderRight: `1.5px solid ${DS.border}`, fontSize: 12, fontWeight: 700, color: DS.ink3 }}>Delay</div>
        <input
          type="number"
          value={c.delaySec || ""}
          onChange={e => set({ delaySec: e.target.value })}
          placeholder="Sec"
          style={{ flex: 1, border: "none", background: "transparent", padding: "0 12px", fontSize: 13, color: DS.ink, outline: "none", borderRight: `1.5px solid ${DS.border}` }}
        />
        <input
          type="number"
          value={c.delayMin || ""}
          onChange={e => set({ delayMin: e.target.value })}
          placeholder="Min"
          style={{ flex: 1, border: "none", background: "transparent", padding: "0 12px", fontSize: 13, color: DS.ink, outline: "none" }}
        />
      </div>

      <button
        onClick={onUpdateSave}
        disabled={saving}
        style={{
          width: "100%", padding: "11px", borderRadius: DS.radiusSm, background: DS.ink, color: "#fff",
          fontSize: 13, fontWeight: 700, border: "none", cursor: saving ? "default" : "pointer", marginTop: 4,
          transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          opacity: saving ? 0.7 : 1
        }}
      >
        {saving ? "Updating..." : <><Save size={14} /> Update User Input Step</>}
      </button>
    </div>
  );
}

function HTTPAPIFields({ step, update }) {
  const c = step.config || {};
  const set = patch => update({ ...step, config: { ...c, ...patch } });
  const DS = useDS();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <Label>Request method</Label>
        <Select value={c.method || "POST"} onChange={e => set({ method: e.target.value })} options={[
          { value: "GET", label: "GET" }, { value: "POST", label: "POST" }, { value: "PUT", label: "PUT" }, { value: "DELETE", label: "DELETE" },
        ]} />
      </div>
      <div>
        <Label>API URL</Label>
        <Input value={c.url} onChange={e => set({ url: e.target.value })} placeholder="https://api.yourservice.com/v1/collect" />
      </div>
      <div>
        <Label>Headers (JSON)</Label>
        <Input multiline rows={2} value={c.headers} onChange={e => set({ headers: e.target.value })} placeholder='{"Authorization": "Bearer token", "Content-Type": "application/json"}' />
      </div>
      <div>
        <Label>Request Body (JSON)</Label>
        <Input multiline rows={3} value={c.body} onChange={e => set({ body: e.target.value })} placeholder='{"user_id": "{username}", "event": "flow_triggered"}' />
      </div>
    </div>
  );
}

function GoogleSheetsFields({ step, update }) {
  const c = step.config || {};
  const set = patch => update({ ...step, config: { ...c, ...patch } });
  const DS = useDS();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ background: DS.accentSoft, padding: 12, borderRadius: DS.radiusSm, border: `1.5px solid ${DS.accentBorder}`, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 20 }}>📊</span>
        <div style={{ fontSize: 12, fontWeight: 700, color: DS.accent }}>Connected to Google Account: anshul@example.com</div>
      </div>
      <div>
        <Label>Select Spreadsheet</Label>
        <Select value={c.spreadsheet_id} onChange={e => set({ spreadsheet_id: e.target.value })} options={[
          { value: "s1", label: "Lead Tracking 2024" },
          { value: "s2", label: "Customer Feedback" },
          { value: "s3", label: "Order List" },
        ]} />
      </div>
      <div>
        <Label>Worksheet</Label>
        <Select value={c.worksheet} onChange={e => set({ worksheet: e.target.value })} options={[
          { value: "Sheet1", label: "Sheet1" },
          { value: "responses", label: "Responses" },
        ]} />
      </div>
      <div>
        <Label>Column Mapping (Values to send)</Label>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, width: 80 }}>A: Date</span>
            <Input value="{date}" disabled style={{ flex: 1, background: DS.bg }} />
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, width: 80 }}>B: Name</span>
            <Input value="{first_name}" disabled style={{ flex: 1, background: DS.bg }} />
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ fontSize: 11, fontWeight: 700, width: 80 }}>C: Answer</span>
            <Input value={c.col3 || "{last_reply}"} onChange={e => set({ col3: e.target.value })} style={{ flex: 1 }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function DelayFields({ step, update }) {
  const c = step.config || {};
  const set = patch => update({ ...step, config: { ...c, ...patch } });
  const DS = useDS();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <Label>Wait duration</Label>
        <div style={{ display: "flex", gap: 8 }}>
          <Input type="number" value={c.duration} onChange={e => set({ duration: e.target.value })} placeholder="5" style={{ flex: 1 }} />
          <Select value={c.unit || "minutes"} onChange={e => set({ unit: e.target.value })} style={{ flex: 1 }} options={[
            { value: "seconds", label: "Seconds" }, { value: "minutes", label: "Minutes" },
            { value: "hours", label: "Hours" }, { value: "days", label: "Days" },
          ]} />
        </div>
      </div>
      <div style={{ background: DS.amberSoft, border: `1.5px solid #FCD34D`, borderRadius: DS.radiusSm, padding: "9px 12px", fontSize: 12, color: DS.amber }}>
        💡 Short delays (1–5 min) make automations feel more human and reduce spam detection risk
      </div>
    </div>
  );
}

function TagFields({ step, update }) {
  const c = step.config || {};
  const set = patch => update({ ...step, config: { ...c, ...patch } });
  const tags = (c.tags || "").split(",").map(t => t.trim()).filter(Boolean);
  const DS = useDS();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <Label hint="comma-separated">Tags to apply</Label>
        <Input value={c.tags} onChange={e => set({ tags: e.target.value })} placeholder="lead, interested, funnel-a" />
        {tags.length > 0 && (
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 7 }}>
            {tags.map((t, i) => <Tag key={i} color={DS.green} bg={DS.greenSoft}>{t}</Tag>)}
          </div>
        )}
      </div>
      <div>
        <Label>Tags to remove (optional)</Label>
        <Input value={c.removeTags} onChange={e => set({ removeTags: e.target.value })} placeholder="unqualified, cold-lead" />
      </div>
    </div>
  );
}

function CollectEmailFields({ step, update }) {
  const c = step.config || {};
  const set = patch => update({ ...step, config: { ...c, ...patch } });
  const DS = useDS();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <Label>Prompt message</Label>
        <Input value={c.prompt} onChange={e => set({ prompt: e.target.value })} placeholder="Drop your best email for weekly tips 📩" />
      </div>
      <div>
        <Label>Error message (if invalid)</Label>
        <Input value={c.errorMsg} onChange={e => set({ errorMsg: e.target.value })} placeholder="Hmm, that doesn't look right. Try again?" />
      </div>
      <div>
        <Label>Save to field</Label>
        <Input value={c.fieldName || "email"} onChange={e => set({ fieldName: e.target.value })} placeholder="email" />
      </div>
      <Toggle on={c.required} onChange={() => set({ required: !c.required })} label="Required — don't proceed until valid email received" />
    </div>
  );
}

function FollowGateFields({ step, update }) {
  const c = step.config || {};
  const set = patch => update({ ...step, config: { ...c, ...patch } });
  const DS = useDS();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <Label>If they don't follow</Label>
        <Select value={c.onFail || "ask"} onChange={e => set({ onFail: e.target.value })} options={[
          { value: "ask", label: "Ask them to follow first" },
          { value: "skip", label: "Skip gate, continue anyway" },
          { value: "end", label: "End the flow" },
        ]} />
      </div>
      {c.onFail === "ask" && (
        <div>
          <Label>Message to send</Label>
          <Input value={c.askText} onChange={e => set({ askText: e.target.value })} placeholder="Follow me first to unlock this! 🔒" />
        </div>
      )}
      <div style={{ background: DS.blueSoft, border: `1.5px solid #BAE6FD`, borderRadius: DS.radiusSm, padding: "9px 12px", fontSize: 12, color: DS.blue }}>
        🛡️ Follow Gate helps prevent non-followers from draining your DM quota
      </div>
    </div>
  );
}

function HandoffFields({ step, update }) {
  const c = step.config || {};
  const set = patch => update({ ...step, config: { ...c, ...patch } });
  const DS = useDS();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <Label>Message before handoff</Label>
        <Input value={c.message} onChange={e => set({ message: e.target.value })} placeholder="Connecting you with our team now! 👥" />
      </div>
      <div>
        <Label>Assign to</Label>
        <Select value={c.assignTo || "any"} onChange={e => set({ assignTo: e.target.value })} options={[
          { value: "any", label: "Any available agent" },
          { value: "team", label: "Sales team" },
          { value: "owner", label: "Account owner only" },
        ]} />
      </div>
      <div>
        <Label>Notify via</Label>
        <Select value={c.notifyVia || "email"} onChange={e => set({ notifyVia: e.target.value })} options={[
          { value: "email", label: "Email notification" },
          { value: "slack", label: "Slack message" },
          { value: "sms", label: "SMS alert" },
          { value: "none", label: "No notification" },
        ]} />
      </div>
    </div>
  );
}

function ZapierFields({ step, update }) {
  const c = step.config || {};
  const set = patch => update({ ...step, config: { ...c, ...patch } });
  const DS = useDS();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <Label>Webhook URL</Label>
        <Input value={c.webhook} onChange={e => set({ webhook: e.target.value })} placeholder="https://hooks.zapier.com/..." />
      </div>
      <div>
        <Label>Label (internal)</Label>
        <Input value={c.label} onChange={e => set({ label: e.target.value })} placeholder="Add to Klaviyo list" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 5 }}>
        {["Klaviyo", "Mailchimp", "HubSpot", "Shopify", "Google Sheets", "Slack"].map(i => (
          <button key={i} onClick={() => set({ integrationLabel: i })} style={{
            padding: "5px 0", borderRadius: DS.radiusSm, border: `1.5px solid ${c.integrationLabel === i ? DS.accent : DS.border}`,
            background: c.integrationLabel === i ? DS.accentSoft : "#fff", color: c.integrationLabel === i ? DS.accent : DS.ink2,
            fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
          }}>{i}</button>
        ))}
      </div>
    </div>
  );
}

function EndFields({ step, update }) {
  const c = step.config || {};
  const set = patch => update({ ...step, config: { ...c, ...patch } });
  const DS = useDS();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <Label>Final message (optional)</Label>
        <Input value={c.note} onChange={e => set({ note: e.target.value })} placeholder="Thanks for chatting! 🙏" />
      </div>
      <div>
        <Label>Mark as</Label>
        <Select value={c.outcome || "completed"} onChange={e => set({ outcome: e.target.value })} options={[
          { value: "completed", label: "✅ Completed" },
          { value: "converted", label: "💰 Converted" },
          { value: "unqualified", label: "✗ Unqualified" },
          { value: "escalated", label: "👥 Escalated to human" },
        ]} />
      </div>
    </div>
  );
}

function RandomSplitFields({ step, update }) {
  const c = step.config || {};
  const set = patch => update({ ...step, config: { ...c, ...patch } });
  const DS = useDS();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <Label>Split ratio (A / B)</Label>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Input type="number" value={c.ratioA || 50} onChange={e => set({ ratioA: e.target.value })} style={{ flex: 1 }} />
          <span style={{ color: DS.ink3, fontWeight: 700 }}>/</span>
          <div style={{ flex: 1, padding: "9px 12px", borderRadius: DS.radiusSm, border: `1.5px solid ${DS.border}`, background: DS.bg, fontSize: 13, color: DS.ink2 }}>
            {100 - (parseInt(c.ratioA) || 50)}%
          </div>
        </div>
      </div>
      <div style={{ background: DS.amberSoft, border: `1.5px solid #FCD34D`, borderRadius: DS.radiusSm, padding: "9px 12px", fontSize: 12, color: DS.amber }}>
        🎲 A/B splits are great for testing which message converts better. Check Analytics after 100+ triggers.
      </div>
    </div>
  );
}

function MediaFields({ step, update, onSaveStep }) {
  const c = step.config || {};
  const set = patch => update({ ...step, config: { ...c, ...patch } });
  const DS = useDS();
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const info = {
    image: { label: "Image URL", icon: ImageIcon },
    video: { label: "Video URL", icon: Play },
    audio: { label: "Audio URL", icon: Mic },
    file: { label: "File URL", icon: File }
  }[step.type] || { label: "Media URL", icon: ImageIcon };

  const onLocalSave = async () => {
    setSaving(true);
    if (onSaveStep) {
      await onSaveStep(step);
    } else {
      await new Promise(r => setTimeout(r, 600));
    }
    setSaving(false);
    toast.success(`${step.type.charAt(0).toUpperCase() + step.type.slice(1)} step updated`);
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', step.type);

    toast.promise(
      new Promise(async (resolve, reject) => {
        try {
          const response = await api.post('/facebook/bot-replies/media/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          const uploadedUrl = response.data.url || response.data.data?.url || response.data;
          set({ url: uploadedUrl });
          resolve(file.name);
        } catch (err) {
          console.error("Upload Error:", err);
          reject(err);
        }
      }),
      {
        loading: `Uploading ${file.name}...`,
        success: (name) => `Successfully uploaded ${name}`,
        error: 'Upload failed',
      }
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        style={{ display: "none" }}
        accept={step.type === 'image' ? 'image/*' : step.type === 'video' ? 'video/*' : step.type === 'audio' ? 'audio/*' : '*'}
      />
      <div>
        <Label>{info.label}</Label>
        <div style={{ display: "flex", gap: 8 }}>
          <Input
            value={c.url || ""}
            onChange={e => set({ url: e.target.value })}
            placeholder="https://..."
            style={{ flex: 1 }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: "0 16px", borderRadius: DS.radiusSm, border: `1.5px solid ${DS.border}`,
              background: DS.bg, color: DS.ink, fontSize: 13, fontWeight: 600,
              display: "flex", alignItems: "center", gap: 6, cursor: "pointer", whiteSpace: "nowrap"
            }}>
            <Upload size={16} /> Upload
          </button>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: DS.bg, borderRadius: DS.radiusSm, border: `1.5px solid ${DS.border}` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 16 }}>⚡</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: DS.ink }}>Typing Indicator</span>
        </div>
        <Toggle on={c.typing} onChange={() => set({ typing: !c.typing })} />
      </div>

      <div style={{ display: "flex", border: `1.5px solid ${DS.border}`, borderRadius: DS.radiusSm, overflow: "hidden", height: 38 }}>
        <div style={{ display: "flex", alignItems: "center", padding: "0 14px", background: DS.bg, borderRight: `1.5px solid ${DS.border}`, fontSize: 12, fontWeight: 700, color: DS.ink3 }}>Delay</div>
        <input
          type="number"
          value={c.delaySec || ""}
          onChange={e => set({ delaySec: e.target.value })}
          placeholder="Sec"
          style={{ flex: 1, border: "none", background: "transparent", padding: "0 12px", fontSize: 13, color: DS.ink, outline: "none", borderRight: `1.5px solid ${DS.border}` }}
        />
        <input
          type="number"
          value={c.delayMin || ""}
          onChange={e => set({ delayMin: e.target.value })}
          placeholder="Min"
          style={{ flex: 1, border: "none", background: "transparent", padding: "0 12px", fontSize: 13, color: DS.ink, outline: "none" }}
        />
      </div>

      <button
        onClick={onLocalSave}
        disabled={saving}
        style={{
          width: "100%", padding: "11px", borderRadius: DS.radiusSm, background: DS.ink, color: "#fff",
          fontSize: 13, fontWeight: 700, border: "none", cursor: saving ? "default" : "pointer", marginTop: 4,
          transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          opacity: saving ? 0.7 : 1
        }}
        onMouseEnter={e => { if (!saving) e.currentTarget.style.opacity = "0.9"; }}
        onMouseLeave={e => { if (!saving) e.currentTarget.style.opacity = "1"; }}
      >
        {saving ? "Updating..." : <><Save size={14} /> Update Media Step</>}
      </button>
    </div>
  );
}

function CheckTagFields({ step, update }) {
  const c = step.config || {};
  const set = patch => update({ ...step, config: { ...c, ...patch } });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <Label>Tag to check</Label>
        <Input value={c.tag} onChange={e => set({ tag: e.target.value })} placeholder="lead, vip, interested" />
      </div>
      <div>
        <Label>If tag NOT found</Label>
        <Select value={c.onMissing || "end"} onChange={e => set({ onMissing: e.target.value })} options={[
          { value: "end", label: "End flow" },
          { value: "skip", label: "Skip to last step" },
        ]} />
      </div>
    </div>
  );
}

function TriggerActionFields({ step, update, onSaveStep }) {
  const c = step.config || {};
  const set = patch => update({ ...step, config: { ...c, ...patch } });
  const [saving, setSaving] = useState(false);
  const DS = useDS();

  const onUpdateSave = async () => {
    setSaving(true);
    if (onSaveStep) {
      await onSaveStep(step);
    } else {
      await new Promise(r => setTimeout(r, 600));
    }
    setSaving(false);
    toast.success("Trigger action step updated");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <Label>Action Label (Internal)</Label>
        <Input value={c.label} onChange={e => set({ label: e.target.value })} placeholder="User joined funnel" />
      </div>
      <div>
        <Label>Postback Payload</Label>
        <Input value={c.payload} onChange={e => set({ payload: e.target.value })} placeholder="trigger_funnel_a" />
      </div>

      <button
        onClick={onUpdateSave}
        disabled={saving}
        style={{
          width: "100%", padding: "11px", borderRadius: DS.radiusSm, background: DS.ink, color: "#fff",
          fontSize: 13, fontWeight: 700, border: "none", cursor: saving ? "default" : "pointer", marginTop: 4,
          transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
          opacity: saving ? 0.7 : 1
        }}
      >
        {saving ? "Updating..." : <><Save size={14} /> Update Trigger Step</>}
      </button>
    </div>
  );
}

function SetFieldFields({ step, update }) {
  const c = step.config || {};
  const set = patch => update({ ...step, config: { ...c, ...patch } });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <Label>Field name</Label>
        <Input value={c.fieldName} onChange={e => set({ fieldName: e.target.value })} placeholder="source, plan, score" />
      </div>
      <div>
        <Label>Value to set</Label>
        <Input value={c.fieldValue} onChange={e => set({ fieldValue: e.target.value })} placeholder="instagram-funnel" />
      </div>
    </div>
  );
}

function NotifyTeamFields({ step, update }) {
  const c = step.config || {};
  const set = patch => update({ ...step, config: { ...c, ...patch } });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <Label>Notification message</Label>
        <Input value={c.message} onChange={e => set({ message: e.target.value })} placeholder="New hot lead from Instagram flow! 🔥" />
      </div>
      <div>
        <Label>Send via</Label>
        <Select value={c.via || "email"} onChange={e => set({ via: e.target.value })} options={[
          { value: "email", label: "Email" }, { value: "slack", label: "Slack" },
          { value: "sms", label: "SMS" }, { value: "push", label: "Push notification" },
        ]} />
      </div>
    </div>
  );
}

function AIClassifyFields({ step, update }) {
  const c = step.config || {};
  const set = patch => update({ ...step, config: { ...c, ...patch } });
  const DS = useDS();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <Label>Categories to detect</Label>
        <Input value={c.categories} onChange={e => set({ categories: e.target.value })} placeholder="interested, not-interested, needs-support, spam" />
      </div>
      <div>
        <Label>Save result to tag</Label>
        <Toggle on={c.saveAsTag} onChange={() => set({ saveAsTag: !c.saveAsTag })} label="Auto-tag contact with detected category" />
      </div>
      <div style={{ background: DS.blueSoft, border: `1.5px solid #BAE6FD`, borderRadius: DS.radiusSm, padding: "9px 12px", fontSize: 12, color: DS.blue }}>
        🧠 AI Classify detects user intent and routes to different flow branches automatically
      </div>
    </div>
  );
}

function StepFields({ step, update, allSteps, onSaveStep, onAddStep }) {
  const props = { step, update, allSteps, onSaveStep, onAddStep };
  const DS = useDS();
  if (step.kind === "trigger") return <div style={{ fontSize: 12, color: DS.ink3 }}>Click to configure trigger</div>;
  const map = {
    message: MessageFields,
    image: MediaFields, video: MediaFields, audio: MediaFields, file: MediaFields,
    carousel: CarouselFields, user_input: UserInputFields, condition: ConditionFields,
    trigger_action: TriggerActionFields,
  };
  const Comp = map[step.type];
  return Comp ? <Comp {...props} /> : <div style={{ fontSize: 12, color: DS.ink3 }}>Configure this step</div>;
}

/* ============================================================
   STEP CARD
   ============================================================ */
function StepSummary({ step }) {
  const DS = useDS();
  const c = step.config || {};
  const m = {
    message: c.text?.slice(0, 40),
    image: c.url?.slice(0, 40),
    video: c.url?.slice(0, 40),
    audio: c.url?.slice(0, 40),
    file: c.url?.slice(0, 40),
    carousel: `${(c.carousel || []).length} cards`,
    user_input: c.question?.slice(0, 40),
    condition: (c.rules || []).map(r => r.field_name).join(", "),
  };
  const txt = m[step.type];
  return <span style={{ color: DS.ink3 }}>{txt ? (txt.length > 40 ? txt.slice(0, 40) + "…" : txt) : "Click to configure"}</span>;
}

function StepCard({ step, index, total, allSteps, expanded, onToggle, onUpdate, onDelete, onDup, onMoveUp, onMoveDown, onSaveStep, onAddStep }) {
  const DS = useDS();
  const def = getDef(step.kind, step.type);
  const color = step.kind === "trigger" ? def.color : DS.ink;
  const isFirst = index === 0, isLast = index === total - 1;
  const isTrigger = step.kind === "trigger";

  return (
    <div style={{ position: "relative" }}>
      {!isLast && (
        <div style={{
          position: "absolute", left: 27, bottom: -14, width: 2, height: 14, zIndex: 0,
          background: `linear-gradient(${DS.accent}40, ${DS.accent}15)`,
        }} />
      )}
      <div style={{
        background: DS.card, borderRadius: DS.radius, overflow: "hidden", position: "relative", zIndex: 1,
        border: expanded ? `2px solid ${DS.ink}` : `1.5px solid ${DS.border}`,
        boxShadow: expanded ? `0 0 0 4px rgba(0,0,0,0.07), ${DS.shadowHover}` : DS.shadowCard,
        transition: "all 0.15s",
      }}>
        {/* HEADER */}
        <div onClick={onToggle} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", cursor: "pointer", userSelect: "none" }}>
          {/* Step number */}
          <div style={{
            width: 22, height: 22, borderRadius: 7, fontSize: 11, fontWeight: 800, flexShrink: 0, transition: "all 0.15s",
            background: expanded ? DS.ink : DS.bg,
            color: expanded ? "#fff" : DS.ink3,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{index + 1}</div>

          {/* Icon */}
          <div style={{
            width: 38, height: 38, borderRadius: 11, flexShrink: 0,
            background: DS.bg,
            border: `1.5px solid ${DS.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: DS.ink
          }}>
            {typeof def.icon === 'string' ? def.icon : <def.icon size={20} />}
          </div>

          {/* Name & summary */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                value={step.label}
                onClick={e => e.stopPropagation()}
                onChange={e => onUpdate({ ...step, label: e.target.value })}
                style={{ border: "none", background: "transparent", fontSize: 13.5, fontWeight: 700, color: DS.ink, outline: "none", fontFamily: "inherit", minWidth: 0, flex: 1 }}
              />
            </div>
            {!expanded && (
              <div style={{ fontSize: 12, marginTop: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                <StepSummary step={step} />
              </div>
            )}
          </div>

          {/* Controls */}
          <div style={{ display: "flex", gap: 3, flexShrink: 0 }}>
            {!isFirst && <IconBtn onClick={e => { e.stopPropagation(); onMoveUp(); }} title="Move up">↑</IconBtn>}
            {!isLast && <IconBtn onClick={e => { e.stopPropagation(); onMoveDown(); }} title="Move down">↓</IconBtn>}
            <IconBtn onClick={e => { e.stopPropagation(); onDup(); }} title="Duplicate">⊕</IconBtn>
            <IconBtn onClick={e => { e.stopPropagation(); onDelete(); }} danger title="Delete">✕</IconBtn>
          </div>
        </div>

        {/* EXPANDED BODY */}
        {expanded && (
          <div style={{ borderTop: `1px solid ${DS.border}`, padding: "16px 16px 18px" }}>
            <StepFields step={step} update={onUpdate} allSteps={allSteps} onSaveStep={onSaveStep} onAddStep={onAddStep} />
          </div>
        )}
      </div>
    </div>
  );
}

function IconBtn({ children, onClick, danger, title }) {
  const DS = useDS();
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} title={title}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        width: 26, height: 26, borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700,
        border: `1.5px solid ${danger && hov ? "#FCA5A5" : DS.border}`,
        background: danger && hov ? "#FFF1F0" : hov ? DS.bg : "transparent",
        color: danger ? (hov ? "#DC2626" : DS.ink3) : hov ? DS.ink : DS.ink3,
        display: "inline-flex", alignItems: "center", justifyContent: "center", transition: "all 0.1s",
      }}>{children}</button>
  );
}

/* ============================================================
   ADD ACTION PICKER
   ============================================================ */
function AddActionPicker({ onAdd, isCreating }) {
  const DS = useDS();
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(true)} style={{
        width: "100%", padding: 16, borderRadius: 20, cursor: "pointer",
        border: `2px solid ${DS.accent}`, background: DS.accentSoft,
        color: DS.accent, fontSize: 15, fontWeight: 800, fontFamily: "inherit",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 10, transition: "all 0.2s",
        boxShadow: "0 4px 12px rgba(6,182,212,0.15)",
      }}
        onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 6px 16px rgba(6,182,212,0.25)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(6,182,212,0.15)"; }}
      >
        <Plus size={20} strokeWidth={3} /> Add New Step
      </button>

      {open && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={() => setOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(15,23,42,0.6)", backdropFilter: "blur(8px)" }} />
          <div style={{
            position: "relative", width: 480, maxWidth: "100%", background: "#fff", borderRadius: 32,
            boxShadow: "0 40px 100px -20px rgba(0,0,0,0.35)", overflow: "hidden", border: "1px solid rgba(0,0,0,0.05)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "24px 28px", borderBottom: `1px solid ${DS.border}` }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 900, color: DS.ink, letterSpacing: "-0.02em" }}>Choose Step Type</div>
                <div style={{ fontSize: 12, color: DS.ink3, marginTop: 2 }}>Select the next action for your flow</div>
              </div>
              <button onClick={() => setOpen(false)} style={{ border: "none", background: DS.bg, width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: DS.ink3 }}><X size={18} /></button>
            </div>

            <div style={{ padding: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              {ACTIONS.map(a => (
                <button
                  key={a.id}
                  onClick={async () => { 
                    if (!isCreating) {
                      await onAdd(a.id); 
                      setOpen(false); 
                    }
                  }} 
                  disabled={isCreating}
                  style={{
                    display: "flex", alignItems: "center", gap: 14, height: 64, padding: "0 18px", borderRadius: 20,
                    border: `1.5px solid ${DS.border}`, background: "#fff", cursor: isCreating ? "wait" : "pointer", textAlign: "left", fontFamily: "inherit",
                    transition: "all 0.15s", opacity: isCreating ? 0.7 : 1,
                  }}
                  onMouseEnter={e => { if(!isCreating) { e.currentTarget.style.borderColor = DS.accent; e.currentTarget.style.background = DS.accentSoft; e.currentTarget.style.transform = "scale(1.02)"; } }}
                  onMouseLeave={e => { if(!isCreating) { e.currentTarget.style.borderColor = DS.border; e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = "none"; } }}
                >
                  <div style={{ width: 36, height: 36, borderRadius: 12, background: DS.bg, display: "flex", alignItems: "center", justifyContent: "center", color: DS.ink }}>
                    <a.icon size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: DS.ink }}>{a.label}</div>
                    <div style={{ fontSize: 10, color: DS.ink3, marginTop: 1 }}>{a.desc.slice(0, 24)}...</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// buildPreviewMsgs already updated

/* ============================================================
   PHONE PREVIEW
   ============================================================ */
function buildPreviewMsgs(steps) {
  const out = [];
  steps.forEach(s => {
    const c = s.config || {};
    if (s.type === "message") {
      out.push({ type: "bot", text: c.text, buttons: c.buttons || [] });
    } else if (s.type === "image") {
      out.push({ type: "bot", text: c.caption || "Image", image: c.url, isMedia: true });
    } else if (s.type === "video") {
      out.push({ type: "bot", text: c.caption || "Video", video: c.url, isMedia: true });
    } else if (s.type === "audio") {
      out.push({ type: "bot", text: "🎵 Audio Message", audio: c.url, isMedia: true });
    } else if (s.type === "file") {
      out.push({ type: "bot", text: "📁 Document Attachment", file: c.url });
    } else if (s.type === "carousel") {
      // Handle both local "carousel" array and potentially API returned items if mapped differently
      out.push({ type: "bot", carousel: c.carousel || c.carousel_items || [] });
    } else if (s.type === "user_input") {
      out.push({ type: "bot", text: c.question || "Tell me more?" });
      out.push({ type: "user", text: "[User Response]" });
    } else if (s.type === "condition") {
      const rs = c.rules || [];
      const ruleText = rs.map(r => `${r.field_name} ${r.operator} ${r.value}`).join(c.match_type === 'all' ? ' AND ' : ' OR ');
      out.push({ type: "sys", text: `Check: ${ruleText || "condition"}` });
      out.push({ type: "sys", text: "↳ (True Branch)" });
    }
  });
  return out;
}

// PreviewBubble removed

function PhonePreview({ steps, platform }) {
  const isFB = platform === "facebook";
  const DS = useDS();
  const msgs = buildPreviewMsgs(steps);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [msgs.length]);

  const botMsgs = msgs.filter(m => m.type === "bot").length;

  const Icons = {
    IG_CAM: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></svg>,
    IG_VIDEO: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>,
    IG_MIC: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>,
    IG_IMG: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>,
    IG_HEART: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" /></svg>,
    FB_PLUS: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" /></svg>,
    FB_THUMB: () => <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z" /></svg>,
    FB_PHONE: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79a15.149 15.149 0 0 0 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg>,
    ARROW_LEFT: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>,
  };

  return (
    <div style={{ width: 340, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Label */}
      <div style={{ fontSize: 11, fontWeight: 800, color: DS.ink3, letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: DS.green, boxShadow: `0 0 8px ${DS.green}` }} />
        {isFB ? 'Messenger' : 'Instagram'} Preview
      </div>

      {/* Phone */}
      <div style={{
        width: 310, height: 630, borderRadius: 54, background: "#000",
        padding: "8px",
        boxShadow: "0 50px 100px -20px rgba(0,0,0,0.5), inset 0 0 0 1px rgba(255,255,255,0.15)",
        position: "relative",
        border: "1.5px solid #3F3F46",
      }}>
        {/* Buttons on Side */}
        <div style={{ position: "absolute", left: -2, top: 120, width: 3, height: 60, background: "#27272A", borderRadius: "2px 0 0 2px" }} />
        <div style={{ position: "absolute", right: -2, top: 180, width: 3, height: 100, background: "#27272A", borderRadius: "0 2px 2px 0" }} />

        {/* Dynamic Island */}
        <div style={{ display: "flex", justifyContent: "center", position: "absolute", top: 18, left: 0, right: 0, zIndex: 50 }}>
          <div style={{
            width: 80, height: 24, borderRadius: 20, background: "#000",
            display: "flex", alignItems: "center", justifyContent: "flex-end", padding: "0 8px",
          }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#111", border: "2px solid #222" }} />
          </div>
        </div>

        {/* Screen */}
        <div style={{ borderRadius: 48, overflow: "hidden", background: "#fff", height: "100%", display: "flex", flexDirection: "column", position: "relative" }}>

          {/* Header */}
          <div style={{
            background: isFB ? "#fff" : "rgba(255,255,255,0.92)",
            backdropFilter: isFB ? "none" : "blur(20px)",
            padding: "42px 14px 10px",
            borderBottom: `0.5px solid ${isFB ? "#E2E8F0" : "#DBDBDB"}`,
            display: "flex", alignItems: "center", gap: 10, zIndex: 40
          }}>
            {/* Back Arrow */}
            <div style={{ color: isFB ? "#0084FF" : "#000", cursor: "pointer" }}>
              <Icons.ARROW_LEFT />
            </div>

            <div style={{
              width: 34, height: 34, borderRadius: "50%",
              background: isFB ? "#0084FF" : "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
              padding: isFB ? 0 : 1.5, flexShrink: 0
            }}>
              <div style={{
                width: "100%", height: "100%", borderRadius: "50%", background: isFB ? "transparent" : "#fff",
                display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <span style={{ fontSize: 16 }}>🤖</span>
              </div>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "#000", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {isFB ? "Messenger Bot" : "bot_assistant"}
                {!isFB && <svg width="12" height="12" viewBox="0 0 24 24" fill={DS.accent} style={{ marginLeft: 3 }}><path d="M12 2L14.4 9.6H22L15.8 14.2L18.2 21.8L12 17.2L5.8 21.8L8.2 14.2L2 9.6H9.6L12 2Z" /></svg>}
              </div>
              <div style={{ fontSize: 10.5, color: "#65676B", marginTop: -1 }}>{isFB ? "Active Now" : "Active 5m ago"}</div>
            </div>
            <div style={{ display: "flex", gap: 18, alignItems: "center", color: isFB ? "#0084FF" : "#262626" }}>
              {isFB ? <Icons.FB_PHONE /> : <Icons.IG_CAM />}
              <Icons.IG_VIDEO />
              {isFB && <div style={{ width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: "50%", border: "2px solid #0084FF", fontWeight: 900, fontSize: 10 }}>i</div>}
            </div>
          </div>

          {/* Chat Messages */}
          <div ref={scrollRef} style={{ padding: "12px", flex: 1, overflowY: "auto", background: "#fff" }}>
            {msgs.length === 0
              ? (
                <div style={{ textAlign: "center", paddingTop: 120 }}>
                  <div style={{ width: 80, height: 80, borderRadius: "50%", border: `1.5px solid ${isFB ? "#F0F2F5" : "#DBDBDB"}`, margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, opacity: 0.5 }}>🤖</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#262626" }}>No messages yet</div>
                  <div style={{ fontSize: 11, color: "#8E8E8E", marginTop: 4 }}>Add steps to start testing your bot!</div>
                </div>
              )
              : msgs.map((m, i) => (
                <div key={i} style={{ display: "flex", justifyContent: m.type === "user" ? "flex-end" : "flex-start", marginBottom: 6, gap: 8, alignItems: "flex-end" }}>
                  {m.type === "bot" && (
                    <div style={{ width: 28, height: 28, borderRadius: "50%", border: "0.5px solid #DBDBDB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0, marginBottom: 2, background: isFB ? "#F0F2F5" : "#fff" }}>
                      🤖
                    </div>
                  )}
                  {m.carousel ? (
                    <div style={{ display: "flex", overflowX: "auto", gap: 8, paddingBottom: 8, width: "100%", scrollSnapType: "x mandatory" }}>
                      {m.carousel.map((card, ci) => (
                        <div key={ci} style={{ minWidth: 200, maxWidth: 220, background: "#fff", border: `1px solid ${isFB ? "#E4E6EB" : "#DBDBDB"}`, borderRadius: 12, overflow: "hidden", flexShrink: 0, scrollSnapAlign: "start" }}>
                          {card.image_url && <div style={{ height: 100, background: "#F3F4F6", backgroundImage: `url(${ensureUrl(card.image_url)})`, backgroundSize: "cover", backgroundPosition: "center" }} />}
                          <div style={{ padding: 10 }}>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#000" }}>{card.title || "Card Title"}</div>
                            <div style={{ fontSize: 11, color: "#65676B", marginTop: 2 }}>{card.subtitle || "Card description"}</div>
                          </div>
                          {(card.buttons || []).slice(0, 3).map((b, bi) => (
                            <div key={bi} style={{ borderTop: `1px solid ${isFB ? "#F0F2F5" : "#DBDBDB"}`, padding: "10px", textAlign: "center", color: isFB ? "#0084FF" : DS.accent, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
                              {b.label}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ) : m.type === "sys" ? (
                    <div style={{ textAlign: "center", width: "100%", margin: "14px 0" }}>
                      <span style={{ fontSize: 10, fontWeight: 800, color: "#8E9196", letterSpacing: "0.05em", textTransform: "uppercase" }}>{m.text}</span>
                    </div>
                  ) : (
                    <div style={{ maxWidth: "78%" }}>
                      <div style={{
                        background: m.type === "user" ? (isFB ? "#0084FF" : DS.gradient) : (isFB ? "#F0F2F5" : "#EFEFEF"),
                        color: m.type === "user" ? "#fff" : "#000",
                        borderRadius: m.type === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                        padding: m.isMedia ? "4px" : "10px 14px", fontSize: 13.5, lineHeight: 1.4,
                        overflow: "hidden"
                      }}>
                        {m.image && <img src={ensureUrl(m.image)} style={{ width: "100%", borderRadius: 14, display: "block" }} alt="" />}
                        {m.video && <video src={ensureUrl(m.video)} controls style={{ width: "100%", borderRadius: 14, display: "block", background: "#000", aspectRatio: "16/9" }} />}
                        {m.audio && (
                          <div style={{ padding: "4px 8px" }}>
                            <div style={{ fontSize: 11, marginBottom: 4, fontWeight: 600, color: m.type === "user" ? "#fff" : "#65676B" }}>Audio Message</div>
                            <audio src={ensureUrl(m.audio)} controls style={{ width: "100%", height: 40, display: "block", outline: "none" }} />
                          </div>
                        )}
                        {m.file && (
                          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0" }}>
                            <File size={20} color={DS.accent} />
                            <div style={{ display: "flex", flexDirection: "column" }}>
                              <span style={{ fontSize: 11, fontWeight: 700, color: "#000" }}>Document File</span>
                              <span style={{ fontSize: 9, color: DS.ink3 }}>Click to download</span>
                            </div>
                          </div>
                        )}
                        {!m.isMedia && m.text}
                      </div>

                      {/* Message Buttons */}
                      {(m.buttons || []).map((b, bi) => (
                        <div key={bi} style={{
                          marginTop: 8, background: "#fff", border: `1.5px solid ${isFB ? "#E4E6EB" : "#DBDBDB"}`,
                          borderRadius: 20, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "center",
                          color: isFB ? "#0084FF" : DS.accent, fontWeight: 700, fontSize: 13, cursor: "pointer"
                        }}>
                          {b.label}
                        </div>
                      ))}

                      {m.link && (
                        <div style={{
                          marginTop: 8, background: "#fff", border: `1.5px solid ${isFB ? "#E4E6EB" : "#DBDBDB"}`,
                          borderRadius: 20, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "center",
                          color: isFB ? "#0084FF" : DS.accent, fontWeight: 700, fontSize: 13, cursor: "pointer"
                        }}>
                          {m.link.label}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            }
          </div>

          {/* PLATFORM SPECIFIC INPUT BAR */}
          <div style={{
            background: "#fff", padding: "8px 12px 34px",
            borderTop: `0.5px solid ${isFB ? "#E4E6EB" : "#DBDBDB"}`,
            display: "flex", gap: 14, alignItems: "center"
          }}>
            {isFB ? (
              <>
                <div style={{ color: "#0084FF" }}><Icons.FB_PLUS /></div>
                <div style={{ color: "#0084FF" }}><Icons.IG_CAM /></div>
                <div style={{ color: "#0084FF" }}><Icons.IG_IMG /></div>
                <div style={{ color: "#0084FF" }}><Icons.IG_MIC /></div>
                <div style={{ flex: 1, background: "#F0F2F5", borderRadius: 20, height: 36, display: "flex", alignItems: "center", paddingLeft: 14, fontSize: 15, color: "#8E9196" }}>Aa</div>
                <div style={{ color: "#0084FF" }}><Icons.FB_THUMB /></div>
              </>
            ) : (
              <>
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: DS.gradient, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}><Icons.IG_CAM /></div>
                <div style={{ flex: 1, border: "1px solid #DBDBDB", borderRadius: 22, height: 38, display: "flex", alignItems: "center", paddingLeft: 16, fontSize: 14, color: "#8E8E8E" }}>Message...</div>
                <div style={{ color: "#262626" }}><Icons.IG_MIC /></div>
                <div style={{ color: "#262626" }}><Icons.IG_IMG /></div>
                <div style={{ color: "#ED4956" }}><Icons.IG_HEART /></div>
              </>
            )}
          </div>
        </div>

        {/* Home Indicator */}
        <div style={{ display: "flex", justifyContent: "center", position: "absolute", bottom: 10, left: 0, right: 0, zIndex: 100 }}>
          <div style={{ width: 120, height: 5, borderRadius: 10, background: "#000", opacity: 0.9 }} />
        </div>
      </div>

      {/* Modern Stats Grid */}
      <div style={{ marginTop: 24, width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {[
          { label: "Steps", val: steps.length, icon: "🌳" },
          { label: "Messages", val: botMsgs, icon: "📩" },
        ].map(s => (
          <div key={s.label} style={{ background: DS.card, borderRadius: 16, padding: "12px", border: `1.5px solid ${DS.border}`, display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 10, background: DS.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 900, color: DS.ink }}>{s.val}</div>
              <div style={{ fontSize: 10, color: DS.ink3, fontWeight: 700, textTransform: "uppercase" }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   SETTINGS PANEL
   ============================================================ */
function SettingsPanel({ settings, setSettings }) {
  const set = patch => setSettings(s => ({ ...s, ...patch }));
  const DS = useDS();
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Behavior */}
      <div style={{ background: DS.card, borderRadius: DS.radius, border: `1.5px solid ${DS.border}`, overflow: "hidden" }}>
        <div style={{ padding: "12px 14px", borderBottom: `1px solid ${DS.border}`, fontSize: 12, fontWeight: 800, color: DS.ink2, textTransform: "uppercase", letterSpacing: "0.07em" }}>⚙️ Behavior</div>
        <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
          <Toggle on={settings.allowRepeat} onChange={() => set({ allowRepeat: !settings.allowRepeat })} label="Allow same person to re-trigger" />
          <Toggle on={settings.followGlobal} onChange={() => set({ followGlobal: !settings.followGlobal })} label="🔒 Global follow gate — followers only" />
          <Toggle on={settings.autoLikeAll} onChange={() => set({ autoLikeAll: !settings.autoLikeAll })} label="Auto-like all trigger comments" />
          <Toggle on={settings.skipWeekends} onChange={() => set({ skipWeekends: !settings.skipWeekends })} label="Skip weekends" />
          <Toggle on={settings.rewindEnabled} onChange={() => set({ rewindEnabled: !settings.rewindEnabled })} label="⏪ Rewind — re-send unclaimed DMs" />
          <Toggle on={settings.sendbackEnabled} onChange={() => set({ sendbackEnabled: !settings.sendbackEnabled })} label="📤 SendBack — catch missed comments" />
        </div>
      </div>

      {/* Safety */}
      <div style={{ background: DS.card, borderRadius: DS.radius, border: `1.5px solid ${DS.border}`, overflow: "hidden" }}>
        <div style={{ padding: "12px 14px", borderBottom: `1px solid ${DS.border}`, fontSize: 12, fontWeight: 800, color: DS.ink2, textTransform: "uppercase", letterSpacing: "0.07em" }}>🛡️ Safety & Limits</div>
        <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
          <Toggle on={settings.slowMode} onChange={() => set({ slowMode: !settings.slowMode })} label="Slow Mode — throttle if post goes viral" />
          <Toggle on={settings.humanize} onChange={() => set({ humanize: !settings.humanize })} label="Humanize timing — random micro-delays" />
          <div>
            <Label>Max DMs per hour</Label>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input type="range" min={5} max={100} value={settings.dmLimit || 30} onChange={e => set({ dmLimit: e.target.value })}
                style={{ flex: 1, accentColor: DS.accent }} />
              <span style={{ width: 40, fontSize: 13, fontWeight: 700, color: DS.accent, textAlign: "right" }}>{settings.dmLimit || 30}/hr</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: DS.ink3, marginTop: 2 }}>
              <span>Conservative (5)</span><span>Aggressive (100)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Schedule */}
      <div style={{ background: DS.card, borderRadius: DS.radius, border: `1.5px solid ${DS.border}`, overflow: "hidden" }}>
        <div style={{ padding: "12px 14px", borderBottom: `1px solid ${DS.border}`, fontSize: 12, fontWeight: 800, color: DS.ink2, textTransform: "uppercase", letterSpacing: "0.07em" }}>🕐 Active Hours</div>
        <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
          <Toggle on={settings.scheduleEnabled} onChange={() => set({ scheduleEnabled: !settings.scheduleEnabled })} label="Restrict to active hours only" />
          {settings.scheduleEnabled && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              <div><Label>From</Label><Input type="time" value={settings.fromTime || "08:00"} onChange={e => set({ fromTime: e.target.value })} /></div>
              <div><Label>To</Label><Input type="time" value={settings.toTime || "22:00"} onChange={e => set({ toTime: e.target.value })} /></div>
            </div>
          )}
          <div>
            <Label>Timezone</Label>
            <Select value={settings.tz || "America/New_York"} onChange={e => set({ tz: e.target.value })} options={[
              { value: "America/New_York", label: "Eastern (ET)" },
              { value: "America/Chicago", label: "Central (CT)" },
              { value: "America/Los_Angeles", label: "Pacific (PT)" },
              { value: "Europe/London", label: "London (GMT)" },
              { value: "Asia/Kolkata", label: "India (IST)" },
              { value: "Asia/Dubai", label: "Dubai (GST)" },
            ]} />
          </div>
        </div>
      </div>

      {/* Integrations */}
      <div style={{ background: DS.card, borderRadius: DS.radius, border: `1.5px solid ${DS.border}`, overflow: "hidden" }}>
        <div style={{ padding: "12px 14px", borderBottom: `1px solid ${DS.border}`, fontSize: 12, fontWeight: 800, color: DS.ink2, textTransform: "uppercase", letterSpacing: "0.07em" }}>⚡ Integrations</div>
        <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
          {["Klaviyo", "Mailchimp", "HubSpot", "Google Sheets", "Zapier", "Make (Integromat)"].map(name => (
            <div key={name} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 10px", borderRadius: DS.radiusSm, background: DS.bg, border: `1.5px solid ${DS.border}` }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: DS.ink }}>{name}</span>
              <SmallBtn>Connect</SmallBtn>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   ANALYTICS PANEL
   ============================================================ */
function AnalyticsPanel() {
  const DS = useDS();
  const stats = [
    { label: "Triggered", val: "3,241", sub: "+12% this week", color: DS.accent },
    { label: "DMs Sent", val: "3,108", sub: "95.9% delivery", color: DS.blue },
    { label: "Opened", val: "2,640", sub: "85% open rate", color: DS.green },
    { label: "Converted", val: "619", sub: "19.1% conversion", color: "#9333EA" },
    { label: "Emails Captured", val: "412", sub: "+47 today", color: DS.amber },
    { label: "Links Clicked", val: "1,032", sub: "33% CTR", color: "#0891B2" },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: DS.card, borderRadius: DS.radius, border: `1.5px solid ${DS.border}`, padding: "16px 14px", textAlign: "center" }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: s.color, letterSpacing: "-0.03em" }}>{s.val}</div>
            <div style={{ fontSize: 12, fontWeight: 700, color: DS.ink, marginTop: 3 }}>{s.label}</div>
            <div style={{ fontSize: 10.5, color: DS.ink3, marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>
      <div style={{ background: DS.card, borderRadius: DS.radius, border: `1.5px solid ${DS.border}`, padding: "16px 18px" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: DS.ink, marginBottom: 14 }}>Triggered over last 7 days</div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 80 }}>
          {[320, 480, 390, 620, 540, 710, 580].map((v, i) => {
            const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
            const pct = (v / 750) * 100;
            return (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <div style={{ width: "100%", background: i === 5 ? DS.accent : `${DS.accent}40`, borderRadius: "4px 4px 0 0", height: `${pct}%`, transition: "height 0.4s" }} />
                <div style={{ fontSize: 9.5, color: DS.ink3 }}>{days[i]}</div>
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ background: DS.card, borderRadius: DS.radius, border: `1.5px solid ${DS.border}`, padding: "16px 18px" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: DS.ink, marginBottom: 12 }}>Top trigger keywords</div>
        {[{ kw: "FREE", cnt: 1243, pct: 85 }, { kw: "LINK", cnt: 890, pct: 61 }, { kw: "INFO", cnt: 712, pct: 49 }, { kw: "DETAILS", cnt: 396, pct: 27 }].map(k => (
          <div key={k.kw} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4, fontSize: 12, fontWeight: 600, color: DS.ink }}>
              <span>"{k.kw}"</span><span style={{ color: DS.ink3 }}>{k.cnt.toLocaleString()} triggers</span>
            </div>
            <div style={{ height: 5, borderRadius: 99, background: DS.bg }}>
              <div style={{ height: "100%", width: `${k.pct}%`, borderRadius: 99, background: `linear-gradient(90deg,${DS.accent},#F97316)`, transition: "width 0.6s" }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   MAIN APP
   ============================================================ */

export default function FlowBuilderPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading Flow Builder...</div>}>
      <FlowBuilder />
    </Suspense>
  );
}

function FlowBuilder() {
  const searchParams = useSearchParams();
  const replyId = searchParams.get("id");
  const platformParam = searchParams.get("platform") || "instagram";

  const [platform, setPlatform] = useState(platformParam);
  const DS = getDS(platform);

  const [steps, setSteps] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [flowName, setFlowName] = useState("New Flow");
  const [isLive, setIsLive] = useState(false);
  const [tab, setTab] = useState("flow"); // flow | settings | analytics
  const [showTemplates, setShowTemplates] = useState(false);
  const [saved, setSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({ dmLimit: 30, slowMode: true, humanize: true });
  const bottomRef = useRef(null);

  // Fetch Flow Data if ID exists
  useEffect(() => {
    if (replyId) {
      const fetchFlow = async () => {
        try {
          const endpoint = platform === "facebook"
            ? `/facebook/bot-replies/${replyId}`
            : `/instagram/bot-replies/${replyId}`;

          const response = await api.get(endpoint);
          const data = response.data.data;
          if (data) {
            setFlowName(data.name || "Untitled Flow");
            setIsLive(data.status === 'published');

            let rawSteps = [];
            if (data.steps && Array.isArray(data.steps) && data.steps.length > 0) {
              // Priority: New steps array from backend
              rawSteps = data.steps.map(s => ({
                id: s.id,
                type: s.step_type === "text" ? "message" : s.step_type,
                label: s.title || s.step_type,
                config: s.settings_json || {},
                kind: (s.step_type === "condition" || s.step_type === "trigger") ? s.step_type : "action"
              }));
            } else if (data.flow_data) {
              // Fallback: Old flow_data JSON string
              rawSteps = typeof data.flow_data === 'string'
                ? JSON.parse(data.flow_data)
                : data.flow_data;
            }

            setSteps(rawSteps.map(s => ({ ...s, id: s.id || uid() })));
          }
        } catch (error) {
          console.error("Error fetching flow:", error);
          toast.error("Failed to load flow data");
        }
      };
      fetchFlow();
    }
  }, [replyId, platform]);

  const updateStep = useCallback((id, data) => setSteps(s => s.map(x => x.id === id ? data : x)), []);
  const deleteStep = useCallback((id) => { setSteps(s => s.filter(x => x.id !== id)); setExpandedId(p => p === id ? null : p); }, []);
  const dupStep = useCallback((id) => {
    setSteps(s => {
      const idx = s.findIndex(x => x.id === id);
      const copy = { ...s[idx], id: uid(), label: s[idx].label + " (copy)" };
      const n = [...s]; n.splice(idx + 1, 0, copy); return n;
    });
  }, []);
  const moveUp = useCallback((i) => setSteps(s => { const a = [...s];[a[i - 1], a[i]] = [a[i], a[i - 1]]; return a; }), []);
  const moveDown = useCallback((i) => setSteps(s => { const a = [...s];[a[i], a[i + 1]] = [a[i + 1], a[i]]; return a; }), []);

  const handleStepSave = useCallback(async (step) => {
    if (!replyId) return;
    try {
      const endpoint = platform === "facebook"
        ? `/facebook/bot-replies/${replyId}/steps`
        : `/instagram/bot-replies/${replyId}/steps`;

      const payload = {
        step_type: step.type === "message" ? "text" : step.type,
        title: step.label || step.type,
        settings_json: step.type === "carousel" ? [] : step.config,
        bot_reply_id: parseInt(replyId),
        id: String(step.id).startsWith("s_") ? undefined : step.id,
        buttons: step.config?.buttons || [],
        quick_replies: step.config?.quick_replies || [],
        carousel_items: step.type === "carousel" ? (step.config?.carousel_items || []).map(item => ({
          ...item,
          destination_url: item.destination_url || item.image_url || "https://",
          buttons: (item.buttons || []).map(b => ({
            title: b.title || b.label || "Click Here",
            action_type: b.action_type || "open_url",
            action_value: b.action_value || "https://"
          }))
        })) : [],
        condition: step.type === "condition" ? step.config : null,
      };

      const isNew = String(step.id).startsWith("s_");

      let response;
      if (isNew) {
        response = await api.post(endpoint, payload);
        const newId = response.data?.data?.id || response.data?.id;
        if (newId) {
          // Force ID to string to ensure .startsWith("s_") check works correctly on next save
          updateStep(step.id, { ...step, id: String(newId) });
        }
      } else {
        const patchEndpoint = platform === "facebook"
          ? `/facebook/bot-replies/steps/${step.id}`
          : `/instagram/bot-replies/steps/${step.id}`;
        response = await api.patch(patchEndpoint, payload);
      }

      toast.success("Step saved successfully");
    } catch (err) {
      console.error("Step Save Error:", err);
      toast.error("Failed to save step data");
    }
  }, [replyId, platform, updateStep]);

  const addStep = useCallback(async (type) => {
    if (isCreating) return;
    const def = getActionDef(type);
    const tempId = uid();
    const newStep = { id: tempId, kind: "action", type, label: def.label, config: {} };
    
    setSteps(s => [...s, newStep]);
    setExpandedId(tempId);
    
    setIsCreating(true);
    try {
      await handleStepSave(newStep);
    } finally {
      setIsCreating(false);
    }
    
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
    return tempId;
  }, [handleStepSave, isCreating]);

  const handleSave = async (forceStatus = null) => {
    if (!replyId) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2200);
      return;
    }

    setIsSaving(true);
    try {
      const endpoint = platform === "facebook"
        ? `/facebook/bot-replies/${replyId}`
        : `/instagram/bot-replies/${replyId}`;

      const finalStatus = forceStatus !== null
        ? (forceStatus ? 'published' : 'draft')
        : (isLive ? 'published' : 'draft');

      await api.patch(endpoint, {
        name: flowName,
        flow_data: JSON.stringify(steps),
        status: finalStatus
      });

      setSaved(true);
      toast.success(`Flow ${finalStatus === 'published' ? 'published' : 'saved'} successfully`);
      setTimeout(() => setSaved(false), 2200);
    } catch (error) {
      console.error("Save Error:", error);
      toast.error("Failed to save flow");
    } finally {
      setIsSaving(false);
    }
  };
  const TABS = [{ id: "flow", icon: "📋", label: "Flow" }, { id: "settings", icon: "⚙️", label: "Settings" }, { id: "analytics", icon: "📊", label: "Analytics" }];

  return (
    <DSContext.Provider value={DS}>
      <div style={{ minHeight: "100vh", background: DS.bg, fontFamily: "'Sora', 'DM Sans', -apple-system, sans-serif" }}>
        <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { margin: 0; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${DS.border}; border-radius: 99px; }
        input[type=range] { -webkit-appearance: none; height: 5px; border-radius: 99px; background: ${DS.border}; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%; background: ${DS.accent}; cursor: pointer; box-shadow: 0 1px 4px rgba(0,0,0,0.2); }

        /* Responsive utility for flows layout */
        .instdm-body { width: 100%; max-width: 1080px; margin: 0 auto; padding: 22px 18px; display: flex; gap: 22px; align-items: flex-start; }
        .instdm-left { flex: 1; min-width: 0; }
        .instdm-preview { width: 320px; flex-shrink: 0; position: sticky; top: 90px; }

        /* Tablet: stack vertically earlier and use full width */
        @media (max-width: 1024px) {
          .instdm-body { flex-direction: column; padding: 16px; max-width: 100%; width: 100%; }
          .instdm-left { width: 100%; }
          .instdm-preview { width: 100%; margin-top: 14px; }
          /* make header actions wrap */
        }

        /* Mobile: ensure preview fills viewport width and UI scales */
        @media (max-width: 520px) {
          .instdm-body { padding: 12px; gap: 12px; }
          .instdm-left { width: 100%; }
          .instdm-preview { width: 100%; margin-top: 12px; }
          .instdm-body, .instdm-left, .instdm-preview { box-sizing: border-box; }
        }

        /* Very small screens: tighten spacing */
        @media (max-width: 360px) {
          .instdm-body { padding: 8px; }
        }

        /* Flow header responsive */
        .flow-hdr { background: ${DS.card}; border-bottom: 1.5px solid ${DS.border}; padding: 10px 14px; display: flex; flex-wrap: wrap; align-items: center; gap: 8px; position: sticky; top: 0; z-index: 100; backdrop-filter: blur(8px); }
        .flow-hdr-r1 { display: flex; align-items: center; gap: 8px; flex: 1; min-width: 0; }
        .flow-hdr-r2 { display: flex; align-items: center; gap: 6px; }
        .ftab-label { display: inline; }
        .btn-text { display: inline; }
        @media (max-width: 600px) {
          .flow-hdr { padding: 8px 10px; gap: 6px; }
          .ftab-label { display: none; }
          .flow-hdr-r2 { width: 100%; justify-content: flex-end; }
          .btn-text { display: none; }
        }
      `}</style>


        {/* ── HEADER ─────────────────────────────────────────────── */}
        <div className="flow-hdr">
          {/* Row 1: Logo + name + tabs */}
          <div className="flow-hdr-r1">
            <div style={{ width: 32, height: 32, borderRadius: 9, background: DS.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, flexShrink: 0 }}>⚡</div>
            <input value={flowName} onChange={e => setFlowName(e.target.value)} style={{ flex: 1, border: "none", background: "transparent", fontSize: 14, fontWeight: 800, color: DS.ink, outline: "none", fontFamily: "inherit", letterSpacing: "-0.02em", minWidth: 0 }} />

            {/* Platform Switcher */}
            <div style={{ display: "flex", background: DS.bg, borderRadius: 10, padding: 3, gap: 2, border: `1.5px solid ${DS.border}`, flexShrink: 0 }}>
              {Object.entries(PLATFORMS).map(([id, p]) => (
                <button key={id} onClick={() => setPlatform(id)} style={{
                  padding: "5px 12px", borderRadius: 8, fontSize: 11.5, fontWeight: 800, border: "none", cursor: "pointer", fontFamily: "inherit",
                  background: platform === id ? DS.card : "transparent",
                  color: platform === id ? DS.accent : DS.ink3,
                  boxShadow: platform === id ? DS.shadow : "none",
                  transition: "all 0.15s", display: "flex", alignItems: "center", gap: 5,
                }}>
                  <span style={{ fontSize: 14 }}>{p.icon}</span>
                  <span className="btn-text" style={{ fontSize: 10.5 }}>{p.name}</span>
                </button>
              ))}
            </div>

            <div style={{ display: "flex", background: DS.bg, borderRadius: 10, padding: 3, gap: 2, border: `1.5px solid ${DS.border}`, flexShrink: 0 }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} style={{
                  padding: "5px 9px", borderRadius: 8, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "inherit",
                  background: tab === t.id ? DS.card : "transparent",
                  color: tab === t.id ? DS.ink : DS.ink3,
                  boxShadow: tab === t.id ? DS.shadow : "none",
                  transition: "all 0.15s", display: "flex", alignItems: "center", gap: 3,
                }}>{t.icon}<span className="ftab-label"> {t.label}</span></button>
              ))}
            </div>
          </div>

          {/* Row 2: Action buttons */}
          <div className="flow-hdr-r2">

            <button onClick={() => setIsLive(!isLive)} style={{
              padding: "6px 11px", borderRadius: 20, fontSize: 12, fontWeight: 700, border: `1.5px solid ${isLive ? DS.green : DS.border}`,
              background: isLive ? DS.greenSoft : DS.bg, color: isLive ? DS.green : DS.ink3, cursor: "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", gap: 5, transition: "all 0.2s",
            }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: isLive ? DS.green : DS.ink3, display: "inline-block", boxShadow: isLive ? `0 0 6px ${DS.green}` : "none", transition: "all 0.2s" }} />
              {isLive ? "Live" : "Draft"}
            </button>

            <button onClick={handleSave} style={{
              padding: "6px 11px", borderRadius: 20, fontSize: 12, fontWeight: 700, border: `1.5px solid ${saved ? DS.green : DS.border}`,
              background: saved ? DS.greenSoft : DS.bg, color: saved ? DS.green : DS.ink2, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
            }}>{saved ? "✓" : "💾"}<span className="btn-text"> {saved ? "Saved!" : "Save"}</span></button>

            <button onClick={() => { handleSave(true); }} style={{
              padding: "7px 14px", borderRadius: 20, fontSize: 12, fontWeight: 800, border: "none", fontFamily: "inherit",
              background: `linear-gradient(135deg,${DS.accent},#F97316)`,
              color: "#fff", cursor: "pointer",
              boxShadow: "0 4px 16px rgba(232,69,10,0.3)", transition: "all 0.2s",
            }} title="Publish flow">
              <Play size={12} style={{ marginRight: 4 }} /><span className="btn-text"> {isSaving ? "Publishing..." : "Publish"}</span>
            </button>
          </div>
        </div>

        {/* ── BODY ────────────────────────────────────────────────── */}
        <div className="instdm-body" style={{ maxWidth: 1080 }}>

          {/* ── LEFT: FLOW / SETTINGS / ANALYTICS ─── */}
          <div className="instdm-left" style={{ flex: 1 }}>

            {tab === "flow" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {/* Step list */}
                {steps.map((s, gi) => (
                  <StepCard key={s.id} step={s} index={gi} total={steps.length} allSteps={steps}
                    expanded={expandedId === s.id} onToggle={() => setExpandedId(expandedId === s.id ? null : s.id)}
                    onUpdate={data => updateStep(s.id, data)} onDelete={() => deleteStep(s.id)}
                    onDup={() => dupStep(s.id)} onMoveUp={() => moveUp(gi)} onMoveDown={() => moveDown(gi)}
                    onSaveStep={handleStepSave} onAddStep={addStep}
                  />
                ))}

                {/* Add step */}
                <div style={{ marginTop: 16 }} ref={bottomRef}>
                  <AddActionPicker onAdd={addStep} isCreating={isCreating} />
                </div>
              </div>
            )}

            {tab === "settings" && <SettingsPanel settings={settings} setSettings={setSettings} />}
            {tab === "analytics" && <AnalyticsPanel />}
          </div>

          {/* ── RIGHT: PHONE PREVIEW ─── */}
          <div className="instdm-preview">
            <PhonePreview steps={steps} platform={platform} />
          </div>
        </div>
      </div>
    </DSContext.Provider>
  );
}
