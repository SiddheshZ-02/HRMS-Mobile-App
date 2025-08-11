import React, { useState, useCallback } from "react";
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
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { DatePickerModal } from "react-native-paper-dates";
import { FontAwesome } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { Colors } from "@/constants/Colors";
import { useFocusEffect } from "expo-router";

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
  const [formKey, setFormKey] = useState(0); // Added to force re-render

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

        const leaveCategory = data.leaveCategory === "unpaid leaves" ? 1 : 2;
        const submittedData = {
          leavecategory_id: leaveCategory,
          leaveType: data.leaveType,
          dateFrom: formattedDateToDDMMYYYY(data.startDate),
          dateTo: formattedDateToDDMMYYYY(data.endDate),
          reason: data.reason,
        };

        console.log("Leave form submitted:", submittedData);

        // Reset form and states
        reset({
          leaveCategory: "",
          leaveType: "",
          startDate: null,
          endDate: null,
          reason: "",
        });
        setStartDate(null);
        setEndDate(null);
        setShowStartDatePicker(false);
        setShowEndDatePicker(false);
        setFormKey((prev) => prev + 1); // Force UI re-render
        // Simulate async submission (e.g., API call)
        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error) {
        console.error("Error submitting form:", error);
      }
    },
    [reset]
  );

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
      setShowStartDatePicker(false);
      setShowEndDatePicker(false);
      setFormKey((prev) => prev + 1); // Force UI re-render
      // Simulate an async operation (e.g., fetching data)
      await new Promise((resolve) => setTimeout(resolve, 1000));
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
      setFormKey((prev) => prev + 1); // Force UI re-render
    }, [reset])
  );

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
      marginLeft: 10,
      padding: 6,
      backgroundColor: colors.surfaceVariant,
      borderRadius: 6,
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
      key={formKey} // Force re-render on reset
    >
      <View style={styles.formWrapper}>
        <Text style={styles.title}>Apply Leave</Text>

        {/* Leave Category */}
        <Text style={styles.label}>Leave Category *</Text>
        <Controller
          control={control}
          name="leaveCategory"
          rules={{ required: "Leave category is required" }}
          render={({ field: { onChange, value } }) => (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={value}
                onValueChange={onChange}
                style={styles.picker}
                dropdownIconColor={colors.text}
                itemStyle={{ color: colors.text, fontSize: dimensions.fontSize.body }}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Unpaid Leave" value="unpaid leaves" />
                <Picker.Item label="General Leave" value="general leaves" />
              </Picker>
            </View>
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
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={value}
                onValueChange={onChange}
                style={styles.picker}
                dropdownIconColor={colors.text}
                itemStyle={{ color: colors.text, fontSize: dimensions.fontSize.body }}
              >
                <Picker.Item label="Select" value="" />
                <Picker.Item label="Half Day" value="half day" />
                <Picker.Item label="Full Day" value="full day" />
              </Picker>
            </View>
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
                <FontAwesome name="calendar" size={20} color={colors.textPrimary} />
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
                <FontAwesome name="calendar" size={20} color={colors.textPrimary} />
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
        <TouchableOpacity style={styles.button} onPress={handleSubmit(onSubmit)}>
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