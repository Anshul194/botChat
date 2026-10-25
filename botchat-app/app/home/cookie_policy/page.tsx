import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cookie & Storage Policy — MegaDM",
  description: "Read the MegaDM Cookie and Local Storage Policy. Learn about what browser storage technologies we use, their purposes, retention, and how to manage your consent preferences.",
};

export default function CookiePolicy() {
  return (
    <article className="max-w-none text-zinc-900 dark:text-zinc-100">
      <div className="mb-14 border-b border-zinc-200 dark:border-zinc-800 pb-8">
        <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4">
          Cookie &amp; Storage <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2D78] to-[#E1306C]">Policy</span>
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium uppercase tracking-widest text-sm">Last Updated: October 25, 2026</p>
      </div>

      <div className="space-y-12 leading-relaxed text-lg">
        <section className="bg-white/5 dark:bg-zinc-900/50 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800/50 shadow-sm">
          <p className="text-zinc-700 dark:text-zinc-300">
            This Cookie &amp; Storage Policy explains how <strong className="text-zinc-900 dark:text-white font-bold">MegaDM</strong> (operated by MEGASTACK AI LLP) uses browser cookies and HTML5 Web Storage technologies (<code className="text-[#FF2D78] font-bold">localStorage</code> and <code className="text-[#FF2D78] font-bold">sessionStorage</code>) when you interact with our website and software-as-a-service platform. We believe in complete transparency regarding our data collection and local device storage practices.
          </p>
        </section>

        <section>
          <div className="flex items-center gap-4 mb-6">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FF2D78]/10 text-[#FF2D78] font-black text-sm">1</span>
            <h2 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Cookies vs. Web Storage</h2>
          </div>
          <div className="space-y-4 pl-12 text-zinc-600 dark:text-zinc-400">
            <p>
              Web applications rely on different technologies to store information locally on your device:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>HTTP Cookies:</strong> Small data fragments sent between your browser and the server. Cookies are traditionally used for session management and network security.
              </li>
              <li>
                <strong>HTML5 Local Storage (<code className="text-[#FF2D78] font-bold">localStorage</code>):</strong> Client-side key-value storage that persists across browser sessions until explicitly cleared by the user, upon logging out, or by application logic.
              </li>
              <li>
                <strong>HTML5 Session Storage (<code className="text-[#FF2D78] font-bold">sessionStorage</code>):</strong> Ephemeral client-side storage that exists only for the duration of the current browser tab session and is automatically purged when the tab is closed.
              </li>
            </ul>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-4 mb-6">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FF2D78]/10 text-[#FF2D78] font-black text-sm">2</span>
            <h2 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Storage Keys We Use</h2>
          </div>
          <div className="space-y-8 pl-12">
            <div className="bg-zinc-50 dark:bg-zinc-900/30 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">A. Strictly Necessary &amp; Authentication Storage</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-base mb-4">
                These storage items are essential for authenticating user requests, securing workspace sessions, and remembering your privacy choices. They cannot be disabled without breaking core platform functionality.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-300">
                  <thead className="border-b border-zinc-200 dark:border-zinc-700 text-xs font-bold uppercase text-zinc-900 dark:text-zinc-100">
                    <tr>
                      <th className="py-2 pr-4">Storage Key</th>
                      <th className="py-2 pr-4">Type</th>
                      <th className="py-2 pr-4">Purpose</th>
                      <th className="py-2">Retention / Lifespan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    <tr>
                      <td className="py-2.5 pr-4 font-mono text-xs text-[#FF2D78]">token / accessToken</td>
                      <td className="py-2.5 pr-4">localStorage</td>
                      <td className="py-2.5 pr-4">Stores bearer authorization credentials for API calls.</td>
                      <td className="py-2.5">Cleared on logout or session expiration.</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4 font-mono text-xs text-[#FF2D78]">user</td>
                      <td className="py-2.5 pr-4">localStorage</td>
                      <td className="py-2.5 pr-4">Caches basic user profile data (name, email, role).</td>
                      <td className="py-2.5">Cleared on logout.</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4 font-mono text-xs text-[#FF2D78]">cookieConsentStatus</td>
                      <td className="py-2.5 pr-4">localStorage</td>
                      <td className="py-2.5 pr-4">Records consent decision (&quot;accepted&quot; or &quot;rejected&quot;).</td>
                      <td className="py-2.5">Persistent until reset via Cookie Settings or cleared.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900/30 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">B. Preference &amp; Functional Storage</h3>
              <p className="text-zinc-600 dark:text-zinc-400 text-base mb-4">
                These functional items allow the platform to remember your user interface settings and onboarding progress.
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-600 dark:text-zinc-300">
                  <thead className="border-b border-zinc-200 dark:border-zinc-700 text-xs font-bold uppercase text-zinc-900 dark:text-zinc-100">
                    <tr>
                      <th className="py-2 pr-4">Storage Key</th>
                      <th className="py-2 pr-4">Type</th>
                      <th className="py-2 pr-4">Purpose</th>
                      <th className="py-2">Retention / Lifespan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    <tr>
                      <td className="py-2.5 pr-4 font-mono text-xs text-[#FF2D78]">megadm-theme</td>
                      <td className="py-2.5 pr-4">localStorage</td>
                      <td className="py-2.5 pr-4">Remembers chosen UI theme (&quot;dark&quot; or &quot;light&quot;).</td>
                      <td className="py-2.5">Persistent until changed or cleared.</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4 font-mono text-xs text-[#FF2D78]">megadm.appearance</td>
                      <td className="py-2.5 pr-4">localStorage</td>
                      <td className="py-2.5 pr-4">Custom workspace appearance preferences.</td>
                      <td className="py-2.5">Persistent until changed or cleared.</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4 font-mono text-xs text-[#FF2D78]">megadm_tour_completed / megadm_tour_step</td>
                      <td className="py-2.5 pr-4">localStorage</td>
                      <td className="py-2.5 pr-4">Tracks completion of product walkthrough guides.</td>
                      <td className="py-2.5">Persistent until reset or cleared.</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 pr-4 font-mono text-xs text-[#FF2D78]">renewal_popup_dismissed_*</td>
                      <td className="py-2.5 pr-4">sessionStorage</td>
                      <td className="py-2.5 pr-4">Prevents repetitive subscription notices within a tab session.</td>
                      <td className="py-2.5">Automatically purged when browser tab closes.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-zinc-50 dark:bg-zinc-900/30 p-6 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">C. Analytics &amp; Third-Party Tracking Disclosure</h3>
              <div className="text-zinc-600 dark:text-zinc-400 text-base space-y-3">
                <p>
                  <strong>MegaDM Platform Marketing Website:</strong> The public MegaDM marketing site (including the homepage, pricing, features, blog, and documentation) does not deploy third-party advertising or analytics tracking cookies (such as Google Analytics, Meta Pixel, or Google Tag Manager).
                </p>
                <p>
                  <strong>Optional Creator Bio-Link Pages:</strong> Our platform provides creators with a bio-link builder (<code className="text-[#FF2D78] font-bold">/p/[slug]</code>). Creators may optionally configure their own Google Analytics (GA4) Measurement IDs to monitor traffic on their public profiles. These measurement scripts operate specifically on those creator profiles and are managed under the respective creator&apos;s configuration.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-4 mb-6">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FF2D78]/10 text-[#FF2D78] font-black text-sm">3</span>
            <h2 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">On-Site Consent Management</h2>
          </div>
          <div className="space-y-4 pl-12 text-zinc-600 dark:text-zinc-400">
            <p>
              When you first visit MegaDM, an on-site consent banner is presented to inform you of our storage practices and provide control:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Accept All:</strong> Acknowledges essential operational data, performance caching, and functional preference persistence.
              </li>
              <li>
                <strong>Reject Non-Essential:</strong> Restricts storage strictly to essential operational necessities required for authentication and security.
              </li>
            </ul>
            <p className="mt-4">
              <strong>Reviewing or Changing Your Consent:</strong> You may reopen your consent preferences at any time by clicking the <strong>&quot;Cookie Settings&quot;</strong> link located in the footer of any page. Reopening the dialog allows you to change your selection without disrupting your existing session.
            </p>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-4 mb-6">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FF2D78]/10 text-[#FF2D78] font-black text-sm">4</span>
            <h2 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Managing Storage in Your Browser</h2>
          </div>
          <div className="space-y-4 pl-12 text-zinc-600 dark:text-zinc-400">
            <p>
              You can also manage or clear stored data through your browser&apos;s native configuration settings:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong>Clearing Storage:</strong> You can delete all cookies and local storage items via your browser settings or Developer Tools (under <em>Application &rarr; Storage &rarr; Clear site data</em>).
              </li>
              <li>
                <strong>Blocking Cookies:</strong> Most browsers allow you to block cookies entirely. However, because authentication tokens require local storage to communicate with our API, completely disabling storage will prevent you from signing in to the dashboard.
              </li>
            </ul>
          </div>
        </section>

        <section className="pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-4 mb-6">
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FF2D78]/10 text-[#FF2D78] font-black text-sm">5</span>
            <h2 className="text-2xl md:text-3xl font-black text-zinc-900 dark:text-white tracking-tight">Legal Entity &amp; Contact Information</h2>
          </div>
          <div className="pl-12 text-zinc-600 dark:text-zinc-400 space-y-2">
            <p>MegaDM is operated by MEGASTACK AI LLP. For any cookie policy or data storage questions:</p>
            <p className="mt-2">
              Email: <a href="mailto:support@megadm.chat" className="text-[#FF2D78] hover:underline font-bold">support@megadm.chat</a>
            </p>
            <p>
              Phone: +91 9111022290
            </p>
            <p className="text-sm text-zinc-500">
              Registered Office: Cabin No. H, 3rd Floor, E-3/114, Arera Colony, Mahaveer Nagar, Habibganj Police Station, Huzur, Bhopal - 462016, Madhya Pradesh, India
            </p>
          </div>
        </section>
      </div>
    </article>
  );
}
