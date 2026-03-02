"use client";
import { useState, useRef, useEffect, useCallback } from "react";

/* ============================================================
   DESIGN SYSTEM — warm ink + cream + coral accent, editorial
   ============================================================ */
const DS = {
  bg: "#F7F4EF",
  card: "#FFFFFF",
  ink: "#1C1917",
  ink2: "#57534E",
  ink3: "#A8A29E",
  border: "#E7E2DA",
  borderHover: "#C9C2B8",
  accent: "#E8450A",
  accentSoft: "#FFF0EB",
  accentBorder: "#F8C4B0",
  green: "#16A34A",
  greenSoft: "#F0FDF4",
  amber: "#D97706",
  amberSoft: "#FFFBEB",
  blue: "#0369A1",
  blueSoft: "#F0F9FF",
  shadow: "0 1px 3px rgba(28,25,23,0.06), 0 4px 12px rgba(28,25,23,0.04)",
  shadowHover: "0 2px 8px rgba(28,25,23,0.1), 0 8px 24px rgba(28,25,23,0.06)",
  shadowCard: "0 0 0 1.5px #E7E2DA, 0 2px 12px rgba(28,25,23,0.06)",
  radius: 14,
  radiusSm: 9,
};

/* ============================================================
   DATA DEFINITIONS
   ============================================================ */
const TRIGGERS = [
  { id: "comment", icon: "💬", label: "Comment Keyword", desc: "Triggers when someone comments a word on your post/reel", color: "#E8450A" },
  { id: "story_reply", icon: "📸", label: "Story Reply", desc: "Triggers when someone replies to your story", color: "#9333EA" },
  { id: "dm_keyword", icon: "✉️", label: "DM Keyword", desc: "Triggers when someone DMs a specific keyword", color: "#0369A1" },
  { id: "new_follower", icon: "👤", label: "New Follower", desc: "Triggers when someone follows your account", color: "#16A34A" },
  { id: "story_mention", icon: "📢", label: "Story Mention", desc: "Triggers when someone @mentions you in their story", color: "#D97706" },
  { id: "link_click", icon: "🔗", label: "Bio Link Click", desc: "Triggers when someone clicks your bio link button", color: "#0891B2" },
  { id: "ad_comment", icon: "📣", label: "Ad Comment", desc: "Triggers on comments on your boosted/sponsored posts", color: "#7C3AED" },
  { id: "live_mention", icon: "🔴", label: "Live / Mention", desc: "Triggers during Instagram Live interactions", color: "#DC2626" },
];

const ACTIONS = [
  { id: "message", icon: "💬", label: "Send Message", desc: "Text, emojis, personalization variables", cat: "Messaging" },
  { id: "quick_reply", icon: "🎯", label: "Quick Replies", desc: "Buttons the user taps to reply", cat: "Messaging" },
  { id: "send_link", icon: "🔗", label: "Send Link", desc: "Share a URL with optional preview button", cat: "Messaging" },
  { id: "media", icon: "🖼️", label: "Send Media", desc: "Image, GIF, or video message", cat: "Messaging" },
  { id: "collect_email", icon: "📧", label: "Collect Email", desc: "Ask and validate their email address", cat: "Lead Gen" },
  { id: "collect_phone", icon: "📱", label: "Collect Phone", desc: "Ask and validate their phone number", cat: "Lead Gen" },
  { id: "ai_reply", icon: "🤖", label: "AI Auto-Reply", desc: "GPT-powered smart response", cat: "AI" },
  { id: "ai_classify", icon: "🧠", label: "AI Classify", desc: "Detect intent and route accordingly", cat: "AI" },
  { id: "condition", icon: "🔀", label: "If / Else Branch", desc: "Split flow based on any condition", cat: "Logic" },
  { id: "delay", icon: "⏱️", label: "Wait / Delay", desc: "Pause to appear natural or schedule", cat: "Logic" },
  { id: "random_split", icon: "🎲", label: "Random A/B Split", desc: "Split contacts randomly (A/B test flows)", cat: "Logic" },
  { id: "check_tag", icon: "🏷️", label: "Check Tag", desc: "Branch if contact has a specific tag", cat: "Logic" },
  { id: "follow_gate", icon: "🔒", label: "Follow Gate", desc: "Verify they follow you before continuing", cat: "Safety" },
  { id: "tag", icon: "🏷️", label: "Tag Contact", desc: "Label contact for segmentation", cat: "CRM" },
  { id: "set_field", icon: "📝", label: "Set Custom Field", desc: "Save data to a contact field", cat: "CRM" },
  { id: "notify_team", icon: "🔔", label: "Notify Team", desc: "Send alert to your team inbox", cat: "CRM" },
  { id: "handoff", icon: "👥", label: "Live Chat Handoff", desc: "Transfer to human agent", cat: "CRM" },
  { id: "zapier", icon: "⚡", label: "Zapier / Webhook", desc: "Send data to external app", cat: "Integrations" },
  { id: "end", icon: "✅", label: "End Flow", desc: "Mark conversation complete", cat: "Logic" },
];

const ACTION_CATS = ["Messaging", "Lead Gen", "AI", "Logic", "Safety", "CRM", "Integrations"];

const TEMPLATES = [
  {
    id: "lead_magnet", icon: "🎁", name: "Lead Magnet", badge: "Most Popular",
    desc: "Comment → Verify follow → Send freebie → Collect email",
    steps: [
      { kind: "trigger", type: "comment", label: "Comment Trigger", config: { keywords: "FREE, LINK, INFO", postTarget: "any" } },
      { kind: "action", type: "message", label: "Instant Reply", config: { text: "Hey {first_name}! 🙌 Got your message — sending your freebie right now..." } },
      { kind: "action", type: "follow_gate", label: "Check Follow", config: { onFail: "ask", askText: "Follow me first to unlock this resource! 🔒" } },
      { kind: "action", type: "send_link", label: "Send Resource", config: { text: "Here's your free guide! 🎉", url: "https://yoursite.com/freebie", btnLabel: "Get It Free →" } },
      { kind: "action", type: "collect_email", label: "Capture Email", config: { prompt: "Want weekly tips? Drop your best email 👇", required: true } },
      { kind: "action", type: "tag", label: "Tag as Lead", config: { tags: "lead, freebie-claimed, nurture-sequence" } },
      { kind: "action", type: "zapier", label: "Add to Klaviyo", config: { webhook: "", label: "Send to email platform" } },
    ]
  },
  {
    id: "story_funnel", icon: "📸", name: "Story Funnel", badge: "High Converting",
    desc: "Story reply → AI qualify → Branch → Close",
    steps: [
      { kind: "trigger", type: "story_reply", label: "Story Reply", config: { keywords: "" } },
      { kind: "action", type: "ai_reply", label: "AI Warm Welcome", config: { instructions: "Greet them warmly, reference that they replied to a story, and ask what caught their eye. Keep it under 2 sentences, conversational.", tone: "Friendly 😊" } },
      { kind: "action", type: "quick_reply", label: "Qualify Interest", config: { question: "What best describes you?", options: "Creator|Business Owner|Just browsing" } },
      { kind: "action", type: "condition", label: "High-Intent?", config: { condType: "reply_contains", condition: "Creator OR Business Owner", onFalse: "end" } },
      { kind: "action", type: "send_link", label: "Send Offer", config: { text: "Perfect! This was made for you 👇", url: "https://yoursite.com/offer", btnLabel: "See The Offer →" } },
      { kind: "action", type: "tag", label: "Tag Hot Lead", config: { tags: "hot-lead, story-funnel, high-intent" } },
    ]
  },
  {
    id: "welcome_flow", icon: "👋", name: "New Follower Welcome", badge: "Evergreen",
    desc: "Follow → Delay → Welcome DM → Nurture",
    steps: [
      { kind: "trigger", type: "new_follower", label: "New Follower", config: {} },
      { kind: "action", type: "delay", label: "Wait 3 minutes", config: { duration: "3", unit: "minutes" } },
      { kind: "action", type: "message", label: "Welcome Message", config: { text: "Welcome {first_name}! 🎉 So glad you're here. I'm {your_name} — I share [what you do].\n\nHere's something to get you started 👇" } },
      { kind: "action", type: "send_link", label: "Share Best Content", config: { text: "Start here 🚀", url: "https://yoursite.com/start", btnLabel: "Start Here →" } },
      { kind: "action", type: "quick_reply", label: "Engage Question", config: { question: "What brought you here?", options: "Your content|A friend shared|Just found you" } },
      { kind: "action", type: "tag", label: "Tag New Follower", config: { tags: "new-follower, welcome-sent" } },
    ]
  },
  {
    id: "faq_bot", icon: "🤖", name: "AI FAQ Bot", badge: "Set & Forget",
    desc: "DM keyword → AI answers → Escalate if needed",
    steps: [
      { kind: "trigger", type: "dm_keyword", label: "Any DM", config: { keywords: "", matchAll: true } },
      { kind: "action", type: "ai_reply", label: "AI Answer", config: { instructions: "You are a helpful assistant for [Brand Name]. Answer the user's question about our products/services. If you don't know, say you'll connect them with the team. Keep answers under 3 sentences.", tone: "Professional 💼" } },
      { kind: "action", type: "condition", label: "Needs Human?", config: { condType: "reply_contains", condition: "speak to human OR talk to someone", onFalse: "end" } },
      { kind: "action", type: "handoff", label: "Live Chat Handoff", config: { message: "Connecting you with our team now! 👥" } },
    ]
  },
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
let _id = 200;
const uid = () => `s${++_id}`;
const getTriggerDef = (id: string) => TRIGGERS.find(t => t.id === id) || TRIGGERS[0];
const getActionDef = (id: string) => ACTIONS.find(a => a.id === id) || ACTIONS[0];
const getDef = (kind: string, type: string) => kind === "trigger" ? getTriggerDef(type) : getActionDef(type);
const getColor = (kind: string, type: string) => kind === "trigger" ? getTriggerDef(type).color : "#1C1917";

/* ============================================================
   MINI COMPONENTS
   ============================================================ */
function Label({ children, hint }) {
  return (
    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 6 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: DS.ink3, letterSpacing: "0.08em", textTransform: "uppercase" }}>{children}</span>
      {hint && <span style={{ fontSize: 10.5, color: DS.ink3 }}>{hint}</span>}
    </div>
  );
}

function Input({ value, onChange, placeholder, multiline, rows = 3, type = "text", style: extra = {} }) {
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

function Tag({ children, color = DS.accent, bg = DS.accentSoft }) {
  return <span style={{ fontSize: 10.5, fontWeight: 700, color, background: bg, border: `1px solid ${color}30`, borderRadius: 99, padding: "2px 8px" }}>{children}</span>;
}

function SmallBtn({ children, onClick, danger, icon, style: extra = {} }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)} style={{
      display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 10px", borderRadius: DS.radiusSm,
      border: `1.5px solid ${danger && hov ? "#FCA5A5" : DS.border}`,
      background: danger && hov ? "#FFF1F0" : hov ? DS.bg : "#fff",
      color: danger ? (hov ? "#DC2626" : DS.ink3) : DS.ink2,
      cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "inherit",
      transition: "all 0.12s", ...extra,
    }}>
      {icon && <span>{icon}</span>}{children}
    </button>
  );
}

/* ============================================================
   FORM FIELDS PER STEP TYPE
   ============================================================ */
function TriggerFields({ step, update }) {
  const def = getTriggerDef(step.type);
  const c = step.config || {};
  const set = patch => update({ ...step, config: { ...c, ...patch } });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Trigger picker grid */}
      <div>
        <Label>Trigger type</Label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          {TRIGGERS.map(t => {
            const sel = step.type === t.id;
            return (
              <button key={t.id} onClick={() => update({ ...step, type: t.id, label: t.label })} style={{
                display: "flex", alignItems: "flex-start", gap: 9, padding: "10px 11px", borderRadius: DS.radiusSm,
                border: `1.5px solid ${sel ? t.color : DS.border}`, background: sel ? `${t.color}0D` : "#fff",
                cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "all 0.12s",
              }}>
                <span style={{ fontSize: 18, lineHeight: 1.2 }}>{t.icon}</span>
                <div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: sel ? t.color : DS.ink, lineHeight: 1.2 }}>{t.label}</div>
                  <div style={{ fontSize: 10.5, color: DS.ink3, marginTop: 2, lineHeight: 1.3 }}>{t.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {["comment", "dm_keyword", "ad_comment"].includes(step.type) && (
        <div>
          <Label hint="comma-separated">Keywords</Label>
          <Input value={c.keywords} onChange={e => set({ keywords: e.target.value })} placeholder="FREE, LINK, INFO, DETAILS" />
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
            <Toggle on={c.matchAll} onChange={() => set({ matchAll: !c.matchAll })} label="Trigger on ANY message (no keyword required)" />
          </div>
        </div>
      )}

      {step.type === "comment" && (
        <div>
          <Label>Apply to</Label>
          <Select value={c.postTarget || "any"} onChange={e => set({ postTarget: e.target.value })} options={[
            { value: "any", label: "Any post or Reel" },
            { value: "latest", label: "Latest post only" },
            { value: "specific", label: "Specific post URL" },
            { value: "all_reels", label: "All Reels" },
          ]} />
          {c.postTarget === "specific" && (
            <Input style={{ marginTop: 8 }} value={c.postUrl} onChange={e => set({ postUrl: e.target.value })} placeholder="https://instagram.com/p/..." />
          )}
        </div>
      )}

      {step.type === "story_reply" && (
        <div>
          <Label>Reply must contain (optional)</Label>
          <Input value={c.keywords} onChange={e => set({ keywords: e.target.value })} placeholder="Leave empty to match all story replies" />
        </div>
      )}

      {["comment", "dm_keyword", "ad_comment", "story_reply"].includes(step.type) && (
        <div>
          <Label>Also auto-like their comment?</Label>
          <Toggle on={c.autoLike} onChange={() => set({ autoLike: !c.autoLike })} label="Auto-like comment when triggered" />
        </div>
      )}

      {["comment", "dm_keyword"].includes(step.type) && (
        <div>
          <Label>Public comment reply (optional)</Label>
          <Input value={c.publicReply} onChange={e => set({ publicReply: e.target.value })} placeholder="Check your DMs! 📩" />
          <div style={{ fontSize: 11, color: DS.ink3, marginTop: 4 }}>Visible reply posted under their comment</div>
        </div>
      )}
    </div>
  );
}

function MessageFields({ step, update }) {
  const c = step.config || {};
  const set = patch => update({ ...step, config: { ...c, ...patch } });
  const textRef = useRef(null);
  const insertVar = v => {
    const el = textRef.current;
    if (!el) { set({ text: (c.text || "") + v }); return; }
    const s = el.selectionStart, e = el.selectionEnd;
    const val = (c.text || "");
    set({ text: val.slice(0, s) + v + val.slice(e) });
    setTimeout(() => el.setSelectionRange(s + v.length, s + v.length), 0);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <Label>Message text</Label>
        <textarea ref={textRef} value={c.text || ""} onChange={e => set({ text: e.target.value })}
          placeholder="Hey {first_name}! 👋 ..." rows={4}
          style={{ width: "100%", padding: "9px 12px", borderRadius: DS.radiusSm, border: `1.5px solid ${DS.border}`, fontSize: 13, fontFamily: "inherit", background: DS.bg, color: DS.ink, outline: "none", boxSizing: "border-box", resize: "vertical" }}
          onFocus={e => { e.target.style.borderColor = DS.accent; e.target.style.boxShadow = `0 0 0 3px ${DS.accentSoft}`; }}
          onBlur={e => { e.target.style.borderColor = DS.border; e.target.style.boxShadow = "none"; }}
        />
        <VarPills onInsert={insertVar} />
      </div>
      <div>
        <Label>Delay before sending</Label>
        <div style={{ display: "flex", gap: 8 }}>
          <Input type="number" value={c.delayVal} onChange={e => set({ delayVal: e.target.value })} placeholder="0" style={{ flex: 1 }} />
          <Select value={c.delayUnit || "seconds"} onChange={e => set({ delayUnit: e.target.value })} style={{ flex: 1 }} options={[
            { value: "seconds", label: "Seconds" }, { value: "minutes", label: "Minutes" },
          ]} />
        </div>
      </div>
    </div>
  );
}

function QuickReplyFields({ step, update }) {
  const c = step.config || {};
  const set = patch => update({ ...step, config: { ...c, ...patch } });
  const opts = (c.options || "").split("|").map(o => o.trim()).filter(Boolean);
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

function ConditionFields({ step, update }) {
  const c = step.config || {};
  const set = patch => update({ ...step, config: { ...c, ...patch } });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <Label>Check type</Label>
        <Select value={c.condType || "reply_contains"} onChange={e => set({ condType: e.target.value })} options={[
          { value: "reply_contains", label: "Last reply contains keyword" },
          { value: "has_tag", label: "Contact has tag" },
          { value: "field_equals", label: "Custom field equals value" },
          { value: "email_collected", label: "Email was collected" },
          { value: "is_follower", label: "User is a follower" },
          { value: "link_clicked", label: "Link was clicked" },
          { value: "button_tapped", label: "Button was tapped" },
        ]} />
      </div>
      {["reply_contains", "has_tag", "field_equals"].includes(c.condType || "reply_contains") && (
        <div>
          <Label>{c.condType === "has_tag" ? "Tag name" : c.condType === "field_equals" ? "Field = Value" : "Keyword(s)"}</Label>
          <Input value={c.condition} onChange={e => set({ condition: e.target.value })} placeholder={c.condType === "field_equals" ? "field_name = value" : "keyword1 OR keyword2"} />
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <div style={{ background: DS.greenSoft, border: `1.5px solid #86EFAC`, borderRadius: DS.radiusSm, padding: "10px 12px" }}>
          <div style={{ fontSize: 10.5, fontWeight: 800, color: DS.green, marginBottom: 3 }}>✅ IF TRUE</div>
          <div style={{ fontSize: 12, color: DS.ink2 }}>Continues to next step</div>
        </div>
        <div style={{ background: "#FFF1F0", border: "1.5px solid #FCA5A5", borderRadius: DS.radiusSm, padding: "10px 12px" }}>
          <div style={{ fontSize: 10.5, fontWeight: 800, color: "#DC2626", marginBottom: 3 }}>✗ IF FALSE</div>
          <Select value={c.onFalse || "end"} onChange={e => set({ onFalse: e.target.value })} style={{ padding: "4px 8px", fontSize: 11 }} options={[
            { value: "end", label: "End flow" },
            { value: "skip_to_end", label: "Skip to end step" },
          ]} />
        </div>
      </div>
    </div>
  );
}

function DelayFields({ step, update }) {
  const c = step.config || {};
  const set = patch => update({ ...step, config: { ...c, ...patch } });
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

function MediaFields({ step, update }) {
  const c = step.config || {};
  const set = patch => update({ ...step, config: { ...c, ...patch } });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div>
        <Label>Media type</Label>
        <Select value={c.mediaType || "image"} onChange={e => set({ mediaType: e.target.value })} options={[
          { value: "image", label: "🖼️ Image" }, { value: "gif", label: "🎞️ GIF" },
          { value: "video", label: "📹 Video (Reel/short)" },
        ]} />
      </div>
      <div>
        <Label>Media URL</Label>
        <Input value={c.url} onChange={e => set({ url: e.target.value })} placeholder="https://yourcdn.com/image.jpg" />
      </div>
      <div>
        <Label>Caption (optional)</Label>
        <Input value={c.caption} onChange={e => set({ caption: e.target.value })} placeholder="Check this out! 👀" />
      </div>
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

function StepFields({ step, update }) {
  const props = { step, update };
  if (step.kind === "trigger") return <TriggerFields {...props} />;
  const map = {
    message: MessageFields, quick_reply: QuickReplyFields, send_link: SendLinkFields,
    media: MediaFields, collect_email: CollectEmailFields, collect_phone: CollectEmailFields,
    ai_reply: AIReplyFields, ai_classify: AIClassifyFields, condition: ConditionFields,
    delay: DelayFields, random_split: RandomSplitFields, check_tag: CheckTagFields,
    follow_gate: FollowGateFields, tag: TagFields, set_field: SetFieldFields,
    notify_team: NotifyTeamFields, handoff: HandoffFields, zapier: ZapierFields, end: EndFields,
  };
  const Comp = map[step.type];
  return Comp ? <Comp {...props} /> : <div style={{ fontSize: 12, color: DS.ink3 }}>Configure this step</div>;
}

/* ============================================================
   STEP CARD
   ============================================================ */
function StepSummary({ step }) {
  const c = step.config || {};
  if (step.kind === "trigger") {
    const def = getTriggerDef(step.type);
    return <span style={{ color: def.color }}>{def.label}{c.keywords ? ` — "${c.keywords.split(",")[0].trim()}"` : ""}</span>;
  }
  const m = { message: c.text?.slice(0, 40), quick_reply: c.question?.slice(0, 40), send_link: c.url, collect_email: c.prompt?.slice(0, 40), ai_reply: c.instructions?.slice(0, 40), condition: c.condition, delay: c.duration ? `${c.duration} ${c.unit || "min"}` : null, tag: c.tags?.slice(0, 40), follow_gate: `If not follower: ${c.onFail || "ask"}`, end: c.note || "Flow ends" };
  const txt = m[step.type];
  return <span style={{ color: DS.ink3 }}>{txt ? (txt.length > 40 ? txt.slice(0, 40) + "…" : txt) : "Click to configure"}</span>;
}

function StepCard({ step, index, total, expanded, onToggle, onUpdate, onDelete, onDup, onMoveUp, onMoveDown }) {
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
        border: expanded ? `2px solid ${color}` : `1.5px solid ${DS.border}`,
        boxShadow: expanded ? `0 0 0 4px ${isTrigger ? def.color + "18" : "#1C191710"}, ${DS.shadowHover}` : DS.shadowCard,
        transition: "border-color 0.15s, box-shadow 0.15s",
      }}>
        {isTrigger && <div style={{ height: 3, background: `linear-gradient(90deg,${def.color},${def.color}66)` }} />}

        {/* HEADER */}
        <div onClick={onToggle} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", cursor: "pointer", userSelect: "none" }}>
          {/* Step number */}
          <div style={{
            width: 22, height: 22, borderRadius: 7, fontSize: 11, fontWeight: 800, flexShrink: 0, transition: "all 0.15s",
            background: expanded ? (isTrigger ? def.color : DS.ink) : DS.bg,
            color: expanded ? "#fff" : DS.ink3,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>{index + 1}</div>

          {/* Icon */}
          <div style={{
            width: 38, height: 38, borderRadius: 11, flexShrink: 0,
            background: isTrigger ? `${def.color}15` : "#F7F4EF",
            border: `1.5px solid ${isTrigger ? def.color + "30" : DS.border}`,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
          }}>{def.icon}</div>

          {/* Name & summary */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <input
                value={step.label}
                onClick={e => e.stopPropagation()}
                onChange={e => onUpdate({ ...step, label: e.target.value })}
                style={{ border: "none", background: "transparent", fontSize: 13.5, fontWeight: 700, color: DS.ink, outline: "none", fontFamily: "inherit", minWidth: 0, flex: 1 }}
              />
              {isTrigger && <Tag>{def.label}</Tag>}
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
            <StepFields step={step} update={onUpdate} />
          </div>
        )}
      </div>
    </div>
  );
}

function IconBtn({ children, onClick, danger, title }) {
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
function AddActionPicker({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState("Messaging");
  const filtered = ACTIONS.filter(a => a.cat === cat);
  return (
    <div style={{ position: "relative" }}>
      <button onClick={() => setOpen(!open)} style={{
        width: "100%", padding: 12, borderRadius: DS.radius, cursor: "pointer",
        border: `2px dashed ${open ? DS.accent : DS.border}`, background: open ? DS.accentSoft : "transparent",
        color: DS.accent, fontSize: 13, fontWeight: 700, fontFamily: "inherit",
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.15s",
      }}
        onMouseEnter={e => { if (!open) { e.currentTarget.style.borderColor = DS.accentBorder; e.currentTarget.style.background = DS.accentSoft; } }}
        onMouseLeave={e => { if (!open) { e.currentTarget.style.borderColor = DS.border; e.currentTarget.style.background = "transparent"; } }}
      >
        <span style={{ fontSize: 17, lineHeight: 1 }}>+</span> Add Action Step
      </button>

      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 98 }} />
          <div style={{
            position: "absolute", bottom: "calc(100% + 8px)", left: 0, right: 0, zIndex: 99,
            background: DS.card, borderRadius: DS.radius, border: `1.5px solid ${DS.border}`,
            boxShadow: "0 12px 40px rgba(28,25,23,0.14)", overflow: "hidden",
          }}>
            {/* Category tabs */}
            <div style={{ display: "flex", borderBottom: `1px solid ${DS.border}`, padding: "8px 8px 0", gap: 2, overflowX: "auto" }}>
              {ACTION_CATS.map(c => (
                <button key={c} onClick={() => setCat(c)} style={{
                  padding: "6px 12px", borderRadius: "8px 8px 0 0", fontSize: 11.5, fontWeight: 700,
                  border: "none", cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
                  background: cat === c ? DS.accentSoft : "transparent",
                  color: cat === c ? DS.accent : DS.ink3,
                  borderBottom: cat === c ? `2px solid ${DS.accent}` : "2px solid transparent",
                }}>{c}</button>
              ))}
            </div>
            {/* Items */}
            <div style={{ padding: 10, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {filtered.map(a => (
                <button key={a.id} onClick={() => { onAdd(a.id); setOpen(false); }} style={{
                  display: "flex", alignItems: "flex-start", gap: 9, padding: "10px 11px", borderRadius: DS.radiusSm,
                  border: `1.5px solid ${DS.border}`, background: "#fff", cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                  transition: "all 0.12s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = DS.accentBorder; e.currentTarget.style.background = DS.accentSoft; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = DS.border; e.currentTarget.style.background = "#fff"; }}
                >
                  <span style={{ fontSize: 18, lineHeight: 1.2, flexShrink: 0 }}>{a.icon}</span>
                  <div>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: DS.ink }}>{a.label}</div>
                    <div style={{ fontSize: 10.5, color: DS.ink3, marginTop: 1 }}>{a.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ============================================================
   TRIGGER EMPTY STATE
   ============================================================ */
function TriggerEmptyState({ onAdd }) {
  return (
    <div style={{ borderRadius: DS.radius, border: `2px dashed ${DS.accentBorder}`, background: DS.accentSoft, padding: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
        <span style={{ fontSize: 22 }}>⚡</span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 800, color: DS.accent }}>Set your trigger</div>
          <div style={{ fontSize: 12, color: DS.ink2, marginTop: 1 }}>What starts this automation?</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {TRIGGERS.slice(0, 6).map(t => (
          <button key={t.id} onClick={() => onAdd(t.id)} style={{
            display: "flex", alignItems: "center", gap: 8, padding: "9px 11px", borderRadius: DS.radiusSm,
            border: `1.5px solid ${t.color}25`, background: `${t.color}0A`, cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "all 0.12s",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = `${t.color}18`; e.currentTarget.style.borderColor = `${t.color}60`; }}
            onMouseLeave={e => { e.currentTarget.style.background = `${t.color}0A`; e.currentTarget.style.borderColor = `${t.color}25`; }}
          >
            <span style={{ fontSize: 16 }}>{t.icon}</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: t.color }}>{t.label}</div>
              <div style={{ fontSize: 10, color: DS.ink3 }}>{t.desc.slice(0, 28)}…</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   TEMPLATE MODAL
   ============================================================ */
function TemplateModal({ onSelect, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(28,25,23,0.5)", backdropFilter: "blur(6px)" }} />
      <div style={{
        background: DS.card, borderRadius: DS.radius + 4, padding: 28, width: 560, maxWidth: "92vw",
        zIndex: 301, boxShadow: "0 24px 80px rgba(28,25,23,0.22)",
        maxHeight: "88vh", overflowY: "auto",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 900, color: DS.ink, letterSpacing: "-0.02em" }}>Start from a template</div>
            <div style={{ fontSize: 12.5, color: DS.ink3, marginTop: 3 }}>Proven flows used by 10,000+ creators</div>
          </div>
          <IconBtn onClick={onClose}>✕</IconBtn>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {TEMPLATES.map(t => (
            <button key={t.id} onClick={() => { onSelect(t); onClose(); }} style={{
              display: "flex", alignItems: "center", gap: 16, padding: "16px 18px",
              borderRadius: DS.radius, border: `1.5px solid ${DS.border}`, background: "#fff",
              cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "all 0.15s",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = DS.accentBorder; e.currentTarget.style.background = DS.accentSoft; e.currentTarget.style.boxShadow = DS.shadowHover; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = DS.border; e.currentTarget.style.background = "#fff"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <span style={{ fontSize: 34, flexShrink: 0 }}>{t.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: DS.ink }}>{t.name}</div>
                  <Tag>{t.badge}</Tag>
                </div>
                <div style={{ fontSize: 12.5, color: DS.ink2 }}>{t.desc}</div>
                <div style={{ fontSize: 11, color: DS.ink3, marginTop: 4 }}>{t.steps.length} steps</div>
              </div>
              <span style={{ fontSize: 18, color: DS.ink3, flexShrink: 0 }}>→</span>
            </button>
          ))}
          <button onClick={() => { onSelect({ steps: [] }); onClose(); }} style={{
            padding: "14px", borderRadius: DS.radius, border: `2px dashed ${DS.border}`,
            background: "transparent", cursor: "pointer", fontSize: 13, fontWeight: 700, color: DS.ink3, fontFamily: "inherit",
            transition: "all 0.15s",
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = DS.ink3; e.currentTarget.style.color = DS.ink; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = DS.border; e.currentTarget.style.color = DS.ink3; }}
          >
            Start from Scratch
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   PHONE PREVIEW
   ============================================================ */
function buildPreviewMsgs(steps) {
  const out = [];
  steps.forEach(s => {
    const c = s.config || {};
    if (s.kind === "trigger") {
      const def = getTriggerDef(s.type);
      out.push({ type: "sys", text: `Triggered: ${def.label}` });
      if (c.keywords) out.push({ type: "user", text: c.keywords.split(",")[0].trim() });
      else if (s.type === "story_reply") out.push({ type: "user", text: "↩️ Replied to your story" });
      else if (s.type === "new_follower") out.push({ type: "sys", text: "Alex just followed you" });
    } else if (s.type === "message") {
      if (c.text) out.push({ type: "bot", text: c.text.replace(/{first_name}/g, "Alex").replace(/{username}/g, "@alex") });
    } else if (s.type === "quick_reply") {
      const opts = (c.options || "").split("|").map(o => o.trim()).filter(Boolean);
      out.push({ type: "bot", text: c.question || "Which option?", opts });
    } else if (s.type === "send_link") {
      out.push({ type: "bot", text: c.text || "Here you go! 👇", link: { label: c.btnLabel || "Open Link →", url: c.url } });
    } else if (s.type === "ai_reply") {
      out.push({ type: "bot", text: `🤖 ${c.instructions ? c.instructions.slice(0, 52) + "…" : "AI crafting a response…"}` });
    } else if (s.type === "collect_email") {
      out.push({ type: "bot", text: c.prompt || "Can I get your email? 📩" });
      out.push({ type: "user", text: "alex@example.com" });
    } else if (s.type === "collect_phone") {
      out.push({ type: "bot", text: c.prompt || "What's your phone number? 📱" });
      out.push({ type: "user", text: "+1 555 0192" });
    } else if (s.type === "delay") {
      out.push({ type: "sys", text: `⏱ Wait ${c.duration || "?"} ${c.unit || "min"}` });
    } else if (s.type === "follow_gate") {
      out.push({ type: "sys", text: "🔒 Checking follower status…" });
    } else if (s.type === "condition") {
      out.push({ type: "sys", text: `🔀 Check: ${c.condition || "condition"}` });
    } else if (s.type === "tag") {
      out.push({ type: "sys", text: `🏷️ Tagged: ${c.tags || "contact"}` });
    } else if (s.type === "handoff") {
      out.push({ type: "bot", text: c.message || "Connecting you with our team! 👥" });
      out.push({ type: "sys", text: "Transferred to live agent" });
    } else if (s.type === "media") {
      out.push({ type: "bot", text: c.caption || "📷 [Image/GIF]", isMedia: true });
    } else if (s.type === "zapier") {
      out.push({ type: "sys", text: `⚡ Sent to ${c.integrationLabel || c.label || "Zapier"}` });
    } else if (s.type === "random_split") {
      out.push({ type: "sys", text: `🎲 A/B Split (${c.ratioA || 50}% / ${100 - (parseInt(c.ratioA) || 50)}%)` });
    } else if (s.type === "end") {
      if (c.note) out.push({ type: "bot", text: c.note });
      out.push({ type: "sys", text: `✅ Flow complete${c.outcome ? ` — ${c.outcome}` : ""}` });
    } else if (s.type === "notify_team") {
      out.push({ type: "sys", text: `🔔 Team notified via ${c.via || "email"}` });
    }
  });
  return out;
}

function PreviewBubble({ msg }) {
  if (msg.type === "sys") return (
    <div style={{ textAlign: "center", margin: "6px 0" }}>
      <span style={{ fontSize: 10, color: "#94A3B8", background: "#F1F5F9", borderRadius: 99, padding: "3px 10px", lineHeight: 1.5 }}>{msg.text}</span>
    </div>
  );
  const isUser = msg.type === "user";
  return (
    <div style={{ display: "flex", justifyContent: isUser ? "flex-end" : "flex-start", marginBottom: 7, gap: 6, alignItems: "flex-end" }}>
      {!isUser && (
        <div style={{ width: 22, height: 22, borderRadius: "50%", background: `linear-gradient(135deg,${DS.accent},#F97316)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, flexShrink: 0, marginBottom: 2 }}>🤖</div>
      )}
      <div style={{ maxWidth: 175 }}>
        <div style={{
          background: isUser ? DS.ink : "#fff", color: isUser ? "#fff" : DS.ink,
          borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
          padding: msg.isMedia ? "4px" : "8px 11px", fontSize: 12.5, lineHeight: 1.5,
          boxShadow: isUser ? "none" : "0 1px 4px rgba(0,0,0,0.07)",
        }}>
          {msg.isMedia ? <div style={{ width: 140, height: 90, borderRadius: 10, background: "linear-gradient(135deg,#E7E2DA,#C9C2B8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🖼️</div> : msg.text}
        </div>
        {msg.link && (
          <div style={{ marginTop: 5, background: "#F7F4EF", border: `1.5px solid ${DS.border}`, borderRadius: 10, padding: "7px 10px", display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 11 }}>🔗</span>
            <span style={{ fontSize: 11.5, color: DS.accent, fontWeight: 700 }}>{msg.link.label}</span>
          </div>
        )}
        {msg.opts && msg.opts.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6 }}>
            {msg.opts.map((o, i) => (
              <div key={i} style={{ background: "#fff", border: `1.5px solid ${DS.accentBorder}`, color: DS.accent, borderRadius: 20, padding: "5px 11px", fontSize: 11.5, fontWeight: 700, textAlign: "center" }}>{o}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PhonePreview({ steps }) {
  const msgs = buildPreviewMsgs(steps);
  const scrollRef = useRef(null);
  useEffect(() => { scrollRef.current?.scrollTo({ top: 9999, behavior: "smooth" }); }, [msgs.length]);

  const botMsgs = steps.filter(s => ["message", "quick_reply", "send_link", "ai_reply", "media"].includes(s.type)).length;
  const hasEmail = steps.some(s => s.type === "collect_email");
  const hasTrigger = steps.some(s => s.kind === "trigger");

  return (
    <div style={{ width: 248, flexShrink: 0, display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Label */}
      <div style={{ fontSize: 10.5, fontWeight: 800, color: DS.ink3, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Live Preview</div>

      {/* Phone */}
      <div style={{
        width: 248, borderRadius: 40, background: "#18181B",
        padding: "8px 7px 14px",
        boxShadow: "0 24px 70px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(255,255,255,0.07)",
      }}>
        {/* Notch */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
          <div style={{ width: 60, height: 5, borderRadius: 99, background: "#2D2D36" }} />
        </div>
        {/* Screen */}
        <div style={{ borderRadius: 32, overflow: "hidden", background: "#F1F5F9" }}>
          {/* IG DM header */}
          <div style={{ background: "#fff", padding: "10px 14px", borderBottom: "1px solid #E2E8F0", display: "flex", alignItems: "center", gap: 9 }}>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: `linear-gradient(135deg,${DS.accent},#F97316)`, padding: 2, flexShrink: 0 }}>
              <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15 }}>🤖</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 12.5, fontWeight: 800, color: "#18181B" }}>AutoBot</div>
              <div style={{ fontSize: 10, color: DS.green }}>● Active now</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <span style={{ fontSize: 15 }}>📞</span>
              <span style={{ fontSize: 15 }}>📹</span>
            </div>
          </div>
          {/* Messages */}
          <div ref={scrollRef} style={{ padding: "12px 10px", minHeight: 240, maxHeight: 300, overflowY: "auto" }}>
            {msgs.length === 0
              ? <div style={{ textAlign: "center", paddingTop: 55, color: DS.ink3, fontSize: 12 }}><div style={{ fontSize: 28, marginBottom: 8 }}>👆</div>Add steps to preview</div>
              : msgs.map((m, i) => <PreviewBubble key={i} msg={m} />)
            }
          </div>
          {/* Input */}
          <div style={{ background: "#fff", padding: "8px 10px", display: "flex", gap: 7, alignItems: "center", borderTop: "1px solid #E2E8F0" }}>
            <div style={{ flex: 1, background: "#F1F5F9", borderRadius: 18, height: 30, display: "flex", alignItems: "center", paddingLeft: 11, fontSize: 11.5, color: "#94A3B8" }}>Message…</div>
            <div style={{ width: 28, height: 28, borderRadius: "50%", background: `linear-gradient(135deg,${DS.accent},#F97316)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#fff" }}>▶</div>
          </div>
        </div>
        {/* Home bar */}
        <div style={{ display: "flex", justifyContent: "center", marginTop: 8 }}>
          <div style={{ width: 72, height: 4, borderRadius: 99, background: "#2D2D36" }} />
        </div>
      </div>

      {/* Stats */}
      <div style={{ marginTop: 14, width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
        {[
          { label: "Total Steps", val: steps.length, ok: steps.length > 0 },
          { label: "Has Trigger", val: hasTrigger ? "✓ Yes" : "✗ No", ok: hasTrigger },
          { label: "Bot Messages", val: botMsgs, ok: botMsgs > 0 },
          { label: "Collects Email", val: hasEmail ? "✓" : "—", ok: hasEmail },
        ].map(s => (
          <div key={s.label} style={{ background: DS.card, borderRadius: DS.radiusSm, padding: "8px 10px", border: `1.5px solid ${DS.border}`, textAlign: "center" }}>
            <div style={{ fontSize: 15, fontWeight: 900, color: s.ok ? DS.accent : DS.ink3, letterSpacing: "-0.02em" }}>{s.val}</div>
            <div style={{ fontSize: 10, color: DS.ink3, fontWeight: 600, marginTop: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Flow health */}
      {steps.length > 0 && (
        <div style={{ marginTop: 10, width: "100%", background: DS.card, borderRadius: DS.radiusSm, border: `1.5px solid ${DS.border}`, padding: "11px 12px" }}>
          <div style={{ fontSize: 10.5, fontWeight: 800, color: DS.ink3, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>Flow Health</div>
          {[
            { ok: hasTrigger, msg: hasTrigger ? "Trigger configured" : "Missing trigger" },
            { ok: botMsgs > 0, msg: botMsgs > 0 ? "Has message steps" : "No message steps" },
            { ok: !steps.some(s => s.kind === "action" && !s.config?.text && !s.config?.question && !s.config?.url && !s.config?.duration && !s.config?.tag && !s.config?.tags && !s.config?.instructions && !["follow_gate", "end", "random_split", "check_tag", "handoff", "notify_team", "set_field", "ai_classify"].includes(s.type)), msg: "All steps configured" },
          ].map((h, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: i < 2 ? 5 : 0 }}>
              <span style={{ fontSize: 12 }}>{h.ok ? "✅" : "⚠️"}</span>
              <span style={{ fontSize: 11.5, color: h.ok ? DS.green : DS.amber, fontWeight: 600 }}>{h.msg}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============================================================
   SETTINGS PANEL
   ============================================================ */
function SettingsPanel({ settings, setSettings }) {
  const set = patch => setSettings(s => ({ ...s, ...patch }));
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
export default function InstaDMBuilder() {
  const [steps, setSteps] = useState(() => TEMPLATES[0].steps.map(s => ({ ...s, id: uid() })));
  const [expandedId, setExpandedId] = useState(null);
  const [flowName, setFlowName] = useState("Story Reply Lead Funnel");
  const [isLive, setIsLive] = useState(false);
  const [tab, setTab] = useState("flow"); // flow | settings | analytics
  const [showTemplates, setShowTemplates] = useState(false);
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({ dmLimit: 30, slowMode: true, humanize: true });
  const bottomRef = useRef(null);

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

  const addTrigger = (type) => {
    const def = getTriggerDef(type);
    const id = uid();
    setSteps(s => [{ id, kind: "trigger", type, label: def.label, config: {} }, ...s.filter(x => x.kind !== "trigger")]);
    setExpandedId(id);
  };
  const addAction = (type) => {
    const def = getActionDef(type);
    const id = uid();
    setSteps(s => [...s, { id, kind: "action", type, label: def.label, config: {} }]);
    setExpandedId(id);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
  };

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2200); };
  const hasTrigger = steps.some(s => s.kind === "trigger");
  const TABS = [{ id: "flow", icon: "📋", label: "Flow" }, { id: "settings", icon: "⚙️", label: "Settings" }, { id: "analytics", icon: "📊", label: "Analytics" }];

  return (
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
      `}</style>

      {showTemplates && <TemplateModal onSelect={t => { setSteps((t.steps || []).map(s => ({ ...s, id: uid() }))); setExpandedId(null); }} onClose={() => setShowTemplates(false)} />}

      {/* ── HEADER ─────────────────────────────────────────────── */}
      <div style={{ background: DS.card, borderBottom: `1.5px solid ${DS.border}`, padding: "12px 20px", display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 100, backdropFilter: "blur(8px)" }}>
        {/* Logo */}
        <div style={{ width: 34, height: 34, borderRadius: 10, background: `linear-gradient(135deg,${DS.accent},#F97316)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, flexShrink: 0 }}>⚡</div>

        {/* Flow name */}
        <input value={flowName} onChange={e => setFlowName(e.target.value)} style={{ flex: 1, border: "none", background: "transparent", fontSize: 15, fontWeight: 800, color: DS.ink, outline: "none", fontFamily: "inherit", letterSpacing: "-0.02em", minWidth: 0 }} />

        {/* Tabs */}
        <div style={{ display: "flex", background: DS.bg, borderRadius: 10, padding: 3, gap: 2, border: `1.5px solid ${DS.border}` }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: "5px 12px", borderRadius: 8, fontSize: 12, fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "inherit",
              background: tab === t.id ? DS.card : "transparent",
              color: tab === t.id ? DS.ink : DS.ink3,
              boxShadow: tab === t.id ? DS.shadow : "none",
              transition: "all 0.15s",
            }}>{t.icon} {t.label}</button>
          ))}
        </div>

        {/* Right actions */}
        <div style={{ display: "flex", gap: 7, flexShrink: 0 }}>
          <SmallBtn onClick={() => setShowTemplates(true)} icon="📋">Templates</SmallBtn>

          <button onClick={() => setIsLive(!isLive)} style={{
            padding: "6px 13px", borderRadius: 20, fontSize: 12, fontWeight: 700, border: `1.5px solid ${isLive ? DS.green : DS.border}`,
            background: isLive ? DS.greenSoft : DS.bg, color: isLive ? DS.green : DS.ink3, cursor: "pointer", fontFamily: "inherit",
            display: "flex", alignItems: "center", gap: 6, transition: "all 0.2s",
          }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: isLive ? DS.green : DS.ink3, display: "inline-block", boxShadow: isLive ? `0 0 6px ${DS.green}` : "none", transition: "all 0.2s" }} />
            {isLive ? "Live" : "Draft"}
          </button>

          <button onClick={handleSave} style={{
            padding: "6px 13px", borderRadius: 20, fontSize: 12, fontWeight: 700, border: `1.5px solid ${saved ? DS.green : DS.border}`,
            background: saved ? DS.greenSoft : DS.bg, color: saved ? DS.green : DS.ink2, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s",
          }}>{saved ? "✓ Saved!" : "💾 Save"}</button>

          <button onClick={() => hasTrigger && setIsLive(true)} style={{
            padding: "7px 18px", borderRadius: 20, fontSize: 13, fontWeight: 800, border: "none", fontFamily: "inherit",
            background: hasTrigger ? `linear-gradient(135deg,${DS.accent},#F97316)` : DS.border,
            color: hasTrigger ? "#fff" : DS.ink3, cursor: hasTrigger ? "pointer" : "not-allowed",
            boxShadow: hasTrigger ? "0 4px 16px rgba(232,69,10,0.3)" : "none", transition: "all 0.2s",
          }} title={!hasTrigger ? "Add a trigger first" : "Publish flow"}>
            ▶ Publish
          </button>
        </div>
      </div>

      {/* ── BODY ────────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "22px 18px", display: "flex", gap: 22, alignItems: "flex-start" }}>

        {/* ── LEFT: FLOW / SETTINGS / ANALYTICS ─── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {tab === "flow" && (
            <>
              {/* Trigger section */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: DS.accent, letterSpacing: "0.1em", textTransform: "uppercase" }}>⚡ Trigger</span>
                  {!hasTrigger && <Tag>Required</Tag>}
                </div>

                {hasTrigger
                  ? steps.filter(s => s.kind === "trigger").map(s => {
                    const gi = steps.indexOf(s);
                    return (
                      <StepCard key={s.id} step={s} index={gi} total={steps.length}
                        expanded={expandedId === s.id} onToggle={() => setExpandedId(expandedId === s.id ? null : s.id)}
                        onUpdate={data => updateStep(s.id, data)} onDelete={() => deleteStep(s.id)}
                        onDup={() => dupStep(s.id)} onMoveUp={() => moveUp(gi)} onMoveDown={() => moveDown(gi)}
                      />
                    );
                  })
                  : <TriggerEmptyState onAdd={addTrigger} />
                }
              </div>

              {/* Divider */}
              {hasTrigger && (
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
                  <div style={{ height: 1, flex: 1, background: DS.border }} />
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: DS.ink3, letterSpacing: "0.1em", textTransform: "uppercase" }}>💬 Actions</span>
                  <div style={{ height: 1, flex: 1, background: DS.border }} />
                </div>
              )}

              {/* Action steps */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {steps.filter(s => s.kind === "action").map(s => {
                  const gi = steps.indexOf(s);
                  return (
                    <StepCard key={s.id} step={s} index={gi} total={steps.length}
                      expanded={expandedId === s.id} onToggle={() => setExpandedId(expandedId === s.id ? null : s.id)}
                      onUpdate={data => updateStep(s.id, data)} onDelete={() => deleteStep(s.id)}
                      onDup={() => dupStep(s.id)} onMoveUp={() => moveUp(gi)} onMoveDown={() => moveDown(gi)}
                    />
                  );
                })}
              </div>

              {/* Add + empty */}
              <div style={{ marginTop: 16 }} ref={bottomRef}>
                {hasTrigger
                  ? <AddActionPicker onAdd={addAction} />
                  : (
                    <div style={{ textAlign: "center", paddingTop: 28, color: DS.ink3 }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>✦</div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: DS.ink2 }}>Choose a trigger to get started</div>
                      <div style={{ fontSize: 12, marginTop: 4 }}>Or pick a ready-made template above</div>
                      <button onClick={() => setShowTemplates(true)} style={{
                        marginTop: 14, padding: "9px 22px", borderRadius: 20, background: `linear-gradient(135deg,${DS.accent},#F97316)`,
                        color: "#fff", border: "none", fontSize: 13, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
                        boxShadow: "0 4px 16px rgba(232,69,10,0.25)",
                      }}>Browse Templates →</button>
                    </div>
                  )
                }
              </div>
            </>
          )}

          {tab === "settings" && <SettingsPanel settings={settings} setSettings={setSettings} />}
          {tab === "analytics" && <AnalyticsPanel />}
        </div>

        {/* ── RIGHT: PHONE PREVIEW ─── */}
        <PhonePreview steps={steps} />
      </div>
    </div>
  );
}