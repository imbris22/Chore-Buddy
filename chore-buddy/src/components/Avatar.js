import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import COLORS from "../theme/colors";
import ProgressBar from "./ProgressBar";

export default function Avatar({ image, name, value = 0, max = 1 }) {
  return (
    <View style={s.wrap}>
      <View style={s.face}>
        <Image source={image} style={s.avatarImg} resizeMode="cover" />
      </View>
      <Text style={s.name}>{name}</Text>
      <ProgressBar value={value} max={max} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { width: 82, alignItems: "center" },
  face: {
    width: 58,
    height: 58,
    borderRadius: 16,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden", // ensures the image fits inside rounded corners
  },
  avatarImg: {
    width: "100%",
    height: "100%",
  },
  name: {
    color: COLORS.text,
    marginTop: 6,
    marginBottom: 6,
  },
});
