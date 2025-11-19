import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
AsyncStorage.removeItem("cb_circle");

// Import PNGs
import bearAvatar from "../../assets/bear.png";
import alexAvatar from "../../assets/bunny.png";
import samAvatar from "../../assets/panda.png";
import jordanAvatar from "../../assets/cat.png";

import { assignTasks } from "../lib/allocator";
import { useTasksStore } from "./tasksStore";

export const useCircleStore = create(
  persist(
    (set, get) => ({
      // Demo circle & members, first member is the logged-in user for now
      circleId: "circle_demo_1",
      members: [
        { id: "m_bear", name: "Bear", avatar: bearAvatar },
        { id: "m_alex", name: "Alex", avatar: alexAvatar },
        { id: "m_sam", name: "Sam", avatar: samAvatar },
        { id: "m_jordan", name: "Jordan", avatar: jordanAvatar },
      ],
      currentUserId: "m_alex",
      // running totals
      memberPoints: {}, // { memberId: number }
      tieCursor: 0,
      recurringNextIdx: {}, // { choreId: number }
      setTotals: (memberPoints) => set({ memberPoints }),
      setTieCursor: (tieCursor) => set({ tieCursor }),
      setRecurringNextIdx: (recurringNextIdx) => set({ recurringNextIdx }),
      setCurrentUser: (name, avatar) => {
        const newMemberId = `m_${Date.now()}`;
        set((state) => {
          const updatedMembers = [
            { id: newMemberId, name, avatar },
            ...state.members,
          ];

          const { chores, upsertAssignments } = useTasksStore.getState();
          const taskList = Object.values(chores);

          const { assignments, state: newState } = assignTasks(
            updatedMembers,
            taskList,
            {
              memberPoints: state.memberPoints,
              tieCursor: state.tieCursor,
              recurringNextIdx: state.recurringNextIdx,
            }
          );

          const cycleKey = new Date().toISOString().split("T")[0]; // Use current date as cycle key
          upsertAssignments(cycleKey, assignments);

          return {
            members: updatedMembers,
            currentUserId: newMemberId,
            memberPoints: newState.memberPoints,
            tieCursor: newState.tieCursor,
            recurringNextIdx: newState.recurringNextIdx,
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
      },
    }
  )
);
