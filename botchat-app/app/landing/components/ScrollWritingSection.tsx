"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence, animate } from "framer-motion";

// ─── PLATFORM ICONS ───────────────────────────────────────────────────────────

const InstagramIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="2" y="2" width="20" height="20" rx="6" fill="url(#ig2)" />
    <circle cx="12" cy="12" r="4.5" stroke="white" strokeWidth="1.8" fill="none" />
    <circle cx="17.5" cy="6.5" r="1.2" fill="white" />
    <defs>
      <linearGradient id="ig2" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F9CE34" />
        <stop offset="0.35" stopColor="#EE2A7B" />
        <stop offset="1" stopColor="#6228D7" />
      </linearGradient>
    </defs>
  </svg>
);

const FacebookIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="6" fill="#1877F2" />
    <path d="M16 8h-2a1 1 0 0 0-1 1v2h3l-.5 3H13v7h-3v-7H8v-3h2V9a4 4 0 0 1 4-4h2v3z" fill="white" />
  </svg>
);

const MessengerIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" fill="url(#ms2)" />
    <path d="M12 6C8.686 6 6 8.462 6 11.5c0 1.67.784 3.163 2.017 4.176V18l1.907-1.047A6.3 6.3 0 0 0 12 17c3.314 0 6-2.462 6-5.5S15.314 6 12 6zm.6 7.4-1.5-1.6-2.9 1.7 3.2-3.4 1.5 1.6 2.9-1.7-3.2 3.4z" fill="white" />
    <defs>
      <linearGradient id="ms2" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
        <stop stopColor="#00B2FF" /><stop offset="1" stopColor="#006AFF" />
      </linearGradient>
    </defs>
  </svg>
);

const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="6" fill="#25D366" />
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" fill="white" />
  </svg>
);

const LinkedInIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect width="24" height="24" rx="6" fill="#0A66C2" />
    <path d="M7 9h2v8H7V9zm1-1.5a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zM11 9h1.9v1.1C13.3 9.4 14 9 15 9c2 0 3 1.2 3 3.3V17h-2v-4.4c0-1-.4-1.6-1.2-1.6-.9 0-1.8.6-1.8 2V17H11V9z" fill="white" />
  </svg>
);

// ─── DATA ─────────────────────────────────────────────────────────────────────

const PLATFORMS = [
  { id: "instagram", label: "Instagram", Icon: InstagramIcon, color: "#EE2A7B", connected: true },
  { id: "facebook", label: "Facebook", Icon: FacebookIcon, color: "#1877F2", connected: true },
  { id: "messenger", label: "Messenger", Icon: MessengerIcon, color: "#006AFF", connected: false },
  { id: "whatsapp", label: "WhatsApp", Icon: WhatsAppIcon, color: "#25D366", connected: true },
  { id: "linkedin", label: "LinkedIn", Icon: LinkedInIcon, color: "#0A66C2", connected: false },
];

const MESSAGES = [
  { id: "m1", type: "them", avatar: "fb", text: "Can I get the link for this? 🙋", orbitAngle: 200, orbitR: 148, entryFrom: "left" },
  { id: "m2", type: "me", avatar: "fb", text: "Sent to your inbox! Check DMs ⚡", orbitAngle: 138, orbitR: 148, entryFrom: "right" },
  { id: "m3", type: "them", avatar: "ig", text: "This tool is a scam 😡 (HIDDEN)", orbitAngle: 258, orbitR: 153, entryFrom: "left" },
  { id: "m4", type: "them", avatar: "ms", text: "Interested in the board program", orbitAngle: 298, orbitR: 144, entryFrom: "bottom" },
  { id: "m5", type: "me", avatar: "wa", text: "Hi! Bot replied instantly 🤖", orbitAngle: 72, orbitR: 148, entryFrom: "right" },
  { id: "m6", type: "them", avatar: "li", text: "Got the DM, signed up! 🔗", orbitAngle: 18, orbitR: 151, entryFrom: "top" },
  { id: "m7", type: "them", avatar: "fb", text: "3× more leads this week 🚀", orbitAngle: 328, orbitR: 146, entryFrom: "left" },
];

const STAGES = [
  {
    badge: "Comment Manager",
    headline: "10x leads.\nAuto replies.",
    sub: "Every comment on your posts is handled instantly.",
    detail: "Instantly reply to fans, send private links, and turn casual observers into qualified leads with zero manual effort.",
    stat: { value: "10x", label: "engagement boost" },
  },
  {
    badge: "Full Page Protection",
    headline: "Zero trolls.\nSafe brand.",
    sub: "Protect your brand reputation while you sleep.",
    detail: "LinkDM automatically hides or deletes trolls and spam based on your global keywords, keeping your community safe and clean.",
    stat: { value: "100%", label: "automated moderation" },
  },
  {
    badge: "Global Campaigns",
    headline: "All posts.\nOne rule.",
    sub: "Orchestrate automation across every single post.",
    detail: "Set up Full Page Campaigns to deliver resources or generic welcomes to every user who interacts with any of your posts.",
    stat: { value: "∞", label: "global reach" },
  },
  {
    badge: "Growth Results",
    headline: "More sales.\nLess work.",
    sub: "Real numbers from real professional creators.",
    detail: "Creators using LinkDM see 3× more leads from DMs and 10× faster response times, allowing them to scale without burnout.",
    stat: { value: "3×", label: "lead conversion" },
  },
];

const STAGE_THRESHOLDS = [0, 0.18, 0.5, 0.78];

const PLATFORM_ICONS: Record<string, React.FC<{ size?: number }>> = {
  ig: InstagramIcon, fb: FacebookIcon, ms: MessengerIcon, wa: WhatsAppIcon, li: LinkedInIcon,
};
const PLATFORM_COLORS: Record<string, string> = {
  ig: "#EE2A7B", fb: "#1877F2", ms: "#006AFF", wa: "#25D366", li: "#0A66C2",
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function easeOut(t: number) { return 1 - Math.pow(1 - t, 3); }

// ─── BUBBLE ───────────────────────────────────────────────────────────────────

interface BubbleStyle { opacity: number; transform: string; }

function ChatBubble({ message, style }: { message: typeof MESSAGES[0]; style: BubbleStyle }) {
  const isMe = message.type === "me";
  const PlatIcon = PLATFORM_ICONS[message.avatar];
  const col = PLATFORM_COLORS[message.avatar];

  return (
    <div style={{ position: "absolute", left: 0, top: 0, opacity: style.opacity, transform: style.transform, willChange: "transform,opacity", pointerEvents: "none", zIndex: 10 }}>
      <div style={{
        position: "relative", padding: "10px 14px",
        borderRadius: 18,
        borderBottomLeftRadius: isMe ? 18 : 3,
        borderBottomRightRadius: isMe ? 3 : 18,
        maxWidth: 215, fontSize: 13, lineHeight: 1.45, whiteSpace: "nowrap",
        background: isMe
          ? "linear-gradient(135deg, #e8175d 0%, #ff6eb4 100%)"
          : "#ffffff",
        color: isMe ? "#fff" : "#1a1235",
        boxShadow: isMe
          ? "0 8px 28px rgba(232,23,93,0.28)"
          : "0 4px 20px rgba(180,60,120,0.10)",
        border: isMe ? "none" : "1.5px solid rgba(232,23,93,0.10)",
      }}>
        <div style={{
          position: "absolute", bottom: -6,
          ...(isMe ? { right: -6 } : { left: -6 }),
          width: 20, height: 20, borderRadius: "50%",
          border: "2px solid #fff",
          overflow: "hidden",
          display: "flex", alignItems: "center", justifyContent: "center",
          background: col, boxShadow: `0 2px 8px ${col}55`,
        }}>
          <PlatIcon size={12} />
        </div>
        {message.text}
      </div>
    </div>
  );
}

// ─── SIDEBAR ──────────────────────────────────────────────────────────────────

function Sidebar() {
  const [connected, setConnected] = useState<Record<string, boolean>>(
    Object.fromEntries(PLATFORMS.map(p => [p.id, p.connected]))
  );
  const [activeFilter, setActiveFilter] = useState("all");

  const stats = [
    { label: "DMs sent today", value: "2,841", trend: "+24%", up: true },
    { label: "Avg delivery", value: "0.8s", trend: "↓ 91%", up: true },
    { label: "Leads captured", value: "487", trend: "+54%", up: true },
  ];

  return (
    <div style={{
      width: 218, flexShrink: 0, height: "100vh",
      display: "flex", flexDirection: "column",
      background: "rgba(255,255,255,0.72)",
      backdropFilter: "blur(20px)",
      borderRight: "1.5px solid rgba(232,23,93,0.10)",
      padding: "26px 0",
    }}>
      {/* Logo */}
      <div style={{ padding: "0 18px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 11,
            background: "linear-gradient(135deg,#e8175d,#ff8cc8)",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 18px rgba(232,23,93,0.30)",
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div style={{ color: "#1a1235", fontWeight: 800, fontSize: 15, letterSpacing: "-0.03em" }}>LinkDM</div>
            <div style={{ color: "#e8175d", fontSize: 10, letterSpacing: "0.07em", fontWeight: 600 }}>REPLY BOT AI</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ padding: "0 13px 16px", display: "flex", flexDirection: "column", gap: 7 }}>
        {stats.map(s => (
          <div key={s.label} style={{
            background: "linear-gradient(135deg,rgba(232,23,93,0.04),rgba(255,110,180,0.06))",
            borderRadius: 10, padding: "9px 11px",
            border: "1px solid rgba(232,23,93,0.10)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <div>
              <div style={{ color: "#7a4d73", fontSize: 10, letterSpacing: "0.03em", fontWeight: 500 }}>{s.label}</div>
              <div style={{ color: "#1a1235", fontSize: 17, fontWeight: 800, letterSpacing: "-0.03em" }}>{s.value}</div>
            </div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#16a34a", background: "rgba(22,163,74,0.10)", borderRadius: 6, padding: "3px 7px" }}>
              {s.trend}
            </div>
          </div>
        ))}
      </div>

      <div style={{ height: 1, background: "rgba(232,23,93,0.08)", margin: "0 13px 13px" }} />

      {/* Filter */}
      <div style={{ padding: "0 13px 13px" }}>
        <div style={{ color: "#c09ab0", fontSize: 10, letterSpacing: "0.08em", fontWeight: 600, marginBottom: 8 }}>INBOX FILTER</div>
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {["all", "unread", "leads", "starred"].map(f => (
            <button key={f} onClick={() => setActiveFilter(f)} style={{
              padding: "4px 9px", borderRadius: 6, fontSize: 11, fontWeight: 600,
              border: "1.5px solid",
              borderColor: activeFilter === f ? "transparent" : "rgba(232,23,93,0.12)",
              cursor: "pointer",
              background: activeFilter === f ? "linear-gradient(135deg,#e8175d,#ff8cc8)" : "transparent",
              color: activeFilter === f ? "#fff" : "#7a4d73",
              transition: "all 0.2s", textTransform: "capitalize",
            }}>{f}</button>
          ))}
        </div>
      </div>

      <div style={{ height: 1, background: "rgba(232,23,93,0.08)", margin: "0 13px 13px" }} />

      {/* Platforms */}
      <div style={{ padding: "0 13px", flex: 1 }}>
        <div style={{ color: "#c09ab0", fontSize: 10, letterSpacing: "0.08em", fontWeight: 600, marginBottom: 10 }}>CONNECTED PLATFORMS</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {PLATFORMS.map(p => (
            <div key={p.id}
              onClick={() => setConnected(c => ({ ...c, [p.id]: !c[p.id] }))}
              style={{
                display: "flex", alignItems: "center", gap: 9,
                padding: "8px 10px", borderRadius: 10,
                background: connected[p.id] ? "rgba(232,23,93,0.05)" : "transparent",
                border: `1.5px solid ${connected[p.id] ? "rgba(232,23,93,0.12)" : "transparent"}`,
                cursor: "pointer", transition: "all 0.22s",
              }}>
              <p.Icon size={18} />
              <span style={{ color: connected[p.id] ? "#1a1235" : "#c09ab0", fontSize: 13, fontWeight: 600, flex: 1 }}>{p.label}</span>
              <div style={{
                width: 28, height: 16, borderRadius: 8,
                background: connected[p.id] ? "linear-gradient(135deg,#e8175d,#ff8cc8)" : "rgba(200,160,190,0.25)",
                position: "relative", transition: "all 0.3s", flexShrink: 0,
              }}>
                <div style={{
                  position: "absolute", top: 2, left: connected[p.id] ? 14 : 2,
                  width: 12, height: 12, borderRadius: "50%",
                  background: "#fff", transition: "left 0.3s",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: "14px 13px 0" }}>
        <div style={{ height: 1, background: "rgba(232,23,93,0.08)", marginBottom: 14 }} />
        <button style={{
          width: "100%", padding: "12px", borderRadius: 12,
          background: "linear-gradient(135deg,#e8175d,#ff8cc8)",
          border: "none", color: "#fff", fontWeight: 700, fontSize: 13,
          cursor: "pointer", letterSpacing: "-0.01em",
          boxShadow: "0 4px 22px rgba(232,23,93,0.32)",
        }}>
          + Connect Platform
        </button>
      </div>
    </div>
  );
}

// ─── RIGHT PANEL ──────────────────────────────────────────────────────────────

function RightPanel({ stage }: { stage: number }) {
  const s = STAGES[stage];

  const features = [
    { icon: "💬", title: "Comment triggers", desc: "Keyword comment → instant DM" },
    { icon: "🤖", title: "AI reply bot", desc: "Replies in your brand voice, 24/7" },
    { icon: "🔗", title: "Smart link delivery", desc: "Send links, files & offers via DM" },
    { icon: "📈", title: "Lead qualification", desc: "Auto-tag & segment every lead" },
  ];

  return (
    <div className="w-full lg:w-[252px] h-auto lg:h-[100vh] shrink-0 flex flex-col justify-center px-6 lg:px-6 py-6 lg:py-10 bg-white/70 backdrop-blur-xl border-t lg:border-t-0 lg:border-l border-rose-500/10">
      {/* Badge */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stage + "badge"}
          initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            background: "linear-gradient(135deg,rgba(232,23,93,0.10),rgba(255,110,180,0.14))",
            border: "1.5px solid rgba(232,23,93,0.18)",
            borderRadius: 8, padding: "5px 11px",
            marginBottom: 16, alignSelf: "flex-start",
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#e8175d" }} />
          <span style={{ color: "#e8175d", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em" }}>
            {s.badge.toUpperCase()}
          </span>
        </motion.div>
      </AnimatePresence>

      {/* Headline */}
      <AnimatePresence mode="wait">
        <motion.h2
          key={stage + "h"}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.32 }}
          style={{
            color: "#1a1235", fontSize: 21, fontWeight: 800,
            lineHeight: 1.2, letterSpacing: "-0.03em",
            marginBottom: 10, whiteSpace: "pre-line",
          }}
        >
          {s.headline}
        </motion.h2>
      </AnimatePresence>

      {/* Sub */}
      <AnimatePresence mode="wait">
        <motion.p
          key={stage + "sub"}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          style={{ color: "#e8175d", fontSize: 12, fontWeight: 600, marginBottom: 10, letterSpacing: "0.01em" }}
        >
          {s.sub}
        </motion.p>
      </AnimatePresence>

      {/* Detail */}
      <AnimatePresence mode="wait">
        <motion.p
          key={stage + "d"}
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          style={{ color: "#6b5780", fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}
        >
          {s.detail}
        </motion.p>
      </AnimatePresence>

      {/* Stat pill */}
      <AnimatePresence mode="wait">
        <motion.div
          key={stage + "stat"}
          initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
          style={{
            display: "inline-flex", alignItems: "baseline", gap: 8,
            background: "linear-gradient(135deg,#e8175d,#ff8cc8)",
            borderRadius: 12, padding: "12px 18px",
            marginBottom: 22, alignSelf: "flex-start",
            boxShadow: "0 8px 24px rgba(232,23,93,0.22)",
          }}
        >
          <span style={{ color: "#fff", fontSize: 28, fontWeight: 800, letterSpacing: "-0.04em", lineHeight: 1 }}>{s.stat.value}</span>
          <span style={{ color: "rgba(255,255,255,0.80)", fontSize: 12, fontWeight: 500 }}>{s.stat.label}</span>
        </motion.div>
      </AnimatePresence>

      <div style={{ height: 1, background: "rgba(232,23,93,0.10)", marginBottom: 18 }} />

      {/* Features */}
      <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
            style={{ display: "flex", alignItems: "flex-start", gap: 10 }}
          >
            <div style={{
              width: 30, height: 30, borderRadius: 8, flexShrink: 0,
              background: "linear-gradient(135deg,rgba(232,23,93,0.08),rgba(255,110,180,0.12))",
              border: "1.5px solid rgba(232,23,93,0.12)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14,
            }}>{f.icon}</div>
            <div>
              <div style={{ color: "#1a1235", fontSize: 12, fontWeight: 700 }}>{f.title}</div>
              <div style={{ color: "#7a4d73", fontSize: 11, marginTop: 1 }}>{f.desc}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Progress pills */}
      <div style={{ display: "flex", gap: 5, marginTop: 26 }}>
        {STAGES.map((_, i) => (
          <div key={i} style={{
            height: 4, borderRadius: 2,
            width: i === stage ? 24 : 6,
            background: i === stage ? "#e8175d" : "rgba(232,23,93,0.14)",
            transition: "all 0.35s ease",
          }} />
        ))}
      </div>
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function ChatOrbitSection() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [bubbleStyles, setBubbleStyles] = useState<BubbleStyle[]>(
    MESSAGES.map(() => ({ opacity: 0, transform: "translate(0px,0px)" }))
  );
  const [ringOpacity, setRingOpacity] = useState(0);

  const currentStage = STAGE_THRESHOLDS.reduce(
    (acc, threshold, i) => (progress >= threshold ? i : acc), 0
  );

  const compute = useCallback((p: number) => {
    let orbitCx = window.innerWidth / 2;
    let cy = window.innerHeight / 2;
    
    if (orbitRef.current) {
        orbitCx = orbitRef.current.clientWidth / 2;
        cy = orbitRef.current.clientHeight / 2;
    }

    const styles = MESSAGES.map((m, i) => {
      const entryStart = 0.05 + i * 0.055;
      const entryEnd = entryStart + 0.12;
      const orbitStart = entryEnd;

      const ep = Math.max(0, Math.min(1, (p - entryStart) / (entryEnd - entryStart)));
      const eo = easeOut(ep);

      const orbitProgress = p > orbitStart ? (p - orbitStart) / (1 - orbitStart) : 0;
      const spin = orbitProgress * 55 * (i % 2 === 0 ? 1 : -1);
      const angle = ((m.orbitAngle + spin) * Math.PI) / 180;

      const tx = orbitCx + Math.cos(angle) * m.orbitR;
      const ty = cy + Math.sin(angle) * m.orbitR;

      let sx = orbitCx, sy = cy;
      if (m.entryFrom === "left") { sx = orbitCx - 600; sy = ty; }
      if (m.entryFrom === "right") { sx = orbitCx + 600; sy = ty; }
      if (m.entryFrom === "top") { sx = tx; sy = cy - 500; }
      if (m.entryFrom === "bottom") { sx = tx; sy = cy + 500; }

      const x = sx + (tx - sx) * eo;
      const y = sy + (ty - sy) * eo;

      const rotStart = m.type === "me" ? 26 : -26;
      const rot = rotStart * (1 - eo);
      const scY = 0.3 + 0.7 * eo;
      const scX = 0.7 + 0.3 * eo;

      const exitP = p > 0.93 ? (p - 0.93) / 0.05 : 0;
      const op = eo * (1 - easeOut(exitP));

      return {
        opacity: op,
        transform: `translate(${x - 110}px, ${y - 24}px) rotate(${rot}deg) scaleX(${scX}) scaleY(${scY})`,
      };
    });

    setBubbleStyles(styles);
    setRingOpacity(p > 0.28 ? Math.min(1, (p - 0.28) / 0.1) : 0);
  }, []);

  useEffect(() => {
    const controls = animate(0, 1, {
      duration: 12, // Loops the full sequence every 12 seconds
      ease: "linear",
      repeat: Infinity,
      onUpdate: (v) => {
        setProgress(v);
        compute(v);
      }
    });
    return () => controls.stop();
  }, [compute]);

  useEffect(() => {
    const onResize = () => compute(progress);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [progress, compute]);

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <div 
        className="min-h-[100dvh] w-full flex flex-col lg:flex-row overflow-hidden relative"
        style={{
          background: "linear-gradient(135deg, #fff5f8 0%, #fff 35%, #fce7f3 65%, #fdf2f8 100%)",
        }}
      >
        {/* Subtle pattern blobs */}
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, overflow: "hidden" }}>
          <div style={{ position: "absolute", top: "-10%", left: "25%", width: 560, height: 560, borderRadius: "50%", background: "radial-gradient(circle, rgba(232,23,93,0.07) 0%, transparent 70%)" }} />
          <div style={{ position: "absolute", bottom: "-15%", right: "20%", width: 420, height: 420, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,110,180,0.08) 0%, transparent 70%)" }} />
          <div style={{ position: "absolute", top: "40%", left: "0%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(238,42,123,0.05) 0%, transparent 70%)" }} />
        </div>

        {/* LEFT — Sidebar */}
        <div className="hidden lg:block relative z-10 shrink-0">
          <Sidebar />
        </div>

        {/* CENTER — Orbit */}
        <div ref={orbitRef} className="flex-1 w-full relative overflow-hidden min-h-[50vh] lg:min-h-screen">
          {/* Rings */}
          {[320, 220].map((size, ri) => (
            <div key={size} style={{
              position: "absolute", top: "50%", left: "50%",
              transform: "translate(-50%,-50%)",
              width: size, height: size, borderRadius: "50%",
              border: `1.5px dashed rgba(232,23,93,${ri === 0 ? 0.18 : 0.08})`,
              opacity: ri === 0 ? ringOpacity : ringOpacity * 0.5,
              transition: "opacity 0.4s", pointerEvents: "none",
            }} />
          ))}

          {/* Platform icons on orbit */}
          {PLATFORMS.map((p, i) => {
            const angle = (i / PLATFORMS.length) * 2 * Math.PI - Math.PI / 2;
            const r = 160;
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: ringOpacity, scale: 1 }}
                transition={{ delay: i * 0.09, type: "spring", stiffness: 280, damping: 18 }}
                style={{
                  position: "absolute",
                  top: `calc(50% + ${Math.sin(angle) * r}px)`,
                  left: `calc(50% + ${Math.cos(angle) * r}px)`,
                  transform: "translate(-50%,-50%)",
                  width: 38, height: 38, borderRadius: "50%",
                  background: "#fff",
                  border: `1.5px solid ${p.color}44`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: `0 4px 18px ${p.color}28, 0 0 0 4px ${p.color}0a`,
                  zIndex: 5,
                }}
              >
                <p.Icon size={20} />
              </motion.div>
            );
          })}

          {/* Center hub */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%,-50%)",
            zIndex: 6, pointerEvents: "none",
            display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
          }}>
            {/* Pulsing logo */}
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 0 0px rgba(232,23,93,0.22), 0 8px 28px rgba(232,23,93,0.25)",
                  "0 0 0 10px rgba(232,23,93,0.06), 0 8px 28px rgba(232,23,93,0.30)",
                  "0 0 0 0px rgba(232,23,93,0.22), 0 8px 28px rgba(232,23,93,0.25)",
                ],
              }}
              transition={{ duration: 2.5, repeat: Infinity }}
              style={{
                width: 56, height: 56, borderRadius: "50%",
                background: "linear-gradient(135deg,#e8175d,#ff8cc8)",
                display: "flex", alignItems: "center", justifyContent: "center",
                marginBottom: 18,
              }}
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>

            {/* Motion headline */}
            <AnimatePresence mode="wait">
              <motion.h2
                key={currentStage}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                style={{
                  fontSize: "clamp(2rem, 4.2vw, 2.7rem)",
                  fontWeight: 900, color: "#1a1235",
                  lineHeight: 1.05, whiteSpace: "pre-line",
                  letterSpacing: "-0.06em",
                  textTransform: "lowercase",
                  margin: 0
                }}
              >
                {STAGES[currentStage].headline}
              </motion.h2>
            </AnimatePresence>

            {/* Scroll hint */}
            <p style={{ fontSize: 13, color: "#c09ab0", marginTop: 4, letterSpacing: "0.02em", fontWeight: 500 }}>
              scroll to explore ↓
            </p>

            {/* Stage dots */}
            <div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 10 }}>
              {STAGES.map((_, i) => (
                <div key={i} style={{
                  width: i === currentStage ? 22 : 6,
                  height: 6, borderRadius: 3,
                  background: i === currentStage ? "#e8175d" : "#ffdceb",
                  transition: "all 0.35s ease",
                }} />
              ))}
            </div>
          </div>

          {/* Bubbles */}
          {MESSAGES.map((m, i) => (
            <ChatBubble key={m.id} message={m} style={bubbleStyles[i]} />
          ))}
        </div>

        {/* RIGHT — Explainer */}
        <div className="relative z-10 shrink-0 w-full lg:w-auto overflow-y-auto">
          <RightPanel stage={currentStage} />
        </div>
      </div>
    </div>
  );
}