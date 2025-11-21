// state/groceryStore.js
import { create } from "zustand";
import { db } from "../firebaseConfig";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

export const useGroceryStore = create((set) => ({
  items: [{ id: "1", title: "Eggs", done: false }],

  addItem: (title) => {
    set((state) => {
      const t = title.trim();
      if (!t) return state;
      const item = {
        id: `g_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        title: t,
        done: false,
      };
      const newItems = [...state.items, item];

      // Sync to Firestore
      setTimeout(() => useGroceryStore.getState().syncToFirestore(), 0);

      return { items: newItems };
    });
  },

  toggleItem: (id) => {
    // mark it as done first (so UI shows checked state)
    set((state) => ({
      items: state.items.map((it) =>
        it.id === id ? { ...it, done: true } : it
      ),
    }));

    // wait before removing
    setTimeout(() => {
      set((state) => ({
        items: state.items.filter((it) => it.id !== id),
      }));
      // Sync to Firestore after removal
      setTimeout(() => useGroceryStore.getState().syncToFirestore(), 50);
    }, 300); // 300ms delay
  },

  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((it) => it.id !== id),
    }));
    setTimeout(() => useGroceryStore.getState().syncToFirestore(), 0);
  },

  // Sync to Firestore
  syncToFirestore: async () => {
    const state = useGroceryStore.getState();
    const groceryRef = doc(db, "grocery", "default");
    try {
      await setDoc(
        groceryRef,
        {
          items: state.items,
          updatedAt: Date.now(),
        },
        { merge: true }
      );
    } catch (error) {
      console.error("Error syncing grocery to Firestore:", error);
    }
  },

  // Listen to Firestore changes
  listenToFirestore: () => {
    const groceryRef = doc(db, "grocery", "default");
    return onSnapshot(
      groceryRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          set({
            items: data.items || [],
          });
        }
      },
      (error) => {
        console.error("Error listening to Firestore:", error);
      }
    );
  },
}));
