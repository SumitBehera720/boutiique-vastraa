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

import { jsonDb } from "@/lib/db/jsonDb";

export async function generateMetadata(): Promise<Metadata> {
  const settings = jsonDb.getSettings();
  return {
    title: {
      template: settings.seo.titleTemplate || "%s | Boutiique Vastraa",
      default: "Boutiique Vastraa",
    },
    description: settings.seo.defaultDescription,
    keywords: settings.seo.keywords,
  };
}

import { headers } from "next/headers";
import { getCustomerToken } from "@/app/actions/auth";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const token = await getCustomerToken();
  const isLoggedIn = !!token;

  const settings = jsonDb.getSettings();
  const footerSettings = settings.footer || {};

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";

  // Hide storefront layout elements for login, admin, and checkout screens
  const isLoginPage = pathname === "/account/login";
  const isAdminPage = pathname.startsWith("/admin");
  const isCheckoutPage = pathname.startsWith("/checkout");
  const showHeaderFooter = !isLoginPage && !isAdminPage && !isCheckoutPage;

  return (
    <html lang="en">
      <body className={`${poppins.variable} ${kalnia.variable} ${rubik.variable} font-poppins antialiased`}>
        <PageLoader />
        {showHeaderFooter && (
          <div className="sticky top-0 z-50">
            <AnnouncementBar />
            <Header isLoggedIn={isLoggedIn} />
          </div>
        )}
        <CartDrawer />
        <main>
          {children}
        </main>
        {showHeaderFooter && (
          <>
            <Footer settings={footerSettings} />
            <MobileBottomNav />
          </>
        )}
      </body>
    </html>
  );
}
