import React from "react";
import {
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  View,
  Text as RNText,
} from "react-native";
import AppNavigator from "./src/app/AppNavigator";
import { useFonts } from "expo-font";

export default function App() {
  const [fontsLoaded] = useFonts({
    Jersey: require("./assets/fonts/Jersey25-Regular.ttf"),
    Kantumruy: require("./assets/fonts/KantumruyPro-Regular.ttf"),
  });

  React.useEffect(() => {
    if (!fontsLoaded) return;
    // ensure defaultProps exists
    if (!RNText.defaultProps) RNText.defaultProps = {};
    // preserve any existing default style and set the default font
    RNText.defaultProps.style = {
      ...(RNText.defaultProps.style || {}),
      fontFamily: "Kantumruy",
    };
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="dark-content" />
      <AppNavigator />
    </SafeAreaView>
  );
}
