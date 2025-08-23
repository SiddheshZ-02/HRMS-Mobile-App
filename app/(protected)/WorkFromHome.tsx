import { BASE_URL } from "@/constants/Config";
import useAuthStore from "@/store/AuthStore";
import { Ionicons } from "@expo/vector-icons";
import { LegendList } from "@legendapp/list";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { DatePickerModal } from "react-native-paper-dates";
import { Colors } from "../../constants/Colors";

const { width } = Dimensions.get("window");

// Responsive column widths based on screen size
const getColumnWidths = () => {
  const screenWidth = width;
  const isTablet = screenWidth > 768;
  return {
    datefrom: isTablet ? 140 : 120,
    work_type: isTablet ? 120 : 100,
    reason: isTablet ? Math.max(150, screenWidth * 0.2) : 120,
    currentdate: isTablet ? 140 : 120,
    status: isTablet ? 140 : 120,
  };
};

interface wfhType {
  id: number;
  dateFrom: string | null;
  reason: string | null;
  accept_reject_flag: boolean;
  active: boolean;
  currentdate: string | null;
  company_id: number;
  currenttime: string | null;
  work_type: string | null;
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

const WorkFromHome = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [searchText, setSearchText] = useState("");
  const [itemsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [sortColumn, setSortColumn] = useState<keyof wfhType>("currentdate");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isWfh, setIsWfh] = useState<wfhType[]>([]);
  const [loading, setLoading] = useState(true);
  const [columnWidths, setColumnWidths] = useState(getColumnWidths());

  const router = useRouter();

  const { accessToken, setSessionTimeout } = useAuthStore((state) => state);
  useEffect(() => {
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

  const fetchLeave = async () => {
    setLoading(true);
    try {
      const response = await fetch(BASE_URL + `/work_from_home_employee`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          accesstoken: accessToken || " ",
        },
      });

      if (response.status === 401) {
        setSessionTimeout(true);
        return;
      }

      const data = await response.json();
      setIsWfh(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeave();
  }, []);

  const filteredWfh = useMemo(() => {
    let result = [...isWfh];
    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      result = result.filter((item) =>
        [item.work_type?.toLowerCase(), item.reason?.toLowerCase()].some(
          (value) => value?.includes(lowerSearch)
        )
      );
    }

    if (startDate && endDate) {
      const startBound = new Date(startDate);
      startBound.setHours(0, 0, 0, 0);
      const endBound = new Date(endDate);
      endBound.setHours(23, 59, 59, 999);
      result = result.filter((item) => {
        // const parsedFrom = new Date(item.dateFrom);
        // return parsedFrom >= startBound && parsedFrom <= endBound;
        const parsed = parseDateString(item.dateFrom || "");
        if (!parsed) return false;
        const itemDay = new Date(
          parsed.getFullYear(),
          parsed.getMonth(),
          parsed.getDate()
        );
        return itemDay >= startBound && itemDay <= endBound;
      });
    }
    return result;
  }, [isWfh, searchText, startDate, endDate]);

  const sortedWfh = useMemo(() => {
    return [...filteredWfh].sort((a, b) => {
      let valueA = a[sortColumn];
      let valueB = b[sortColumn];

      // Handle date fields (dateFrom and currentdate)
      if (sortColumn === "currentdate") {
        const dateA = parseDateString(valueA as string) || new Date(0); // Fallback to epoch if invalid
        const dateB = parseDateString(valueB as string) || new Date(0);
        return sortOrder === "asc"
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
      }
    });
  }, [filteredWfh, sortColumn, sortOrder]);

  const paginatedWfh = useMemo(() => {
    const from = page * itemsPerPage;
    return sortedWfh.slice(from, from + itemsPerPage);
  }, [sortedWfh, page, itemsPerPage]);

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
      style={[styles.tableHeader, { backgroundColor: colors.primary + "20" }]}
    >
      <TouchableOpacity
        style={[
          styles.headerCellContainer,
          {
            width: columnWidths.datefrom,
            borderRightColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.headerCell, { color: colors.textPrimary }]}>
          Date
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.headerCellContainer,
          { width: columnWidths.reason, borderRightColor: colors.border },
        ]}
      >
        <Text style={[styles.headerCell, { color: colors.textPrimary }]}>
          Reason
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.headerCellContainer,
          {
            width: columnWidths.currentdate,
            borderRightColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.headerCell, { color: colors.textPrimary }]}>
          Created Date
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.headerCellContainer,
          { width: columnWidths.work_type, borderRightColor: colors.border },
        ]}
      >
        <Text style={[styles.headerCell, { color: colors.textPrimary }]}>
          WFH mode
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.headerCellContainer,
          { width: columnWidths.status, borderRightColor: colors.border },
        ]}
      >
        <Text style={[styles.headerCell, { color: colors.textPrimary }]}>
          Status
        </Text>
      </TouchableOpacity>
    </View>
  );

  const WfhRow = ({ item, index }: { item: wfhType; index: number }) => {
    const status = !item.accept_reject_flag
      ? "Pending"
      : item.accept_reject_flag && item.active
      ? "Approved"
      : "Rejected";

    return (
      <View
        style={[
          styles.tableRow,
          {
            backgroundColor:
              index % 2 === 0 ? colors.surface : colors.surfaceVariant,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={[styles.cellContainer, { width: columnWidths.datefrom }]}>
          <Text
            style={[
              styles.cell,
              styles.nameCell,
              { color: colors.textPrimary },
            ]}
          >
            {item.dateFrom}
          </Text>
        </View>
        <View style={[styles.cellContainer, { width: columnWidths.reason }]}>
          <Text style={[styles.cell, { color: colors.textPrimary }]}>
            {item.reason}
          </Text>
        </View>
        <View
          style={[styles.cellContainer, { width: columnWidths.currentdate }]}
        >
          <Text style={[styles.cell, { color: colors.textSecondary }]}>
            {item.currentdate}
          </Text>
        </View>
        <View style={[styles.cellContainer, { width: columnWidths.work_type }]}>
          <Text
            style={[
              styles.cell,
              styles.dateCell,
              { color: colors.textSecondary },
            ]}
          >
            {item.work_type}
          </Text>
        </View>

        <View style={[styles.cellContainer, { width: columnWidths.status }]}>
          <Text
            style={[
              styles.cell,
              {
                color:
                  status === "Approved"
                    ? colors.success
                    : status === "Rejected"
                    ? colors.error
                    : colors.accent,
              },
            ]}
          >
            {status}
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
            placeholder="Search by mode  or reason..."
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
            Showing {paginatedWfh.length} of {filteredWfh.length} leaves
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
                Loading leaves...
              </Text>
            </View>
          ) : (
            <ScrollView
              refreshControl={
                <RefreshControl
                  colors={[colors.primary]}
                  refreshing={loading}
                  onRefresh={fetchLeave}
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
                {filteredWfh.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Ionicons
                      name="people-outline"
                      size={64}
                      color={colors.textTertiary}
                    />
                    <Text
                      style={[styles.emptyTitle, { color: colors.textPrimary }]}
                    >
                      {isWfh.length === 0
                        ? "No WFH found"
                        : "No matching WFH requests"}
                    </Text>
                    <Text
                      style={[
                        styles.emptySubtitle,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {isWfh.length === 0
                        ? "Your WFH list is empty."
                        : "Try adjusting your search or filter criteria."}
                    </Text>
                  </View>
                ) : (
                  <LegendList
                    data={paginatedWfh}
                    renderItem={({ item, index }) => (
                      <WfhRow item={item} index={index} />
                    )}
                    keyExtractor={(item, idx) =>
                      item?.id?.toString() ?? String(item?.id) ?? String(idx)
                    }
                    showsVerticalScrollIndicator={false}
                    recycleItems
                  />
                )}
              </View>
            </ScrollView>
          )}
        </View>

        {filteredWfh.length > 0 && (
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
                filteredWfh.length
              )} of ${filteredWfh.length}`}
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
                  page >= Math.ceil(filteredWfh.length / itemsPerPage) - 1
                }
                style={[
                  styles.paginationButton,
                  { backgroundColor: colors.surfaceVariant },
                  page >= Math.ceil(filteredWfh.length / itemsPerPage) - 1 &&
                    styles.disabledButton,
                ]}
              >
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={
                    page >= Math.ceil(filteredWfh.length / itemsPerPage) - 1
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
    width: "60%",
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

export default WorkFromHome;
