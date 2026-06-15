"use client";

import Link from "next/link";
import { Layers, User } from "lucide-react";

export default function MobileBottomNav() {
  return (
    <div className="bg-maroonClr fixed right-0 bottom-0 left-0 z-50 text-white shadow-[0_-1px_2px_rgba(0,0,0,0.1)] duration-200 sm:hidden">
      <div className="grid w-full grid-cols-4 p-2">
        <Link href="/collections" className="flex flex-col items-center justify-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="m-auto text-white">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <span className="font-kalnia text-[10px] font-medium">Collections</span>
        </Link>
        <Link href="/products" className="flex flex-col items-center justify-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="m-auto text-white">
            <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            <line x1="7" y1="7" x2="7.01" y2="7" />
          </svg>
          <span className="font-kalnia text-[10px] font-medium">Products</span>
        </Link>
        <Link href="/account" className="flex flex-col items-center justify-center gap-1">
          <Layers className="m-auto h-6 w-6 text-white" aria-hidden="true" />
          <span className="font-kalnia text-[10px] font-medium">Orders</span>
        </Link>
        <Link href="/account" className="flex flex-col items-center justify-center gap-1">
          <User className="m-auto h-6 w-6 text-white" aria-hidden="true" />
          <span className="font-kalnia text-[10px] font-medium">Profile</span>
        </Link>
      </div>
    </div>
  );
}
