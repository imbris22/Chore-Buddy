import React, { useMemo } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import COLORS from "../theme/colors";
import { useTasksStore } from "../state/tasksStore"; // store should export useTasksStore
import { useCircleStore } from "../state/circleStore";
import BottomNav from "../components/BottomNav";

const logo = require("../../assets/logo.png");

// helper: normalize possible store shapes and group by week-start (Mon)
function weekStartDate(d) {
  const dt = new Date(d);
  // shift so Monday = 0
  const day = (dt.getDay() + 6) % 7;
  const start = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() - day);
  start.setHours(0, 0, 0, 0);
  return start;
}
function formatWeekLabel(date) {
  // date is Date at week start
  const m = date.getMonth() + 1;
  const day = date.getDate();
  const yy = String(date.getFullYear()).slice(-2);
  return `Week of ${m}/${day}/${yy}`;
}

export default function HistoryScreen({ navigation }) {
  // handle bottom nav presses from this screen (same pattern as ChoreBoard)
  const handleTabPress = (key) => {
    if (key === "Home") return navigation.navigate("ChoreBoard");
    if (key === "History") return navigation.navigate("History");
    if (key === "Rankings") return navigation.navigate("Rankings");
    if (key === "Profile") return navigation.navigate("Profile");
  };

  const currentUserId = useCircleStore((s) => s.currentUserId);

  // read the history for the current user (fall back to sensible shapes)
  const rawHistory = useTasksStore((s) => s.history);

  // normalize to an array of completion entries for the current user
  const completions = React.useMemo(() => {
    if (!rawHistory) return [];
    // preferred shape: history is an object keyed by memberId -> [entries]
    if (rawHistory[currentUserId]) return rawHistory[currentUserId];
    // if history is already an array (legacy), use it
    if (Array.isArray(rawHistory)) return rawHistory;
    // fallback: flatten all member lists
    return Object.values(rawHistory).flat();
  }, [rawHistory, currentUserId]);

  // group completions by week start (unchanged grouping logic)
  const weeks = useMemo(() => {
    const map = new Map();
    completions.forEach((c) => {
      // support several possible date keys (ts is what addHistory sets)
      const dateVal = c.ts || c.time || c.date || c.completedAt || c.completed_at;
      const date = dateVal ? new Date(dateVal) : new Date(); // fallback to now
      const ws = weekStartDate(date).getTime();
      if (!map.has(ws)) map.set(ws, []);
      map.get(ws).push({ ...c, _date: date });
    });
    // sort weeks descending (most recent first)
    const sorted = Array.from(map.entries())
      .sort((a, b) => b[0] - a[0])
      .map(([ts, items]) => ({
        weekStart: new Date(Number(ts)),
        items: items.sort((x, y) => y._date - x._date),
      }));
    return sorted;
  }, [completions]);

  // total tasks done
  const totalDone = completions.length;

  // simple weekly streak: count consecutive weeks (including current) that have >=1 completion
  const streak = useMemo(() => {
    if (weeks.length === 0) return 0;
    // build set of weekStart timestamps (midnight)
    const present = new Set(weeks.map((w) => +weekStartDate(w.weekStart)));
    let count = 0;
    // start from this week's start
    let cursor = +weekStartDate(new Date());
    // loop back week by week while present
    while (present.has(cursor)) {
      count++;
      cursor -= 7 * 24 * 60 * 60 * 1000;
    }
    return count;
  }, [weeks]);

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View style={styles.brand}>
          <Image source={logo} style={styles.brandLogo} />
          <Text style={styles.brandText}>Chore Buddy</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerIcon}>⏱️</Text>
            <Text style={styles.headerTitle}>History</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.goBack?.()}
            style={styles.closeBtn}
          >
            <Text style={styles.closeX}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Tasks Done</Text>
            <Text style={styles.metricValue}>{totalDone}</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Weekly Streak</Text>
            <View style={styles.streakRow}>
              <Text style={styles.streakIcon}>⚡</Text>
              <Text style={styles.metricValue}>{streak}</Text>
            </View>
          </View>
        </View>

        {weeks.length === 0 ? (
          <Text style={styles.empty}>No completed chores yet.</Text>
        ) : (
          weeks.map((week) => (
            <View key={week.weekStart.getTime()} style={styles.weekSection}>
              <Text style={styles.weekLabel}>
                {formatWeekLabel(week.weekStart)}
              </Text>
              {week.items.map((it) => (
                <View key={`${it.taskId ?? it.id}-${it.ts ?? it._date.getTime()}`} style={styles.historyItem}>
                  <Text style={styles.itemTitle}>
                    {it.title ?? it.name ?? it.choreTitle ?? "Untitled"}
                  </Text>
                  <Text style={styles.itemPoints}>
                    {it.points != null ? `+${it.points}` : `+${it.value ?? 0}`}
                  </Text>
                </View>
              ))}
            </View>
          ))
        )}

        {/* bottom spacing for nav */}
        <View style={{ height: 96 }} />
      </ScrollView>

      {/* Bottom Navigation (anchored) */}
      <View style={styles.navWrap}>
        <BottomNav active="History" onTabPress={handleTabPress} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FEF7F0" },
  navWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  topBar: {
    backgroundColor: "#BEEBEF",
    paddingTop: 20,
    paddingBottom: 14,
    paddingHorizontal: 16,
  },
  brand: { flexDirection: "row", alignItems: "center" },
  brandLogo: { width: 40, height: 40, marginRight: 12, resizeMode: "contain" },
  brandText: { fontSize: 20, color: "#3B2F2A", fontFamily: "Jersey" },

  content: { padding: 16 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  headerIcon: { fontSize: 20, marginRight: 8 },
  headerTitle: { fontSize: 20, color: COLORS.text, fontFamily: "Kantumruy" },
  closeBtn: { padding: 8 },
  closeX: { fontSize: 20, color: COLORS.text },

  metricsRow: { marginTop: 12, gap: 12 },
  metricCard: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F2DCCF",
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metricLabel: { color: COLORS.text, fontFamily: "Kantumruy" },
  metricValue: { color: COLORS.text, fontFamily: "Kantumruy", fontSize: 20 },

  streakRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  streakIcon: { fontSize: 18, marginRight: 6 },

  weekSection: { marginTop: 10 },
  weekLabel: { color: COLORS.text, fontFamily: "Kantumruy", marginBottom: 8 },
  historyItem: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: "#F2DCCF",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  itemTitle: { color: COLORS.text, fontFamily: "Kantumruy" },
  itemPoints: { color: COLORS.text, fontFamily: "Kantumruy", fontWeight: "700" },

  empty: { color: COLORS.text, fontFamily: "Kantumruy", marginTop: 20 },
});