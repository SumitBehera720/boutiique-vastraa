"use client";

import { useState } from "react";
import { addCartItemAction, createCheckoutDirectlyAction } from "@/app/actions/cart";
import { useCartStore } from "@/store/cartStore";
import { ShoppingBag, CreditCard } from "lucide-react";

export default function ProductActions({ 
  variantId, 
  quantity, 
  availableForSale 
}: { 
  variantId: string; 
  quantity: number; 
  availableForSale: boolean;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const { cartId, setCart, openCart } = useCartStore();

  const handleAddToCart = async () => {
    if (!availableForSale) return;
    setIsAdding(true);
    
    try {
      const res = await addCartItemAction(cartId, variantId, quantity);
      if (res.success && res.cart) {
        setCart(res.cart);
        openCart(); // Slide out the drawer
      } else {
        alert(res.error || "Failed to add to cart");
      }
    } catch (e) {
      alert("Error adding to cart");
    } finally {
      setIsAdding(false);
    }
  };

  const handleBuyNow = async () => {
    if (!availableForSale) return;
    setIsBuying(true);
    
    try {
      const res = await createCheckoutDirectlyAction(variantId, quantity);
      if (res.success && res.checkoutUrl) {
        window.location.href = res.checkoutUrl;
      } else {
        alert(res.error || "Failed to initiate checkout");
      }
    } catch (e) {
      alert("Error initiating checkout");
    } finally {
      setIsBuying(false);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      <button 
        onClick={handleAddToCart}
        disabled={!availableForSale || isAdding || isBuying}
        className="flex-1 flex items-center justify-center gap-2 bg-transparent border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors py-3 md:py-4 font-bold uppercase tracking-widest text-sm rounded disabled:opacity-50"
      >
        <ShoppingBag className="w-5 h-5" />
        {isAdding ? "Adding..." : "Add to Cart"}
      </button>
      
      <button 
        onClick={handleBuyNow}
        disabled={!availableForSale || isAdding || isBuying}
        className="flex-1 flex items-center justify-center gap-2 bg-primary border-2 border-primary text-white hover:bg-[#6A102A] transition-colors py-3 md:py-4 font-bold uppercase tracking-widest text-sm rounded disabled:opacity-50 shadow-md hover:shadow-lg"
      >
        <CreditCard className="w-5 h-5" />
        {isBuying ? "Processing..." : "Buy it Now"}
      </button>
    </div>
  );
}
