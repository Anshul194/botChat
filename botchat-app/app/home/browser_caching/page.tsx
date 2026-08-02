import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browser Caching Policy — BotChat",
  description: "Learn how BotChat optimizes performance through CDN and browser caching, and how to manage data synchronization and stale cache.",
};

export default function BrowserCaching() {
  return (
    <article className="prose prose-pink prose-invert max-w-none">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4 text-white">
          Browser <span className="text-[#ec4899]">Caching</span>
        </h1>
        <p className="text-slate-400 font-medium">Last Updated: March 27, 2026</p>
      </div>

      <div className="space-y-12 text-slate-300 leading-relaxed">
        <section>
          <p>
            At <strong>BotChat</strong>, we utilize advanced caching strategies to ensure our social media automation platform is lightning-fast, highly responsive, and efficient in its resource consumption. Caching helps us reduce API latency and minimize load times.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">1. What is Browser Caching?</h2>
          <p>
            Browser caching is a mechanism where your web browser stores copies of static files (such as HTML pages, stylesheets, scripts, images, and API responses) locally on your device. When you revisit BotChat, your browser loads these files from your local storage instead of fetching them again over the network, dramatically speeding up page load times.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">2. Cache Types We Use</h2>
          <ul className="list-disc pl-6 space-y-3">
            <li><strong>Static Assets:</strong> JavaScript bundles, CSS files, fonts, and brand assets are cached aggressively. These assets change only when we deploy platform updates.</li>
            <li><strong>CDN Caching:</strong> Content Delivery Networks (CDNs) cache static assets globally on servers closest to you to reduce latency.</li>
            <li><strong>API Query Cache:</strong> Certain read-only API requests (like feature list configurations or public plan definitions) are cached temporarily (usually with a TTL of 1 to 5 minutes) to avoid redundant backend calls.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">3. Managing Stale Data & Cache Invalidation</h2>
          <p>
            Because we display real-time metrics, comment streams, and DM statistics, caching can occasionally lead to stale information being shown. If you suspect you are viewing outdated data:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-3">
            <li><strong>Hard Refresh:</strong> You can force your browser to bypass the cache and download the newest assets. On Windows/Linux, press <code>Ctrl + Shift + R</code> or <code>Ctrl + F5</code>. On macOS, press <code>Cmd + Shift + R</code>.</li>
            <li><strong>Clear Site Data:</strong> You can clear local storage, session storage, and site cookies via your browser's Developer Tools (Application / Storage tab) to reset all local states.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">4. Updates and Policy Scope</h2>
          <p>
            Our caching algorithms and settings may change as we optimize the platform. We recommend keeping your browser updated to the latest version to ensure optimal caching behavior and compliance with web security guidelines.
          </p>
        </section>
      </div>
    </article>
  );
}
