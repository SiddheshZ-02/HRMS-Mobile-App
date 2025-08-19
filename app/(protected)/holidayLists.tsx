import { Ionicons } from "@expo/vector-icons";
import { LegendList } from "@legendapp/list";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { RefreshControl } from "react-native-gesture-handler";
import { DatePickerModal } from "react-native-paper-dates";
import { Colors } from "../../constants/Colors";
import { BASE_URL } from "@/constants/Config";
import useAuthStore from "@/store/AuthStore";

const { width } = Dimensions.get("window");

// Responsive column widths based on screen size
const getColumnWidths = () => {
  const screenWidth = width;
  const isTablet = screenWidth > 768;
  return {
    // edit: isTablet ? 100 : 80,
    day: isTablet ? 230 : 230,
    date: isTablet ? 150 : 150,
   
  };
};

interface holidayType {
  id: number;
  dates: string;
  days: string;
}

// Robust date parser: supports ISO (YYYY-MM-DD) and DD-MM-YYYY (or DD/MM/YYYY)
const parseDateString = (value: string): Date | null => {
  if (!value) return null;
  const direct = new Date(value);
  if (!isNaN(direct.getTime())) return direct;
  const parts = value.split(/[-/]/).map((p) => p.trim());
  if (parts.length === 3) {
    // Heuristic: if first part has 4 digits, treat as YYYY-MM-DD
    if (parts[0].length === 4) {
      const year = Number(parts[0]);
      const month = Number(parts[1]);
      const day = Number(parts[2]);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        return new Date(year, month - 1, day);
      }
    } else {
      // Assume DD-MM-YYYY
      const day = Number(parts[0]);
      const month = Number(parts[1]);
      const year = Number(parts[2]);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        return new Date(year, month - 1, day);
      }
    }
  }
  return null;
};

const holidayLists = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [searchText, setSearchText] = useState("");
  const [itemsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [sortColumn, setSortColumn] = useState<keyof holidayType>("days");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [holidays, setHolidays] = useState<holidayType[]>([]);
  // console.log(holidays);

  const [loading, setLoading] = useState(true);
     const accessToken = useAuthStore((state) => state.accessToken);
     const [columnWidths, setColumnWidths] = useState(getColumnWidths());

  
  const router = useRouter();

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const response = await fetch(

        BASE_URL + `/holidays`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            accesstoken: accessToken || "",
          },
        }
      );
      const res = await response.json();
      setHolidays(Array.isArray(res) ? res : []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHolidays();
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
  const filteredHolidays = useMemo(() => {
    let result = [...holidays];

    // Search filter
    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      result = result.filter((item) =>
        [item.days?.toLowerCase()]
          .filter((value) => typeof value === "string")
          .some((value) => value.includes(lowerSearch))
      );
    }

    // Date range filter (inclusive by day with robust parsing)
    if (startDate && endDate) {
      const startBound = new Date(startDate);
      startBound.setHours(0, 0, 0, 0);
      const endBound = new Date(endDate);
      endBound.setHours(23, 59, 59, 999);

      result = result.filter((item) => {
        const parsed = parseDateString(item.dates);
        if (!parsed) return false;
        const itemDay = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
        return itemDay >= startBound && itemDay <= endBound;
      });
    }

    return result;
  }, [holidays, searchText, startDate, endDate]);

  // Sorting logic
  const sortedHolidays = useMemo(() => {
    return [...filteredHolidays].sort((a, b) => {
      let valueA = a[sortColumn];
      let valueB = b[sortColumn];

      // Handle dates column
    if (sortColumn === "dates") {
      // Convert to Date objects safely
      const dateA = valueA ? new Date(valueA) : new Date(0); 
      const dateB = valueB ? new Date(valueB) : new Date(0);

      return sortOrder === "asc"
        ? dateA.getTime() - dateB.getTime()
        : dateB.getTime() - dateA.getTime();
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
  }, [filteredHolidays, sortColumn, sortOrder]);

  // Pagination
  const paginatedHolidays = useMemo(() => {
    const from = page * itemsPerPage;
    return sortedHolidays.slice(from, from + itemsPerPage);
  }, [sortedHolidays, page, itemsPerPage]);

  const handleSort = useCallback(
    (column: keyof holidayType) => {
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
      (params: { startDate: any; endDate: any }) => {
        if (params.startDate && params.endDate) {
          onApply(new Date(params.startDate), new Date(params.endDate));
        }
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
        startDate={initialStartDate as any}
        endDate={initialEndDate as any}
        onConfirm={onConfirm}
        saveLabel="Apply Range"
        label="Select Date Range"
        animationType="fade"
      />
    );
  };

  const TableHeader = () => (
    <View
      style={[styles.tableHeader, { backgroundColor: colors.primary + "20", }]}
    >
      {/* <View
        style={[
          styles.headerCellContainer,
          { width: columnWidths.edit, borderRightColor: colors.border },
        ]}
      >
        <Text style={[styles.headerCell, { color: colors.textPrimary }]}>
          Edit
        </Text>
      </View> */}
      <View
        style={[
          styles.headerCellContainer,
          { width: columnWidths.date,borderRightColor: colors.textPrimary},
        ]}
      >
        <Text style={[styles.headerCell, { color: colors.textPrimary }]}>
          Date
        </Text>
      </View>
      <View
        style={[
          styles.headerCellContainer,
          { width: columnWidths.day},
        ]}
      >
        <Text style={[styles.headerCell, { color: colors.textPrimary }]}>
          Holiday Name
        </Text>
      </View>
    </View>
  );

  const HolidayListRow = ({
    item,
    index,
  }: {
    item: holidayType;
    index: number;
  }) => {
    // const startDateTime = new Date(item.expected_start_date);
    // const endDateTime = new Date(item.expected_end_date);

    return (
      <View
        style={[
          styles.tableRow,
          {
            backgroundColor:
              index % 2 === 0 ? colors.surface : colors.surfaceVariant,
            borderBottomColor: colors.border, borderRightColor:colors.textPrimary
          },
        ]}
      >
        {/* <View style={[styles.cellContainer, { width: columnWidths.edit }]}>
          <TouchableOpacity
            // onPress={() => router.push(`/edit-meeting/${item.meet_id}`)}
            style={styles.cell}
          >
            <Feather name="edit" size={14} color={colors.textPrimary} />
          </TouchableOpacity>
        </View> */}
        <View style={[styles.cellContainer, { width: columnWidths.date }]}>
          <Text
            selectable
            style={[styles.cell, styles.nameCell, { color: colors.primary }]}
          >
            {item.dates}
          </Text>
        </View>
        <View style={[styles.cellContainer, { width: columnWidths.day }]}>
          <Text
            selectable
            style={[styles.cell, styles.cell, { color: colors.textPrimary }]}
          >
            {item.days}
          </Text>
        </View>
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
        <View
          style={[
            styles.searchContainer,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Ionicons
            name="search"
            size={20}
            color={colors.textTertiary}
            style={styles.searchIcon}
          />
          <TextInput
            style={[styles.searchInput, { color: colors.textPrimary }]}
            placeholder="Search by holiday name..."
            value={searchText}
            onChangeText={(text) => {
              setSearchText(text);
              setPage(0);
            }}
            placeholderTextColor={colors.textTertiary}
          />
          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Ionicons
                name="close-circle"
                size={20}
                color={colors.textTertiary}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filtersContainer}>
          <View style={styles.filterLeft}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              onPress={() => setDateModalVisible(true)}
            >
              <Ionicons
                name="calendar-outline"
                size={16}
                color={colors.primary}
              />
              <Text
                style={[styles.filterButtonText, { color: colors.textPrimary }]}
              >
                {startDate && endDate ? "Date Filtered" : "Filter by Date"}
              </Text>
            </TouchableOpacity>
            {(startDate || endDate) && (
              <TouchableOpacity
                style={[
                  styles.clearFilterButton,
                  {
                    backgroundColor: colors.error + "15",
                    borderColor: colors.error + "30",
                  },
                ]}
                onPress={handleResetDateRange}
              >
                <Ionicons name="close" size={14} color={colors.error} />
                <Text style={[styles.clearFilterText, { color: colors.error }]}>
                  Clear
                </Text>
              </TouchableOpacity>
            )}
          </View>
          <View
            style={[
              styles.sortContainer,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
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
              containerStyle={[
                styles.pickerContainer,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              itemContainerStyle={{ backgroundColor: colors.surface }}
              activeColor={colors.primary + "20"}
            />
          </View>
        </View>

        <View style={styles.summaryContainer}>
          <Text style={[styles.summaryText, { color: colors.textSecondary }]}>
            Showing {paginatedHolidays.length} of {filteredHolidays.length} Holidays
          </Text>
        </View>

        <View
          style={[
            styles.tableContainer,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
              <Text
                style={[styles.loadingText, { color: colors.textSecondary }]}
              >
                Loading Holidays...
              </Text>
            </View>
          ) : (
            <ScrollView
              refreshControl={
                <RefreshControl
                  colors={[colors.primary]}
                  refreshing={loading}
                  onRefresh={fetchHolidays}
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
                {filteredHolidays.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Ionicons
                      name="people-outline"
                      size={64}
                      color={colors.textTertiary}
                    />
                    <Text
                      style={[styles.emptyTitle, { color: colors.textPrimary }]}
                    >
                      {holidays.length === 0
                        ? "No holidays found"
                        : "No matching holidays"}
                    </Text>
                    <Text
                      style={[
                        styles.emptySubtitle,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {holidays.length === 0
                        ? "Your holiday list is empty."
                        : "Try adjusting your search or filter criteria."}
                    </Text>
                  </View>
                ) : (
                  <LegendList
                    data={paginatedHolidays}
                    renderItem={({ item, index }) => (
                      <HolidayListRow item={item} index={index} />
                    )}
                    keyExtractor={(item) => item.id.toString()}
                    showsVerticalScrollIndicator={false}
                    recycleItems
                  />
                )}
              </View>
            </ScrollView>
          )}
        </View>

        {filteredHolidays.length > 0 && (
          <View
            style={[
              styles.paginationContainer,
              { backgroundColor: colors.surface, borderColor: colors.border },
            ]}
          >
            <Text
              style={[styles.paginationInfo, { color: colors.textSecondary }]}
            >
              {`${page * itemsPerPage + 1}-${Math.min(
                (page + 1) * itemsPerPage,
                filteredHolidays.length
              )} of ${filteredHolidays.length}`}
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
              <Text
                style={[styles.pageIndicator, { color: colors.textPrimary }]}
              >
                {page + 1}
              </Text>
              <TouchableOpacity
                onPress={() => setPage(page + 1)}
                disabled={
                  page >= Math.ceil(filteredHolidays.length / itemsPerPage) - 1
                }
                style={[
                  styles.paginationButton,
                  { backgroundColor: colors.surfaceVariant },
                  page >=
                    Math.ceil(filteredHolidays.length / itemsPerPage) - 1 &&
                    styles.disabledButton,
                ]}
              >
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={
                    page >=
                    Math.ceil(filteredHolidays.length / itemsPerPage) - 1
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

export default holidayLists;
