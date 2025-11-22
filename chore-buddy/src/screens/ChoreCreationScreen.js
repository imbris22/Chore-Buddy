import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  Pressable,
  TextInput,
} from "react-native";
import { SvgUri } from "react-native-svg";
import Slider from "@react-native-community/slider";
import COLORS from "../theme/colors";
import BottomNav from "../components/BottomNav";
import { useTasksStore } from "../state/tasksStore";
import { useCircleStore } from "../state/circleStore";
import { currentWeek } from "../lib/cycle";
import LeaveChoreModal from "../components/LeaveChoreModal";

import Logo from "../../assets/logo.png";
const TrashIcon = require("../../assets/chore-icons/trash-2.svg");
const BrushIcon = require("../../assets/chore-icons/brush-cleaning.svg");
const UtensilsIcon = require("../../assets/chore-icons/utensils.svg");
const BasketIcon = require("../../assets/chore-icons/shopping-basket.svg");

const NAV_HEIGHT = 72;

export default function AddChoreScreen({ navigation }) {
  const [name, setName] = React.useState("");
  const [difficulty, setDifficulty] = React.useState(3);
  const [frequency, setFrequency] = React.useState(null); // "daily" | "weekly" | "monthly"
  const [recurring, setRecurring] = React.useState(false);
  const [assignToMe, setAssignToMe] = React.useState(false);
  const [iconKey, setIconKey] = React.useState(null); // "trash" | "brush" | "utensils" | "basket"

  const [isDirty, setIsDirty] = React.useState(false);
  const [showLeaveModal, setShowLeaveModal] = React.useState(false);
  const [pendingAction, setPendingAction] = React.useState(null);

  // Use separate selectors so each snapshot is simple and stable
  const addChore = useTasksStore((s) => s.addChore);
  const assignments = useTasksStore((s) => s.assignments);
  const upsertAssignments = useTasksStore((s) => s.upsertAssignments);

  const { currentUserId, circleId } = useCircleStore();

  const iconSourceByKey = {
    trash: Image.resolveAssetSource(TrashIcon).uri,
    brush: Image.resolveAssetSource(BrushIcon).uri,
    utensils: Image.resolveAssetSource(UtensilsIcon).uri,
    basket: Image.resolveAssetSource(BasketIcon).uri,
  };

  const markDirty = () => {
    if (!isDirty) setIsDirty(true);
  };

  const requestLeave = (action) => {
    setPendingAction(() => action);
    setShowLeaveModal(true);
  };

  const handleClosePress = () => {
    if (!isDirty) {
      return navigation.goBack();
    }
    requestLeave(() => navigation.goBack());
  };

  const handleTabPress = (key) => {
    const doNav = () => {
      if (key === "History") return navigation.navigate("History");
      if (key === "Home") return navigation.navigate("ChoreBoard");
      if (key === "Rankings") return navigation.navigate("Rankings");
      if (key === "Profile") return navigation.navigate("Profile");
    };

    if (!isDirty) {
      return doNav();
    }
    requestLeave(doNav);
  };

  const handleCreate = () => {
    if (!name.trim() || !iconKey) return;

    const id = `ch_${Date.now()}`;
    const newChore = {
      id,
      title: name.trim(),
      points: difficulty,
      recurring,
      frequency, // stored in the task store
      iconKey: iconKey, // Store the key, not the URI
    };

    // 1) add the chore itself
    addChore(newChore, circleId);

    // 2) optionally assign it to the current user for this week
    if (assignToMe && currentUserId) {
      const cycleKey = new Date().toISOString().split("T")[0]; // Match format used in ChoreBoardScreen
      const existingMap = assignments[cycleKey] || {};

      upsertAssignments(
        cycleKey,
        {
          ...existingMap,
          [id]: currentUserId,
        },
        circleId
      );
    }

    navigation.goBack();
  };

  const handleConfirmLeave = () => {
    setShowLeaveModal(false);
    const action = pendingAction;
    setPendingAction(null);
    if (action) {
      action();
    }
  };

  const handleCancelLeave = () => {
    setShowLeaveModal(false);
    setPendingAction(null);
  };

  return (
    <View style={s.wrap}>
      <ScrollView
        style={s.container}
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={s.header}>
          <View style={s.headerRow}>
            <View style={s.logoRow}>
              <Image source={Logo} style={s.logoImg} resizeMode="contain" />
              <Text style={s.logoText}>Chore Buddy</Text>
            </View>
          </View>
        </View>

        {/* Title */}
        <View style={s.titleRow}>
          <Text style={s.headerTitle}>Add New Chore</Text>
          <Pressable onPress={handleClosePress} style={s.closeBtn}>
            <Text style={s.closeText}>✕</Text>
          </Pressable>
        </View>
        <Text style={s.subtitle}>Create a new chore for your circle</Text>

        {/* Chore Name */}
        <Text style={s.label}>Chore Name</Text>
        <View style={s.inputWrap}>
          <TextInput
            style={s.input}
            placeholder="e.g., Wash the dishes"
            placeholderTextColor="rgba(74, 55, 38, 0.4)"
            value={name}
            onChangeText={(text) => {
              markDirty();
              setName(text);
            }}
          />
        </View>

        {/* Choose Icon */}
        <Text style={s.label}>Choose Icon</Text>
        <View style={s.iconRow}>
          <IconButton
            selected={iconKey === "trash"}
            onPress={() => {
              markDirty();
              setIconKey("trash");
            }}
            icon={TrashIcon}
          />
          <IconButton
            selected={iconKey === "brush"}
            onPress={() => {
              markDirty();
              setIconKey("brush");
            }}
            icon={BrushIcon}
          />
          <IconButton
            selected={iconKey === "utensils"}
            onPress={() => {
              markDirty();
              setIconKey("utensils");
            }}
            icon={UtensilsIcon}
          />
          <IconButton
            selected={iconKey === "basket"}
            onPress={() => {
              markDirty();
              setIconKey("basket");
            }}
            icon={BasketIcon}
          />
        </View>

        {/* Difficulty */}
        <Text style={s.label}>Difficulty</Text>
        <View style={s.difficultyCard}>
          <Slider
            style={s.slider}
            minimumValue={1}
            maximumValue={5}
            step={1}
            value={difficulty}
            onValueChange={(v) => {
              markDirty();
              setDifficulty(v);
            }}
            minimumTrackTintColor="#FFC7D3"
            maximumTrackTintColor="#F3C99A"
            thumbTintColor="#FFFFFF"
          />
          <View style={s.difficultyLabels}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Text key={n} style={s.difficultyNumber}>
                {n}
              </Text>
            ))}
          </View>
        </View>

        {/* Frequency */}
        <Text style={s.label}>Frequency</Text>
        <View style={s.freqRow}>
          <TogglePill
            label="Daily"
            active={frequency === "daily"}
            onPress={() => {
              markDirty();
              setFrequency("daily");
            }}
          />
          <TogglePill
            label="Weekly"
            active={frequency === "weekly"}
            onPress={() => {
              markDirty();
              setFrequency("weekly");
            }}
          />
          <TogglePill
            label="Monthly"
            active={frequency === "monthly"}
            onPress={() => {
              markDirty();
              setFrequency("monthly");
            }}
          />
        </View>

        {/* Checkboxes */}
        <View style={s.checkboxRow}>
          <Checkbox
            checked={recurring}
            onPress={() => {
              markDirty();
              setRecurring((v) => !v);
            }}
          />
          <Text style={s.checkboxLabel}>Recurring chore</Text>
        </View>
        <View style={s.checkboxRow}>
          <Checkbox
            checked={assignToMe}
            onPress={() => {
              markDirty();
              setAssignToMe((v) => !v);
            }}
          />
          <Text style={s.checkboxLabel}>Assign to me</Text>
        </View>

        {/* Create button */}
        <Pressable
          style={[
            s.createBtn,
            (!name.trim() || !iconKey) && s.createBtnDisabled,
          ]}
          onPress={handleCreate}
          disabled={!name.trim() || !iconKey}
        >
          <Text
            style={[
              s.createText,
              (!name.trim() || !iconKey) && s.createTextDisabled,
            ]}
          >
            Create Chore
          </Text>
        </Pressable>

        <View style={{ height: 20 }} />
      </ScrollView>

      {/* Bottom nav */}
      <View style={s.navWrap}>
        <BottomNav active="Home" onTabPress={handleTabPress} />
      </View>

      <LeaveChoreModal
        visible={showLeaveModal}
        onConfirm={handleConfirmLeave}
        onCancel={handleCancelLeave}
      />
    </View>
  );
}

function IconButton({ selected, onPress, icon }) {
  return (
    <Pressable
      onPress={onPress}
      style={[s.iconBtn, selected && s.iconBtnSelected]}
    >
      <SvgUri width={30} height={30} uri={Image.resolveAssetSource(icon).uri} />
    </Pressable>
  );
}

function TogglePill({ label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={[s.freqPill, active && s.freqPillActive]}
    >
      <Text style={[s.freqText, active && s.freqTextActive]}>{label}</Text>
    </Pressable>
  );
}

function Checkbox({ checked, onPress }) {
  return (
    <Pressable onPress={onPress} style={s.checkboxBox}>
      {checked ? <View style={s.checkboxInner} /> : null}
    </Pressable>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 140 },

  header: {
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
    justifyContent: "center",
    width: "100%",
    height: 88,
    marginTop: 16,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingRight: 12,
  },
  logoRow: { flexDirection: "row", alignItems: "center" },
  logoImg: { width: 120, height: 120, marginLeft: -16 },
  logoText: {
    color: COLORS.text,
    fontSize: 28,
    fontFamily: "Jersey",
    marginLeft: -14,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: "Jersey",
    color: COLORS.text,
  },
  closeBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },

  closeText: {
    fontSize: 20,
    color: COLORS.text,
    fontFamily: "Kantumruy",
  },

  title: {
    fontSize: 22,
    color: COLORS.text,
    fontFamily: "Jersey",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.text,
    opacity: 0.7,
    marginBottom: 16,
    fontFamily: "Kantumruy",
  },

  label: {
    marginTop: 12,
    marginBottom: 6,
    color: COLORS.text,
    fontSize: 15,
    fontFamily: "Jersey",
  },

  inputWrap: {
    backgroundColor: "#FFF7ED",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  input: {
    fontFamily: "Kantumruy",
    fontSize: 14,
    color: COLORS.text,
    padding: 0,
  },

  iconRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  iconBtn: {
    flex: 1,
    height: 72,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnSelected: {
    borderColor: "#FFC7D3",
    backgroundColor: "#FFE4ED",
  },

  difficultyCard: {
    backgroundColor: "#FFF7ED",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  slider: {
    width: "100%",
    height: 32,
  },
  difficultyLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  difficultyNumber: {
    fontFamily: "Kantumruy",
    fontSize: 12,
    color: COLORS.text,
    opacity: 0.8,
  },

  freqRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  freqPill: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  freqPillActive: {
    backgroundColor: "#FFE4ED",
    borderColor: "#FFC7D3",
  },
  freqText: {
    fontFamily: "Jersey",
    fontSize: 16,
    color: COLORS.text,
  },
  freqTextActive: {
    opacity: 1,
  },

  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  checkboxBox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.15)",
    backgroundColor: "#FFF7ED",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  checkboxInner: {
    width: 14,
    height: 14,
    borderRadius: 4,
    backgroundColor: "#FFC7D3",
  },
  checkboxLabel: {
    fontFamily: "Kantumruy",
    fontSize: 14,
    color: COLORS.text,
  },

  createBtn: {
    marginTop: 24,
    backgroundColor: "#FFC7D3",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  createBtnDisabled: {
    backgroundColor: "#E8D9CC",
    opacity: 0.5,
  },
  createText: {
    fontFamily: "Jersey",
    fontSize: 20,
    color: COLORS.text,
  },
  createTextDisabled: {
    opacity: 0.7,
  },

  navWrap: { position: "absolute", bottom: 0, left: 0, right: 0 },
});
