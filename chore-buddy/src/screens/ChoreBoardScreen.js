import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
} from "react-native";
import COLORS from "../theme/colors";
import ProgressBar from "../components/ProgressBar";
import ChoreCard from "../components/ChoreCard";
import Avatar from "../components/Avatar";
import { useCircleStore } from "../state/circleStore";
import { useTasksStore } from "../state/tasksStore";
import { currentWeek } from "../lib/cycle";
import { assignTasks } from "../lib/allocator";
import BottomNav from "../components/BottomNav";
import CompleteChoreModal from "../components/CompleteChoreModal";

import Logo from "../../assets/logo.png";
import GroceryIcon from "../../assets/chore-icons/shopping-basket.png";

const NAV_HEIGHT = 72;

export default function ChoreBoardScreen({ navigation }) {
  // handle bottom nav presses from this screen (same pattern as GroceryList button)
  const handleTabPress = (key) => {
    if (key === "History") return navigation.navigate("History");
    if (key === "Home") return navigation.navigate("ChoreBoard");
    if (key === "Rankings") return navigation.navigate("Rankings");
    if (key === "Profile") return navigation.navigate("Profile");
    // fallback: noop
  };

  const {
    members,
    currentUserId,
    memberPoints,
    tieCursor,
    recurringNextIdx,
    setTotals,
    setTieCursor,
    setRecurringNextIdx,
  } = useCircleStore();

  const {
    chores,
    assignments,
    status,
    upsertAssignments,
    setStatus, // must exist in tasksStore
    addHistory, // must exist in tasksStore
  } = useTasksStore();

  const week = currentWeek();
  const cycleKey = week.startISO;
  const myMember = members.find((m) => m.id === currentUserId) || members[0];

  const assignMap = assignments[cycleKey] || {};
  const taskList = React.useMemo(() => Object.values(chores), [chores]);

  const hasAssignments = React.useMemo(
    () => Object.keys(assignMap).length > 0,
    [assignMap]
  );

  const myTasks = React.useMemo(
    () => taskList.filter((t) => assignMap[t.id] === myMember.id),
    [assignMap, taskList, myMember]
  );

  const totals = React.useMemo(() => {
    const max = myTasks.reduce((s, t) => s + (t.points || 1), 0);
    const done = myTasks.reduce((s, t) => {
      const key = `${cycleKey}:${t.id}`;
      return s + (status[key] === "done" ? t.points || 1 : 0);
    }, 0);
    return { done, max };
  }, [myTasks, status, cycleKey]);

  // Modal
  const [modalOpen, setModalOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState(null);

  const openComplete = (task) => {
    const pairKey = `${cycleKey}:${task.id}`;
    console.log("Tapped task:", task.id, "status:", status[pairKey]); // DEBUG
    if (status[pairKey] === "done") return;
    setSelectedTask(task);
    setModalOpen(true);
  };

  const confirmComplete = () => {
    if (!selectedTask) return;
    const pairKey = `${cycleKey}:${selectedTask.id}`;

    setStatus(pairKey, "done"); // triggers progress recompute

    const assigneeId = assignMap[selectedTask.id];
    if (assigneeId) {
      addHistory(assigneeId, {
        ts: Date.now(),
        cycleKey,
        taskId: selectedTask.id,
        title: selectedTask.title,
        points: selectedTask.points || 1,
      });
    }

    setModalOpen(false);
  };

  const generateWeek = () => {
    const { assignments: map, state } = assignTasks(members, taskList, {
      memberPoints,
      tieCursor,
      recurringNextIdx,
    });
    upsertAssignments(cycleKey, map);
    setTotals(state.memberPoints);
    setTieCursor(state.tieCursor);
    setRecurringNextIdx(state.recurringNextIdx);
  };

  return (
    <View style={s.wrap}>
      <ScrollView
        style={s.container}
        contentContainerStyle={s.content}
        scrollEnabled={!modalOpen}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={s.header}>
          <View style={s.logoRow}>
            <Image source={Logo} style={s.logoImg} resizeMode="contain" />
            <Text style={s.logoText}>Chore Buddy</Text>
          </View>
        </View>

        {/* Greeting */}
        <Text style={s.hi}>Hi {myMember.name}!</Text>
        <Text style={s.week}>
          Your chores for week of {new Date(week.start).toLocaleDateString()}
        </Text>

        {/* Task cards (tap opens modal) */}
        <View style={s.row}>
          {hasAssignments ? (
            myTasks.length ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.rowContent}
              >
                {myTasks.map((t) => {
                  const pairKey = `${cycleKey}:${t.id}`;
                  const isDone = status[pairKey] === "done";

                  return (
                    <ChoreCard
                      key={t.id}
                      chore={t}
                      isDone={isDone}
                      onPress={() => openComplete(t)}
                    />
                  );
                })}
              </ScrollView>
            ) : (
              <Text style={s.empty}>No chores assigned.</Text>
            )
          ) : (
            <Pressable onPress={generateWeek} style={s.generateBtn}>
              <Text style={s.generateText}>Generate Week</Text>
            </Pressable>
          )}
        </View>

        {/* Progress summary */}
        <View style={s.progressWrap}>
          <ProgressBar value={totals.done} max={totals.max} />
          <Text style={s.progressText}>
            {totals.done}/{totals.max || 0} points completed
          </Text>
        </View>

        {/* Add Chore */}
        <Pressable
          style={s.addBtn}
          onPress={() => navigation.navigate("ChoreCreation")}
        >
          <Text style={s.addText}>+ Add Chore</Text>
        </Pressable>

        {/* Grocery List */}
        <Pressable
          style={s.groceryBtn}
          onPress={() => navigation.navigate("GroceryList")}
        >
          <Image source={GroceryIcon} style={s.groceryIcon} />
          <Text style={s.groceryText}>Grocery List</Text>
        </Pressable>

        {/* Your Circle */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Your Circle</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.circleScrollContent}
          >
            <View style={s.circleRow}>
              {members.map((m) => {
                const weeklyTotal = taskList
                  .filter((t) => assignMap[t.id] === m.id)
                  .reduce((s, t) => s + (t.points || 1), 0);
                const weeklyDone = taskList
                  .filter((t) => assignMap[t.id] === m.id)
                  .reduce(
                    (s, t) =>
                      s +
                      (status[`${cycleKey}:${t.id}`] === "done"
                        ? t.points || 1
                        : 0),
                    0
                  );
                return (
                  <View key={m.id} style={s.circleItem}>
                    <Avatar
                      image={m.avatar}
                      name={m.name}
                      value={weeklyDone}
                      max={weeklyTotal || 1}
                      imageOffsetY={
                        m.id === "m_sam" || m.id === "m_bear" ? 10 : 0
                      }
                      imageScale={m.id === "m_bear" ? 1.2 : 1}
                    />
                  </View>
                );
              })}
            </View>
          </ScrollView>
        </View>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={s.navWrap}>
        <BottomNav active="Home" onTabPress={handleTabPress} />
      </View>

      {/* Completion Modal */}
      <CompleteChoreModal
        visible={modalOpen}
        choreName={(selectedTask && selectedTask.title) || ""}
        points={(selectedTask && selectedTask.points) || 1}
        onCancel={() => setModalOpen(false)}
        onConfirm={confirmComplete}
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 140 },

  navWrap: { position: "absolute", bottom: 0, left: 0, right: 0 },

  header: {
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
    justifyContent: "center",
    width: "100%",
    height: 88,
    marginTop: 16,
    marginBottom: 16,
  },
  logoRow: { flexDirection: "row", alignItems: "center" },
  logoImg: { width: 120, height: 120, marginLeft: -16 },
  logoText: {
    color: COLORS.text,
    fontSize: 28,
    fontFamily: "Jersey",
    marginLeft: -14,
  },

  hi: { color: COLORS.text, fontSize: 22, marginTop: 2, fontFamily: "Jersey" },
  week: {
    color: COLORS.text,
    opacity: 0.8,
    marginBottom: 12,
    fontFamily: "Kantumruy",
  },

  // small tester
  testBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#EEE",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  testBtnText: { color: "#333" },

  row: { marginBottom: 0 },

  rowContent: {
    flexDirection: "row",
    gap: 0,
    paddingRight: 4,
  },

  empty: { color: COLORS.text },

  progressWrap: { marginTop: 12 },
  progressText: {
    color: COLORS.text,
    opacity: 0.8,
    marginTop: 6,
    textAlign: "center",
    fontFamily: "Kantumruy",
  },

  addBtn: {
    alignSelf: "center",
    marginTop: 14,
    width: "70%",
    backgroundColor: COLORS.secondary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  addText: { color: COLORS.text, fontSize: 16, fontFamily: "Jersey" },

  groceryBtn: {
    marginTop: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFC7D3",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  groceryIcon: { width: 22, height: 22, marginRight: 10 },
  groceryText: { fontSize: 18, fontFamily: "Jersey", color: COLORS.text },

  section: {
    marginTop: 16,
    backgroundColor: "#F7EFE3",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  sectionTitle: {
    color: COLORS.text,
    marginBottom: 12,
    fontSize: 16,
    fontFamily: "Jersey",
  },

  circleScrollContent: {
    paddingHorizontal: 4,
  },

  circleRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  circleItem: { width: 80, alignItems: "center" },

  generateBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  generateText: { color: COLORS.text },
});
