import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Features",
  description:
    "Explore BotChat's powerful features: AI-powered Instagram DM automation, Facebook Messenger chatbot, drag-and-drop flow builder, link-in-bio tools, email collector, and deep analytics. Convert social media comments into customers automatically.",
  keywords: [
    "Instagram DM auto reply",
    "Facebook comment automation",
    "AI chat flow builder",
    "Instagram lead generation tool",
    "social media automation features",
    "Instagram follow gated DM",
    "link in bio page builder",
    "social selling platform",
  ],
  openGraph: {
    title: "Features — BotChat",
    description:
      "AI-powered Instagram and Facebook automation features that convert comments into paying customers automatically.",
  },
}

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  return children
}
