import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  ScrollView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
  Linking,
  ActivityIndicator,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { DatePickerModal } from "react-native-paper-dates";
import { LegendList } from "@legendapp/list";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { Dropdown } from "react-native-element-dropdown";
import { RefreshControl } from "react-native-gesture-handler";

import Feather from "@expo/vector-icons/Feather";

const { width } = Dimensions.get("window");

// Responsive column widths based on screen size
const getColumnWidths = () => {
  const screenWidth = width;
  const isTablet = screenWidth > 768;
  if (isTablet) {
    return {
      date: 100,
      intime: 120,
      outtime: 120,
      workinghours: Math.max(140, screenWidth * 0.15),
      actualworkinghours: Math.max(200, screenWidth * 0.25),
      workmode: Math.max(130, screenWidth * 0.15),
     
     
    };
  } else {
    return {
      date: 100,
      intime: 100,
      outtime: 120,
      workinghours: 120,
      actualworkinghours: 180,
      workmode: 110,
     
    };
  }
};

const ContactsList = () => {
  const scheme = useColorScheme();
  const [searchText, setSearchText] = useState("");
  const [itemsPerPage] = useState(10);
  const [page, setPage] = useState(0);
  const [sortColumn, setSortColumn] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [dateModalVisible, setDateModalVisible] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [loading, setLoading] = useState(true);
  const [columnWidths, setColumnWidths] = useState(getColumnWidths());

  // Update column widths on orientation change
  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", () => {
      setColumnWidths(getColumnWidths());
    });
    return () => subscription?.remove();
  }, []);

  // ✅ FIX 1: Removed sort state resets from useFocusEffect
  useFocusEffect(
    useCallback(() => {
      setSearchText("");
      setStartDate(null);
      setEndDate(null);
      setPage(0);
      // setSortColumn(""); // This was incorrectly clearing the sort state
      // setSortOrder(""); // This was incorrectly clearing the sort state
    }, [])
  );

  const Router = useRouter();

  const DateRangeModal = ({
    visible,
    onClose,
    onApply,
    onReset,
    initialStartDate,
    initialEndDate,
  }: {
    visible: boolean;
    onClose: () => void;
    onApply: (startDate: Date, endDate: Date) => void;
    onReset: () => void;
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
      <>
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
      </>
    );
  };

  const from = page * itemsPerPage;
  const to = Math.min((page + 1) * itemsPerPage);

  const handleSort = useCallback(
    (column: string) => {
      if (sortColumn === column) {
        setSortOrder(sortOrder === "asc" ? "desc" : "asc");
      } else {
        setSortColumn(column);
        setSortOrder("asc");
      }
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

  const TableHeader = () => (
    <View style={styles.tableHeader}>
      <View style={[styles.headerCellContainer, { width: columnWidths.date }]}>
        <Text style={styles.headerCell}>Date</Text>
      </View>
      <View
        style={[styles.headerCellContainer, { width: columnWidths.intime }]}
      >
        <Text style={styles.headerCell}>In time</Text>
      </View>
      <View
        style={[styles.headerCellContainer, { width: columnWidths.outtime }]}
      >
        <Text style={styles.headerCell}>Out Time</Text>
      </View>
      <View
        style={[
          styles.headerCellContainer,
          { width: columnWidths.workinghours },
        ]}
      >
        <Text style={styles.headerCell}>Working Hours</Text>
      </View>

      <View
        style={[
          styles.headerCellContainer,
          { width: columnWidths.actualworkinghours },
        ]}
      >
        <Text style={styles.headerCell}> Actual Working Hours </Text>
      </View>

      <View
        style={[styles.headerCellContainer, { width: columnWidths.workmode }]}
      >
        <Text style={styles.headerCell}>Work Mode</Text>
      </View>
    </View>
  );

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
            placeholder="Search contacts by name, email, or phone..."
            value={searchText}
            onChangeText={setSearchText}
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
            <View style={styles.pickerContainer}>
              <Dropdown
                data={[
                  { label: "↑ Ascending", value: "asc" },
                  { label: "↓ Descending", value: "desc" },
                ]}
                labelField={"label"}
                valueField={"value"}
                value={sortOrder}
                onChange={(item) => {
                  setSortOrder(item.value);
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
        </View>

        {/* {!loading && (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryText}>
              Showing {filteredContacts.length} of {user.length} contacts
            </Text>
          </View>
        )} */}

        <View style={styles.tableContainer}>
          {/* {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6366F1" />
              <Text style={styles.loadingText}>Loading contacts...</Text>
            </View>
          ) : ( */}
          <ScrollView
            // refreshControl={
            //   <RefreshControl
            //     colors={["#0049e5ff"]}
            //     refreshing={loading}
            //     onRefresh={fetchData}
            //   />
            // }
            overScrollMode="never"
            horizontal
            showsHorizontalScrollIndicator={true}
            contentContainerStyle={{
              minWidth: Math.max(width - 20, totalTableWidth),
            }}
          >
            <View style={{ width: totalTableWidth }}>
              <TableHeader />
              {/* <LegendList
                  data={paginatedContacts}
                  renderItem={({ item, index }) => (
                    <ContactRow item={item} index={index} />
                  )}
                  keyExtractor={(item) => item.id.toString()}
                  showsVerticalScrollIndicator={false}
                  recycleItems
                /> */}
            </View>
          </ScrollView>
          {/* )} */}
        </View>

        {/* {!loading && sortedContacts.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>
              {user.length === 0 ? "No contacts found" : "No matching contacts"}
            </Text>
            <Text style={styles.emptySubtitle}>
              {user.length === 0
                ? "Your contact list is empty. Add some contacts to get started."
                : "Try adjusting your search or filter criteria."}
            </Text>
          </View>
        )} */}
        {/* 
        {filteredContacts.length > 0 && (
          <View style={styles.paginationContainer}>
            <Text style={styles.paginationInfo}>
              {`${from + 1}-${to} of ${filteredContacts.length}`}
            </Text>
            <View style={styles.paginationControls}>
              <TouchableOpacity
                onPress={() => page > 0 && setPage(page - 1)}
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
                onPress={() =>
                  page <
                    Math.ceil(filteredContacts.length / itemsPerPage) - 1 &&
                  setPage(page + 1)
                }
                disabled={
                  page >= Math.ceil(filteredContacts.length / itemsPerPage) - 1
                }
                style={[
                  styles.paginationButton,
                  page >=
                    Math.ceil(filteredContacts.length / itemsPerPage) - 1 &&
                    styles.disabledButton,
                ]}
              >
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={
                    page >=
                    Math.ceil(filteredContacts.length / itemsPerPage) - 1
                      ? "#D1D5DB"
                      : "#6366F1"
                  }
                />
              </TouchableOpacity>
            </View>
          </View>
        )} */}
      </View>

      <DateRangeModal
        visible={dateModalVisible}
        onClose={handleCloseModal}
        onApply={handleApplyDateRange}
        onReset={handleResetDateRange}
        initialStartDate={startDate}
        initialEndDate={endDate}
      />
    </View>
  );
};

export default ContactsList;
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
  },
  sortLabel: {
    fontSize: 14,
    color: "#6B7280",
    marginRight: 8,
    fontWeight: "500",
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
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    width: "100%",
    gap: 4,
  },
  actionIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  convertButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#EEF2FF",
    justifyContent: "center",
    alignItems: "center",
  },
  dashText: {
    color: "#9CA3AF",
    fontSize: 14,
    fontWeight: "bold",
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
  // Updated Modal Styles
  modalContainer: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    margin: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    textAlign: "center",
    marginBottom: 24,
  },
  // New style for the date range button
  dateRangeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 24,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#F9FAFB",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 16,
  },
  dateButtonText: {
    marginLeft: 12,
    fontSize: 16,
    color: "#374151",
    fontWeight: "500",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 16,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: "#F3F4F6",
    borderRadius: 10,
    marginRight: 8,
    alignItems: "center",
  },
  modalCancelText: {
    fontSize: 16,
    color: "#6B7280",
    fontWeight: "600",
  },
  modalApplyButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: "#000000ff",
    borderRadius: 10,
    marginLeft: 8,
    alignItems: "center",
  },
  modalApplyText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "600",
  },
  modalResetButton: {
    alignItems: "center",
    paddingVertical: 12,
  },
  modalResetText: {
    fontSize: 16,
    color: "#EF4444",
    fontWeight: "600",
  },
});
