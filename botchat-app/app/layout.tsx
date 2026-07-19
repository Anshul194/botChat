import type { Metadata, Viewport } from "next";
import { Inter, Syne, DM_Sans } from "next/font/google";
import "./globals.css";
import FAQSchema from "@/components/FAQSchema";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  display: "swap",
});
import { ThemeProvider } from "@/components/ThemeProvider";
import ReduxProvider from "@/components/providers/ReduxProvider";
import AuthProvider from "@/components/providers/AuthProvider";
import { ModalProvider } from "@/components/providers/ModalProvider";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";
import { Toaster } from "sonner";
import NavigationOverlay from "@/components/NavigationOverlay";
import { TenantSettingsProvider } from "@/providers/TenantSettingsProvider";
import SubscriptionProvider from "@/providers/SubscriptionProvider";
import DynamicBranding from "@/components/DynamicBranding";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "BotChat",
    template: "%s — BotChat",
  },
  description:
    "Automate Instagram DMs and Facebook Messenger with AI-powered chatbots.",
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
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
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
      <body className={`${inter.variable} ${syne.variable} ${dmSans.variable} antialiased`}>
        <ReduxProvider>
          <AuthProvider>
            <ReactQueryProvider>
              <TenantSettingsProvider>
                <SubscriptionProvider>
                  <ThemeProvider>
                    <ModalProvider>
                      {children}
                      <NavigationOverlay />
                      <Toaster richColors position="top-right" />
                    </ModalProvider>
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
