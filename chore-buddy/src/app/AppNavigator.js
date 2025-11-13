import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ChoreBoardScreen from "../screens/ChoreBoardScreen";
import JoinCircleScreen from "../screens/JoinCircleScreen";
import WelcomeSetupScreen from "../screens/WelcomeSetupScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName="ChoreBoard"
      >
        <Stack.Screen name="JoinCircle" component={JoinCircleScreen} />
        <Stack.Screen name="WelcomeSetup" component={WelcomeSetupScreen} />
        <Stack.Screen name="ChoreBoard" component={ChoreBoardScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
