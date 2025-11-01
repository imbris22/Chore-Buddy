import {create} from "zustand";
import {persist, createJSONStorage} from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useCircleStore = create(
  persist(
    (set, get) => ({
      // Demo circle & members, first member is the logged-in user for now
      circleId: "circle_demo_1",
      members: [
        { id: "m_bear",   name: "Bear",   avatar: "🐻" },
        { id: "m_alex",   name: "Alex",   avatar: "🐼" },
        { id: "m_sam",    name: "Sam",    avatar: "🐰" },
        { id: "m_jordan", name: "Jordan", avatar: "🐱" },
      ],
      currentUserId: "m_bear",
      // running totals
      memberPoints: {},           // { memberId: number }
      tieCursor: 0,
      recurringNextIdx: {},       // { choreId: number }
      setTotals: (memberPoints) => set({ memberPoints }),
      setTieCursor: (tieCursor) => set({ tieCursor }),
      setRecurringNextIdx: (recurringNextIdx) => set({ recurringNextIdx }),
    }),
    { name: "cb_circle", storage: createJSONStorage(() => AsyncStorage) }
  )
);
