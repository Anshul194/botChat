"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { MessageCircle, History, Inbox, Users } from "lucide-react";

const mainFeatures = [
  {
    title: "Comment Automation",
    description: "Instantly reply to every comment on your posts and reels. Convert engagement into conversations.",
    icon: MessageCircle,
    image: "/feature-extra-3.jfif",
    color: "#FF2D78",
    bg: "rgba(255, 45, 120, 0.05)"
  },
  {
    title: "Inbox Automation",
    description: "Manage your DMs at scale with intelligent sorting and automated initial responses.",
    icon: Inbox,
    image: "/feature-extra-2.jfif",
    color: "#C13584",
    bg: "rgba(193, 53, 132, 0.05)"
  },
  {
    title: "Bio Link Automation",
    description: "Auto-reply to story mentions and reactions. Build deeper connections with your most active followers.",
    icon: History,
    image: "/feature-comment.jfif",
    color: "#E1306C",
    bg: "rgba(225, 48, 108, 0.05)"
  },
  
  {
    title: "Live Chat ",
    description: "Turn casual interactions into qualified leads. Collect emails and data directly within the chat.",
    icon: Users,
    image: "/feature-story.jfif",
    color: "#833AB4",
    bg: "rgba(131, 58, 180, 0.05)"
  }
];

export default function FeaturesOverview() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-semibold text-black mb-4"
          >
            One Platform, <span className="text-[#FF2D78]">Total Control</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 text-lg max-w-2xl mx-auto"
          >
            Everything you need to automate your social presence and turn followers into loyal customers.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {mainFeatures.map((feature, index) => (
            <motion.article
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10, scale: 1.01 }}
              className="group relative h-[400px] w-full rounded-[28px] text-left [perspective:1200px]"
            >
              <div
                className="relative h-full w-full rounded-[28px] transition-transform duration-700 [transform:rotateY(0deg)] group-hover:[transform:rotateY(180deg)]"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div
                  className="absolute inset-0 overflow-hidden rounded-[28px] border border-rose-100 bg-white shadow-sm transition-all duration-300 group-hover:shadow-xl"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <Image
                    src={feature.image}
                    alt={feature.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/28 to-transparent" />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_12%,rgba(255,45,120,0.35),transparent_42%)]" />

                  <div className="absolute left-0 right-0 top-0 p-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/60 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-800 backdrop-blur-sm">
                      <feature.icon className="h-4 w-4" />
                      Feature
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-2xl font-semibold text-white drop-shadow-md">{feature.title}</h3>
                    <p className="mt-1 text-xs text-rose-100">Hover to view details</p>
                  </div>
                </div>

                <div
                  className="absolute inset-0 flex flex-col rounded-[28px] border border-rose-100 bg-gradient-to-br from-rose-50 via-white to-pink-50 p-5 shadow-xl"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <div className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
                    <feature.icon className="h-4 w-4" />
                    {feature.title}
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-slate-700">{feature.description}</p>

                  <div className="mt-5 rounded-2xl border border-rose-200 bg-white px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-rose-500">Outcome</p>
                    <p className="mt-1 text-sm text-slate-800">Faster replies, better engagement, and more qualified leads.</p>
                  </div>

                  <a
                    href="/auth/sign-up"
                    className="mt-auto inline-flex w-fit items-center rounded-full bg-[#FF2D78] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#e7266a]"
                  >
                    Get Started
                  </a>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
