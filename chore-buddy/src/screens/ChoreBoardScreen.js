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
import BottomArt from "../../assets/background image.png";

const NAV_HEIGHT = 72;
const BG_ART_HEIGHT = 180;

export default function ChoreBoardScreen({ navigation }) {
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
    setStatus,   // must exist in tasksStore
    addHistory,  // must exist in tasksStore
  } = useTasksStore();

  const week = currentWeek();
  const cycleKey = week.startISO;
  const myMember = members.find((m) => m.id === currentUserId) || members[0];

  const [generated, setGenerated] = React.useState(Boolean(assignments[cycleKey]));
  const assignMap = assignments[cycleKey] || {};
  const taskList = React.useMemo(() => Object.values(chores), [chores]);

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
    setGenerated(true);
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
          {generated ? (
            myTasks.length ? (
              myTasks.map((t) => (
                <ChoreCard key={t.id} chore={t} onPress={() => openComplete(t)} />
              ))
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
        <Pressable style={s.addBtn}>
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
                    imageOffsetY={m.id === "m_sam" || m.id === "m_bear" ? 10 : 0}
                    imageScale={m.id === "m_bear" ? 1.2 : 1}
                  />
                </View>
              );
            })}
          </View>
        </View>

        <View style={{ height: BG_ART_HEIGHT + 20 }} />
      </ScrollView>

      {/* Bottom Background Characters (can't intercept touches now) */}
      <Image source={BottomArt} style={s.bgArt} resizeMode="contain" pointerEvents="none" />

      {/* Bottom Navigation */}
      <View style={s.navWrap}>
        <BottomNav active="Home" onTabPress={() => {}} />
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
  logoText: { color: COLORS.text, fontSize: 28, fontFamily: "Jersey", marginLeft: -14 },

  hi: { color: COLORS.text, fontSize: 22, marginTop: 2, fontFamily: "Jersey" },
  week: { color: COLORS.text, opacity: 0.8, marginBottom: 12, fontFamily: "Kantumruy" },

  // small tester
  testBtn: { alignSelf: "flex-start", backgroundColor: "#EEE", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, marginBottom: 8 },
  testBtnText: { color: "#333" },

  row: { flexDirection: "row", gap: 12, flexWrap: "wrap" },

  empty: { color: COLORS.text },

  progressWrap: { marginTop: 12 },
  progressText: { color: COLORS.text, opacity: 0.8, marginTop: 6, textAlign: "center", fontFamily: "Kantumruy" },

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
    backgroundColor: "#F1C6D2",
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
  sectionTitle: { color: COLORS.text, marginBottom: 12, fontSize: 16, fontFamily: "Jersey" },

  circleRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 8 },
  circleItem: { width: "24%", alignItems: "center" },

  generateBtn: { backgroundColor: COLORS.primary, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12 },
  generateText: { color: COLORS.text },

  bgArt: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: NAV_HEIGHT + 4,
    height: BG_ART_HEIGHT,
    width: "100%",
    opacity: 0.5,
    zIndex: 1,
  },
});
