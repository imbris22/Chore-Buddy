import React from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";

export default function LeaveCircleModal({
  visible = false,
  circleName = "",
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
            <Text style={s.title}>Leave Circle?</Text>
            <Pressable style={s.close} hitSlop={12} onPress={onCancel}>
              <Text style={s.closeText}>×</Text>
            </Pressable>
          </View>

          <View style={s.circleBox}>
            <Text style={s.circleName}>{circleName}</Text>
            <Text style={s.warningText}>
              You will lose access to all circle data and your chores will be discarded.
            </Text>
          </View>

          <Pressable style={s.primary} onPress={onConfirm}>
            <Text style={s.primaryText}>Leave Circle</Text>
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
    marginBottom: 6,
  },
  title: {
    fontSize: 24,
    color: "#6B5D52",
    textAlign: "center",
    fontFamily: "Jersey",
  },
  close: { position: "absolute", right: 0, top: -2, padding: 4 },
  closeText: { fontSize: 20, color: "#7B7B7B" },

  circleBox: {
    backgroundColor: "#FFF",
    borderColor: "#F0E2DE",
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 16,
    alignItems: "center",
    marginVertical: 10,
  },
  circleName: {
    fontSize: 20,
    color: "#6B5D52",
    marginBottom: 12,
    fontFamily: "Jersey",
  },
  warningText: {
    fontSize: 14,
    color: "#6B5D52",
    fontFamily: "Kantumruy",
    textAlign: "center",
    lineHeight: 20,
  },

  primary: {
    backgroundColor: "#FFC7D3",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 8,
  },
  primaryText: { fontSize: 18, color: "#6B5D52", fontFamily: "Jersey" },
  secondary: {
    backgroundColor: "#B7E2E6",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 10,
  },
  secondaryText: { fontSize: 18, color: "#6B5D52", fontFamily: "Jersey" },
});
