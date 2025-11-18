import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
  SafeAreaView,
} from "react-native";
import { SvgUri } from "react-native-svg";
import COLORS from "../theme/colors";
import BottomNav from "../components/BottomNav";
import { useCircleStore } from "../state/circleStore";
import { useTasksStore } from "../state/tasksStore";

import Logo from "../../assets/logo.png";
const TrophyIcon = require("../../assets/trophy.svg");
const ZapIcon = require("../../assets/zap.svg");
const PinkStarIcon = require("../../assets/pink-star.svg");
const CheckIcon = require("../../assets/square-check-big.svg");
const LogOutIcon = require("../../assets/log-out.svg");

// helper: normalize date to week start (Monday)
function weekStartDate(d) {
  const dt = new Date(d);
  const day = (dt.getDay() + 6) % 7;
  const start = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() - day);
  start.setHours(0, 0, 0, 0);
  return start;
}

const NAV_HEIGHT = 72;

export default function ProfileScreen({ navigation }) {
  const handleTabPress = (key) => {
    if (key === "Home") navigation.navigate("ChoreBoard");
    if (key === "History") navigation.navigate("History");
    if (key === "Rankings") navigation.navigate("Rankings");
    if (key === "Profile") navigation.navigate("Profile");
  };

  const { members, currentUserId } = useCircleStore();
  const { history = {}, memberPoints = {} } = useTasksStore();

  const myMember = members.find((m) => m.id === currentUserId) || members[0];
  const myHistory = history[currentUserId] || [];

  // Calculate stats
  const totalPoints = memberPoints[currentUserId] || 0;
  const choresDone = myHistory.length;

  // Calculate week streak (same logic as HistoryScreen)
  const weekStreak = React.useMemo(() => {
    if (myHistory.length === 0) return 0;
    // build set of weekStart timestamps
    const weeks = new Map();
    myHistory.forEach((c) => {
      const dateVal =
        c.ts || c.time || c.date || c.completedAt || c.completed_at;
      const date = dateVal ? new Date(dateVal) : new Date();
      const ws = weekStartDate(date).getTime();
      if (!weeks.has(ws)) weeks.set(ws, true);
    });
    const present = new Set(weeks.keys());
    let count = 0;
    let cursor = +weekStartDate(new Date());
    while (present.has(cursor)) {
      count++;
      cursor -= 7 * 24 * 60 * 60 * 1000;
    }
    return count;
  }, [myHistory]);

  // Calculate rank (simplified - assume top based on points)
  const rank = 1; // placeholder

  return (
    <View style={s.wrap}>
      <SafeAreaView style={s.safe} edges={["top"]}>
        <ScrollView
          style={s.container}
          contentContainerStyle={s.content}
          scrollEnabled={true}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={s.header}>
            <View style={s.logoRow}>
              <Image source={Logo} style={s.logoImg} resizeMode="contain" />
              <Text style={s.logoText}>Chore Buddy</Text>
            </View>
          </View>

          <View style={s.headerRow}>
            <Text style={s.headerTitle}>Profile</Text>
            <Pressable onPress={() => navigation.goBack()} style={s.closeBtn}>
              <Text style={s.closeText}>×</Text>
            </Pressable>
          </View>

          {/* Profile Card */}
          <View style={s.profileCard}>
            <View style={s.avatarContainer}>
              <Image
                source={myMember.avatar}
                style={s.avatarImage}
                resizeMode="contain"
              />
            </View>
            <Text style={s.name}>{myMember.name}</Text>
            <Text style={s.username}>Gutmann 205</Text>
          </View>

          {/* Stats Grid */}
          <View style={s.statsGrid}>
            <View style={s.statBox}>
              <SvgUri
                width={20}
                height={20}
                uri={Image.resolveAssetSource(TrophyIcon).uri}
              />
              <Text style={s.statValue}>{totalPoints}</Text>
              <Text style={s.statLabel}>Total Points</Text>
            </View>

            <View style={s.statBox}>
              <SvgUri
                width={20}
                height={20}
                uri={Image.resolveAssetSource(ZapIcon).uri}
              />
              <Text style={s.statValue}>{weekStreak}</Text>
              <Text style={s.statLabel}>Weekly Streak</Text>
            </View>

            <View style={s.statBox}>
              <SvgUri
                width={20}
                height={20}
                uri={Image.resolveAssetSource(PinkStarIcon).uri}
              />
              <Text style={s.statValue}>#{rank}</Text>
              <Text style={s.statLabel}>Rank</Text>
            </View>

            <View style={s.statBox}>
              <SvgUri
                width={20}
                height={20}
                uri={Image.resolveAssetSource(CheckIcon).uri}
              />
              <Text style={s.statValue}>{choresDone}</Text>
              <Text style={s.statLabel}>Chores Done</Text>
            </View>
          </View>

          {/* Badges Section */}
          <View style={s.badgesSection}>
            <Text style={s.sectionTitle}>Badges</Text>
            <View style={s.badgesList}>
              <Pressable style={s.menuItem}>
                <Image
                  /*chevron*/
                  source={require("../../assets/nav-bar-icons/star.png")}
                  style={s.chevron}
                />
                <Text style={s.badgeName}>Grocery Goat</Text>
              </Pressable>
            </View>
          </View>

          <Pressable style={s.menuItem}>
            <View style={s.leaveIcon}>
              <SvgUri
                width={20}
                height={20}
                uri={Image.resolveAssetSource(LogOutIcon).uri}
              />
            </View>
            <Text style={s.menuLabel}>Leave Circle</Text>
          </Pressable>

          <View style={{ height: NAV_HEIGHT + 20 }} />
        </ScrollView>
      </SafeAreaView>

      {/* Bottom Navigation */}
      <View style={s.navWrap}>
        <BottomNav active="Profile" onTabPress={handleTabPress} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: COLORS.bg },
  safe: { flex: 1 },
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 140 },

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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Jersey",
    color: COLORS.text,
  },
  closeBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  closeText: { fontSize: 20, color: "#7B7B7B" },

  profileCard: {
    backgroundColor: "#F5EAE0",
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    height: 250,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    backgroundColor: "#F1C6D2",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarImage: {
    width: 150,
    height: 150,
  },
  name: {
    fontSize: 20,
    fontFamily: "Jersey",
    color: COLORS.text,
    marginBottom: 4,
  },
  username: {
    fontSize: 14,
    fontFamily: "Kantumruy",
    color: "#B7A596",
  },

  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    width: "48%",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8D9CC",
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  statIcon: {
    width: 24,
    height: 24,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 18,
    fontFamily: "Jersey",
    color: COLORS.text,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: "Kantumruy",
    color: "#B7A596",
    textAlign: "center",
  },

  badgesSection: {
    backgroundColor: "#F5EAE0",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: "Jersey",
    color: COLORS.text,
    marginBottom: 12,
  },
  badgesList: {
    flexDirection: "column",
    gap: 0,
  },
  badgeItem: {
    alignItems: "center",
  },
  badge: {
    width: 60,
    height: 60,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeEmoji: {
    fontSize: 32,
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E8D9CC",
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  badgeName: {
    fontSize: 16,
    fontFamily: "Jersey",
    color: COLORS.text,
    flex: 1,
    marginLeft: 12,
  },
  menuLabel: {
    fontSize: 16,
    fontFamily: "Jersey",
    color: COLORS.text,
    flex: 1,
    marginLeft: 12,
  },
  leaveIcon: {
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  chevron: {
    width: 16,
    height: 16,
  },
});
