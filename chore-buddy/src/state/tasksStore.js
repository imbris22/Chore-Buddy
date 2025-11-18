import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useTasksStore = create(
  persist(
    (set, get) => ({
      chores: {
        ch_trash: {
          id: "ch_trash",
          title: "Trash",
          points: 2,
          recurring: true,
          frequency: "weekly",
          icon: require("../../assets/chore-icons/trash-2.png"),
        },
        ch_dishes: {
          id: "ch_dishes",
          title: "Dishes",
          points: 3,
          recurring: false,
          frequency: "daily",
          icon: require("../../assets/chore-icons/utensils.png"),
        },
        ch_replace: {
          id: "ch_replace",
          title: "Replace light",
          points: 2,
          recurring: false,
          frequency: "monthly",
          icon: require("../../assets/chore-icons/brush-cleaning.png"),
        },
        ch_buy_eggs: {
          id: "ch_buy_eggs",
          title: "Buy eggs",
          points: 3,
          recurring: true,
          frequency: "weekly",
          icon: require("../../assets/chore-icons/shopping-basket.png"),
        },
        ch_vacuum: {
          id: "ch_vacuum",
          title: "Vacuum",
          points: 2,
          recurring: false,
          frequency: "weekly",
          icon: require("../../assets/chore-icons/brush-cleaning.png"),
        },
        ch_laundry: {
          id: "ch_laundry",
          title: "Laundry",
          points: 3,
          recurring: false,
          frequency: "weekly",
          icon: require("../../assets/chore-icons/brush-cleaning.png"),
        },
        ch_sweep: {
          id: "ch_sweep",
          title: "Sweep",
          points: 2,
          recurring: false,
          frequency: "weekly",
          icon: require("../../assets/chore-icons/brush-cleaning.png"),
        },
        ch_fold_clothes: {
          id: "ch_fold_clothes",
          title: "Fold clothes",
          points: 3,
          recurring: false,
          frequency: "weekly",
          icon: require("../../assets/chore-icons/brush-cleaning.png"),
        },
      },
      // assignments[cycleStartISO] = { taskId: memberId }
      assignments: {},
      // status[pairKey] = "pending"|"done"  (pairKey = `${cycleStartISO}:${taskId}`)
      status: {},
      // history[memberId] = [{ ts, cycleKey, taskId, title, points }]
      history: {},

      setChores: (chores) => set({ chores }),

      addChore: (chore) =>
        set((s) => ({
          chores: {
            ...s.chores,
            [chore.id]: chore,
          },
        })),

      upsertAssignments: (cycleStartISO, map) =>
        set((s) => ({ assignments: { ...s.assignments, [cycleStartISO]: map } })),

      setStatus: (pairKey, val) =>
        set((s) => ({ status: { ...s.status, [pairKey]: val } })),

      addHistory: (memberId, entry) =>
        set((s) => {
          const list = s.history[memberId] || [];
          return { history: { ...s.history, [memberId]: [entry, ...list] } };
        }),
    }),
    { name: "cb_tasks", storage: createJSONStorage(() => AsyncStorage) }
  )
);
