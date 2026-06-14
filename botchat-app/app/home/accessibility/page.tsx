import React from "react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Accessibility Statement — BotChat",
  description: "BotChat is committed to ensuring digital accessibility for all users. Read our accessibility statement including German Sign Language (DGS) and easy-to-read language options.",
};

export default function AccessibilityPage() {
  return (
    <article className="prose prose-pink prose-invert max-w-none">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-4 text-white">
          Accessibility <span className="text-[#ec4899]">Statement</span>
        </h1>
        <p className="text-slate-400 font-medium">Last Updated: June 14, 2026</p>
      </div>

      <div className="space-y-12 text-slate-300 leading-relaxed">
        <section id="commitment">
          <h2 className="text-2xl font-bold text-white mb-4">1. Commitment to Accessibility</h2>
          <p>
            BotChat is committed to ensuring digital accessibility for people with disabilities. We continually improve the user experience for everyone and apply the relevant accessibility standards. Our goal is to make our platform perceivable, operable, understandable, and robust for all users.
          </p>
          <p className="mt-4">
            We strive to conform to the Web Content Accessibility Guidelines (WCAG) 2.2 Level AA, which define requirements for making web content more accessible to people with a wide range of disabilities.
          </p>
        </section>

        <section id="measures">
          <h2 className="text-2xl font-bold text-white mb-4">2. Measures to Support Accessibility</h2>
          <p>BotChat takes the following measures to ensure accessibility:</p>
          <ul className="list-disc pl-6 mt-4 space-y-3">
            <li>Include accessibility as a requirement for all new components and features.</li>
            <li>Assign clear accessibility targets and responsibilities.</li>
            <li>Perform regular accessibility audits using automated tools and manual testing.</li>
            <li>Provide ongoing accessibility training for our design and development teams.</li>
          </ul>
        </section>

        <section id="conformance">
          <h2 className="text-2xl font-bold text-white mb-4">3. Conformance Status</h2>
          <p>
            The Web Content Accessibility Guidelines (WCAG) define requirements for designers and developers to improve accessibility for people with disabilities. It defines three levels of conformance: Level A, Level AA, and Level AAA.
          </p>
          <p className="mt-4">
            BotChat is <strong>partially conformant</strong> with WCAG 2.2 Level AA. Partially conformant means that some parts of the content do not fully conform to the accessibility standard, and we are actively working to address these areas.
          </p>
        </section>

        <section id="feedback">
          <h2 className="text-2xl font-bold text-white mb-4">4. Feedback & Reporting Barriers</h2>
          <p>
            We welcome your feedback on the accessibility of BotChat. Please let us know if you encounter accessibility barriers:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-3">
            <li>
              <strong>Email:</strong>{" "}
              <a href="mailto:accessibility@botchat.ai" className="text-[#ec4899] hover:underline font-bold">
                accessibility@botchat.ai
              </a>
            </li>
            <li>
              <strong>Phone:</strong> +49 30 12345678
            </li>
            <li>
              <strong>Postal Address:</strong> BotChat GmbH, Accessibility Team, Musterstraße 1, 10115 Berlin, Germany
            </li>
          </ul>
          <p className="mt-4">
            We try to respond to feedback within 5 business days.
          </p>
        </section>

        <section id="sign-language">
          <h2 className="text-2xl font-bold text-white mb-4">5. German Sign Language (DGS)</h2>
          <p>
            A German Sign Language (DGS) version of this accessibility statement is available. You can access the DGS video below:
          </p>
          <div className="bg-white/5 border border-white/10 p-8 rounded-[32px] mt-6 text-center">
            <p className="text-slate-400 text-lg mb-4">&#x1F5E3;&#xFE0F; DGS Video: Accessibility Statement</p>
            <div className="w-full max-w-2xl mx-auto aspect-video bg-white/10 rounded-2xl flex items-center justify-center border border-white/5">
              <p className="text-slate-500 text-sm">DGS video content will be available here.</p>
            </div>
            <p className="mt-4 text-slate-400 text-sm">
              Alternatively, you can download the{" "}
              <a href="#" className="text-[#ec4899] hover:underline font-bold">DGS transcript (PDF)</a>.
            </p>
          </div>
        </section>

        <section id="easy-read">
          <h2 className="text-2xl font-bold text-white mb-4">6. Easy-to-Read Language Version</h2>
          <p>
            We provide an easy-to-read version of this accessibility statement for people with learning disabilities or limited reading proficiency.
          </p>
          <div className="bg-white/5 border border-white/10 p-8 rounded-[32px] mt-6">
            <h3 className="text-xl font-bold text-white mb-4">Easy-to-Read Summary</h3>
            <ul className="space-y-3 text-slate-300">
              <li>&bull; BotChat wants everyone to be able to use our website.</li>
              <li>&bull; We work hard to make our website easy to use for all people.</li>
              <li>&bull; If you have trouble using our website, please tell us.</li>
              <li>&bull; You can email us at accessibility@botchat.ai.</li>
              <li>&bull; We will answer within 5 days.</li>
            </ul>
            <p className="mt-6 text-slate-400 text-sm">
              Download the{" "}
              <a href="#" className="text-[#ec4899] hover:underline font-bold">easy-to-read PDF version</a>.
            </p>
          </div>
        </section>

        <section id="technical">
          <h2 className="text-2xl font-bold text-white mb-4">7. Technical Specifications</h2>
          <p>
            Accessibility of BotChat relies on the following technologies to work with the particular combination of web browser and any assistive technologies or plugins installed on your computer:
          </p>
          <ul className="list-disc pl-6 mt-4 space-y-3">
            <li><strong>HTML / ARIA</strong> — We use WAI-ARIA landmarks, roles, and attributes to enhance semantic structure.</li>
            <li><strong>CSS</strong> — We use responsive design and relative units to support text resizing.</li>
            <li><strong>JavaScript</strong> — We use JavaScript for enhanced interactivity while ensuring core functionality remains accessible.</li>
          </ul>
        </section>

        <section id="limitations">
          <h2 className="text-2xl font-bold text-white mb-4">8. Known Limitations</h2>
          <p>Despite our best efforts, some areas may still have accessibility limitations. We are actively working to address these:</p>
          <ul className="list-disc pl-6 mt-4 space-y-3">
            <li><strong>Color contrast:</strong> Some non-essential decorative elements may not meet the strictest contrast ratios.</li>
            <li><strong>Third-party content:</strong> Some embedded content from third parties may not be fully accessible.</li>
            <li><strong>Legacy components:</strong> Older interface components are being progressively updated.</li>
          </ul>
        </section>

        <section id="complaints">
          <h2 className="text-2xl font-bold text-white mb-4">9. Filing a Complaint</h2>
          <p>
            If you are not satisfied with our response to your accessibility feedback, you have the right to file a complaint with the relevant national authority:
          </p>
          <div className="bg-white/5 border border-white/10 p-8 rounded-[32px] mt-6">
            <p className="font-bold text-white">Competent Authority for Accessibility</p>
            <p className="mt-2 text-slate-300">
              Federal Office for Accessibility<br />
              Musterweg 10<br />
              10115 Berlin, Germany<br />
              Email: <a href="mailto:office@accessibility-office.de" className="text-[#ec4899] hover:underline font-bold">office@accessibility-office.de</a>
            </p>
          </div>
        </section>

        <section className="pt-8 border-t border-white/10">
          <h2 className="text-2xl font-bold text-white mb-4">10. Contact Information</h2>
          <p>For all accessibility-related inquiries:</p>
          <p className="mt-4">
            Email: <a href="mailto:accessibility@botchat.ai" className="text-[#ec4899] hover:underline font-bold">accessibility@botchat.ai</a>
          </p>
          <p className="mt-2">
            Phone: +49 30 12345678
          </p>
        </section>
      </div>
    </article>
  );
}
