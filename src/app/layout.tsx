import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nonce - 블록체인 커뮤니티",
  description: "블록체인/크립토 커뮤니티 논스를 위한 메신저 서비스",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Nonce",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geist.variable} ${jakarta.variable}`}>
      <body className="font-sans bg-obsidian text-steel-100 antialiased">
        {children}
      </body>
    </html>
  );
}
