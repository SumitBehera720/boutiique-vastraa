"use client";

import { Gift, Star } from "lucide-react";

export default function MarqueeBanner() {
  return (
    <div className="bg-maroonClr text-white overflow-hidden py-2 border-t border-b border-goldClr/20">
      <div className="whitespace-nowrap flex items-center animate-[marquee_20s_linear_infinite] hover:[animation-play-state:paused]">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4 mx-4 shrink-0 font-medium text-xs sm:text-sm tracking-wide">
            <span>UP TO 49% PRIVILEGE SAVINGS</span>
            <span className="opacity-50">|</span>
            <span className="flex items-center gap-1"><Gift className="w-4 h-4 text-goldClr" /> COMPLIMENTARY GIFT ON PURCHASE OF ANY 2 STYLES ₹1,500+</span>
            <span className="opacity-50">|</span>
            <span className="flex items-center gap-1"><Star className="w-4 h-4 text-goldClr" fill="currentColor" /> LOVED BY 10,000+ ESTEEMED CUSTOMERS</span>
            <span className="opacity-50">|</span>
          </div>
        ))}
      </div>
    </div>
  );
}
