import type { MetadataRoute } from "next"

const BASE_URL = "https://botchat.divyangtechlabs.com"

const staticRoutes: { url: string; priority?: number; changeFreq?: string }[] = [
  { url: "/", priority: 1.0, changeFreq: "weekly" },
  { url: "/features", priority: 0.9, changeFreq: "monthly" },
  { url: "/pricing", priority: 0.9, changeFreq: "monthly" },
  { url: "/blog", priority: 0.8, changeFreq: "weekly" },
  { url: "/home/terms_use", priority: 0.3, changeFreq: "yearly" },
  { url: "/home/privacy_policy", priority: 0.3, changeFreq: "yearly" },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${BASE_URL}${route.url}`,
    lastModified: new Date(),
    changeFrequency: route.changeFreq as
      | "always"
      | "hourly"
      | "daily"
      | "weekly"
      | "monthly"
      | "yearly"
      | "never"
      | undefined,
    priority: route.priority,
  }))

  let blogEntries: MetadataRoute.Sitemap = []
  try {
    const res = await fetch(`${BASE_URL}/api/v1/blogs?status=published&limit=100`, {
      cache: "no-store",
    })
    if (res.ok) {
      const data = await res.json()
      const posts = data?.data ?? []
      blogEntries = posts.map((post: { slug: string; updated_at?: string }) => ({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: post.updated_at ? new Date(post.updated_at) : new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }))
    }
  } catch {
    // Silently fail — blog routes still exist as client-rendered pages
  }

  return [...staticEntries, ...blogEntries]
}
