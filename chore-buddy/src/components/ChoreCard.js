import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { SvgUri } from "react-native-svg";
import COLORS from "../theme/colors";

export default function ChoreCard({ chore, isDone = false, ...props }) {
  // defensive: if chore is missing, don't crash UI
  if (!chore) {
    console.warn("ChoreCard rendered with undefined chore");
    return null;
  }

  return (
    <TouchableOpacity
      style={[styles.wrap, isDone && styles.wrapDone]}
      disabled={isDone}
      {...props}
    >
      <View style={[styles.iconBox, isDone && styles.iconBoxDone]}>
        {chore.icon ? (
          <SvgUri
            width={32}
            height={32}
            uri={chore.icon}
            style={[styles.icon, isDone && styles.iconDone]}
          />
        ) : (
          <View style={[styles.iconPlaceholder, isDone && styles.iconPlaceholderDone]} />
        )}
      </View>

      <Text style={[styles.title, isDone && styles.titleDone]}>
        {chore.title ?? "Untitled"}
      </Text>
      <Text style={[styles.points, isDone && styles.pointsDone]}>
        {chore.points} pts
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 92,
    alignItems: "center",
    justifyContent: "flex-start",
    paddingTop: 4,
    paddingBottom: 4,
  },
  wrapDone: {
    opacity: 0.5,
  },

  iconBox: {
    width: 65,
    height: 65,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: "#F5C6D4",
    backgroundColor: "#FFF8F1",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  iconBoxDone: {
    borderColor: "#E0D4CF",
    backgroundColor: "#F3ECE5",
  },

  icon: {
    width: 32,
    height: 32,
  },
  iconDone: {
    opacity: 0.4,
  },

  iconPlaceholder: {
    backgroundColor: COLORS.border,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  iconPlaceholderDone: {
    backgroundColor: "#C5C5C5",
  },

  title: {
    color: COLORS.text,
    fontFamily: "Kantumruy",
    fontSize: 13,
    textAlign: "center",
  },
  titleDone: {
    color: "#A9A9A9",
  },

  points: {
    color: COLORS.text,
    opacity: 0.7,
    fontSize: 11,
    fontFamily: "Kantumruy",
  },
  pointsDone: {
    color: "#A9A9A9",
  },
});
