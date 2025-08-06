import { MaterialIcons } from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import { usePathname, useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import React from "react";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const _layout = () => {
  const router = useRouter();
  const path = usePathname();
  const CustomDrawer = (props: DrawerContentComponentProps) => {
    return (
      <View style={{ flex: 1, backgroundColor: "#f7f8fa", }}>
        <DrawerContentScrollView
          {...props}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={{ height: 1, marginHorizontal: 10 }} />
          <TouchableOpacity
            style={[
              styles.drawerItem,
              props.state.routeNames[props.state.index] === "index" &&
                styles.activeDrawerItem,
            ]}
            onPress={() => {
              requestAnimationFrame(() => {
                router.push("/(protected)");
              });
            }}
          >
            <View  style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons
                name="home"
                size={24}
                color={
                  props.state.routeNames[props.state.index] === "index"
                    ? "#0c0d6cff"
                    : "#b9c9ed"
                }
              />
              <Text style={styles.drawerItemText}>Home</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />

          <TouchableOpacity
            style={[
              styles.drawerItem,
              props.state.routeNames[props.state.index] === "attendance" &&
                styles.activeDrawerItem,
            ]}
            onPress={() => {
              requestAnimationFrame(() => {
                router.push("/(protected)/attendance");
              });
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <FontAwesome6
                name="calendar-check"
                size={24}
                color={
                  props.state.routeNames[props.state.index] === "attendance"
                    ? "#0c0d6cff"
                    : "#b9c9ed"
                }
              />
              <Text style={styles.drawerItemText}>Attendance</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />
        </DrawerContentScrollView>
      </View>
    );
  };

  return (
    <Drawer
      drawerContent={CustomDrawer}
      screenOptions={{
        freezeOnBlur: true,
        swipeEdgeWidth: Dimensions.get("window").width * 0.3,
      }}
      backBehavior="fullHistory"
    >
      <Drawer.Screen
        name="index"
        options={{
          title: "Home",
          drawerActiveTintColor: "#112990ff",
          drawerItemStyle: {
            borderRadius: 10,
          },
          drawerIcon: ({ focused }) => {
            return (
              <MaterialIcons
                name="home"
                size={24}
                color={focused ? "#0c0d6cff" : "#b9c9ed"}
              />
            );
          },
        }}
      />
      <Drawer.Screen
        name="attendance"
        options={{
          title: "Attendance",
          drawerActiveTintColor: "#112990ff",

          drawerItemStyle: {
            borderRadius: 10,
          },
          headerRight: (props) => {
            return <></>;
          },
          drawerIcon: ({ focused }) => {
            return (
              <FontAwesome6
                name="calendar-check"
                size={24}
                color={focused ? "#0c0d6cff" : "#b9c9ed"}
              />
            );
          },
        }}
      />
    </Drawer>
  );
};

export default _layout;

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    borderRadius: 10,
  },
  logo: {
    height: 50,
    width: "100%",
    resizeMode: "contain",
  },
  divider: {
    height: 1,
    marginHorizontal: 10,
  },
  drawerItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginBottom: 4,
  },
  activeDrawerItem: {
    backgroundColor: "#e8f0fe",
    borderLeftWidth: 3,
    borderLeftColor: "#11257A",
  },
  drawerItemText: {
    fontSize: 16,
    marginLeft: 10,
    color: "#333",
    fontWeight: "bold",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginBottom: 2,
  },
  sectionHeaderContent: { flexDirection: "row", alignItems: "center" },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 10,
  },
  subItem: {
    padding: 5,
    flexDirection: "row",
    alignItems: "center",
    width: 200,
    borderRadius: 8,
    marginLeft: 40,
    marginBottom: 6,
  },
  activeSubItem: {
    backgroundColor: "#e8f0fe",
    borderLeftWidth: 2,
    borderLeftColor: "#11257A",
  },
  subItemText: { fontSize: 14, color: "#11257A", marginLeft: 8 },
  bottomSection: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#e6e6e6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
