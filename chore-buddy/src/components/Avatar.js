import React from "react";
import { View, Text, StyleSheet } from "react-native";
import COLORS from "../theme/colors";
import ProgressBar from "./ProgressBar";

export default function Avatar({ emoji, name, value=0, max=1 }) {
  return (
    <View style={s.wrap}>
      <View style={s.face}><Text style={s.emoji}>{emoji}</Text></View>
      <Text style={s.name}>{name}</Text>
      <ProgressBar value={value} max={max} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { width: 82, alignItems: "center" },
  face: {
    width: 58, height: 58, borderRadius: 16,
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border,
    alignItems: "center", justifyContent: "center",
  },
  emoji: { fontSize: 30 },
  name: { color: COLORS.text, marginTop: 6, marginBottom: 6 },
});
