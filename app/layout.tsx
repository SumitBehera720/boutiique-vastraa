import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

import AnnouncementBar from "@/components/global/AnnouncementBar";
import Header from "@/components/global/Header";
import Footer from "@/components/global/Footer";
import CartDrawer from "@/components/cart/CartDrawer";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "Boutiique Vastraa | Premium Women's Ethnic Wear",
  description: "Shop our exclusive range of luxury sarees, designer kurtis, and jewellery.",
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
      <body className={`${inter.variable} ${playfair.variable} antialiased min-h-screen flex flex-col`}>
        <AnnouncementBar />
        <Header isLoggedIn={isLoggedIn} />
        <CartDrawer />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
