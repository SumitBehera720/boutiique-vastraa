"use client";

import Link from "next/link";
import { Search, Heart, ShoppingBag, User } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SearchBar from "@/components/search/SearchBar";

export default function Header({ isLoggedIn = false }: { isLoggedIn?: boolean }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-[#FDFBF7] sticky top-0 z-40 border-b border-gray-200">
      <div className="container mx-auto px-4 md:px-8 py-4">
        <div className="flex items-center justify-between">
          
          {/* Left: Social Icons (Hidden on mobile) */}
          <div className="hidden md:flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1877F2] flex items-center justify-center text-white cursor-pointer hover:opacity-80 transition">f</div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center text-white cursor-pointer hover:opacity-80 transition">in</div>
            <div className="w-8 h-8 rounded-full bg-[#FF0000] flex items-center justify-center text-white cursor-pointer hover:opacity-80 transition">yt</div>
          </div>

          {/* Center: Logo */}
          <div className="flex-1 md:flex-none flex justify-center">
            <Link href="/" className="flex flex-col items-center">
              <div className="bg-primary text-secondary p-2 rounded w-16 h-16 flex items-center justify-center border border-secondary shadow-md">
                <span className="font-serif text-xs text-center leading-tight">Boutiique Vastraa</span>
              </div>
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <div className="hidden md:block">
              <SearchBar />
            </div>
            
            {/* Mobile Search - just an icon that opens full screen SearchBar too */}
            <div className="md:hidden">
              <SearchBar />
            </div>

            <Link href="/wishlist" className="text-gray-700 hover:text-primary transition relative hidden md:block">
              <Heart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {require("@/store/wishlistStore").useWishlistStore((state: any) => state.items.length)}
              </span>
            </Link>
            <button 
              onClick={() => {
                const { openCart } = require("@/store/cartStore").useCartStore.getState();
                openCart();
              }}
              className="text-gray-700 hover:text-primary transition relative"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {require("@/store/cartStore").useCartStore((state: any) => state.totalQuantity)}
              </span>
            </button>
            <Link 
              href={isLoggedIn ? "/account" : "/account/login"} 
              className="hidden md:flex items-center gap-2 bg-primary text-white px-4 py-2 rounded text-sm font-medium hover:bg-[#6A102A] transition"
            >
              <User className="w-4 h-4" />
              {isLoggedIn ? "Account" : "Login"}
            </Link>
          </div>
        </div>
      </div>

      {/* Primary Navigation */}
      <nav className="bg-[#EAE4D9] py-3 hidden md:block border-y border-gray-300">
        <ul className="flex items-center justify-center gap-10 font-sans text-sm font-medium text-gray-800 tracking-wide">
          <li className="hover:text-primary transition cursor-pointer relative group">
            Collections <span className="text-xs">▼</span>
          </li>
          <li className="hover:text-primary transition cursor-pointer relative group">
            Products <span className="text-xs">▼</span>
          </li>
          <li className="hover:text-primary transition cursor-pointer">
            <Link href="/collections/sarees">Sarees</Link>
          </li>
          <li className="hover:text-primary transition cursor-pointer">
            <Link href="/collections/lehenga">Lehenga</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
