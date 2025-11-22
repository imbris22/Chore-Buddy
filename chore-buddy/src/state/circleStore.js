import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "../firebaseConfig";
import { doc, setDoc, onSnapshot, getDoc } from "firebase/firestore";

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
      // Circle data
      circleId: null,
      circleName: null,
      members: [],
      currentUserId: null,
      // running totals
      memberPoints: {}, // { memberId: number }
      tieCursor: 0,
      recurringNextIdx: {}, // { choreId: number }
      setTotals: (memberPoints) => {
        set({ memberPoints });
        setTimeout(() => get().syncToFirestore(), 0);
      },
      setTieCursor: (tieCursor) => {
        set({ tieCursor });
        setTimeout(() => get().syncToFirestore(), 0);
      },
      setRecurringNextIdx: (recurringNextIdx) => {
        set({ recurringNextIdx });
        setTimeout(() => get().syncToFirestore(), 0);
      },

      // Join or create circle
      setCircle: async (circleName, isNewCircle = false) => {
        const circleId = `circle_${circleName
          .toLowerCase()
          .replace(/\s+/g, "_")}`;

        // Clear tasks data when switching circles
        useTasksStore.getState().clearCircleData();

        set({
          circleId,
          circleName,
          members: [],
          memberPoints: {},
          tieCursor: 0,
          recurringNextIdx: {},
        });

        if (isNewCircle) {
          // Create new circle in Firestore
          const circleRef = doc(db, "circles", circleId);
          try {
            await setDoc(circleRef, {
              name: circleName.toLowerCase(),
              displayName: circleName,
              members: [],
              memberPoints: {},
              tieCursor: 0,
              recurringNextIdx: {},
              createdAt: Date.now(),
              updatedAt: Date.now(),
            });
          } catch (error) {
            console.error("Error creating circle:", error);
            throw error;
          }
        }
      },

      // Sync to Firestore
      syncToFirestore: async () => {
        const state = get();
        const circleRef = doc(db, "circles", state.circleId);
        try {
          await setDoc(
            circleRef,
            {
              members: state.members,
              memberPoints: state.memberPoints,
              tieCursor: state.tieCursor,
              recurringNextIdx: state.recurringNextIdx,
              updatedAt: Date.now(),
            },
            { merge: true }
          );
        } catch (error) {
          console.error("Error syncing circle to Firestore:", error);
        }
      },

      // Listen to Firestore changes
      listenToFirestore: (circleId) => {
        const circleRef = doc(db, "circles", circleId);
        return onSnapshot(
          circleRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              const state = get();

              const remoteMembers = data.members || [];
              const remoteMemberIds = remoteMembers.map((m) => m.id);

              // Find current user in local state
              const currentUser = state.members.find(
                (m) => m.id === state.currentUserId
              );

              // If current user exists but not in remote members, don't add them
              // They should sync themselves properly through setCurrentUser
              let updatedMembers = remoteMembers;

              set({
                members: updatedMembers,
                memberPoints: data.memberPoints || {},
                tieCursor: data.tieCursor || 0,
                recurringNextIdx: data.recurringNextIdx || {},
              });
            }
          },
          (error) => {
            console.error("Error listening to Firestore:", error);
          }
        );
      },

      setCurrentUser: async (name, avatarKey) => {
        const state = get();

        if (!state.circleId) {
          console.error("No circle selected");
          return;
        }

        // If user already has a valid currentUserId, prevent rejoining
        if (state.currentUserId) {
          console.log(
            "User already logged in, cannot rejoin as different person"
          );
          return;
        }

        const newMemberId = `m_${Date.now()}`;
        const circleRef = doc(db, "circles", state.circleId);

        try {
          // First, get the latest members from Firestore
          const snapshot = await getDoc(circleRef);
          let existingMembers = [];

          if (snapshot.exists()) {
            existingMembers = snapshot.data().members || [];
          }

          const realMembers = existingMembers;

          // Check if user already exists (by name to prevent duplicates)
          const userExists = realMembers.some(
            (m) => m.name.toLowerCase() === name.trim().toLowerCase()
          );

          if (userExists) {
            // Find existing user and set as current
            const existingUser = realMembers.find(
              (m) => m.name.toLowerCase() === name.trim().toLowerCase()
            );
            set({ currentUserId: existingUser.id, members: realMembers });
            return;
          }

          // Add new user to the real members list - store avatarKey instead of image
          const newUser = { id: newMemberId, name, avatarKey };
          const updatedMembers = [...realMembers, newUser];

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

          const cycleKey = new Date().toISOString().split("T")[0];
          upsertAssignments(cycleKey, assignments, state.circleId);

          // Update local state
          set({
            members: updatedMembers,
            currentUserId: newMemberId,
            memberPoints: newState.memberPoints,
            tieCursor: newState.tieCursor,
            recurringNextIdx: newState.recurringNextIdx,
          });

          // Sync to Firestore
          await get().syncToFirestore();
        } catch (error) {
          console.error("Error setting current user:", error);
        }
      },
      leaveCircle: async () => {
        const state = get();

        // Remove current user from members
        const updatedMembers = state.members.filter(
          (m) => m.id !== state.currentUserId
        );

        // Update local state first - clear everything
        set({
          members: [],
          currentUserId: null,
          circleId: null,
          circleName: null,
          memberPoints: {},
          tieCursor: 0,
          recurringNextIdx: {},
        });

        // Sync the removal to Firestore
        try {
          const circleRef = doc(db, "circles", state.circleId);
          await setDoc(
            circleRef,
            {
              members: updatedMembers,
              updatedAt: Date.now(),
            },
            { merge: true }
          );

          // Clear persisted data
          await AsyncStorage.removeItem("cb_circle");
          // Also clear tasks data
          useTasksStore.getState().clearCircleData();
        } catch (error) {
          console.error("Error leaving circle:", error);
        }
      },
    }),
    {
      name: "cb_circle",
      storage: createJSONStorage(() => AsyncStorage),
      // Persist currentUserId and circle info so users maintain their identity across sessions
      partialize: (state) => ({
        currentUserId: state.currentUserId,
        circleId: state.circleId,
        circleName: state.circleName,
      }),
    }
  )
);
