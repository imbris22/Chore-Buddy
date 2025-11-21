import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import COLORS from "../theme/colors";
import Logo from "../../assets/logo.png";
import BottomArt from "../../assets/background image.png";

const BG_ART_HEIGHT = 500;

export default function CreateCircleScreen({ navigation }) {
  const [circleName, setCircleName] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleCreate = async () => {
    const trimmedName = circleName.trim();

    if (trimmedName === "") {
      Alert.alert("Error", "Please enter a circle name");
      return;
    }

    if (trimmedName.length < 3) {
      Alert.alert("Error", "Circle name must be at least 3 characters");
      return;
    }

    setIsLoading(true);

    try {
      // Check if circle name already exists
      const circlesRef = collection(db, "circles");
      const q = query(
        circlesRef,
        where("name", "==", trimmedName.toLowerCase())
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        Alert.alert(
          "Error",
          "A circle with this name already exists. Please choose a different name."
        );
        setIsLoading(false);
        return;
      }

      // Circle name is unique, proceed to WelcomeSetup
      navigation.navigate("WelcomeSetup", {
        circleCode: trimmedName,
        isNewCircle: true,
      });
    } catch (error) {
      console.error("Error checking circle name:", error);
      Alert.alert("Error", "Failed to create circle. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={s.wrap}>
      {/* Bottom Background Characters - Static */}
      <Image
        source={BottomArt}
        style={s.bgArt}
        resizeMode="contain"
        pointerEvents="none"
      />

      <KeyboardAvoidingView
        style={s.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={s.container}
          contentContainerStyle={s.content}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={s.header}>
            <View style={s.logoRow}>
              <Image source={Logo} style={s.logoImg} resizeMode="contain" />
              <Text style={s.logoText}>Chore Buddy</Text>
            </View>
          </View>

          {/* Main Content */}
          <View style={s.mainContent}>
            <Text style={s.title}>Create a Circle!</Text>
            <Text style={s.subtitle}>Choose a unique name for your circle</Text>

            {/* Create Circle Card */}
            <View style={s.card}>
              <Text style={s.cardTitle}>Circle Name</Text>

              <TextInput
                style={s.input}
                placeholder="e.g., Smith Family, Roommates"
                placeholderTextColor="#C1B6A9"
                value={circleName}
                onChangeText={setCircleName}
                maxLength={30}
                autoCapitalize="words"
                editable={!isLoading}
              />

              <Pressable
                style={({ pressed }) => [
                  s.createBtn,
                  pressed && s.createBtnPressed,
                  isLoading && s.createBtnDisabled,
                ]}
                onPress={handleCreate}
                disabled={isLoading}
              >
                <Text style={s.createBtnText}>
                  {isLoading ? "Creating..." : "Create Circle"}
                </Text>
              </Pressable>
            </View>

            {/* Back to Join Link */}
            <Pressable onPress={() => navigation.goBack()} disabled={isLoading}>
              <Text style={s.backLink}>Back to Join Circle</Text>
            </Pressable>
          </View>

          <View style={{ height: BG_ART_HEIGHT + 20 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: COLORS.bg },
  keyboardAvoid: { flex: 1, zIndex: 1 },
  container: { flex: 1 },
  content: { padding: 16, paddingBottom: 140 },

  header: {
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
    justifyContent: "center",
    width: "100%",
    height: 88,
    marginTop: 16,
    marginBottom: 32,
  },
  logoRow: { flexDirection: "row", alignItems: "center" },
  logoImg: { width: 120, height: 120, marginLeft: -16 },
  logoText: {
    color: COLORS.text,
    fontSize: 28,
    fontFamily: "Jersey",
    marginLeft: -14,
  },

  mainContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    color: COLORS.text,
    fontSize: 32,
    fontFamily: "Jersey",
    textAlign: "center",
    marginBottom: 8,
  },

  subtitle: {
    color: COLORS.text,
    fontSize: 16,
    opacity: 0.6,
    fontFamily: "Kantumruy",
    textAlign: "center",
    marginBottom: 32,
  },

  card: {
    backgroundColor: "#F7EFE3",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    marginBottom: 24,
  },

  cardTitle: {
    color: COLORS.text,
    fontSize: 20,
    fontFamily: "Jersey",
    marginBottom: 16,
  },

  input: {
    backgroundColor: COLORS.card,
    borderColor: COLORS.border,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: COLORS.text,
    fontFamily: "Kantumruy",
    marginBottom: 16,
  },

  createBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  createBtnPressed: {
    opacity: 0.8,
  },

  createBtnDisabled: {
    opacity: 0.5,
  },

  createBtnText: {
    color: COLORS.text,
    fontSize: 18,
    fontFamily: "Jersey",
  },

  backLink: {
    color: COLORS.text,
    fontSize: 16,
    fontFamily: "Kantumruy",
    textDecorationLine: "underline",
    textAlign: "center",
  },

  bgArt: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: BG_ART_HEIGHT,
    width: "100%",
    opacity: 0.5,
    zIndex: 0,
  },
});
