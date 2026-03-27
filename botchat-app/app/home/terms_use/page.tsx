import React from "react";

export default function TermsOfUse() {
  return (
    <article className="prose prose-pink prose-invert max-w-none">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4 text-white">
          Terms of <span className="text-[#ec4899]">Use</span>
        </h1>
        <p className="text-slate-400 font-medium">Last Updated: March 27, 2026</p>
      </div>

      <div className="space-y-12 text-slate-300 leading-relaxed">
        <section>
          <p>
            Welcome to <strong>MegaDM Chat</strong>. These Terms of Use ("Terms") govern your access to and use of our SaaS platform, website, and social media automation services (collectively, the "Service"). By accessing or using MegaDM Chat, you agree to be bound by these Terms.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
          <p>
            MegaDM Chat is a multi-tenant SaaS platform designed to provide automation tools for Facebook and Instagram. Our services include chatbot building, automated comment replies, persistent menu management, and multi-user team access. The Service is provided by MegaDM Chat.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">2. Eligibility</h2>
          <p>
            To use MegaDM Chat, you must be at least 18 years of age and have the legal capacity to enter into a binding agreement. Use by anyone under 18 is strictly prohibited unless supervised by a legal guardian who agrees to these Terms on their behalf.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">3. Account & Multi-Tenant Usage</h2>
          <ul className="list-disc pl-6 space-y-3">
            <li><strong>Account Security:</strong> You are responsible for all activity under your account and for maintaining the confidentiality of your login credentials.</li>
            <li><strong>Multi-Tenant Structure:</strong> MegaDM Chat operates as a multi-tenant platform. Tenant administrators are responsible for managing team access and ensuring all authorized users comply with these Terms.</li>
            <li><strong>Unauthorized Use:</strong> You must immediately notify us of any unauthorized use of your account or security breach.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">4. Acceptable Use Policy</h2>
          <p>You agree to use MegaDM Chat only for lawful purposes. Prohibited activities include, but are not limited to:</p>
          <ul className="list-disc pl-6 mt-4 space-y-3">
            <li>Sending spam, unsolicited messages, or any communication that violates anti-spam laws.</li>
            <li>Using automation to harass, abuse, or defame individuals.</li>
            <li>Distributing malware or attempting to gain unauthorized access to our systems.</li>
            <li>Violating the intellectual property rights of others.</li>
            <li>Using the Service in any way that exceeds the API rate limits or Fair Use policies of Meta Platforms.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">5. Social Media Integration Terms</h2>
          <p>MegaDM Chat integrates with Facebook and Instagram via Meta APIs. By using these features, you agree to:</p>
          <ul className="list-disc pl-6 mt-4 space-y-3">
            <li>Connect your accounts via the official Meta OAuth process.</li>
            <li>Comply with <strong>Meta's Platform Terms</strong> and <strong>Developer Policies</strong>.</li>
            <li>Grant MegaDM Chat the permissions necessary to process messages, comments, and profile data on your behalf.</li>
            <li>Understand that you can revoke this access at any time through your Facebook/Instagram Business Integration settings.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">6. Data Usage Disclaimer</h2>
          <p>
            MegaDM Chat processes data retrieved from social media APIs to execute your chosen automation rules. We <strong>DO NOT</strong> sell your data. Data processed via our platform is used solely to provide the automation services you have configured. You remain the owner of your data and are responsible for the content of your communications.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">7. Subscription & Payments</h2>
          <p>
            MegaDM Chat offers various subscription tiers. Fees are billed according to the plan selected and are generally non-refundable. We reserve the right to modify pricing with advance notice to existing subscribers.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">8. Termination</h2>
          <p>
            We reserve the right to suspend or terminate your access to the Service for any violation of these Terms or for conduct that we believe is harmful to other users or our business interests. You may terminate your account at any time via the dashboard settings.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">9. Limitation of Liability</h2>
          <p className="bg-white/5 border border-white/10 p-6 rounded-2xl italic">
            TO THE FULLEST EXTENT PERMITTED BY LAW, MEGADOM CHAT SHALL NOT BE LIABLE FOR ANY INDIRECT, CONSEQUENTIAL, OR INCIDENTAL DAMAGES ARISING FROM YOUR USE OF THE SERVICE. OUR TOTAL AGGREGATE LIABILITY SHALL NOT EXCEED THE TOTAL FEES PAID BY YOU IN THE TWELVE MONTHS PRIOR TO THE CLAIM.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">10. Changes to Terms</h2>
          <p>
            We may update these Terms from time to time to reflect changes in our services or legal requirements. Continued use of the Service after such changes constitutes acceptance of the new Terms.
          </p>
        </section>

        <section className="pt-8 border-t border-white/10">
          <h2 className="text-2xl font-bold text-white mb-4">11. Contact Information</h2>
          <p>If you have questions regarding these Terms, please contact us at:</p>
          <p className="mt-4">
            <a href="mailto:legal@megadm.chat" className="text-[#ec4899] hover:underline font-bold">
              legal@megadm.chat
            </a>
          </p>
        </section>
      </div>
    </article>
  );
}
