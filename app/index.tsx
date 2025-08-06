import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

const index = () => {
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const {
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const handlePasswordVisibilty = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const onSubmit = () => {
    router.push("/(protected)/attendance");
  };

  return (
    <View
      style={{
        flex: 1,
        display: "flex",
        justifyContent: "center",
        padding: 8,
        margin: 4,
        borderRadius: 5,
        backgroundColor: "#ffffff",
      }}
    >
      <Text
        style={{
          margin: 15,
          marginBottom: 10,
          fontWeight: "bold",
          color: "black",
        }}
      >
        UserName
      </Text>

      <Controller
        control={control}
        name="username"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            inputMode="email"
            onChangeText={(value) => onChange(value)}
            value={value}
            onBlur={onBlur}
            placeholder="Enter Your Usename"
            placeholderTextColor={"grey"}
            style={{
              backgroundColor: "#ffffff",
              borderColor: "rgba(124, 124, 124, 0.27)",
              borderWidth: 1,
              height: 40,
              padding: 10,
              borderRadius: 4,
              color: "black",
              marginHorizontal: 10,
            }}
          />
        )}
        rules={{ required: true }}
      />
      {errors.username && (
        <Text style={{ color: "red", marginLeft: 11, marginTop: 5 }}>
          Email is Required
        </Text>
      )}

      <Text
        style={{
          margin: 15,
          marginBottom: 10,
          fontWeight: "bold",
          color: "black",
        }}
      >
        Password
      </Text>
      <View
        style={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Controller
          name="password"
          control={control}
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              onChangeText={(value) => onChange(value)}
              value={value}
              onBlur={onBlur}
              placeholder="*****"
              placeholderTextColor={"grey"}
              style={{
                backgroundColor: "#ffffff",
                borderColor: "rgba(124, 124, 124, 0.27)",
                borderWidth: 1,
                height: 40,
                padding: 10,
                borderRadius: 4,
                color: "black",
                marginHorizontal: 10,
              }}
              autoComplete="current-password"
              secureTextEntry={!isPasswordVisible}
            />
          )}
          rules={{ required: true }}
        />

        <TouchableOpacity
          onPress={handlePasswordVisibilty}
          style={{ display: "flex", position: "absolute", right: "6%" }}
        >
          {isPasswordVisible ? (
            <Ionicons name="eye-off" size={24} color="#2e63a8" />
          ) : (
            <Ionicons name="eye" size={24} color="#2e63a8" />
          )}
        </TouchableOpacity>
      </View>
      {errors.password && (
        <Text style={{ color: "red", margin: 11, marginTop: 5 }}>
          Password is required
        </Text>
      )}

      <TouchableOpacity
        onPress={() => {
          setRememberMe(!rememberMe);
        }}
        style={{
          margin: 10,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          gap: 4,
          justifyContent: "flex-start",
          maxWidth: "50%",
        }}
      >
        {rememberMe ? (
          <Ionicons name="checkbox" size={20} />
        ) : (
          <Ionicons name="square-outline" size={20} />
        )}
        <Text style={{ textAlign: "left" }}>Remember Me</Text>
      </TouchableOpacity>
      <View
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 10,
        }}
      >
        <TouchableOpacity
          style={{
            margin: "auto",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0e1689ff",
            width: "100%",
            padding: 8,
            marginTop: 10,
            borderRadius: 5,
          }}
          onPress={handleSubmit(onSubmit)}
        >
          {loading ? (
            <ActivityIndicator size={"small"} />
          ) : (
            <Text
              style={{
                textAlign: "center",
                color: "white",
                fontWeight: "bold",
                fontSize: 15,
                padding: 2,
              }}
            >
              Login
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default index;

const styles = StyleSheet.create({});
