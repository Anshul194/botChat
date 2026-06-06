import type { Metadata } from "next";
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
  title: "BotChat — Instagram & Facebook Automation Platform",
  description:
    "Automate your Instagram DMs and Facebook Messenger with AI-powered chatbots. Unified inbox, smart automation flows, and real-time analytics for your business.",
  keywords: [
    "Instagram automation",
    "Facebook messenger bot",
    "DM automation",
    "chatbot SaaS",
    "social media automation",
  ],
  openGraph: {
    title: "BotChat — Instagram & Facebook Automation Platform",
    description:
      "Automate your social media communications with AI-powered workflows",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&family=Montserrat:wght@300;400;500;600;700;800;900&family=Nunito:wght@300;400;500;600;700;800;900&family=Source+Sans+Pro:wght@300;400;600;700;900&family=Urbanist:wght@300;400;500;600;700;800;900&family=Manrope:wght@300;400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,700&family=IBM+Plex+Sans:wght@300;400;500;600;700&family=Syne:wght@700;800&display=swap" rel="stylesheet" />

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
