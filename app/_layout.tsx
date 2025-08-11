import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import { AutocompleteDropdownContextProvider } from "react-native-autocomplete-dropdown";
import { en, registerTranslation } from "react-native-paper-dates";
import "react-native-reanimated";
registerTranslation("en", en);

import { useColorScheme } from "@/hooks/useColorScheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  return (
    //  <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
    <AutocompleteDropdownContextProvider>
      <Stack>
        {/* <Stack.Screen name="index" options={{ headerShown: false }} /> */}
        <Stack.Screen name="(protected)" options={{ headerShown: false }} />
        {/* <Stack.Screen name="+not-found" /> */}
      </Stack>
    </AutocompleteDropdownContextProvider>
  );
  // <StatusBar style="auto" />
  {
    /* </ThemeProvider> */
  }
}
