import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Tips, tutorials, and strategies for Instagram and Facebook DM automation, AI chatbots, social selling, and converting comments into customers. Learn from BotChat experts.",
  openGraph: {
    title: "Blog — BotChat",
    description:
      "Expert guides on Instagram and Facebook automation, AI chatbots, and social selling strategies.",
  },
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}
