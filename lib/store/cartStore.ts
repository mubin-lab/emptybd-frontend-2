import { create } from "zustand";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  sellerId: string;
  sellerEmail: string;
  stock: number;
}

interface CartState {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartState>((set, get) => {
  // Load initial cart state from localStorage if in client environment
  const getInitialItems = (): CartItem[] => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("emptybd_cart");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  };

  const saveToStorage = (items: CartItem[]) => {
    if (typeof window !== "undefined") {
      localStorage.setItem("emptybd_cart", JSON.stringify(items));
    }
  };

  return {
    items: getInitialItems(),

    addToCart: (newItem) => {
      const items = get().items;
      const existing = items.find((item) => item.productId === newItem.productId);
      let updatedItems: CartItem[];

      if (existing) {
        updatedItems = items.map((item) =>
          item.productId === newItem.productId
            ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) }
            : item
        );
      } else {
        updatedItems = [...items, { ...newItem, quantity: 1 }];
      }

      set({ items: updatedItems });
      saveToStorage(updatedItems);
    },

    removeFromCart: (productId) => {
      const updatedItems = get().items.filter((item) => item.productId !== productId);
      set({ items: updatedItems });
      saveToStorage(updatedItems);
    },

    updateQuantity: (productId, quantity) => {
      const items = get().items;
      const updatedItems = items.map((item) => {
        if (item.productId === productId) {
          const clampedQty = Math.max(1, Math.min(quantity, item.stock));
          return { ...item, quantity: clampedQty };
        }
        return item;
      });
      set({ items: updatedItems });
      saveToStorage(updatedItems);
    },

    clearCart: () => {
      set({ items: [] });
      saveToStorage([]);
    },

    getTotalItems: () => {
      return get().items.reduce((sum, item) => sum + item.quantity, 0);
    },

    getTotalPrice: () => {
      return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
  };
});
