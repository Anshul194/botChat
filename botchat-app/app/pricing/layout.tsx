import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Choose the right BotChat plan for your business. Start with a free trial — no credit card required. Scale from solo creator to enterprise with Instagram and Facebook DM automation.",
  keywords: [
    "Instagram automation pricing",
    "Facebook chatbot cost",
    "social media automation plans",
    "DM automation subscription",
    "best value social media bot",
  ],
  openGraph: {
    title: "Pricing — BotChat",
    description:
      "Affordable plans for Instagram and Facebook DM automation. Start free, scale as you grow.",
  },
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
