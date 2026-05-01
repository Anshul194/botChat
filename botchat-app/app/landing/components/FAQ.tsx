"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, HelpCircle, MessageCircle, ShieldCheck, Zap, Sparkles, ArrowRight, Link as LinkIcon } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "Is LinkDM officially compliant with Meta (Facebook/Instagram)?",
    answer: "Yes, 100%. We use the Official Messenger API and follow all Meta developer guidelines. Unlike 'grey-hat' scrapers, LinkDM is a verified partner tool, meaning your credentials are safe and your account remains in perfect standing.",
    icon: <ShieldCheck className="text-emerald-500" />
  },
  {
    question: "Will my Instagram account get flagged or banned for automation?",
    answer: "Never. We've processed over 25M+ automated interactions with a 0% ban rate. Our system mimics natural human behavior with dynamic delays and 'Smart Throttling' that stays well below platform limits.",
    icon: <Zap className="text-amber-500" />
  },
  {
    question: "How fast does it actually reply to a Reel comment?",
    answer: "Lightning fast—usually within 0.8 seconds. Speed-to-lead is our obsession. By hitting the inbox while the user is still watching your Reel, we maximize your conversion opportunity by up to 300%.",
    icon: <Zap className="text-pink-500" />
  },
  {
    question: "Can I collect emails and sync them to my CRM (Klaviyo/Mailchimp)?",
    answer: "Absolutely. LinkDM features 'Intelligent Data Capture.' Our AI prompts users for their email naturally within the flow, validates it, and syncs it instantly to your preferred marketing tool.",
    icon: <MessageCircle className="text-blue-500" />
  },
  {
    question: "Do I need any technical skill or coding to set this up?",
    answer: "Zero. If you can type a message, you can use LinkDM. Our 'Logic-Mapper' is a visual drag-and-drop system. You can have your first Reel fully automated in less than 3 minutes.",
    icon: <Sparkles className="text-purple-500" />
  },
  {
    question: "Can I use my own domain for my Bio Link?",
    answer: "Absolutely. You can use your custom domain or a subdomain to maintain brand consistency. We also provide SEO-optimized slugs (e.g., botchat.com/yourname) that load in under 1 second.",
    icon: <LinkIcon className="text-cyan-500" />
  }
];

function FAQItem({ item, index, isOpen, toggleOpen }: { item: typeof faqs[0], index: number, isOpen: boolean, toggleOpen: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      className={`group relative p-6 md:p-8 rounded-[32px] border transition-all duration-500 cursor-pointer overflow-hidden ${
        isOpen 
          ? "bg-white border-pink-100 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] mb-8" 
          : "bg-slate-50/30 border-slate-100 hover:bg-white hover:border-pink-50 mb-4"
      }`}
      onClick={toggleOpen}
    >
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute -right-20 -bottom-20 w-80 h-80 bg-pink-50/40 blur-[80px] rounded-full pointer-events-none z-0"
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 flex items-center justify-between gap-6">
        <div className="flex items-center gap-5">
           <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${isOpen ? 'bg-[#e8175d] text-white rotate-[360deg] shadow-lg shadow-pink-100' : 'bg-white text-slate-300 group-hover:text-pink-400 border border-slate-100'}`}>
              {item.icon}
           </div>
           <h3 className={`text-xl md:text-2xl font-bold tracking-tight transition-colors duration-500 ${isOpen ? 'text-[#1a1235]' : 'text-[#1a1235]/70'}`}>
             {item.question}
           </h3>
        </div>
        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ${isOpen ? 'bg-[#1a1235] text-white rotate-180' : 'bg-white border border-slate-100 text-slate-300 group-hover:text-pink-500'}`}>
           {isOpen ? <Minus size={18} /> : <Plus size={18} />}
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.04, 0.62, 0.23, 0.98] }}
            className="overflow-hidden"
          >
            <div className="pt-6 md:pt-8 pl-17 md:pl-17 text-lg text-[#6b5780] font-medium leading-relaxed max-w-2xl">
              {item.answer}
              <motion.div 
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                className="mt-6 flex items-center gap-2 text-pink-500 text-[9px] font-bold uppercase tracking-[0.3em]"
              >
                Verified Solution Path <ArrowRight size={14} />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 md:py-32 bg-white relative overflow-hidden">
      
      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-0 w-80 h-80 bg-pink-50/50 blur-[130px] rounded-full -translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-1/4 right-0 w-60 h-60 bg-indigo-50/30 blur-[100px] rounded-full translate-x-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-16 lg:gap-24">
          
          {/* LEFT: Heading & Help Box (Sticky on Desktop) */}
          <div className="lg:w-1/3 lg:sticky lg:top-32 lg:h-fit">
            <div className="space-y-8">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[#e8175d] text-[10px] font-bold tracking-[0.3em] uppercase"
              >
                <HelpCircle size={14} className="text-pink-400" /> Common Queries
              </motion.div>

              <div className="space-y-4">
                <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1a1235] tracking-tight leading-[1]">
                  Smart <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#e8175d] to-[#ff2d78]">Answers</span>
                </h2>
                <p className="text-xl font-medium text-[#6b5780] max-w-sm">
                  Everything you need to know about the most advanced automation platform in the game.
                </p>
              </div>

              {/* Still have questions? */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="p-8 rounded-[32px] bg-[#1a1235] text-white space-y-4 shadow-xl overflow-hidden relative border border-white/5"
              >
                <div className="absolute -right-4 -bottom-4 opacity-10">
                   <HelpCircle size={120} />
                </div>
                <div className="relative z-10">
                  <h4 className="text-2xl font-bold tracking-tight mb-2">Still Curious?</h4>
                  <p className="text-slate-400 text-sm font-medium mb-6">
                    Our team is ready to help 24/7. Ask us anything directly in the DM.
                  </p>
                  <button className="flex items-center gap-3 bg-white text-[#1a1235] px-6 py-3 rounded-2xl font-bold text-sm hover:bg-pink-50 transition-colors">
                     Open Live Chat <ArrowRight size={18} />
                  </button>
                </div>
              </motion.div>
            </div>
          </div>

          {/* RIGHT: FAQ Accordions */}
          <div className="lg:w-2/3">
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <FAQItem 
                  key={i} 
                  item={faq} 
                  index={i} 
                  isOpen={openIndex === i} 
                  toggleOpen={() => setOpenIndex(openIndex === i ? null : i)}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
