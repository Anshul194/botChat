import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browser Caching Policy — BotChat",
  description: "Learn how BotChat optimizes performance through CDN and browser caching, and how to manage data synchronization and stale cache.",
};

export default function BrowserCaching() {
  return (
    <article className="max-w-none text-zinc-900 dark:text-zinc-100">
      <div className="mb-14 border-b border-zinc-200 dark:border-zinc-800 pb-8">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
          Browser <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D78] to-[#E1306C]">Caching</span>
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-widest text-sm">Last Updated: March 27, 2026</p>
      </div>

      <div className="space-y-12 leading-relaxed text-lg">
        <section className="bg-white/5 dark:bg-zinc-900/50 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800/50 shadow-sm">
          <p className="text-zinc-700 dark:text-zinc-300">
            At <strong className="text-zinc-900 dark:text-white font-bold">BotChat</strong>, we utilize advanced caching strategies to ensure our social media automation platform is lightning-fast, highly responsive, and efficient in its resource consumption. Caching helps us reduce API latency and minimize load times.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-4 mb-6">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FF2D78]/10 text-[#FF2D78] font-black text-sm">1</span>
            <h2 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">What is Browser Caching?</h2>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 pl-12">
            Browser caching is a mechanism where your web browser stores copies of static files (such as HTML pages, stylesheets, scripts, images, and API responses) locally on your device. When you revisit BotChat, your browser loads these files from your local storage instead of fetching them again over the network, dramatically speeding up page load times.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-4 mb-6">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FF2D78]/10 text-[#FF2D78] font-black text-sm">2</span>
            <h2 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Cache Types We Use</h2>
          </div>
          <ul className="space-y-4 pl-12 text-zinc-600 dark:text-zinc-400">
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF2D78] mt-2.5 shrink-0" />
              <span><strong className="text-zinc-900 dark:text-zinc-200">Static Assets:</strong> JavaScript bundles, CSS files, fonts, and brand assets are cached aggressively. These assets change only when we deploy platform updates.</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF2D78] mt-2.5 shrink-0" />
              <span><strong className="text-zinc-900 dark:text-zinc-200">CDN Caching:</strong> Content Delivery Networks (CDNs) cache static assets globally on servers closest to you to reduce latency.</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-[#FF2D78] mt-2.5 shrink-0" />
              <span><strong className="text-zinc-900 dark:text-zinc-200">API Query Cache:</strong> Certain read-only API requests (like feature list configurations) are cached temporarily (usually 1-5 minutes) to avoid redundant backend calls.</span>
            </li>
          </ul>
        </section>

        <section>
          <div className="flex items-center gap-4 mb-6">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FF2D78]/10 text-[#FF2D78] font-black text-sm">3</span>
            <h2 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Managing Stale Data & Cache Invalidation</h2>
          </div>
          <p className="text-zinc-600 dark:text-zinc-400 pl-12 mb-4">
            Because we display real-time metrics, comment streams, and DM statistics, caching can occasionally lead to stale information being shown. If you suspect you are viewing outdated data:
          </p>
          <ul className="space-y-4 pl-12 text-zinc-600 dark:text-zinc-400">
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 mt-2.5 shrink-0" />
              <span><strong className="text-zinc-900 dark:text-zinc-200">Hard Refresh:</strong> Force your browser to bypass the cache. On Windows/Linux, press <code className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-sm text-[#FF2D78] font-bold">Ctrl + Shift + R</code>. On macOS, press <code className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded text-sm text-[#FF2D78] font-bold">Cmd + Shift + R</code>.</span>
            </li>
            <li className="flex items-start gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-zinc-400 dark:bg-zinc-500 mt-2.5 shrink-0" />
              <span><strong className="text-zinc-900 dark:text-zinc-200">Clear Site Data:</strong> Clear local storage, session storage, and cookies via your browser's Developer Tools to reset all local states.</span>
            </li>
          </ul>
        </section>
      </div>
    </article>
  );
}
