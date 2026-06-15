import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Pricing",
  description: "Choose the right BotChat plan for your business. Start with a free trial — no credit card required. Scale from solo creator to enterprise.",
}

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children
}
