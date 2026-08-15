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

import { SettingsProvider } from "@/components/providers/SettingsProvider";
import { GoogleOAuthProvider } from "@react-oauth/google";

export const metadata: Metadata = {
  title: "NetPulse AI - Network Intelligence Platform",
  description: "AI-Powered Network Intelligence & Operations Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "votre-google-client-id-ici.apps.googleusercontent.com";

  return (
    <html lang="en" className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased noise-overlay`}>
        <GoogleOAuthProvider clientId={clientId}>
          <SettingsProvider>
            {children}
          </SettingsProvider>
        </GoogleOAuthProvider>
      </body>
    </html>
  );
}
