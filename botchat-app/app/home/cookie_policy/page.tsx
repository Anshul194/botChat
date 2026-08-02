import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy — BotChat",
  description: "Read the BotChat Cookie Policy. Learn about what cookies we use, how they support your session, and how to manage your consent preferences.",
};

export default function CookiePolicy() {
  return (
    <article className="max-w-none text-zinc-900 dark:text-zinc-100">
      <div className="mb-14 border-b border-zinc-200 dark:border-zinc-800 pb-8">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
          Cookie <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D78] to-[#E1306C]">Policy</span>
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-widest text-sm">Last Updated: March 27, 2026</p>
      </div>

      <div className="space-y-12 leading-relaxed text-lg">
        <section className="bg-white/5 dark:bg-zinc-900/50 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800/50 shadow-sm">
          <p className="text-zinc-700 dark:text-zinc-300">
            This Cookie Policy explains how <strong className="text-zinc-900 dark:text-white font-bold">BotChat</strong> uses cookies and similar tracking technologies when you interact with our website and dashboard. We aim to be fully transparent about our data collection practices.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-4 mb-6">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FF2D78]/10 text-[#FF2D78] font-black text-sm">1</span>
            <h2 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">What are Cookies?</h2>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 pl-12">
            Cookies are small text files placed on your device by websites you visit. They are widely used to make websites work, enable security features, improve user experiences, and provide analytics information to website owners.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-4 mb-6">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FF2D78]/10 text-[#FF2D78] font-black text-sm">2</span>
            <h2 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Cookies We Use</h2>
          </div>
          <div className="space-y-8 pl-12">
            <div className="bg-zinc-50 dark:bg-zinc-900/30 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">A. Essential Cookies (Always Active)</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-base">These cookies are critical for the security and basic functionality of BotChat. They allow you to log in, access secure areas of the dashboard, prevent cross-site request forgery, and keep your session authenticated.</p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-900/30 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">B. Preference & Functional Cookies</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-base">Functional cookies allow us to remember your theme settings (e.g., light or dark mode preferences), language preferences, and custom settings you configure on your workspace dashboard.</p>
            </div>
            <div className="bg-zinc-50 dark:bg-zinc-900/30 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">C. Analytics & Optimization Cookies</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-base">These cookies help us analyze visitor interactions with our website and identify performance bottlenecks. We use these aggregated insights to design a more intuitive user interface.</p>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-4 mb-6">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FF2D78]/10 text-[#FF2D78] font-black text-sm">3</span>
            <h2 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Cookie Acceptance and Consent</h2>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 pl-12">
            By continuing to browse our platform, you accept the use of essential and functional cookies necessary for account operation. You can control or refuse non-essential cookies via your browser's configuration panel.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-4 mb-6">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FF2D78]/10 text-[#FF2D78] font-black text-sm">4</span>
            <h2 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Managing Your Preferences</h2>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 pl-12">
            Most modern web browsers allow you to manage cookies through their settings. You can delete existing cookies, block third-party cookies, or configure your browser to notify you when a new cookie is set. Please note that disabling essential cookies will prevent you from signing into the dashboard.
          </p>
        </section>
      </div>
    </article>
  );
}
