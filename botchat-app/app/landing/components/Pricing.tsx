"use client";

import { motion } from "framer-motion";
import { Check, CheckCircle2 } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "0",
    description: "Perfect for testing the waters and personal accounts.",
    features: ["Up to 100 AI replies", "1 Social account", "Basic brand voice", "Standard support"],
    featured: false,
    cta: "Get Started for Free"
  },
  {
    name: "Growth",
    price: "29",
    description: "Built for creators and brands scaling their influence.",
    features: ["Unlimited AI replies", "5 Social accounts", "Custom brand voice", "Advanced analytics", "Priority support"],
    featured: true,
    cta: "Start Free Trial"
  },
  {
    name: "Enterprise",
    price: "99",
    description: "For agencies and large teams managing many profiles.",
    features: ["Unlimited everything", "Unlimited accounts", "API access", "White-label reports", "Personal account manager"],
    featured: false,
    cta: "Contact Sales"
  }
];

export default function Pricing() {
  return (
    <section className="py-24 bg-gray-50/50">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block px-4 py-1.5 rounded-full text-xs font-bold bg-[#FF2D78]/5 text-[#FF2D78] uppercase tracking-wider mb-4"
          >
            Pricing
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold text-gray-900 mb-6"
          >
            Choose your <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D78] to-[#E1306C]">perfect plan</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-gray-600 max-w-2xl mx-auto"
          >
            Simple, transparent pricing to help you grow your engagement without breaking the bank.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`relative flex flex-col p-8 rounded-3xl transition-all h-full ${
                plan.featured 
                  ? "bg-white border-2 border-[#FF2D78] shadow-2xl scale-105 z-10" 
                  : "bg-white border border-gray-100 hover:shadow-xl shadow-sm"
              }`}
            >
              {plan.featured && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r from-[#FF2D78] to-[#E1306C]">
                  MOST POPULAR
                </div>
              )}
              
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  <span className="text-gray-500 font-medium">/mo</span>
                </div>
                <p className="text-gray-600 text-sm">{plan.description}</p>
              </div>

              <div className="flex-grow space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-[#FF2D78] shrink-0 mt-0.5" />
                    <span className="text-gray-700 text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <button 
                className={`w-full py-4 rounded-2xl font-bold transition-all ${
                  plan.featured
                    ? "bg-gradient-to-r from-[#FF2D78] to-[#E1306C] text-white hover:opacity-90 shadow-lg shadow-[#FF2D78]/25"
                    : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                }`}
              >
                {plan.cta}
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
