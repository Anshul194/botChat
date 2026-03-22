"use client";

import { Lock, ShieldCheck, Sparkles } from "lucide-react";

const security = [
  "Role-based access control",
  "Audit logs for every automation change",
  "Encrypted data in transit and at rest",
  "GDPR-friendly data handling workflows",
];

export default function TrustAndFinalCTA() {
  return (
    <>
      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-600">Security / trust</p>
            <h3 className="mt-3 text-3xl font-bold text-slate-900 font-display">Enterprise-grade controls for every message</h3>
            <div className="mt-7 grid gap-4 md:grid-cols-2">
              {security.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-600" />
                  <p className="text-slate-700 font-body">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-7 inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              <Lock className="h-4 w-4" /> SOC 2-ready architecture
            </div>
          </div>
        </div>
      </section>

      <section className="relative bg-white py-20">
        <div className="mx-auto max-w-5xl px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-600">Final CTA</p>
          <h3 className="mt-3 text-4xl font-bold text-slate-900 font-display">Ready to automate your next 10,000 conversations?</h3>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600 font-body">Start free, launch your first workflow today, and scale without increasing support headcount.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a href="/auth/sign-up" className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-rose-300/40 transition hover:bg-rose-700">
              Start free trial
              <Sparkles className="h-4 w-4" />
            </a>
            <a href="/auth/sign-in" className="inline-flex items-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              Talk to sales
            </a>
          </div>
        </div>

        <div className="fixed bottom-4 left-1/2 z-40 w-[calc(100%-1.5rem)] max-w-4xl -translate-x-1/2 rounded-2xl border border-rose-300 bg-slate-900/95 px-4 py-3 text-white shadow-2xl backdrop-blur md:flex md:items-center md:justify-between md:px-6">
          <p className="text-sm font-medium">
            <span className="font-semibold text-rose-300"></span> Start your free BotChat workspace in 2 minutes.
          </p>
          <a href="/auth/sign-up" className="mt-3 inline-flex items-center gap-2 rounded-full bg-rose-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-400 md:mt-0">
            Get Started
            <Sparkles className="h-4 w-4" />
          </a>
        </div>
      </section>
    </>
  );
}
