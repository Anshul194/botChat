import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer — BotChat",
  description: "BotChat Disclaimer. Learn about the limitations, cache behavior, and important notices regarding our social media automation platform.",
};

export default function DisclaimerPage() {
  return (
    <article className="prose prose-pink dark:prose-invert max-w-none">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4 text-foreground">
          <span className="text-[#ec4899]">Disclaimer</span>
        </h1>
        <p className="text-muted-foreground font-medium">Last Updated: July 29, 2026</p>
      </div>

      <div className="space-y-12 leading-relaxed text-foreground">
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">1. Information Accuracy</h2>
          <p>
            BotChat strives to provide accurate and up-to-date information on its platform. However, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability with respect to the information, products, services, or related graphics contained on our platform for any purpose. Any reliance you place on such information is therefore strictly at your own risk.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">2. Cache Behavior & Data Freshness</h2>
          <p>
            BotChat uses caching mechanisms to improve performance and reduce API load. As a result, data displayed on the platform — including social media metrics, comment histories, message logs, analytics, and user profile information — may be cached and not reflect real-time changes instantaneously.
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-3">
            <li>
              <strong>Data Caching:</strong> Cached data is stored temporarily to speed up page loads and reduce third-party API calls. Cached data may be delayed by a few minutes to several hours depending on the endpoint and system load.
            </li>
            <li>
              <strong>Cache Invalidation:</strong> Our system automatically invalidates caches based on configured TTL (Time to Live) values. Manual cache refresh may be required for some operations. If you notice stale data, try refreshing the page or clearing your browser cache.
            </li>
            <li>
              <strong>CDN Caching:</strong> Static assets (images, scripts, stylesheets) are served via a Content Delivery Network (CDN) and may be cached by your ISP or network. Changes to these assets may not appear immediately for all users.
            </li>
            <li>
              <strong>Browser Caching:</strong> Your browser may also cache API responses and static assets. If you encounter outdated information, a hard refresh (<strong>Ctrl + Shift + R</strong> or <strong>Cmd + Shift + R</strong>) can help.
            </li>
            <li>
              <strong>Webhook Latency:</strong> Real-time events from social media platforms (Facebook, Instagram) are delivered via webhooks and may experience delays due to platform rate limits, network conditions, or caching layers on Meta&apos;s side.
            </li>
          </ul>
          <div className="bg-yellow-500/10 dark:bg-yellow-500/5 border-l-4 border-yellow-500 p-4 mt-6 rounded-r-xl">
            <p className="font-semibold text-yellow-600 dark:text-yellow-400"> ⚠ Important Note on Cache</p>
            <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
              BotChat is not responsible for any decisions made based on stale or cached data. Users are encouraged to verify critical information directly on the social media platforms when accuracy is essential for business or legal purposes.
            </p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">3. Third-Party Platform Dependence</h2>
          <p>
            BotChat relies on Meta&apos;s (Facebook &amp; Instagram) APIs and other third-party services. These platforms may change their APIs, policies, or rate limits at any time, which may affect the functionality of BotChat.
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-3">
            <li><strong>Meta API Changes:</strong> We are not responsible for service disruptions caused by changes to Meta&apos;s platform policies or API availability.</li>
            <li><strong>Platform Downtime:</strong> BotChat is not liable for any downtime or data loss resulting from Meta platform outages or restrictions.</li>
            <li><strong>Account Restrictions:</strong> If Meta restricts or disables a connected account, BotChat cannot guarantee continued access or data recovery.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">4. No Guarantee of Results</h2>
          <p>
            While BotChat provides powerful automation tools, we do not guarantee specific outcomes, engagement rates, follower growth, or conversion rates. Results depend on multiple factors including content quality, audience behavior, platform algorithms, and market conditions — none of which are within BotChat&apos;s control.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">5. Limitation of Liability</h2>
          <p className="bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl italic text-zinc-700 dark:text-zinc-350">
            TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, BOTCHAT SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM OR ANY CACHING DELAYS, DATA INACCURACIES, OR SERVICE INTERRUPTIONS. OUR TOTAL AGGREGATE LIABILITY SHALL NOT EXCEED THE TOTAL FEES YOU PAID TO BOTCHAT IN THE TWELVE MONTHS PRECEDING THE CLAIM.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">6. Changes to This Disclaimer</h2>
          <p>
            We may update this disclaimer at any time without prior notice. Continued use of the BotChat platform constitutes acceptance of the updated terms. The last revision date is displayed at the top of this page.
          </p>
        </section>

        <section className="pt-8 border-t border-zinc-200 dark:border-white/10">
          <h2 className="text-2xl font-bold text-foreground mb-4">7. Contact Information</h2>
          <p>For questions regarding this disclaimer, cache behavior, or data accuracy concerns:</p>
          <p className="mt-4">
            Email: <a href="mailto:disclaimer@botchat.com" className="text-[#ec4899] hover:underline font-bold">disclaimer@botchat.com</a>
          </p>
        </section>
      </div>
    </article>
  );
}