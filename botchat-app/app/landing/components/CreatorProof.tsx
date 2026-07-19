"use client";
// Force Next.js HMR Recompile

import { useRef } from "react";
import { motion } from "framer-motion";
import { BadgeCheck, Building2, Sparkles, Users, Instagram } from "lucide-react";

const AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1514222709107-a180c68d72b4?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=80&h=80&fit=crop&crop=face",
];

function getAvatar(index: number) {
  return AVATARS[index % AVATARS.length];
}

interface MarqueeItem {
  handle: string;
  imageIndex: number;
}

const creators: MarqueeItem[] = [
  "@bromabakery", "@yummytoddlerfood", "@getschooledinfashion", "@interiordesignerella",
  "@yvetteg23", "@mytexashouse", "@just.ingredients", "@skincarebytanisha",
  "@justglow011", "@monicsutter", "@laurajaneillustrations", "@nicoles_outfit_inspirations",
  "@eatingbirdfood", "@im_lola__", "@danielle.donohue", "@just.jacsy",
  "@zee_styledit", "@beautyxdanaplum", "@snipestwins", "@palmettoporchathome",
  "@everyday.holly", "@sunsetsandstilettos",
].map((h, i) => ({ handle: h, imageIndex: i }));

const brands: MarqueeItem[] = [
  "@nbcselect", "@shoptoday", "@chatbooks", "@food52", "@delta", "@sellit",
  "@bondisands", "@solidstarts", "@randomhouse", "@dillards", "@fandango",
  "@bhgaus", "@focalelite", "@hauste", "@enews", "@patpat_clothing",
  "@homebeautiful", "@recetasnestlecl", "@elleaus", "@einsider",
  "@dkbooksus", "@allure", "@inspire_me_home_decor", "@kinedu",
].map((h, i) => ({ handle: h, imageIndex: i + creators.length }));

const niches = [
  "Mavely Creators", "Fashion Creators", "Amazon Creators", "LTK Creators",
  "Food Creators", "Beauty Creators", "Travel Creators", "DIY Home Creators",
  "Designers", "Musicians", "Podcasters", "Photography",
  "Health & Fitness Creators", "Realtors", "Education Creators", "Non-Profit Organisations",
];

type MarqueeItems = (MarqueeItem | string)[];

function InfiniteMarquee({
  items,
  direction = "left",
  speed = 50,
  className = "",
  itemClass = "",
  gradientFrom = "from-white",
  gradientTo = "to-transparent",
  showAvatar = true,
}: {
  items: MarqueeItems;
  direction?: "left" | "right";
  speed?: number;
  className?: string;
  itemClass?: string;
  gradientFrom?: string;
  gradientTo?: string;
  showAvatar?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const duration = Math.max(45, Math.round(items.length * 4.5));

  const doubled = [...items, ...items];

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      <div className={`absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r ${gradientFrom} ${gradientTo} pointer-events-none`} />
      <div className={`absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l ${gradientFrom} ${gradientTo} pointer-events-none`} />

      <style>{`
        @keyframes marquee-${direction === "left" ? "fwd" : "rev"} {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <div
        className="flex whitespace-nowrap py-2"
        style={{
          animation: `marquee-${direction === "left" ? "fwd" : "rev"} ${duration}s linear infinite`,
          width: "fit-content",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.animationPlayState = "paused";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.animationPlayState = "running";
        }}
      >
        {doubled.map((item, i) => {
          const isObj = typeof item !== "string";
          const handle = isObj ? (item as MarqueeItem).handle : null;
          const imgIndex = isObj ? (item as MarqueeItem).imageIndex : null;
          const display = typeof item === "string" ? item : (item as MarqueeItem).handle;
          const key = typeof item === "string" ? `${item}-${i}` : `${(item as MarqueeItem).handle}-${i}`;

          return (
            <span
              key={key}
              className={`inline-flex items-center rounded-full border mx-2 text-sm font-medium transition-all duration-300 ${itemClass}`}
              style={{
                padding: showAvatar && isObj ? "5px 18px 5px 5px" : "9px 18px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.06) translateY(-2px)";
                if (showAvatar && isObj) {
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(225,48,108,0.15)";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1) translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {showAvatar && isObj && imgIndex !== null && (
                <span className="relative mr-2.5 flex-shrink-0">
                  <div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-white">
                    <img
                      src={getAvatar(imgIndex)}
                      alt={display}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-[2px] shadow-md">
                    <Instagram className="w-3 h-3 text-[#E1306C]" />
                  </span>
                </span>
              )}
              <span className={showAvatar && isObj ? "font-semibold tracking-tight" : ""}>
                {display}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

const FADE_UP = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

export default function CreatorProof() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-b from-slate-50 via-white to-white">
      {/* Decorative background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-gradient-to-br from-rose-100/40 to-pink-50/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-gradient-to-tl from-purple-100/30 to-transparent rounded-full blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <motion.p
            {...FADE_UP}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200/60 px-5 py-1.5 text-xs font-bold uppercase tracking-wider text-rose-600 shadow-sm"
          >
            <Users className="h-4 w-4" />
            Trusted by thousands
          </motion.p>

          <motion.h2
            {...FADE_UP}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[0.95]"
          >
            Creators & Brands{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D78] to-[#E1306C]">
              Love LinkDM
            </span>
          </motion.h2>

          <motion.p
            {...FADE_UP}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mt-5 text-lg md:text-xl text-slate-500 max-w-3xl mx-auto font-medium leading-relaxed"
          >
            Powering compliant, high-conversion Instagram & Facebook automation for top creators, global brands, and every niche in between.
          </motion.p>
        </div>

        {/* Creators Marquee */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-5 px-1">
            <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 shadow-lg shadow-rose-200">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Top Creators</h3>
            <div className="h-px flex-1 bg-gradient-to-r from-rose-200/60 to-transparent" />
          </div>
          <InfiniteMarquee
            items={creators}
            speed={60}
            itemClass="border-rose-100 bg-white/90 text-rose-700 backdrop-blur-sm hover:border-rose-300"
            gradientFrom="from-white"
            gradientTo="to-transparent"
            showAvatar={true}
          />
        </motion.div>

        {/* Brands Marquee */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="mb-10"
        >
          <div className="flex items-center gap-3 mb-5 px-1">
            <div className="p-2 rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 shadow-lg shadow-slate-200">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Leading Brands</h3>
            <div className="h-px flex-1 bg-gradient-to-r from-slate-200/60 to-transparent" />
          </div>
          <InfiniteMarquee
            items={brands}
            direction="right"
            speed={55}
            itemClass="border-slate-200 bg-white/90 text-slate-700 backdrop-blur-sm hover:border-slate-400"
            gradientFrom="from-white"
            gradientTo="to-transparent"
            showAvatar={true}
          />
        </motion.div>

        {/* Niches Marquee */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mb-20"
        >
          <div className="flex items-center gap-3 mb-5 px-1 justify-center">
            <div className="h-px flex-1 bg-gradient-to-l from-rose-200/60 to-transparent max-w-20" />
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Across Every Niche</h3>
            <div className="h-px flex-1 bg-gradient-to-r from-rose-200/60 to-transparent max-w-20" />
          </div>
          <InfiniteMarquee
            items={niches}
            speed={40}
            itemClass="border-rose-100 bg-gradient-to-r from-rose-50/80 to-pink-50/80 text-rose-600 text-xs md:text-sm px-5 py-2.5 font-semibold"
            gradientFrom="from-white"
            gradientTo="to-transparent"
            showAvatar={false}
          />
        </motion.div>

        {/* Meta Partner Badge Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-[32px] bg-gradient-to-br from-emerald-50 via-white to-emerald-50/50 p-8 md:p-10 shadow-xl shadow-emerald-900/5 border border-emerald-200/60 overflow-hidden"
        >
          {/* Decorative glow */}
          <div className="absolute -top-20 -right-20 w-60 h-60 bg-emerald-200/20 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-emerald-200/20 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div className="max-w-xl">
              <p className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 border border-emerald-200/50 shadow-sm">
                <BadgeCheck className="h-4 w-4" />
                Official Meta Business Partner
              </p>
              <h3 className="mt-5 text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
                Certified since 2021
              </h3>
              <p className="mt-3 text-slate-600 leading-relaxed">
                LinkDM ensures full compliance with Meta&apos;s automation policies on Instagram & Facebook — trusted by 47,000+ active users worldwide.
              </p>
            </div>
            <div className="flex-shrink-0 rounded-2xl bg-white border border-emerald-200/80 px-8 py-7 text-center min-w-[200px] shadow-md shadow-emerald-900/5">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400">Active Users</p>
              <p className="text-4xl md:text-5xl font-black text-emerald-600 mt-2 tracking-tight">47,000+</p>
              <div className="mt-3 flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] font-semibold text-emerald-500 uppercase tracking-wider">Growing daily</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
