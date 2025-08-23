import { BASE_URL } from "@/constants/Config";
import useAuthStore from "@/store/AuthStore";
import { Ionicons } from "@expo/vector-icons";
import { LegendList } from "@legendapp/list";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { DatePickerModal, id } from "react-native-paper-dates";
import { Colors } from "../../constants/Colors";
import { IconButton } from "react-native-paper";

const { width } = Dimensions.get("window");

// Responsive column widths based on screen size
const getColumnWidths = () => {
  const screenWidth = width;
  const isTablet = screenWidth > 768;
  return {
    employee: isTablet ? 180 : 150,
    leavecategory: isTablet ? 120 : 100,
    type: isTablet ? 140 : 100,
    datefrom: isTablet ? 140 : 120,
    dateto: isTablet ? 140 : 120,
    leavetype: isTablet ? 140 : 120,
    reasonforleave: isTablet ? Math.max(150, screenWidth * 0.2) : 120,
    createddate: isTablet ? 140 : 120,
    forward: isTablet ? 140 : 120,
    pending: isTablet ? 140 : 120,
    action: isTablet ? 140 : 120,
    status: isTablet ? 140 : 120,
  };
};

interface leavetype {
  acceptRejectFlag: boolean;
  active: boolean;
  carried_forward_leave: string;
  company_id: number;
  currentdate: string;
  dateFrom: string;
  dateTo: string;
  employee: string;
  employee_id: number;
  fromDateYear: string;
  id: number;
  joining_date: string;
  leaveType: string;
  leavecategory: string;
  leavecategory_id: number;
  nDays: number;
  pending_leave_count:
    | Array<{
        employee_id: number;
        leave_category_id: number;
        leave_category_name: string;
        l_count: number;
      }>
    | null
    | undefined;
  probation_month_count: number;
  reason: string;
  toDateYear: string;
  type: "paid";
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

const manageLeaves = () => {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const [searchText, setSearchText] = useState("");
  const [itemsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [sortColumn, setSortColumn] =
    useState<keyof leavetype>("leavecategory");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isLeave, setIsLeave] = useState<leavetype[]>([]);
  const [loading, setLoading] = useState(true);
  const [columnWidths, setColumnWidths] = useState(getColumnWidths());
  const [isActive, setIsActive] = useState(false);
  const [isStatus, setIsStatus] = useState("");

  const router = useRouter();
  const { accessToken, setSessionTimeout } = useAuthStore((state) => state);
  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", () => {
      setColumnWidths(getColumnWidths());
    });
    return () => subscription?.remove();
  }, []);



   const showToast = (message: string) => {
      if (Platform.OS === "android") {
        ToastAndroid.show(message, ToastAndroid.SHORT);
      } else {
        Alert.alert("Notification", message);
      }
    };

  useFocusEffect(
    useCallback(() => {
      setSearchText("");
      setStartDate(null);
      setEndDate(null);
      setPage(0);
    }, [])
  );

  const fetchAcceptReject = async (active: string, id: number) => {
    // console.log(`Fetching ${active} for leave ID: ${id}`);

    try {
      const response = await fetch(BASE_URL + `/leaves/${active}/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          accesstoken: accessToken || " ",
        },
      });
      if (response.status === 200) {
        setIsActive(true);
        showToast("Status Change successfully");
        await fetchLeave();
      }

      // Process the data as needed
    } catch (error) {}
  };

  const handleAction = (actionType: "accept" | "reject", leaveId: number) => {
    if (actionType === "accept") {
      setIsStatus("accept");
      fetchAcceptReject("accept", leaveId);
    } else {
      fetchAcceptReject("reject", leaveId);
      setIsStatus("reject");
    }
  };

  useEffect(() => {
    handleAction("accept", 0);
  }, [handleAction]);

  const fetchLeave = async () => {
    setLoading(true);
    try {
      const response = await fetch(BASE_URL + `/leaves`, {
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
      setIsLeave(Array.isArray(data) ? data : []);
    } catch (error) {
      // console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeave();
  }, []);

  const filteredLeaves = useMemo(() => {
    let result = [...isLeave];
    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      result = result.filter((item) =>
        [
          item.leavecategory?.toLowerCase(),
          item.leaveType?.toLowerCase(),
          item.reason?.toLowerCase(),
          item.currentdate?.toLowerCase(),
        ].some((value) => value?.includes(lowerSearch))
      );
    }

    if (startDate && endDate) {
      const startBound = new Date(startDate);
      startBound.setHours(0, 0, 0, 0);
      const endBound = new Date(endDate);
      endBound.setHours(23, 59, 59, 999);
      result = result.filter((item) => {
        const parsed = parseDateString(item.currentdate);
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
  }, [isLeave, searchText, startDate, endDate]);

  const sortedLeaves = useMemo(() => {
    return [...filteredLeaves].sort((a, b) => {
      let valueA = a[sortColumn];
      let valueB = b[sortColumn];

      if (typeof valueA === "string" && typeof valueB === "string") {
        return sortOrder === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      }
      return sortOrder === "asc"
        ? (valueA as number) - (valueB as number)
        : (valueB as number) - (valueA as number);
    });
  }, [filteredLeaves, sortColumn, sortOrder]);

  const paginatedLeaves = useMemo(() => {
    const from = page * itemsPerPage;
    return sortedLeaves.slice(from, from + itemsPerPage);
  }, [sortedLeaves, page, itemsPerPage]);

  const handleSort = useCallback(
    (column: keyof leavetype) => {
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
      style={[styles.tableHeader, { backgroundColor: colors.primary + "20" }]}
    >
      <TouchableOpacity
        style={[
          styles.headerCellContainer,
          {
            width: columnWidths.employee,
            borderRightColor: colors.border,
          },
        ]}
      >
        <Text style={[styles.headerCell, { color: colors.textPrimary }]}>
          Employee Name
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.headerCellContainer,
          {
            width: columnWidths.leavecategory,
            borderRightColor: colors.border,
          },
        ]}
        onPress={() => handleSort("leavecategory")}
      >
        <Text style={[styles.headerCell, { color: colors.textPrimary }]}>
          Leave Category
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.headerCellContainer,
          { width: columnWidths.type, borderRightColor: colors.border },
        ]}
      >
        <Text style={[styles.headerCell, { color: colors.textPrimary }]}>
          Type
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.headerCellContainer,
          { width: columnWidths.datefrom, borderRightColor: colors.border },
        ]}
        onPress={() => handleSort("dateFrom")}
      >
        <Text style={[styles.headerCell, { color: colors.textPrimary }]}>
          Date From
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.headerCellContainer,
          { width: columnWidths.dateto, borderRightColor: colors.border },
        ]}
        onPress={() => handleSort("dateTo")}
      >
        <Text style={[styles.headerCell, { color: colors.textPrimary }]}>
          Date To
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.headerCellContainer,
          { width: columnWidths.leavetype, borderRightColor: colors.border },
        ]}
        onPress={() => handleSort("leaveType")}
      >
        <Text style={[styles.headerCell, { color: colors.textPrimary }]}>
          Leave Type
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.headerCellContainer,
          {
            width: columnWidths.reasonforleave,
            borderRightColor: colors.border,
          },
        ]}
        onPress={() => handleSort("reason")}
      >
        <Text style={[styles.headerCell, { color: colors.textPrimary }]}>
          Reason For Leave
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.headerCellContainer,
          { width: columnWidths.createddate, borderRightColor: colors.border },
        ]}
        onPress={() => handleSort("currentdate")}
      >
        <Text style={[styles.headerCell, { color: colors.textPrimary }]}>
          Created Date
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.headerCellContainer,
          { width: columnWidths.forward, borderRightColor: colors.border },
        ]}
      >
        <Text style={[styles.headerCell, { color: colors.textPrimary }]}>
          Carried Forward
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.headerCellContainer,
          { width: columnWidths.pending, borderRightColor: colors.border },
        ]}
      >
        <Text style={[styles.headerCell, { color: colors.textPrimary }]}>
          Pending Leave
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.headerCellContainer,
          { width: columnWidths.action, borderRightColor: colors.border },
        ]}
      >
        <Text style={[styles.headerCell, { color: colors.textPrimary }]}>
          Action
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

  const LeavesRow = ({ item, index }: { item: leavetype; index: number }) => {
    const status = !item.acceptRejectFlag
      ? "Pending"
      : item.acceptRejectFlag && item.active
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
        <View style={[styles.cellContainer, { width: columnWidths.employee }]}>
          <Text
            style={[
              styles.cell,
              styles.nameCell,
              { color: colors.textPrimary },
            ]}
          >
            {item.employee}
          </Text>
        </View>
        <View
          style={[styles.cellContainer, { width: columnWidths.leavecategory }]}
        >
          <Text
            style={[
              styles.cell,
              styles.nameCell,
              { color: colors.textPrimary },
            ]}
          >
            {item.leavecategory}
          </Text>
        </View>
        <View style={[styles.cellContainer, { width: columnWidths.type }]}>
          <Text style={[styles.cell, { color: colors.textPrimary }]}>
            {item.type}
          </Text>
        </View>

        <View style={[styles.cellContainer, { width: columnWidths.datefrom }]}>
          <Text
            style={[
              styles.cell,
              styles.dateCell,
              { color: colors.textSecondary },
            ]}
          >
            {item.dateFrom}
          </Text>
        </View>
        <View style={[styles.cellContainer, { width: columnWidths.dateto }]}>
          <Text
            style={[
              styles.cell,
              styles.dateCell,
              { color: colors.textSecondary },
            ]}
          >
            {item.dateTo}
          </Text>
        </View>
        <View style={[styles.cellContainer, { width: columnWidths.leavetype }]}>
          <Text style={[styles.cell, { color: colors.textPrimary }]}>
            {item.leaveType}
          </Text>
        </View>
        <View
          style={[styles.cellContainer, { width: columnWidths.reasonforleave }]}
        >
          <Text
            style={[styles.cell, { color: colors.textSecondary }]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {item.reason}
          </Text>
        </View>
        <View
          style={[styles.cellContainer, { width: columnWidths.createddate }]}
        >
          <Text
            style={[
              styles.cell,
              styles.dateCell,
              { color: colors.textSecondary },
            ]}
          >
            {item.currentdate}
          </Text>
        </View>
        <View style={[styles.cellContainer, { width: columnWidths.forward }]}>
          <Text
            style={[
              styles.cell,
              styles.dateCell,
              { color: colors.textSecondary },
            ]}
          >
            {item.carried_forward_leave}
          </Text>
        </View>
        <View style={[styles.cellContainer, { width: columnWidths.pending }]}>
          <Text
            style={[
              styles.cell,
              styles.dateCell,
              { color: colors.textSecondary },
            ]}
          >
            {Array.isArray(item.pending_leave_count) &&
            item.pending_leave_count.length > 0
              ? item.pending_leave_count
                  .map(
                    (leave) => `${leave.leave_category_name}: ${leave.l_count}`
                  )
                  .join(", ")
              : "N/A"}
          </Text>
        </View>
        <View style={[styles.cellContainer, { width: columnWidths.action }]}>
          <View
            style={{
              flexDirection: "row",
              gap: 16,
              padding: 10,
            }}
          >
            <TouchableOpacity onPress={() => handleAction("accept", item.id)}>
              <IconButton
                disabled={item.acceptRejectFlag && item.active}
                icon="check"
                size={18}
                iconColor="white"
                style={
                  item.acceptRejectFlag && item.active
                    ? {
                        borderColor: "#ccc",
                        backgroundColor: "#f5f5f5",
                        borderRadius: 6,
                      }
                    : {
                        borderColor: "#28a745",
                        backgroundColor: "#008000",
                        borderRadius: 6,
                      }
                }
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleAction("reject", item.id)}>
              <IconButton
                disabled={item.acceptRejectFlag && !item.active}
                icon="close"
                size={18}
                iconColor="white"
                style={
                  item.acceptRejectFlag && !item.active
                    ? {
                        borderColor: "#ccc",
                        backgroundColor: "#f5f5f5",
                        borderRadius: 6,
                      }
                    : {
                        borderColor: "#28a745",
                        backgroundColor: "#e74c3c",
                        borderRadius: 6,
                      }
                }
              />
            </TouchableOpacity>
          </View>
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
            placeholder="Search by category, leavetype, or reason..."
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
            Showing {paginatedLeaves.length} of {filteredLeaves.length} leaves
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
                {filteredLeaves.length === 0 ? (
                  <View style={styles.emptyContainer}>
                    <Ionicons
                      name="people-outline"
                      size={64}
                      color={colors.textTertiary}
                    />
                    <Text
                      style={[styles.emptyTitle, { color: colors.textPrimary }]}
                    >
                      {isLeave.length === 0
                        ? "No leaves found"
                        : "No matching leaves"}
                    </Text>
                    <Text
                      style={[
                        styles.emptySubtitle,
                        { color: colors.textSecondary },
                      ]}
                    >
                      {isLeave.length === 0
                        ? "Your leave list is empty."
                        : "Try adjusting your search or filter criteria."}
                    </Text>
                  </View>
                ) : (
                  <LegendList
                    data={paginatedLeaves}
                    renderItem={({ item, index }) => (
                      <LeavesRow item={item} index={index} />
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

        {filteredLeaves.length > 0 && (
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
                filteredLeaves.length
              )} of ${filteredLeaves.length}`}
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
                  page >= Math.ceil(filteredLeaves.length / itemsPerPage) - 1
                }
                style={[
                  styles.paginationButton,
                  { backgroundColor: colors.surfaceVariant },
                  page >= Math.ceil(filteredLeaves.length / itemsPerPage) - 1 &&
                    styles.disabledButton,
                ]}
              >
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={
                    page >= Math.ceil(filteredLeaves.length / itemsPerPage) - 1
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
    width: "28%",
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

export default manageLeaves;
