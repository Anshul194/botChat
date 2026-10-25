import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accessibility Statement — MegaDM",
  description: "MegaDM is committed to ensuring digital accessibility for all users. Read our accessibility commitment and feedback channels.",
};

export default function AccessibilityPage() {
  return (
    <article className="prose prose-pink dark:prose-invert max-w-none">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4 text-foreground">
          Accessibility <span className="text-[#fc217f]">Statement</span>
        </h1>
        <p className="text-muted-foreground font-medium">Last Updated: October 25, 2026</p>
      </div>

      <div className="space-y-12 leading-relaxed text-foreground">
        <section id="commitment">
          <h2 className="text-2xl font-bold text-foreground mb-4">1. Commitment to Accessibility</h2>
          <p>
            MegaDM is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply relevant accessibility standards. Our goal is to make our platform perceivable, operable, understandable, and robust for all users.
          </p>
          <p className="mt-4">
            We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA, which define requirements for making web content more accessible to people with a wide range of disabilities.
          </p>
        </section>

        <section id="measures">
          <h2 className="text-2xl font-bold text-foreground mb-4">2. Measures to Support Accessibility</h2>
          <p>MegaDM takes the following measures to support accessibility:</p>
          <ul className="list-disc pl-6 mt-4 space-y-3">
            <li>Include accessibility considerations across component and feature development.</li>
            <li>Evaluate keyboard navigation, focus management, and screen-reader accessibility during updates.</li>
            <li>Regularly audit frontend interfaces using automated diagnostic tools and manual reviews.</li>
            <li>Actively address reported accessibility barriers submitted by our users.</li>
          </ul>
        </section>

        <section id="conformance">
          <h2 className="text-2xl font-bold text-foreground mb-4">3. Conformance Status</h2>
          <p>
            The Web Content Accessibility Guidelines (WCAG) define requirements for designers and developers to improve accessibility for people with disabilities across three levels: Level A, Level AA, and Level AAA.
          </p>
          <p className="mt-4">
            MegaDM is actively working toward conformance with <strong>WCAG 2.2 Level AA</strong>. While we continually audit and improve our public marketing and application experiences, some parts of the interface may not yet fully conform to all criteria. We are dedicated to identifying, documenting, and resolving these limitations.
          </p>
        </section>

        <section id="feedback">
          <h2 className="text-2xl font-bold text-foreground mb-4">4. Feedback &amp; Reporting Barriers</h2>
          <p>
            We welcome your feedback on the accessibility of MegaDM. MegaDM is operated by MEGASTACK AI LLP. Please let us know if you encounter accessibility barriers:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-3">
            <li>
              <strong>Email:</strong>{" "}
              <a href="mailto:support@megadm.chat" className="text-[#fc217f] hover:underline font-bold">
                support@megadm.chat
              </a>
            </li>
            <li>
              <strong>Phone:</strong> +91 9111022290
            </li>
            <li>
              <strong>Postal Address:</strong> MEGASTACK AI LLP, Accessibility Team, Cabin No. H, 3rd Floor, E-3/114, Arera Colony, Mahaveer Nagar, Habibganj Police Station, Huzur, Bhopal - 462016, Madhya Pradesh, India
            </li>
          </ul>
          <p className="mt-4">
            We try to respond to accessibility feedback within 5 business days.
          </p>
        </section>

        <section id="alternative-formats">
          <h2 className="text-2xl font-bold text-foreground mb-4">5. Alternative Formats</h2>
          <p>
            We are committed to providing accessible information. If you require this statement, our policies, or product documentation in an alternative format (such as an audio summary, large print, or high-contrast digital format), please contact us at{" "}
            <a href="mailto:support@megadm.chat" className="text-[#fc217f] hover:underline font-bold">
              support@megadm.chat
            </a>{" "}
            and our team will be pleased to assist you.
          </p>
        </section>

        <section id="easy-read">
          <h2 className="text-2xl font-bold text-foreground mb-4">6. Easy-to-Read Summary</h2>
          <p>
            We provide this simplified summary of our accessibility commitment:
          </p>
          <div className="bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-8 rounded-[32px] mt-6">
            <h3 className="text-xl font-bold text-foreground mb-4">At a Glance</h3>
            <ul className="space-y-3">
              <li>&bull; MegaDM wants everyone to be able to use our website and automation tools.</li>
              <li>&bull; We work hard to make our interfaces easy to use for all people, including assistive technology users.</li>
              <li>&bull; If you have trouble using any part of our website, please tell us.</li>
              <li>&bull; You can email us at support@megadm.chat or call +91 9111022290.</li>
              <li>&bull; We will answer and help you within 5 business days.</li>
            </ul>
          </div>
        </section>

        <section id="technical">
          <h2 className="text-2xl font-bold text-foreground mb-4">7. Technical Specifications</h2>
          <p>
            The accessibility of MegaDM relies on the following technologies to work with web browsers and assistive technologies:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-3">
            <li><strong>HTML / ARIA</strong> — Standard semantic markup and WAI-ARIA roles, states, and properties.</li>
            <li><strong>CSS</strong> — Responsive layouts, scalable typography, and focus visibility styling.</li>
            <li><strong>JavaScript</strong> — Interactive functionality with keyboard navigation and modal dialog management.</li>
          </ul>
        </section>

        <section id="limitations">
          <h2 className="text-2xl font-bold text-foreground mb-4">8. Known Limitations &amp; Roadmap</h2>
          <p>Despite our ongoing efforts, some areas of the platform may have accessibility limitations that we are actively working to address:</p>
          <ul className="list-disc pl-6 mt-4 space-y-3">
            <li><strong>Complex Data Tables &amp; Analytics:</strong> Some rich analytics dashboards and interactive chart visualizations are being updated to provide enhanced tabular fallbacks and screen-reader summaries.</li>
            <li><strong>Third-Party Content:</strong> Embedded previews, social media widgets, and third-party APIs (such as Meta Graph API responses) may contain content outside our direct control.</li>
            <li><strong>Legacy Dialogs &amp; Animation:</strong> Certain legacy dialogs and continuous animations are being systematically upgraded with enhanced keyboard trapping, focus restoration, and pause controls.</li>
          </ul>
        </section>

        <section id="complaints">
          <h2 className="text-2xl font-bold text-foreground mb-4">9. Grievance &amp; Complaints</h2>
          <p>
            If you are not satisfied with our response to your accessibility feedback, you may escalate your request to our Grievance &amp; Accessibility team:
          </p>
          <div className="bg-zinc-50 dark:bg-white/5 border border-zinc-200 dark:border-white/10 p-8 rounded-[32px] mt-6">
            <p className="font-bold text-foreground">MEGASTACK AI LLP — Grievance &amp; Accessibility Desk</p>
            <p className="mt-2 text-sm leading-relaxed">
              Cabin No. H, 3rd Floor, E-3/114, Arera Colony, Mahaveer Nagar, Habibganj Police Station, Huzur,<br />
              Bhopal - 462016, Madhya Pradesh, India<br />
              Phone: +91 9111022290<br />
              Email: <a href="mailto:support@megadm.chat" className="text-[#fc217f] hover:underline font-bold">support@megadm.chat</a>
            </p>
          </div>
        </section>

        <section className="pt-8 border-t border-zinc-200 dark:border-white/10">
          <h2 className="text-2xl font-bold text-foreground mb-4">10. Contact Information</h2>
          <p>MegaDM is operated by MEGASTACK AI LLP. For all accessibility-related inquiries:</p>
          <p className="mt-4">
            Email: <a href="mailto:support@megadm.chat" className="text-[#fc217f] hover:underline font-bold">support@megadm.chat</a>
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
