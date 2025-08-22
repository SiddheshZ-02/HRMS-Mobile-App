import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useFonts } from "expo-font";
import { Stack, useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import "react-native-reanimated";
// import { useColorScheme } from "@/components/useColorScheme";
import useAuthStore from "@/store/AuthStore";
import { publicAxios } from "@/utils/axiosConfig";
import { Toasts } from "@backpackapp-io/react-native-toast";
import * as SecureStore from "expo-secure-store";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { DefaultTheme, PaperProvider } from "react-native-paper";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "(tabs)",
};

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  fade: true,
});

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    ...FontAwesome.font,
  });

  const [isStoreRehydrated, setIsStoreRehydrated] = useState(false);
  const { isAuthenticated } = useAuthStore((state) => state);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();

  // Rehydrate store and validate token
  useEffect(() => {
    const rehydrateAndValidate = async () => {
      try {
        await useAuthStore.persist.rehydrate();
        const state = useAuthStore.getState();

        // if (state.accessToken) {
         
        // }

        // Check SecureStore directly for token
        const storedState = await SecureStore.getItemAsync("auth-storage");
        if (storedState) {
          const parsedState = JSON.parse(storedState);
          if (parsedState.accessToken) {
            // Validate token with API
            try {
              const res = await publicAxios.get("/Portal/Roles", {
                headers: { Accesstoken: parsedState.accessToken },
              });

              // Ensure isAuthenticated is true if token is valid
              if (!state.isAuthenticated) {
                login({ accessToken: parsedState.accessToken, ...parsedState });
              }
            } catch (error: any) {
              if (error.response?.status === 401) {
                await logout();
                await SecureStore.deleteItemAsync("auth-storage");
              }
            }
          }
        }
        setIsStoreRehydrated(true);
      } catch (err) {
        setIsStoreRehydrated(true); // Proceed even if rehydration fails
      }
    };

    rehydrateAndValidate();
  }, [login, logout]);

  // Handle font loading errors
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Hide splash screen and redirect based on auth status
  useEffect(() => {
    if (loaded && isStoreRehydrated) {
      if (isAuthenticated) {
        router.replace("/(protected)");
      } else {
        router.replace("/");
      }
      setTimeout(() => {
        SplashScreen.hideAsync();
      }, 2000);
    }
  }, [loaded, isStoreRehydrated, isAuthenticated, router]);

  if (!loaded || !isStoreRehydrated) {
    return null;
  }

  return (
    <PaperProvider
      theme={{
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          onSurface: "black",
          primary: "black",
        },
      }}
    >
      <GestureHandlerRootView>
        <StatusBar animated={true} barStyle={"light-content"} />
        <Stack>
          <Stack.Protected guard={!isAuthenticated}>
            <Stack.Screen 
              name="index"
              options={{ headerShown: false, animation: "fade" }}
            />
          </Stack.Protected>
          <Stack.Protected guard={isAuthenticated}>
            <Stack.Screen
              name="(protected)"
              options={{ headerShown: false, animation: "fade" }}
            />
          </Stack.Protected>
        </Stack>
        <Toasts />
      </GestureHandlerRootView>
    </PaperProvider>
  );
}
