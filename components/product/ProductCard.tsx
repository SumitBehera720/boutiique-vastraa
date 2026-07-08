"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import WishlistButton from "@/components/wishlist/WishlistButton";
import { useCartStore } from "@/store/cartStore";
import * as cartClient from "@/lib/api/cart-client";
import { getTokenFromCookie } from "@/lib/api/auth-client";

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
  variants?: {
    edges: { node: { id: string } }[];
  };
}

export default function ProductCard({ product }: { product: Product }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { cartId, setCart, openCart } = useCartStore();

  const price = parseFloat(product.priceRange.minVariantPrice.amount);
  const compareAtPrice = product.compareAtPriceRange?.minVariantPrice?.amount
    ? parseFloat(product.compareAtPriceRange.minVariantPrice.amount)
    : null;

  const hasDiscount = compareAtPrice && compareAtPrice > price;
  const discountPercentage = hasDiscount
    ? Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
    : 0;

  const image1 = product.images.edges[0]?.node?.url;
  const image2 = product.images.edges[1]?.node?.url || image1;

  const firstVariantId = product.variants?.edges?.[0]?.node?.id;

  const handleAddToCart = async () => {
    if (!firstVariantId || isAdding) return;
    if (!getTokenFromCookie()) {
      window.location.href = "/account/login";
      return;
    }
    setIsAdding(true);
    try {
      const cart = cartId
        ? await cartClient.addToCart(cartId, [{ merchandiseId: firstVariantId, quantity: 1 }])
        : await cartClient.createCart([{ merchandiseId: firstVariantId, quantity: 1 }]);
      setCart(cart);
      openCart();
    } catch (e) {
      console.error("Failed to add to cart:", e);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div
      className="group flex flex-col bg-white rounded-lg shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Discount Badge */}
      {hasDiscount && (
        <div className="absolute top-2 left-2 bg-goldClr text-white text-xs font-bold px-2 py-1 rounded z-10">
          -{discountPercentage}%
        </div>
      )}

      {/* Image Container with Crossfade */}
      <div className="relative w-full aspect-[3/4] overflow-hidden rounded-t-lg bg-gray-100">
        <Link href={`/products/${product.handle}`} className="block w-full h-full relative">
          {image1 && (
            <Image
              src={isHovered ? image2 : image1}
              alt={product.title}
              fill
              className="object-cover transition-opacity duration-500 ease-in-out"
              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
            />
          )}
        </Link>
        <div className="absolute top-2 right-2 z-10">
          <WishlistButton product={product as any} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex gap-1 text-goldClr mb-2 text-sm">
          ★★★★★ <span className="text-gray-400 text-xs ml-1">(0)</span>
        </div>

        <Link href={`/products/${product.handle}`}>
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 min-h-[40px] group-hover:text-maroonClr transition-colors">
            {product.title}
          </h3>
        </Link>

        <div className="mt-2 flex items-center gap-2">
          <span className="text-maroonClr font-bold text-lg">
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
          <button
            onClick={handleAddToCart}
            disabled={isAdding || !firstVariantId}
            className="flex-1 bg-transparent border border-maroonClr text-maroonClr hover:bg-maroonClr hover:text-white transition-colors py-2 text-xs font-bold uppercase rounded disabled:opacity-50"
          >
            {isAdding ? "Adding..." : "Add to Cart"}
          </button>
          <Link
            href={`/products/${product.handle}`}
            className="flex-1 bg-maroonClr border border-maroonClr text-white hover:bg-maroonClr/80 transition-colors py-2 text-xs font-bold uppercase rounded text-center"
          >
            Buy Now
          </Link>
        </div>
      </div>
    </div>
  );
}
