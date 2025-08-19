import React, { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  Platform,
  useColorScheme,
  Dimensions,
  RefreshControl,
  ToastAndroid,
  Alert,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { DatePickerModal } from "react-native-paper-dates";
import { FontAwesome } from "@expo/vector-icons";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { Colors } from "@/constants/Colors";
import { useFocusEffect } from "expo-router";
import { Badge } from "react-native-paper";
import useAuthStore from "@/store/AuthStore";
import { BASE_URL } from "@/constants/Config";
import SelectDropdown from "react-native-select-dropdown";

const { height, width } = Dimensions.get("window");

// Responsive breakpoints
const isTablet = width > 768;

// Responsive dimensions
const getResponsiveDimensions = () => ({
  padding: isTablet ? 24 : 18,
  fontSize: {
    title: isTablet ? 24 : 20,
    body: isTablet ? 18 : 16,
    small: isTablet ? 16 : 14,
  },
  inputHeight: isTablet ? 50 : 44,
});

interface LeaveFormType {
  leaveCategory: string;
  leaveType: string;
  startDate: Date | null;
  endDate: Date | null;
  reason: string;
}

interface SelectType {
  id: string;
  title: string;
  icon: string;
}

interface LeaveType {
  employee_id: number;
  leave_category_id: number;
  leave_category_name: string;
  leave_count: number;
  total_leave_count: number;
}

export default function ApplyLeaveScreen() {
  const dimensions = getResponsiveDimensions();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<LeaveFormType>({
    defaultValues: {
      leaveCategory: "",
      leaveType: "",
      startDate: null,
      endDate: null,
      reason: "",
    },
  });

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const leaveCategoryDropdownRef = useRef<any>(null);
  const leaveTypeDropdownRef = useRef<any>(null);
  const [leaves, setLeaves] = useState<LeaveType[]>([]);

  // Define leave category and type options with icons
  const leaveCategories: SelectType[] = [
    { id: "1", title: "Unpaid Leave", icon: "calendar-remove" },
    { id: "2", title: "General Leave", icon: "calendar-check" },
  ];

  const leaveTypes: SelectType[] = [
    { id: "1", title: "Half Day", icon: "clock-time-four-outline" },
    { id: "2", title: "Full Day", icon: "clock-time-eight-outline" },
  ];

  const [leaveCategorySuggestions, setLeaveCategorySuggestions] =
    useState<SelectType[]>(leaveCategories);
  const [leaveTypeSuggestions, setLeaveTypeSuggestions] =
    useState<SelectType[]>(leaveTypes);
  const [selectedLeaveCategory, setSelectedLeaveCategory] =
    useState<SelectType | null>(null);
  const [selectedLeaveType, setSelectedLeaveType] = useState<SelectType | null>(
    null
  );

  const accessToken = useAuthStore((state) => state.accessToken);

  const showToast = (message: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert("Notification", message);
    }
  };

  const fetchLeaves = async () => {
    try {
      const response = await fetch(`${BASE_URL}/show/leave`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          accesstoken: accessToken || "",
        },
      });
      const data = await response.json();
      setLeaves(Array.isArray(data) ? data : []);
      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch leaves");
      }
    } catch (error) {
      console.error("Error fetching leaves:", error);
      showToast("Failed to fetch leaves");
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchLeaves();
    }
  }, [accessToken]);

  const formatDate = useCallback((date: Date | null) => {
    if (!date) return "dd-mm-yyyy";
    try {
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "dd-mm-yyyy";
    }
  }, []);

  const onStartDateConfirm = useCallback(
    (params: { date: Date }) => {
      setShowStartDatePicker(false);
      setStartDate(params.date);
      setValue("startDate", params.date, { shouldValidate: true });
    },
    [setValue]
  );

  const onEndDateConfirm = useCallback(
    (params: { date: Date }) => {
      setShowEndDatePicker(false);
      setEndDate(params.date);
      setValue("endDate", params.date, { shouldValidate: true });
    },
    [setValue]
  );

  const filterLeaveCategorySuggestions = useCallback((query: string) => {
    console.log("Filtering leave categories with query:", query);
    if (!query || query.length < 1) {
      setLeaveCategorySuggestions(leaveCategories);
      console.log("Reset leave category suggestions:", leaveCategories);
      return;
    }
    const filtered = leaveCategories.filter((category) =>
      category.title.toLowerCase().includes(query.toLowerCase())
    );
    setLeaveCategorySuggestions(filtered);
    console.log("Filtered leave category suggestions:", filtered);
  }, []);

  const filterLeaveTypeSuggestions = useCallback((query: string) => {
    console.log("Filtering leave types with query:", query);
    if (!query || query.length < 1) {
      setLeaveTypeSuggestions(leaveTypes);
      console.log("Reset leave type suggestions:", leaveTypes);
      return;
    }
    const filtered = leaveTypes.filter((type) =>
      type.title.toLowerCase().includes(query.toLowerCase())
    );
    setLeaveTypeSuggestions(filtered);
    console.log("Filtered leave type suggestions:", filtered);
  }, []);

  const onSubmit = useCallback(
    async (data: LeaveFormType) => {
      try {
        const formattedDateToDDMMYYYY = (date: Date | null) => {
          if (!date) return "";
          try {
            const d = new Date(date);
            const day = String(d.getDate()).padStart(2, "0");
            const month = String(d.getMonth() + 1).padStart(2, "0");
            const year = String(d.getFullYear());
            return `${day}/${month}/${year}`;
          } catch {
            return "";
          }
        };

        const leaveCategory =
          data.leaveCategory.toLowerCase() === "unpaid leave" ? 1 : 2;
        const submittedData = {
          leavecategory_id: leaveCategory,
          leaveType: data.leaveType,
          dateFrom: formattedDateToDDMMYYYY(data.startDate),
          dateTo: formattedDateToDDMMYYYY(data.endDate),
          reason: data.reason,
        };

        await handleApplyLeave(submittedData);
        reset({
          leaveCategory: "",
          leaveType: "",
          startDate: null,
          endDate: null,
          reason: "",
        });
        setStartDate(null);
        setEndDate(null);
        setSelectedLeaveCategory(null);
        setSelectedLeaveType(null);
        setLeaveCategorySuggestions(leaveCategories);
        setLeaveTypeSuggestions(leaveTypes);
        if (leaveCategoryDropdownRef.current?.reset) {
          leaveCategoryDropdownRef.current.reset();
        }
        if (leaveTypeDropdownRef.current?.reset) {
          leaveTypeDropdownRef.current.reset();
        }
        setFormKey((prev) => prev + 1);
        showToast("Leave applied successfully");
      } catch (error) {
        console.error("Error submitting form:", error);
        showToast("Failed to submit leave");
      }
    },
    [reset]
  );

  const handleApplyLeave = async (data: any) => {
 

    try {
      const res = await fetch(`${BASE_URL}/leaves`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accesstoken: accessToken || "",
        },
        body: JSON.stringify(data),
      });
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || "Failed to apply leave");
      }
    } catch (error) {
      console.error("Error applying leave:", error);
      throw error;
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      reset({
        leaveCategory: "",
        leaveType: "",
        startDate: null,
        endDate: null,
        reason: "",
      });
      setStartDate(null);
      setEndDate(null);
      setSelectedLeaveCategory(null);
      setSelectedLeaveType(null);
      setLeaveCategorySuggestions(leaveCategories);
      setLeaveTypeSuggestions(leaveTypes);
      if (leaveCategoryDropdownRef.current?.reset) {
        leaveCategoryDropdownRef.current.reset();
      }
      if (leaveTypeDropdownRef.current?.reset) {
        leaveTypeDropdownRef.current.reset();
      }
      setFormKey((prev) => prev + 1);
      await fetchLeaves();
    } catch (error) {
      console.error("Error refreshing form:", error);
      showToast("Error refreshing form");
    } finally {
      setRefreshing(false);
    }
  }, [reset]);

  useFocusEffect(
    useCallback(() => {
      reset({
        leaveCategory: "",
        leaveType: "",
        startDate: null,
        endDate: null,
        reason: "",
      });
      setStartDate(null);
      setEndDate(null);
      setSelectedLeaveCategory(null);
      setSelectedLeaveType(null);
      setLeaveCategorySuggestions(leaveCategories);
      setLeaveTypeSuggestions(leaveTypes);
      if (leaveCategoryDropdownRef.current?.reset) {
        leaveCategoryDropdownRef.current.reset();
      }
      if (leaveTypeDropdownRef.current?.reset) {
        leaveTypeDropdownRef.current.reset();
      }
      setFormKey((prev) => prev + 1);
    }, [reset])
  );

  // Find the pending leave count for General Leave
  const generalLeaveCount = leaves
    .filter(
      (leave) =>
        leave.leave_category_name === "General Leave" ||
        leave.leave_category_id === 2
    )
    .reduce((total, leave) => total + (leave.leave_count || 0), 0);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    formWrapper: {
      padding: dimensions.padding,
      backgroundColor: colors.surface,
      borderRadius: 12,
      shadowColor: colors.cardShadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
      zIndex: 1000,
    },
    title: {
      fontSize: dimensions.fontSize.title,
      fontWeight: "700",
      marginBottom: 20,
      color: colors.text,
    },
    label: {
      fontSize: dimensions.fontSize.body,
      marginBottom: 6,
      fontWeight: "500",
      color: colors.text,
      marginTop:20
    },
    input: {
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      marginBottom: dimensions.padding,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      color: colors.text,
      height: dimensions.inputHeight,
    },
    dateTimeContainer: {
      flexDirection: "row",
      alignItems: "center",
      // marginBottom: dimensions.padding,
    },
    dateTimeInput: {
      flex: 1,
      borderWidth: 1,
      borderRadius: 8,
      padding: 12,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      color: colors.text,
      height: dimensions.inputHeight,
    },
    dateIcon: {
      position: "absolute",
      marginLeft: 10,
      padding: 6,
      backgroundColor: colors.surfaceVariant,
      borderRadius: 6,
      right: 4,
    },
    button: {
      padding: 14,
      borderRadius: 10,
      alignItems: "center",
      marginTop: dimensions.padding,
      marginBottom: dimensions.padding * 2,
      backgroundColor: colors.primary,
      shadowColor: colors.cardShadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
    },
    buttonText: {
      fontSize: dimensions.fontSize.body + 1,
      fontWeight: "600",
      color: colors.buttonText,
      letterSpacing: 0.5,
    },
    errorText: {
      color: colors.error,
      fontSize: dimensions.fontSize.small,
      marginBottom: dimensions.padding,
    },
    dropdownContainer: {
      flexGrow: 1,
      flexShrink: 1,
      marginBottom: dimensions.padding,
      zIndex: 2000,
    },
    dropdownButtonStyle: {
      width: "100%",
      height: dimensions.inputHeight,
      backgroundColor: colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 12,
    },
    dropdownButtonTxtStyle: {
      flex: 1,
      fontSize: dimensions.fontSize.body,
      fontWeight: "500",
      color: colors.text,
    },
    dropdownButtonArrowStyle: {
      fontSize: dimensions.fontSize.body + 4,
      color: colors.text,
    },
    dropdownButtonIconStyle: {
      fontSize: dimensions.fontSize.body + 4,
      marginRight: 8,
      color: colors.text,
    },
    dropdownMenuStyle: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      zIndex: 3000,
      elevation: 10,
      marginTop: 2,
      maxHeight: height * 0.3,
      width: "80%",
    },
    dropdownItemStyle: {
      width: "100%",
      flexDirection: "row",
      paddingHorizontal: 12,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: 8,
     
    },
    dropdownItemTxtStyle: {
      flex: 1,
      fontSize: dimensions.fontSize.body,
      fontWeight: "500",
      color: colors.text,
    },
    dropdownItemIconStyle: {
      fontSize: dimensions.fontSize.body + 4,
      marginRight: 8,
      color: colors.text,
    },
    dropdownSearchInputStyle: {
      fontSize: dimensions.fontSize.body,
      color: colors.text,
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      backgroundColor: colors.surface,
    },
    badgeContainer: {
      height: 40,
      justifyContent: "center",
      width: 40,
    },
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        padding: dimensions.padding,
        paddingBottom: dimensions.padding * 2,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
      key={formKey}
    >
      <View
        style={{
          flexDirection: "row",
          padding: dimensions.padding,
          marginBottom: 10,
          backgroundColor: colors.surface,
          borderRadius: 12,
          shadowColor: colors.cardShadow,
          shadowOffset: { width: 0, height: 3 },
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 4,
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 100,
        }}
      >
        <Text
          style={{
            fontSize: dimensions.fontSize.title,
            fontWeight: "700",
            color: colors.text,
          }}
        >
          General Leave
        </Text>
        <View style={{ flexDirection: "row" }}>
          <View style={styles.badgeContainer}>
            <Badge size={30} style={{ backgroundColor: colors.primary }}>
              {generalLeaveCount}
            </Badge>
          </View>
        </View>
      </View>

      <View style={styles.formWrapper}>
        <Text style={styles.title}>Apply Leave</Text>

        {/* Leave Category */}
        <View style={[styles.dropdownContainer, { zIndex: 3000 }]}>
          <Text style={styles.label}>Leave Category *</Text>
          <Controller
            control={control}
            name="leaveCategory"
            rules={{ required: "Leave category is required" }}
            render={({ field: { onChange, value } }) => (
              <SelectDropdown
                ref={leaveCategoryDropdownRef}
                data={leaveCategorySuggestions}
                onSelect={(selectedItem) => {
                  // console.log("Selected leave category:", selectedItem);
                  if (selectedItem) {
                    setSelectedLeaveCategory(selectedItem);
                    onChange(selectedItem.title.toLowerCase());
                  } else {
                    setSelectedLeaveCategory(null);
                    onChange("");
                  }
                }}
                renderButton={(selectedItem, isOpen) => (
                  <View style={styles.dropdownButtonStyle}>
                    {selectedItem && (
                      <Icon
                        name={selectedItem.icon}
                        style={styles.dropdownButtonIconStyle}
                      />
                    )
                    }
                    <Text style={styles.dropdownButtonTxtStyle}>
                      {selectedItem?.title || "Select leave category"}
                    </Text>
                    <Icon
                      name={isOpen ? "chevron-up" : "chevron-down"}
                      style={styles.dropdownButtonArrowStyle}
                    />
                  </View>
                )}
                renderItem={(item, index, isSelected) => (
                  <View
                    style={{
                      ...styles.dropdownItemStyle,
                      ...(isSelected && { backgroundColor: colors.border }),
                    }}
                  >
                   
                    <Text style={styles.dropdownItemTxtStyle}>
                      {item.title}
                    </Text>
                  </View>
                )}
                showsVerticalScrollIndicator={false}
                dropdownStyle={styles.dropdownMenuStyle}
             
              />
            )}
          />
          {errors.leaveCategory && (
            <Text style={styles.errorText}>{errors.leaveCategory.message}</Text>
          )}
        </View>

        {/* Leave Type */}
        <View style={[styles.dropdownContainer, { zIndex: 2000 }]}>
          <Text style={styles.label}>Leave Type *</Text>
          <Controller
            control={control}
            name="leaveType"
            rules={{ required: "Leave type is required" }}
            render={({ field: { onChange, value } }) => (
              <SelectDropdown
                ref={leaveTypeDropdownRef}
                data={leaveTypeSuggestions}
                onSelect={(selectedItem) => {
                  // console.log("Selected leave type:", selectedItem);
                  if (selectedItem) {
                    setSelectedLeaveType(selectedItem);
                    onChange(selectedItem.title.toLowerCase());
                  } else {
                    setSelectedLeaveType(null);
                    onChange("");
                  }
                }}
                renderButton={(selectedItem, isOpen) => (
                  <View style={styles.dropdownButtonStyle}>
                    {selectedItem && (
                      <Icon
                        name={selectedItem.icon}
                        style={styles.dropdownButtonIconStyle}
                      />
                    )}
                    <Text style={styles.dropdownButtonTxtStyle}>
                      {selectedItem?.title || "Select leave type"}
                    </Text>
                    <Icon
                      name={isOpen ? "chevron-up" : "chevron-down"}
                      style={styles.dropdownButtonArrowStyle}
                    />
                  </View>
                )}
                renderItem={(item, index, isSelected) => (
                  <View
                    style={{
                      ...styles.dropdownItemStyle,
                      ...(isSelected && { backgroundColor: colors.border }),
                    }}
                  >
                    {/* <Icon
                      name={item.icon}
                      style={styles.dropdownItemIconStyle}
                    /> */}
                    <Text style={styles.dropdownItemTxtStyle}>
                      {item.title}
                    </Text>
                  </View>
                )}
                showsVerticalScrollIndicator={false}
                dropdownStyle={styles.dropdownMenuStyle}
          //  
              />
            )}
          />
          {errors.leaveType && (
            <Text style={styles.errorText}>{errors.leaveType.message}</Text>
          )}
        </View>

        {/* Start Date */}
        <Text style={styles.label}>Start Date *</Text>
        <Controller
          control={control}
          name="startDate"
          rules={{ required: "Start date is required" }}
          render={({ field: { value } }) => (
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity
                style={styles.dateTimeInput}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text style={{ color: colors.text }}>{formatDate(value)}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dateIcon}
                onPress={() => setShowStartDatePicker(true)}
              >
                <FontAwesome
                  name="calendar"
                  size={20}
                  color={colors.textPrimary}
                />
              </TouchableOpacity>
            </View>
          )}
        />
        {errors.startDate && (
          <Text style={styles.errorText}>{errors.startDate.message}</Text>
        )}

        {/* End Date */}
        <Text style={styles.label}>End Date *</Text>
        <Controller
          control={control}
          name="endDate"
          rules={{ required: "End date is required" }}
          render={({ field: { value } }) => (
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity
                style={styles.dateTimeInput}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text style={{ color: colors.text }}>{formatDate(value)}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dateIcon}
                onPress={() => setShowEndDatePicker(true)}
              >
                <FontAwesome
                  name="calendar"
                  size={20}
                  color={colors.textPrimary}
                />
              </TouchableOpacity>
            </View>
          )}
        />
        {errors.endDate && (
          <Text style={styles.errorText}>{errors.endDate.message}</Text>
        )}

        {/* Reason */}
        <Text style={styles.label}>Reason *</Text>
        <Controller
          control={control}
          name="reason"
          rules={{ required: "Reason is required" }}
          render={({ field: { onChange, value } }) => (
            <TextInput
              style={[
                styles.input,
                { minHeight: 80, textAlignVertical: "top" },
              ]}
              placeholder="Enter reason"
              placeholderTextColor={colors.textTertiary}
              onChangeText={onChange}
              value={value}
              multiline
            />
          )}
        />
        {errors.reason && (
          <Text style={styles.errorText}>{errors.reason.message}</Text>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={styles.buttonText}>Apply</Text>
        </TouchableOpacity>
      </View>

      {/* Date Picker Modals */}
      <DatePickerModal
        locale="en"
        mode="single"
        visible={showStartDatePicker}
        onDismiss={() => setShowStartDatePicker(false)}
        date={startDate || new Date()}
        onConfirm={onStartDateConfirm}
      />
      <DatePickerModal
        locale="en"
        mode="single"
        visible={showEndDatePicker}
        onDismiss={() => setShowEndDatePicker(false)}
        date={endDate || new Date()}
        onConfirm={onEndDateConfirm}
      />
    </ScrollView>
  );
}
