import React, { useState, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  useColorScheme,
  RefreshControl,
  Platform,
  ToastAndroid,
  Alert,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { DatePickerModal } from "react-native-paper-dates";
import { Entypo, FontAwesome } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import SelectDropdown from "react-native-select-dropdown";
import { BASE_URL } from "@/constants/Config";
import useAuthStore from "@/store/AuthStore";
import axios from "axios";

const { width, height } = Dimensions.get("window");
const isTablet = width > 768;

const getResponsiveDimensions = () => ({
  padding: isTablet ? 24 : 16,
  fontSize: {
    title: isTablet ? 24 : 20,
    body: isTablet ? 18 : 16,
    small: isTablet ? 16 : 14,
  },
  inputHeight: isTablet ? 50 : 44,
});

interface WFHFormType {
  dateFrom: Date | null;
  work_type: string;
  reason: string;
}

interface SelectType {
  id: string;
  title: string;
}

export default function ApplyWFHScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? "light"];
  const dimensions = getResponsiveDimensions();

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<WFHFormType>({
    defaultValues: {
      dateFrom: null,
      work_type: "",
      reason: "",
    },
  });

  const [date, setDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const dropdownRef = useRef<any>(null);

  const { accessToken, setSessionTimeout } = useAuthStore((state) => state);

  const showToast = (message: string) => {
    if (Platform.OS === "android") {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert("Notification", message);
    }
  };

  // WFH modes with icons
  const wfhModes: SelectType[] = [
    { id: "1", title: "Full Day" },
    { id: "2", title: "Half Day" },
  ];

  const [modeSuggestions, setModeSuggestions] =
    useState<SelectType[]>(wfhModes);
  const [selectedMode, setSelectedMode] = useState<SelectType | null>(null);

  const formatDate = useCallback((date: Date | null) => {
    if (!date) return "dd-mm-yyyy";
    try {
      return date.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "dd-mm-yyyy";
    }
  }, []);

  const onDateConfirm = useCallback(
    (params: { date: Date }) => {
      setShowDatePicker(false);
      setDate(params.date);
      setValue("dateFrom", params.date, { shouldValidate: true });
    },
    [setValue]
  );

  const filterModeSuggestions = useCallback((query: string) => {
    console.log("Filtering WFH modes with query:", query);
    if (!query || query.length < 1) {
      setModeSuggestions(wfhModes);
      console.log("Reset WFH mode suggestions:", wfhModes);
      return;
    }
    const filtered = wfhModes.filter((mode) =>
      mode.title.toLowerCase().includes(query.toLowerCase())
    );
    setModeSuggestions(filtered);
    console.log("Filtered WFH mode suggestions:", filtered);
  }, []);

  const onSubmit = useCallback(
    (data: WFHFormType) => {
      const submittedData = {
        ...data,
        dateFrom: data.dateFrom ? formatDate(data.dateFrom) : "",
      };

      handleApplyWFH(submittedData);

      reset({
        dateFrom: null,
        work_type: "",
        reason: "",
      });
      setDate(null);
      setSelectedMode(null);
      setModeSuggestions(wfhModes);
      if (dropdownRef.current?.reset) {
        dropdownRef.current.reset();
      }
      showToast("WFH application submitted");
    },
    [reset, formatDate]
  );

  // const handleApplyWFH = async (data: any) => {
  //   try {
  //     const res = await fetch(`${BASE_URL}/work_from_home`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         accesstoken: accessToken || "",
  //       },
  //       body: JSON.stringify(data),
  //     });

  //     if (res.status === 401) {
  //       setSessionTimeout(true);
  //       return;
  //     }

  //     const result = await res.json();

  //     if (!res.ok) {
  //       throw new Error(result.message || "Failed to apply WFH");
  //     }
  //   } catch (error) {
  //     console.error("Error applying WFH:", error);
  //     throw error;
  //   }
  // };



const handleApplyWFH = async (data: any) => {
  try {
    const response = await axios.post(`${BASE_URL}/work_from_home`, data, {
      headers: {
        "Content-Type": "application/json",
        accesstoken: accessToken || "",
      },
    });

    if (response.status === 401) {
      setSessionTimeout(true);
      return;
    }

    // Axios automatically parses JSON response
    const result = response.data;

    if (response.status !== 200) {
      throw new Error(result.message || "Failed to apply WFH");
    }

    return result; // Optional: return the response data if needed
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Handle Axios-specific errors
      console.error("Axios error applying WFH:", error.response?.data || error.message);
      throw new Error(error.response?.data?.message || "Failed to apply WFH");
    } else {
      // Handle non-Axios errors
      console.error("Error applying WFH:", error);
      throw error;
    }
  }
};



  const onRefresh = useCallback(() => {
    setRefreshing(true);
    reset({
      dateFrom: null,
      work_type: "",
      reason: "",
    });
    setDate(null);
    setSelectedMode(null);
    setModeSuggestions(wfhModes);
    if (dropdownRef.current?.reset) {
      dropdownRef.current.reset();
    }
    setTimeout(() => {
      setRefreshing(false);
    }, 900);
  }, [reset]);

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
      right: 12,
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
      fontSize: dimensions.fontSize.body,
      fontWeight: "600",
      color: colors.buttonText,
    },
    errorText: {
      color: colors.error ?? "red",
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
      marginBottom: 30,
    },
    dropdownButtonTxtStyle: {
      flex: 1,
      fontSize: dimensions.fontSize.body,
      fontWeight: "400",
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
      paddingVertical: 15,
    },
    dropdownItemTxtStyle: {
      flex: 1,
      fontSize: dimensions.fontSize.body,
      fontWeight: "400",
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
    >
      <View style={styles.formWrapper}>
        <Text style={styles.title}>Apply WFH</Text>

        {/* Date */}
        <Text style={styles.label}>
          Date<Text style={{ color: colors.error }}> *</Text>
        </Text>
        <Controller
          control={control}
          name="dateFrom"
          rules={{ required: "Date is required" }}
          render={({ field: { value } }) => (
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity
                style={styles.dateTimeInput}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={{ color: colors.text }}>{formatDate(value)}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dateIcon}
                onPress={() => setShowDatePicker(true)}
              >
                <FontAwesome name="calendar" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          )}
        />
        {errors.dateFrom && (
          <Text style={styles.errorText}>{errors.dateFrom.message}</Text>
        )}

        {/* WFH Mode */}
        <View style={styles.dropdownContainer}>
          <Text style={styles.label}>
            WFH Mode<Text style={{ color: colors.error }}> *</Text>
          </Text>
          <Controller
            control={control}
            name="work_type"
            rules={{ required: "WFH mode is required" }}
            render={({ field: { onChange, value } }) => (
              <SelectDropdown
                ref={dropdownRef}
                data={modeSuggestions}
                onSelect={(selectedItem) => {
                  // console.log("Selected WFH mode:", selectedItem);
                  if (selectedItem) {
                    setSelectedMode(selectedItem);
                    onChange(selectedItem.title.toLowerCase());
                  } else {
                    setSelectedMode(null);
                    onChange("");
                  }
                }}
                renderButton={(selectedItem, isOpen) => (
                  <View style={styles.dropdownButtonStyle}>
                    {selectedItem && (
                      <Entypo
                        name={selectedItem.Entypo}
                        style={styles.dropdownButtonIconStyle}
                      />
                    )}
                    <Text style={styles.dropdownButtonTxtStyle}>
                      {selectedItem?.title || "Select WFH mode"}
                    </Text>

                    <Entypo
                      name={isOpen ? "chevron-small-up" : "chevron-small-down"}
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
          {errors.work_type && (
            <Text style={styles.errorText}>{errors.work_type.message}</Text>
          )}
        </View>

        {/* Reason */}
        <Text style={styles.label}>
          Reason<Text style={{ color: colors.error }}> *</Text>
        </Text>
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

        {/* Submit */}
        <TouchableOpacity
          style={styles.button}
          onPress={handleSubmit(onSubmit)}
        >
          <Text style={styles.buttonText}>Apply</Text>
        </TouchableOpacity>

        {/* Date Picker */}
        <DatePickerModal
          locale="en"
          mode="single"
          visible={showDatePicker}
          onDismiss={() => setShowDatePicker(false)}
          date={date || new Date()}
          onConfirm={onDateConfirm}
        />
      </View>
    </ScrollView>
  );
}
