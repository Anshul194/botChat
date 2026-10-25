import React from "react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Use — MegaDM",
  description: "Read the Terms of Use for MegaDM. Learn about your rights and responsibilities when using our Instagram and Facebook automation platform.",
};

export default function TermsOfUse() {
  return (
    <article className="prose prose-pink dark:prose-invert max-w-none">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4 text-foreground">
          Terms of <span className="text-[#ec4899]">Use</span>
        </h1>
        <p className="text-muted-foreground font-medium">Last Updated: October 25, 2026</p>
      </div>

      <div className="space-y-12 leading-relaxed text-foreground">
        <section>
          <p>
            Welcome to <strong>MegaDM</strong>. These Terms of Use (&quot;Terms&quot;) govern your access to and use of our SaaS platform, website, and social media automation services (collectively, the &quot;Service&quot;). MegaDM is a product operated by MEGASTACK AI LLP. By accessing or using MegaDM, you agree to be bound by these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">1. Introduction</h2>
          <p>
            MegaDM is a multi-tenant SaaS platform designed to provide automation tools for Facebook and Instagram. Our services include chatbot building, automated comment replies, persistent menu management, and multi-user team access. The Service is operated by MEGASTACK AI LLP.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">2. Eligibility</h2>
          <p>
            To use MegaDM, you must be at least 18 years of age and have the legal capacity to enter into a binding agreement. Use by anyone under 18 is strictly prohibited unless supervised by a legal guardian who agrees to these Terms on their behalf.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">3. Account &amp; Multi-Tenant Usage</h2>
          <ul className="list-disc pl-6 space-y-3">
            <li><strong>Account Security:</strong> You are responsible for all activity under your account and for maintaining the confidentiality of your login credentials.</li>
            <li><strong>Multi-Tenant Structure:</strong> MegaDM operates as a multi-tenant platform. Tenant administrators are responsible for managing team access and ensuring all authorized users comply with these Terms.</li>
            <li><strong>Unauthorized Use:</strong> You must immediately notify us of any unauthorized use of your account or security breach.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">4. Acceptable Use Policy</h2>
          <p>You agree not to use the Service to:</p>
          <ul className="list-disc pl-6 mt-4 space-y-3">
            <li>Violate any local, state, national, or international law.</li>
            <li>Send spam, unsolicited messages, or any communication that violates Meta&apos;s terms of service.</li>
            <li>Upload or transmit harmful content, viruses, or malicious code.</li>
            <li>Interfere with or disrupt the platform&apos;s performance or integrity.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">5. Social Media Integration Terms</h2>
          <p>MegaDM integrates with Facebook and Instagram via Meta APIs. By using these features, you agree to:</p>
          <ul className="list-disc pl-6 mt-4 space-y-3">
            <li>Connect your accounts via the official Meta OAuth process.</li>
            <li>Comply with <strong>Meta&apos;s Platform Terms</strong> and <strong>Developer Policies</strong>.</li>
            <li>Grant MegaDM the permissions necessary to process messages, comments, and profile data on your behalf.</li>
            <li>Understand that you can revoke this access at any time through your Facebook/Instagram Business Integration settings.</li>
            <li>Acknowledge that third-party platforms control their own APIs, permissions, availability, rate limits, and account enforcement. You are responsible for configuring your workflows in accordance with applicable third-party platform rules and Meta&apos;s Community Standards.</li>
          </ul>
          <p className="mt-4 text-sm text-muted-foreground italic">
            Disclaimer of Trademark Affiliation: MegaDM is an independent platform and is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Meta Platforms, Inc., Facebook, Instagram, or any of their subsidiaries or affiliates.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">6. Data Usage Disclaimer</h2>
          <p>
            MegaDM processes data retrieved from social media APIs to execute your chosen automation rules. We <strong>DO NOT</strong> sell your data. Data processed via our platform is used solely to provide the automation services you have configured. You remain the owner of your data and are responsible for the content of your communications.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">7. Subscription &amp; Payments</h2>
          <p>
            MegaDM offers monthly and annual subscription tiers. Fees are billed in advance according to the plan selected. Monthly subscription fees are non-refundable once billed. For annual subscriptions, you may cancel at any time, and unused full months will be refunded on a pro-rated basis as outlined on our pricing page. You may manage your subscription through your account settings or by contacting <a href="mailto:support@megadm.chat" className="text-[#ec4899] hover:underline font-bold">support@megadm.chat</a>. We reserve the right to modify pricing with advance notice to existing subscribers.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">8. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your access to the Service for any violation of these Terms or for conduct that we believe is harmful to other users or our business interests. You may terminate your account at any time via the dashboard settings.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">9. Disclaimer of Warranties</h2>
          <p className="bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl text-zinc-700 dark:text-zinc-350 text-sm leading-relaxed">
            TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, THE SERVICE IS PROVIDED ON AN &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE. FOR DETAILED INFORMATION REGARDING PLATFORM DEPENDENCIES AND CACHE BEHAVIOR, PLEASE REVIEW OUR <Link href="/home/disclaimer" className="text-[#ec4899] hover:underline font-bold">DISCLAIMER</Link>.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">10. Limitation of Liability</h2>
          <p className="bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-6 rounded-2xl italic text-zinc-700 dark:text-zinc-350">
            TO THE FULLEST EXTENT PERMITTED BY LAW, MEGADM AND ITS OPERATING ENTITY MEGASTACK AI LLP SHALL NOT BE LIABLE FOR ANY INDIRECT, CONSEQUENTIAL, OR INCIDENTAL DAMAGES ARISING FROM YOUR USE OF THE SERVICE. OUR TOTAL AGGREGATE LIABILITY SHALL NOT EXCEED THE TOTAL FEES PAID BY YOU IN THE TWELVE MONTHS PRIOR TO THE CLAIM.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">11. Governing Law &amp; Jurisdiction</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of India. Any legal dispute, claim, or controversy arising out of or relating to these Terms or the Service shall be subject to the exclusive jurisdiction of the competent courts in Bhopal, Madhya Pradesh, India.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">12. Changes to Terms</h2>
          <p>
            We may update these Terms from time to time to reflect changes in our services or legal requirements. Continued use of the Service after such changes constitutes acceptance of the new Terms.
          </p>
        </section>

        <section className="pt-8 border-t border-zinc-200 dark:border-white/10">
          <h2 className="text-2xl font-bold text-foreground mb-4">13. Legal Entity &amp; Contact Information</h2>
          <p>MegaDM is operated by MEGASTACK AI LLP. If you have questions regarding these Terms, please contact us:</p>
          <p className="mt-4">
            Email: <a href="mailto:support@megadm.chat" className="text-[#ec4899] hover:underline font-bold">
              support@megadm.chat
            </a>
          </p>
          <p className="mt-2">
            Phone: +91 9111022290
          </p>
          <p className="mt-2 text-sm text-muted-foreground">
            Registered Office: Cabin No. H, 3rd Floor, E-3/114, Arera Colony, Mahaveer Nagar, Habibganj Police Station, Huzur, Bhopal - 462016, Madhya Pradesh, India
          </p>
        </section>
      </div>
    </article>
  );
}
