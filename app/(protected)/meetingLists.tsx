import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ActivityIndicator,
  useColorScheme,
  Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { DatePickerModal } from "react-native-paper-dates";
import { LegendList } from "@legendapp/list";
import { Dropdown } from "react-native-element-dropdown";
import { RefreshControl } from "react-native-gesture-handler";
import Feather from "@expo/vector-icons/Feather";

const { width } = Dimensions.get("window");

// Responsive column widths based on screen size
const getColumnWidths = () => {
  const screenWidth = width;
  const isTablet = screenWidth > 768;
  return {
    edit: isTablet ? 100 : 80,
    title: isTablet ? 150 : 130,
    client: isTablet ? 150 : 150,
    url: isTablet ? Math.max(180, screenWidth * 0.15) : 180,
    startdate: isTablet ? Math.max(130, screenWidth * 0.15) : 110,
    starttime: isTablet ? Math.max(130, screenWidth * 0.15) : 110,
    enddate: isTablet ? Math.max(130, screenWidth * 0.15) : 110,
    endtime: isTablet ? Math.max(130, screenWidth * 0.15) : 110,
    recording: isTablet ? Math.max(200, screenWidth * 0.25) : 180,
    description: isTablet ? Math.max(200, screenWidth * 0.25) : 180,
    employee: isTablet ? Math.max(200, screenWidth * 0.25) : 180,
  };
};

interface MeetingType {
  meet_id: number;
  title: string;
  description: string;
  expected_start_date: string;
  expected_end_date: string;
  url: string;
  client_id: number;
  client_name: string;
  recording_url: string | null;
  employee_id: Array<{
    id: number;
    firstname: string;
    middlename: string;
    lastname: string;
    email: string;
  }>;
}

const MeetingList = () => {
  const scheme = useColorScheme();
  const [searchText, setSearchText] = useState("");
  const [itemsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [sortColumn, setSortColumn] = useState<keyof MeetingType>("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [meetingList, setMeetingList] = useState<MeetingType[]>([]);
  const [loading, setLoading] = useState(true);
  const [columnWidths, setColumnWidths] = useState(getColumnWidths());

  const [expandedRows, setExpandedRows] = useState<{ [id: number]: boolean }>(
    {}
  );
  const router = useRouter();

  const fetchMeeting = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        "https://hr1.actifyzone.com/hr-uat/HR/Portal/meeting",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            accesstoken:
              "cm7OTIqgm4tSCEXTDOIUzcxj71qTa7CaASVwwlzrUHYqNJMaX2znMkb4nXvx",
          },
        }
      );
      const res = await response.json();
      setMeetingList(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeeting();
    const subscription = Dimensions.addEventListener("change", () => {
      setColumnWidths(getColumnWidths());
    });
    return () => subscription?.remove();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setSearchText("");
      setStartDate(null);
      setEndDate(null);
      setPage(0);
    }, [])
  );

  // Filter and search logic
  const filteredMeetings = useMemo(() => {
    let result = [...meetingList];

    // Search filter
    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      result = result.filter((item) =>
        [
          item.title?.toLowerCase(),
          item.client_name?.toLowerCase(),
          item.description?.toLowerCase(),
          ...item.employee_id?.map(
            (emp) =>
              `${emp.firstname?.toLowerCase() || ""} ${
                emp.lastname?.toLowerCase() || ""
              }`
          ),
        ]
          .filter((value) => typeof value === "string")
          .some((value) => value.includes(lowerSearch))
      );
    }

    // Date range filter
    if (startDate && endDate) {
      result = result.filter((item) => {
        const start = new Date(item.expected_start_date);
        return start >= startDate && start <= endDate;
      });
    }

    return result;
  }, [meetingList, searchText, startDate, endDate]);

  // Sorting logic
  const sortedMeetings = useMemo(() => {
    return [...filteredMeetings].sort((a, b) => {
      let valueA = a[sortColumn];
      let valueB = b[sortColumn];

      // Handle employee_id array
      if (sortColumn === "employee_id") {
        valueA = a.employee_id[0]?.firstname || "";
        valueB = b.employee_id[0]?.firstname || "";
      }

      if (typeof valueA === "string" && typeof valueB === "string") {
        return sortOrder === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }

      return sortOrder === "asc"
        ? (valueA as number) - (valueB as number)
        : (valueB as number) - (valueA as number);
    });
  }, [filteredMeetings, sortColumn, sortOrder]);

  // Pagination
  const paginatedMeetings = useMemo(() => {
    const from = page * itemsPerPage;
    return sortedMeetings.slice(from, from + itemsPerPage);
  }, [sortedMeetings, page, itemsPerPage]);

  const handleSort = useCallback(
    (column: keyof MeetingType) => {
      if (sortColumn === column) {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      } else {
        setSortColumn(column);
        setSortOrder("asc");
      }
      setPage(0);
    },
    [sortColumn, sortOrder]
  );

  const handleCloseModal = useCallback(() => {
    setDateModalVisible(false);
  }, []);

  const handleApplyDateRange = useCallback((start: Date, end: Date) => {
    setStartDate(start);
    setEndDate(end);
    setPage(0);
  }, []);

  const handleResetDateRange = useCallback(() => {
    setStartDate(null);
    setEndDate(null);
    setPage(0);
  }, []);

  const DateRangeModal = ({
    visible,
    onClose,
    onApply,
    initialStartDate,
    initialEndDate,
  }: {
    visible: boolean;
    onClose: () => void;
    onApply: (startDate: Date, endDate: Date) => void;
    initialStartDate: Date | null;
    initialEndDate: Date | null;
  }) => {
    const onConfirm = useCallback(
      (params: { startDate: Date; endDate: Date }) => {
        onApply(params.startDate, params.endDate);
        onClose();
      },
      [onApply, onClose]
    );

    return (
      <DatePickerModal
        locale="en"
        mode="range"
        visible={visible}
        onDismiss={onClose}
        startDate={initialStartDate}
        endDate={initialEndDate}
        onConfirm={onConfirm}
        saveLabel="Apply Range"
        label="Select Date Range"
        animationType="fade"
      />
    );
  };

  const TableHeader = () => (
    <View style={styles.tableHeader}>
      <View style={[styles.headerCellContainer, { width: columnWidths.edit }]}>
        <Text style={styles.headerCell}>Edit</Text>
      </View>
      <View style={[styles.headerCellContainer, { width: columnWidths.title }]}>
        <Text style={styles.headerCell}>Title</Text>
      </View>
      <View
        style={[styles.headerCellContainer, { width: columnWidths.client }]}
      >
        <Text style={styles.headerCell}>Client</Text>
      </View>
      <View style={[styles.headerCellContainer, { width: columnWidths.url }]}>
        <Text style={styles.headerCell}>URL</Text>
      </View>

      <View
        style={[styles.headerCellContainer, { width: columnWidths.startdate }]}
      >
        <Text style={styles.headerCell}> Start Date </Text>
      </View>

      <View
        style={[styles.headerCellContainer, { width: columnWidths.starttime }]}
      >
        <Text style={styles.headerCell}>Start Time</Text>
      </View>
      <View
        style={[styles.headerCellContainer, { width: columnWidths.enddate }]}
      >
        <Text style={styles.headerCell}>End Date</Text>
      </View>
      <View
        style={[styles.headerCellContainer, { width: columnWidths.endtime }]}
      >
        <Text style={styles.headerCell}>End Time</Text>
      </View>
      <View
        style={[styles.headerCellContainer, { width: columnWidths.recording }]}
      >
        <Text style={styles.headerCell}>Recording</Text>
      </View>
      <View
        style={[
          styles.headerCellContainer,
          { width: columnWidths.description },
        ]}
      >
        <Text style={styles.headerCell}>Description</Text>
      </View>
      <View
        style={[styles.headerCellContainer, { width: columnWidths.employee }]}
      >
        <Text style={styles.headerCell}>Emplyoee</Text>
      </View>
    </View>
  );

  const MeetingListRow = ({
    item,
    index,
  }: {
    item: MeetingType;
    index: number;
  }) => {
    const startDateTime = new Date(item.expected_start_date);
    const endDateTime = new Date(item.expected_end_date);

    return (
      <View style={[styles.tableRow, index % 2 === 0 && styles.evenRow]}>
        <View style={[styles.cellContainer, { width: columnWidths.edit }]}>
          <TouchableOpacity
            // onPress={() => router.push(`/edit-meeting/${item.meet_id}`)}
            style={styles.cell}
          >
            <Feather name="edit" size={14} color="black" />
          </TouchableOpacity>
        </View>
        <View style={[styles.cellContainer, { width: columnWidths.title }]}>
          <Text selectable style={[styles.cell, styles.nameCell]}>
            {item.title}
          </Text>
        </View>
        <View style={[styles.cellContainer, { width: columnWidths.client }]}>
          <Text selectable style={[styles.cell, styles.cell]}>
            {item.client_name}
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            if (item.url) Linking.openURL(item.url);
          }}
          style={[styles.cellContainer, { width: columnWidths.url }]}
        >
          <Text
            selectable
            style={styles.emailCell}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {item.url}...
          </Text>
        </TouchableOpacity>
        <View style={[styles.cellContainer, { width: columnWidths.startdate }]}>
          <Text selectable style={[styles.cell, styles.dateCell]}>
            {item.expected_start_date}
          </Text>
        </View>
        <View style={[styles.cellContainer, { width: columnWidths.starttime }]}>
          <Text selectable style={[styles.cell, styles.dateCell]}>
            {item.expected_start_date}
          </Text>
        </View>
        <View style={[styles.cellContainer, { width: columnWidths.enddate }]}>
          <Text selectable style={[styles.cell, styles.dateCell]}>
            {item.expected_end_date}
          </Text>
        </View>
        <View style={[styles.cellContainer, { width: columnWidths.endtime }]}>
          <Text selectable style={[styles.cell, styles.dateCell]}>
            {item.expected_end_date}
          </Text>
        </View>
        <View style={[styles.cellContainer, { width: columnWidths.recording }]}>
          <Text selectable style={[styles.cell, styles.dateCell]}>
            {item.recording_url || "N/A"}
          </Text>
        </View>
        <View
          style={[styles.cellContainer, { width: columnWidths.description }]}
        >
          <Text selectable style={[styles.cell, styles.dateCell]}>
            {item.description}
          </Text>
        </View>

        {item.employee_id && item.employee_id.length > 0 && (
          <View
            style={[styles.cellContainer, { width: columnWidths.employee }]}
          >
            {(expandedRows[item.meet_id]
              ? item.employee_id
              : item.employee_id.slice(0, 3)
            ).map((emp, idx) => (
              <Text key={idx} numberOfLines={1} ellipsizeMode="tail">
                {`${emp.firstname} ${emp.lastname}`}
              </Text>
            ))}

            {item.employee_id.length > 3 && (
              <TouchableOpacity
                onPress={() =>
                  setExpandedRows((prev) => ({
                    ...prev,
                    [item.meet_id]: !prev[item.meet_id],
                  }))
                }
              >
                <Text style={{ color: "blue" }}>
                  {expandedRows[item.meet_id]
                    ? "Show less"
                    : `+${item.employee_id.length - 3} more`}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  const totalTableWidth = Object.values(columnWidths).reduce(
    (sum, width) => sum + width,
    0
  );

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#9CA3AF"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by title, client, description, or employee..."
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text);
              setPage(0);
            }}
            placeholderTextColor="#9CA3AF"
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Ionicons name="close-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filtersContainer}>
          <View style={styles.filterLeft}>
            <TouchableOpacity
              style={styles.filterButton}
              onPress={() => setDateModalVisible(true)}
            >
              <Ionicons name="calendar-outline" size={16} color="#356beaff" />
              <Text style={styles.filterButtonText}>
                {startDate && endDate ? "Date Filtered" : "Filter by Date"}
              </Text>
            </TouchableOpacity>
            {(startDate || endDate) && (
              <TouchableOpacity
                style={styles.clearFilterButton}
                onPress={handleResetDateRange}
              >
                <Ionicons name="close" size={14} color="#EF4444" />
                <Text style={styles.clearFilterText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.sortContainer}>
            <Dropdown
              data={[
                { label: "↑ Ascending", value: "asc" },
                { label: "↓ Descending", value: "desc" },
              ]}
              labelField="label"
              valueField="value"
              value={sortOrder}
              onChange={(item) => {
                setSortOrder(item.value);
                setPage(0);
              }}
              style={styles.picker}
              placeholder="Sort Order"
              placeholderStyle={{ color: "#9CA3AF" }}
              selectedTextStyle={{ color: "#111827" }}
              itemTextStyle={{ color: "#111827" }}
              containerStyle={styles.pickerContainer}
            />
          </View>
        </View>

        <View style={styles.summaryContainer}>
          <Text style={styles.summaryText}>
            Showing {paginatedMeetings.length} of {filteredMeetings.length}{" "}
            meetings
          </Text>
        </View>

        <View style={styles.tableContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6366F1" />
              <Text style={styles.loadingText}>Loading meetings...</Text>
            </View>
          ) : (
            <ScrollView
              refreshControl={
                <RefreshControl
                  colors={["#0049e5ff"]}
                  refreshing={loading}
                  onRefresh={fetchMeeting}
                />
              }
              overScrollMode="never"
              horizontal
              showsHorizontalScrollIndicator={true}
              contentContainerStyle={{
                minWidth: Math.max(width - 20, totalTableWidth),
              }}
            >
              <View style={{ width: totalTableWidth }}>
                <TableHeader />
                {filteredMeetings.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="people-outline" size={64} color="#D1D5DB" />
                    <Text style={styles.emptyTitle}>
                      {meetingList.length === 0
                        ? "No meetings found"
                        : "No matching meetings"}
                    </Text>
                    <Text style={styles.emptySubtitle}>
                      {meetingList.length === 0
                        ? "Your meeting list is empty."
                        : "Try adjusting your search or filter criteria."}
                    </Text>
                  </View>
                ) : (
                  <LegendList
                    data={paginatedMeetings}
                    renderItem={({ item, index }) => (
                      <MeetingListRow item={item} index={index} />
                    )}
                    keyExtractor={(item) => item.meet_id.toString()}
                    showsVerticalScrollIndicator={false}
                    recycleItems
                  />
                )}
              </View>
            </ScrollView>
          )}
        </View>

        {filteredMeetings.length > 0 && (
          <View style={styles.paginationContainer}>
            <Text style={styles.paginationInfo}>
              {`${page * itemsPerPage + 1}-${Math.min(
                (page + 1) * itemsPerPage,
                filteredMeetings.length
              )} of ${filteredMeetings.length}`}
            </Text>
            <View style={styles.paginationControls}>
              <TouchableOpacity
                onPress={() => setPage(page - 1)}
                disabled={page === 0}
                style={[
                  styles.paginationButton,
                  page === 0 && styles.disabledButton,
                ]}
              >
                <Ionicons
                  name="chevron-back"
                  size={20}
                  color={page === 0 ? "#D1D5DB" : "#6366F1"}
                />
              </TouchableOpacity>
              <Text style={styles.pageIndicator}>{page + 1}</Text>
              <TouchableOpacity
                onPress={() => setPage(page + 1)}
                disabled={
                  page >= Math.ceil(filteredMeetings.length / itemsPerPage) - 1
                }
                style={[
                  styles.paginationButton,
                  page >=
                    Math.ceil(filteredMeetings.length / itemsPerPage) - 1 &&
                    styles.disabledButton,
                ]}
              >
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={
                    page >=
                    Math.ceil(filteredMeetings.length / itemsPerPage) - 1
                      ? "#D1D5DB"
                      : "#6366F1"
                  }
                />
              </TouchableOpacity>
            </View>
          </View>
        )}

        <DateRangeModal
          visible={dateModalVisible}
          onClose={handleCloseModal}
          onApply={handleApplyDateRange}
          onReset={handleResetDateRange}
          initialStartDate={startDate}
          initialEndDate={endDate}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  content: {
    flex: 1,
    padding: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#111827",
    paddingVertical: 4,
  },
  filtersContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  filterLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 8,
  },
  filterButtonText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#374151",
    fontWeight: "500",
  },
  clearFilterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#FEF2F2",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  clearFilterText: {
    marginLeft: 4,
    fontSize: 12,
    color: "#EF4444",
    fontWeight: "500",
  },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    backgroundColor: "#FFFFFF",
  },
  pickerContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    minWidth: 100,
  },
  picker: {
    padding: 8,
    width: 140,
  },
  summaryContainer: {
    marginBottom: 12,
  },
  summaryText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  tableContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#acd4ffff",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerCellContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderRightWidth: 1,
    borderRightColor: "#d2ecffb8",
  },
  headerCell: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    textAlign: "center",
  },
  sortableHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  activeSortHeader: {
    color: "#004da4ff",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    backgroundColor: "#FFFFFF",
    minHeight: 60,
  },
  evenRow: {
    backgroundColor: "#FAFBFC",
  },
  cellContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  cell: {
    fontSize: 13,
    color: "#374151",
    textAlign: "center",
    paddingHorizontal: 2,
  },
  nameCell: {
    color: "#6366F1",
    fontWeight: "600",
  },
  emailCell: {
    color: "#6366F1",
  },
  dateCell: {
    color: "#6B7280",
    fontSize: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "500",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,

    width: "25%",
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 32,
  },
  paginationContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 16,
  },
  paginationInfo: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  paginationControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  paginationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  disabledButton: {
    backgroundColor: "#F9FAFB",
  },
  pageIndicator: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginHorizontal: 16,
  },
});

export default MeetingList;
