import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Header } from "@/components/Header";
import { MainShell } from "@/components/MainShell";
import { AskExpertWidget } from "@/components/AskExpertWidget";

const poppins = localFont({
  src: [
    { path: "../../public/fonts/poppins-400.ttf", weight: "400", style: "normal" },
    { path: "../../public/fonts/poppins-500.ttf", weight: "500", style: "normal" },
    { path: "../../public/fonts/poppins-600.ttf", weight: "600", style: "normal" },
    { path: "../../public/fonts/poppins-700.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-poppins",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "Wild Excursions — Jungle Safari Planner",
  description:
    "Explore a frontend demo for planning a jungle safari with sample destinations, availability, and prices.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <Header />
        <MainShell>{children}</MainShell>
        <footer className="hidden border-t border-border bg-surface px-4 py-7 text-center text-xs text-muted sm:block">
          Wild Excursions · Frontend demo — sample availability and prices; no enquiry is submitted.
        </footer>
        <AskExpertWidget />
      </body>
    </html>
  );
}
