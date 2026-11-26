import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-landing-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-landing-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ImReady — A working demo of your problem in 2–3 weeks",
  description:
    "Up to three student teams each ship a working demo of one problem in 2–3 weeks. For founders.",
  robots: { index: true, follow: true },
  openGraph: {
    siteName: "ImReady",
    locale: "en_IN",
    type: "website",
    title: "ImReady — A working demo of your problem in 2–3 weeks",
    description:
      "Up to three student teams each ship a working demo of one problem in 2–3 weeks.",
  },
};

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className={`${outfit.variable} ${inter.variable} font-[family-name:var(--font-landing-sans)] antialiased`}
    >
      {children}
    </div>
  );
}
