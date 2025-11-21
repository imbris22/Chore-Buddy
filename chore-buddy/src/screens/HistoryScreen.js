import React, { useMemo } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { SvgUri } from "react-native-svg";
import COLORS from "../theme/colors";
import { useTasksStore } from "../state/tasksStore"; // store should export useTasksStore
import { useCircleStore } from "../state/circleStore";
import BottomNav from "../components/BottomNav";
const clockAsset = require("../../assets/history-icons/clock_history.svg");
const zapAsset = require("../../assets/history-icons/zap.svg");

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
    // if the user has no history yet, return empty array (don't show other people's history)
    return [];
  }, [rawHistory, currentUserId]);

  // group completions by week start (unchanged grouping logic)
  const weeks = useMemo(() => {
    const map = new Map();
    completions.forEach((c) => {
      // support several possible date keys (ts is what addHistory sets)
      const dateVal =
        c.ts || c.time || c.date || c.completedAt || c.completed_at;
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
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Rankings-style header (moved inside ScrollView to match RankingsScreen spacing) */}
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <Image source={logo} style={styles.logoImg} resizeMode="contain" />
            <Text style={styles.logoText}>Chore Buddy</Text>
          </View>
        </View>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <SvgUri
              width={20}
              height={20}
              uri={Image.resolveAssetSource(clockAsset).uri}
              style={styles.headerIcon}
            />
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
              <SvgUri
                width={18}
                height={18}
                uri={Image.resolveAssetSource(zapAsset).uri}
                style={styles.streakIcon}
              />
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
                <View
                  key={`${it.taskId ?? it.id}-${it.ts ?? it._date.getTime()}`}
                  style={styles.historyItem}
                >
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
  scrollContainer: { flex: 1 },
  navWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
    justifyContent: "center",
    width: "100%",
    height: 88,
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

  content: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 24 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  headerLeft: { flexDirection: "row", alignItems: "center" },
  headerIcon: { width: 20, height: 20, marginRight: 8 },
  headerTitle: { fontSize: 22, color: COLORS.text, fontFamily: "Jersey" },
  closeBtn: { padding: 8 },
  closeX: { fontSize: 20, color: "#7B7B7B"},

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
  metricValue: { color: COLORS.text, fontFamily: "Jersey", fontSize: 24 },

  streakRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  streakIcon: { width: 18, height: 18, marginRight: 6 },

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
  itemPoints: {
    color: COLORS.text,
    fontFamily: "Jersey",
    fontWeight: "700",
    fontSize: 20,
  },

  empty: { color: COLORS.text, fontFamily: "Kantumruy", marginTop: 20 },
});
