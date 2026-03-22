"use client";

import { useRef } from "react";
import { motion, useAnimationFrame, useMotionValue, useTransform, wrap } from "framer-motion";
import { BadgeCheck, Building2, Sparkles, Users } from "lucide-react";

const creators = [
  "@bromabakery", "@yummytoddlerfood", "@getschooledinfashion", "@interiordesignerella",
  "@yvetteg23", "@mytexashouse", "@just.ingredients", "@skincarebytanisha",
  "@justglow011", "@monicsutter", "@laurajaneillustrations", "@nicoles_outfit_inspirations",
  "@eatingbirdfood", "@im_lola__", "@danielle.donohue", "@just.jacsy",
  "@zee_styledit", "@beautyxdanaplum", "@snipestwins", "@palmettoporchathome",
  "@everyday.holly", "@sunsetsandstilettos",
];

const brands = [
  "@nbcselect", "@shoptoday", "@chatbooks", "@food52", "@delta", "@sellit",
  "@bondisands", "@solidstarts", "@randomhouse", "@dillards", "@fandango",
  "@bhgaus", "@focalelite", "@hauste", "@enews", "@patpat_clothing",
  "@homebeautiful", "@recetasnestlecl", "@elleaus", "@einsider",
  "@dkbooksus", "@allure", "@inspire_me_home_decor", "@kinedu",
];

const niches = [
  "Mavely Creators", "Fashion Creators", "Amazon Creators", "LTK Creators",
  "Food Creators", "Beauty Creators", "Travel Creators", "DIY Home Creators",
  "Designers", "Musicians", "Podcasters", "Photography",
  "Health & Fitness Creators", "Realtors", "Education Creators", "Non-Profit Organisations",
];

function InfiniteMarquee({
  items,
  direction = "left",
  speed = 50,
  className = "",
  itemClass = "",
  gradientFrom = "from-white",
  gradientTo = "to-transparent",
}: {
  items: string[];
  direction?: "left" | "right";
  speed?: number;
  className?: string;
  itemClass?: string;
  gradientFrom?: string;
  gradientTo?: string;
}) {
  const baseX = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isHovered = useMotionValue(false);

  useAnimationFrame((_, delta) => {
    if (isHovered.get()) return;
    const move = (delta / 1000) * speed * (direction === "right" ? -1 : 1);
    baseX.set(baseX.get() + move);
  });

  const x = useTransform(baseX, (v) => {
    const width = containerRef.current?.scrollWidth ?? 0;
    return wrap(-width / 2, 0, v);
  });

  // Duplicate items for seamless loop
  const doubled = [...items, ...items];

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${className}`}
      onMouseEnter={() => isHovered.set(true)}
      onMouseLeave={() => isHovered.set(false)}
    >
      {/* Fade masks */}
      <div className={`absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r ${gradientFrom} ${gradientTo} pointer-events-none`} />
      <div className={`absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l ${gradientFrom} ${gradientTo} pointer-events-none`} />

      <motion.div className="flex whitespace-nowrap" style={{ x }}>
        {doubled.map((item, i) => (
          <motion.span
            key={`${item}-${i}`}
            className={`inline-flex items-center rounded-full border px-4 py-2 mx-2 text-sm font-medium shadow-sm ${itemClass}`}
            whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
          >
            {item}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}

export default function CreatorProof() {
  return (
    <section className="py-20 md:py-28 bg-gradient-to-b from-white to-gray-50/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50/80 px-5 py-1.5 text-xs font-semibold uppercase tracking-wider text-rose-600 backdrop-blur-sm"
          >
            <Users className="h-4 w-4" />
            Trusted by thousands
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-6 text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 tracking-tight"
          >
            Creators & Brands Love LinkDM
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            viewport={{ once: true }}
            className="mt-5 text-lg md:text-xl text-slate-600 max-w-3xl mx-auto"
          >
            Powering compliant, high-conversion Instagram & Facebook automation for top creators, global brands, and every niche in between.
          </motion.p>
        </div>

        {/* Creators Marquee */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="h-5 w-5 text-rose-500" />
            <h3 className="text-2xl font-semibold text-slate-900">Top Creators</h3>
          </div>
          <InfiniteMarquee
            items={creators}
            speed={60}
            itemClass="border-rose-200 bg-white/80 text-rose-700 backdrop-blur-sm"
            gradientFrom="from-white"
            gradientTo="to-transparent"
          />
        </motion.div>

        {/* Brands Marquee (opposite direction) */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 mb-4">
            <Building2 className="h-5 w-5 text-slate-700" />
            <h3 className="text-2xl font-semibold text-slate-900">Leading Brands</h3>
          </div>
          <InfiniteMarquee
            items={brands}
            direction="right"
            speed={55}
            itemClass="border-slate-200 bg-white/80 text-slate-700 backdrop-blur-sm"
            gradientFrom="from-white"
            gradientTo="to-transparent"
          />
        </motion.div>

        {/* Niches Marquee (slower, tags style) */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <h3 className="text-2xl font-semibold text-slate-900 mb-5 text-center">Across Every Niche</h3>
          <InfiniteMarquee
            items={niches}
            speed={40}
            itemClass="border-rose-100 bg-rose-50/70 text-rose-700 text-xs md:text-sm px-5 py-2.5"
            gradientFrom="from-gray-50"
            gradientTo="to-transparent"
          />
        </motion.div>

        {/* Meta Partner Badge Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-white p-8 md:p-10 shadow-sm"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-700">
                <BadgeCheck className="h-4 w-4" />
                Official Meta Business Partner
              </p>
              <h3 className="mt-4 text-2xl md:text-3xl font-bold text-slate-900">
                Certified since 2021
              </h3>
              <p className="mt-3 text-slate-700 max-w-2xl">
                LinkDM ensures full compliance with Meta&apos;s automation policies on Instagram & Facebook — trusted by 47,000+ active users worldwide.
              </p>
            </div>
            <div className="flex-shrink-0 rounded-2xl border border-emerald-300 bg-white px-8 py-6 text-center min-w-[220px] shadow-sm">
              <p className="text-sm uppercase tracking-wider text-slate-500 font-medium">Active Users</p>
              <p className="text-4xl md:text-5xl font-bold text-emerald-600 mt-2">47,000+</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}