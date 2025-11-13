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
} from "react-native";
import { useCircleStore } from "../state/circleStore";
import COLORS from "../theme/colors";
import Logo from "../../assets/logo.png";
import BottomArt from "../../assets/background image.png";

// Import avatars
import bearAvatar from "../../assets/bear.png";
import bunnyAvatar from "../../assets/bunny.png";
import pandaAvatar from "../../assets/panda.png";
import catAvatar from "../../assets/cat.png";
import dinoAvatar from "../../assets/Dino.png";
import frogAvatar from "../../assets/frog.png";
import dogAvatar from "../../assets/dog.png";
import koalaAvatar from "../../assets/koala.png";
import pigAvatar from "../../assets/pig.png";
import sheepAvatar from "../../assets/sheep.png";

const AVATARS = [
  { id: "bear", name: "Bear", image: bearAvatar },
  { id: "bunny", name: "Bunny", image: bunnyAvatar },
  { id: "panda", name: "Panda", image: pandaAvatar },
  { id: "cat", name: "Cat", image: catAvatar },
  { id: "dino", name: "Dino", image: dinoAvatar },
  { id: "frog", name: "Frog", image: frogAvatar },
  { id: "dog", name: "Dog", image: dogAvatar },
  { id: "koala", name: "Koala", image: koalaAvatar },
  { id: "pig", name: "Pig", image: pigAvatar },
  { id: "sheep", name: "Sheep", image: sheepAvatar },
];

const BG_ART_HEIGHT = 180;

export default function WelcomeSetupScreen({ navigation, route }) {
  const { circleCode } = route.params || {};
  const { setCurrentUser, members } = useCircleStore();

  const [name, setName] = React.useState("");
  const [selectedAvatar, setSelectedAvatar] = React.useState(AVATARS[0].id);

  const handleContinue = () => {
    if (name.trim() !== "") {
      // Find the selected avatar image
      const avatarObj = AVATARS.find((a) => a.id === selectedAvatar);

      // Set current user in the store
      setCurrentUser(name.trim(), avatarObj.image);

      // Navigate to ChoreBoard
      navigation.reset({
        index: 0,
        routes: [{ name: "ChoreBoard" }],
      });
    }
  };

  return (
    <View style={s.wrap}>
      <KeyboardAvoidingView
        style={s.keyboardAvoid}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
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
            <Text style={s.title}>Welcome to {circleCode}!</Text>

            {/* Name Input Card */}
            <View style={s.card}>
              <Text style={s.cardTitle}>Enter Your Name</Text>

              <TextInput
                style={s.input}
                placeholder="Your name"
                placeholderTextColor={COLORS.text}
                value={name}
                onChangeText={setName}
                maxLength={30}
              />

              {/* Avatar Selection */}
              <Text style={s.avatarTitle}>Choose an Avatar</Text>
              <Text style={s.avatarSubtitle}>Swipe to see more</Text>

              <View style={s.avatarBgContainer}>
                <View style={s.avatarRow}>
                  {AVATARS.map((avatar) => (
                    <Pressable
                      key={avatar.id}
                      style={[
                        s.avatarBox,
                        selectedAvatar === avatar.id && s.avatarBoxSelected,
                      ]}
                      onPress={() => setSelectedAvatar(avatar.id)}
                    >
                      <Image
                        source={avatar.image}
                        style={[
                          s.avatarImage,
                          selectedAvatar === avatar.id && s.avatarImageSelected,
                        ]}
                        resizeMode="contain"
                      />
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Continue Button */}
              <Pressable
                style={({ pressed }) => [
                  s.continueBtn,
                  pressed && s.continueBtnPressed,
                  !name.trim() && s.continueBtnDisabled,
                ]}
                onPress={handleContinue}
                disabled={!name.trim()}
              >
                <Text style={s.continueBtnText}>Continue</Text>
              </Pressable>
            </View>
          </View>

          <View style={{ height: BG_ART_HEIGHT + 20 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Bottom Background Characters - Static */}
      <Image
        source={BottomArt}
        style={s.bgArt}
        resizeMode="contain"
        pointerEvents="none"
      />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: COLORS.bg },
  keyboardAvoid: { flex: 1 },
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
  },

  title: {
    color: COLORS.text,
    fontSize: 28,
    fontFamily: "Jersey",
    textAlign: "center",
    marginBottom: 24,
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
    marginBottom: 24,
  },

  avatarTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontFamily: "Jersey",
    marginBottom: 4,
  },

  avatarSubtitle: {
    color: COLORS.text,
    fontSize: 12,
    opacity: 0.6,
    fontFamily: "Kantumruy",
    marginBottom: 16,
  },

  avatarBgContainer: {
    backgroundColor: "#F5E6D3",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },

  avatarRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },

  avatarBox: {
    width: 90,
    height: 90,
    backgroundColor: COLORS.card,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.border,
  },

  avatarBoxSelected: {
    width: 110,
    height: 110,
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
    opacity: 1,
  },

  avatarImage: {
    width: 70,
    height: 70,
  },

  avatarImageSelected: {
    width: 90,
    height: 90,
  },

  continueBtn: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  continueBtnPressed: {
    opacity: 0.8,
  },

  continueBtnDisabled: {
    opacity: 0.5,
  },

  continueBtnText: {
    color: COLORS.text,
    fontSize: 18,
    fontFamily: "Jersey",
  },

  bgArt: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: BG_ART_HEIGHT,
    width: "100%",
    opacity: 0.5,
  },
});
