"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function PageLoader() {
  const [visible, setVisible] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => setVisible(false), 1000);
    return () => clearTimeout(timer);
  }, [pathname]);

  if (!visible) return null;

  return (
    <div
      className="bg-maroonClr fixed inset-0 z-[9999] flex items-center justify-center text-white transition-opacity duration-500"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div className="flex flex-col items-center space-y-3">
        <Image
          alt="logo"
          width={500}
          height={500}
          className="loader-flip h-20 w-20 object-contain"
          src="/images/loader.png"
          priority
        />
      </div>
    </div>
  );
}
