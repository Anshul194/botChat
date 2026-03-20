"use client";

import { motion } from "framer-motion";
import { Instagram } from "lucide-react";

const creators = [
  { handle: "@alex_digital", followers: "250K", color: "#FF2D78" },
  { handle: "@sarah.social", followers: "120K", color: "#E1306C" },
  { handle: "@marketing_guru", followers: "500K", color: "#C13584" },
  { handle: "@creator_life", followers: "80K", color: "#833AB4" },
  { handle: "@trendsetter", followers: "310K", color: "#5851DB" },
  { handle: "@insta_build", followers: "150K", color: "#405DE6" }
];

export default function CreatorProof() {
  return (
    <section className="py-16 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="max-w-md text-center md:text-left">
            <h2 className="text-3xl font-bold text-black mb-4 font-display">
              Loved by <span className="text-[#FF2D78]">11,000+</span> creators
            </h2>
            <p className="text-gray-500 font-body">
              Join the elite world of creators who are automating their growth and reclaiming their time.
            </p>
          </div>

          <div className="flex-1 w-full overflow-hidden relative">
            {/* Infinite Horizontal Scroll or Grid of Handles */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {creators.map((creator, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-md transition-all group"
                >
                  <div className="p-2 rounded-xl bg-gradient-to-tr from-pink-500 to-purple-500 text-white group-hover:rotate-12 transition-transform">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-black font-display">{creator.handle}</div>
                    <div className="text-[10px] text-gray-400 font-body uppercase tracking-wider">{creator.followers} followers</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
