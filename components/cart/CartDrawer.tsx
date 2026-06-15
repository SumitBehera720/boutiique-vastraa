"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, ArrowRight } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import CartItem from "./CartItem";

export default function CartDrawer() {
  const { isCartOpen, closeCart, lines, subtotal, checkoutUrl } = useCartStore();

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-xl font-serif font-bold text-gray-800 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                Your Cart
              </h2>
              <button 
                onClick={closeCart}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col">
              {lines.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 gap-4">
                  <ShoppingBag className="w-16 h-16 opacity-20" />
                  <p className="text-lg">Your cart is empty</p>
                  <button 
                    onClick={closeCart}
                    className="mt-4 border border-primary text-primary px-6 py-2 uppercase tracking-widest text-sm font-bold hover:bg-primary hover:text-white transition-colors"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="flex flex-col">
                  {lines.map((item: any) => (
                    <CartItem key={item.id} item={item} />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {lines.length > 0 && (
              <div className="border-t border-gray-200 p-6 bg-gray-50">
                <div className="flex justify-between items-center mb-4 text-gray-800">
                  <span className="font-semibold uppercase tracking-wider text-sm">Subtotal</span>
                  <span className="font-bold text-xl text-primary">₹{parseFloat(subtotal).toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500 mb-6 text-center">
                  Shipping, taxes, and discount codes calculated at checkout.
                </p>
                <a 
                  href={checkoutUrl || "#"}
                  className="w-full bg-primary text-white py-4 rounded font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-[#6A102A] transition-colors"
                >
                  Checkout <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
