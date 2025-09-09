import { BASE_URL } from "@/constants/Config";
import useAuthStore from "@/store/AuthStore";
import { publicAxios } from "@/utils/axiosConfig";
import { toast, ToastPosition } from "@backpackapp-io/react-native-toast";
import { FontAwesome6, Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

type LoginFormData = {
  username: string;
  password: string;
};

const Colors = {
  background: "#d4e4d2", // Light green background from the image
  cardBackground: "#ffffff", // White card
  textPrimary: "#1e293b", // Dark green text
  textSecondary: "#6b8e6b", // Medium green for secondary text
  textTertiary: "#9acd9a", // Light green for placeholders
  primary: "#1e293b", // Green for buttons and icons
  error: "#ff4040", // Red for errors
  border: "rgba(0,0,0,0.1)", // Subtle border
  buttonDisabled: "#334155", // Disabled button color
};

const index = () => {
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isStoreRehydrated, setIsStoreRehydrated] = useState(false);
  const { isAuthenticated, login, logout, accessToken, roles } = useAuthStore(
    (state) => state
  );

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const fillDemoCredentials = (roles: "Admin" | "Employee") => {
    if (roles === "Admin") {
      setValue("username", "jyoti.shetty@dextero.in");
      setValue("password", "123456");
    } else {
      setValue("username", "harsh.bhoir@dextero.in");
      setValue("password", "Dextero@123");
    }
  };

  useEffect(() => {
    const rehydrateAndValidate = async () => {
      try {
        await useAuthStore.persist.rehydrate();
        const state = useAuthStore.getState();
        if (state.accessToken) {
          // Only pass state, don't spread accessToken twice
          login({ ...state });
        }
        setIsStoreRehydrated(true);
      } catch {
        setIsStoreRehydrated(true);
      }
    };
    rehydrateAndValidate();
  }, [login]);

  useEffect(() => {
    if (isStoreRehydrated && isAuthenticated) {
      router.replace("/(protected)");
    }
  }, [isAuthenticated, router, isStoreRehydrated]);

  const handleLogin = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      const response = await publicAxios.post(`${BASE_URL}/Login/Check`, data);
      const resData = response.data;

      if (resData.status_code === 200) {
        login({
          accessToken: resData.accesstoken,
          roles: resData.roles,
          rolesId: resData.roles_id,
          companyId: resData.company_id,
          employeeId: resData.emp_id,
          employeeFirstName: resData.employee_first_name,
          imageId: resData.image_id,
          sidebar: resData.sidebar,
          message: resData.message,
          statusCode: resData.status_code,
          statusMessage: resData.status_message,
        });

        toast.success(resData.message || "Signed in successfully", {
          position: ToastPosition.BOTTOM,
          duration: 3000,
          icon: <FontAwesome6 name="circle-check" size={24} color="#10b981" />,
        });
        reset();
        router.replace("/(protected)");
      } else {
        toast.error(resData.message || "Login failed", {
          position: ToastPosition.BOTTOM,
          duration: 3000,
          icon: (
            <FontAwesome6
              name="circle-exclamation"
              size={24}
              color={Colors.error}
            />
          ),
        });
      }
    } catch (error: any) {
      console.log("(auth)/index: Error while logging in", error);
      toast("Internal server error", {
        position: ToastPosition.BOTTOM,
        duration: 3000,
        icon: (
          <FontAwesome6
            name="circle-exclamation"
            size={24}
            color={Colors.error}
          />
        ),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: LoginFormData) => {
    await handleLogin(data);
    Keyboard.dismiss();
    if (rememberMe) {
      await SecureStore.setItemAsync("username", data.username);
      await SecureStore.setItemAsync("password", data.password);
    } else {
      await SecureStore.deleteItemAsync("username");
      await SecureStore.deleteItemAsync("password");
    }
  };

  const handlePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const setData = async () => {
    const username = await SecureStore.getItemAsync("username");
    const password = await SecureStore.getItemAsync("password");
    if (username && password) {
      setValue("username", username);
      setValue("password", password);
    }
  };

  useEffect(() => {
    setData();
  }, []);

  if (!isStoreRehydrated) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }
  if (isAuthenticated) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={[styles.container]}>
          <View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "40%",
              zIndex: -1,
              // borderBottomLeftRadius: 100,
            }}
          />
          <View
            style={{
              backgroundColor: "#0f172a",
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "60%",
              zIndex: -1,
              borderTopLeftRadius: 100,
            }}
          />
          <View style={styles.logoContainer}>
            <Image
              source={require("@/assets/images/actifylogo.png")}
              style={styles.logo}
            />
          </View>
          <View
            style={[
              styles.formContainer,
              { backgroundColor: Colors.cardBackground },
            ]}
          >
            <Text style={[styles.label, { color: Colors.textPrimary }]}>
              Username <Text style={{ color: Colors.error }}>*</Text>
            </Text>
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  inputMode="email"
                  style={[
                    styles.input,
                    { borderColor: Colors.border, color: Colors.textPrimary },
                    errors.username && styles.inputError,
                  ]}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  placeholder="Enter your username"
                  placeholderTextColor={Colors.primary}
                  editable={!isLoading}
                />
              )}
              name="username"
              rules={{
                required: "Email is required",
                pattern: {
                  value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                  message: "Invalid email address",
                },
              }}
            />
            {errors.username && (
              <Text style={[styles.errorText, { color: Colors.error }]}>
                {errors.username.message}
              </Text>
            )}
            <Text style={[styles.label, { color: Colors.textPrimary }]}>
              Password <Text style={{ color: Colors.error }}>*</Text>
            </Text>
            <View style={styles.passwordContainer}>
              <Controller
                control={control}
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    autoComplete="current-password"
                    secureTextEntry={!isPasswordVisible}
                    style={[
                      styles.input,
                      { borderColor: Colors.border, color: Colors.textPrimary },
                      errors.password && styles.inputError,
                    ]}
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    placeholder="Enter your password"
                    placeholderTextColor={Colors.primary}
                    editable={!isLoading}
                  />
                )}
                name="password"
                rules={{
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                }}
              />
              <TouchableOpacity
                onPress={handlePasswordVisibility}
                style={styles.eyeIcon}
                disabled={isLoading}
              >
                <Ionicons
                  name={isPasswordVisible ? "eye-off" : "eye"}
                  size={22}
                  color={Colors.primary}
                />
              </TouchableOpacity>
            </View>
            {errors.password && (
              <Text style={[styles.errorText, { color: Colors.error }]}>
                {errors.password.message}
              </Text>
            )}
            <TouchableOpacity
              onPress={() => setRememberMe(!rememberMe)}
              style={styles.rememberMeContainer}
              disabled={isLoading}
            >
              <Ionicons
                name={rememberMe ? "checkbox" : "square-outline"}
                size={20}
                color={rememberMe ? Colors.primary : Colors.primary}
              />
              <Text style={[styles.rememberMeText, { color: Colors.primary }]}>
                Remember me
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.loginBtn,
                isLoading && { backgroundColor: Colors.buttonDisabled },
              ]}
              onPress={handleSubmit(onSubmit)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text style={styles.loginBtnText}>LOGIN</Text>
              )}
            </TouchableOpacity>

            <View
              style={{ marginTop: 20, alignItems: "center",  }}
            >
              <Text style={{ fontWeight: 500, color: "black" }}>
                Dummy Accounts
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  gap: 10,
                  alignItems: "center",
                  justifyContent: "center",
                
                }}
              >
                <TouchableOpacity
                  style={styles.loginBtn1}
                  onPress={() => fillDemoCredentials("Admin")}
                >
                  <Text style={styles.loginBtnText1}>Admin</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.loginBtn1}
                  onPress={() => fillDemoCredentials("Employee")}
                >
                  <Text style={styles.loginBtnText1}>Employee</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 20,
    paddingVertical: 70,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  logo: {
    width: 200,
    height: 150,
    resizeMode: "contain",
  },
  formContainer: {
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
    alignSelf: "flex-start",
  },
  input: {
    // backgroundColor: "#f0f8f0",
    borderRadius: 8,
    height: 48,
    paddingHorizontal: 12,
    fontSize: 16,
    borderWidth: 1,
    width: "100%",
  },
  inputError: {
    borderColor: Colors.error,
  },
  passwordContainer: {
    position: "relative",
    width: "100%",
  },
  eyeIcon: {
    position: "absolute",
    right: 12,
    top: 12,
  },
  errorText: {
    fontSize: 14,
    marginTop: 4,
    marginLeft: 4,
    alignSelf: "flex-start",
  },
  rememberMeContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginVertical: 16,
    alignSelf: "flex-start",
  },
  rememberMeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  loginBtn: {
    backgroundColor: "#1e293b",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    width: "100%",
  },
  loginBtn1: {
    backgroundColor: "#1e293b",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  loginBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  loginBtnText1: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
    paddingInline: 20,
  },
});

export default index;
