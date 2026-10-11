import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SideQuest // Spontaneous IRL Plans Across Indian Metros",
  description: "Drop a Flare for midnight chai, badminton, or vibe-coding. 90-minute self-destruct lobbies with anti-flake karma.",
  keywords: ["SideQuest", "spontaneous meetup", "Bengaluru", "Mumbai", "Delhi", "Pune", "Hyderabad", "Gen Z social"],
  openGraph: {
    title: "SideQuest // Spontaneous IRL Plans",
    description: "Drop a Flare for chai, sports, or coworking. 90m window. 100% free.",
    type: "website"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#0A0A0C] text-[#F4F4F6]">
        {children}
      </body>
    </html>
  );
}
