import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import COLORS from "../theme/colors";

export default function ChoreCard({ chore, ...props }) {
  // defensive: if chore is missing, don't crash UI
  if (!chore) {
    console.warn("ChoreCard rendered with undefined chore");
    return null;
  }

  return (
    <TouchableOpacity style={styles.card} {...props}>
      {chore.icon ? (
        <Image source={chore.icon} style={styles.icon} />
      ) : (
        <View style={styles.iconPlaceholder} />
      )}
      <Text style={styles.title}>{chore.title ?? "Untitled"}</Text>
      <Text style={styles.points}>{chore.points} pts</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 92, height: 96, borderRadius: 12,
    backgroundColor: COLORS.card, borderWidth: 1, borderColor: COLORS.border,
    alignItems: "center", justifyContent: "center", gap: 4
  },
  icon: { width: 32, height: 32, marginBottom: 6, resizeMode: "contain" },
  title: { color: COLORS.text },
  points: { color: COLORS.text, opacity: 0.7, fontSize: 12, fontFamily: "Kantumruy" },
  iconPlaceholder: { backgroundColor: COLORS.border, borderRadius: 12, width: 24, height: 24, alignItems: "center", justifyContent: "center" },
});
