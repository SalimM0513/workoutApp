import type { Metadata, Viewport } from "next";
import { AppDataProvider } from "@/hooks/useAppData";
import { BottomNav } from "@/components/BottomNav";
import "./globals.css";

export const metadata: Metadata = {
  title: "RepLog — Workout Tracker",
  description: "Fast, mobile-first workout logging",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "RepLog",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0f0f12",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AppDataProvider>
          <main className="mx-auto min-h-dvh max-w-lg pb-24">{children}</main>
          <BottomNav />
        </AppDataProvider>
      </body>
    </html>
  );
}
