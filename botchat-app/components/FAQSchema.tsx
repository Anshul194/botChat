const faqs = [
  {
    question: "Is LinkDM officially compliant with Meta (Facebook/Instagram)?",
    answer: "Yes, 100%. We use the Official Messenger API and follow all Meta developer guidelines. Unlike 'grey-hat' scrapers, LinkDM is a verified partner tool, meaning your credentials are safe and your account remains in perfect standing.",
  },
  {
    question: "Will my Instagram account get flagged or banned for automation?",
    answer: "Never. We've processed over 25M+ automated interactions with a 0% ban rate. Our system mimics natural human behavior with dynamic delays and 'Smart Throttling' that stays well below platform limits.",
  },
  {
    question: "How fast does it actually reply to a Reel comment?",
    answer: "Lightning fast—usually within 0.8 seconds. Speed-to-lead is our obsession. By hitting the inbox while the user is still watching your Reel, we maximize your conversion opportunity by up to 300%.",
  },
  {
    question: "Can I collect emails and sync them to my CRM (Klaviyo/Mailchimp)?",
    answer: "Absolutely. LinkDM features 'Intelligent Data Capture.' Our AI prompts users for their email naturally within the flow, validates it, and syncs it instantly to your preferred marketing tool.",
  },
  {
    question: "Do I need any technical skill or coding to set this up?",
    answer: "Zero. If you can type a message, you can use LinkDM. Our 'Logic-Mapper' is a visual drag-and-drop system. You can have your first Reel fully automated in less than 3 minutes.",
  },
  {
    question: "Can I use my own domain for my Bio Link?",
    answer: "Absolutely. You can use your custom domain or a subdomain to maintain brand consistency. We also provide SEO-optimized slugs (e.g., botchat.com/yourname) that load in under 1 second.",
  }
];

export default function FAQSchema() {
  return (
    <script
      type="application/ld+json"
      id="faq-schema"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }),
      }}
    />
  );
}
