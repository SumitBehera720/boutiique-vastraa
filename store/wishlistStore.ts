import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItem {
  id: string;
  handle: string;
  title: string;
  price: string;
  image: string | null;
}

interface WishlistState {
  items: WishlistItem[];
  addItem: (item: WishlistItem) => void;
  removeItem: (id: string) => void;
  isInWishlist: (id: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => ({ 
        items: state.items.find((i) => i.id === item.id) 
          ? state.items 
          : [...state.items, item] 
      })),
      removeItem: (id) => set((state) => ({ 
        items: state.items.filter((i) => i.id !== id) 
      })),
      isInWishlist: (id) => get().items.some((i) => i.id === id),
    }),
    {
      name: 'boutiique-vastraa-wishlist',
    }
  )
);
