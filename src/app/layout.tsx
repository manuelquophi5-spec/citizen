import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

import { getSiteUrl } from "@/lib/site-url";

const siteUrl = getSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "The Citizen Project — South Tongu District, Ghana",
    template: "%s | The Citizen Project",
  },
  description:
    "The Citizen Project promotes civic responsibility, community development, education, youth empowerment, environmental sustainability, and social justice across South Tongu District, Ghana.",
  openGraph: {
    title: "The Citizen Project",
    description: "Empowering citizens. Transforming communities. South Tongu District, Ghana.",
    url: siteUrl,
    siteName: "The Citizen Project",
    locale: "en_GH",
    type: "website",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <Providers>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-ocean-900 focus:shadow-lg"
          >
            Skip to content
          </a>
          <Navbar />
          <main id="main-content">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
