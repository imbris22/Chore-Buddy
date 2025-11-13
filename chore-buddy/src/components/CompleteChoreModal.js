import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";

export default function CompleteChoreModal({
  visible = false,
  choreName = "",
  points = 1,
  onConfirm = () => {},
  onCancel = () => {},
}) {
  // use points directly as difficulty
  const level = Math.min(5, Math.max(1, Number.isFinite(points) ? points : 1));
  const dots = Array.from({ length: 5 }, (_, i) => i < level);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={s.backdrop} />
      </TouchableWithoutFeedback>

      <View style={s.center} pointerEvents="box-none">
        <View style={s.card}>
          <View style={s.header}>
            <Text style={s.title}>Complete Chore?</Text>
            <Pressable style={s.close} hitSlop={12} onPress={onCancel}>
              <Text style={s.closeText}>×</Text>
            </Pressable>
          </View>

          <View style={s.choreBox}>
            <Text style={s.choreName}>{choreName}</Text>

            <View style={s.dotsRow}>
              {dots.map((on, i) => (
                <View
                  key={i}
                  style={[s.dot, on ? s.dotOn : s.dotOff, i < 4 && s.dotSpacer]}
                />
              ))}
            </View>

            <Text style={s.pointsText}>
              You’ll earn <Text style={s.pointsNum}>{points}</Text> points
            </Text>
          </View>

          <Pressable style={s.primary} onPress={onConfirm}>
            <Text style={s.primaryText}>Mark Complete</Text>
          </Pressable>

          <Pressable style={s.secondary} onPress={onCancel}>
            <Text style={s.secondaryText}>Cancel</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.45)" },
  center: { ...StyleSheet.absoluteFillObject, justifyContent: "center", alignItems: "center", padding: 20 },
  card: {
    width: "100%",
    maxWidth: 460,
    backgroundColor: "#FFFBF5",
    borderRadius: 16,
    padding: 16,
    borderColor: "#F0E2DE",
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  header: { alignItems: "center", justifyContent: "center", paddingRight: 24, marginBottom: 6 },
  title: { fontSize: 24, fontWeight: "700", color: "#6B5D52", textAlign: "center", fontFamily: "Jersey" },
  close: { position: "absolute", right: 0, top: -2, padding: 4 },
  closeText: { fontSize: 20, color: "#7B7B7B" },

  choreBox: {
    backgroundColor: "#FFF",
    borderColor: "#F0E2DE",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: "center",
    marginVertical: 10,
  },
  choreName: { fontSize: 20, fontWeight: "700", color: "#6B5D52", marginBottom: 8, fontFamily: "Jersey" },

  dotsRow: { flexDirection: "row", marginBottom: 10 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotSpacer: { marginRight: 8 },
  dotOn: { backgroundColor: "#FFC7D3" },
  dotOff: { backgroundColor: "#F3DDE1" },

  pointsText: { fontSize: 14, color: "#6B5D52", fontFamily: "Kantumruy"},
  pointsNum: { fontWeight: "700", color: "#CC5C6C" },

  primary: { backgroundColor: "#FFC7D3", borderRadius: 12, paddingVertical: 12, alignItems: "center", marginTop: 8 },
  primaryText: { fontSize: 18, fontWeight: "700", color: "#6B5D52", fontFamily: "Jersey" },
  secondary: { backgroundColor: "#B7E2E6", borderRadius: 12, paddingVertical: 12, alignItems: "center", marginTop: 10 },
  secondaryText: { fontSize: 18, fontWeight: "700", color: "#6B5D52", fontFamily: "Jersey" },
});
