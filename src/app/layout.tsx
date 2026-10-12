import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#0A0A0C",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover"
};

export const metadata: Metadata = {
  title: "SideQuest // Spontaneous IRL Plans Across Indian Metros",
  description: "Drop a Flare for midnight chai, turf badminton, or lo-fi coworking. 90-minute self-destruct lobbies with zero-flake karma across Bengaluru, Mumbai, Delhi, Pune, Hyderabad, Chennai & Kolkata.",
  keywords: ["SideQuest", "spontaneous meetup", "Bengaluru", "Mumbai", "Delhi", "Pune", "Hyderabad", "Chennai", "Kolkata", "Gen Z social", "IRL community", "zero flake"],
  metadataBase: new URL("https://sidequest-omega.vercel.app"),
  openGraph: {
    title: "SideQuest // Spontaneous IRL Plans Across 7 Indian Metros",
    description: "Drop a Flare for midnight chai, turf badminton, or lo-fi coworking. 90-minute self-destruct lobbies. 100% free.",
    type: "website",
    siteName: "SideQuest",
    locale: "en_IN"
  },
  twitter: {
    card: "summary_large_image",
    title: "SideQuest // Spontaneous IRL Plans",
    description: "Drop a Flare for midnight chai, turf badminton, or lo-fi coworking. 90m window. Zero flakes."
  }
};

import AnalyticsProvider from "@/components/analytics/AnalyticsProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#0A0A0C] text-[#F4F4F6]">
        <AnalyticsProvider />
        {children}
      </body>
    </html>
  );
}
