// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: {
    default: "Motor Spares Near Me South Africa | Used & New Auto Parts",
    template: "%s | Motor Spares SA",
  },
  description:
    "Find trusted motor spares suppliers in South Africa including Toyota, BMW, VW, Ford and truck spares. Search by city, category or brand.",
  keywords: [
    "motor spares",
    "auto parts south africa",
    "used car parts",
    "motor spares near me",
  ],
  openGraph: {
    type: "website",
    locale: "en_ZA",
    url: "https://motorsparesnearme.co.za",
    siteName: "Motor Spares SA",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-ZA">
      <body>
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}