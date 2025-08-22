import { BASE_URL } from "@/constants/Config";
import useAuthStore from "@/store/AuthStore";
import {
  AntDesign,
  FontAwesome5,
  Ionicons,
  MaterialIcons,
} from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Linking,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

const { width } = Dimensions.get("window");

interface holidayType {
  id: number;
  dates: string;
  days: string;
  company_id: number;
  dateInYears: string;
}

interface Employee {
  id: number;
  firstname: string;
  middlename: string;
  lastname: string;
  email: string;
}

interface meetDataType {
  meet_id: number;
  title: string;
  description: string;
  expected_start_date: string;
  expected_end_date: string;
  url: string;
  client_id: number;
  client_name: string;
  recording_url: string | null;
  employee_id: Employee[];
}

const Colors = {
  light: {
    background: "#ffffff",
    surface: "#f9fafb",
    surfaceVariant: "#f3f4f6",
    textPrimary: "#1e293b",
    textSecondary: "#475569",
    textTertiary: "#94a3b8",
  },
  dark: {
    background: "#1e293b",
    surface: "#334155",
    surfaceVariant: "#4b5563",
    textPrimary: "#f9fafb",
    textSecondary: "#d1d5db",
    textTertiary: "#9ca3af",
  },
};

const BrandColors = {
  primary: "#3b82f6",
  warning: "#f59e0b",
  success: "#10b981",
  accent: "#8b5cf6",
};

const index = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [holiday, setHoliday] = useState<holidayType[]>([]);
  const [data, setData] = useState<meetDataType[]>([]);
  const [expandedItems, setExpandedItems] = useState<{
    [key: number]: boolean;
  }>({});
  const [showSessionTimeout, setShowSessionTimeout] = useState(false);

  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const { accessToken, roles, logout } = useAuthStore((state) => state);

  // Fetch meeting with proper error handling
  const fetchMeeting = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/project/manager/meeting`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          accesstoken: accessToken || "",
        },
      });

      // if (!response.ok) {
      //   throw new Error("Failed to fetch meetings");
      // }

      const res = await response.json();
      setData(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error("Error fetching meetings:", error);
      setError("Failed to load meetings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch holidays with proper error handling
  const fetchHoliday = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/holidays/month/list`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          accesstoken: accessToken || "",
        },
      });

      // if (!response.ok) {
      //   throw new Error("Failed to fetch holidays");
      // }

      const res = await response.json();
      setHoliday(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error("Error fetching holidays:", error);
      setError("Failed to load holidays. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchMeeting();
    fetchHoliday();
  }, []);

  const toggleDropdown = (id: number) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const MeetingCard = ({
    item,
    index,
  }: {
    item: meetDataType;
    index: number;
  }) => {
    const isExpanded = expandedItems[item.meet_id] || false;
    const isUpcoming = new Date(item.expected_start_date) > new Date();

    return (
      <View style={[styles.meetingCard, { backgroundColor: colors.surface }]}>
        <View style={styles.meetingRow}>
          <View style={styles.meetingDetails}>
            <View style={styles.meetingTitleRow}>
              <MaterialIcons
                name="event"
                size={16}
                color={isUpcoming ? BrandColors.warning : BrandColors.success}
              />
              <Text
                style={[styles.meetingTitle, { color: colors.textPrimary }]}
              >
                {item.title ?? ""}
              </Text>
            </View>
            <Text
              style={[
                styles.meetingDescription,
                { color: colors.textSecondary },
              ]}
            >
              {item.description ?? ""}
            </Text>
          </View>
          <View style={styles.rightSection}>
            <Text style={[styles.meetingDate, { color: colors.textTertiary }]}>
              {item.expected_start_date ?? ""}
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (item.url) Linking.openURL(item.url);
              }}
              style={[
                styles.linkButton,
                { backgroundColor: BrandColors.primary },
              ]}
            >
              <Text style={styles.linkButtonText}>Join</Text>
            </TouchableOpacity>
          </View>
        </View>
        {item.employee_id && item.employee_id.length > 0 && (
          <TouchableOpacity
            style={styles.dropdownHeader}
            onPress={() => toggleDropdown(item.meet_id)}
          >
            <Text
              style={[styles.employeeTitle, { color: colors.textSecondary }]}
            >
              {item.employee_id?.length ?? 0} Participants
            </Text>
            <MaterialIcons
              name={isExpanded ? "expand-less" : "expand-more"}
              size={20}
              color={colors.textTertiary}
            />
          </TouchableOpacity>
        )}
        {isExpanded && (
          <View style={styles.employeeList}>
            {item.employee_id.map((emp, idx) => (
              <View key={emp.id || idx}>
                <View
                  style={[
                    styles.employeeAvatar,
                    { backgroundColor: BrandColors.primary + "20" },
                  ]}
                >
                  <Text
                    style={[
                      styles.employeeInitial,
                      { color: BrandColors.primary },
                    ]}
                  >
                    {emp.firstname ? emp.firstname.charAt(0) : ""}
                    {emp.lastname ? emp.lastname.charAt(0) : ""}
                  </Text>
                </View>
                <Text
                  style={[styles.employeeName, { color: colors.textPrimary }]}
                >
                  {emp.firstname ?? ""} {emp.lastname ?? ""}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  const HolidayCard = ({ item }: { item: holidayType }) => (
    <View style={[styles.holidayCard, { backgroundColor: colors.surface }]}>
      <View style={styles.holidayRow}>
        <View style={styles.holidayDetails}>
          <View style={styles.holidayTitleRow}>
            <FontAwesome5
              name="calendar-day"
              size={16}
              color={BrandColors.warning}
            />
            <Text style={[styles.holidayTitle, { color: colors.textPrimary }]}>
              {item.days ?? ""}
            </Text>
          </View>
          <Text
            style={[styles.holidayDescription, { color: colors.textSecondary }]}
          >
            {item.dateInYears ?? ""}
          </Text>
        </View>
        <View
          style={[
            styles.linkButtonDisabled,
            { backgroundColor: BrandColors.warning + "20" },
          ]}
        >
          <Text style={[styles.linkButtonText, { color: BrandColors.warning }]}>
            Holiday
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Meeting Section */}
        <View style={styles.sectionWrapper}>
          <View
            style={[styles.sectionHeader, { backgroundColor: colors.surface }]}
          >
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.sectionIcon,
                  { backgroundColor: BrandColors.primary + "15" },
                ]}
              >
                <MaterialIcons
                  name="event"
                  size={20}
                  color={BrandColors.primary}
                />
              </View>
              <View>
                <Text
                  style={[styles.sectionTitle, { color: colors.textPrimary }]}
                >
                  Meetings
                </Text>
                <Text
                  style={[
                    styles.sectionSubtitle,
                    { color: colors.textTertiary },
                  ]}
                >
                  {data?.length ?? 0} meetings scheduled
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/(protected)/meetingLists")}
              style={styles.viewAllButton}
            >
              <Text
                style={[styles.viewAllText, { color: BrandColors.primary }]}
              >
                View all
              </Text>
              <AntDesign name="right" size={14} color={BrandColors.primary} />
            </TouchableOpacity>
          </View>
          <View
            style={[
              styles.sectionBody,
              { backgroundColor: colors.surfaceVariant },
            ]}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={BrandColors.primary} />
                <Text
                  style={[styles.loadingText, { color: colors.textSecondary }]}
                >
                  Loading meetings...
                </Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={[styles.errorText, { color: colors.textPrimary }]}>
                  {error ?? ""}
                </Text>
                <TouchableOpacity
                  onPress={fetchMeeting}
                  style={[
                    styles.retryButton,
                    { backgroundColor: BrandColors.primary },
                  ]}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (data?.length ?? 0) === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="calendar-outline"
                  size={48}
                  color={colors.textTertiary}
                />
                <Text
                  style={[styles.emptyTitle, { color: colors.textPrimary }]}
                >
                  No Meetings
                </Text>
                <Text
                  style={[
                    styles.emptySubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  You don't have any meetings scheduled yet
                </Text>
              </View>
            ) : (
              <View style={styles.cardsContainer}>
                {data.slice(0, 2).map((item, index) => (
                  <View key={item.meet_id || index}>
                    <MeetingCard key={item.meet_id} item={item} index={index} />
                  </View>
                ))}
                {(data?.length ?? 0) > 2 && (
                  <TouchableOpacity
                    onPress={() => router.push("/(protected)/meetingLists")}
                    style={[
                      styles.viewMoreButton,
                      { backgroundColor: colors.surface },
                    ]}
                  >
                    <Text
                      style={[
                        styles.viewMoreText,
                        { color: BrandColors.primary },
                      ]}
                    >
                      View more meetings
                    </Text>
                    <AntDesign
                      name="doubleright"
                      size={14}
                      color={BrandColors.primary}
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Holiday Section */}
        <View style={styles.sectionWrapper}>
          <View
            style={[styles.sectionHeader, { backgroundColor: colors.surface }]}
          >
            <View style={styles.headerLeft}>
              <View
                style={[
                  styles.sectionIcon,
                  { backgroundColor: BrandColors.warning + "15" },
                ]}
              >
                <FontAwesome5
                  name="calendar-day"
                  size={20}
                  color={BrandColors.warning}
                />
              </View>
              <View>
                <Text
                  style={[styles.sectionTitle, { color: colors.textPrimary }]}
                >
                  Holidays
                </Text>
                <Text
                  style={[
                    styles.sectionSubtitle,
                    { color: colors.textTertiary },
                  ]}
                >
                  {holiday?.length ?? 0} holidays this month
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/(protected)/holidayLists")}
              style={styles.viewAllButton}
            >
              <Text
                style={[styles.viewAllText, { color: BrandColors.primary }]}
              >
                View all
              </Text>
              <AntDesign name="right" size={14} color={BrandColors.primary} />
            </TouchableOpacity>
          </View>
          <View
            style={[
              styles.sectionBody,
              { backgroundColor: colors.surfaceVariant },
            ]}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={BrandColors.primary} />
                <Text
                  style={[styles.loadingText, { color: colors.textSecondary }]}
                >
                  Loading holidays...
                </Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={[styles.errorText, { color: colors.textPrimary }]}>
                  {error ?? ""}
                </Text>
                <TouchableOpacity
                  onPress={fetchHoliday}
                  style={[
                    styles.retryButton,
                    { backgroundColor: BrandColors.primary },
                  ]}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </View>
            ) : (holiday?.length ?? 0) === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="sunny-outline"
                  size={48}
                  color={colors.textTertiary}
                />
                <Text
                  style={[styles.emptyTitle, { color: colors.textPrimary }]}
                >
                  No Holidays
                </Text>
                <Text
                  style={[
                    styles.emptySubtitle,
                    { color: colors.textSecondary },
                  ]}
                >
                  No holidays scheduled for this period
                </Text>
              </View>
            ) : (
              <View style={styles.cardsContainer}>
                {holiday.slice(0, 3).map((item, idx) => (
                  <View key={item.id || idx}>
                    <HolidayCard key={item.id} item={item} />
                  </View>
                ))}
                {(holiday?.length ?? 0) > 3 && (
                  <TouchableOpacity
                    onPress={() => router.push("/(protected)/holidayLists")}
                    style={styles.viewMoreButton}
                  >
                    <Text
                      style={[
                        styles.viewMoreText,
                        { color: BrandColors.primary },
                      ]}
                    >
                      View {(holiday?.length ?? 0) - 3} more holidays
                    </Text>
                    <AntDesign
                      name="doubleright"
                      size={14}
                      color={BrandColors.primary}
                    />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default index;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  sectionWrapper: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginBottom: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 2,
  },
  viewAllButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 4,
  },
  sectionBody: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cardsContainer: {
    gap: 12,
  },
  meetingCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  meetingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  meetingDetails: {
    flex: 1,
  },
  meetingTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  meetingTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
    flex: 1,
  },
  meetingDescription: {
    fontSize: 14,
    fontWeight: "500",
  },
  rightSection: {
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 12,
  },
  meetingDate: {
    fontSize: 12,
    fontWeight: "500",
    width: "60%",
  },
  linkButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  linkButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  employeeTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  employeeList: {
    marginTop: 12,
    gap: 8,
  },
  employeeItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 24,
  },
  employeeAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  employeeInitial: {
    fontSize: 12,
    fontWeight: "bold",
  },
  employeeName: {
    fontSize: 14,
    fontWeight: "500",
  },
  holidayCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  holidayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  holidayDetails: {
    flex: 1,
    paddingRight: 12,
  },
  holidayTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  holidayTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  holidayDescription: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 24,
  },
  linkButtonDisabled: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  loadingContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  errorContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  retryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  viewMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.1)",
    backgroundColor: "rgba(0,0,0,0.02)",
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: "600",
    marginRight: 4,
  },
});
