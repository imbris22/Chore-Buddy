// screens/RankingsScreen.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
} from "react-native";
import { SvgUri } from "react-native-svg";
import COLORS from "../theme/colors";
import BottomNav from "../components/BottomNav";
import { useCircleStore } from "../state/circleStore";
import { useTasksStore } from "../state/tasksStore";
import { currentWeek } from "../lib/cycle";

import Logo from "../../assets/logo.png";
const bellAsset = require("../../assets/bell.svg");

const NAV_HEIGHT = 72;

export default function RankingsScreen({ navigation }) {
  const { members } = useCircleStore();
  const {
    chores,
    assignments,
    status,
    history = {}, // expect history[memberId] = [{ ts, points, ... }]
  } = useTasksStore();

  const week = currentWeek();
  const cycleKey = week.startISO;

  const [scope, setScope] = React.useState("weekly"); // "weekly" | "monthly" | "all"

  const assignMap = assignments[cycleKey] || {};
  const taskList = React.useMemo(() => Object.values(chores), [chores]);

  const ranked = React.useMemo(() => {
    const now = Date.now();
    const monthCutoff = now - 30 * 24 * 60 * 60 * 1000;

    const withPoints = members.map((m) => {
      let points = 0;

      if (scope === "weekly") {
        // completed points this week from current status
        points = taskList.reduce((sum, t) => {
          if (assignMap[t.id] !== m.id) return sum;
          const key = `${cycleKey}:${t.id}`;
          const done = status[key] === "done";
          return sum + (done ? t.points || 1 : 0);
        }, 0);
      } else {
        const entries = history[m.id] || [];
        const cutoff = scope === "monthly" ? monthCutoff : 0;

        points = entries.reduce((sum, h) => {
          if (!h || typeof h.ts !== "number") return sum;
          if (h.ts < cutoff) return sum;
          return sum + (h.points || 1);
        }, 0);
      }

      return { ...m, points };
    });

    return withPoints
      .slice()
      .sort((a, b) => b.points - a.points)
      .slice(0, 3);
  }, [members, taskList, assignMap, status, cycleKey, scope, history]);

  // arrange podium as: 2nd – 1st – 3rd
  const podium = [ranked[1] || null, ranked[0] || null, ranked[2] || null];

  return (
    <View style={s.wrap}>
      <ScrollView
        style={s.container}
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={s.header}>
          <View style={s.logoRow}>
            <Image source={Logo} style={s.logoImg} resizeMode="contain" />
            <Text style={s.logoText}>Chore Buddy</Text>
          </View>
        </View>

        {/* Main content */}
        <View style={s.card}>
          {/* Title row with X */}
          <View style={s.titleRow}>
            <Text style={s.title}>Rankings</Text>
            <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
              <Text style={s.closeText}>×</Text>
            </Pressable>
          </View>

          {/* Podium */}
          <View style={s.podiumWrap}>
            <View style={s.podiumInner}>
              {/* Left (2nd) */}
              {podium[0] && (
                <View style={s.column}>
                  <View style={[s.bar, s.barLeft]}>
                    <Text style={s.barScore}>{podium[0].points}</Text>
                    <Text style={s.barName}>{podium[0].name}</Text>
                  </View>

                  {podium[0].avatar && (
                    <Image
                      source={podium[0].avatar}
                      style={[s.avatar, s.avatarLeft]}
                      resizeMode="contain"
                    />
                  )}
                </View>
              )}

              {/* Center (1st) */}
              {podium[1] && (
                <View style={s.column}>
                  <View style={[s.bar, s.barCenter]}>
                    <Text style={s.barScore}>{podium[1].points}</Text>
                    <Text style={s.barName}>{podium[1].name}</Text>
                  </View>

                  {podium[1].avatar && (
                    <Image
                      source={podium[1].avatar}
                      style={[s.avatar, s.avatarCenter]}
                      resizeMode="contain"
                    />
                  )}
                </View>
              )}

              {/* Right (3rd) */}
              {podium[2] && (
                <View style={s.column}>
                  <View style={[s.bar, s.barRight]}>
                    <Text style={s.barScore}>{podium[2].points}</Text>
                    <Text style={s.barName}>{podium[2].name}</Text>
                  </View>

                  {podium[2].avatar && (
                    <Image
                      source={podium[2].avatar}
                      style={[s.avatar, s.avatarRight]}
                      resizeMode="contain"
                    />
                  )}
                </View>
              )}
            </View>
          </View>

          {/* Tabs */}
          <View style={s.tabsRow}>
            <Pressable
              style={[s.tab, scope === "weekly" && s.tabActive]}
              onPress={() => setScope("weekly")}
            >
              <Text
                style={[
                  s.tabLabel,
                  scope === "weekly" && s.tabLabelActive,
                ]}
              >
                Weekly
              </Text>
            </Pressable>
            <Pressable
              style={[s.tab, scope === "monthly" && s.tabActive]}
              onPress={() => setScope("monthly")}
            >
              <Text
                style={[
                  s.tabLabel,
                  scope === "monthly" && s.tabLabelActive,
                ]}
              >
                Monthly
              </Text>
            </Pressable>
            <Pressable
              style={[s.tab, scope === "all" && s.tabActive]}
              onPress={() => setScope("all")}
            >
              <Text
                style={[
                  s.tabLabel,
                  scope === "all" && s.tabLabelActive,
                ]}
              >
                All-time
              </Text>
            </Pressable>
          </View>

          {/* Achievements header (no bear badge box) */}
          <View style={s.sectionHeaderRow}>
            <Text style={s.sectionTitle}>Achievements</Text>
            <SvgUri
              width={20}
              height={20}
              uri={Image.resolveAssetSource(bellAsset).uri}
            />
          </View>
        </View>

        <View style={{ height: NAV_HEIGHT + 16 }} />
      </ScrollView>

      {/* Bottom nav */}
      <View style={s.navWrap}>
        <BottomNav
          active="Rankings"
          onTabPress={(key) => {
            if (key === "Home") navigation.navigate("ChoreBoard");
            if (key === "History") navigation.navigate("History");
            if (key === "Rankings") navigation.navigate("Rankings");
          }}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 24 },

  navWrap: { position: "absolute", bottom: 0, left: 0, right: 0 },

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

  card: {
    backgroundColor: COLORS.bg,
    borderRadius: 0,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
    shadowColor: "transparent",
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { fontSize: 22, color: COLORS.text, fontFamily: "Jersey" },
  closeText: { fontSize: 20, color: "#7B7B7B" },

  podiumWrap: { marginTop: 4, marginBottom: 16 },
  podiumInner: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 8,
  },

  // fixed-width columns so podiums sit flush next to each other
  column: {
    alignItems: "center",
    justifyContent: "flex-end",
    width: 78,
  },

  bar: {
    width: 78,
    borderRadius: 12,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 10,
    paddingTop: 32,
  },
  barLeft: { height: 90, backgroundColor: "#B7E2E6" },
  barCenter: { height: 120, backgroundColor: "#FFC7D3" },
  barRight: { height: 80, backgroundColor: "#F6C48A" },

  barScore: { fontSize: 18, fontFamily: "Jersey", color: COLORS.text },
  barName: {
    fontSize: 12,
    fontFamily: "Kantumruy",
    color: COLORS.text,
    marginTop: 2,
  },

  avatar: {
    width: 54,
    height: 54,
    position: "absolute",
    top: -26,
  },
  avatarLeft: {},
  avatarCenter: {},
  avatarRight: {},

  tabsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#F0E2DE",
    paddingVertical: 10,
    alignItems: "center",
    marginHorizontal: 4,
    backgroundColor: COLORS.bg,
  },
  tabActive: {
    backgroundColor: COLORS.secondary,
    borderColor: COLORS.secondary,
  },
  tabLabel: {
    fontSize: 14,
    fontFamily: "Kantumruy",
    color: "#A08E7A",
  },
  tabLabelActive: {
    color: COLORS.text,
    fontWeight: "500",
  },

  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: "Jersey",
    color: COLORS.text,
  },
});
