"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

interface AnnouncementBarProps {
  settings?: {
    announcements?: string[];
  };
}

export default function AnnouncementBar({ settings }: AnnouncementBarProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/account/login";
  const isAdminPage = pathname.startsWith("/admin");
  const isCheckoutPage = pathname.startsWith("/checkout");

  const announcements = settings?.announcements && settings.announcements.length > 0 
    ? settings.announcements 
    : [
        "Easy Return & Exchange",
        "Free Shipping on All Orders | Cash on Delivery Available"
      ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (announcements.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % announcements.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [announcements.length]);

  if (isLoginPage || isAdminPage || isCheckoutPage) {
    return null;
  }

  return (
    <div className="bg-maroonClr text-white text-center text-[12px] font-medium overflow-hidden h-[34px] flex items-center justify-center relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="absolute w-full text-center px-4 leading-normal font-sans tracking-wide"
        >
          {announcements[currentIndex]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
