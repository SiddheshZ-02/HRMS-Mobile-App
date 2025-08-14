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
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { DatePickerModal } from "react-native-paper-dates";
import { FontAwesome } from "@expo/vector-icons";
import { AutocompleteDropdown } from "react-native-autocomplete-dropdown";
import { Colors } from "@/constants/Colors";
import { useFocusEffect } from "expo-router";
import { Badge } from "react-native-paper";
import useAuthStore from "@/store/AuthStore";
import { BASE_URL } from "@/constants/Config";

const { height, width } = Dimensions.get("window");

// Responsive breakpoints
const isTablet = width > 768;

// Responsive dimensions
const getResponsiveDimensions = () => ({
  padding: isTablet ? 24 : 16,
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
}

interface PendingLeaveCount {
  employee_id: number;
  leave_category_id: number;
  leave_category_name: string;
  l_count: number;
}

interface LeaveType {
  pending_leave_count: PendingLeaveCount[];
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
  const leaveCategoryDropdownController = useRef<any>(null);
  const leaveTypeDropdownController = useRef<any>(null);
  const [leaves, setLeaves] = useState<LeaveType[]>([]);

  

  // Define leave category and type options
  const leaveCategories: SelectType[] = [
    { id: "1", title: "Unpaid Leave" },
    { id: "2", title: "General Leave" },
  ];

  const leaveTypes: SelectType[] = [
    { id: "1", title: "Half Day" },
    { id: "2", title: "Full Day" },
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


  const fetchLeaves = async () => {
    try {
      const response = await fetch(
         BASE_URL + `/leaves`,
        // `https://hr1.actifyzone.com/hr-uat/HR/Portal/leaves`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
             accesstoken: accessToken || "",
          },
        }
      );
      const data = await response.json();
      setLeaves(Array.isArray(data) ? data : []);
      if (response.ok) {
        console.log("Leaves fetched successfully:", data);
      } else {
        throw new Error(data.message || "Failed to fetch leaves");
      }
    } catch (error) {
      console.error("Error fetching leaves:", error);
      ToastAndroid.show("Failed to fetch leaves", ToastAndroid.SHORT);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const formatDate = useCallback((date: Date | null) => {
    if (!date) return "dd-mm-yyyy";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
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
    if (!query || query.length < 1) {
      setLeaveCategorySuggestions(leaveCategories);
      return;
    }
    const filtered = leaveCategories.filter((category) =>
      category.title.toLowerCase().includes(query.toLowerCase())
    );
    setLeaveCategorySuggestions(filtered);
  }, []);

  const filterLeaveTypeSuggestions = useCallback((query: string) => {
    if (!query || query.length < 1) {
      setLeaveTypeSuggestions(leaveTypes);
      return;
    }
    const filtered = leaveTypes.filter((type) =>
      type.title.toLowerCase().includes(query.toLowerCase())
    );
    setLeaveTypeSuggestions(filtered);
  }, []);

  const onSubmit = useCallback(
    async (data: LeaveFormType) => {
      try {
        const formattedDateToDDMMYYYY = (date: string | Date | null) => {
          if (!date) return "";
          const d = new Date(date);
          const day = String(d.getDate()).padStart(2, "0");
          const month = String(d.getMonth() + 1).padStart(2, "0");
          const year = String(d.getFullYear());
          return `${day}/${month}/${year}`;
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
        if (leaveCategoryDropdownController.current) {
          leaveCategoryDropdownController.current.clear();
        }
        if (leaveTypeDropdownController.current) {
          leaveTypeDropdownController.current.clear();
        }
        setFormKey((prev) => prev + 1);
      } catch (error) {
        console.error("Error submitting form:", error);
        ToastAndroid.show("Failed to submit leave", ToastAndroid.SHORT);
      }
    },
    [reset]
  );

  const handleApplyLeave = async (data: any) => {
    try {
      const res = await fetch(

          BASE_URL + `/leaves`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            accesstoken: accessToken || "",
          },
          body: JSON.stringify(data),
        }
      );
      const result = await res.json();

      if (res.ok) {
        ToastAndroid.show("Leave applied successfully", ToastAndroid.SHORT);
      } else {
        throw new Error(result.message || "Failed to apply leave");
      }
    } catch (error) {
      console.error("Error applying leave:", error);
      ToastAndroid.show("Leave application failed", ToastAndroid.SHORT);
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
      if (leaveCategoryDropdownController.current) {
        leaveCategoryDropdownController.current.clear();
      }
      if (leaveTypeDropdownController.current) {
        leaveTypeDropdownController.current.clear();
      }
      setFormKey((prev) => prev + 1);
      await fetchLeaves();
    } catch (error) {
      console.error("Error refreshing form:", error);
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
      setFormKey((prev) => prev + 1);
    }, [reset])
  );

  // Find the pending leave count for General Leave
  const generalLeaveCount =
    leaves
      .flatMap((leave) => leave.pending_leave_count || [])
      .find(
        (item) =>
          item.leave_category_name === "General Leave" ||
          item.leave_category_id === 2
      )?.l_count || 0;

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
    },
    pickerContainer: {
      borderWidth: 1,
      borderRadius: 8,
      marginBottom: dimensions.padding,
      borderColor: colors.border,
      backgroundColor: colors.surface,
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
      marginBottom: dimensions.padding,
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
    picker: {
      backgroundColor: colors.surface,
      color: colors.text,
    },
    dropdownContainer: {
      flexGrow: 1,
      flexShrink: 1,
      marginBottom: dimensions.padding,
    },
    dropdownInputContainer: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface,
      marginBottom: 14,
    },
    dropdownInput: {
      fontSize: dimensions.fontSize.body,
      color: colors.text,
    },
    dropdownRightButtonsContainer: {
      right: 8,
      height: 30,
      top: 0,
      alignSelf: "center",
    },
    dropdownSuggestionsContainer: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      marginTop: 4,
      zIndex: 1000,
      elevation: 10,
    },
    dropdownItemContainer: {
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    dropdownItemText: {
      fontSize: dimensions.fontSize.body,
      color: colors.text,
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
        <Text style={styles.label}>Leave Category *</Text>
        <Controller
          control={control}
          name="leaveCategory"
          rules={{ required: "Leave category is required" }}
          render={({ field: { onChange, value } }) => (
            <AutocompleteDropdown
              controller={(controller) => {
                leaveCategoryDropdownController.current = controller;
              }}
              dataSet={leaveCategorySuggestions}
              onChangeText={filterLeaveCategorySuggestions}
              editable={false}
              onSelectItem={(item) => {
                if (item && item.title) {
                  setSelectedLeaveCategory({ id: item.id, title: item.title });
                  onChange(item.title.toLowerCase());
                } else {
                  setSelectedLeaveCategory(null);
                  onChange("");
                }
              }}
              debounce={300}
              suggestionsListMaxHeight={Dimensions.get("window").height * 0.4}
              textInputProps={{
                placeholder: "Select leave category",
                placeholderTextColor: colors.textTertiary,
                autoCorrect: false,
                autoCapitalize: "none",
                style: styles.dropdownInput,
                onFocus: () => {
                  setLeaveCategorySuggestions(leaveCategories);
                  try {
                    leaveCategoryDropdownController.current?.open?.();
                  } catch {}
                },
              }}
              rightButtonsContainerStyle={styles.dropdownRightButtonsContainer}
              inputContainerStyle={styles.dropdownInputContainer}
              suggestionsListContainerStyle={
                styles.dropdownSuggestionsContainer
              }
              containerStyle={styles.dropdownContainer}
              direction="down"
              renderItem={(item) => (
                <View style={styles.dropdownItemContainer}>
                  <Text style={styles.dropdownItemText}>{item.title}</Text>
                </View>
              )}
              inputHeight={dimensions.inputHeight}
              showChevron={true}
              closeOnBlur={true}
              clearOnFocus={false}
              initialValue={
                selectedLeaveCategory
                  ? { id: selectedLeaveCategory.id }
                  : undefined
              }
            />
          )}
        />
        {errors.leaveCategory && (
          <Text style={styles.errorText}>{errors.leaveCategory.message}</Text>
        )}

        {/* Leave Type */}
        <Text style={styles.label}>Leave Type *</Text>
        <Controller
          control={control}
          name="leaveType"
          rules={{ required: "Leave type is required" }}
          render={({ field: { onChange, value } }) => (
            <AutocompleteDropdown
              controller={(controller) => {
                leaveTypeDropdownController.current = controller;
              }}
              dataSet={leaveTypeSuggestions}
              onChangeText={filterLeaveTypeSuggestions}
              editable={false}
              onSelectItem={(item) => {
                if (item && item.title) {
                  setSelectedLeaveType({ id: item.id, title: item.title });
                  onChange(item.title.toLowerCase());
                } else {
                  setSelectedLeaveType(null);
                  onChange("");
                }
              }}
              debounce={300}
              suggestionsListMaxHeight={Dimensions.get("window").height * 0.4}
              textInputProps={{
                placeholder: "Select leave type",
                placeholderTextColor: colors.textTertiary,
                autoCorrect: false,
                autoCapitalize: "none",
                style: styles.dropdownInput,
                onFocus: () => {
                  setLeaveTypeSuggestions(leaveTypes);
                  try {
                    leaveTypeDropdownController.current?.open?.();
                  } catch {}
                },
              }}
              rightButtonsContainerStyle={styles.dropdownRightButtonsContainer}
              inputContainerStyle={styles.dropdownInputContainer}
              suggestionsListContainerStyle={
                styles.dropdownSuggestionsContainer
              }
              containerStyle={styles.dropdownContainer}
              direction="down"
              renderItem={(item) => (
                <View style={styles.dropdownItemContainer}>
                  <Text style={styles.dropdownItemText}>{item.title}</Text>
                </View>
              )}
              inputHeight={dimensions.inputHeight}
              showChevron={true}
              closeOnBlur={true}
              clearOnFocus={false}
              initialValue={
                selectedLeaveType ? { id: selectedLeaveType.id } : undefined
              }
            />
          )}
        />
        {errors.leaveType && (
          <Text style={styles.errorText}>{errors.leaveType.message}</Text>
        )}

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
                {
                  minHeight: 80,
                  textAlignVertical: "top",
                },
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
