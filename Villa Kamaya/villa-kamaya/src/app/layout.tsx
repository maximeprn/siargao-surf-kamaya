import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import Footer from "@/components/layout/Footer";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Villa Kamaya - Luxury Tropical Retreat in Siargao",
  description: "Experience luxury and tranquility at Villa Kamaya, your perfect tropical getaway in paradise. Modern amenities meet traditional charm in this stunning Siargao retreat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.variable} antialiased`}
      >
        <main>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
