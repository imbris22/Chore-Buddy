import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ChoreBoardScreen from "../screens/ChoreBoardScreen";
import GroceryListScreen from "../screens/GroceryListScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="ChoreBoard" component={ChoreBoardScreen} options={{ headerShown: false }} />
      <Stack.Screen name="GroceryList" component={GroceryListScreen} options={{ headerShown: false }}/>
      </Stack.Navigator>
    </NavigationContainer>
  );
}
