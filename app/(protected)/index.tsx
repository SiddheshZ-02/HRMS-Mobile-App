import { AntDesign, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
// import  from '@expo/vector-icons/AntDesign';
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { height, width } = Dimensions.get("window");

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

interface dataType {
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

const index = () => {
  const [loading, setLoading] = useState(true);
  const [holiday, setHoliday] = useState<holidayType[]>([]);

  const [data, setData] = useState<dataType[]>([]);
  const [expandedItems, setExpandedItems] = useState<{
    [key: number]: boolean;
  }>({});

  const router = useRouter();

  // fetch meeting
  const fetchMeeting = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://hr1.actifyzone.com/hr-uat/HR/Portal/project/manager/meeting",
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            accesstoken:
              "cm7OTIqgm4tSCEXTDOIUzcxj71qTa7CaASVwwlzrUHYqNJMaX2znMkb4nXvx",
          },
        }
      );
      const res = await response.json();
      setData(Array.isArray(res) ? res : []);
    } catch (error) {
      console.log("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  // fetch Holiday
  const fetchHoliday = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://hr1.actifyzone.com/hr-uat/HR/Portal/holidays/month/list",
        {
          method: "GET",
          headers: {
            "content-type": "application.json",
            accesstoken:
              "cm7OTIqgm4tSCEXTDOIUzcxj71qTa7CaASVwwlzrUHYqNJMaX2znMkb4nXvx",
          },
        }
      );
      const res = await response.json();
      setHoliday(Array.isArray(res) ? res : []);
    } catch (error) {
      console.log("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <View style={{ flex: 1, marginHorizontal: 10 }}>
      {/* Meeting Section */}
      <View style={styles.sectionWrapper}>
        <View style={styles.sectionHeader}>
          <View style={styles.headerLeft}>
            <MaterialIcons name="event" size={20} color="white" />
            <Text style={styles.sectionTitle}>Meeting</Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/(protected)/meetingLists")}
          >
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.sectionBody}
        >
          {data.length === 0 ? (
            <Text style={styles.emptyText}>No Meetings</Text>
          ) : (
            data.map((item, index) => {
              const isExpanded = expandedItems[item.meet_id] || false;
              return (
                <View key={index} style={styles.meetingCard}>
                  <View style={styles.meetingRow}>
                    <View style={styles.meetingDetails}>
                      <Text style={styles.meetingTitle}>{item.title}</Text>
                      <Text style={styles.meetingDescription}>
                        {/* {item.description} */}
                     Process Flow Performance Management
                      </Text>
                    </View>

                    <View style={styles.rightSection}>
                      <Text style={styles.meetingDate}>
                        {item.expected_start_date}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          if (item.url) Linking.openURL(item.url);
                        }}
                        style={styles.linkButton}
                      >
                        <Text style={styles.linkButtonText}>Join</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.dropdownHeader}
                    onPress={() => toggleDropdown(item.meet_id)}
                  >
                    <Text style={styles.employeeTitle}>Employees</Text>
                    {item.employee_id.length > 1 && (
                      <MaterialIcons
                        name={isExpanded ? "expand-less" : "expand-more"}
                        size={20}
                        color="#64748b"
                      />
                    )}
                  </TouchableOpacity>

                  {isExpanded &&
                    item.employee_id.map((emp) => (
                      <Text key={emp.id} style={styles.employeeName}>
                        • {emp.firstname} {emp.lastname}
                      </Text>
                    ))}
                </View>
              );
            })
          )}
          {data.length > 2 ? (
            <TouchableOpacity
              onPress={() => router.push("/(protected)/meetingLists")}
              style={{ alignItems: "center", width: width * 0.3, left: "30%" }}
            >
              <Text style={{ color: "#3b82f6" }}>
                View More
                <AntDesign name="doubleright" size={14} color="#3b82f6" />
              </Text>
            </TouchableOpacity>
          ) : (
            ""
          )}
        </ScrollView>
      </View>

      {/* Holiday Section */}
      <View style={styles.sectionWrapper}>
        <View style={styles.sectionHeader}>
          <View style={styles.headerLeft}>
            <FontAwesome5 name="calendar-day" size={20} color="white" />
            <Text style={styles.sectionTitle}>Holiday</Text>
          </View>
          <TouchableOpacity>
            <Text style={styles.viewAll}>View all</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.sectionBody}
        >
          {holiday.length === 0 ? (
            <Text style={styles.emptyText}>No Holidays</Text>
          ) : (
            holiday.map((item) => (
              <View key={item.id} style={styles.holidayCard}>
                <View style={styles.holidayRow}>
                  <View style={styles.holidayDetails}>
                    <Text style={styles.holidayTitle}>{item.days}</Text>
                    <Text style={styles.holidayDescription}>
                      {item.dateInYears}
                    </Text>
                  </View>

                  <View style={styles.rightSection}>
                    <View style={styles.linkButtonDisabled}>
                      <Text style={styles.linkButtonText}>Holiday</Text>
                    </View>
                    <Text style={styles.holidayDate}></Text>
                  </View>
                </View>
              </View>
            ))
          )}
          {holiday.length > 2 ? (
            <TouchableOpacity
              style={{ alignItems: "center", width: width * 0.3, left: "30%" }}
            >
              <Text style={{ color: "#3b82f6" }}>
                View More{" "}
                <AntDesign name="doubleright" size={14} color="#3b82f6" />
              </Text>
            </TouchableOpacity>
          ) : (
            ""
          )}
        </ScrollView>
      </View>
    </View>
  );
};

export default index;

const styles = StyleSheet.create({
  sectionWrapper: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 20,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    height: height * 0.42,
    paddingBottom: 14,
  },
  sectionHeader: {
    backgroundColor: "#1e293b",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  viewAll: {
    color: "#60a5fa",
    fontSize: 14,
  },
  sectionBody: {
    paddingHorizontal: 12,
    paddingBottom: 40,
    backgroundColor: "#ffffff",
  },
  emptyText: {
    textAlign: "center",
    color: "#64748b",
    fontSize: 15,
    paddingVertical: 20,
  },
  meetingCard: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  meetingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  meetingDetails: {
    flex: 1,
    paddingRight: 8,
  },
  meetingTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
  },
  meetingDescription: {
    fontSize: 14,
    color: "#475569",
    marginTop: 2,
  },
  meetingDate: {
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 4,
    width: width * 0.2,
  },
  linkButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    right: 20,
  },
  linkButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
  },
  employeeList: {
    marginTop: 8,
    paddingLeft: 4,
  },
  employeeName: {
    fontSize: 13,
    color: "#334155",
    paddingLeft: 10,
    paddingTop: 2,
  },
  rightSection: {
    alignItems: "flex-end",
    justifyContent: "center",
    gap: 20,
  },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
  },
  employeeTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
  },
  holidayCard: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  holidayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  holidayDetails: {
    flex: 1,
    paddingRight: 8,
  },
  holidayTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1e293b",
  },
  holidayDescription: {
    fontSize: 14,
    color: "#475569",
    marginTop: 2,
  },
  holidayDate: {
    fontSize: 13,
    color: "#94a3b8",
    marginTop: 4,
  },

  linkButtonDisabled: {
    backgroundColor: "red",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  horizontalScroll: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
});
