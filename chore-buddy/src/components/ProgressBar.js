import React from "react";
import { View, StyleSheet } from "react-native";
import COLORS from "../theme/colors";

export default function ProgressBar({ value, max }) {
  const w = Math.max(0, Math.min(1, max ? value / max : 0));
  return (
    <View style={s.wrap}>
      <View style={[s.fill, { width: `${w * 100}%` }]} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { height: 10, borderRadius: 6, backgroundColor: COLORS.subtle, overflow: "hidden" },
  fill: { height: "100%", backgroundColor: COLORS.primary },
});
