import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../firebaseConfig";
import { doc, setDoc, onSnapshot } from "firebase/firestore";

export const useTasksStore = create(
  persist(
    (set, get) => ({
      chores: {},
      // assignments[cycleStartISO] = { taskId: memberId }
      assignments: {},
      // status[pairKey] = "pending"|"done"  (pairKey = `${cycleStartISO}:${taskId}`)
      status: {},
      // history[memberId] = [{ ts, cycleKey, taskId, title, points }]
      history: {},

      // Clear all data when switching circles
      clearCircleData: () => {
        set({
          chores: {},
          assignments: {},
          status: {},
          history: {},
        });
      },

      setChores: (chores, circleId) => {
        set({ chores });
        setTimeout(() => get().syncToFirestore(circleId), 0);
      },

      addChore: (chore, circleId) => {
        set((s) => ({
          chores: {
            ...s.chores,
            [chore.id]: chore,
          },
        }));
        setTimeout(() => get().syncToFirestore(circleId), 0);
      },

      upsertAssignments: (cycleStartISO, map, circleId) => {
        set((s) => ({
          assignments: { ...s.assignments, [cycleStartISO]: map },
        }));
        setTimeout(() => get().syncToFirestore(circleId), 0);
      },

      setStatus: (pairKey, val, circleId) => {
        set((s) => ({ status: { ...s.status, [pairKey]: val } }));
        setTimeout(() => get().syncToFirestore(circleId), 0);
      },

      addHistory: (memberId, entry, circleId) => {
        set((s) => {
          const list = s.history[memberId] || [];
          return { history: { ...s.history, [memberId]: [entry, ...list] } };
        });
        setTimeout(() => get().syncToFirestore(circleId), 0);
      },

      // Sync to Firestore
      syncToFirestore: async (circleId) => {
        if (!circleId) return;
        const state = get();
        const tasksRef = doc(db, "tasks", circleId);
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
      listenToFirestore: (circleId) => {
        if (!circleId) return null;
        const tasksRef = doc(db, "tasks", circleId);
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
