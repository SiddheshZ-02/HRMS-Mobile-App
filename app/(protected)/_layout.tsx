import { Colors } from "@/constants/Colors";
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
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

const _layout = () => {
  const router = useRouter();
  const path = usePathname();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const CustomDrawer = (props: DrawerContentComponentProps) => {
    return (
      <View style={[styles.drawerContainer, { backgroundColor: colors.background }]}>
        <DrawerContentScrollView
          {...props}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <View style={[styles.header, { padding: 20 }]}>
            <Image
              source={require("@/assets/images/actifylogo.png")}
              style={styles.logo}
            />

            <Text
              style={[styles.headerTitle, { color: colors.textPrimary }]}
            >
              HR PORTAL
            </Text>
          </View>

          <View style={[styles.divider,]} />
          
          <TouchableOpacity
            style={[
              styles.drawerItem,
              props.state.routeNames[props.state.index] === "index" &&
                [styles.activeDrawerItem, { 
                  backgroundColor: colors.surfaceVariant,
                  borderLeftColor: colors.primary 
                }],
            ]}
            onPress={() => {
              requestAnimationFrame(() => {
                router.push("/(protected)");
              });
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <MaterialIcons
                name="home"
                size={24}
                color={
                  props.state.routeNames[props.state.index] === "index"
                    ? colors.primary
                    : colors.textTertiary
                }
              />
              <Text style={[styles.drawerItemText, { color: colors.textPrimary }]}>Home</Text>
            </View>
          </TouchableOpacity>
          
          <View style={[styles.divider,]} />

          <TouchableOpacity
            style={[
              styles.drawerItem,
              props.state.routeNames[props.state.index] === "attendance" &&
                [styles.activeDrawerItem, { 
                  backgroundColor: colors.surfaceVariant,
                  borderLeftColor: colors.primary 
                }],
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
                    ? colors.primary
                    : colors.textTertiary
                }
              />
              <Text style={[styles.drawerItemText, { color: colors.textPrimary }]}>Attendance</Text>
            </View>
          </TouchableOpacity>

          <View style={[styles.divider]} />
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
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.textPrimary,
        drawerStyle: { backgroundColor: colors.background },
        drawerActiveTintColor: colors.primary,
        drawerInactiveTintColor: colors.textTertiary,
      }}
      backBehavior="fullHistory"
    >
      <Drawer.Screen
        name="index"
        options={{
          title: "Home",
          drawerActiveTintColor: colors.primary,
          drawerItemStyle: {
            borderRadius: 10,
          },
          drawerIcon: ({ focused }) => {
            return (
              <MaterialIcons
                name="home"
                size={24}
                color={focused ? colors.primary : colors.textTertiary}
              />
            );
          },
        }}
      />
      <Drawer.Screen
        name="attendance"
        options={{
          title: "Attendance",
          drawerActiveTintColor: colors.primary,
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
                color={focused ? colors.primary : colors.textTertiary}
              />
            );
          },
        }}
      />
      <Drawer.Screen
        name="meetingLists"
        options={{
          title: "Meeting Lists",
          drawerActiveTintColor: colors.primary,
          drawerItemStyle: {
            borderRadius: 10,
          },
          headerRight: (props) => {
            return <></>;
          },
          // drawerIcon: ({ focused }) => {
          //   return (
          //     <FontAwesome6
          //       name="calendar-check"
          //       size={24}
          //       color={focused ? "#0c0d6cff" : "#b9c9ed"}
          //     />
          //   );
          // },
        }}
      />
      <Drawer.Screen
        name="createMeeting"
        options={{
          title: "Create Meeting",
          drawerActiveTintColor: colors.primary,
          drawerItemStyle: {
            borderRadius: 10,
          },
          headerRight: (props) => {
            return <></>;
          },
          // drawerIcon: ({ focused }) => {
          //   return (
          //     <FontAwesome6
          //       name="calendar-check"
          //       size={24}
          //       color={focused ? "#0c0d6cff" : "#b9c9ed"}
          //     />
          //   );
          // },
        }}
      />
    </Drawer>
  );
};

export default _layout;

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    borderRadius: 10,
  },
  logo: {
    height: 50,
    width: "100%",
    resizeMode: "contain",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 4,
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
    borderLeftWidth: 3,
  },
  drawerItemText: {
    fontSize: 16,
    marginLeft: 10,
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
  sectionHeaderContent: { 
    flexDirection: "row", 
    alignItems: "center" 
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
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
    borderLeftWidth: 2,
  },
  subItemText: { 
    fontSize: 14, 
    marginLeft: 8 
  },
  bottomSection: {
    padding: 10,
    // borderTopWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
