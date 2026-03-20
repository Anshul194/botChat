"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Samantha Wright",
    role: "@sam_creates",
    quote: "This tool literally doubled my engagement in 2 weeks. I no longer spend 4 hours a day replying to comments. It's magic.",
    followers: "150K followers",
    avatar: "SW"
  },
  {
    name: "Alex Miller",
    role: "@alex_marketing",
    quote: "The lead generation features are insane. I've collected 2,000 emails directly from my Reels. ROI is through the roof.",
    followers: "300K followers",
    avatar: "AM"
  },
  {
    name: "Elena Rossi",
    role: "@elena_fashion",
    quote: "It feels so human. My followers don't even realize they're talking to an automation until they get the gift I promised.",
    followers: "95K followers",
    avatar: "ER"
  }
];

export default function Testimonials() {
  return (
    <section className="py-24 bg-gray-50/50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold font-display text-black mb-4">
            Hear it from the <span className="text-[#FF2D78]">pros</span>
          </h2>
          <p className="text-gray-500 font-body">Don't take our word for it — let our creators speak.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-10 rounded-[40px] bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <div className="flex gap-1 mb-6 text-pink-500">
                {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-current" />)}
              </div>
              <p className="text-gray-700 text-lg italic leading-relaxed font-body mb-8">
                “{t.quote}”
              </p>
              <div className="flex items-center gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white font-display"
                  style={{ background: "linear-gradient(135deg, #FF2D78, #E1306C)" }}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="text-black font-bold font-display leading-tight">{t.name}</div>
                  <div className="text-gray-400 text-sm font-body">{t.role} · {t.followers}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
