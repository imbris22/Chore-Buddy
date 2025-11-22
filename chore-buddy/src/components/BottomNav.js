// components/BottomNav.js
import React from "react";
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { SvgUri } from "react-native-svg";
import COLORS from "../theme/colors";

// tabs config so it’s easy to wire to real navigation later
export const TABS = [
  {
    key: "Home",
    label: "Home",
    icon: require("../../assets/nav-bar-icons/house.svg"),
  },
  {
    key: "History",
    label: "History",
    icon: require("../../assets/nav-bar-icons/history.svg"),
  },
  {
    key: "Rankings",
    label: "Rankings",
    icon: require("../../assets/nav-bar-icons/star.svg"),
  },
  {
    key: "Profile",
    label: "Profile",
    icon: require("../../assets/nav-bar-icons/user.svg"),
  },
];

export default function BottomNav({ active = "Home", onTabPress }) {
  return (
    <SafeAreaView style={s.safe} edges={["bottom"]}>
      <View style={s.bar}>
        {TABS.map((tab) => {
          const isActive = active === tab.key;   // supports null cleanly
          return (
            <Pressable
              key={tab.key}
              style={s.item}
              onPress={() => onTabPress?.(tab.key)}
            >
              <SvgUri
                width={24}
                height={24}
                uri={Image.resolveAssetSource(tab.icon).uri}
                style={[s.icon, isActive && s.iconActive]}
              />
              <Text style={[s.label, isActive && s.labelActive]}>
                {tab.label}
              </Text>
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
    backgroundColor: "#FFF8F0", // cream
    borderTopWidth: 1,
    borderTopColor: "#E8D9CC", // subtle divider
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
  label: { fontSize: 12, color: "#C6B7A6", fontFamily: "Kantumruy" },
  labelActive: { color: COLORS.text, fontWeight: "500", fontFamily: "Kantumruy" },
});
