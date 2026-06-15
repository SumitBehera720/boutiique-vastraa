"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { updateCartItemAction, removeCartItemAction } from "@/app/actions/cart";
import { useCartStore } from "@/store/cartStore";

export default function CartItem({ item }: { item: any }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const { cartId, setCart } = useCartStore();

  const handleUpdateQuantity = async (newQuantity: number) => {
    if (newQuantity < 1) return;
    setIsUpdating(true);
    const res = await updateCartItemAction(cartId!, item.id, newQuantity);
    if (res.success && res.cart) {
      setCart(res.cart);
    }
    setIsUpdating(false);
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    const res = await removeCartItemAction(cartId!, item.id);
    if (res.success && res.cart) {
      setCart(res.cart);
    }
    setIsUpdating(false);
  };

  const merchandise = item.merchandise;
  const product = merchandise.product;

  return (
    <div className={`flex gap-4 py-4 border-b border-gray-100 ${isUpdating ? 'opacity-50 pointer-events-none' : ''}`}>
      {/* Image */}
      <div className="relative w-20 h-24 bg-gray-50 rounded overflow-hidden flex-shrink-0 border border-gray-200">
        {merchandise.image && (
          <Image 
            src={merchandise.image.url} 
            alt={merchandise.image.altText || product.title} 
            fill 
            className="object-cover" 
          />
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col flex-1">
        <div className="flex justify-between items-start">
          <Link href={`/products/${product.handle}`}>
            <h4 className="text-sm font-semibold text-gray-800 line-clamp-2 hover:text-primary transition-colors">
              {product.title}
            </h4>
          </Link>
          <button 
            onClick={handleRemove}
            className="text-gray-400 hover:text-red-500 transition-colors p-1"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">
          {merchandise.title !== "Default Title" && merchandise.title}
        </div>

        <div className="mt-auto flex justify-between items-end">
          {/* Quantity Controls */}
          <div className="flex items-center border border-gray-300 rounded overflow-hidden w-24">
            <button 
              onClick={() => handleUpdateQuantity(item.quantity - 1)}
              disabled={item.quantity <= 1}
              className="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors disabled:opacity-50"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="flex-1 text-center text-sm font-medium">{item.quantity}</span>
            <button 
              onClick={() => handleUpdateQuantity(item.quantity + 1)}
              className="px-2 py-1 bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <div className="font-semibold text-primary">
            ₹{parseFloat(merchandise.price.amount).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
}
