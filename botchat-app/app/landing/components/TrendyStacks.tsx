"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import { MessageSquareText, HeartPulse, Workflow, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import Image from "next/image";

const CAROUSEL_FEATURES = [
  {
    id: "ai-replies",
    title: "AI Auto-Replies",
    subtitle: "Conversations on Autopilot",
    desc: "Instantly reply to comments and DMs with context-aware AI. Grow your social media presence with human-like responses.",
    icon: <MessageSquareText className="w-8 h-8 text-white" />,
    color: "from-pink-500 to-rose-500",
    image: "/images/botchat_ai_replies.png",
    metrics: ["100% Automated", "< 2s Response Time"]
  },
  {
    id: "story-magnet",
    title: "Story Automations",
    subtitle: "Turn Views into Sales",
    desc: "Maximize social media ROI. Instantly reply to followers who mention you or react to your stories silently in the background.",
    icon: <HeartPulse className="w-8 h-8 text-white" />,
    color: "from-fuchsia-500 to-pink-500",
    image: "/images/botchat_story_magnet.png",
    metrics: ["+45% Brand Loyalty", "24/7 Lead Gen"]
  },
  {
    id: "flow-builder",
    title: "No-Code Builder",
    subtitle: "Custom Workflows",
    desc: "Drag-and-drop conversational flow builder to qualify leads, handle support, and close sales without any coding.",
    icon: <Workflow className="w-8 h-8 text-white" />,
    color: "from-rose-400 to-pink-600",
    image: "/images/botchat_flow.png",
    metrics: ["Zero Coding", "Infinite Scaling"]
  }
];

export default function TrendyStacks() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -scrollRef.current.clientWidth, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: scrollRef.current.clientWidth, behavior: "smooth" });
    }
  };

  return (
    <section className="bg-black text-white py-24 md:py-32 relative overflow-hidden font-sans">

      {/* Aesthetic Background */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-rose-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10 hidden sm:block">
        <style jsx>{`
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .hide-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
      </div>

      <div className="max-w-7xl mx-auto px-6 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">

        {/* Header */}
        <div className="max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <Sparkles className="w-4 h-4 text-pink-400" />
            <span className="text-sm font-semibold tracking-wide text-gray-300">Feature Carousel</span>
          </motion.div>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">
            Powerful features. <br /><span className="text-gray-500">Stunningly simple.</span>
          </h2>
        </div>

        {/* Desktop Controls */}
        <div className="hidden md:flex gap-3">
          <button
            onClick={scrollLeft}
            className="w-14 h-14 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-pink-400 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button
            onClick={scrollRight}
            className="w-14 h-14 rounded-full border border-white/10 bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-pink-400 transition-colors"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* CSS Scroll Snap Carousel - Butter Smooth Native Scrolling */}
      <div className="relative z-20 w-full overflow-hidden">
        <div
          ref={scrollRef}
          className="flex overflow-x-auto snap-x snap-mandatory hide-scrollbar gap-6 px-6 md:px-12 pb-12 w-full max-w-[100vw]"
          style={{ scrollPaddingLeft: "1.5rem" }}
        >
          {CAROUSEL_FEATURES.map((feature) => (
            <div
              key={feature.id}
              className="snap-center shrink-0 w-full md:w-[85%] lg:w-[1000px] bg-[#0A0A0A] border border-white/10 rounded-[2rem] overflow-hidden flex flex-col lg:flex-row shadow-2xl relative"
            >
              {/* Left Content Area (Text) */}
              <div className="flex-1 p-8 md:p-14 flex flex-col justify-center relative z-10 w-full">
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-8 shadow-lg shadow-pink-500/20`}>
                  {feature.icon}
                </div>

                <h3 className="text-3xl md:text-4xl font-bold mb-3">{feature.title}</h3>
                <h4 className="text-lg font-medium text-gray-500 mb-6 uppercase tracking-wider">{feature.subtitle}</h4>
                <p className="text-gray-300 text-lg md:text-xl leading-relaxed mb-10 max-w-lg">
                  {feature.desc}
                </p>

                <div className="flex gap-4 flex-wrap mt-auto">
                  {feature.metrics.map((metric, i) => (
                    <div key={i} className="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-sm font-semibold text-pink-200">
                      {metric}
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Image/Visual Area */}
              <div className="flex-1 min-h-[300px] lg:min-h-full relative overflow-hidden bg-black lg:border-l border-white/5">
                <Image
                  src={feature.image}
                  alt={feature.title}
                  fill
                  className="object-cover object-center opacity-60 lg:opacity-80 transition-transform duration-700 hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                {/* Fade gradient from left text to right image on Desktop */}
                <div className="hidden lg:block absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-transparent to-transparent opacity-80" />
                {/* Fade gradient from top to bottom on Mobile */}
                <div className="block lg:hidden absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent opacity-80" />
              </div>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
