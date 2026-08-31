import { GoatCounter } from "@/components/goat-counter";
import { Providers } from "@/components/providers";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, siteUrl } from "@/lib/seo";
import type { Metadata } from "next";
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
  metadataBase: new URL(siteUrl()),
  title: {
    default: DEFAULT_TITLE,
    template: "%s · NomadShield",
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "SavvyNomad alternative",
    "Savvy Nomad alternative",
    "Florida domicile digital nomad",
    "US tax domicile",
    "183 day log",
    "leave California taxes",
    "NomadShield",
  ],
  openGraph: {
    type: "website",
    siteName: "NomadShield",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: siteUrl(),
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}>
        <Providers>{children}</Providers>
        <GoatCounter />
      </body>
    </html>
  );
}
