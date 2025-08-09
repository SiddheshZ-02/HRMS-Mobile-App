// import { AntDesign, FontAwesome5, MaterialIcons } from "@expo/vector-icons";
// import { useRouter } from "expo-router";
// // import  from '@expo/vector-icons/AntDesign';
// import React, { useEffect, useState } from "react";
// import {
//   Dimensions,
//   Linking,
//   ScrollView,
//   StyleSheet,
//   Text,
//   TouchableOpacity,
//   View,
// } from "react-native";

// const { height, width } = Dimensions.get("window");

// interface holidayType {
//   id: number;
//   dates: string;
//   days: string;
//   company_id: number;
//   dateInYears: string;
// }

// interface Employee {
//   id: number;
//   firstname: string;
//   middlename: string;
//   lastname: string;
//   email: string;
// }

// interface dataType {
//   meet_id: number;
//   title: string;
//   description: string;
//   expected_start_date: string;
//   expected_end_date: string;
//   url: string;
//   client_id: number;
//   client_name: string;
//   recording_url: string | null;
//   employee_id: Employee[];
// }

// const index = () => {
//   const [loading, setLoading] = useState(true);
//   const [holiday, setHoliday] = useState<holidayType[]>([]);

//   const [data, setData] = useState<dataType[]>([]);
//   const [expandedItems, setExpandedItems] = useState<{
//     [key: number]: boolean;
//   }>({});

//   const router = useRouter();

//   // fetch meeting
//   const fetchMeeting = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch(
//         "https://hr1.actifyzone.com/hr-uat/HR/Portal/project/manager/meeting",
//         {
//           method: "GET",
//           headers: {
//             "content-type": "application/json",
//             accesstoken:
//               "cm7OTIqgm4tSCEXTDOIUzcxj71qTa7CaASVwwlzrUHYqNJMaX2znMkb4nXvx",
//           },
//         }
//       );
//       const res = await response.json();
//       setData(Array.isArray(res) ? res : []);
//     } catch (error) {
//       console.log("Error fetching data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // fetch Holiday
//   const fetchHoliday = async () => {
//     setLoading(true);
//     try {
//       const response = await fetch(
//         "https://hr1.actifyzone.com/hr-uat/HR/Portal/holidays/month/list",
//         {
//           method: "GET",
//           headers: {
//             "content-type": "application.json",
//             accesstoken:
//               "cm7OTIqgm4tSCEXTDOIUzcxj71qTa7CaASVwwlzrUHYqNJMaX2znMkb4nXvx",
//           },
//         }
//       );
//       const res = await response.json();
//       setHoliday(Array.isArray(res) ? res : []);
//     } catch (error) {
//       console.log("Error fetching data:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchMeeting();
//     fetchHoliday();
//   }, []);

//   const toggleDropdown = (id: number) => {
//     setExpandedItems((prev) => ({
//       ...prev,
//       [id]: !prev[id],
//     }));
//   };

//   return (
//     <View style={{ flex: 1, marginHorizontal: 10 }}>
//       {/* Meeting Section */}
//       <View style={styles.sectionWrapper}>
//         <View style={styles.sectionHeader}>
//           <View style={styles.headerLeft}>
//             <MaterialIcons name="event" size={20} color="white" />
//             <Text style={styles.sectionTitle}>Meeting</Text>
//           </View>
//           <TouchableOpacity
//             onPress={() => router.push("/(protected)/meetingLists")}
//           >
//             <Text style={styles.viewAll}>View all</Text>
//           </TouchableOpacity>
//         </View>

//         <ScrollView
//           showsVerticalScrollIndicator={false}
//           style={styles.sectionBody}
//         >
//           {data.length === 0 ? (
//             <Text style={styles.emptyText}>No Meetings</Text>
//           ) : (
//             data.map((item, index) => {
//               const isExpanded = expandedItems[item.meet_id] || false;
//               return (
//                 <View key={index} style={styles.meetingCard}>
//                   <View style={styles.meetingRow}>
//                     <View style={styles.meetingDetails}>
//                       <Text style={styles.meetingTitle}>{item.title}</Text>
//                       <Text style={styles.meetingDescription}>
//                         {/* {item.description} */}
//                      Process Flow Performance Management
//                       </Text>
//                     </View>

//                     <View style={styles.rightSection}>
//                       <Text style={styles.meetingDate}>
//                         {item.expected_start_date}
//                       </Text>
//                       <TouchableOpacity
//                         onPress={() => {
//                           if (item.url) Linking.openURL(item.url);
//                         }}
//                         style={styles.linkButton}
//                       >
//                         <Text style={styles.linkButtonText}>Join</Text>
//                       </TouchableOpacity>
//                     </View>
//                   </View>

//                   <TouchableOpacity
//                     style={styles.dropdownHeader}
//                     onPress={() => toggleDropdown(item.meet_id)}
//                   >
//                     <Text style={styles.employeeTitle}>Employees</Text>
//                     {item.employee_id.length > 1 && (
//                       <MaterialIcons
//                         name={isExpanded ? "expand-less" : "expand-more"}
//                         size={20}
//                         color="#64748b"
//                       />
//                     )}
//                   </TouchableOpacity>

//                   {isExpanded &&
//                     item.employee_id.map((emp) => (
//                       <Text key={emp.id} style={styles.employeeName}>
//                         • {emp.firstname} {emp.lastname}
//                       </Text>
//                     ))}
//                 </View>
//               );
//             })
//           )}
//           {data.length > 2 ? (
//             <TouchableOpacity
//               onPress={() => router.push("/(protected)/meetingLists")}
//               style={{ alignItems: "center", width: width * 0.3, left: "30%" }}
//             >
//               <Text style={{ color: "#3b82f6" }}>
//                 View More
//                 <AntDesign name="doubleright" size={14} color="#3b82f6" />
//               </Text>
//             </TouchableOpacity>
//           ) : (
//             ""
//           )}
//         </ScrollView>
//       </View>

//       {/* Holiday Section */}
//       <View style={styles.sectionWrapper}>
//         <View style={styles.sectionHeader}>
//           <View style={styles.headerLeft}>
//             <FontAwesome5 name="calendar-day" size={20} color="white" />
//             <Text style={styles.sectionTitle}>Holiday</Text>
//           </View>
//           <TouchableOpacity>
//             <Text style={styles.viewAll}>View all</Text>
//           </TouchableOpacity>
//         </View>

//         <ScrollView
//           showsVerticalScrollIndicator={false}
//           style={styles.sectionBody}
//         >
//           {holiday.length === 0 ? (
//             <Text style={styles.emptyText}>No Holidays</Text>
//           ) : (
//             holiday.map((item) => (
//               <View key={item.id} style={styles.holidayCard}>
//                 <View style={styles.holidayRow}>
//                   <View style={styles.holidayDetails}>
//                     <Text style={styles.holidayTitle}>{item.days}</Text>
//                     <Text style={styles.holidayDescription}>
//                       {item.dateInYears}
//                     </Text>
//                   </View>

//                   <View style={styles.rightSection}>
//                     <View style={styles.linkButtonDisabled}>
//                       <Text style={styles.linkButtonText}>Holiday</Text>
//                     </View>
//                     <Text style={styles.holidayDate}></Text>
//                   </View>
//                 </View>
//               </View>
//             ))
//           )}
//           {holiday.length > 2 ? (
//             <TouchableOpacity
//               style={{ alignItems: "center", width: width * 0.3, left: "30%" }}
//             >
//               <Text style={{ color: "#3b82f6" }}>
//                 View More{" "}
//                 <AntDesign name="doubleright" size={14} color="#3b82f6" />
//               </Text>
//             </TouchableOpacity>
//           ) : (
//             ""
//           )}
//         </ScrollView>
//       </View>
//     </View>
//   );
// };

// export default index;

// const styles = StyleSheet.create({
//   sectionWrapper: {
//     backgroundColor: "#ffffff",
//     borderRadius: 12,
//     marginBottom: 20,
//     overflow: "hidden",
//     elevation: 2,
//     shadowColor: "#000",
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     shadowOffset: { width: 0, height: 2 },
//     height: height * 0.42,
//     paddingBottom: 14,
//   },
//   sectionHeader: {
//     backgroundColor: "#1e293b",
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     paddingVertical: 14,
//     paddingHorizontal: 16,
//   },
//   headerLeft: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   sectionTitle: {
//     color: "#ffffff",
//     fontSize: 16,
//     fontWeight: "bold",
//     marginLeft: 8,
//   },
//   viewAll: {
//     color: "#60a5fa",
//     fontSize: 14,
//   },
//   sectionBody: {
//     paddingHorizontal: 12,
//     paddingBottom: 40,
//     backgroundColor: "#ffffff",
//   },
//   emptyText: {
//     textAlign: "center",
//     color: "#64748b",
//     fontSize: 15,
//     paddingVertical: 20,
//   },
//   meetingCard: {
//     padding: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#e5e7eb",
//     backgroundColor: "#f9fafb",
//     borderRadius: 10,
//     marginBottom: 12,
//     shadowColor: "#000",
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 1,
//   },
//   meetingRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   meetingDetails: {
//     flex: 1,
//     paddingRight: 8,
//   },
//   meetingTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#1e293b",
//   },
//   meetingDescription: {
//     fontSize: 14,
//     color: "#475569",
//     marginTop: 2,
//   },
//   meetingDate: {
//     fontSize: 13,
//     color: "#94a3b8",
//     marginTop: 4,
//     width: width * 0.2,
//   },
//   linkButton: {
//     backgroundColor: "#3b82f6",
//     paddingVertical: 6,
//     paddingHorizontal: 14,
//     borderRadius: 8,
//     alignItems: "center",
//     justifyContent: "center",
//     right: 20,
//   },
//   linkButtonText: {
//     color: "#ffffff",
//     fontWeight: "bold",
//     fontSize: 14,
//   },
//   employeeList: {
//     marginTop: 8,
//     paddingLeft: 4,
//   },
//   employeeName: {
//     fontSize: 13,
//     color: "#334155",
//     paddingLeft: 10,
//     paddingTop: 2,
//   },
//   rightSection: {
//     alignItems: "flex-end",
//     justifyContent: "center",
//     gap: 20,
//   },
//   dropdownHeader: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//     marginTop: 10,
//     paddingVertical: 4,
//     borderTopWidth: 1,
//     borderTopColor: "#e2e8f0",
//   },
//   employeeTitle: {
//     fontSize: 14,
//     fontWeight: "600",
//     color: "#334155",
//   },
//   holidayCard: {
//     padding: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: "#e5e7eb",
//     backgroundColor: "#f9fafb",
//     borderRadius: 10,
//     marginBottom: 12,
//     shadowColor: "#000",
//     shadowOpacity: 0.05,
//     shadowRadius: 4,
//     elevation: 1,
//   },
//   holidayRow: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     alignItems: "center",
//   },
//   holidayDetails: {
//     flex: 1,
//     paddingRight: 8,
//   },
//   holidayTitle: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#1e293b",
//   },
//   holidayDescription: {
//     fontSize: 14,
//     color: "#475569",
//     marginTop: 2,
//   },
//   holidayDate: {
//     fontSize: 13,
//     color: "#94a3b8",
//     marginTop: 4,
//   },

//   linkButtonDisabled: {
//     backgroundColor: "red",
//     paddingVertical: 6,
//     paddingHorizontal: 14,
//     borderRadius: 8,
//     alignItems: "center",
//     justifyContent: "center",
//   },
//   horizontalScroll: {
//     paddingVertical: 10,
//     paddingHorizontal: 10,
//   },
// });



import { AntDesign, FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Linking,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    useColorScheme
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

const Colors = {
  light: {
    background: '#ffffff',
    surface: '#f9fafb',
    surfaceVariant: '#f3f4f6',
    textPrimary: '#1e293b',
    textSecondary: '#475569',
    textTertiary: '#94a3b8',
  },
  dark: {
    background: '#1e293b',
    surface: '#334155',
    surfaceVariant: '#4b5563',
    textPrimary: '#f9fafb',
    textSecondary: '#d1d5db',
    textTertiary: '#9ca3af',
  },
};

const BrandColors = {
  primary: '#3b82f6',
  warning: '#f59e0b',
  success: '#10b981',
  accent: '#8b5cf6',
};

const index = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [holiday, setHoliday] = useState<holidayType[]>([]);
  const [data, setData] = useState<dataType[]>([]);
  const [expandedItems, setExpandedItems] = useState<{ [key: number]: boolean }>({});

  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  // Mock data for statistics
  const stats = {
    totalMeetings: data.length,
    upcomingMeetings: data.filter(item => new Date(item.expected_start_date) > new Date()).length,
    totalHolidays: holiday.length,
    thisMonthHolidays: holiday.filter(item => {
      const holidayDate = new Date(item.dateInYears);
      const now = new Date();
      return holidayDate.getMonth() === now.getMonth() && holidayDate.getFullYear() === now.getFullYear();
    }).length,
  };

  // Fetch meeting
  const fetchMeeting = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "https://hr1.actifyzone.com/hr-uat/HR/Portal/project/manager/meeting",
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            accesstoken:
              "KrYvsz5Ua0uGbaoHfPiknIHBRyVs7T9fnHoq2Vvw634aeS4ydn2gs3qP2IKl",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch meetings");
      const res = await response.json();
      setData(Array.isArray(res) ? res : []);
    } catch (error) {
      console.log("Error fetching meetings:", error);
      setError("Failed to load meetings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Fetch Holiday
  const fetchHoliday = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "https://hr1.actifyzone.com/hr-uat/HR/Portal/holidays/month/list",
        {
          method: "GET",
          headers: {
            "content-type": "application/json",
            accesstoken:
              "KrYvsz5Ua0uGbaoHfPiknIHBRyVs7T9fnHoq2Vvw634aeS4ydn2gs3qP2IKl",
          },
        }
      );
      if (!response.ok) throw new Error("Failed to fetch holidays");
      const res = await response.json();
      setHoliday(Array.isArray(res) ? res : []);
    } catch (error) {
      console.log("Error fetching holidays:", error);
      setError("Failed to load holidays. Please try again.");
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

  // const StatCard = ({ title, value, icon, color, subtitle }: any) => (
  //   <View style={[styles.statCard, { backgroundColor: colors.surface }]}>
  //     <View style={[styles.statIcon, { backgroundColor: color + '15' }]}>
  //       <Ionicons name={icon} size={24} color={color} />
  //     </View>
  //     <View style={styles.statContent}>
  //       <Text style={[styles.statValue, { color: colors.textPrimary }]}>{value}</Text>
  //       <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{title}</Text>
  //       {subtitle && (
  //         <Text style={[styles.statSubtitle, { color: colors.textTertiary }]}>{subtitle}</Text>
  //       )}
  //     </View>
  //   </View>
  // );

  const MeetingCard = ({ item, index }: { item: dataType; index: number }) => {
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
              <Text style={[styles.meetingTitle, { color: colors.textPrimary }]}>
                {item.title}
              </Text>
            </View>
            <Text style={[styles.meetingDescription, { color: colors.textSecondary }]}>
                        {/* {item.description} */}
              Process flow performance management
                      </Text>
                    </View>
                    <View style={styles.rightSection}>
            <Text style={[styles.meetingDate, { color: colors.textTertiary }]}>
              {/* {new Date(item.expected_start_date).toLocaleDateString()} */}
                        {item.expected_start_date}
                      </Text>
                      <TouchableOpacity
                        onPress={() => {
                          if (item.url) Linking.openURL(item.url);
                        }}
              style={[styles.linkButton, { backgroundColor: BrandColors.primary }]}
                      >
                        <Text style={styles.linkButtonText}>Join</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
        {item.employee_id.length > 0 && (
                  <TouchableOpacity
                    style={styles.dropdownHeader}
                    onPress={() => toggleDropdown(item.meet_id)}
                  >
            <Text style={[styles.employeeTitle, { color: colors.textSecondary }]}>
              {item.employee_id.length} Participants
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
            {item.employee_id.map((emp) => (
              <View key={emp.id} style={styles.employeeItem}>
                <View style={[styles.employeeAvatar, { backgroundColor: BrandColors.primary + '20' }]}>
                  <Text style={[styles.employeeInitial, { color: BrandColors.primary }]}>
                    {emp.firstname.charAt(0)}{emp.lastname.charAt(0)}
                  </Text>
                </View>
                <Text style={[styles.employeeName, { color: colors.textPrimary }]}>
                  {emp.firstname} {emp.lastname}
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
            <FontAwesome5 name="calendar-day" size={16} color={BrandColors.warning} />
            <Text style={[styles.holidayTitle, { color: colors.textPrimary }]}>
              {item.days}
            </Text>
          </View>
          <Text style={[styles.holidayDescription, { color: colors.textSecondary }]}>
            {item.dateInYears}
          </Text>
        </View>
        <View style={[styles.linkButtonDisabled, { backgroundColor: BrandColors.warning + '20' }]}>
          <Text style={[styles.linkButtonText, { color: BrandColors.warning }]}>Holiday</Text>
        </View>
      </View>
                </View>
              );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      {/* Header */}
    
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
     

        {/* Meeting Section */}
        <View style={styles.sectionWrapper}>
          <View style={[styles.sectionHeader, { backgroundColor: colors.surface }]}>
            <View style={styles.headerLeft}>
              <View style={[styles.sectionIcon, { backgroundColor: BrandColors.primary + '15' }]}>
                <MaterialIcons name="event" size={20} color={BrandColors.primary} />
              </View>
              <View>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Meetings</Text>
                <Text style={[styles.sectionSubtitle, { color: colors.textTertiary }]}>
                  {data.length} meetings scheduled
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => router.push("/(protected)/meetingLists")}
              style={styles.viewAllButton}
            >
              <Text style={[styles.viewAllText, { color: BrandColors.primary }]}>View all</Text>
              <AntDesign name="right" size={14} color={BrandColors.primary} />
            </TouchableOpacity>
          </View>
          <View style={[styles.sectionBody,{ backgroundColor: colors.surfaceVariant }]}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={BrandColors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Loading meetings...
              </Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={[styles.errorText, { color: colors.textPrimary }]}>{error}</Text>
                <TouchableOpacity
                  onPress={fetchMeeting}
                  style={[styles.retryButton, { backgroundColor: BrandColors.primary }]}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
              </View>
            ) : data.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={48} color={colors.textTertiary} />
                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Meetings</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  You don't have any meetings scheduled yet
                </Text>
              </View>
            ) : (
              <View style={styles.cardsContainer}>
                {data.slice(0, 3).map((item, index) => (
                  <MeetingCard key={item.meet_id} item={item} index={index} />
                ))}
                {data.length > 3 && (
                  <TouchableOpacity
                    onPress={() => router.push("/(protected)/meetingLists")}
                    style={styles.viewMoreButton}
                  >
                    <Text style={[styles.viewMoreText, { color: BrandColors.primary }]}>
                      View {data.length - 3} more meetings
                    </Text>
                    <AntDesign name="doubleright" size={14} color={BrandColors.primary} />
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
      </View>

      {/* Holiday Section */}
      <View style={styles.sectionWrapper}>
          <View style={[styles.sectionHeader, { backgroundColor: colors.surface }]}>
          <View style={styles.headerLeft}>
              <View style={[styles.sectionIcon, { backgroundColor: BrandColors.warning + '15' }]}>
                <FontAwesome5 name="calendar-day" size={20} color={BrandColors.warning} />
              </View>
              <View>
                <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>Holidays</Text>
                <Text style={[styles.sectionSubtitle, { color: colors.textTertiary }]}>
                  {holiday.length} holidays this month
                </Text>
              </View>
          </View>
            <TouchableOpacity
              onPress={() => router.push("/(protected)/holidayLists")}
              style={styles.viewAllButton}
            >
              <Text style={[styles.viewAllText, { color: BrandColors.primary }]}>View all</Text>
              <AntDesign name="right" size={14} color={BrandColors.primary} />
          </TouchableOpacity>
        </View>
          <View style={[styles.sectionBody,{ backgroundColor: colors.surfaceVariant }] }>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={BrandColors.primary} />
                <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                  Loading holidays...
                    </Text>
                  </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={[styles.errorText, { color: colors.textPrimary }]}>{error}</Text>
                <TouchableOpacity
                  onPress={fetchHoliday}
                  style={[styles.retryButton, { backgroundColor: BrandColors.primary }]}
                >
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
                    </View>
            ) : holiday.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="sunny-outline" size={48} color={colors.textTertiary} />
                <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>No Holidays</Text>
                <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                  No holidays scheduled for this period
                </Text>
                  </View>
            ) : (
              <View style={styles.cardsContainer}>
                {holiday.slice(0, 3).map((item) => (
                  <HolidayCard key={item.id} item={item} />
                ))}
                {holiday.length > 3 && (
            <TouchableOpacity
                    // onPress={() => router.push("/(protected)/holidayLists")}
                    style={styles.viewMoreButton}
            >
                    <Text style={[styles.viewMoreText, { color: BrandColors.primary }]}>
                      View {holiday.length - 3} more holidays
              </Text>
                    <AntDesign name="doubleright" size={14} color={BrandColors.primary} />
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
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logo: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  welcomeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 2,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  statsSection: {
    marginBottom: 32,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: (width - 60) / 2,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  sectionWrapper: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },

  sectionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 2,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: '600',
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
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  meetingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
   
  },
  meetingDetails: {
    flex: 1,
    // paddingRight: 12,
  },
  meetingTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  meetingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  meetingDescription: {
    fontSize: 14,
    fontWeight: '500',
    // marginLeft: 24,
  },
  rightSection: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 12,
  },
  meetingDate: {

    fontSize: 12,
    fontWeight: '500',
    width:"60%",

  },
  linkButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  linkButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  employeeTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  employeeList: {
    marginTop: 12,
    gap: 8,
  },
  employeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 24,
  },
  employeeAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  employeeInitial: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  employeeName: {
    fontSize: 14,
    fontWeight: '500',
  },
  holidayCard: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  holidayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  holidayDetails: {
    flex: 1,
    paddingRight: 12,
  },
  holidayTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  holidayTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  holidayDescription: {
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 24,
  },
  linkButtonDisabled: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    marginTop: 12,
  },
  errorContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  viewMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  viewMoreText: {
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
});
