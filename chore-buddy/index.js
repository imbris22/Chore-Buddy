import { registerRootComponent } from "expo";
import App from "./App";
import { Text as RNText } from "react-native";

// ensure Text default uses the loaded font key (must match useFonts key in App.js)
if (!RNText.defaultProps) RNText.defaultProps = {};
RNText.defaultProps.style = {
  ...(RNText.defaultProps.style || {}),
  fontFamily: "Kantumruy",
};

registerRootComponent(App);
