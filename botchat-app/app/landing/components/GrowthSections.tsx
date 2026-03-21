"use client";

import { Bot, BrainCircuit, CheckCircle2, CirclePlay, Clock3, Layers, Link2, Rocket, Users } from "lucide-react";

const logos = ["Notion", "Shopify", "HubSpot", "Meta", "Zapier", "Stripe"];

const workflowSteps = [
  {
    title: "Connect your channels",
    description: "Link Instagram, Facebook, and website chat in less than 5 minutes.",
    icon: Link2,
  },
  {
    title: "Pick a template",
    description: "Start from pre-built flows for sales, support, launches, and lead capture.",
    icon: Layers,
  },
  {
    title: "Go live and optimize",
    description: "AI improves replies, routing, and timing based on real conversation outcomes.",
    icon: Rocket,
  },
];

const useCases = [
  "Lead qualification for service businesses",
  "24/7 support for ecommerce brands",
  "Appointment booking for coaches and clinics",
  "Comment-to-DM funnels for creators",
  "Product recommendations and upsell flows",
  "Event registrations and reminder campaigns",
];

const templates = [
  "Welcome + lead magnet delivery",
  "Abandoned DM follow-up sequence",
  "Product FAQ and smart routing",
  "Launch day waitlist collector",
  "Creator collaboration intake",
  "Booking and payment confirmation",
];

const comparisons = [
  {
    metric: "Setup time",
    botchat: "10-20 min",
    others: "2-5 days",
  },
  {
    metric: "Automation quality",
    botchat: "Context-aware AI",
    others: "Keyword rules only",
  },
  {
    metric: "Lead capture",
    botchat: "Built-in forms + sync",
    others: "Third-party tools",
  },
  {
    metric: "Team visibility",
    botchat: "Shared inbox + analytics",
    others: "Limited or add-on",
  },
];

const integrations = [
  "Instagram",
  "Facebook",
  "WhatsApp",
  "Zapier",
  "HubSpot",
  "Google Sheets",
  "Stripe",
  "Slack",
];

export default function GrowthSections() {
  return (
    <>
      <section className="border-y border-rose-100 bg-rose-50/60 py-10">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 md:grid-cols-[1.4fr_2fr] md:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-600">Social proof</p>
            <h3 className="mt-2 text-3xl font-bold text-slate-900 font-display">Trusted by teams shipping faster conversations</h3>
            <p className="mt-3 text-slate-600 font-body">48,000+ active users · 120M+ automated replies delivered</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {logos.map((logo) => (
              <div key={logo} className="rounded-2xl border border-rose-100 bg-white px-4 py-3 text-center text-sm font-semibold text-slate-700 shadow-sm">
                {logo}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-600">How it works</p>
            <h2 className="mt-3 text-4xl font-bold text-slate-900 font-display">Three steps to launch your AI chat engine</h2>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {workflowSteps.map((step, index) => (
              <div key={step.title} className="rounded-3xl border border-slate-100 bg-white p-7 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                    <step.icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-semibold text-slate-400">0{index + 1}</span>
                </div>
                <h3 className="mt-5 text-xl font-bold text-slate-900 font-display">{step.title}</h3>
                <p className="mt-2 text-slate-600 font-body">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-slate-100">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-600">Use cases</p>
              <h3 className="mt-3 text-3xl font-bold text-slate-900 font-display">Built for growth, support, and conversion</h3>
              <div className="mt-6 space-y-3">
                {useCases.map((item) => (
                  <div key={item} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
                    <p className="text-slate-700 font-body">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl bg-slate-900 p-8 text-slate-100 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-300">Templates / pre-built flows</p>
              <h3 className="mt-3 text-3xl font-bold font-display">Launch proven journeys instantly</h3>
              <div className="mt-6 space-y-3">
                {templates.map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <Bot className="mt-0.5 h-5 w-5 text-rose-300" />
                    <p className="font-body text-slate-200">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-3xl bg-gradient-to-br from-rose-50 via-white to-orange-50 p-8 ring-1 ring-rose-100">
            <p className="inline-flex items-center gap-2 rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-700">
              <BrainCircuit className="h-4 w-4" /> AI feature highlight
            </p>
            <h3 className="mt-4 text-3xl font-bold text-slate-900 font-display">Intent-aware AI that responds like your best rep</h3>
            <p className="mt-4 text-slate-700 font-body">BotChat does more than match keywords. It scores intent, references previous conversation context, and selects the right path dynamically.</p>
            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-rose-100 bg-white p-5">
                <Clock3 className="h-5 w-5 text-rose-600" />
                <p className="mt-2 text-sm font-semibold text-slate-900">Response time</p>
                <p className="text-2xl font-bold text-slate-900">&lt; 2 sec</p>
              </div>
              <div className="rounded-2xl border border-rose-100 bg-white p-5">
                <Users className="h-5 w-5 text-rose-600" />
                <p className="mt-2 text-sm font-semibold text-slate-900">Intent recognition</p>
                <p className="text-2xl font-bold text-slate-900">94%</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-slate-950 py-24 text-white">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-300">Comparison section</p>
              <h3 className="mt-3 text-3xl font-bold font-display">Why teams switch from legacy chatbot tools</h3>
              <div className="mt-8 overflow-hidden rounded-3xl border border-white/10">
                <table className="w-full text-left text-sm">
                  <thead className="bg-white/5 text-slate-300">
                    <tr>
                      <th className="px-4 py-3">Metric</th>
                      <th className="px-4 py-3">BotChat</th>
                      <th className="px-4 py-3">Others</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisons.map((row) => (
                      <tr key={row.metric} className="border-t border-white/10">
                        <td className="px-4 py-3 text-slate-200">{row.metric}</td>
                        <td className="px-4 py-3 font-semibold text-emerald-300">{row.botchat}</td>
                        <td className="px-4 py-3 text-slate-400">{row.others}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-3xl border border-emerald-300/25 bg-emerald-300/10 p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">Results / ROI stats</p>
              <h3 className="mt-3 text-3xl font-bold font-display">Measured impact in the first 60 days</h3>
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-300">Lead conversion</p>
                  <p className="mt-2 text-3xl font-bold text-white">+37%</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-300">Agent workload</p>
                  <p className="mt-2 text-3xl font-bold text-white">-52%</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-300">Reply speed</p>
                  <p className="mt-2 text-3xl font-bold text-white">4.8x</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.14em] text-slate-300">Attributed revenue</p>
                  <p className="mt-2 text-3xl font-bold text-white">$180k+</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-center text-sm font-semibold uppercase tracking-[0.16em] text-rose-600">Integrations</p>
          <h3 className="mt-3 text-center text-3xl font-bold text-slate-900 font-display">Works with your existing stack</h3>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {integrations.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-200 bg-white px-4 py-5 text-center text-sm font-semibold text-slate-700 shadow-sm">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-600">Demo / video</p>
            <h3 className="mt-3 text-2xl font-bold text-slate-900 font-display">See it in 90 seconds</h3>
            <p className="mt-3 text-slate-600 font-body">Quick walkthrough of setup, live replies, analytics, and optimization loops.</p>
            <a
              href="#"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              <CirclePlay className="h-4 w-4" />
              Watch product demo
            </a>
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
              Replace this card with embedded product video or Loom preview.
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
