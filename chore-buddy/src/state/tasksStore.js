import {create} from "zustand";
import {persist, createJSONStorage} from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const useTasksStore = create(
  persist(
    (set, get) => ({
      chores: {
        // sample chores (mix of recurring and one-off)
        "ch_trash":   { id:"ch_trash",   title:"Trash",           points:2, recurring:true  },
        "ch_dishes":  { id:"ch_dishes",  title:"Dishes",          points:3, recurring:false },
        "ch_replace": { id:"ch_replace", title:"Replace light",   points:4, recurring:false },
      },
      // assignments[cycleStartISO] = { taskId: memberId }
      assignments: {},
      // status[pairKey] = "pending"|"done"  (pairKey = `${cycleStartISO}:${taskId}`)
      status: {},
      setChores: (chores) => set({ chores }),
      upsertAssignments: (cycleStartISO, map) =>
        set((s) => ({ assignments: { ...s.assignments, [cycleStartISO]: map }})),
      setStatus: (pairKey, val) =>
        set((s) => ({ status: { ...s.status, [pairKey]: val }})),
    }),
    { name: "cb_tasks", storage: createJSONStorage(() => AsyncStorage) }
  )
);
