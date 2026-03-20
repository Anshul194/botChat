"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Sparkles, Fingerprint, Layers, Workflow, Radio,
  BarChart3, MessageSquare, Shield, Cpu, ArrowUpRight,
} from "lucide-react";

const features = [
  {
    icon: Zap,
    name: "Post AutoDM",
    cat: "Instagram",
    badge: "Live",
    color: "#FF2060",
    desc: "Instant personalized DMs triggered by post comments — engage in real time with context-aware replies that feel 100% human.",
    longDesc: "Trigger custom DM sequences the moment someone comments. Personalize based on comment content, user profile, or post type — perfect for giveaways, Q&A, or flash sales.",
  },
  {
    icon: Sparkles,
    name: "Reels AutoDM",
    cat: "Reels",
    color: "#FF4D8D",
    desc: "Capture every viral moment — auto-DM on every comment, no exceptions.",
    longDesc: "Reels move fast. This catches every single comment (even during spikes) and starts nurturing conversations instantly — turning views into DMs and DMs into revenue.",
  },
  {
    icon: Fingerprint,
    name: "Brand Voice AI",
    cat: "AI",
    badge: "Pro",
    color: "#E8185A",
    desc: "Train once — your unique tone stays consistent forever across platforms.",
    longDesc: "Upload 20–50 past messages → our AI learns your voice, slang, emojis, and vibe. Every auto-reply, sequence, or quick-reply matches your brand perfectly — no generic robot feel.",
  },
  // ... add the rest of your features with short + longDesc
  {
    icon: Cpu,
    name: "Smart Throttling",
    cat: "Protection",
    color: "#FF2060",
    desc: "Viral-safe system — dynamic rate limiting prevents flags & bans.",
    longDesc: "Automatically adjusts sending speed based on account age, engagement patterns, and Instagram's latest limits. Sleep easy during big campaigns.",
  },
];

function FeatureCard({
  feature,
  isActive,
  onClick,
  size = "normal", // "normal" | "large"
}: {
  feature: typeof features[0];
  isActive: boolean;
  onClick: () => void;
  size?: "normal" | "large";
}) {
  const Icon = feature.icon;

  return (
    <motion.div
      layout
      onClick={onClick}
      className={`
        group relative rounded-3xl overflow-hidden bg-white border border-gray-100
        shadow-sm hover:shadow-xl transition-all duration-500 cursor-pointer
        ${isActive ? "shadow-2xl border-[#FF2060]/30 ring-1 ring-[#FF2060]/20" : ""}
        ${size === "large" ? "md:col-span-2 md:row-span-2" : "md:col-span-1 md:row-span-1"}
      `}
      whileHover={{ scale: isActive ? 1.015 : 1.03, y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className="p-6 md:p-8 h-full flex flex-col">
        <div className="flex items-center gap-4 mb-5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: isActive
                ? `linear-gradient(135deg, ${feature.color}, #ff4d8d)`
                : "rgba(255,32,96,0.08)",
            }}
          >
            <Icon
              className="w-7 h-7"
              style={{ color: isActive ? "white" : feature.color }}
              strokeWidth={2.1}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-xl text-gray-900">{feature.name}</h4>
              {feature.badge && (
                <span className="text-xs font-bold uppercase px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                  {feature.badge}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">{feature.cat}</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isActive ? (
            <motion.div
              key="expanded"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.35 }}
              className="flex-1 flex flex-col"
            >
              <p className="text-base leading-relaxed text-gray-700 mb-6 italic">
                “{feature.longDesc || feature.desc}”
              </p>
              <div className="mt-auto flex flex-wrap gap-2">
                {["Real-time", "Scalable", "Safe"].map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.p
              key="short"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-gray-600 leading-relaxed flex-1"
            >
              {feature.desc}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {isActive && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.7, scale: 1 }}
          className="absolute bottom-5 right-5 text-[#FF2060]"
        >
          <ArrowUpRight className="w-6 h-6" />
        </motion.div>
      )}
    </motion.div>
  );
}

export default function FeaturesBento() {
  const [activeIndex, setActiveIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % features.length);
    }, 5200);
  };

  useEffect(() => {
    startTimer();
    return () => {
      timerRef.current && clearInterval(timerRef.current);
    };
  }, []);

  const handleSelect = (index: number) => {
    if (timerRef.current) clearInterval(timerRef.current);
    setActiveIndex(index);
    startTimer();
  };

  return (
    <section className="relative py-24 md:py-32 bg-gray-50/50 overflow-hidden">
      {/* Optional subtle bg */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#FF2060]/4 blur-3xl" />
        <div className="absolute bottom-[-15%] left-[-15%] w-[800px] h-[800px] rounded-full bg-[#FF4D8D]/4 blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-5 md:px-8 relative z-10">
        <div className="text-center mb-16 md:mb-20">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight">
            Scale Your
            <span className="bg-gradient-to-r from-[#FF4D8D] to-[#FF2060] bg-clip-text text-transparent block mt-2">
              Influence
            </span>
          </h2>
          <p className="mt-5 text-xl text-gray-600 max-w-2xl mx-auto">
            Every comment is revenue waiting. Never miss another opportunity — automatically.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-6 auto-rows-fr">
          {features.map((feature, i) => (
            <FeatureCard
              key={i}
              feature={feature}
              isActive={activeIndex === i}
              onClick={() => handleSelect(i)}
              size={i === activeIndex ? "large" : "normal"} // only active becomes big
            />
          ))}
        </div>

        {/* Progress dots below grid */}
        <div className="flex justify-center gap-3 mt-12">
          {features.map((_, i) => (
            <button
              key={i}
              onClick={() => handleSelect(i)}
              className={`
                w-2.5 h-2.5 rounded-full transition-all duration-400
                ${activeIndex === i
                  ? "bg-[#FF2060] scale-150 shadow-md"
                  : "bg-gray-300 hover:bg-gray-400"}
              `}
            />
          ))}
        </div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <h3 className="text-4xl font-bold text-gray-900 mb-6">
            Ready to turn comments into customers?
          </h3>
          <Link href="/dashboard">
            <motion.button
              className="inline-flex items-center gap-3 bg-gradient-to-r from-[#FF2060] to-[#E8185A] text-white font-semibold uppercase tracking-wider text-sm px-10 py-5 rounded-full shadow-xl"
              whileHover={{ scale: 1.06, boxShadow: "0 25px 50px -12px rgba(255,32,96,0.4)" }}
              whileTap={{ scale: 0.97 }}
            >
              Start Automating Now
              <ArrowUpRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}