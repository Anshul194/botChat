"use client";

import { motion } from "framer-motion";
import { MessageCircle, History, Inbox, Users } from "lucide-react";

const mainFeatures = [
  {
    title: "Comment Automation",
    description: "Instantly reply to every comment on your posts and reels. Convert engagement into conversations.",
    icon: MessageCircle,
    color: "#FF2D78",
    bg: "rgba(255, 45, 120, 0.05)"
  },
  {
    title: "Story Automation",
    description: "Auto-reply to story mentions and reactions. Build deeper connections with your most active followers.",
    icon: History,
    color: "#E1306C",
    bg: "rgba(225, 48, 108, 0.05)"
  },
  {
    title: "Inbox Automation",
    description: "Manage your DMs at scale with intelligent sorting and automated initial responses.",
    icon: Inbox,
    color: "#C13584",
    bg: "rgba(193, 53, 132, 0.05)"
  },
  {
    title: "Lead Generation",
    description: "Turn casual interactions into qualified leads. Collect emails and data directly within the chat.",
    icon: Users,
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
            className="text-4xl md:text-5xl font-bold text-black mb-4 font-display"
          >
            One Platform, <span className="text-[#FF2D78]">Total Control</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-500 text-lg max-w-2xl mx-auto font-body"
          >
            Everything you need to automate your social presence and turn followers into loyal customers.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {mainFeatures.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="p-8 rounded-[32px] border border-gray-100 bg-white shadow-sm hover:shadow-xl transition-all duration-300 group"
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300"
                style={{ backgroundColor: feature.bg }}
              >
                <feature.icon className="w-8 h-8" style={{ color: feature.color }} />
              </div>
              <h3 className="text-xl font-bold text-black mb-3 font-display">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-body">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
