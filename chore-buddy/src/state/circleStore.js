import {create} from "zustand";
import {persist, createJSONStorage} from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
AsyncStorage.removeItem("cb_circle");


// Import PNGs
import bearAvatar   from "../../assets/bear.png";
import alexAvatar   from "../../assets/bunny.png";
import samAvatar    from "../../assets/panda.png";
import jordanAvatar from "../../assets/cat.png";

export const useCircleStore = create(
  persist(
    (set, get) => ({
      // Demo circle & members, first member is the logged-in user for now
      circleId: "circle_demo_1",
      members: [
        { id: "m_bear",   name: "Bear",   avatar: bearAvatar },
        { id: "m_alex",   name: "Alex",   avatar: alexAvatar },
        { id: "m_sam",    name: "Sam",    avatar: samAvatar },
        { id: "m_jordan", name: "Jordan", avatar: jordanAvatar },
      ],
      currentUserId: "m_alex",
      // running totals
      memberPoints: {},           // { memberId: number }
      tieCursor: 0,
      recurringNextIdx: {},       // { choreId: number }
      setTotals: (memberPoints) => set({ memberPoints }),
      setTieCursor: (tieCursor) => set({ tieCursor }),
      setRecurringNextIdx: (recurringNextIdx) => set({ recurringNextIdx }),
      setCurrentUser: (name, avatar) => {
        // Create a new member with the provided name and avatar
        const newMemberId = `m_${Date.now()}`;
        set((state) => {
          const updatedMembers = [
            { id: newMemberId, name, avatar },
            ...state.members,
          ];
          return {
            members: updatedMembers,
            currentUserId: newMemberId,
          };
        });
      },
    }),
    {
      name: "cb_circle",
      storage: createJSONStorage(() => AsyncStorage),
      // do not persist currentUserId (so changing default in code takes effect)
      partialize: (state) => {
        const { currentUserId, ...rest } = state;
        return rest;
      }
    }
  )
);
