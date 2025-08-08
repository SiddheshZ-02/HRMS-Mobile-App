import { FontAwesome } from "@expo/vector-icons";
import { useCallback, useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Dimensions,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AutocompleteDropdown } from "react-native-autocomplete-dropdown";
import { DatePickerModal, TimePickerModal } from "react-native-paper-dates";
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
  const dimensions = getResponsiveDimensions();
  const scrollViewRef = useRef<ScrollView>(null);
  const clientDropdownController = useRef<any>(null);
  const employeeDropdownController = useRef<any>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
    reset
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
  const [employeesSuggestions, setEmployeesSuggestions] = useState<selectType[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<selectType | null>( null);
  const [selectedEmployees, setSelectedEmployees] = useState<selectType[]>([]);

  const [clientsSuggestions, setClientsSuggestions] = useState<selectType[]>([]);
  const [clients, setClients] = useState<clientsType[]>([]);
  const [selectedClient, setSelectedClient] = useState<selectType | null>(null);
  const [clientLoading, setClientLoading] = useState(false);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  // console.log(clients);

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
        "https://hr1.actifyzone.com/hr-uat/HR/Portal/employee/list",
        {
          method: "GET",
          headers: {
            "content-type": "Application/json",
            accesstoken:
              "cm7OTIqgm4tSCEXTDOIUzcxj71qTa7CaASVwwlzrUHYqNJMaX2znMkb4nXvx",
          },
        }
      );
      const res = await response.json();
      const employeesData: any[] = Array.isArray(res) ? res : [];
      setEmployees(employeesData as emplyoeeType[]);
      setEmployeesSuggestions(
        employeesData.map((emp: any, idx: number) => ({
          id: (emp?.id ?? emp?.employee_id ?? idx).toString(),
          title: `${emp?.firstname ?? ""} ${emp?.lastname ?? ""}`.trim(),
        }))
      );
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
        "https://hr1.actifyzone.com/hr-uat//HR/Portal/client_name",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            accessToken:
              "cm7OTIqgm4tSCEXTDOIUzcxj71qTa7CaASVwwlzrUHYqNJMaX2znMkb4nXvx",
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

  const filterEmployeeSuggestions = useCallback(
    (query: string) => {
      if (!query || query.length < 1) {
        const all = employees.map((emp, idx) => ({
          id: ((emp as any)?.id ?? (emp as any)?.employee_id ?? idx).toString(),
          title: `${(emp as any)?.firstname ?? ""} ${
            (emp as any)?.lastname ?? ""
          }`.trim(),
        }));
        setEmployeesSuggestions(all);
        return;
      }

      const filtered = employees
        .filter((emp) =>
          `${(emp as any)?.firstname ?? ""} ${(emp as any)?.lastname ?? ""}`
            .toLowerCase()
            .includes(query.toLowerCase())
        )
        .map((emp, idx) => ({
          id: ((emp as any)?.id ?? (emp as any)?.employee_id ?? idx).toString(),
          title: `${(emp as any)?.firstname ?? ""} ${
            (emp as any)?.lastname ?? ""
          }`.trim(),
        }));
      setEmployeesSuggestions(filtered);
    },
    [employees]
  );

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
    reset()
      if (clientDropdownController.current) {
        clientDropdownController.current.clear();
      }
      if (employeeDropdownController.current) {
        employeeDropdownController.current.clear();
      }
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

      // Refresh data
      await Promise.all([fetchClients(), fetchEmployee()]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  }, [setValue]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#f1f3f6",
    },
    header: {
      backgroundColor: "#4a90e2",
      paddingVertical: dimensions.padding,
      paddingHorizontal: dimensions.padding,
      borderBottomLeftRadius: 20,
      borderBottomRightRadius: 20,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 6,
    },
    headerText: {
      color: "#fff",
      fontSize: dimensions.fontSize.title + 2,
      fontWeight: "bold",
      textAlign: "center",
    },
    formWrapper: {
      margin: dimensions.padding,
      padding: dimensions.padding,
      backgroundColor: "#ffffff",
      borderRadius: 12,
      shadowColor: "#000",
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
      color: "#34495e",
      marginBottom: 6,
    },
    label: {
      fontSize: dimensions.fontSize.body,
      fontWeight: "500",
      color: "#34495e",
      marginBottom: 6,
    },
    input: {
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 8,
      paddingHorizontal: 12,
      height: dimensions.inputHeight,
      backgroundColor: "#fff",
      fontSize: dimensions.fontSize.body,
      color: "#000000",
    },
    textarea: {
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 8,
      fontSize: dimensions.fontSize.body,
      height: 100,
      textAlignVertical: "top",
      backgroundColor: "#fff",
    },
    dateTimeContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    dateTimeInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 8,
      paddingHorizontal: 12,
      height: dimensions.inputHeight,
      fontSize: dimensions.fontSize.body,
      backgroundColor: "#fff",
    },
    dateIcon: {
      marginLeft: 10,
      padding: 6,
      backgroundColor: "#eee",
      borderRadius: 6,
    },
    createButton: {
      backgroundColor: "#4a90e2",
      paddingVertical: 14,
      borderRadius: 10,
      alignItems: "center",
      marginTop: dimensions.padding,
    },
    createButtonText: {
      color: "white",
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
      borderColor: "#ccc",
      borderRadius: 8,
      backgroundColor: "#fff",
    },
    dropdownInput: {
      fontSize: dimensions.fontSize.body,
      color: "#000000",
    },
    dropdownRightButtonsContainer: {
      right: 8,
      height: 30,
      top: 0,
      alignSelf: "center",
    },
    dropdownSuggestionsContainer: {
      backgroundColor: "#fff",
      borderWidth: 1,
      borderColor: "#ccc",
      borderRadius: 8,
      marginTop: 4,
      zIndex: 1000,
      elevation: 10,
    },
    dropdownItemContainer: {
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: "#f0f0f0",
    },
    dropdownItemText: {
      fontSize: dimensions.fontSize.body,
      color: "#000000",
    },
    errorText: {
      color: "red",
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
      borderColor: "#ccc",
      borderRadius: 4,
      marginRight: 12,
      alignItems: "center",
      justifyContent: "center",
    },
    checkboxSelected: {
      backgroundColor: "#4a90e2",
      borderColor: "#4a90e2",
    },
  });
  return (
    <View style={{ flex: 1 }}>
      {/* // <ScreenWrapper scrollable={false}> */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.container}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#4a90e2"]}
            tintColor="#4a90e2"
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
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.title && (
              <Text style={{ color: "red" }}>{errors.title.message}</Text>
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
                  onChangeText={onChange}
                  value={value}
                />
              )}
            />
            {errors.meetingLink && (
              <Text style={{ color: "red" }}>{errors.meetingLink.message}</Text>
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
                  dataSet={employeesSuggestions}
                  onChangeText={filterEmployeeSuggestions}
                  onSelectItem={(item) => {
                    if (item && item.title) {
                      handleEmployeeSelection(item);
                    }
                  }}
                  debounce={300}
                  suggestionsListMaxHeight={
                    Dimensions.get("window").height * 0.4
                  }
                  loading={employeeLoading}
                  useFilter={false}
                  textInputProps={{
                    placeholder: "Select employees",
                    autoCorrect: false,
                    autoCapitalize: "none",
                    style: styles.dropdownInput,
                    value: getSelectedEmployeeText(),
                    onFocus: () => {
                      const all = employees.map((emp, idx) => ({
                        id: (
                          (emp as any)?.id ??
                          (emp as any)?.employee_id ??
                          idx
                        ).toString(),
                        title: `${(emp as any)?.firstname ?? ""} ${
                          (emp as any)?.lastname ?? ""
                        }`.trim(),
                      }));
                      setEmployeesSuggestions(all);
                      try {
                        employeeDropdownController.current?.open?.();
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
                  renderItem={(item) => {
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
                                color="#fff"
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
                  showChevron={true}
                  closeOnBlur={false}
                  clearOnFocus={false}
                />
              )}
            />
            {errors.employee && (
              <Text style={{ color: "red" }}>{errors.employee.message}</Text>
            )}
          </View>

          {/* Start Date & Time and End Date & Time */}
          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.label}>Start date & time : *</Text>
              <Controller
                control={control}
                name="startDate"
                rules={{ required: "Start date is required" }}
                render={({ field: { value } }) => (
                  <View style={styles.dateTimeContainer}>
                    <TouchableOpacity
                      onPress={() => setShowStartDatePicker(true)}
                    >
                      <TextInput
                        style={styles.dateTimeInput}
                        value={formatDate(value)}
                        editable={false}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dateIcon}>
                      <FontAwesome name="calendar" size={20} color="#000" />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.startDate && (
                <Text style={{ color: "red" }}>{errors.startDate.message}</Text>
              )}
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
                        style={[styles.dateTimeInput]}
                        value={value || "--:--"}
                        editable={false}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setShowStartTimePicker(true)}
                      style={styles.dateIcon}
                    >
                      <FontAwesome name="clock-o" size={20} color="#000" />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.startTime && (
                <Text style={{ color: "red" }}>{errors.startTime.message}</Text>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>End date & time : *</Text>
              <Controller
                control={control}
                name="endDate"
                rules={{ required: "End date is required" }}
                render={({ field: { value } }) => (
                  <View style={styles.dateTimeContainer}>
                    <TouchableOpacity
                      onPress={() => setShowEndDatePicker(true)}
                    >
                      <TextInput
                        style={styles.dateTimeInput}
                        value={formatDate(value)}
                        editable={false}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dateIcon}>
                      <FontAwesome name="calendar" size={20} color="#000" />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.endDate && (
                <Text style={{ color: "red" }}>{errors.endDate.message}</Text>
              )}
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
                        style={styles.dateTimeInput}
                        value={value || "--:--"}
                        editable={false}
                      />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.dateIcon}>
                      <FontAwesome name="clock-o" size={20} color="#000" />
                    </TouchableOpacity>
                  </View>
                )}
              />
              {errors.endTime && (
                <Text style={{ color: "red" }}>{errors.endTime.message}</Text>
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
                  onChangeText={onChange}
                  value={value}
                  multiline
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
      {/* // </ScreenWrapper> */}
    </View>
  );
};

export default createMeeting;

