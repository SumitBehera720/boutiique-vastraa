"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import WishlistButton from "@/components/wishlist/WishlistButton";

interface Product {
  id: string;
  title: string;
  handle: string;
  availableForSale: boolean;
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
  compareAtPriceRange?: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
  images: {
    edges: { node: { url: string; altText: string } }[];
  };
}

export default function ProductCard({ product }: { product: Product }) {
  const [isHovered, setIsHovered] = useState(false);

  const price = parseFloat(product.priceRange.minVariantPrice.amount);
  const compareAtPrice = product.compareAtPriceRange?.minVariantPrice?.amount
    ? parseFloat(product.compareAtPriceRange.minVariantPrice.amount)
    : null;

  const hasDiscount = compareAtPrice && compareAtPrice > price;
  const discountPercentage = hasDiscount 
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100) 
    : 0;

  const image1 = product.images.edges[0]?.node?.url;
  const image2 = product.images.edges[1]?.node?.url || image1; // Fallback to image 1

  return (
    <div 
      className="group flex flex-col bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Discount Badge */}
      {hasDiscount && (
        <div className="absolute top-2 left-2 bg-secondary text-white text-xs font-bold px-2 py-1 rounded z-10">
          -{discountPercentage}%
        </div>
      )}

      {/* Image Container with Crossfade */}
      <div className="relative w-full aspect-[3/4] overflow-hidden rounded-t-lg bg-gray-100">
        <Link href={`/products/${product.handle}`} className="block w-full h-full">
          {image1 && (
            <Image
              src={isHovered ? image2 : image1}
              alt={product.title}
              fill
              className="object-cover transition-opacity duration-500 ease-in-out"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          )}
        </Link>
        <div className="absolute top-2 right-2 z-10">
          <WishlistButton product={product as any} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex gap-1 text-secondary mb-2 text-sm">
          ★★★★★ <span className="text-gray-400 text-xs ml-1">(0)</span>
        </div>
        
        <Link href={`/products/${product.handle}`}>
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 min-h-[40px] group-hover:text-primary transition-colors">
            {product.title}
          </h3>
        </Link>

        <div className="mt-2 flex items-center gap-2">
          <span className="text-primary font-bold text-lg">
            ₹{price.toFixed(2)}
          </span>
          {hasDiscount && (
            <span className="text-gray-400 line-through text-sm">
              ₹{compareAtPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-2 w-full">
          <button className="flex-1 bg-transparent border border-primary text-primary hover:bg-primary hover:text-white transition-colors py-2 text-xs font-bold uppercase rounded">
            Add to Cart
          </button>
          <button className="flex-1 bg-primary border border-primary text-white hover:bg-[#6A102A] transition-colors py-2 text-xs font-bold uppercase rounded">
            Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}
