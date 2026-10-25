import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — MegaDM",
  description: "Read the MegaDM Privacy Policy. Learn how we collect, use, and protect your data when you use our social media automation platform.",
};

export default function PrivacyPolicy() {
  return (
    <article className="prose prose-pink dark:prose-invert max-w-none">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4 text-foreground">
          Privacy <span className="text-[#ec4899]">Policy</span>
        </h1>
        <p className="text-muted-foreground font-medium">Last Updated: March 27, 2026</p>
      </div>

      <div className="space-y-12 leading-relaxed text-foreground">
        <section>
          <p>
            At <strong>MegaDM</strong>, a service operated by <strong>MEGASTACK AI LLP</strong>, we value your privacy and are committed to protecting your personal data. This Privacy Policy outlines how we collect, use, and process your information when you use our social media automation platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">1. Introduction</h2>
          <p>
            This policy applies to all users of the MegaDM platform and describes our practices regarding data collected via our website and integrated Meta APIs (Facebook and Instagram).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">2. Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-3">
            <li><strong>Account Data:</strong> Name, email address, and billing information.</li>
            <li><strong>Service Data:</strong> Configuration settings for chatbots, auto-replies, and campaigns.</li>
            <li><strong>Technical Data:</strong> IP address, browser type, and usage logs for security and performance monitoring.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">3. Data from Facebook & Instagram APIs</h2>
          <p>As a Meta-integrated platform, we process specific data provided via Meta APIs:</p>
          <ul className="list-disc pl-6 mt-4 space-y-3">
            <li><strong>Access Tokens:</strong> To perform actions on your behalf (e.g., replying to comments).</li>
            <li><strong>Webhook Content:</strong> We receive real-time data for incoming messages, comments, and post interactions to trigger your automations.</li>
            <li><strong>Profile Information:</strong> Basic profile data (name, ID) of users interacting with your connected accounts.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">4. How We Use Data</h2>
          <p>Our use of data is strictly limited to providing the automation services you request. We use data to:</p>
          <ul className="list-disc pl-6 mt-4 space-y-3">
            <li>Facilitate automated replies and chatbot interactions.</li>
            <li>Provide multi-tenant team access and collaboration features.</li>
            <li>Ensure platform security and prevent abuse.</li>
            <li>Comply with Meta's developer requirements and platform policies.</li>
          </ul>
          <div className="bg-[#ec4899]/10 dark:bg-[#ec4899]/5 border-l-4 border-[#ec4899] p-4 mt-6">
            <p className="font-bold text-foreground">MegaDM DOES NOT sell user data to third parties.</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">5. Cookies & Tracking</h2>
          <p>
            We use essential cookies to maintain your session and security-related tokens. We may also use analytical cookies to improve platform performance. You can manage cookie preferences in your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">6. Data Sharing</h2>
          <p>We only share data with third parties in limited circumstances:</p>
          <ul className="list-disc pl-6 mt-4 space-y-3">
            <li><strong>Infrastructure Providers:</strong> Secure hosting and database services (e.g., AWS, Vercel).</li>
            <li><strong>Legal Compliance:</strong> When required by law or to protect against fraud and security threats.</li>
            <li><strong>Meta Platforms:</strong> Data is shared back with Meta APIs to execute your requested automations.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">7. Data Retention &amp; Categories</h2>
          <p>
            We adhere to strict data retention boundaries based on account lifecycle, tenant isolation, and legal requirements:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-3">
            <li>
              <strong>Active Workspace Data:</strong> Chatbot configurations, auto-reply rules, broadcast campaign settings, and contact lists are retained within your tenant-isolated database for the duration of your active subscription.
            </li>
            <li>
              <strong>Meta API Tokens &amp; Credentials:</strong> Meta OAuth access tokens and page access credentials are kept strictly during active connection and are permanently deleted immediately when an account or page is disconnected.
            </li>
            <li>
              <strong>Interaction &amp; Message History:</strong> Smart Inbox chats, comments, and conversation histories are retained during your active subscription to maintain continuity, or until manually pruned by workspace administrators.
            </li>
            <li>
              <strong>Financial &amp; Statutory Records:</strong> Subscription invoices, transaction references, and payment audit logs are retained by MEGASTACK AI LLP as required by applicable Indian commercial and tax laws (including the Companies Act and GST regulations) for statutory retention periods (up to 8 years).
            </li>
            <li>
              <strong>Operational Logs &amp; Backups:</strong> System security logs and encrypted disaster-recovery backups are retained on rolling operational retention cycles and automatically purged in accordance with standard backup rotation policies.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">8. User Rights</h2>
          <p>
            You have the right to access, rectify, or request the deletion of your personal data. You may disconnect social integrations at any time via your dashboard or request full workspace decommissioning by contacting our support team.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">9. Data Security</h2>
          <p>
            We employ industry-standard encryption and security protocols to safeguard your data. This includes SSL/TLS encryption for all data in transit, AES encryption for stored access tokens, tenant-level database isolation, and role-based access controls for our production environments.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-foreground mb-4">10. Third-Party Services</h2>
          <p>
            Our service integrates with Meta Platforms (Facebook and Instagram). Your use of these platforms is governed by Meta's own terms of service and privacy policies. We encourage you to review them.
          </p>
        </section>

        <section className="bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-8 rounded-[32px]">
          <h2 className="text-2xl font-bold text-foreground mb-6">11. Data Deletion Instructions &amp; Integration Management</h2>
          <p>MegaDM provides verified mechanisms to remove your data and manage external integrations:</p>
          <ol className="list-decimal pl-6 mt-6 space-y-6">
            <li>
              <strong>Disconnecting Social Integrations (Immediate In-App):</strong> You can disconnect your Facebook Pages or Instagram Accounts at any time from your dashboard under <em>Social Accounts / Integrations</em>. Disconnecting immediately executes an automated safety shutdown: active campaign automations and background jobs are halted, webhook subscriptions are unsubscribed, and stored Meta OAuth access tokens are permanently purged from the database.
            </li>
            <li>
              <strong>Revoking Access via Meta:</strong> You can revoke MegaDM's authorization directly in your Facebook profile under <em>Settings &amp; Privacy &rarr; Settings &rarr; Apps and Websites &rarr; MegaDM &rarr; Remove</em>. Once revoked, Meta immediately invalidates all granted tokens, preventing our platform from making any further API calls or processing automated responses on your behalf.
            </li>
            <li>
              <strong>Account Closure &amp; Complete Workspace Data Wipe:</strong> Primary workspace accounts involve multi-tenant database isolation, team member seats, and subscription records. To prevent accidental business interruption, complete account deletion is processed through our verified administrative workflow. To request full account termination and tenant database de-provisioning, email <a href="mailto:support@megadm.chat" className="text-[#ec4899] hover:underline font-bold">support@megadm.chat</a> with the subject "Data Deletion Request" from your registered account email.
            </li>
            <li>
              <strong>Request Verification &amp; Processing Timelines:</strong> Upon receipt, our team verifies workspace ownership and confirms the decommissioning request. Active automations and access credentials are deactivated immediately upon verification. Tenant database removal and file cleanup are completed within thirty (30) days, except for statutory financial and tax records retained as legally mandated.
            </li>
          </ol>
        </section>

        <section className="pt-8 border-t border-zinc-200 dark:border-white/10">
          <h2 className="text-2xl font-bold text-foreground mb-4">12. Legal Entity &amp; Contact Information</h2>
          <p>MegaDM is operated by MEGASTACK AI LLP. For any privacy-related questions, please contact:</p>
          <p className="mt-4">
            Email: <a href="mailto:support@megadm.chat" className="text-[#ec4899] hover:underline font-bold">support@megadm.chat</a>
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
