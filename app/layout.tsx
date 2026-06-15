import type { Metadata } from "next";
import { Poppins, Rubik } from "next/font/google";
import "./globals.css";

import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";
import CartDrawer from "@/components/cart/CartDrawer";
import MobileBottomNav from "@/components/global/MobileBottomNav";
import PageLoader from "@/components/global/PageLoader";
import AnnouncementBar from "@/components/global/AnnouncementBar";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-rubik",
});

// Kalnia from Google Fonts — use next/font/google with display swap
import { Kalnia } from "next/font/google";
const kalnia = Kalnia({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-kalnia",
});

export const metadata: Metadata = {
  title: "Boutiique Vastraa",
  description: "Handcrafted sarees sourced from skilled artisans across India, including the rich brocades of Banarasi silks.",
  keywords: "sarees,banarasi,ethnic wear,boutique sarees,indian saree shop",
};

import { getCustomerToken } from "@/app/actions/auth";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const token = await getCustomerToken();
  const isLoggedIn = !!token;

  return (
    <html lang="en">
      <body className={`${poppins.variable} ${kalnia.variable} ${rubik.variable} font-poppins antialiased`}>
        <PageLoader />
        <div className="sticky top-0 z-50">
          <AnnouncementBar />
          <Header isLoggedIn={isLoggedIn} />
        </div>
        <CartDrawer />
        <main>
          {children}
        </main>
        <Footer />
        <MobileBottomNav />
      </body>
    </html>
  );
}
