"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  const isLoginPage = pathname === "/account/login";
  const isAdminPage = pathname.startsWith("/admin");
  const isCheckoutPage = pathname.startsWith("/checkout");

  if (isLoginPage || isAdminPage || isCheckoutPage) {
    return null;
  }
  return (
    <footer className="bg-maroonClr text-white pt-12 pb-20 sm:pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div>
            <Image
              src="/images/logo.png"
              alt="Boutiique Vastraa"
              width={120}
              height={60}
              className="mb-4 rounded-lg bg-white/10 p-2 object-contain"
            />
            <p className="text-sm text-gray-300 leading-relaxed max-w-xs">
              Timeless Elegance, Handcrafted for Every Occasion. Shop our exclusive range of luxury sarees, designer kurtis, and jewellery.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-kalnia text-xl font-medium mb-6 text-goldClr">Quick Links</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition">Contact Us</Link></li>
              <li><Link href="/#faq" className="hover:text-white transition">FAQ</Link></li>
              <li><Link href="/track-order" className="hover:text-white transition">Track Order</Link></li>
            </ul>
          </div>

          {/* Policies */}
          <div>
            <h3 className="font-kalnia text-xl font-medium mb-6 text-goldClr">Policies</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              <li><Link href="/privacy-policy" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition">Terms of Service</Link></li>
              <li><Link href="/shipping-policy" className="hover:text-white transition">Shipping Policy</Link></li>
              <li><Link href="/refund-policy" className="hover:text-white transition">Refund Policy</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-kalnia text-xl font-medium mb-6 text-goldClr">Newsletter</h3>
            <p className="text-sm text-gray-300 mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Enter your email" 
                className="bg-transparent border border-gray-400 text-white px-4 py-2 w-full rounded focus:outline-none focus:border-goldClr transition text-sm"
              />
              <button className="bg-goldClr text-maroonClr px-4 py-2 rounded font-medium hover:bg-white transition text-sm whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>

        </div>

        <div className="mt-12 pt-6 border-t border-white/20 text-center text-sm text-gray-400 flex flex-col items-center justify-center gap-2">
          <p>© {new Date().getFullYear()} Boutiique Vastraa. All rights reserved.</p>
          <p>
            Developed by{" "}
            <a 
              href="https://qubnixtechnology.com/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-goldClr hover:text-white transition"
            >
              Qubnix
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
