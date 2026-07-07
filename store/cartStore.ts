import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartState {
  cartId: string | null;
  checkoutUrl: string | null;
  totalQuantity: number;
  lines: any[];
  subtotal: string;
  isCartOpen: boolean;
  setCart: (cart: any) => void;
  openCart: () => void;
  closeCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      cartId: null,
      checkoutUrl: null,
      totalQuantity: 0,
      lines: [],
      subtotal: "0.00",
      isCartOpen: false,

      setCart: (cart) => set({
        cartId: cart.id,
        checkoutUrl: cart.checkoutUrl,
        totalQuantity: cart.totalQuantity,
        lines: Array.isArray(cart.lines) ? cart.lines : (cart.lines?.edges?.map((e: any) => e.node) || []),
        subtotal: cart.cost?.subtotalAmount?.amount || cart.subtotal || "0.00",
      }),
      
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
    }),
    {
      name: 'boutiique-vastraa-cart',
      partialize: (state) => ({ cartId: state.cartId, checkoutUrl: state.checkoutUrl }),
    }
  )
);
