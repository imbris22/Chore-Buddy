import React from "react";
import { View, Text, StyleSheet } from "react-native";
import COLORS from "../theme/colors";

export default function ChoreCard({ icon="🗑️", title, points }) {
  return (
    <View style={s.card}>
      <Text style={s.icon}>{icon}</Text>
      <Text style={s.title}>{title}</Text>
      <Text style={s.points}>{points} pts</Text>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    width: 92, height: 96, borderRadius: 12,
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border,
    alignItems: "center", justifyContent: "center", gap: 4
  },
  icon: { fontSize: 22 },
  title: { color: COLORS.text },
  points: { color: COLORS.text, opacity: 0.7, fontSize: 12 },
});
