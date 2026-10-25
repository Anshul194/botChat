import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import FAQSchema from "@/components/FAQSchema";
import { ThemeProvider } from "@/components/ThemeProvider";
import ReduxProvider from "@/components/providers/ReduxProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import { ModalProvider } from "@/components/providers/ModalProvider";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import { Toaster } from "sonner";
import NavigationOverlay from "@/components/NavigationOverlay";
import { TenantSettingsProvider } from "@/providers/TenantSettingsProvider";
import { DateTimeProvider } from "@/providers/DateTimeProvider";
import SubscriptionProvider from "@/providers/SubscriptionProvider";
import DynamicBranding from "@/components/DynamicBranding";
import CookieConsent from "@/components/CookieConsent";

const syne = localFont({
  src: [
    { path: "../public/fonts/syne-400.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/syne-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-syne",
  display: "swap",
});

const dmSans = localFont({
  src: [
    { path: "../public/fonts/dm-sans-400.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/dm-sans-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-dm-sans",
  display: "swap",
});

const inter = localFont({
  src: [
    { path: "../public/fonts/inter-400.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/inter-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-inter",
  display: "swap",
});

const montserrat = localFont({
  src: [
    { path: "../public/fonts/montserrat-400.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/montserrat-700.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://megadm.chat"),
  title: {
    default: "MegaDM — Instagram & Facebook Automation Platform",
    template: "%s | MegaDM",
  },
  description:
    "Automate Instagram DMs and Facebook Messenger with AI-powered workflows. Built on Meta's Official API.",
  keywords: ["Instagram Automation", "Facebook Automation", "DM Funnels", "Comment Automation", "MegaDM"],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/brand/apple-touch-icon.png",
  },
  manifest: "/brand/manifest.webmanifest",
  openGraph: {
    type: "website",
    siteName: "MegaDM",
    title: "MegaDM — Turn Social Engagement Into Customers",
    description: "Automate Instagram DMs and Facebook Messenger with official Meta API automation.",
    url: "https://megadm.chat",
    images: [{ url: "/brand/social/og-image.png", width: 1200, height: 630, alt: "MegaDM Logo" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MegaDM — Social Media Automation",
    description: "Automate Instagram & Facebook with smart triggers.",
    images: ["/brand/social/og-image.png"],
  },
};


export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fc217f",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/brand/apple-touch-icon.png" />
        <link rel="manifest" href="/brand/manifest.webmanifest" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "MegaDM",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              url: "https://megadm.chat",
              logo: "https://megadm.chat/logo/logo-dark.svg",
              description:
                "AI-powered Instagram DM and Facebook automation platform. Convert comments into customers automatically.",
              sameAs: [
                "https://facebook.com/megadm",
                "https://instagram.com/megadm",
                "https://twitter.com/megadm",
              ],
              contactPoint: {
                "@type": "ContactPoint",
                contactType: "customer support",
                email: "support@megadm.chat",
                telephone: "+91-9111022290",
              },
              author: {
                "@type": "Organization",
                name: "MEGASTACK AI LLP",
                url: "https://megadm.chat",
                address: {
                  "@type": "PostalAddress",
                  streetAddress: "Cabin No. H, 3rd Floor, E-3/114, Arera Colony, Mahaveer Nagar, Habibganj Police Station, Huzur",
                  addressLocality: "Bhopal",
                  addressRegion: "Madhya Pradesh",
                  postalCode: "462016",
                  addressCountry: "IN",
                },
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
              name: "MegaDM",
              applicationCategory: "BusinessApplication",
              operatingSystem: "Web",
              description:
                "Automate Instagram DMs and Facebook Messenger with AI workflows. Reply to comments in under 1 second.",
              url: "https://megadm.chat",
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

        {/* FAQ Structured Data */}
        <FAQSchema />

        {/* Dynamic tenant favicon/logo injected by client component */}
        <DynamicBranding />

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
      <body className={`${inter.variable} ${syne.variable} ${dmSans.variable} ${montserrat.variable} antialiased`}>
        <ReduxProvider>
          <AuthProvider>
            <ReactQueryProvider>
              <TenantSettingsProvider>
                <SubscriptionProvider>
                  <ThemeProvider>
                    <DateTimeProvider>
                      <ModalProvider>
                        {children}
                        <NavigationOverlay />
                        <Toaster richColors position="top-right" />
                        <CookieConsent />
                      </ModalProvider>
                    </DateTimeProvider>
                  </ThemeProvider>
                </SubscriptionProvider>
              </TenantSettingsProvider>
            </ReactQueryProvider>
          </AuthProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
