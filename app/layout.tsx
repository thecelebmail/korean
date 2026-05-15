// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  metadataBase: new URL('https://koreanmotorsparesnearme.co.za'),

  title: {
    default: 'Korean Motor Spares South Africa',
    template: '%s | Korean Motor Spares',
  },

  description:
    'Find Korean motor spares suppliers across South Africa including Hyundai, Kia, Daewoo and SsangYong spares.',

  keywords: [
    'korean motor spares',
    'korean motor spares near me',
    'hyundai spares',
    'kia spares',
    'bumper to bumper',
    'auto spares south africa',
  ],

  alternates: {
    canonical: '/',
  },

  openGraph: {
    title: 'Korean Motor Spares',
    description:
      'Find trusted Korean motor spares suppliers near you.',
    url: 'https://koreanmotorsparesnearme.co.za',
    siteName: 'Korean Motor Spares',
    type: 'website',
  },

  robots: {
    index: true,
    follow: true,
  },
}

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