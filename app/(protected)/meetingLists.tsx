import { Ionicons } from "@expo/vector-icons";
import Feather from "@expo/vector-icons/Feather";
import { LegendList } from "@legendapp/list";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { RefreshControl } from "react-native-gesture-handler";
import { FAB } from "react-native-paper";
import { DatePickerModal } from "react-native-paper-dates";
import { Colors } from "../../constants/Colors";

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
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
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
    <View style={[styles.tableHeader, { backgroundColor: colors.primary + '20' }]}>
      <View style={[styles.headerCellContainer, { width: columnWidths.edit, borderRightColor: colors.border }]}>
        <Text style={[styles.headerCell, { color: colors.textPrimary }]}>Edit</Text>
      </View>
      <View style={[styles.headerCellContainer, { width: columnWidths.title, borderRightColor: colors.border }]}>
        <Text style={[styles.headerCell, { color: colors.textPrimary }]}>Title</Text>
      </View>
      <View style={[styles.headerCellContainer, { width: columnWidths.client, borderRightColor: colors.border }]}>
        <Text style={[styles.headerCell, { color: colors.textPrimary }]}>Client</Text>
      </View>
      <View style={[styles.headerCellContainer, { width: columnWidths.url, borderRightColor: colors.border }]}>
        <Text style={[styles.headerCell, { color: colors.textPrimary }]}>URL</Text>
      </View>
      <View style={[styles.headerCellContainer, { width: columnWidths.startdate, borderRightColor: colors.border }]}>
        <Text style={[styles.headerCell, { color: colors.textPrimary }]}> Start Date </Text>
      </View>
      <View style={[styles.headerCellContainer, { width: columnWidths.starttime, borderRightColor: colors.border }]}>
        <Text style={[styles.headerCell, { color: colors.textPrimary }]}>Start Time</Text>
      </View>
      <View style={[styles.headerCellContainer, { width: columnWidths.enddate, borderRightColor: colors.border }]}>
        <Text style={[styles.headerCell, { color: colors.textPrimary }]}>End Date</Text>
      </View>
      <View style={[styles.headerCellContainer, { width: columnWidths.endtime, borderRightColor: colors.border }]}>
        <Text style={[styles.headerCell, { color: colors.textPrimary }]}>End Time</Text>
      </View>
      <View style={[styles.headerCellContainer, { width: columnWidths.recording, borderRightColor: colors.border }]}>
        <Text style={[styles.headerCell, { color: colors.textPrimary }]}>Recording</Text>
      </View>
      <View style={[styles.headerCellContainer, { width: columnWidths.description, borderRightColor: colors.border }]}>
        <Text style={[styles.headerCell, { color: colors.textPrimary }]}>Description</Text>
      </View>
      <View style={[styles.headerCellContainer, { width: columnWidths.employee }]}>
        <Text style={[styles.headerCell, { color: colors.textPrimary }]}>Emplyoee</Text>
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
      <View style={[
        styles.tableRow, 
        { 
          backgroundColor: index % 2 === 0 ? colors.surface : colors.surfaceVariant,
          borderBottomColor: colors.border 
        }
      ]}>
        <View style={[styles.cellContainer, { width: columnWidths.edit }]}>
          <TouchableOpacity
            // onPress={() => router.push(`/edit-meeting/${item.meet_id}`)}
            style={styles.cell}
          >
            <Feather name="edit" size={14} color={colors.textPrimary} />
          </TouchableOpacity>
        </View>
        <View style={[styles.cellContainer, { width: columnWidths.title }]}>
          <Text selectable style={[styles.cell, styles.nameCell, { color: colors.primary }]}>
            {item.title}
          </Text>
        </View>
        <View style={[styles.cellContainer, { width: columnWidths.client }]}>
          <Text selectable style={[styles.cell, styles.cell, { color: colors.textPrimary }]}>
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
            style={[styles.emailCell, { color: colors.primary }]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {item.url}...
          </Text>
        </TouchableOpacity>
        <View style={[styles.cellContainer, { width: columnWidths.startdate }]}>
          <Text selectable style={[styles.cell, styles.dateCell, { color: colors.textSecondary }]}>
            {item.expected_start_date}
          </Text>
        </View>
        <View style={[styles.cellContainer, { width: columnWidths.starttime }]}>
          <Text selectable style={[styles.cell, styles.dateCell, { color: colors.textSecondary }]}>
            {item.expected_start_date}
          </Text>
        </View>
        <View style={[styles.cellContainer, { width: columnWidths.enddate }]}>
          <Text selectable style={[styles.cell, styles.dateCell, { color: colors.textSecondary }]}>
            {item.expected_end_date}
          </Text>
        </View>
        <View style={[styles.cellContainer, { width: columnWidths.endtime }]}>
          <Text selectable style={[styles.cell, styles.dateCell, { color: colors.textSecondary }]}>
            {item.expected_end_date}
          </Text>
        </View>
        <View style={[styles.cellContainer, { width: columnWidths.recording }]}>
          <Text selectable style={[styles.cell, styles.dateCell, { color: colors.textSecondary }]}>
            {item.recording_url || "N/A"}
          </Text>
        </View>
        <View style={[styles.cellContainer, { width: columnWidths.description }]}>
          <Text selectable style={[styles.cell, styles.dateCell, { color: colors.textSecondary }]}>
            {item.description}
          </Text>
        </View>

        {item.employee_id && item.employee_id.length > 0 && (
          <View style={[styles.cellContainer, { width: columnWidths.employee }]}>
            {(expandedRows[item.meet_id]
              ? item.employee_id
              : item.employee_id.slice(0, 3)
            ).map((emp, idx) => (
              <Text key={idx} numberOfLines={1} ellipsizeMode="tail" style={{ color: colors.textPrimary }}>
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
                <Text style={{ color: colors.primary }}>
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
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Ionicons
            name="search"
            size={20}
            color={colors.textTertiary}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search by title, client, description, or employee..."
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text);
              setPage(0);
            }}
            placeholderTextColor={colors.textTertiary}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filtersContainer}>
          <View style={styles.filterLeft}>
            <TouchableOpacity
              style={[styles.filterButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setDateModalVisible(true)}
            >
              <Ionicons name="calendar-outline" size={16} color={colors.primary} />
              <Text style={[styles.filterButtonText, { color: colors.textPrimary }]}>
                {startDate && endDate ? "Date Filtered" : "Filter by Date"}
              </Text>
            </TouchableOpacity>
            {(startDate || endDate) && (
              <TouchableOpacity
                style={[styles.clearFilterButton, { backgroundColor: colors.error + '15', borderColor: colors.error + '30' }]}
                onPress={handleResetDateRange}
              >
                <Ionicons name="close" size={14} color={colors.error} />
                <Text style={[styles.clearFilterText, { color: colors.error }]}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={[styles.sortContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
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
              placeholderStyle={{ color: colors.textTertiary }}
              selectedTextStyle={{ color: colors.textPrimary }}
              itemTextStyle={{ color: colors.textPrimary }}
              containerStyle={[styles.pickerContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}
              itemContainerStyle={{ backgroundColor: colors.surface }}
              activeColor={colors.primary + '20'}
            />
          </View>
        </View>

        <View style={styles.summaryContainer}>
          <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
            Showing {paginatedMeetings.length} of {filteredMeetings.length}{" "}
            meetings
          </Text>
        </View>

        <View style={[styles.tableContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>Loading meetings...</Text>
            </View>
          ) : (
            <ScrollView
              refreshControl={
                <RefreshControl
                  colors={[colors.primary]}
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
                    <Ionicons name="people-outline" size={64} color={colors.textTertiary} />
                    <Text style={[styles.emptyTitle, { color: colors.textPrimary }]}>
                      {meetingList.length === 0
                        ? "No meetings found"
                        : "No matching meetings"}
                    </Text>
                    <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
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
          <View style={[styles.paginationContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.paginationInfo, { color: colors.textSecondary }]}>
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
                  { backgroundColor: colors.surfaceVariant },
                  page === 0 && styles.disabledButton,
                ]}
              >
                <Ionicons
                  name="chevron-back"
                  size={20}
                  color={page === 0 ? colors.textTertiary : colors.primary}
                />
              </TouchableOpacity>
              <Text style={[styles.pageIndicator, { color: colors.textPrimary }]}>{page + 1}</Text>
              <TouchableOpacity
                onPress={() => setPage(page + 1)}
                disabled={
                  page >= Math.ceil(filteredMeetings.length / itemsPerPage) - 1
                }
                style={[
                  styles.paginationButton,
                  { backgroundColor: colors.surfaceVariant },
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
                      ? colors.textTertiary
                      : colors.primary
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

        <FAB
          icon="plus"
          style={{ position: "absolute", margin: 16, right: 0, bottom: "12%", backgroundColor: colors.primary }}
          onPress={()=>router.push("/(protected)/createMeeting")}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 10,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
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
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
  },
  filterButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  clearFilterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
  },
  clearFilterText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "500",
  },
  sortContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
  },
  pickerContainer: {
    borderRadius: 8,
    borderWidth: 1,
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
    fontWeight: "500",
  },
  tableContainer: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: "row",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerCellContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
    borderRightWidth: 1,
  },
  headerCell: {
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },
  sortableHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  activeSortHeader: {
    // color property removed as it's not valid for ViewStyle
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    minHeight: 60,
  },
  cellContainer: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 4,
  },
  cell: {
    fontSize: 13,
    textAlign: "center",
    paddingHorizontal: 2,
  },
  nameCell: {
    fontWeight: "600",
  },
  emailCell: {
    fontWeight: "500",
  },
  dateCell: {
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
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
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
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
  },
  paginationInfo: {
    fontSize: 14,
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
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  disabledButton: {
    opacity: 0.5,
  },
  pageIndicator: {
    fontSize: 16,
    fontWeight: "600",
    marginHorizontal: 16,
  },
});

export default MeetingList;

