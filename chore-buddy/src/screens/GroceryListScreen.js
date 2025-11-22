import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Image,
} from "react-native";
import { SvgUri } from "react-native-svg";
import COLORS from "../theme/colors";
import BottomNav from "../components/BottomNav";
import { useGroceryStore } from "../state/groceryStore";
const GroceryIcon = require("../../assets/shopping-bag.svg");
import Logo from "../../assets/logo.png";

const NAV_HEIGHT = 72;

export default function GroceryListScreen({ navigation }) {
  const { items, addItem, toggleItem } = useGroceryStore();
  const [text, setText] = React.useState("");

  // Set up Firestore listener
  React.useEffect(() => {
    const unsubscribe = useGroceryStore.getState().listenToFirestore();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleAdd = () => {
    if (!text.trim()) return;
    addItem(text);
    setText("");
  };

  return (
    <View style={s.wrap}>
      <ScrollView
        style={s.container}
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Chore Buddy header (same as ChoreBoard) */}
        <View style={s.header}>
          <View style={s.logoRow}>
            <Image source={Logo} style={s.logoImg} resizeMode="contain" />
            <Text style={s.logoText}>Chore Buddy</Text>
          </View>
        </View>

        <View style={s.card}>
          <View style={s.headerRow}>
            <View style={s.titleLeft}>
              <SvgUri
                width={24}
                height={24}
                uri={Image.resolveAssetSource(GroceryIcon).uri}
                style={s.headerIcon}
              />
              <Text style={s.headerTitle}>Grocery List</Text>
            </View>
            <Pressable onPress={() => navigation.goBack()}>
              <Text style={s.closeText}>×</Text>
            </Pressable>
          </View>

          <View style={s.listWrap}>
            {items.map((item) => (
              <Pressable
                key={item.id}
                style={[s.itemRow, item.done && s.itemRowDone]}
                onPress={() => toggleItem(item.id)}
              >
                <View style={[s.checkbox, item.done && s.checkboxOn]}>
                  {item.done && <Text style={s.checkMark}>✓</Text>}
                </View>
                <Text
                  style={[s.itemText, item.done && s.itemTextDone]}
                  numberOfLines={1}
                >
                  {item.title}
                </Text>
              </Pressable>
            ))}

            <View style={s.inputRow}>
              <TextInput
                value={text}
                onChangeText={setText}
                placeholder="Type new item..."
                placeholderTextColor="#C1B6A9"
                style={s.input}
                returnKeyType="done"
                onSubmitEditing={handleAdd}
              />
            </View>
          </View>

          <Pressable style={s.addBtn} onPress={handleAdd}>
            <Text style={s.addText}>+ Add Item</Text>
          </Pressable>
        </View>

        <View style={{ height: NAV_HEIGHT + 16 }} />
      </ScrollView>

      <View style={s.navWrap}>
        <BottomNav
          active={null}
          onTabPress={(key) => {
            if (key === "Home") navigation.navigate("ChoreBoard");
          }}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, backgroundColor: COLORS.bg },
  container: { flex: 1 },
  content: { paddingHorizontal: 16, paddingTop: 24, paddingBottom: 24 },

  navWrap: { position: "absolute", bottom: 0, left: 0, right: 0 },

  // same header as ChoreBoardScreen
  header: {
    backgroundColor: COLORS.secondary,
    borderRadius: 16,
    justifyContent: "center",
    width: "100%",
    height: 88,
    marginBottom: 16,
  },
  logoRow: { flexDirection: "row", alignItems: "center" },
  logoImg: { width: 120, height: 120, marginLeft: -16 },
  logoText: {
    color: COLORS.text,
    fontSize: 28,
    fontFamily: "Jersey",
    marginLeft: -14,
  },

  card: {
    backgroundColor: COLORS.bg,
    borderRadius: 0,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  titleLeft: { flexDirection: "row", alignItems: "center" },
  headerIcon: { marginRight: 6 },
  headerTitle: { fontSize: 20, color: COLORS.text, fontFamily: "Jersey" },

  // match CompleteChoreModal closeText
  closeText: { fontSize: 20, color: "#7B7B7B" },

  listWrap: { marginTop: 4, marginBottom: 10 },

  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#F0E2DE",
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
  },
  itemRowDone: { backgroundColor: "#FDE3EB" },

  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#C9BEB2",
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFF",
  },
  checkboxOn: { backgroundColor: "#FFC7D3", borderColor: "#FFC7D3" },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 2,
    backgroundColor: "#F9F3ED",
  },

  itemText: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
    fontFamily: "Kantumruy",
  },
  itemTextDone: { textDecorationLine: "line-through", opacity: 0.6 },

  inputRow: {
    marginTop: 4,
    backgroundColor: "#FFF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#F0E2DE",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  input: {
    fontSize: 15,
    color: COLORS.text,
    fontFamily: "Kantumruy",
    paddingVertical: 2,
  },

  addBtn: {
    marginTop: 10,
    backgroundColor: "#FFC7D3",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  addText: { fontSize: 18, fontFamily: "Jersey", color: COLORS.text },
});
