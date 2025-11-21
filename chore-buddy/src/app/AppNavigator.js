import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import ChoreBoardScreen from "../screens/ChoreBoardScreen";
import GroceryListScreen from "../screens/GroceryListScreen";
import HistoryScreen from "../screens/HistoryScreen";
import JoinCircleScreen from "../screens/JoinCircleScreen";
import WelcomeSetupScreen from "../screens/WelcomeSetupScreen";
import RankingsScreen from "../screens/RankingsScreen";
import ProfileScreen from "../screens/ProfileScreen";
import ChoreCreation from "../screens/ChoreCreationScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [initialRoute, setInitialRoute] = React.useState("JoinCircle");
  const [isReady, setIsReady] = React.useState(false);

  React.useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      try {
        const { useCircleStore } = await import("../state/circleStore");
        const currentUserId = useCircleStore.getState().currentUserId;

        // If user has a currentUserId, skip to ChoreBoard
        if (currentUserId && currentUserId !== "m_alex") {
          setInitialRoute("ChoreBoard");
        }
      } catch (error) {
        console.error("Error checking user:", error);
      } finally {
        setIsReady(true);
      }
    };

    checkUser();
  }, []);

  if (!isReady) {
    return null; // or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
        initialRouteName={initialRoute}
      >
        <Stack.Screen name="JoinCircle" component={JoinCircleScreen} />
        <Stack.Screen name="WelcomeSetup" component={WelcomeSetupScreen} />
        <Stack.Screen name="ChoreBoard" component={ChoreBoardScreen} />
        <Stack.Screen name="ChoreCreation" component={ChoreCreation} />
        <Stack.Screen name="History" component={HistoryScreen} />
        <Stack.Screen
          name="GroceryList"
          component={GroceryListScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Rankings"
          component={RankingsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
