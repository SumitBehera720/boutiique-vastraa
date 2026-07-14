"use client";

import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cartStore";
import * as cartClient from "@/lib/api/cart-client";

export default function CartInitializer() {
  const { cartId, setCart } = useCartStore();
  const [syncedCartId, setSyncedCartId] = useState<string | null>(null);

  useEffect(() => {
    if (!cartId) {
      setSyncedCartId(null);
      return;
    }

    // Only sync if we haven't synced this specific cartId in the current session
    if (cartId === syncedCartId) return;

    async function syncCart() {
      try {
        const cart = await cartClient.getCart(cartId!);
        if (cart) {
          setCart(cart);
          setSyncedCartId(cartId);
        }
      } catch (err) {
        console.error("[CartInitializer] Failed to sync cart with server:", err);
        // If cart is not found on server (e.g. deleted or expired), clear local store cartId
        if (err instanceof Error && err.message.includes("404")) {
          setCart({
            id: null,
            checkoutUrl: null,
            totalQuantity: 0,
            lines: [],
            subtotal: "0.00",
          });
        }
      }
    }

    syncCart();
  }, [cartId, syncedCartId, setCart]);

  return null;
}
