import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";

export default function LeaveChoreModal({
  visible = false,
  onConfirm = () => {},
  onCancel = () => {},
}) {
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
            <Text style={s.title}>Are you sure you want to leave?</Text>
            <Pressable style={s.close} hitSlop={12} onPress={onCancel}>
              <Text style={s.closeText}>×</Text>
            </Pressable>
          </View>

          <Text style={s.subText}>Your changes will be discarded.</Text>

          <Pressable style={s.primary} onPress={onConfirm}>
            <Text style={s.primaryText}>Leave</Text>
          </Pressable>

          <Pressable style={s.secondary} onPress={onCancel}>
            <Text style={s.secondaryText}>Stay</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.45)",
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
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
  header: {
    alignItems: "center",
    justifyContent: "center",
    paddingRight: 24,
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#6B5D52",
    textAlign: "center",
    fontFamily: "Jersey",
  },
  close: { position: "absolute", right: 0, top: -2, padding: 4 },
  closeText: { fontSize: 20, color: "#7B7B7B" },

  subText: {
    fontSize: 13,
    color: "#6B5D52",
    opacity: 0.8,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 14,
    fontFamily: "Kantumruy",
  },

  primary: {
    backgroundColor: "#FFC7D3",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  primaryText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#6B5D52",
    fontFamily: "Jersey",
  },
  secondary: {
    backgroundColor: "#B7E2E6",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  secondaryText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#6B5D52",
    fontFamily: "Jersey",
  },
});
