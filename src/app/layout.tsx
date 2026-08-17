import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ChatWidget from "@/components/chat/ChatWidget";
import { Toaster } from "react-hot-toast";
import { ContactModalProvider } from "@/components/layout/ContactModalContext";
import ContactModal from "@/components/layout/ContactModal";
import CookieConsent from "@/components/layout/CookieConsent";
import MicrosoftClarity from "@/components/layout/MicrosoftClarity";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://vortixtech.com"),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "Vortix Tech — AI-Powered Digital Solutions",
    template: "%s | Vortix Tech",
  },
  description:
    "We build cutting-edge web apps, mobile apps, AI automations, ComfyUI workflows, and LLM solutions. Transform your business with Vortix Tech.",
  keywords: [
    "web development",
    "app development",
    "n8n automation",
    "ComfyUI workflows",
    "LLM solutions",
    "AI agents",
    "Next.js",
    "React Native",
    "Vortix Tech",
  ],
  authors: [{ name: "Vortix Tech" }],
  openGraph: {
    title: "Vortix Tech — AI-Powered Digital Solutions",
    description:
      "We build cutting-edge web apps, mobile apps, AI automations, and LLM solutions.",
    url: "https://vortixtech.com",
    siteName: "Vortix Tech",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vortix Tech — AI-Powered Digital Solutions",
    description:
      "We build cutting-edge web apps, mobile apps, AI automations, and LLM solutions.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${instrumentSerif.variable} antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.clarity.ms" />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground relative">
        {/* JSON-LD Schemas */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Vortix Tech",
              url: "https://vortixtech.com",
              logo: "https://vortixtech.com/logo.png",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+92 335 1283034",
                contactType: "customer service",
                email: "techvortix@gmail.com",
                availableLanguage: ["English", "Urdu"],
              },
              sameAs: ["https://www.linkedin.com/company/vortixtech"],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              url: "https://vortixtech.com",
              name: "Vortix Tech",
              potentialAction: {
                "@type": "SearchAction",
                target: {
                  "@type": "EntryPoint",
                  urlTemplate: "https://vortixtech.com/blog?q={search_term_string}",
                },
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "Vortix Tech",
              image: "https://vortixtech.com/logo.png",
              url: "https://vortixtech.com",
              telephone: "+92 335 1283034",
              address: {
                "@type": "PostalAddress",
                addressLocality: "Karachi",
                addressRegion: "Sindh",
                addressCountry: "PK",
              },
            }),
          }}
        />
        
        <ContactModalProvider>
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: "#FFFFFF",
                color: "#1A1A1A",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: "12px",
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
              },
            }}
          />
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <ChatWidget />
          <ContactModal />
          <CookieConsent />
          <MicrosoftClarity />
        </ContactModalProvider>
      </body>
    </html>
  );
}
