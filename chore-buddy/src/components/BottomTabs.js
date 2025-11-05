// components/BottomNav.js
import React from "react";
import { View, Text, Image, Pressable, StyleSheet, SafeAreaView } from "react-native";
import COLORS from "../theme/colors";

// tabs config so it’s easy to wire to real navigation later
export const TABS = [
  { key: "Home",     label: "Home",     icon: "home" },
  { key: "History",  label: "History",  icon: "hist" },
  { key: "Rankings", label: "Rankings", icon: "star" },
  { key: "Profile",  label: "Profile",  icon: "prof" },
];

export default function BottomNav({ active = "Home", onTabPress }) {
  return (
    <SafeAreaView style={s.safe} edges={["bottom"]}>
      <View style={s.bar}>
        {TABS.map(tab => {
          const isActive = tab.key === active;
          return (
            <Pressable
              key={tab.key}
              style={s.item}
              // When you add navigation later, pass onTabPress={(k)=>navigation.navigate(k)}
              onPress={() => onTabPress?.(tab.key)}
            >
              <Image
                source={tab.icon}
                style={[s.icon, isActive && s.iconActive]}
                resizeMode="contain"
              />
              <Text style={[s.label, isActive && s.labelActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { backgroundColor: "#FFF8F0" },
  bar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 72,
    backgroundColor: "#FFF8F0",                 // cream
    borderTopWidth: 1,
    borderTopColor: "#E8D9CC",                  // subtle divider
    shadowColor: "#BFAE9C",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
    paddingBottom: 6,
    paddingTop: 6,
  },
  item: { alignItems: "center", gap: 4, width: 80 },
  icon: { width: 24, height: 24, opacity: 0.55 },
  iconActive: { opacity: 1 },
  label: { fontSize: 12, color: "#C6B7A6" },
  labelActive: { color: COLORS.text, fontWeight: "500" }, // brown active
});
