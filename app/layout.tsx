import { Providers } from "@/components/providers";
import { siteConfig } from "@/config/site";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.author.name, url: siteConfig.author.url }],
  creator: siteConfig.author.name,
  publisher: siteConfig.author.name,
  keywords: [
    "service booking",
    "multi-portal",
    "admin dashboard",
    "vendor portal",
    "nextjs",
    "react",
    "tailwind css",
  ],
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.url,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f9fafb" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

// Structured data for search engines
const organization = {
  "@type": "Organization",
  "@id": `${siteConfig.author.url}/#organization`,
  name: siteConfig.author.name,
  url: siteConfig.author.url,
  email: siteConfig.author.email,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    organization,
    {
      "@type": "SoftwareApplication",
      name: siteConfig.name,
      description: siteConfig.description,
      url: siteConfig.url,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      softwareVersion: siteConfig.version,
      author: { "@id": organization["@id"] },
      creator: { "@id": organization["@id"] },
      publisher: { "@id": organization["@id"] },
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
          }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
