"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { useState } from "react";

const faqs = [
  {
    question: "Is botChat safe for my Instagram/Facebook account?",
    answer: "Absolutely. We use advanced human-like throttling and dynamic rate limiting to stay well within platform guidelines. We've managed 25M+ DMs with zero bans."
  },
  {
    question: "How do I start automating my Reels comments?",
    answer: "Just connect your account, select 'Reel Automation' from the dashboard, choose your keywords, and set your AI reply. It takes less than 2 minutes."
  },
  {
    question: "Can it capture emails even if the user doesn't type them?",
    answer: "Our AI is trained to intelligently prompt for emails when relevant. Once the user provides the email, it's automatically validated and synced to your CRM."
  },
  {
    question: "What platforms do you support?",
    answer: "Currently we are leading in Instagram and Facebook automation. We are working on expanding to other platforms soon."
  },
  {
    question: "Do I need a credit card to try it?",
    answer: "No credit card required. You can start with our 'Let’s Start' plan and experience the automation benefits completely free for the first 14 days."
  }
];

function FAQItem({ item, index }: { item: typeof faqs[0], index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className={`p-6 rounded-[24px] border border-gray-100 mb-4 cursor-pointer transition-all duration-300 ${isOpen ? "bg-[#FF2D78]/5 border-[#FF2D78]/20 shadow-lg" : "bg-white hover:bg-gray-50/50"}`}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="flex items-center justify-between text-black font-bold font-display text-lg">
        {item.question}
        {isOpen ? <Minus className="w-5 h-5 text-[#FF2D78]" /> : <Plus className="w-5 h-5 text-gray-400" />}
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0, marginTop: 0 }}
            animate={{ height: "auto", opacity: 1, marginTop: 16 }}
            exit={{ height: 0, opacity: 0, marginTop: 0 }}
            className="overflow-hidden text-gray-500 font-body leading-relaxed text-sm"
          >
            {item.answer}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQ() {
  return (
    <section className="py-24 bg-gray-50/50 overflow-hidden">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-16 px-4">
          <h2 className="text-4xl font-bold font-display text-black mb-4">
            Product <span className="text-[#FF2D78]">Clarity</span>
          </h2>
          <p className="text-gray-500 font-body">Everything you need to know about scaling with botChat.</p>
        </div>

        <div className="space-y-4 px-4">
          {faqs.map((faq, i) => (
            <FAQItem key={i} item={faq} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
