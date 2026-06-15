"use client";

import { Heart } from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";

interface WishlistButtonProps {
  product: {
    id: string;
    handle: string;
    title: string;
    priceRange: { minVariantPrice: { amount: string } };
    images: { edges: { node: { url: string } }[] };
  };
  className?: string;
}

export default function WishlistButton({ product, className = "" }: WishlistButtonProps) {
  const { addItem, removeItem, isInWishlist } = useWishlistStore();
  const isWished = isInWishlist(product.id);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isWished) {
      removeItem(product.id);
    } else {
      addItem({
        id: product.id,
        handle: product.handle,
        title: product.title,
        price: product.priceRange.minVariantPrice.amount,
        image: product.images.edges[0]?.node?.url || null,
      });
    }
  };

  return (
    <button 
      onClick={toggleWishlist}
      className={`p-2 rounded-full transition-all duration-300 ${
        isWished 
          ? "bg-secondary text-white shadow-md" 
          : "bg-white/80 text-gray-500 hover:text-secondary hover:bg-white"
      } ${className}`}
      aria-label="Toggle Wishlist"
    >
      <Heart className={`w-5 h-5 ${isWished ? "fill-current" : ""}`} />
    </button>
  );
}
