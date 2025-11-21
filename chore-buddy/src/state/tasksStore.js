import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../firebaseConfig";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

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

      setChores: (chores) => {
        set({ chores });
        setTimeout(() => get().syncToFirestore(), 0);
      },

      addChore: (chore) => {
        set((s) => ({
          chores: {
            ...s.chores,
            [chore.id]: chore,
          },
        }));
        setTimeout(() => get().syncToFirestore(), 0);
      },

      upsertAssignments: (cycleStartISO, map) => {
        set((s) => ({
          assignments: { ...s.assignments, [cycleStartISO]: map },
        }));
        setTimeout(() => get().syncToFirestore(), 0);
      },

      setStatus: (pairKey, val) => {
        set((s) => ({ status: { ...s.status, [pairKey]: val } }));
        setTimeout(() => get().syncToFirestore(), 0);
      },

      addHistory: (memberId, entry) => {
        set((s) => {
          const list = s.history[memberId] || [];
          return { history: { ...s.history, [memberId]: [entry, ...list] } };
        });
        setTimeout(() => get().syncToFirestore(), 0);
      },

      // Sync to Firestore
      syncToFirestore: async () => {
        const state = get();
        const tasksRef = doc(db, "tasks", "default");
        try {
          // Convert chores with icon requires to strings for Firestore
          const serializedChores = {};
          Object.keys(state.chores).forEach((key) => {
            const chore = state.chores[key];
            serializedChores[key] = {
              ...chore,
              icon: null, // Icons can't be serialized, will restore from local
            };
          });

          await setDoc(
            tasksRef,
            {
              chores: serializedChores,
              assignments: state.assignments,
              status: state.status,
              history: state.history,
              updatedAt: Date.now(),
            },
            { merge: true }
          );
        } catch (error) {
          console.error("Error syncing tasks to Firestore:", error);
        }
      },

      // Listen to Firestore changes
      listenToFirestore: () => {
        const tasksRef = doc(db, "tasks", "default");
        return onSnapshot(
          tasksRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              const state = get();

              // Merge remote chores with local icons
              const mergedChores = {};
              Object.keys(data.chores || {}).forEach((key) => {
                mergedChores[key] = {
                  ...data.chores[key],
                  icon: state.chores[key]?.icon || null,
                };
              });

              set({
                chores:
                  Object.keys(mergedChores).length > 0
                    ? mergedChores
                    : state.chores,
                assignments: data.assignments || {},
                status: data.status || {},
                history: data.history || {},
              });
            }
          },
          (error) => {
            console.error("Error listening to Firestore:", error);
          }
        );
      },
    }),
    { name: "cb_tasks", storage: createJSONStorage(() => AsyncStorage) }
  )
);
