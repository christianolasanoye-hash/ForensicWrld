import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Analytics from "@/components/Analytics";

const jamday = localFont({
  src: "../public/fonts/JamdaypersonaluseRegular-jEMql.otf",
  variable: "--font-jamday",
  display: "swap",
});

const polarVortex = localFont({
  src: "../public/fonts/PolarVortex-raAA.ttf",
  variable: "--font-polar",
  display: "swap",
});

const giants = localFont({
  src: "../public/fonts/GiantsItalicPersonalUseBoldItalic-x3q6m.ttf",
  variable: "--font-giants",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Forensic Wrld",
  description: "Creative agency for film, photography, and growth. Minimal, premium, and built for momentum.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${jamday.variable} ${polarVortex.variable} ${giants.variable} font-sans antialiased min-h-screen bg-black text-white`}
      >
        <Analytics />
        <Nav />
        <main className="">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
