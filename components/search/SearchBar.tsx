"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

export default function SearchBar() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Focus input when search bar opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
      setQuery("");
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="text-gray-700 hover:text-primary transition"
        aria-label="Open search"
      >
        <Search className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center pt-24 px-4 transition-all">
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-6 right-6 md:right-12 p-2 text-gray-500 hover:text-primary transition-colors"
          >
            <X className="w-8 h-8" />
          </button>

          <div className="w-full max-w-3xl">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-4">
              What are you looking for?
            </p>
            <form onSubmit={handleSubmit} className="relative flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, collections..."
                className="w-full text-2xl md:text-4xl font-serif text-gray-800 bg-transparent border-b-2 border-gray-300 py-4 focus:outline-none focus:border-primary transition-colors placeholder:text-gray-300"
              />
              <button 
                type="submit"
                className="absolute right-0 text-primary hover:text-[#6A102A] p-4 transition-colors"
              >
                <Search className="w-8 h-8 md:w-10 md:h-10" />
              </button>
            </form>

            {/* Quick Links Suggestions could go here */}
            <div className="mt-8 flex gap-4 text-sm text-gray-500 font-medium">
              <span>Popular:</span>
              <button onClick={() => { setQuery("Saree"); }} className="hover:text-primary underline">Sarees</button>
              <button onClick={() => { setQuery("Lehenga"); }} className="hover:text-primary underline">Lehengas</button>
              <button onClick={() => { setQuery("Jewellery"); }} className="hover:text-primary underline">Jewellery</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
