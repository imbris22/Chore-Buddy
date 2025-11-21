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

export default function JoinCircleScreen({ navigation }) {
  const [circleCode, setCircleCode] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);

  const handleJoin = async () => {
    const trimmedCode = circleCode.trim();

    if (trimmedCode === "") {
      Alert.alert("Error", "Please enter a circle code");
      return;
    }

    setIsLoading(true);

    try {
      // Check if circle exists
      const circlesRef = collection(db, "circles");
      const q = query(
        circlesRef,
        where("name", "==", trimmedCode.toLowerCase())
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert(
          "Error",
          "Circle not found. Please check the name or create a new circle."
        );
        setIsLoading(false);
        return;
      }

      // Circle exists, proceed to welcome setup
      navigation.navigate("WelcomeSetup", {
        circleCode: trimmedCode,
        isNewCircle: false,
      });
    } catch (error) {
      console.error("Error checking circle:", error);
      Alert.alert("Error", "Failed to join circle. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCircle = () => {
    navigation.navigate("CreateCircle");
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
            <Text style={s.title}>Join a Circle!</Text>
            <Text style={s.subtitle}>
              Enter your circle name to get started
            </Text>

            {/* Join Circle Card */}
            <View style={s.card}>
              <Text style={s.cardTitle}>Enter Name</Text>

              <TextInput
                style={s.input}
                placeholder="Circle Name"
                placeholderTextColor={COLORS.text}
                value={circleCode}
                onChangeText={setCircleCode}
                maxLength={20}
              />

              <Pressable
                style={({ pressed }) => [
                  s.joinBtn,
                  pressed && s.joinBtnPressed,
                  isLoading && s.joinBtnDisabled,
                ]}
                onPress={handleJoin}
                disabled={isLoading}
              >
                <Text style={s.joinBtnText}>
                  {isLoading ? "Joining..." : "Join"}
                </Text>
              </Pressable>
            </View>

            {/* Create Circle Link */}
            <Pressable onPress={handleCreateCircle}>
              <Text style={s.createLink}>Create a New Circle</Text>
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

  joinBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  joinBtnPressed: {
    opacity: 0.8,
  },

  joinBtnDisabled: {
    opacity: 0.5,
  },

  joinBtnText: {
    color: COLORS.text,
    fontSize: 18,
    fontFamily: "Jersey",
  },

  createLink: {
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
