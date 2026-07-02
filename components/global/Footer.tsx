"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Phone, Mail } from "lucide-react";

interface FooterProps {
  settings?: {
    logoUrl?: string;
    description?: string;
    contactEmail?: string;
    contactPhone?: string;
    copyright?: string;
    facebookUrl?: string;
    instagramUrl?: string;
    pinterestUrl?: string;
    links?: { label: string; url: string }[];
  };
}

export default function Footer({ settings }: FooterProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/account/login";
  const isAdminPage = pathname.startsWith("/admin");
  const isCheckoutPage = pathname.startsWith("/checkout");

  if (isLoginPage || isAdminPage || isCheckoutPage) {
    return null;
  }

  const logoUrl = settings?.logoUrl || "/images/logo.png";
  const description = settings?.description || "Timeless Elegance, Handcrafted for Every Occasion. Shop our exclusive range of luxury sarees, designer kurtis, and jewellery.";
  const copyright = settings?.copyright || `© ${new Date().getFullYear()} Boutiique Vastraa. All rights reserved.`;
  const contactEmail = settings?.contactEmail || "info@boutiquevastra.com";
  const contactPhone = settings?.contactPhone || "+91 99999 99999";
  const facebookUrl = settings?.facebookUrl;
  const instagramUrl = settings?.instagramUrl;
  const pinterestUrl = settings?.pinterestUrl;
  
  const quickLinks = settings?.links || [
    { label: "About Us", url: "/about" },
    { label: "Contact Us", url: "/contact" },
    { label: "FAQ", url: "/#faq" },
    { label: "Track Order", url: "/track-order" }
  ];

  return (
    <footer className="bg-maroonClr text-white pt-12 pb-20 sm:pb-8">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand */}
          <div className="space-y-4">
            <div className="relative w-32 h-14 bg-white/10 rounded-lg p-2 flex items-center justify-center">
              <Image
                src={logoUrl}
                alt="Boutiique Vastraa"
                fill
                className="object-contain p-1"
              />
            </div>
            <p className="text-sm text-gray-300 leading-relaxed max-w-xs">
              {description}
            </p>
            {/* Social Links */}
            <div className="flex gap-3 pt-2">
              {facebookUrl && (
                <a href={facebookUrl} target="_blank" rel="noopener noreferrer" className="text-goldClr hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                </a>
              )}
              {instagramUrl && (
                <a href={instagramUrl} target="_blank" rel="noopener noreferrer" className="text-goldClr hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                </a>
              )}
              {pinterestUrl && (
                <a href={pinterestUrl} target="_blank" rel="noopener noreferrer" className="text-goldClr hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-kalnia text-xl font-medium mb-6 text-goldClr">Quick Links</h3>
            <ul className="space-y-3 text-sm text-gray-300">
              {quickLinks.map((link, idx) => (
                <li key={idx}>
                  <Link href={link.url} className="hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact details */}
          <div>
            <h3 className="font-kalnia text-xl font-medium mb-6 text-goldClr">Contact Us</h3>
            <ul className="space-y-4 text-sm text-gray-300">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-goldClr shrink-0" />
                <a href={`mailto:${contactEmail}`} className="hover:text-white transition-colors truncate">
                  {contactEmail}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-goldClr shrink-0" />
                <a href={`tel:${contactPhone}`} className="hover:text-white transition-colors">
                  {contactPhone}
                </a>
              </li>
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
          <p>{copyright}</p>
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
