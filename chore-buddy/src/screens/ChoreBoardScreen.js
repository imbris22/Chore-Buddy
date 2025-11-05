import React from "react";
import { View, Text, StyleSheet, Image, ScrollView, Pressable } from "react-native";
import COLORS from "../theme/colors";
import ProgressBar from "../components/ProgressBar";
import ChoreCard from "../components/ChoreCard";
import Avatar from "../components/Avatar";
import { useCircleStore } from "../state/circleStore";
import { useTasksStore } from "../state/tasksStore";
import { currentWeek } from "../lib/cycle";
import { assignTasks } from "../lib/allocator";

// ✅ import your logo
import Logo from "../../assets/logo.png";

export default function ChoreBoardScreen() {
  const { members, currentUserId, memberPoints, tieCursor, recurringNextIdx,
          setTotals, setTieCursor, setRecurringNextIdx } = useCircleStore();
  const { chores, assignments, status, upsertAssignments } = useTasksStore();

  const week = currentWeek();
  const cycleKey = week.startISO;
  const myMember = members.find(m => m.id === currentUserId) || members[0];

  const [generated, setGenerated] = React.useState(Boolean(assignments[cycleKey]));
  const assignMap = assignments[cycleKey] || {};
  const taskList = Object.values(chores);

  const myTasks = React.useMemo(() => {
    return taskList.filter(t => assignMap[t.id] === myMember.id);
  }, [assignMap, taskList, myMember]);

  const totals = React.useMemo(() => {
    const max = myTasks.reduce((s,t)=>s+(t.points||1),0);
    const done = myTasks.reduce((s,t)=>{
      const key = `${cycleKey}:${t.id}`;
      return s + (status[key]==="done" ? (t.points||1) : 0);
    },0);
    return { done, max };
  }, [myTasks, status, cycleKey]);

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
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      
      {/* ✅ Logo + Text */}
      <View style={s.header}>
        <View style={s.logoRow}>
          <Image source={Logo} style={s.logoImg} resizeMode="contain" />
          <Text style={s.logoText}>Chore Buddy</Text>
        </View>
      </View>

      {/* Greeting */}
      <Text style={s.hi}>Hi {myMember.name}!</Text>
      <Text style={s.week}>Your chores for week of {new Date(week.start).toLocaleDateString()}</Text>

      {/* Chores row */}
      <View style={s.row}>
        {generated ? (
          myTasks.length ? myTasks.map((t) => (
            <ChoreCard key={t.id} title={t.title} points={t.points} />
          )) : <Text style={s.empty}>No chores assigned.</Text>
        ) : (
          <Pressable onPress={generateWeek} style={s.generateBtn}>
            <Text style={s.generateText}>Generate Week</Text>
          </Pressable>
        )}
      </View>

      {/* Progress */}
      <View style={s.progressWrap}>
        <ProgressBar value={totals.done} max={totals.max} />
        <Text style={s.progressText}>{totals.done}/{totals.max || 0} points completed</Text>
      </View>

      {/* Add chore */}
      <Pressable style={s.addBtn}>
        <Text style={s.addText}>+ Add Chore</Text>
      </Pressable>

      {/* Your Circle */}
      <View style={s.section}>
        <Text style={s.sectionTitle}>Your Circle</Text>
        <View style={s.circleRow}>
          {members.map(m => {
            const weeklyTotal = taskList
              .filter(t => assignMap[t.id] === m.id)
              .reduce((s,t)=>s+(t.points||1),0);
            const weeklyDone = taskList
              .filter(t => assignMap[t.id] === m.id)
              .reduce((s,t)=>s + (status[`${cycleKey}:${t.id}`]==="done" ? (t.points||1) : 0), 0);
            return (
              <Avatar key={m.id} image={m.avatar} name={m.name} value={weeklyDone} max={weeklyTotal||1} />
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  content: { padding: 16 },

  header: {
    backgroundColor: COLORS.secondary,
    borderRadius: 8,
    marginBottom: 12,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoImg: {
    width: 120,
    height: 120,
  },
  logoText: {
    color: COLORS.text,
    fontSize: 28,
    fontFamily: "Jersey_25", // ✅ Jersey 25
  },

  hi: { color: COLORS.text, fontSize: 22, marginTop: 8 },
  week: { color: COLORS.text, opacity: 0.8, marginBottom: 12 },
  row: { flexDirection: "row", gap: 12 },
  empty: { color: COLORS.text },

  progressWrap: { marginTop: 14 },
  progressText: { color: COLORS.text, opacity: 0.8, marginTop: 6, textAlign: "center" },

  addBtn: {
    marginTop: 16,
    backgroundColor: COLORS.secondary,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  addText: { color: COLORS.text, fontSize: 16 },
  section: {
    marginTop: 18,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionTitle: { color: COLORS.text, marginBottom: 8, fontSize: 16 },
  circleRow: { flexDirection: "row", justifyContent: "space-between" },
  generateBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  generateText: { color: COLORS.text },
});
