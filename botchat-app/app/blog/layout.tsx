import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Blog",
  description: "Tips, tutorials, and insights on Instagram & Facebook automation, AI chatbots, and social media marketing strategies.",
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children
}
