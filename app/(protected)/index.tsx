import { FontAwesome5, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";

interface dataType {
  meetings: {
    name: string;
    date: string;
  }[];
  birthdays: {
    name: string;
    date: string;
  }[];
  holidays: {
    name: string;
    date: string;
  }[];
}

const DATA: dataType = {
  meetings: [
    { name: "Ganesh Chaturthi", date: "August 27" },
    { name: "Gokulashtami", date: "August 16" },
    { name: "Independence Day", date: "August 15" },
    { name: "Ganesh Chaturthi", date: "August 27" },
    { name: "Gokulashtami", date: "August 16" },
    { name: "Independence Day", date: "August 15" },
    { name: "Ganesh Chaturthi", date: "August 27" },
    { name: "Gokulashtami", date: "August 16" },
    { name: "Independence Day", date: "August 15" },
    { name: "Ganesh Chaturthi", date: "August 27" },
    { name: "Gokulashtami", date: "August 16" },
    { name: "Independence Day", date: "August 15" },
    { name: "Ganesh Chaturthi", date: "August 27" },
    { name: "Gokulashtami", date: "August 16" },
    { name: "Independence Day", date: "August 15" },
  ],
  birthdays: [
    { name: "Ganesh Chaturthi", date: "August 27" },
    { name: "Gokulashtami", date: "August 16" },
    { name: "Independence Day", date: "August 15" },
    { name: "Ganesh Chaturthi", date: "August 27" },
    { name: "Gokulashtami", date: "August 16" },
    { name: "Independence Day", date: "August 15" },
    { name: "Ganesh Chaturthi", date: "August 27" },
    { name: "Gokulashtami", date: "August 16" },
    { name: "Independence Day", date: "August 15" },
    { name: "Ganesh Chaturthi", date: "August 27" },
    { name: "Gokulashtami", date: "August 16" },
    { name: "Independence Day", date: "August 15" },
  ],
  holidays: [
    { name: "Ganesh Chaturthi", date: "August 27" },
    { name: "Gokulashtami", date: "August 16" },
    { name: "Independence Day", date: "August 15" },
    { name: "Ganesh Chaturthi", date: "August 27" },
    { name: "Gokulashtami", date: "August 16" },
    { name: "Independence Day", date: "August 15" },
    { name: "Ganesh Chaturthi", date: "August 27" },
    { name: "Gokulashtami", date: "August 16" },
    { name: "Independence Day", date: "August 15" },
    { name: "Ganesh Chaturthi", date: "August 27" },
    { name: "Gokulashtami", date: "August 16" },
    { name: "Independence Day", date: "August 15" },
  ],
};

interface SectionProps {
  title: string;
  icon: React.ReactNode;
  data: Array<{
    name: string;
    date: string;
  }>;
  emptyText: string;
  showViewAll?: boolean;
}

// const Section = ({ title, icon, data, emptyText, showViewAll }: SectionProps) => {
//   return (
//     <View style={styles.sectionWrapper}>
//       <View style={styles.sectionHeader}>
//         <View style={styles.headerLeft}>
//           <MaterialIcons name="event" size={20} color="white" />
//           <Text style={styles.sectionTitle}>Birthdays</Text>
//         </View>
//        <Text style={styles.viewAll}>View all</Text>
//       </View>

//       <ScrollView style={styles.sectionBody}>
//         {data.length === 0 ? (
//           <Text style={styles.emptyText}>No Birthday</Text>
//         ) : (
//           data.map((item, index) => (
//             <View style={styles.listItem}>
//               <FontAwesome5
//                 name="cloud-sun"
//                 size={18}
//                 color="#f97316"
//                 style={{ marginRight: 10 }}
//               />
//               <Text style={styles.itemName}>Independence Day</Text>
//               <Text style={styles.itemDate}>August 15</Text>
//             </View>
//           ))
//         )}
//       </ScrollView>
//     </View>
//   );
// };

const HomeScreen = () => {
  return (
    <ScrollView style={styles.container}>
      {/* Meeting */}
      <View style={styles.sectionWrapper}>
        <View style={styles.sectionHeader}>
          <View style={styles.headerLeft}>
            <MaterialIcons name="event" size={20} color="white" />
            <Text style={styles.sectionTitle}>Birthdays</Text>
          </View>
          <Text style={styles.viewAll}>View all</Text>
        </View>

        <ScrollView style={styles.sectionBody}>
          {/* <Text style={styles.emptyText}>No Birthday</Text> */}

          <View style={styles.listItem}>
            <FontAwesome5
              name="cloud-sun"
              size={18}
              color="#f97316"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.itemName}>Independence Day</Text>
            <Text style={styles.itemDate}>August 15</Text>
          </View>
          <View style={styles.listItem}>
            <FontAwesome5
              name="cloud-sun"
              size={18}
              color="#f97316"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.itemName}>Independence Day</Text>
            <Text style={styles.itemDate}>August 15</Text>
          </View>
          <View style={styles.listItem}>
            <FontAwesome5
              name="cloud-sun"
              size={18}
              color="#f97316"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.itemName}>Independence Day</Text>
            <Text style={styles.itemDate}>August 15</Text>
          </View>
          <View style={styles.listItem}>
            <FontAwesome5
              name="cloud-sun"
              size={18}
              color="#f97316"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.itemName}>Independence Day</Text>
            <Text style={styles.itemDate}>August 15</Text>
          </View>
          <View style={styles.listItem}>
            <FontAwesome5
              name="cloud-sun"
              size={18}
              color="#f97316"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.itemName}>Independence Day</Text>
            <Text style={styles.itemDate}>August 15</Text>
          </View>
          <View style={styles.listItem}>
            <FontAwesome5
              name="cloud-sun"
              size={18}
              color="#f97316"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.itemName}>Independence Day</Text>
            <Text style={styles.itemDate}>August 15</Text>
          </View>
          <View style={styles.listItem}>
            <FontAwesome5
              name="cloud-sun"
              size={18}
              color="#f97316"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.itemName}>Independence Day</Text>
            <Text style={styles.itemDate}>August 15</Text>
          </View>
          <View style={styles.listItem}>
            <FontAwesome5
              name="cloud-sun"
              size={18}
              color="#f97316"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.itemName}>Independence Day</Text>
            <Text style={styles.itemDate}>August 15</Text>
          </View>
        </ScrollView>
      </View>

      {/* Birthday */}
      <View style={styles.sectionWrapper}>
        <View style={styles.sectionHeader}>
          <View style={styles.headerLeft}>
            <MaterialIcons name="event" size={20} color="white" />
            <Text style={styles.sectionTitle}>Birthdays</Text>
          </View>
          <Text style={styles.viewAll}>View all</Text>
        </View>

        <ScrollView style={styles.sectionBody}>
          {/* <Text style={styles.emptyText}>No Birthday</Text> */}

          <View style={styles.listItem}>
            <FontAwesome5
              name="cloud-sun"
              size={18}
              color="#f97316"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.itemName}>Independence Day</Text>
            <Text style={styles.itemDate}>August 15</Text>
          </View>
          <View style={styles.listItem}>
            <FontAwesome5
              name="cloud-sun"
              size={18}
              color="#f97316"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.itemName}>Independence Day</Text>
            <Text style={styles.itemDate}>August 15</Text>
          </View>
          <View style={styles.listItem}>
            <FontAwesome5
              name="cloud-sun"
              size={18}
              color="#f97316"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.itemName}>Independence Day</Text>
            <Text style={styles.itemDate}>August 15</Text>
          </View>
          <View style={styles.listItem}>
            <FontAwesome5
              name="cloud-sun"
              size={18}
              color="#f97316"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.itemName}>Independence Day</Text>
            <Text style={styles.itemDate}>August 15</Text>
          </View>
          <View style={styles.listItem}>
            <FontAwesome5
              name="cloud-sun"
              size={18}
              color="#f97316"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.itemName}>Independence Day</Text>
            <Text style={styles.itemDate}>August 15</Text>
          </View>
          <View style={styles.listItem}>
            <FontAwesome5
              name="cloud-sun"
              size={18}
              color="#f97316"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.itemName}>Independence Day</Text>
            <Text style={styles.itemDate}>August 15</Text>
          </View>
          <View style={styles.listItem}>
            <FontAwesome5
              name="cloud-sun"
              size={18}
              color="#f97316"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.itemName}>Independence Day</Text>
            <Text style={styles.itemDate}>August 15</Text>
          </View>
          <View style={styles.listItem}>
            <FontAwesome5
              name="cloud-sun"
              size={18}
              color="#f97316"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.itemName}>Independence Day</Text>
            <Text style={styles.itemDate}>August 15</Text>
          </View>
        </ScrollView>
      </View>

      {/* Holidays */}
      <View style={styles.sectionWrapper}>
        <View style={styles.sectionHeader}>
          <View style={styles.headerLeft}>
            <MaterialIcons name="event" size={20} color="white" />
            <Text style={styles.sectionTitle}>Birthdays</Text>
          </View>
          <Text style={styles.viewAll}>View all</Text>
        </View>

        <ScrollView style={styles.sectionBody}>
          {/* <Text style={styles.emptyText}>No Birthday</Text> */}

          <View style={styles.listItem}>
            <FontAwesome5
              name="cloud-sun"
              size={18}
              color="#f97316"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.itemName}>Independence Day</Text>
            <Text style={styles.itemDate}>August 15</Text>
          </View>
          <View style={styles.listItem}>
            <FontAwesome5
              name="cloud-sun"
              size={18}
              color="#f97316"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.itemName}>Independence Day</Text>
            <Text style={styles.itemDate}>August 15</Text>
          </View>
          <View style={styles.listItem}>
            <FontAwesome5
              name="cloud-sun"
              size={18}
              color="#f97316"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.itemName}>Independence Day</Text>
            <Text style={styles.itemDate}>August 15</Text>
          </View>
          <View style={styles.listItem}>
            <FontAwesome5
              name="cloud-sun"
              size={18}
              color="#f97316"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.itemName}>Independence Day</Text>
            <Text style={styles.itemDate}>August 15</Text>
          </View>
          <View style={styles.listItem}>
            <FontAwesome5
              name="cloud-sun"
              size={18}
              color="#f97316"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.itemName}>Independence Day</Text>
            <Text style={styles.itemDate}>August 15</Text>
          </View>
          <View style={styles.listItem}>
            <FontAwesome5
              name="cloud-sun"
              size={18}
              color="#f97316"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.itemName}>Independence Day</Text>
            <Text style={styles.itemDate}>August 15</Text>
          </View>
          <View style={styles.listItem}>
            <FontAwesome5
              name="cloud-sun"
              size={18}
              color="#f97316"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.itemName}>Independence Day</Text>
            <Text style={styles.itemDate}>August 15</Text>
          </View>
          <View style={styles.listItem}>
            <FontAwesome5
              name="cloud-sun"
              size={18}
              color="#f97316"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.itemName}>Independence Day</Text>
            <Text style={styles.itemDate}>August 15</Text>
          </View>
        </ScrollView>
      </View>
      
    </ScrollView>
  );
};

export default HomeScreen;

const screenWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f1f5f9",
  },
  sectionWrapper: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 16,
    overflow: "hidden",
    elevation: 2,
    height: 300,
    overflowX: "hidden",
  },
  sectionHeader: {
    backgroundColor: "#1e293b",
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  viewAll: {
    color: "#60a5fa",
    fontSize: 14,
  },
  sectionBody: {
    backgroundColor: "#ffffff",
    flex:1
  },
  emptyText: {
    textAlign: "center",
    color: "#64748b",
    padding: 20,
    fontSize: 15,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  itemName: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
  },
  itemDate: {
    color: "#6b7280",
    fontSize: 14,
  },
});
