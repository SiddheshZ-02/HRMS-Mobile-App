import { FontAwesome } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";
import { AutocompleteDropdown } from "react-native-autocomplete-dropdown";
import { DatePickerModal, TimePickerModal } from "react-native-paper-dates";
import { Colors } from "../../constants/Colors";
import { BASE_URL } from "@/constants/Config";
import useAuthStore from "@/store/AuthStore";
// import ScreenWrapper from "@/components/ScreenWrapper";

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

interface MeetingFormType {
  client: string;
  title: string;
  meetingLink: string;
  employee: string[];
  startDate: string | Date;
  startTime: string;
  endDate: string | Date;
  endTime: string;
  description: string;
}

interface clientsType {
  id: number;
  client_name: string;
}

interface emplyoeeType {
  id?: number | string;
  firstname?: string;
  lastname?: string;
}

interface selectType {
  id: string;
  title: string;
}

const createMeeting = () => {
  const scheme = useColorScheme();
  const colors = Colors[scheme ?? 'light'];
  const dimensions = getResponsiveDimensions();
  const scrollViewRef = useRef<ScrollView>(null);
  const clientDropdownController = useRef<any>(null);
  const employeeDropdownController = useRef<any>(null);

  const accessToken = useAuthStore((state) => state.accessToken);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
  } = useForm<MeetingFormType>({
    defaultValues: {
      client: "",
      title: "",
      meetingLink: "",
      employee: [],
      startDate: "",
      startTime: "",
      endDate: "",
      endTime: "",
      description: "",
    },
  });

  // State for date/time pickers
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<emplyoeeType[]>([]);
  const [employeesIndex, setEmployeesIndex] = useState<
    Array<{ id: string; title: string; searchKey: string }>
  >([]);
  const [selectedEmployee, setSelectedEmployee] = useState<selectType | null>(
    null
  );
  const [selectedEmployees, setSelectedEmployees] = useState<selectType[]>([]);
  const [employeeSearchQuery, setEmployeeSearchQuery] = useState<string>("");
  const [isEmployeeInputFocused, setIsEmployeeInputFocused] =
    useState<boolean>(false);

  const openEmployeeDropdown = useCallback(() => {
    setIsEmployeeInputFocused(true);
    setEmployeeSearchQuery("");
    try {
      employeeDropdownController.current?.open?.();
    } catch {}
  }, []);

  const [clientsSuggestions, setClientsSuggestions] = useState<selectType[]>(
    []
  );
  const [clients, setClients] = useState<clientsType[]>([]);
  const [selectedClient, setSelectedClient] = useState<selectType | null>(null);
  const [clientLoading, setClientLoading] = useState(false);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);


  const formatDate = useCallback((date: any) => {
    if (!date) return "dd-mm-yyyy";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, []);

  const formatTime = useCallback((hours: number, minutes: number) => {
    const period = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
  }, []);

  const onStartDateConfirm = useCallback(
    (params: any) => {
      setShowStartDatePicker(false);
      setValue("startDate", params.date);
    },
    [setValue]
  );

  const onStartTimeConfirm = useCallback(
    (params: { hours: number; minutes: number }) => {
      setShowStartTimePicker(false);
      setValue("startTime", formatTime(params.hours, params.minutes));
    },
    [setValue, formatTime]
  );

  const onEndDateConfirm = useCallback(
    (params: any) => {
      setShowEndDatePicker(false);
      setValue("endDate", params.date);
    },
    [setValue]
  );

  const onEndTimeConfirm = useCallback(
    (params: { hours: number; minutes: number }) => {
      setShowEndTimePicker(false);
      setValue("endTime", formatTime(params.hours, params.minutes));
    },
    [setValue, formatTime]
  );

  const fetchEmployee = async () => {
    setEmployeeLoading(true);
    try {
      const response = await fetch(
        BASE_URL + "/employee/list",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            accessToken: accessToken || "",
          },
        }
      );
      const res = await response.json();
      const employeesData: any[] = Array.isArray(res) ? res : [];
      setEmployees(employeesData as emplyoeeType[]);
      const index = employeesData.map((emp: any, idx: number) => {
        const id = (emp?.id ?? emp?.employee_id ?? idx).toString();
        const title = `${emp?.firstname ?? ""} ${emp?.lastname ?? ""}`.trim();
        const searchKey = title.toLowerCase();
        return { id, title, searchKey };
      });
      setEmployeesIndex(index);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setEmployeeLoading(false);
    }
  };

  // fetch Clients
  const fetchClients = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        BASE_URL + ` /client_name `,

        // "https://hr1.actifyzone.com/hr-uat//HR/Portal/client_name",
        { 
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            accessToken: accessToken || "",
          },
        }
      );
      const res = await response.json();
      const clientsData = Array.isArray(res) ? res : [];
      setClients(clientsData);
      setClientsSuggestions(
        clientsData.map((client) => ({
          id: client.id.toString(),
          title: client.client_name,
        }))
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchEmployee();
  }, []);

  const filterClientSuggestions = useCallback(
    (query: string) => {
      console.log("Filtering with query:", query);
      console.log("Available clients:", clients);

      if (!query || query.length < 1) {
        const allSuggestions = clients.map((client) => ({
          id: client.id.toString(),
          title: client.client_name,
        }));
        console.log("Setting all suggestions:", allSuggestions);
        setClientsSuggestions(allSuggestions);
        return;
      }

      const filtered = clients
        .filter((client) =>
          client.client_name.toLowerCase().includes(query.toLowerCase())
        )
        .map((client) => ({
          id: client.id.toString(),
          title: client.client_name,
        }));

      console.log("Setting filtered suggestions:", filtered);
      setClientsSuggestions(filtered);
    },
    [clients]
  );

  const employeeDataSet = useMemo(() => {
    const query = employeeSearchQuery.trim().toLowerCase();
    const base = employeesIndex;
    const filtered = query
      ? base.filter((e) => e.searchKey.includes(query))
      : base;
    // Limit to avoid rendering too many rows at once
    return filtered.slice(0, 100).map(({ id, title }) => ({ id, title }));
  }, [employeesIndex, employeeSearchQuery]);

  const employeeListWithHeader = useMemo(() => {
    return [{ id: "__header__", title: "__header__" }, ...employeeDataSet];
  }, [employeeDataSet]);

  const handleEmployeeSelection = useCallback(
    (item: any) => {
      if (!item || !item.title) return;

      const isSelected = selectedEmployees.some((emp) => emp.id === item.id);
      let newSelectedEmployees;

      if (isSelected) {
        // Remove from selection
        newSelectedEmployees = selectedEmployees.filter(
          (emp) => emp.id !== item.id
        );
      } else {
        // Add to selection
        newSelectedEmployees = [
          ...selectedEmployees,
          { id: item.id, title: item.title },
        ];
      }

      setSelectedEmployees(newSelectedEmployees);
      setValue(
        "employee",
        newSelectedEmployees.map((emp) => emp.title)
      );
    },
    [selectedEmployees, setValue]
  );

  const getSelectedEmployeeText = useCallback(() => {
    if (selectedEmployees.length === 0) return "";
    if (selectedEmployees.length === 1) return selectedEmployees[0].title;
    return `${selectedEmployees.length} employees selected`;
  }, [selectedEmployees]);

  const onSubmit = useCallback((data: MeetingFormType) => {
    console.log("Meeting scheduled:", data);
    reset();
      if (clientDropdownController.current) {
        clientDropdownController.current.clear();
      }
      if (employeeDropdownController.current) {
        employeeDropdownController.current.clear();
      }
    setEmployeeSearchQuery("");
    // Add API call or further logic here
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Clear all form fields
      setValue("client", "");
      setValue("title", "");
      setValue("meetingLink", "");
      setValue("employee", []);
      setValue("startDate", "");
      setValue("startTime", "");
      setValue("endDate", "");
      setValue("endTime", "");
      setValue("description", "");

      // Clear selected states
      setSelectedClient(null);
      setSelectedEmployees([]);

      // Clear dropdown controllers
      if (clientDropdownController.current) {
        clientDropdownController.current.clear();
      }
      if (employeeDropdownController.current) {
        employeeDropdownController.current.clear();
      }
      setEmployeeSearchQuery("");

      // Refresh data
      await Promise.all([fetchClients(), fetchEmployee()]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [setValue]);

  // --- STYLES ---
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      backgroundColor: colors.primary,
      paddingVertical: dimensions.padding,
      paddingHorizontal: dimensions.padding,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
      shadowColor: colors.cardShadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 6,
    },
    headerText: {
      color: colors.textInverse,
      fontSize: dimensions.fontSize.title + 2,
      fontWeight: "bold",
      textAlign: "center",
    },
    formWrapper: {
      margin: dimensions.padding,
      padding: dimensions.padding,
      backgroundColor: colors.surface,
      borderRadius: 12,
      shadowColor: colors.cardShadow,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
    },
    fieldContainer: {
      marginBottom: dimensions.padding,
    },
    fieldLabel: {
      fontSize: dimensions.fontSize.body,
      fontWeight: "500",
      color: colors.textPrimary,
      marginBottom: 6,
    },
    label: {
      fontSize: dimensions.fontSize.body,
      fontWeight: "500",
      color: colors.textPrimary,
      marginBottom: 6,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      height: dimensions.inputHeight,
      backgroundColor: colors.surface,
      fontSize: dimensions.fontSize.body,
      color: colors.textPrimary,
    },
    textarea: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: dimensions.fontSize.body,
      height: 100,
      textAlignVertical: "top",
      backgroundColor: colors.surface,
      color: colors.textPrimary,
    },
    dateTimeContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    dateTimeInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      paddingHorizontal: 12,
      height: dimensions.inputHeight,
      fontSize: dimensions.fontSize.body,
      backgroundColor: colors.surface,
      color: colors.textPrimary,
    },
    dateIcon: {
      marginLeft: 10,
      padding: 6,
      backgroundColor: colors.surfaceVariant,
      borderRadius: 6,
    },
    createButton: {
      backgroundColor: colors.primary,
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: "center",
      marginTop: dimensions.padding,
    },
    createButtonText: {
      color: colors.buttonText,
      fontSize: dimensions.fontSize.body + 1,
      fontWeight: "bold",
      letterSpacing: 0.5,
    },
    // Dropdown styles
    dropdownContainer: {
      flexGrow: 1,
      flexShrink: 1,
    },
    dropdownInputContainer: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      backgroundColor: colors.surface,
    },
    dropdownInput: {
      fontSize: dimensions.fontSize.body,
      color: colors.textPrimary,
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
      color: colors.textPrimary,
    },
    errorText: {
      color: colors.error,
      fontSize: dimensions.fontSize.small,
      marginTop: 4,
    },
    checkboxContainer: {
      flexDirection: "row",
      alignItems: "center",
    },
    checkbox: {
      width: 20,
      height: 20,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 4,
      marginRight: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    checkboxSelected: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
  });
  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
      >
        {/* // <ScreenWrapper scrollable={false}> */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.container}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={{ paddingBottom: 32 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
        >
          <View style={styles.header}>
            <Text style={styles.headerText}>Schedule Meeting</Text>
          </View>
          <View style={styles.formWrapper}>
            {/* Client */}
            <View style={[styles.fieldContainer, { zIndex: 3 }]}>
              <Text style={styles.fieldLabel}>Client</Text>
              <Controller
                control={control}
                name="client"
                rules={{ required: "Client is required" }}
                render={({ field: { onChange, value } }) => (
                  <AutocompleteDropdown
                    controller={(controller) => {
                      clientDropdownController.current = controller;
                    }}
                    dataSet={clientsSuggestions}
                    onChangeText={filterClientSuggestions}
                    onSelectItem={(item) => {
                      if (item && item.title) {
                        setSelectedClient({ id: item.id, title: item.title });
                        onChange(item.title);
                      } else {
                        setSelectedClient(null);
                        onChange("");
                      }
                    }}
                    debounce={300}
                    suggestionsListMaxHeight={
                      Dimensions.get("window").height * 0.4
                    }
                    loading={clientLoading}
                    useFilter={false}
                    textInputProps={{
                      placeholder: "Select a client",
                      placeholderTextColor: colors.textTertiary,
                      autoCorrect: false,
                      autoCapitalize: "none",
                      style: styles.dropdownInput,
                      onFocus: () => {
                        const allSuggestions = clients.map((c) => ({
                          id: c.id.toString(),
                          title: c.client_name,
                        }));
                        setClientsSuggestions(allSuggestions);
                        try {
                          clientDropdownController.current?.open?.();
                        } catch {}
                      },
                    }}
                    rightButtonsContainerStyle={
                      styles.dropdownRightButtonsContainer
                    }
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
                      selectedClient ? { id: selectedClient.id } : undefined
                    }
                  />
                )}
              />
              {errors.client && (
                <Text style={styles.errorText}>{errors.client.message}</Text>
              )}
            </View>

            {/* Title and Meeting Link */}
            {/* <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            > */}
            <View style={[styles.fieldContainer, { flex: 1 }]}>
              <Text style={styles.label}>Title : *</Text>
              <Controller
                control={control}
                name="title"
                rules={{ required: "Title is required" }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="Daily review"
                    placeholderTextColor={colors.textTertiary}
                    // placeholderTextColor={}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.title && (
                <Text style={{ color: colors.error }}>{errors.title.message}</Text>
              )}
            </View>
            <View style={[styles.fieldContainer, { flex: 1 }]}>
              <Text style={styles.label}>Meeting Link : *</Text>
              <Controller
                control={control}
                name="meetingLink"
                rules={{ required: "Meeting link is required" }}
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.input}
                    placeholder="https://teams.actify.com"
                    placeholderTextColor={colors.textTertiary}
                    onChangeText={onChange}
                    value={value}
                  />
                )}
              />
              {errors.meetingLink && (
                <Text style={{ color: colors.error }}>{errors.meetingLink.message}</Text>
              )}
            </View>
            {/* </View> */}

            {/* Employee */}
            <View style={[styles.fieldContainer, { zIndex: 3 }]}>
              <Text style={styles.label}>Employee : *</Text>
              <Controller
                control={control}
                name="employee"
                rules={{ required: "Employee is required" }}
                render={({ field: { onChange, value } }) => (
                  <AutocompleteDropdown
                    controller={(controller) => {
                      employeeDropdownController.current = controller;
                    }}
                    dataSet={employeeListWithHeader}
                    onChangeText={(text) => {
                      setEmployeeSearchQuery(text ?? "");
                    }}
                    onSelectItem={() => {}}
                    debounce={300}
                    suggestionsListMaxHeight={
                      Dimensions.get("window").height * 0.4
                    }
                    loading={employeeLoading}
                    useFilter={false}
                    textInputProps={{
                      placeholder: "Select employees",
                      placeholderTextColor: colors.textTertiary,
                      autoCorrect: false,
                      autoCapitalize: "none",
                      style: styles.dropdownInput,
                      value: isEmployeeInputFocused
                        ? employeeSearchQuery
                        : getSelectedEmployeeText(),
                      editable: true,
                      onPressIn: () => {
                        openEmployeeDropdown();
                      },
                      onFocus: () => {
                        openEmployeeDropdown();
                      },
                      onBlur: () => {
                        setIsEmployeeInputFocused(false);
                      },
                    }}
                    rightButtonsContainerStyle={
                      styles.dropdownRightButtonsContainer
                    }
                    inputContainerStyle={styles.dropdownInputContainer}
                    suggestionsListContainerStyle={
                      styles.dropdownSuggestionsContainer
                    }
                    containerStyle={styles.dropdownContainer}
                    direction="down"
                    renderItem={(item) => {
                      if (item.id === "__header__") {
                        return (
                          <View
                            style={[
                              styles.dropdownItemContainer,
                              { paddingVertical: 10 },
                            ]}
                          >
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                borderWidth: 1,
                                borderColor: colors.border,
                                borderRadius: 8,
                                paddingHorizontal: 12,
                                height: 40,
                                backgroundColor: colors.surfaceVariant,
                              }}
                            >
                              <FontAwesome
                                name="search"
                                size={16}
                                color={colors.textPrimary}
                              />
                              <TextInput
                                style={{ marginLeft: 8, flex: 1, color: colors.textPrimary }}
                                placeholder="Search employees"
                                placeholderTextColor={colors.textTertiary}
                                value={employeeSearchQuery}
                                onChangeText={setEmployeeSearchQuery}
                                autoFocus
                                autoCapitalize="none"
                                autoCorrect={false}
                              />
                            </View>
                          </View>
                        );
                      }
                      const isSelected = selectedEmployees.some(
                        (emp) => emp.id === item.id
                      );
                      return (
                        <TouchableOpacity
                          style={styles.dropdownItemContainer}
                          onPress={() => handleEmployeeSelection(item)}
                        >
                          <View style={styles.checkboxContainer}>
                            <View
                              style={[
                                styles.checkbox,
                                isSelected && styles.checkboxSelected,
                              ]}
                            >
                              {isSelected && (
                                <FontAwesome
                                  name="check"
                                  size={12}
                                  color={colors.primary}
                                />
                              )}
                            </View>
                            <Text style={styles.dropdownItemText}>
                              {item.title}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      );
                    }}
                    inputHeight={dimensions.inputHeight}
                    showChevron={false}
                    closeOnBlur={false}
                    clearOnFocus={false}
                    initialValue={
                      selectedEmployee ? { id: selectedEmployee.id } : undefined
                    }
                  />
                )}
              />
              {errors.employee && (
                <Text style={{ color: colors.error }}>{errors.employee.message}</Text>
              )}
            </View>

            {/* Start Date & Time and End Date & Time */}

            <View style={{ flex: 1, marginRight: 8, marginBottom: 8 }}>
              <Text style={styles.label}>Start date : *</Text>
                <Controller
                  control={control}
                  name="startDate"
                  rules={{ required: "Start date is required" }}
                  render={({ field: { value } }) => (
                  <View style={[styles.dateTimeContainer]}>
                      <TouchableOpacity
                        onPress={() => setShowStartDatePicker(true)}
                      >
                        <TextInput
                        style={[styles.dateTimeInput, { width: width * 0.7 }]}
                          value={formatDate(value)}
                          editable={false}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.dateIcon}>
                        <FontAwesome name="calendar" size={20} color={colors.textPrimary} />
                      </TouchableOpacity>
                    </View>
                  )}
                />
                {errors.startDate && (
                <Text style={{ color: colors.error }}>{errors.startDate.message}</Text>
              )}
            </View>

            <View
              style={{
                flex: 1,
                flexDirection: "row",
                gap: 6,
                marginBottom:8
              }}
            >
              <View>
                <Text style={styles.label}>Start Time : *</Text>
                <Controller
                  control={control}
                  name="startTime"
                  rules={{ required: "Start time is required" }}
                  render={({ field: { value } }) => (
                    <View style={[styles.dateTimeContainer]}>
                      <TouchableOpacity
                        onPress={() => setShowStartTimePicker(true)}
                      >
                        <TextInput
                          style={[styles.dateTimeInput, { width: width * 0.3 }]}
                          value={value || "--:--"}
                          editable={false}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setShowStartTimePicker(true)}
                        style={styles.dateIcon}
                      >
                        <FontAwesome name="clock-o" size={20} color={colors.textPrimary} />
                      </TouchableOpacity>
                    </View>
                  )}
                />
                {errors.startTime && (
                  <Text style={{ color: colors.error }}>{errors.startTime.message}</Text>
                )}
              </View>
              <View>
                <Text style={styles.label}>End Time : *</Text>
                <Controller
                  control={control}
                  name="endTime"
                  rules={{ required: "End time is required" }}
                  render={({ field: { value } }) => (
                    <View style={styles.dateTimeContainer}>
                      <TouchableOpacity
                        onPress={() => setShowEndTimePicker(true)}
                      >
                        <TextInput
                           style={[styles.dateTimeInput, { width: width * 0.3 }]}
                          value={value || "--:--"}
                          editable={false}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.dateIcon}>
                        <FontAwesome name="clock-o" size={20} color={colors.textPrimary} />
                      </TouchableOpacity>
                    </View>
                  )}
                />
                {errors.endTime && (
                  <Text style={{ color: colors.error }}>{errors.endTime.message}</Text>
                )}
              </View>
            </View>

            {/* Description */}
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Description :</Text>
              <Controller
                control={control}
                name="description"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    style={styles.textarea}
                    placeholder="Enter description"
                    placeholderTextColor={colors.textTertiary}
                    onChangeText={onChange}
                    value={value}
                    multiline
                    onFocus={() => {
                      // Ensure the description stays visible above keyboard
                      setTimeout(() => {
                        scrollViewRef.current?.scrollToEnd({ animated: true });
                      }, 100);
                    }}
                  />
                )}
              />
            </View>

            {/* Create Button */}
            <TouchableOpacity
              style={styles.createButton}
              onPress={handleSubmit(onSubmit)}
            >
              <Text style={styles.createButtonText}>Create</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        {/* // </ScreenWrapper> */}
      </KeyboardAvoidingView>
      {/* Date Picker Modals */}
      <DatePickerModal
        locale="en"
        mode="single"
        visible={showStartDatePicker}
        onDismiss={() => setShowStartDatePicker(false)}
        date={new Date()}
        onConfirm={onStartDateConfirm}
      />
      <TimePickerModal
        locale="en"
        visible={showStartTimePicker}
        onDismiss={() => setShowStartTimePicker(false)}
        onConfirm={onStartTimeConfirm}
        hours={10}
        minutes={35}
        use24HourClock={false}
      />
      <DatePickerModal
        locale="en"
        mode="single"
        visible={showEndDatePicker}
        onDismiss={() => setShowEndDatePicker(false)}
        date={new Date()}
        onConfirm={onEndDateConfirm}
      />
      <TimePickerModal
        locale="en"
        visible={showEndTimePicker}
        onDismiss={() => setShowEndTimePicker(false)}
        onConfirm={onEndTimeConfirm}
        hours={11}
        minutes={35}
        use24HourClock={false}
      />
    </View>
  );
};

export default createMeeting;
