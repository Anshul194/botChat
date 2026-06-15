import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import ReduxProvider from "@/components/providers/ReduxProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import { ModalProvider } from "@/components/providers/ModalProvider";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import { Toaster } from "sonner";
import NavigationOverlay from "@/components/NavigationOverlay";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BotChat — Instagram DM & Facebook Messenger Automation Platform",
    template: "%s — BotChat",
  },
  description:
    "Automate Instagram DMs and Facebook Messenger with AI-powered chatbots. Convert comments into customers in under 1 second. Trusted by 47,000+ creators and brands. Fully Meta policy compliant.",
  keywords: [
    "Instagram DM automation",
    "Facebook Messenger chatbot",
    "convert comments to customers",
    "AI social media automation",
    "Instagram lead generation",
    "Facebook bot for business",
    "DM auto reply Instagram",
    "social media AI chatbot",
    "link in bio tool",
    "Instagram comment automation",
    "Facebook comment responder",
    "social selling automation",
    "Instagram follow gated content",
    "AI chat flows",
    "Instagram and Facebook automation platform",
  ],
  openGraph: {
    title: "BotChat — Instagram DM & Facebook Messenger Automation",
    description:
      "Turn every Instagram and Facebook comment into a paying customer. AI-powered DM automation trusted by 47,000+ businesses. Fully Meta compliant.",
    type: "website",
    siteName: "BotChat",
    locale: "en_IN",
    countryName: "India",
    images: [{ url: "https://botchat.divyangtechlabs.com/og-image.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@botchat",
    title: "BotChat — Instagram DM & Facebook Messenger Automation",
    description:
      "Turn every Instagram and Facebook comment into a paying customer. AI-powered DM automation trusted by 47,000+ businesses.",
    images: ["https://botchat.divyangtechlabs.com/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "https://botchat.divyangtechlabs.com",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" sizes="any" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "BotChat",
              url: "https://botchat.divyangtechlabs.com",
              logo: "https://botchat.divyangtechlabs.com/logo.png",
              description:
                "AI-powered Instagram DM and Facebook Messenger automation platform. Convert comments into customers automatically.",
              sameAs: [
                "https://facebook.com/botchat",
                "https://instagram.com/botchat",
                "https://twitter.com/botchat",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer support",
                email: "support@botchat.com",
              },
              address: {
                "@type": "PostalAddress",
                addressCountry: "IN",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "BotChat",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              description:
                "Automate Instagram DMs and Facebook Messenger with AI chatbots. Reply to comments in under 1 second.",
              url: "https://botchat.divyangtechlabs.com",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
                description: "Free trial available",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "4.8",
                ratingCount: "47000",
                bestRating: "5",
              },
            }),
          }}
        />

        {/* Prevent flash of wrong theme on first load */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('botchat-theme') || 'dark';
                  document.documentElement.classList.add(t);
                } catch(e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} antialiased`}>
        <ReduxProvider>
          <AuthProvider>
            <ReactQueryProvider>
              <ThemeProvider>
                <ModalProvider>
                  {children}
                  <NavigationOverlay />
                  <Toaster richColors position="top-right" />
                </ModalProvider>
              </ThemeProvider>
            </ReactQueryProvider>
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
