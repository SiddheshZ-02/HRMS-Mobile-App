import { Colors } from "@/constants/Colors";
import {
  Entypo,
  FontAwesome5,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from "@react-navigation/drawer";
import { usePathname, useRouter } from "expo-router";
import { Drawer } from "expo-router/drawer";
import React, { useEffect, useState } from "react";
import {
  Appearance,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import Collapsible from "react-native-collapsible";
import { toast, ToastPosition } from "@backpackapp-io/react-native-toast";
import useAuthStore from "@/store/AuthStore";
import { en, registerTranslation } from "react-native-paper-dates";

registerTranslation("en", en);

const _layout = () => {
  const [isLeavesCollaps, setIsLeavesCollaps] = useState(true);
  const [isWFHCollaps, setIsWFHCollaps] = useState(true);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const path = usePathname();
  const systemColorScheme = useColorScheme();
  const [theme, setTheme] = useState(systemColorScheme ?? "light");
  const colors = Colors[theme];

  const { logout, companyId, accessToken } = useAuthStore();

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem("theme");
        if (savedTheme) {
          setTheme(savedTheme);
          Appearance.setColorScheme(savedTheme);
        } else {
          setTheme(systemColorScheme ?? "light");
          Appearance.setColorScheme(systemColorScheme);
        }
      } catch (error) {
        console.error("Failed to load theme from AsyncStorage:", error);
      }
    };
    loadTheme();
  }, [systemColorScheme]);

  const toggleTheme = async () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    try {
      await AsyncStorage.setItem("theme", newTheme);
      setTheme(newTheme);
      Appearance.setColorScheme(newTheme);
    } catch (error) {
      console.error("Failed to save theme to AsyncStorage:", error);
    }
  };

  const handleLogout = () => {
    // console.log("Logging out, Access Token was:", accessToken);

    if (!isRedirecting) {
      setIsRedirecting(true);
      logout();
      router.replace("/");
    }
  };

  const CustomDrawer = (props: DrawerContentComponentProps) => {
    return (
      <View
        style={[styles.drawerContainer, { backgroundColor: colors.background }]}
      >
        <DrawerContentScrollView
          {...props}
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "space-between",
          }}
        >
          <View>
            <View style={[styles.header, { padding: 20 }]}>
              <Image
                source={require("@/assets/images/actifylogo.png")}
                style={styles.logo}
              />
              <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>
                HR PORTAL
              </Text>
            </View>

            <View style={[styles.divider]} />

            <TouchableOpacity
              style={[
                styles.drawerItem,
                props.state.routeNames[props.state.index] === "index" && [
                  styles.activeDrawerItem,
                  {
                    backgroundColor: colors.surfaceVariant,
                    borderLeftColor: colors.primary,
                  },
                ],
              ]}
              onPress={() => {
                requestAnimationFrame(() => {
                  router.push("/(protected)");
                  setIsLeavesCollaps(true);
                  setIsWFHCollaps(true);
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
                <Text
                  style={[styles.drawerItemText, { color: colors.textPrimary }]}
                >
                  Home
                </Text>
              </View>
            </TouchableOpacity>

            <View style={[styles.divider]} />

            <TouchableOpacity
              style={[
                styles.drawerItem,
                props.state.routeNames[props.state.index] === "attendance" && [
                  styles.activeDrawerItem,
                  {
                    backgroundColor: colors.surfaceVariant,
                    borderLeftColor: colors.primary,
                  },
                ],
              ]}
              onPress={() => {
                requestAnimationFrame(() => {
                  router.push("/(protected)/attendance");
                  setIsLeavesCollaps(true);
                  setIsWFHCollaps(true);
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
                <Text
                  style={[styles.drawerItemText, { color: colors.textPrimary }]}
                >
                  Attendance
                </Text>
              </View>
            </TouchableOpacity>

            <View style={[styles.divider]} />

            <TouchableOpacity
              style={[styles.sectionHeader, { borderColor: colors.border }]}
              onPress={() => {
                requestAnimationFrame(() => {
                  setIsLeavesCollaps(!isLeavesCollaps);
                  setIsWFHCollaps(true);
                });
              }}
            >
              <View style={styles.sectionHeaderContent}>
                <FontAwesome5
                  name="umbrella-beach"
                  size={24}
                  color={isLeavesCollaps ? colors.textTertiary : colors.primary}
                />
                <Text
                  style={[styles.sectionTitle, { color: colors.textPrimary }]}
                >
                  Leave
                </Text>
              </View>
              <MaterialIcons
                name={isLeavesCollaps ? "expand-more" : "expand-less"}
                size={24}
                color={colors.textTertiary}
              />
            </TouchableOpacity>
            <Collapsible collapsed={isLeavesCollaps}>
              <TouchableOpacity
                style={[
                  styles.subItem,
                  path === "/holidayLists" && [
                    styles.activeSubItem,
                    {
                      backgroundColor: colors.surfaceVariant,
                      borderLeftColor: colors.primary,
                    },
                  ],
                ]}
                onPress={() => {
                  requestAnimationFrame(() => {
                    router.push("/(protected)/holidayLists");
                  });
                }}
              >
                <MaterialIcons
                  name="view-list"
                  size={22}
                  color={
                    path === "/holidayLists"
                      ? colors.primary
                      : colors.textTertiary
                  }
                />
                <Text
                  style={[styles.subItemText, { color: colors.textPrimary }]}
                >
                  List Of Holidays
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.subItem,
                  path === "/applyLeave" && [
                    styles.activeSubItem,
                    {
                      backgroundColor: colors.surfaceVariant,
                      borderLeftColor: colors.primary,
                    },
                  ],
                ]}
                onPress={() => {
                  requestAnimationFrame(() => {
                    router.push("/(protected)/applyLeave");
                  });
                }}
              >
                <MaterialCommunityIcons
                  name="airplane-takeoff"
                  size={22}
                  color={
                    path === "/applyLeave"
                      ? colors.primary
                      : colors.textTertiary
                  }
                />
                <Text
                  style={[styles.subItemText, { color: colors.textPrimary }]}
                >
                  Apply Leave
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.subItem,
                  path === "/myLeaves" && [
                    styles.activeSubItem,
                    {
                      backgroundColor: colors.surfaceVariant,
                      borderLeftColor: colors.primary,
                    },
                  ],
                ]}
                onPress={() => {
                  requestAnimationFrame(() => {
                    router.push("/(protected)/myLeaves");
                  });
                }}
              >
                <FontAwesome5
                  name="calendar-day"
                  size={22}
                  color={
                    path === "/myLeaves" ? colors.primary : colors.textTertiary
                  }
                />
                <Text
                  style={[styles.subItemText, { color: colors.textPrimary }]}
                >
                  My Leave
                </Text>
              </TouchableOpacity>
            </Collapsible>

            <TouchableOpacity
              style={[styles.sectionHeader, { borderColor: colors.border }]}
              onPress={() => {
                requestAnimationFrame(() => {
                  setIsWFHCollaps(!isWFHCollaps);
                  setIsLeavesCollaps(true);
                });
              }}
            >
              <View style={styles.sectionHeaderContent}>
                <Entypo
                  name="add-to-list"
                  size={24}
                  color={isWFHCollaps ? colors.textTertiary : colors.primary}
                />
                <Text
                  style={[styles.sectionTitle, { color: colors.textPrimary }]}
                >
                  Apply WFH
                </Text>
              </View>
              <MaterialIcons
                name={isWFHCollaps ? "expand-more" : "expand-less"}
                size={24}
                color={colors.textTertiary}
              />
            </TouchableOpacity>
            <Collapsible collapsed={isWFHCollaps}>
              <TouchableOpacity
                style={[
                  styles.subItem,
                  path === "/applyWFH" && [
                    styles.activeSubItem,
                    {
                      backgroundColor: colors.surfaceVariant,
                      borderLeftColor: colors.primary,
                    },
                  ],
                ]}
                onPress={() => {
                  requestAnimationFrame(() => {
                    router.push("/(protected)/applyWFH");
                  });
                }}
              >
                <Entypo
                  name="add-to-list"
                  size={22}
                  color={
                    path === "/applyWFH" ? colors.primary : colors.textTertiary
                  }
                />
                <Text
                  style={[styles.subItemText, { color: colors.textPrimary }]}
                >
                  Apply WFH
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.subItem,
                  path === "/WorkFromHome" && [
                    styles.activeSubItem,
                    {
                      backgroundColor: colors.surfaceVariant,
                      borderLeftColor: colors.primary,
                    },
                  ],
                ]}
                onPress={() => {
                  requestAnimationFrame(() => {
                    router.push("/(protected)/WorkFromHome");
                  });
                }}
              >
                <MaterialIcons
                  name="view-list"
                  size={22}
                  color={
                    path === "/applyWFH" ? colors.primary : colors.textTertiary
                  }
                />
                <Text
                  style={[styles.subItemText, { color: colors.textPrimary }]}
                >
                  WFH Lists
                </Text>
              </TouchableOpacity>
            </Collapsible>
          </View>

          {/* Theme Toggle Button */}
          <View
            style={[styles.bottomSection, { borderTopColor: colors.border }]}
          >
            <TouchableOpacity
              onPress={handleLogout}
              style={{
                // width: "100%",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "flex-start",
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 12,
                gap: 12,
              }}
              activeOpacity={0.8}
            >
              <MaterialIcons name="logout" size={22} color="#EF4444" />
              <Text
                style={{
                  color: "#EF4444",
                  fontWeight: "600",
                  fontSize: 16,
                  marginLeft: 12,
                  letterSpacing: 0.5,
                }}
              >
                Sign Out
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flexDirection: "row",
                alignItems: "center",
                right: "10%",
              }}
              onPress={toggleTheme}
            >
              <MaterialIcons
                name={theme === "dark" ? "light-mode" : "nightlight"}
                size={30}
                color={colors.textPrimary}
              />
              {/* <Text
                style={[
                  styles.drawerItemText,
                  { color: colors.textPrimary, marginLeft: 10 },
                ]}
              >
                {theme === "dark" ? "Light Theme" : "Dark Theme"}
              </Text> */}
            </TouchableOpacity>
          </View>
        </DrawerContentScrollView>

        {/* <View style={styles.bottomSection}>
          <View style={styles.divider} />
        
        </View> */}
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
      backBehavior="history"
    >
      <Drawer.Screen
        name="index"
        options={{
          title: "Home",
          drawerActiveTintColor: colors.primary,
          drawerItemStyle: { borderRadius: 10 },
          drawerIcon: ({ focused }) => (
            <MaterialIcons
              name="home"
              size={24}
              color={focused ? colors.primary : colors.textTertiary}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="attendance"
        options={{
          title: "Attendance",
          drawerActiveTintColor: colors.primary,
          drawerItemStyle: { borderRadius: 10 },
          headerRight: () => <></>,
          drawerIcon: ({ focused }) => (
            <FontAwesome6
              name="calendar-check"
              size={24}
              color={focused ? colors.primary : colors.textTertiary}
            />
          ),
        }}
      />
      <Drawer.Screen
        name="meetingLists"
        options={{
          title: "Meeting Lists",
          drawerActiveTintColor: colors.primary,
          drawerItemStyle: { borderRadius: 10 },
          headerRight: () => <></>,
        }}
      />
      <Drawer.Screen
        name="createMeeting"
        options={{
          title: "Create Meeting",
          drawerActiveTintColor: colors.primary,
          drawerItemStyle: { borderRadius: 10 },
          headerRight: () => <></>,
        }}
      />
      <Drawer.Screen
        name="holidayLists"
        options={{
          title: "Lists of Holidays",
          drawerActiveTintColor: colors.primary,
          drawerItemStyle: { borderRadius: 10 },
          headerRight: () => <></>,
        }}
      />
      <Drawer.Screen
        name="applyLeave"
        options={{
          title: "Apply Leave",
          drawerActiveTintColor: colors.primary,
          drawerItemStyle: { borderRadius: 10 },
          headerRight: () => <></>,
        }}
      />
      <Drawer.Screen
        name="myLeaves"
        options={{
          title: "My Leave",
          drawerActiveTintColor: colors.primary,
          drawerItemStyle: { borderRadius: 10 },
          headerRight: () => <></>,
        }}
      />
      <Drawer.Screen
        name="applyWFH"
        options={{
          title: "Apply WFH",
          drawerActiveTintColor: colors.primary,
          drawerItemStyle: { borderRadius: 10 },
          headerRight: () => <></>,
        }}
      />
      <Drawer.Screen
        name="WorkFromHome"
        options={{
          title: "Work From Home",
          drawerActiveTintColor: colors.primary,
          drawerItemStyle: { borderRadius: 10 },
          headerRight: () => <></>,
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
    alignItems: "center",
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
    marginLeft: 8,
  },
  bottomSection: {
    padding: 10,
    borderTopWidth: 1,
    flexDirection: "row",
    // alignItems: "center",
    justifyContent: "space-between",
  },
});
