"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import {
  Instagram, Facebook, Link2, Bot,
  MessageCircle, Zap, TrendingUp, Users,
  ArrowRight, ChevronRight
} from "lucide-react";

const CHANNELS = [
  {
    id: "ig",
    icon: <Instagram className="w-4 h-4" />,
    label: "Instagram",
    bg: "linear-gradient(135deg, #833ab4, #E1306C, #F77737)",
    color: "#E1306C",
    stat: "10M+ DMs sent",
    desc: "Auto-reply to post & Reel comments, story reactions and mentions instantly.",
    bubble_user: "Hey! Can you send me the link? 🔥",
    bubble_bot: "Hey! Here's the link you asked for 👉 replyrush.com/offer",
  },
  {
    id: "fb",
    icon: <Facebook className="w-4 h-4" />,
    label: "Facebook",
    bg: "linear-gradient(135deg, #1877F2, #0c5fcc)",
    color: "#1877F2",
    stat: "Ads + Pages",
    desc: "Automate Facebook Page DMs, sponsored post replies and inbox flows.",
    bubble_user: "Interested in this product!",
    bubble_bot: "Thanks for your interest! Check out our offer →",
  },
  {
    id: "bio",
    icon: <Link2 className="w-4 h-4" />,
    label: "Bio Link",
    bg: "linear-gradient(135deg, #059669, #10b981)",
    color: "#10b981",
    stat: "5M+ link clicks",
    desc: "Turn bio link visitors into leads. Collect emails and route to offers in-chat.",
    bubble_user: "Just clicked your bio link",
    bubble_bot: "Welcome! Here's what we have for you 🎁",
  },
  {
    id: "ai",
    icon: <Bot className="w-4 h-4" />,
    label: "AI Agent",
    bg: "linear-gradient(135deg, #7c3aed, #a78bfa)",
    color: "#a78bfa",
    stat: "Intent-aware",
    desc: "Multi-step AI flows that read intent, qualify leads and close sales on autopilot.",
    bubble_user: "What's the price for the course?",
    bubble_bot: "The course is ₹2,999. Want me to send the details? 😊",
  },
];

const FLOW = [
  { icon: <MessageCircle className="w-3 h-3" />, label: "Comment / Story / Bio", color: "#E1306C" },
  { icon: <Bot className="w-3 h-3" />, label: "AI reads intent", color: "#a78bfa" },
  { icon: <Zap className="w-3 h-3" />, label: "Instant DM sent", color: "#F77737" },
  { icon: <TrendingUp className="w-3 h-3" />, label: "Lead → Sale", color: "#10b981" },
];

export default function MotiveSection() {
  const [active, setActive] = useState("ig");
  const ch = CHANNELS.find((c) => c.id === active);

  return (
    <section
      className="relative py-16 overflow-hidden"
      style={{ background: "linear-gradient(150deg, #fff5f8 0%, #ffffff 55%, #fdf2f8 100%)" }}
    >
      {/* BG */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full opacity-50"
          style={{ background: "radial-gradient(circle, #fecdd3 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 11, repeat: Infinity }}
        />
        <motion.div
          className="absolute -bottom-20 -right-20 w-[380px] h-[380px] rounded-full opacity-30"
          style={{ background: "radial-gradient(circle, #fbcfe8 0%, transparent 70%)" }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, delay: 2 }}
        />
        <div
          className="absolute inset-0 opacity-[0.055]"
          style={{
            backgroundImage: "radial-gradient(circle, #ff2d78 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-5">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 bg-pink-50 border border-pink-200 rounded-full px-3 py-1 text-[11px] font-semibold text-pink-500 uppercase tracking-wider mb-2.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-pink-400" />
              Why ReplyRush
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="text-3xl md:text-[2.4rem] font-bold text-gray-900 leading-tight"
            >
              Automation that{" "}
              <span style={{ color: "#ff2d78" }}>feels human</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-gray-400 text-sm mt-1.5 max-w-sm leading-relaxed"
            >
              One AI engine across Instagram, Facebook & Bio — every interaction becomes revenue.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.12 }}
            className="flex-shrink-0 flex items-center gap-2.5 bg-white border border-pink-100 rounded-2xl px-4 py-2.5 shadow-sm self-start sm:self-auto"
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
              style={{ background: "linear-gradient(135deg,#ff2d78,#ff8c42)" }}
            >
              <Users className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-gray-900 font-bold text-sm leading-tight">11K+ brands</div>
              <div className="text-gray-400 text-[11px]">already running</div>
            </div>
          </motion.div>
        </div>

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl border border-pink-100 shadow-sm overflow-hidden"
        >
          <div className="flex flex-col md:flex-row">

            {/* Sidebar tabs */}
            <div className="md:w-52 flex-shrink-0 border-b md:border-b-0 md:border-r border-pink-50 p-2.5 flex md:flex-col gap-1.5">
              {CHANNELS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setActive(c.id)}
                  className={`relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all w-full group ${active === c.id ? "bg-pink-50" : "hover:bg-gray-50"
                    }`}
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-white flex-shrink-0 transition-transform group-hover:scale-105"
                    style={{ background: c.bg }}
                  >
                    {c.icon}
                  </div>
                  <span className={`text-sm font-medium transition-colors ${active === c.id ? "text-gray-900" : "text-gray-400 group-hover:text-gray-600"}`}>
                    {c.label}
                  </span>
                  {active === c.id && (
                    <motion.div
                      layoutId="dot"
                      className="absolute right-2.5 w-1.5 h-1.5 rounded-full"
                      style={{ background: c.color }}
                    />
                  )}
                </button>
              ))}

              {/* Mini stats */}
              <div className="hidden md:block mt-auto pt-3 border-t border-pink-50 px-2">
                <p className="text-[10px] text-gray-300 uppercase tracking-widest font-semibold mb-2">Platform stats</p>
                {[["25M+", "Auto DMs"], ["5M+", "Link Clicks"], ["10M+", "Comment replies"]].map(([v, l]) => (
                  <div key={l} className="flex justify-between items-baseline py-0.5">
                    <span className="text-[11px] text-gray-400">{l}</span>
                    <span className="text-[11px] font-bold text-gray-800">{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right panel */}
            <div className="flex-1 p-5 flex flex-col gap-4 min-h-0">

              {/* Channel header */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.18 }}
                  className="flex items-center gap-3"
                >
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md flex-shrink-0"
                    style={{ background: ch.bg }}
                  >
                    {ch.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm">{ch.label} Automation</span>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ color: ch.color, background: `${ch.color}14` }}
                      >
                        {ch.stat}
                      </span>
                    </div>
                    <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">{ch.desc}</p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* DM Preview */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={active + "_card"}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-2xl p-4 border flex-1"
                  style={{ background: `${ch.color}07`, borderColor: `${ch.color}18` }}
                >
                  {/* Preview header */}
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold"
                      style={{ background: ch.bg }}
                    >
                      {ch.label[0]}
                    </div>
                    <span className="text-[11px] text-gray-400 font-medium">Live DM preview</span>
                    <div className="ml-auto flex items-center gap-1">
                      <motion.div
                        className="w-1.5 h-1.5 rounded-full bg-green-400"
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1.1, repeat: Infinity }}
                      />
                      <span className="text-[10px] text-gray-300">active</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {/* User msg */}
                    <div className="flex">
                      <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-md px-3 py-2 text-xs text-gray-600 shadow-sm max-w-[75%]">
                        {ch.bubble_user}
                      </div>
                    </div>
                    {/* Bot msg */}
                    <motion.div
                      className="flex justify-end"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.35 }}
                    >
                      <div
                        className="rounded-2xl rounded-tr-md px-3 py-2 text-xs text-white shadow-sm max-w-[75%]"
                        style={{ background: ch.bg }}
                      >
                        {ch.bubble_bot}
                      </div>
                    </motion.div>
                    {/* Timestamp */}
                    <motion.div
                      className="flex items-center justify-end gap-1"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                    >
                      <Bot className="w-2.5 h-2.5 text-gray-300" />
                      <span className="text-[10px] text-gray-300">Sent by ReplyRush AI · just now</span>
                    </motion.div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Dot nav + CTA */}
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {CHANNELS.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setActive(c.id)}
                      className="w-2 h-2 rounded-full transition-all duration-200"
                      style={{ background: active === c.id ? c.color : "#e5e7eb" }}
                    />
                  ))}
                </div>
                <motion.a
                  href="#"
                  whileHover={{ x: 3 }}
                  className="flex items-center gap-1 text-[12px] font-semibold text-pink-500 hover:text-pink-600 transition-colors"
                >
                  Start free <ArrowRight className="w-3.5 h-3.5" />
                </motion.a>
              </div>
            </div>
          </div>

          {/* Flow bar */}
          <div className="border-t border-pink-50 bg-gray-50/60 px-5 py-3">
            <div className="flex flex-wrap items-center justify-center gap-2">
              {FLOW.map((step, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.85 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.08 + i * 0.07 }}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium"
                    style={{
                      color: step.color,
                      borderColor: `${step.color}22`,
                      background: `${step.color}0a`,
                    }}
                  >
                    {step.icon}
                    {step.label}
                  </motion.div>
                  {i < FLOW.length - 1 && (
                    <motion.div
                      animate={{ x: [0, 2, 0] }}
                      transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.2 }}
                    >
                      <ChevronRight className="w-3 h-3 text-pink-200" />
                    </motion.div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}