import React from "react";

export default function PrivacyPolicy() {
  return (
    <article className="prose prose-pink prose-invert max-w-none">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4 text-white">
          Privacy <span className="text-[#ec4899]">Policy</span>
        </h1>
        <p className="text-slate-400 font-medium">Last Updated: March 27, 2026</p>
      </div>

      <div className="space-y-12 text-slate-300 leading-relaxed">
        <section>
          <p>
            At <strong>MegaDM Chat</strong>, we value your privacy and are committed to protecting your personal data. This Privacy Policy outlines how we collect, use, and process your information when you use our social media automation platform.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
          <p>
            This policy applies to all users of the MegaDM Chat platform and describes our practices regarding data collected via our website and integrated Meta APIs (Facebook and Instagram).
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">2. Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-3">
            <li><strong>Account Data:</strong> Name, email address, and billing information.</li>
            <li><strong>Service Data:</strong> Configuration settings for chatbots, auto-replies, and campaigns.</li>
            <li><strong>Technical Data:</strong> IP address, browser type, and usage logs for security and performance monitoring.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">3. Data from Facebook & Instagram APIs</h2>
          <p>As a Meta-integrated platform, we process specific data provided via Meta APIs:</p>
          <ul className="list-disc pl-6 mt-4 space-y-3">
            <li><strong>Access Tokens:</strong> To perform actions on your behalf (e.g., replying to comments).</li>
            <li><strong>Webhook Content:</strong> We receive real-time data for incoming messages, comments, and post interactions to trigger your automations.</li>
            <li><strong>Profile Information:</strong> Basic profile data (name, ID) of users interacting with your connected accounts.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">4. How We Use Data</h2>
          <p>Our use of data is strictly limited to providing the automation services you request. We use data to:</p>
          <ul className="list-disc pl-6 mt-4 space-y-3">
            <li>Facilitate automated replies and chatbot interactions.</li>
            <li>Provide multi-tenant team access and collaboration features.</li>
            <li>Ensure platform security and prevent abuse.</li>
            <li>Comply with Meta's developer requirements and platform policies.</li>
          </ul>
          <div className="bg-[#ec4899]/10 border-l-4 border-[#ec4899] p-4 mt-6">
            <p className="font-bold text-white">MegaDM Chat DOES NOT sell user data to third parties.</p>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">5. Cookies & Tracking</h2>
          <p>
            We use essential cookies to maintain your session and security-related tokens. We may also use analytical cookies to improve platform performance. You can manage cookie preferences in your browser settings.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">6. Data Sharing</h2>
          <p>We only share data with third parties in limited circumstances:</p>
          <ul className="list-disc pl-6 mt-4 space-y-3">
            <li><strong>Infrastructure Providers:</strong> Secure hosting and database services (e.g., AWS, Vercel).</li>
            <li><strong>Legal Compliance:</strong> When required by law or to protect against fraud and security threats.</li>
            <li><strong>Meta Platforms:</strong> Data is shared back with Meta APIs to execute your requested automations.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">7. Data Retention</h2>
          <p>
            We retain your account data as long as your subscription is active. Interaction data (messages/comments) is retained for the period necessary to provide the service or as required by your specific configuration.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">8. User Rights</h2>
          <p>
            You have the right to access, correct, or delete your personal data. You can also request a copy of the data we hold. Specifically, you have the right to revoke our access to your social media accounts at any time.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">9. Data Security</h2>
          <p>
            We employ industry-standard encryption and security protocols to safeguard your data. This includes SSL/TLS encryption for all data in transit and robust access controls for our production environments.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-white mb-4">10. Third-Party Services</h2>
          <p>
            Our service relies on Meta Platforms (Facebook/Instagram). Your use of these platforms is subject to Meta's own privacy policies and terms of service. We encourage you to review them.
          </p>
        </section>

        <section className="bg-white/5 border border-white/10 p-8 rounded-[32px]">
          <h2 className="text-2xl font-bold text-white mb-6">11. Data Deletion Instructions (Meta Compliance)</h2>
          <p>To comply with Meta's data deletion requirements, we provide three ways to remove your data:</p>
          <ol className="list-decimal pl-6 mt-6 space-y-6">
            <li>
              <strong>In-App Deletion:</strong> Navigate to your Account Settings -&gt; Data Management -&gt; "Delete All My Data." This action is permanent.
            </li>
            <li>
              <strong>Revoke Meta Access:</strong> Go to your Facebook Profile -&gt; Settings &amp; Privacy -&gt; Settings -&gt; Business Integrations. Select "MegaDM Chat" and click "Remove." We will automatically purge tokens and associated metadata within 48 hours of detecting revocation.
            </li>
            <li>
              <strong>Manual Request:</strong> Email <a href="mailto:privacy@megadm.chat" className="text-[#ec4899] hover:underline font-bold">privacy@megadm.chat</a> with the subject "Data Deletion Request." Include your account email or Meta Page ID. We will confirm deletion within 30 days.
            </li>
          </ol>
        </section>

        <section className="pt-8 border-t border-white/10">
          <h2 className="text-2xl font-bold text-white mb-4">12. Contact Information</h2>
          <p>For any privacy-related questions, please contact:</p>
          <p className="mt-4">
            Email: <a href="mailto:privacy@megadm.chat" className="text-[#ec4899] hover:underline font-bold">privacy@megadm.chat</a>
          </p>
        </section>
      </div>
    </article>
  );
}
