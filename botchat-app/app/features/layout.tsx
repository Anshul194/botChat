import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Features",
  description: "Explore BotChat's powerful features: AI-powered chatbots, unified social inbox, smart automation flows, real-time analytics, and more for Instagram & Facebook.",
}

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return children
}
