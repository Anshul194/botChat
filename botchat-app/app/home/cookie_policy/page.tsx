import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie Policy — BotChat",
  description: "Read the BotChat Cookie Policy. Learn about what cookies we use, how they support your session, and how to manage your consent preferences.",
};

export default function CookiePolicy() {
  return (
    <article className="prose prose-pink prose-invert max-w-none">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4 text-white">
          Cookie <span className="text-[#ec4899]">Policy</span>
        </h1>
        <p className="text-slate-400 font-medium">Last Updated: March 27, 2026</p>
      </div>

      <div className="space-y-12 text-slate-300 leading-relaxed">
        <section>
          <p>
            This Cookie Policy explains how <strong>BotChat</strong> uses cookies and similar tracking technologies when you interact with our website and dashboard. We aim to be fully transparent about our data collection practices.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">1. What are Cookies?</h2>
          <p>
            Cookies are small text files placed on your device by websites you visit. They are widely used to make websites work, enable security features, improve user experiences, and provide analytics information to website owners.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">2. Cookies We Use</h2>
          <div className="space-y-6 mt-4">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">A. Essential Cookies (Always Active)</h3>
              <p>These cookies are critical for the security and basic functionality of BotChat. They allow you to log in, access secure areas of the dashboard, prevent cross-site request forgery, and keep your session authenticated.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">B. Preference & Functional Cookies</h3>
              <p>Functional cookies allow us to remember your theme settings (e.g., light or dark mode preferences), language preferences, and custom settings you configure on your workspace dashboard.</p>
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">C. Analytics & Optimization Cookies</h3>
              <p>These cookies help us analyze visitor interactions with our website and identify performance bottlenecks. We use these aggregated insights to design a more intuitive user interface.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">3. Cookie Acceptance and Consent</h2>
          <p>
            By continuing to browse our platform, you accept the use of essential and functional cookies necessary for account operation. You can control or refuse non-essential cookies via your browser's configuration panel.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">4. Managing Your Preferences</h2>
          <p>
            Most modern web browsers allow you to manage cookies through their settings. You can delete existing cookies, block third-party cookies, or configure your browser to notify you when a new cookie is set. Please note that disabling essential cookies will prevent you from signing into the dashboard.
          </p>
        </section>
      </div>
    </article>
  );
}
