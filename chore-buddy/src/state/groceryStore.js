// state/groceryStore.js
import { create } from "zustand";

export const useGroceryStore = create((set) => ({
  items: [
    { id: "1", title: "Eggs", done: false },
  ],

  addItem: (title) =>
    set((state) => {
      const t = title.trim();
      if (!t) return state;
      const item = {
        id: `g_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        title: t,
        done: false,
      };
      return { items: [...state.items, item] };
    }),

    toggleItem: (id) =>
    set((state) => ({
        // once tapped, the item is removed from the list
        items: state.items.filter((it) => it.id !== id),
    })),


  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((it) => it.id !== id),
    })),
}));
