import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import COLORS from "../theme/colors";
import ProgressBar from "./ProgressBar";

export default function Avatar({
  image,
  name,
  value = 0,
  max = 1,
  imageOffsetY = 0, // move the sticker up/down inside the fixed box
  imageOffsetX = 0, // optional: left/right nudge
  imageScale = 1,
}) {
  return (
    <View style={s.wrap}>
      <View style={s.stickerBox}>
        <Image
          source={image}
          style={[
            s.sticker,
            {
              transform: [
                { translateY: imageOffsetY },
                { translateX: imageOffsetX },
                { scale: imageScale },
              ],
            },
          ]}
          resizeMode="contain"
        />
      </View>
      <Text style={s.name}>{name}</Text>
      <View style={s.bar}>
        <ProgressBar value={value} max={max} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  // width handled by parent grid; just center
  wrap: { alignItems: "center" },

  // fixed square ensures identical centering regardless of PNG padding
  stickerBox: {
    width: 86,
    height: 86,
    alignItems: "center",
    justifyContent: "center",
  },
  sticker: { width: 120, height: 120 },

  name: {
    fontSize: 14,
    color: COLORS.text,
    marginTop: 4,
    marginBottom: 4,
    fontFamily: "Inter_500Medium",
    textAlign: "center",
  },

  // narrow bar under each avatar
  bar: { width: 72 },
});
